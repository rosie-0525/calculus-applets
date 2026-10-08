import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildWorld, TEAL, CARDINAL, AMBER, RED, hdr } from './world.js';
import {
  PILLARS,
  SPEED,
  ENEMY_SPEED,
  EYE,
  HEAD_R,
  toMath,
  hitSolid,
  sphereHit,
  onRoof,
  side,
  robotPose,
  torsoPlanes,
  standSpot,
  num,
  lhs,
} from './solids.js';
import Sfx from './audio.js';

/*
 * The 3-D game: you on the left of the lecture's 2-D picture, now standing in
 * an arena, three robots ducking behind blocks whose sloping tops are pieces
 * of planes. Every bolt flies along a line x(t) = p + t v (v is its velocity,
 * so t is the time in seconds) and is stopped when it crosses a roof plane on
 * the roof. Left alone, the game plays itself.
 *
 * The engine owns the three.js scene and writes straight into the HUD's DOM
 * elements (`hud`), so React renders the overlay once and never per frame.
 */

const W = 1280;
const H = 720;
const UP = new THREE.Vector3(0, 1, 0);
const BASE_PITCH = -0.045;
const IDLE_AFTER = 6; // seconds without the mouse before the demo takes over again
const AUTO_EVERY = 0.2; // holding the button fires this often (s)
const CAM_EVERY = 5; // the demo shows every 5th shot in the bullet cam

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const damp = (k, dt) => 1 - Math.exp(-k * dt);
const ease = (u) => u * u * (3 - 2 * u);
const rand = (a, b) => a + Math.random() * (b - a);
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const vecStr = (v, digits) => `(${toMath(v).map((c) => num(c, digits)).join(', ')})`;

// The flight over the arena when the slide appears, ending at your eyes
const INTRO_PATH = new THREE.CatmullRomCurve3(
  [
    [-13, 9, -27],
    [-2, 6.8, -21],
    [9, 4.8, -13],
    [7.5, 3, -2.5],
    [0, EYE.y, 0],
  ].map((p) => new THREE.Vector3(...p)),
);
const INTRO_LEN = 4.4;
const ARENA = new THREE.Vector3(0.3, 1.1, -10);

export default class Engine {
  constructor(canvas, hud, opts) {
    this.canvas = canvas;
    this.hud = hud;
    this.opts = { math: true, cam: false, sound: true, ...opts };
    this.print = /print-pdf/.test(window.location.search);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: this.print,
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer = renderer;

    this.world = buildWorld(renderer);
    const { scene, camera } = this.world;
    this.composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.35, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.quality = 1;
    this.lastWidth = 0;
    this.frameTimes = [];

    this.sfx = new Sfx();
    this.sfx.on = this.opts.sound;
    this.raycaster = new THREE.Raycaster();
    this.tmp = new THREE.Vector3();
    this.reset();
    this.updateRobots(0);
    this.ai.aim.copy(this.robots[1].head); // the first target: the robot in the middle, covered
    this.pose(); // a first picture, before the slide is even shown
    scene.updateMatrixWorld(true);

    this.frame = this.frame.bind(this);
    this.handlers = {
      pointermove: (e) => this.onMove(e),
      pointerdown: (e) => this.onDown(e),
      pointerup: () => {
        this.holding = false;
      },
      pointercancel: () => {
        this.holding = false;
      },
      contextmenu: (e) => e.preventDefault(),
    };
    Object.entries(this.handlers).forEach(([k, f]) => canvas.addEventListener(k, f));
  }

  reset() {
    this.mode = 'idle';
    this.lastInput = -Infinity;
    this.mouse = new THREE.Vector2(0, 0);
    this.holding = false;
    this.nextAuto = 0;
    this.real = 0;
    this.game = 0;
    this.timeScale = 1;
    this.tsGoal = 1;
    this.trauma = 0;
    this.kick = 0;
    this.look = new THREE.Vector2();
    this.score = { hits: 0, blocked: 0 };
    this.bullets = [];
    this.tracerPool = [];
    this.sparks = [];
    this.shards = [];
    this.ringLive = [];
    this.pops = [];
    this.popIdx = 0;
    this.cam = null;
    this.intro = null;
    this.flashUntil = 0;
    this.boom = { t0: -10, at: new THREE.Vector3() };
    this.aimPoint = new THREE.Vector3(0, 1.5, -12);
    this.muzzle = new THREE.Vector3();
    this.fireDir = new THREE.Vector3(0, 0, -1);
    this.laserHit = null;
    this.focus = 1;
    this.basePos = EYE.clone();
    this.baseQuat = new THREE.Quaternion();
    this.ai = { aim: new THREE.Vector3(0.6, 1.6, -16), target: 1, retarget: 0, nextShot: 1.4, shots: 0 };
    this.cache = new Map();

    const { robots, blocks } = this.world;
    this.robots = robots.map((mesh, i) => {
      const blk = blocks[i];
      const r = {
        mesh,
        blk,
        block: blk.spec,
        u: 0,
        uGoal: 0,
        c: 1,
        phase: 'down',
        until: 0.8 + 1.1 * i,
        upAt: 0,
        fired: false,
        walk: 0,
        hip: 0.94,
        spawnAt: -10,
        pos: new THREE.Vector3(),
        head: new THREE.Vector3(),
        inv: new THREE.Matrix4(),
        bulbMat: mesh.bulb.material,
      };
      return r;
    });
    if (this.print) {
      // the picture in the PDF: one robot up (exposed), two crouched (covered)
      this.robots.forEach((r, i) => Object.assign(r, { c: i === 0 ? 0 : 1, phase: i === 0 ? 'up' : 'down', until: 1e9 }));
    }
  }

  setOptions(opts) {
    Object.assign(this.opts, opts);
    this.sfx.on = this.opts.sound;
    this.hud.root?.classList.toggle('no-math', !this.opts.math);
  }

  start() {
    this.setOptions({});
    this.resize(true);
    if (this.print) {
      // one still frame for the PDF, once the fonts of the signs are in
      setTimeout(() => {
        this.step(0.016);
        this.composer.render();
      }, 600);
      return;
    }
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    Object.entries(this.handlers).forEach(([k, f]) => this.canvas.removeEventListener(k, f));
    this.sfx.dispose();
    const seen = new Set();
    this.world.scene.traverse((o) => {
      o.geometry?.dispose();
      [o.material].flat().forEach((m) => {
        if (!m || seen.has(m)) return;
        seen.add(m);
        Object.values(m).forEach((v) => v?.isTexture && v.dispose());
        m.uniforms && Object.values(m.uniforms).forEach(({ value }) => value?.isTexture && value.dispose());
        m.dispose();
      });
    });
    this.world.scene.environment?.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }

  /* ------------------------------------------------------------------ */
  /* the loop                                                            */
  /* ------------------------------------------------------------------ */

  showing() {
    const section = this.canvas.closest('section');
    return (!section || section.classList.contains('present')) && document.visibilityState === 'visible';
  }

  frame(now) {
    this.raf = requestAnimationFrame(this.frame);
    if (!this.showing()) {
      this.wasShowing = false;
      return;
    }
    if (!this.wasShowing) {
      this.wasShowing = true;
      this.last = now;
      this.onEnter();
    }
    const dtReal = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.adapt(dtReal);
    this.step(dtReal);
    this.composer.render();
  }

  /** The slide has just appeared: fly in, and let the demo play. */
  onEnter() {
    this.resize(true);
    this.mode = 'idle';
    this.cam = null;
    this.tsGoal = 1;
    this.timeScale = 1;
    this.score = { hits: 0, blocked: 0 };
    this.setRoot('is-cam', false);
    if (!reducedMotion()) this.startIntro();
  }

  step(dtReal) {
    this.real += dtReal;
    const k = this.tsGoal < this.timeScale ? 10 : 4;
    this.timeScale += (this.tsGoal - this.timeScale) * damp(k, dtReal);
    if (Math.abs(this.tsGoal - this.timeScale) < 0.003) this.timeScale = this.tsGoal;
    const dt = dtReal * this.timeScale;
    this.game += dt;

    if (this.mode === 'user' && this.real - this.lastInput > IDLE_AFTER) {
      this.mode = 'idle';
      this.ai.aim.copy(this.aimPoint);
    }
    this.updateRobots(dt);
    if (!this.intro && !this.cam) {
      if (this.mode === 'idle') this.updateAI(dt);
      else if (this.holding && this.real >= this.nextAuto) {
        this.fire(false);
        this.nextAuto = this.real + AUTO_EVERY;
      }
    }
    this.updateBullets(dt);
    this.updateFx(dt, dtReal);
    this.pose(dtReal);
    this.updateScenery(dtReal);
    this.updateHud();
    this.trauma = Math.max(0, this.trauma - dtReal * 1.7);
  }

  /** Camera, gun and aim, in that order (the aim is a ray through the camera). */
  pose(dtReal = 0) {
    this.poseCamera(dtReal);
    this.updateAim();
    this.poseGun(dtReal);
  }

  /* ------------------------------------------------------------------ */
  /* input                                                               */
  /* ------------------------------------------------------------------ */

  onMove(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.mode = 'user';
    this.lastInput = this.real;
    if (this.cam && !this.cam.byUser && this.cam.phase !== 'return') this.camReturn();
  }

  onDown(e) {
    e.preventDefault();
    this.canvas.setPointerCapture?.(e.pointerId);
    this.sfx.unlock();
    this.onMove(e);
    if (this.intro) {
      this.intro = null;
      this.setRoot('is-intro', false);
      return;
    }
    if (this.cam) {
      if (this.cam.phase !== 'return') this.camReturn();
      return;
    }
    this.pose(0);
    const withCam = e.button === 2 || e.shiftKey || this.opts.cam;
    this.fire(withCam);
    this.holding = e.button === 0 && !withCam;
    this.nextAuto = this.real + AUTO_EVERY * 1.6;
  }

  /* ------------------------------------------------------------------ */
  /* the robots                                                          */
  /* ------------------------------------------------------------------ */

  updateRobots(dt) {
    for (const r of this.robots) {
      if (this.game >= r.until) this.nextPhase(r);
      if (r.phase === 'up' || r.phase === 'down') {
        r.c += clamp((r.phase === 'up' ? 0 : 1) - r.c, -4.5 * dt, 4.5 * dt);
        if (r.phase === 'down') {
          const du = clamp(r.uGoal - r.u, -1.3 * dt, 1.3 * dt);
          r.u += du;
          r.walk += Math.abs(du) * 9;
        }
        if (r.phase === 'up' && !r.fired && this.game - r.upAt > 0.8) {
          r.fired = true;
          this.enemyFire(r);
        }
      }
      this.poseRobot(r);
    }
  }

  nextPhase(r) {
    const now = this.game;
    const half = r.block.w / 2 - 0.5;
    if (r.phase === 'down') {
      Object.assign(r, { phase: 'up', upAt: now, until: now + rand(1.4, 2.4), fired: false });
    } else if (r.phase === 'up') {
      Object.assign(r, { phase: 'down', until: now + rand(1.5, 3.2), uGoal: rand(-half, half) });
    } else if (r.phase === 'dead') {
      const u = rand(-half, half);
      Object.assign(r, { phase: 'spawn', spawnAt: now, until: now + 0.7, c: 1, u, uGoal: u });
      if (this.mode === 'user') this.sfx.spawn();
    } else {
      Object.assign(r, { phase: 'down', until: now + rand(0.6, 1.6) });
    }
  }

  poseRobot(r) {
    const { mesh } = r;
    const p = robotPose(r.c);
    r.hip = p.hip;
    r.pos.copy(standSpot(r.block, r.u));
    mesh.root.position.copy(r.pos);
    mesh.root.rotation.y = Math.atan2(-r.pos.x, -r.pos.z); // face you
    mesh.root.visible = r.phase !== 'dead';
    const swing = r.phase === 'down' ? 0.14 * Math.sin(r.walk) : 0;
    mesh.legs.forEach((leg, i) => {
      leg.hip.position.y = p.hip;
      leg.hip.rotation.set(-p.knee, 0, (i ? 1 : -1) * swing);
      leg.knee.rotation.x = 2 * p.knee;
      leg.ankle.rotation.x = -p.knee;
    });
    mesh.torso.position.y = p.hip;
    mesh.torso.rotation.x = p.lean;
    mesh.head.rotation.y = 0.18 * Math.sin(this.game * 0.9 + r.block.x);

    // materializing: grow out of the floor inside a column of light
    const s = r.phase === 'spawn' ? ease(clamp((this.game - r.spawnAt) / 0.6, 0, 1)) : 1;
    mesh.body.scale.set(1, Math.max(0.001, s), 1);
    mesh.spawnBeam.visible = r.phase === 'spawn';
    mesh.beamMat.opacity = r.phase === 'spawn' ? 0.5 * Math.sin(Math.PI * s) + 0.05 : 0;
    r.bulbMat.color.copy(AMBER).multiplyScalar(Math.sin(this.game * 6 + r.block.x) > 0.3 ? 6 : 0.6);

    mesh.root.updateMatrixWorld(true);
    r.head.copy(p.head).applyMatrix4(mesh.root.matrixWorld);
    r.inv.copy(mesh.root.matrixWorld).invert();
  }

  /** A red bolt at you, fired over the block; it always misses, narrowly. */
  enemyFire(r) {
    const p = r.mesh.muzzle.getWorldPosition(new THREE.Vector3());
    const target = EYE.clone().add(new THREE.Vector3((Math.random() < 0.5 ? -1 : 1) * rand(1.1, 1.7), rand(0, 0.6), 0));
    const v = target.sub(p).normalize().multiplyScalar(ENEMY_SPEED);
    this.spawnBullet('enemy', p, v);
    this.burst(p, v.clone().normalize(), hdr(RED, 4), 8, 3, 0.6, 0.25);
  }

  /* ------------------------------------------------------------------ */
  /* the demo: aims at a robot, covered or not, and fires                */
  /* ------------------------------------------------------------------ */

  updateAI(dt) {
    const ai = this.ai;
    let r = this.robots[ai.target];
    if (this.game >= ai.retarget || r.phase === 'dead' || r.phase === 'spawn') {
      const alive = this.robots.filter((x) => x.phase === 'up' || x.phase === 'down');
      const exposed = alive.filter((x) => x.phase === 'up');
      const pool = exposed.length && Math.random() < 0.6 ? exposed : alive;
      if (pool.length) r = pool[Math.floor(Math.random() * pool.length)];
      ai.target = this.robots.indexOf(r);
      ai.retarget = this.game + rand(1.6, 2.8);
    }
    const goal = r.head.clone().add(new THREE.Vector3(0.07 * Math.sin(this.game * 1.9), 0.05 * Math.cos(this.game * 2.3), 0));
    ai.aim.lerp(goal, damp(4.5, dt));
    if (!reducedMotion() && this.game >= ai.nextShot && ai.aim.distanceTo(goal) < 0.12 && r.phase !== 'dead') {
      ai.shots += 1;
      this.fire(ai.shots % CAM_EVERY === 2);
      ai.nextShot = this.game + rand(0.8, 1.4);
    }
  }

  /* ------------------------------------------------------------------ */
  /* bullets                                                             */
  /* ------------------------------------------------------------------ */

  fire(withCam) {
    const b = this.spawnBullet('you', this.muzzle.clone(), this.fireDir.clone().multiplyScalar(SPEED));
    b.byUser = this.mode === 'user';
    b.aimAt = this.aimPoint.clone();
    const g = this.world.gun;
    g.flash.visible = true;
    g.flash.material.rotation = Math.random() * Math.PI;
    g.flash.scale.setScalar(rand(0.22, 0.32));
    g.light.intensity = 30;
    this.flashUntil = this.real + 0.055;
    this.kick = 1;
    this.trauma = Math.min(1, this.trauma + 0.12);
    if (b.byUser) this.sfx.fire();
    if (withCam && !reducedMotion()) this.startCam(b);
  }

  spawnBullet(owner, p, v) {
    const { fx, scene } = this.world;
    const mk = (radius, color, opacity) => {
      const m = new THREE.Mesh(
        fx.unitRod,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      m.frustumCulled = false;
      m.userData.r = radius;
      scene.add(m);
      return m;
    };
    const pooled = this.tracerPool.find((x) => x.owner === owner);
    let tracer;
    let trail;
    if (pooled) {
      this.tracerPool.splice(this.tracerPool.indexOf(pooled), 1);
      ({ tracer, trail } = pooled);
    } else {
      const you = owner === 'you';
      tracer = mk(you ? 0.03 : 0.028, hdr(you ? new THREE.Color('#bff8ff') : RED, you ? 7 : 3.5), 1);
      trail = mk(you ? 0.0045 : 0.003, hdr(you ? TEAL : RED, you ? 1.8 : 1.2), 0.5);
    }
    tracer.visible = true;
    trail.visible = true;
    const b = { owner, p0: p.clone(), pos: p.clone(), vel: v, t: 0, dead: false, fade: 0, tracer, trail, passed: false };
    this.bullets.push(b);
    return b;
  }

  /**
   * The first thing the segment p → q runs into: { t, kind, at, blk?, robot? },
   * with kind 'roof', 'wall', 'ground' or 'enemy'; null if nothing.
   */
  firstHit(p, q, robots = true) {
    let best = null;
    const offer = (t, kind, extra) => {
      if (t === null || t < 0 || t > 1 || (best && t >= best.t)) return;
      best = { t, kind, ...extra };
    };
    for (const blk of this.world.blocks) {
      const h = hitSolid(p, q, blk.spec);
      if (h) offer(h.t, h.kind, { blk });
    }
    for (const pil of PILLARS) {
      const h = hitSolid(p, q, pil);
      if (h) offer(h.t, 'wall');
    }
    if (robots) {
      for (const r of this.robots) {
        if (r.phase === 'dead' || r.phase === 'spawn') continue;
        offer(sphereHit(p, q, r.head, HEAD_R), 'enemy', { robot: r });
        const h = hitSolid(p, q, r, torsoPlanes(r.hip));
        if (h) offer(h.t, 'enemy', { robot: r });
      }
    }
    if (p.y > 0 && q.y <= 0) offer(p.y / (p.y - q.y), 'ground');
    if (best) best.at = new THREE.Vector3().lerpVectors(p, q, best.t);
    return best;
  }

  updateBullets(dt) {
    const camPos = this.world.camera.position;
    const q = new THREE.Vector3();
    const dir = new THREE.Vector3();
    this.bullets = this.bullets.filter((b) => {
      dir.copy(b.vel).normalize();
      if (b.dead) {
        b.fade -= dt;
        b.tracer.visible = false;
        b.trail.material.opacity = 0.5 * clamp(b.fade / 0.9, 0, 1);
        if (b.fade > 0) return true;
        b.trail.visible = false;
        this.tracerPool.push({ owner: b.owner, tracer: b.tracer, trail: b.trail });
        return false;
      }
      q.copy(b.pos).addScaledVector(b.vel, dt);
      const hit = dt > 0 ? this.firstHit(b.pos, q, b.owner === 'you') : null;
      if (hit) {
        b.tHit = b.t + hit.t * dt;
        b.pos.copy(hit.at);
        b.dead = true;
        b.fade = 0.9;
        this.impact(b, hit, dir);
      } else {
        b.pos.copy(q);
        b.t += dt;
      }
      if (b.owner === 'enemy' && !b.passed && b.pos.distanceTo(camPos) < 2.2) {
        b.passed = true;
        this.redFlash = this.real;
        if (this.mode === 'user') this.sfx.zap();
      }
      const gone = b.pos.distanceTo(b.p0) > 90 || (b.owner === 'enemy' && b.pos.z > 4);
      if (gone && !b.dead) {
        b.dead = true;
        b.fade = 0.3;
        if (this.cam?.bullet === b) this.camReturn();
      }
      // the tracer: a bright dash ending at the bolt; the trail: the line from p
      const len = Math.min(b.owner === 'you' ? 1.3 : 0.8, b.pos.distanceTo(b.p0));
      const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir);
      b.tracer.position.copy(b.pos).addScaledVector(dir, -len);
      b.tracer.quaternion.copy(quat);
      b.tracer.scale.set(b.tracer.userData.r, len, b.tracer.userData.r);
      b.trail.position.copy(b.p0);
      b.trail.quaternion.copy(quat);
      b.trail.scale.set(b.trail.userData.r, Math.max(0.001, b.pos.distanceTo(b.p0)), b.trail.userData.r);
      return true;
    });
  }

  impact(b, hit, dir) {
    const you = b.owner === 'you';
    const loud = b.byUser || (this.cam?.bullet === b && this.cam.byUser);
    const at = hit.at;
    if (hit.kind === 'roof') {
      const n = hit.blk.spec.n.clone().normalize();
      const out = dir.clone().addScaledVector(n, -2 * dir.dot(n)); // the ricochet
      this.burst(at, out, hdr(you ? AMBER : RED, 5), 34, 7, 0.55, 0.55);
      this.burst(at, n, hdr(CARDINAL, 5), 16, 3, 0.9, 0.5);
      this.ripple(hit.blk, at);
      if (you) {
        this.popup('BLOCKED', 'blocked', at);
        if (b.byUser) this.score.blocked += 1;
      }
      if (loud) this.sfx.ting();
    } else if (hit.kind === 'wall') {
      this.burst(at, dir.clone().negate(), hdr(you ? AMBER : RED, 4), 24, 5, 0.8, 0.45);
      if (you) {
        this.popup('BLOCKED', 'blocked', at);
        if (b.byUser) this.score.blocked += 1;
      }
      if (loud) this.sfx.thud();
    } else if (hit.kind === 'ground') {
      this.burst(at, UP, hdr(new THREE.Color('#9fb4c8'), 1.6), 14, 3, 0.9, 0.5);
      this.ring(at.clone().setY(0.02), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), hdr(TEAL, 2), 0.05, 0.7, 0.4);
      if (loud) this.sfx.thud();
    } else if (hit.kind === 'enemy') {
      this.explode(hit.robot, dir);
      this.popup('HIT!', 'hit', hit.robot.head);
      if (b.byUser) this.score.hits += 1;
      if (loud) this.sfx.boom();
    }
    if (this.cam?.bullet === b) this.camImpact(b, hit);
  }

  /* ------------------------------------------------------------------ */
  /* effects                                                             */
  /* ------------------------------------------------------------------ */

  /** n sparks from `at`, in a cone about `dir` (spread 0 = a line, 1 = a hemisphere). */
  burst(at, dir, color, n, speed, spread, life) {
    const { SPARKS } = this.world.fx;
    for (let i = 0; i < n; i += 1) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(spread).add(dir).normalize().multiplyScalar(speed * rand(0.35, 1));
      const l = life * rand(0.5, 1);
      this.sparks.push({ p: at.clone(), v, life: l, max: l, color });
    }
    if (this.sparks.length > SPARKS) this.sparks.splice(0, this.sparks.length - SPARKS);
  }

  ring(at, quat, color, r0, r1, dur, { real = false, pulse = false } = {}) {
    const { rings } = this.world.fx;
    const m = rings.find((x) => !x.visible) || this.ringLive.shift()?.m || rings[0];
    this.ringLive = this.ringLive.filter((x) => x.m !== m);
    m.visible = true;
    m.position.copy(at);
    m.quaternion.copy(quat);
    m.material.color.copy(color);
    const live = { m, t0: real ? this.real : this.game, real, dur, r0, r1, pulse };
    this.ringLive.push(live);
    return live;
  }

  ripple(blk, at) {
    const local = blk.plane.worldToLocal(at.clone());
    blk.planeMat.uniforms.uRip.value[blk.ripple % 4].set(local.x, local.y, this.game);
    blk.ripple += 1;
    blk.flash = 1;
  }

  explode(r, dir) {
    const now = this.game;
    Object.assign(r, { phase: 'dead', until: now + 2.4 });
    r.mesh.root.visible = false;
    const m = r.mesh.root.matrixWorld;
    const centre = new THREE.Vector3(0, r.hip + 0.45, 0).applyMatrix4(m);
    const plain = ['#434b5e', '#c4520e', '#15181f', '#434b5e'].map((c) => new THREE.Color(c));
    const glow = [hdr(AMBER, 5), hdr(RED, 4), hdr(new THREE.Color('#fff1c1'), 5)];
    const add = (n, isGlow) => {
      for (let i = 0; i < n; i += 1) {
        const local = new THREE.Vector3(rand(-0.3, 0.3), rand(-0.05, r.hip + 1.05), rand(-0.18, 0.18));
        const p = local.applyMatrix4(m);
        const v = p
          .clone()
          .sub(centre)
          .normalize()
          .multiplyScalar(rand(2, 6.5))
          .addScaledVector(dir, rand(1.5, 4))
          .add(new THREE.Vector3(0, rand(1.5, 5), 0));
        const size = isGlow ? rand(0.03, 0.07) : rand(0.05, 0.17);
        this.shards.push({
          p,
          v,
          q: new THREE.Quaternion().random(),
          w: new THREE.Vector3().randomDirection().multiplyScalar(rand(4, 14)),
          size,
          life: rand(2.2, 3.2),
          glow: isGlow,
          color: (isGlow ? glow : plain)[i % (isGlow ? glow.length : plain.length)],
        });
      }
    };
    add(48, false);
    add(22, true);
    const extra = this.shards.length - 300;
    if (extra > 0) this.shards.splice(0, extra);
    this.burst(centre, UP, hdr(AMBER, 6), 70, 9, 1.2, 0.8);
    this.burst(centre, dir, hdr(new THREE.Color('#fff1c1'), 6), 30, 12, 0.5, 0.5);
    const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    this.ring(r.pos.clone().setY(0.03), flat, hdr(AMBER, 1.6), 0.3, 4.5, 0.55);
    this.ring(centre, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate()), hdr(new THREE.Color('#fff1c1'), 3), 0.2, 2.4, 0.4);
    this.boom = { t0: now, at: centre };
    this.trauma = Math.min(1, this.trauma + 0.45);
  }

  popup(text, cls, at) {
    const els = this.hud.pops || [];
    if (!els.length) return;
    const el = els[this.popIdx % els.length];
    this.popIdx += 1;
    el.textContent = text;
    el.className = `g3d-pop ${cls}`;
    this.pops = this.pops.filter((p) => p.el !== el);
    this.pops.push({ el, at: at.clone(), t0: this.game });
  }

  updateFx(dt, dtReal) {
    const { fx, gun } = this.world;

    // sparks: streaks along their velocity, fading out
    const pos = fx.sparkGeo.attributes.position.array;
    const col = fx.sparkGeo.attributes.color.array;
    this.sparks = this.sparks.filter((s) => (s.life -= dt) > 0);
    this.sparks.forEach((s, k) => {
      s.v.y -= 7 * dt;
      s.v.multiplyScalar(1 - Math.min(1, 1.3 * dt));
      s.p.addScaledVector(s.v, dt);
      if (s.p.y < 0.01) {
        s.p.y = 0.01;
        s.v.y *= -0.4;
        s.v.x *= 0.6;
        s.v.z *= 0.6;
      }
      const f = s.life / s.max;
      const i = 6 * k;
      pos[i] = s.p.x;
      pos[i + 1] = s.p.y;
      pos[i + 2] = s.p.z;
      pos[i + 3] = s.p.x - s.v.x * 0.035;
      pos[i + 4] = s.p.y - s.v.y * 0.035;
      pos[i + 5] = s.p.z - s.v.z * 0.035;
      col[i] = s.color.r * f;
      col[i + 1] = s.color.g * f;
      col[i + 2] = s.color.b * f;
      col[i + 3] = s.color.r * f * 0.15;
      col[i + 4] = s.color.g * f * 0.15;
      col[i + 5] = s.color.b * f * 0.15;
    });
    fx.sparkGeo.setDrawRange(0, this.sparks.length * 2);
    fx.sparkGeo.attributes.position.needsUpdate = true;
    fx.sparkGeo.attributes.color.needsUpdate = true;

    // shards: tumble, fall, bounce, shrink away
    this.shards = this.shards.filter((s) => (s.life -= dt) > 0);
    const dummy = this.dummy || (this.dummy = new THREE.Object3D());
    const counts = [0, 0];
    const spin = new THREE.Quaternion();
    this.shards.forEach((s) => {
      s.v.y -= 9.8 * dt;
      s.p.addScaledVector(s.v, dt);
      const w = s.w.length();
      if (w > 0 && dt > 0) s.q.premultiply(spin.setFromAxisAngle(this.tmp.copy(s.w).divideScalar(w), w * dt));
      if (s.p.y < s.size / 2) {
        s.p.y = s.size / 2;
        s.v.y *= -0.35;
        s.v.x *= 0.7;
        s.v.z *= 0.7;
        s.w.multiplyScalar(0.7);
      }
      dummy.position.copy(s.p);
      dummy.quaternion.copy(s.q);
      dummy.scale.setScalar(s.size * Math.min(1, s.life / 0.5));
      dummy.updateMatrix();
      const target = s.glow ? fx.glowShards : fx.shards;
      const k = counts[s.glow ? 1 : 0]++;
      target.setMatrixAt(k, dummy.matrix);
      target.setColorAt(k, s.color);
    });
    [fx.shards, fx.glowShards].forEach((m, i) => {
      m.count = counts[i];
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });

    // rings
    this.ringLive = this.ringLive.filter((r) => {
      const u = ((r.real ? this.real : this.game) - r.t0) / r.dur;
      if (u >= 1) {
        r.m.visible = false;
        return false;
      }
      const s = r.pulse ? r.r0 + (r.r1 - r.r0) * (0.5 + 0.5 * Math.sin(u * 14)) : r.r0 + (r.r1 - r.r0) * (1 - (1 - u) ** 3);
      r.m.scale.setScalar(s);
      r.m.material.opacity = r.pulse ? 0.9 : (1 - u) ** 1.5;
      return true;
    });

    // the explosion's light
    const bu = (this.game - this.boom.t0) / 0.5;
    fx.boomLight.intensity = bu < 1 ? 90 * (1 - bu) ** 2 : 0;
    fx.boomLight.position.copy(this.boom.at);

    // muzzle flash and recoil
    const flashing = this.real < this.flashUntil;
    gun.flash.visible = flashing;
    gun.light.intensity = flashing ? 30 : 0;
    this.kick = Math.max(0, this.kick - dtReal * 7);

    // roof flashes (in real time, so a frozen bullet cam does not stay lit up)
    this.world.blocks.forEach((blk) => {
      blk.flash = Math.max(0, (blk.flash || 0) - dtReal * 2.5);
    });
  }

  /* ------------------------------------------------------------------ */
  /* camera, aim, gun                                                    */
  /* ------------------------------------------------------------------ */

  poseCamera(dtReal) {
    const cam = this.world.camera;

    // where you stand and look: toward the mouse (or the demo's aim), with shake
    let goal = this.mouse;
    if (this.mode === 'idle') {
      this.tmp.copy(this.ai.aim).project(cam);
      goal = { x: clamp(this.tmp.x, -1, 1), y: clamp(this.tmp.y, -1, 1) };
    }
    this.look.x += (goal.x - this.look.x) * damp(3, dtReal);
    this.look.y += (goal.y - this.look.y) * damp(3, dtReal);
    const calm = reducedMotion() ? 0 : 1;
    const tr = this.trauma * this.trauma * calm;
    const n = (f, ph) => Math.sin(this.real * f + ph) * 0.6 + Math.sin(this.real * f * 2.3 + ph * 1.7) * 0.4;
    const yaw = -this.look.x * 0.11 + tr * 0.035 * n(23, 1) + calm * 0.004 * Math.sin(this.real * 0.7);
    const pitch = BASE_PITCH + this.look.y * 0.06 + tr * 0.035 * n(27, 4) + calm * 0.003 * Math.sin(this.real * 1.1);
    const roll = tr * 0.025 * n(19, 7);
    this.baseQuat.setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'));
    this.basePos.copy(EYE);

    if (this.intro) this.poseIntro(cam);
    else if (this.cam) this.poseCam(cam, dtReal);
    else {
      cam.position.copy(this.basePos);
      cam.quaternion.copy(this.baseQuat);
    }
    cam.updateMatrixWorld(true);
  }

  updateAim() {
    const cam = this.world.camera;
    if (this.mode === 'user') {
      this.raycaster.setFromCamera(this.mouse, cam);
      const { origin, direction } = this.raycaster.ray;
      const far = origin.clone().addScaledVector(direction, 90);
      const h = this.firstHit(origin, far);
      this.aimPoint.copy(h ? h.at : far);
    } else {
      this.aimPoint.copy(this.ai.aim);
    }
  }

  poseGun() {
    const { gun, camera } = this.world;
    const inCam = !!this.cam || (this.intro && this.introU < 0.82);
    gun.pivot.visible = !inCam;
    const drop = this.intro ? 0.35 * (1 - ease(clamp((this.introU - 0.82) / 0.18, 0, 1))) : 0;
    gun.pivot.position.set(0.25, -0.23 - drop, -0.48);
    camera.updateMatrixWorld(true);
    gun.pivot.lookAt(this.aimPoint);
    gun.model.position.set(0, 0.01 * this.kick, -0.07 * this.kick);
    gun.model.rotation.x = -0.12 * this.kick;
    gun.pivot.updateMatrixWorld(true);
    gun.muzzle.getWorldPosition(this.muzzle);
    this.fireDir.copy(this.aimPoint).sub(this.muzzle);
    if (this.fireDir.lengthSq() < 1e-6) this.fireDir.set(0, 0, -1);
    this.fireDir.normalize();

    // the laser sight: the line of fire up to the first thing in the way
    const { fx } = this.world;
    const far = this.muzzle.clone().addScaledVector(this.fireDir, 90);
    this.laserHit = this.firstHit(this.muzzle, far);
    const end = this.laserHit ? this.laserHit.at : far;
    const len = end.distanceTo(this.muzzle);
    const showLaser = !this.cam && !this.intro;
    fx.laser.visible = showLaser;
    fx.laser.position.copy(this.muzzle);
    fx.laser.quaternion.setFromUnitVectors(UP, this.fireDir);
    fx.laser.scale.set(0.006, len, 0.006);
    const kind = this.laserHit?.kind;
    fx.laserDot.visible = showLaser && !!this.laserHit;
    fx.laserDot.position.copy(end);
    fx.laserDot.material.color.copy(kind === 'roof' || kind === 'wall' ? hdr(CARDINAL, 4) : hdr(TEAL, kind === 'enemy' ? 5 : 2));
    fx.laserMat.color.copy(hdr(TEAL, 2.2));
  }

  /* ------------------------------------------------------------------ */
  /* the intro flight                                                    */
  /* ------------------------------------------------------------------ */

  startIntro() {
    this.intro = { t0: this.real };
    this.introU = 0;
    this.setRoot('is-intro', false);
    void this.hud.root?.offsetWidth; // restart the title's CSS animation
    this.setRoot('is-intro', true);
  }

  poseIntro(cam) {
    const u = clamp((this.real - this.intro.t0) / INTRO_LEN, 0, 1);
    this.introU = u;
    if (u >= 1) {
      this.intro = null;
      this.setRoot('is-intro', false);
      cam.position.copy(this.basePos);
      cam.quaternion.copy(this.baseQuat);
      return;
    }
    const e = ease(u);
    cam.position.copy(INTRO_PATH.getPoint(e));
    const ahead = this.basePos.clone().add(new THREE.Vector3(0, -0.9, -20));
    const target = ARENA.clone().lerp(ahead, ease(clamp((u - 0.5) / 0.5, 0, 1)));
    cam.lookAt(target);
    if (u > 0.8) cam.quaternion.slerp(this.baseQuat, ease((u - 0.8) / 0.2));
  }

  /* ------------------------------------------------------------------ */
  /* the bullet cam: follow one bolt in slow motion                      */
  /* ------------------------------------------------------------------ */

  startCam(b) {
    const cam = this.world.camera;
    this.cam = {
      phase: 'chase',
      bullet: b,
      byUser: this.mode === 'user',
      t0: this.real,
      fromPos: cam.position.clone(),
      fromQuat: cam.quaternion.clone(),
    };
    b.cam = true;
    this.setRoot('is-cam', true);
    this.setRoot('cam-impact', false);
    if (this.cam.byUser) this.sfx.whoosh(true);
  }

  camImpact(b, hit) {
    const c = this.cam;
    const d = b.vel.clone().normalize();
    const roof = hit.kind === 'roof';
    const up = roof ? hit.blk.spec.n.clone().normalize() : UP;
    // off to the side, toward the middle of the arena; on a roof, low over
    // the plane, so it looks like the 2-D picture: the line, the plane nearly
    // edge-on, and the head beneath it
    const across = new THREE.Vector3().crossVectors(d, up).normalize();
    if (across.x * hit.at.x > 0) across.negate();
    const beyond = b.aimAt ? b.aimAt.clone().sub(hit.at).dot(d) : 0;
    const lift = { roof: 0.75, wall: 0.7, ground: 1.2, enemy: 0.45 }[hit.kind];
    Object.assign(c, {
      phase: 'impact',
      t0: this.real,
      at: hit.at.clone(),
      kind: hit.kind,
      tHit: b.tHit,
      dur: hit.kind === 'enemy' ? 2.3 : 2.1,
      fromPos: this.world.camera.position.clone(),
      fromQuat: this.world.camera.quaternion.clone(),
      offset: up
        .clone()
        .multiplyScalar(lift)
        .addScaledVector(across, roof ? 2.7 : 1.5)
        .addScaledVector(d, { roof: -0.2, enemy: -1.7 }[hit.kind] ?? -1.3),
      look: hit.at.clone().addScaledVector(d, roof ? clamp(beyond, 0, 2) * 0.45 : 0),
    });
    this.tsGoal = hit.kind === 'enemy' ? 0.1 : 0;
    this.setRoot('cam-impact', true);

    // the rest of the line, on to what you aimed at (seen through the block),
    // and a ring where it crosses
    const { ghost } = this.world.fx;
    ghost.visible = hit.kind !== 'enemy';
    ghost.position.copy(hit.at);
    ghost.quaternion.setFromUnitVectors(UP, d);
    ghost.scale.set(0.006, beyond > 0.3 ? beyond + 0.4 : 3, 0.006);
    ghost.material.opacity = 0.3;
    const facing = roof ? up : d.clone().negate();
    c.marker = this.ring(
      hit.at.clone().addScaledVector(facing, 0.01),
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), facing),
      hit.kind === 'enemy' ? hdr(TEAL, 4) : hdr(CARDINAL, 4),
      0.14,
      0.22,
      c.dur + 0.4,
      { real: true, pulse: true },
    );

    const t = `${num(b.tHit, 3)} s`;
    const text = {
      roof: ['BLOCKED BY THE ROOF PLANE', `The line meets the plane at t = ${t}, and that point is on the roof.`],
      wall: ['BLOCKED BY A WALL', `The bolt hits a wall at t = ${t}.`],
      ground: ['INTO THE GROUND', `The line meets the ground (z = 0) at t = ${t}.`],
      enemy: ['HIT!', `At t = ${t}. The head was on your side of the roof plane.`],
    }[hit.kind];
    this.setText(this.hud.calloutTitle, text[0]);
    this.setText(this.hud.calloutBody, text[1]);
    this.hud.callout?.setAttribute('data-kind', hit.kind);
  }

  camReturn() {
    const cam = this.world.camera;
    Object.assign(this.cam, {
      phase: 'return',
      t0: this.real,
      fromPos: cam.position.clone(),
      fromQuat: cam.quaternion.clone(),
    });
    this.tsGoal = 1;
    this.world.fx.ghost.visible = false;
    this.setRoot('is-cam', false);
    this.setRoot('cam-impact', false);
    if (this.cam.byUser) this.sfx.whoosh(false);
  }

  poseCam(cam) {
    const c = this.cam;
    const since = this.real - c.t0;
    if (c.phase === 'chase') {
      const b = c.bullet;
      const d = b.vel.clone().normalize();
      const ahead = this.firstHit(b.pos, b.pos.clone().addScaledVector(d, 60), b.owner === 'you');
      const dist = ahead ? ahead.t * 60 : 60;
      this.tsGoal = clamp(dist / 10, 0.05, 0.45);
      const k = ease(clamp(1 - dist / 7, 0, 1)); // near the impact, swing out to the side
      const across = new THREE.Vector3().crossVectors(d, UP).normalize();
      const want = b.pos
        .clone()
        .addScaledVector(d, -1.0 - 0.9 * k)
        .addScaledVector(UP, 0.2 + 0.45 * k)
        .addScaledVector(across, 0.28 + 1.5 * k);
      const look = b.pos.clone().addScaledVector(d, 3.2 - 2.2 * k);
      const blend = ease(clamp(since / 0.35, 0, 1));
      cam.position.lerpVectors(c.fromPos, want, blend);
      cam.lookAt(look);
      const q = cam.quaternion.clone();
      cam.quaternion.copy(c.fromQuat).slerp(q, blend);
    } else if (c.phase === 'impact') {
      const u = clamp(since / c.dur, 0, 1);
      const off = c.offset.clone().applyAxisAngle(UP, 0.3 * ease(u)).multiplyScalar(1 - 0.1 * ease(u));
      const k = ease(clamp(since / 0.45, 0, 1)); // glide from the chase to the vantage point
      cam.position.copy(c.fromPos).lerp(off.add(c.at), k);
      cam.lookAt(c.look);
      const q = cam.quaternion.clone();
      cam.quaternion.copy(c.fromQuat).slerp(q, k);
      if (since > c.dur) this.camReturn();
    } else {
      const u = ease(clamp(since / 0.5, 0, 1));
      cam.position.lerpVectors(c.fromPos, this.basePos, u);
      cam.quaternion.copy(c.fromQuat).slerp(this.baseQuat, u);
      if (u >= 1) {
        if (c.marker) c.marker.t0 = -1e9;
        this.cam = null;
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* planes, scenery                                                     */
  /* ------------------------------------------------------------------ */

  pickFocus() {
    if (this.cam) {
      const b = this.cam.bullet;
      const h = this.cam.at ? null : this.firstHit(b.pos, b.pos.clone().addScaledVector(b.vel.clone().normalize(), 60));
      const blk = h?.blk || h?.robot?.blk;
      if (blk) this.focus = this.world.blocks.indexOf(blk);
      return;
    }
    const h = this.laserHit;
    const blk = h?.blk || h?.robot?.blk;
    if (blk) {
      this.focus = this.world.blocks.indexOf(blk);
      return;
    }
    // otherwise the robot nearest the crosshair on the screen
    const cam = this.world.camera;
    const aim = this.tmp.copy(this.aimPoint).project(cam);
    const ax = aim.x;
    const ay = aim.y;
    let best = Infinity;
    this.robots.forEach((r, i) => {
      const s = r.head.clone().project(cam);
      const d = Math.hypot((s.x - ax) * (16 / 9), s.y - ay);
      if (d < best) {
        best = d;
        this.focus = i;
      }
    });
  }

  updateScenery(dtReal) {
    this.pickFocus();
    const math = this.opts.math;
    this.world.blocks.forEach((blk, i) => {
      const goal = this.intro ? 1 : i === this.focus ? 0.85 : math ? 0.22 : 0.1;
      blk.focus += (goal - blk.focus) * damp(6, dtReal);
      const u = blk.planeMat.uniforms;
      u.uStrength.value = blk.focus;
      u.uTime.value = this.game;
      u.uFlash.value = blk.flash;
      const nOn = math && !this.intro ? clamp((blk.focus - 0.6) / 0.4, 0, 1) : 0;
      blk.nMat.opacity = nOn;
      blk.nLabel.material.opacity = nOn;
      blk.roofMat.emissiveIntensity = 0.15 + 2.5 * blk.flash;
      blk.edgeMat.color.copy(CARDINAL).multiplyScalar(3 + 6 * blk.flash);
    });
    this.world.sun.userData.mat.uniforms.uTime.value = this.real;

    // embers drift up and wrap around
    const e = this.world.embers.geometry.attributes.position;
    const dt = dtReal * this.timeScale;
    for (let i = 0; i < e.count; i += 1) {
      let y = e.getY(i) + dt * (0.25 + (i % 7) * 0.05);
      if (y > 9) y = 0;
      e.setY(i, y);
      e.setX(i, e.getX(i) + dt * 0.15 * Math.sin(this.real * 0.5 + i));
    }
    e.needsUpdate = true;
  }

  /* ------------------------------------------------------------------ */
  /* the HUD (DOM)                                                       */
  /* ------------------------------------------------------------------ */

  setText(el, text) {
    if (el && this.cache.get(el) !== text) {
      this.cache.set(el, text);
      el.textContent = text;
    }
  }

  setAttr(el, name, value) {
    if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
  }

  setRoot(cls, on) {
    this.hud.root?.classList.toggle(cls, on);
  }

  toScreen(v) {
    const p = this.tmp.copy(v).project(this.world.camera);
    return { x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H, ok: p.z < 1 && p.z > -1 };
  }

  updateHud() {
    const hud = this.hud;
    if (!hud.root) return;
    this.setRoot('is-idle', this.mode === 'idle');
    this.setRoot('red-flash', !reducedMotion() && this.real - (this.redFlash ?? -10) < 0.25);
    this.setText(hud.hits, `${this.score.hits}`);
    this.setText(hud.blocked, `${this.score.blocked}`);

    // crosshair
    const kind = this.laserHit?.kind;
    const state = kind === 'roof' || kind === 'wall' ? 'blocked' : kind === 'enemy' ? 'clear' : 'none';
    const cross = this.mode === 'user' ? { x: ((this.mouse.x + 1) / 2) * W, y: ((1 - this.mouse.y) / 2) * H } : this.toScreen(this.ai.aim);
    if (hud.cross) {
      hud.cross.style.transform = `translate(${cross.x.toFixed(1)}px, ${cross.y.toFixed(1)}px)`;
      this.setAttr(hud.cross, 'data-state', state);
    }
    this.setText(hud.crossLabel, { blocked: kind === 'roof' ? 'BLOCKED BY THE ROOF' : 'BLOCKED', clear: 'CLEAR SHOT', none: '' }[state]);

    // the live math, for the block in focus
    const blk = this.world.blocks[this.focus];
    const B = blk.spec;
    const r = this.robots[this.focus];
    const [a, b, c] = toMath(B.n);
    const eq = `${lhs(a, b, c)} = ${num(B.d)}`;
    this.setText(hud.plane, eq);
    this.setText(hud.plane2, eq);
    const alive = r.phase === 'up' || r.phase === 'down';
    if (hud.headVal) hud.headVal.style.visibility = alive ? 'visible' : 'hidden';
    if (alive) {
      const val = B.n.dot(r.head);
      const mine = val > B.d;
      this.setText(hud.head, num(val));
      this.setText(hud.headCmp, mine ? '>' : '<');
      this.setText(hud.headVerdict, mine ? '▲ your side of the plane: EXPOSED' : '▼ the other side: COVERED');
      this.setAttr(hud.headVerdict, 'data-state', mine ? 'clear' : 'blocked');
    } else {
      this.setText(hud.head, '—');
      this.setText(hud.headCmp, '');
      this.setText(hud.headVerdict, r.phase === 'dead' ? 'destroyed, respawning…' : 'respawning…');
      this.setAttr(hud.headVerdict, 'data-state', 'none');
    }
    const bullet = this.cam?.bullet;
    const p = bullet ? bullet.p0 : this.muzzle;
    const v = bullet ? bullet.vel : this.fireDir.clone().multiplyScalar(SPEED);
    this.setText(hud.p, vecStr(p, 2));
    this.setText(hud.v, vecStr(v, 1));
    const nv = B.n.dot(v);
    let tText = '—';
    let verdict = 'the line is parallel to the plane: it never meets it';
    let vstate = 'none';
    if (Math.abs(nv) > 1e-6) {
      const t = (B.d - B.n.dot(p)) / nv;
      tText = `${num(t, 3)} s`;
      if (t < 0) verdict = 't < 0: only behind the muzzle, so never';
      else if (onRoof(B, p.clone().addScaledVector(v, t))) {
        verdict = 'that point is on the roof: BLOCKED';
        vstate = 'blocked';
      } else verdict = 'that point is not on the roof: no block';
    }
    this.setText(hud.tStar, tText);
    this.setText(hud.lineVerdict, verdict);
    this.setAttr(hud.lineVerdict, 'data-state', vstate);

    // a tag over each robot: which side of its roof plane its head is on
    const showTags = !this.intro && !this.cam;
    (hud.chips || []).forEach((el, i) => {
      if (!el) return;
      const rr = this.robots[i];
      const ok = showTags && (rr.phase === 'up' || rr.phase === 'down');
      const s = ok ? this.toScreen(rr.head.clone().add(new THREE.Vector3(0, 0.42, 0))) : null;
      if (!s?.ok) {
        this.setAttr(el, 'data-state', 'hidden');
        return;
      }
      const val = side(rr.block, rr.head);
      el.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`;
      this.setAttr(el, 'data-state', val > 0 ? 'clear' : 'blocked');
      this.setAttr(el, 'data-focus', i === this.focus ? 'yes' : 'no');
      this.setText(el.firstChild, `${val > 0 ? '+' : '−'}${Math.abs(val).toFixed(2)}`);
      this.setText(el.lastChild, val > 0 ? 'exposed' : 'covered');
    });

    // popups rise and fade
    this.pops = this.pops.filter((pp) => {
      const u = (this.game - pp.t0) / 0.9;
      const s = this.toScreen(pp.at);
      if (u >= 1 || !s.ok) {
        pp.el.style.opacity = '0';
        return u < 1;
      }
      pp.el.style.opacity = `${1 - u * u}`;
      pp.el.style.transform = `translate(${s.x.toFixed(1)}px, ${(s.y - 26 - 34 * u).toFixed(1)}px) scale(${1 + 0.25 * (1 - u) ** 4})`;
      return true;
    });

    // the bullet cam's readout: t and the point x(t)
    if (this.cam) {
      const bb = this.cam.bullet;
      const t = this.cam.tHit ?? bb.t;
      this.setText(hud.camT, num(t, 3));
      this.setText(hud.camX, vecStr(bb.p0.clone().addScaledVector(bb.vel, t), 2));
      if (this.cam.at && hud.callout) {
        const s = this.toScreen(this.cam.at);
        hud.callout.style.transform = `translate(${clamp(s.x + 40, 20, W - 420).toFixed(1)}px, ${clamp(s.y - 150, 90, H - 260).toFixed(1)}px)`;
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* size and quality                                                    */
  /* ------------------------------------------------------------------ */

  /** Renders at the size the slide is shown at (reveal scales it), within a budget. */
  resize(force = false) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width) return;
    if (!force && Math.abs(rect.width - this.lastWidth) < 1) return;
    this.lastWidth = rect.width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ratio = clamp((rect.width / W) * dpr * this.quality, 0.5, 2400 / W);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(W, H, false);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(W, H);
  }

  /** Every couple of seconds: follow the slide's size, and lower the resolution if frames are slow. */
  adapt(dtReal) {
    this.frameTimes.push(dtReal);
    if (this.frameTimes.length < 120) return;
    const avg = this.frameTimes.reduce((s, x) => s + x, 0) / this.frameTimes.length;
    this.frameTimes = [];
    if (avg > 1 / 42 && this.quality > 0.5) this.quality = Math.max(0.5, this.quality - 0.15);
    else if (avg < 1 / 57 && this.quality < 1) this.quality = Math.min(1, this.quality + 0.1);
    this.resize(true);
  }
}
