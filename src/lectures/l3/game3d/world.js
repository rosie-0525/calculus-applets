import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BLOCKS, PILLARS, CELL, LEG, HEAD_UP } from './solids.js';
import {
  gridTexture,
  glowTexture,
  flashTexture,
  concreteTexture,
  signTexture,
  letterTexture,
} from './textures.js';

/*
 * Builds the scene of the 3-D game: a neon arena at dusk, three cover blocks
 * whose sloping tops are drawn with their roof planes extended, three robots
 * hiding behind them, and your gun. Nothing here moves; engine.js does that.
 */

// The deck's colours, brightened to glow: teal is you and your side of a
// plane, cardinal the roof planes and "blocked", amber the enemies.
export const TEAL = new THREE.Color('#22d3ee');
export const CARDINAL = new THREE.Color('#ff2847');
export const AMBER = new THREE.Color('#ffae1a');
export const RED = new THREE.Color('#ff3030');
export const hdr = (c, k) => c.clone().multiplyScalar(k);

const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** A mesh casting and receiving shadows. */
function mesh(geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

/** A thin box from a to b (points in the parent's frame). */
export function beam(a, b, r, mat) {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.BoxGeometry(r, r, dir.length()), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 0, 1), dir.normalize());
  return m;
}

/* ---------- sky, sun, mountains, stars ---------- */

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color('#030309') },
      uMid: { value: new THREE.Color('#240833') },
      uHorizon: { value: new THREE.Color('#e0306a') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      varying vec3 vDir;
      void main() {
        float h = normalize(vDir).y;
        vec3 col = mix(uMid, uTop, smoothstep(0.04, 0.5, h));
        col = mix(uHorizon * 0.3, col, smoothstep(-0.01, 0.12, h));
        col += uHorizon * 0.38 * exp(-abs(h) * 40.0);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), mat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  return sky;
}

function makeSun(glowTex) {
  const mat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float y = vUv.y;
        // stripes across the lower half, wider toward the bottom, drifting down
        float band = fract(y * 12.0 + uTime * 0.12);
        float gap = smoothstep(0.58, 0.0, y) * 0.6;
        if (y < 0.58 && band < gap) discard;
        vec3 top = vec3(1.0, 0.78, 0.25);
        vec3 bottom = vec3(1.0, 0.1, 0.38);
        vec3 col = mix(bottom, top, smoothstep(0.05, 0.95, y));
        gl_FragColor = vec4(col * 1.3, 1.0);
      }`,
  });
  const sun = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(46, 64), mat);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: hdr(new THREE.Color('#ff3a7a'), 0.35),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  );
  halo.scale.set(150, 150, 1);
  halo.position.z = -2;
  sun.add(halo, disc);
  sun.position.set(-170, 30, -262);
  sun.lookAt(0, 1.7, 0);
  sun.userData.mat = mat;
  return sun;
}

function makeMountains() {
  // a jagged ring on the horizon, dark, with a glowing wireframe
  const N = 150;
  const base = [];
  const ridge = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i <= N; i += 1) {
    const a = (i / N) * 2 * Math.PI;
    const r = 250 + 30 * Math.sin(i * 1.3) + 20 * rand();
    const tall = i % 2 ? 0.35 + 0.3 * rand() : 0.7 + 0.5 * rand();
    const h = (14 + 34 * Math.abs(Math.sin(i * 0.21 + 1))) * tall;
    base.push(V(Math.sin(a) * r, -2, -Math.cos(a) * r));
    ridge.push(V(Math.sin(a) * r * 0.985, h, -Math.cos(a) * r * 0.985));
  }
  const pos = [];
  for (let i = 0; i < N; i += 1) {
    const mid = base[i].clone().lerp(ridge[i + 1], 0.5).lerp(ridge[i], 0.2);
    mid.y *= 0.9;
    [base[i], base[i + 1], mid, base[i], mid, ridge[i], mid, base[i + 1], ridge[i + 1], ridge[i], mid, ridge[i + 1]].forEach(
      (p) => pos.push(p.x, p.y, p.z),
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const group = new THREE.Group();
  group.add(
    new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#0b0614', fog: false, side: THREE.DoubleSide })),
    new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({
        color: hdr(new THREE.Color('#ff3fa4'), 0.9),
        fog: false,
        transparent: true,
        opacity: 0.35,
      }),
    ),
  );
  return group;
}

function makeStars() {
  const pos = [];
  for (let i = 0; i < 1100; i += 1) {
    const y = 0.06 + Math.random() * 0.94;
    const a = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(1 - y * y);
    pos.push(420 * r * Math.cos(a), 420 * y, 420 * r * Math.sin(a));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 1.7,
      sizeAttenuation: false,
      color: '#ffffff',
      transparent: true,
      opacity: 0.8,
      fog: false,
      depthWrite: false,
    }),
  );
}

/** Embers drifting through the arena (engine.js moves them). */
function makeEmbers(glowTex) {
  const N = 260;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i += 1) {
    pos[3 * i] = (Math.random() - 0.5) * 32;
    pos[3 * i + 1] = Math.random() * 9;
    pos[3 * i + 2] = -36 + Math.random() * 31;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      map: glowTex,
      size: 0.13,
      color: hdr(new THREE.Color('#ff6aa8'), 2.2),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  pts.frustumCulled = false;
  return pts;
}

/* ---------- the arena ---------- */

function makeGround(renderer) {
  const grid = gridTexture(renderer);
  grid.repeat.set(300, 300); // 2 m cells on a 600 m floor
  const ground = mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({
      color: '#07080f',
      roughness: 0.78,
      metalness: 0.15,
      emissive: '#ffffff',
      emissiveMap: grid,
      emissiveIntensity: 0.85,
    }),
    { cast: false },
  );
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

function makePillar(p, mats) {
  const g = new THREE.Group();
  g.position.set(p.x, p.h / 2, p.z);
  g.add(mesh(new THREE.BoxGeometry(p.w, p.h, p.depth), mats.pillar));
  const inner = -Math.sign(p.x); // the face toward the middle of the arena
  [-0.22, 0.22].forEach((dz) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.03, p.h * 0.84, 0.06), mats.tealGlow);
    strip.position.set((inner * p.w) / 2, 0, dz);
    g.add(strip);
  });
  const cap = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.12, 0.08, p.depth + 0.12), mats.pinkGlow);
  cap.position.y = p.h / 2 + 0.04;
  g.add(cap);
  return g;
}

function makeSign(parts, color, x, z) {
  const tex = signTexture(parts, color);
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.lookAt(0, 0, 0);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 3.25),
    new THREE.MeshBasicMaterial({
      map: tex,
      color: new THREE.Color(2.2, 2.2, 2.2),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  face.position.y = 9.2;
  const frameMat = new THREE.MeshBasicMaterial({ color: hdr(new THREE.Color(color), 1.4), fog: false });
  const c = [V(-6.6, 7.5, -0.05), V(6.6, 7.5, -0.05), V(6.6, 10.9, -0.05), V(-6.6, 10.9, -0.05)];
  c.forEach((a, i) => g.add(beam(a, c[(i + 1) % 4], 0.07, frameMat)));
  const post = new THREE.MeshStandardMaterial({ color: '#12141c', metalness: 0.8, roughness: 0.4 });
  [-5, 5].forEach((px) => {
    const m = mesh(new THREE.BoxGeometry(0.3, 7.5, 0.3), post);
    m.position.set(px, 3.75, -0.2);
    g.add(m);
  });
  g.add(face);
  return g;
}

/* ---------- the cover blocks and their roof planes ---------- */

/** Two triangles a, b, c, d (counter-clockwise from outside), with planar UVs. */
function quad(pos, uv, pts, uvOf) {
  const [a, b, c, d] = pts;
  [a, b, c, a, c, d].forEach((p) => {
    pos.push(p.x, p.y, p.z);
    uv.push(...uvOf(p));
  });
}

// The extended roof plane: a grid in the plane's own coordinates, fading
// with the distance from the roof, a scan band, and ripples where bullets hit.
const planeVert = /* glsl */ `
  varying vec2 vP;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vP = position.xy;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormal = normalize((modelMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const planeFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  uniform float uTime;
  uniform float uFlash;
  uniform vec2 uHalf;
  uniform float uCell;
  uniform vec3 uRip[4];
  varying vec2 vP;
  varying vec3 vWorld;
  varying vec3 vNormal;
  float gridLine(vec2 p, float cell) {
    vec2 c = p / cell;
    vec2 g = abs(fract(c - 0.5) - 0.5) / max(fwidth(c), vec2(1e-4));
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float dist = length(max(abs(vP) - uHalf, 0.0));
    float fade = 1.0 - smoothstep(0.0, 4.6, dist);
    float a = (0.035 + 0.26 * gridLine(vP, uCell) + 0.45 * gridLine(vP, uCell * 4.0)) * fade * uStrength;
    float sweep = mod(uTime * 2.6, 22.0) - 11.0;
    a += exp(-pow((vP.y - sweep) * 1.3, 2.0)) * 0.14 * fade * uStrength;
    float rip = 0.0;
    for (int i = 0; i < 4; i++) {
      float age = uTime - uRip[i].z;
      if (age >= 0.0 && age < 1.4) {
        float d = abs(length(vP - uRip[i].xy) - age * 6.0);
        rip += (1.0 - smoothstep(0.0, 0.32, d)) * (1.0 - age / 1.4);
      }
    }
    a += rip * 1.4 * max(fade, 0.25) + uFlash * 0.2 * fade;
    // seen edge-on, or from right next to it, the grid piles up: fade it
    vec3 toCam = cameraPosition - vWorld;
    float facing = abs(dot(normalize(toCam), vNormal));
    a *= smoothstep(0.02, 0.3, facing) * smoothstep(0.4, 2.2, length(toCam));
    gl_FragColor = vec4(uColor * a, 1.0);
  }`;

function makeBlock(spec, mats, textures) {
  const { w, depth: D, h1, h2, s } = spec;
  const g = new THREE.Group();
  g.matrixAutoUpdate = false;
  g.matrix.copy(spec.matrix);

  const FBL = V(-w / 2, 0, 0);
  const FBR = V(w / 2, 0, 0);
  const FTL = V(-w / 2, h1, 0);
  const FTR = V(w / 2, h1, 0);
  const BBL = V(-w / 2, 0, -D);
  const BBR = V(w / 2, 0, -D);
  const BTL = V(-w / 2, h2, -D);
  const BTR = V(w / 2, h2, -D);

  const pos = [];
  const uv = [];
  const k = 1 / 1.6; // one concrete panel per 1.6 m
  quad(pos, uv, [FBL, FBR, FTR, FTL], (p) => [p.x * k, p.y * k]);
  quad(pos, uv, [BBR, BBL, BTL, BTR], (p) => [p.x * k, p.y * k]);
  quad(pos, uv, [BBL, FBL, FTL, BTL], (p) => [p.z * k, p.y * k]);
  quad(pos, uv, [FBR, BBR, BTR, FTR], (p) => [p.z * k, p.y * k]);
  const bodyGeo = new THREE.BufferGeometry();
  bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  bodyGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  bodyGeo.computeVertexNormals();
  g.add(mesh(bodyGeo, mats.concrete));

  // the roof: the piece of the plane you can stand a cup on
  const rp = [];
  const ruv = [];
  quad(rp, ruv, [FTL, FTR, BTR, BTL], () => [0, 0]);
  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
  roofGeo.setAttribute('uv', new THREE.Float32BufferAttribute(ruv, 2));
  roofGeo.computeVertexNormals();
  const roofMat = new THREE.MeshStandardMaterial({
    color: '#3b0d16',
    roughness: 0.3,
    metalness: 0.55,
    emissive: CARDINAL,
    emissiveIntensity: 0.15,
  });
  g.add(mesh(roofGeo, roofMat));

  const edgeMat = new THREE.MeshBasicMaterial({ color: hdr(CARDINAL, 3) });
  [
    [FTL, FTR],
    [FTR, BTR],
    [BTR, BTL],
    [BTL, FTL],
  ].forEach(([a, b]) => g.add(beam(a, b, 0.035, edgeMat)));

  // the roof plane, extended: its own frame has x across the block, y up
  // the slope and z along the normal (0, 1, s)
  const EXT = 5.2;
  const xAxis = V(1, 0, 0);
  const upSlope = V(0, s, -1).normalize();
  const normal = V(0, 1, s).normalize();
  const centre = V(0, (h1 + h2) / 2, -D / 2);
  const planeMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: hdr(CARDINAL, 1.05) },
      uStrength: { value: 0.3 },
      uTime: { value: 0 },
      uFlash: { value: 0 },
      uHalf: { value: new THREE.Vector2(w / 2, spec.slopeLen / 2) },
      uCell: { value: CELL },
      uRip: { value: [0, 1, 2, 3].map(() => V(0, 0, -100)) },
    },
    vertexShader: planeVert,
    fragmentShader: planeFrag,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w + 2 * EXT, spec.slopeLen + 2 * EXT), planeMat);
  plane.position.copy(centre).addScaledVector(normal, 0.004);
  plane.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, upSlope, normal));
  plane.renderOrder = 2;
  g.add(plane);

  // the normal vector n at the middle of the roof, pointing to your side
  const nMat = new THREE.MeshBasicMaterial({ color: hdr(TEAL, 3), transparent: true, opacity: 0 });
  const arrow = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.8, 8), nMat);
  shaft.position.y = 0.4;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 14), nMat);
  head.position.y = 0.9;
  arrow.add(shaft, head);
  arrow.position.copy(centre);
  arrow.quaternion.setFromUnitVectors(V(0, 1, 0), normal);
  const nLabel = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: textures.n, transparent: true, opacity: 0, depthWrite: false }),
  );
  nLabel.scale.set(0.42, 0.42, 1);
  nLabel.position.copy(centre).addScaledVector(normal, 1.25).add(V(0.22, 0, 0));
  arrow.renderOrder = 3;
  g.add(arrow, nLabel);

  return { spec, group: g, roofMat, edgeMat, planeMat, plane, nMat, nLabel, ripple: 0, focus: 0.3 };
}

/* ---------- the robots ---------- */

function makeRobot(mats) {
  const root = new THREE.Group(); // on the ground, turned to face you
  const body = new THREE.Group(); // squashed while it materializes
  root.add(body);

  const legs = [-1, 1].map((sx) => {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.13, 0.94, 0);
    const thigh = mesh(new THREE.BoxGeometry(0.15, LEG, 0.17), mats.armor);
    thigh.position.y = -LEG / 2;
    const knee = new THREE.Group();
    knee.position.y = -LEG;
    const kneeCap = mesh(new THREE.SphereGeometry(0.08, 14, 10), mats.plate);
    const shin = mesh(new THREE.BoxGeometry(0.13, LEG, 0.15), mats.dark);
    shin.position.y = -LEG / 2;
    const ankle = new THREE.Group();
    ankle.position.y = -LEG;
    const foot = mesh(new THREE.BoxGeometry(0.17, 0.07, 0.3), mats.dark);
    foot.position.set(0, 0.035, 0.05);
    ankle.add(foot);
    knee.add(kneeCap, shin, ankle);
    hip.add(thigh, knee);
    body.add(hip);
    return { hip, knee, ankle };
  });

  const torso = new THREE.Group(); // pivots at the hip
  torso.position.y = 0.94;
  body.add(torso);
  const add = (m, x, y, z) => {
    m.position.set(x, y, z);
    torso.add(m);
    return m;
  };
  add(mesh(new THREE.BoxGeometry(0.36, 0.14, 0.22), mats.dark), 0, 0, 0);
  add(mesh(new RoundedBoxGeometry(0.56, 0.62, 0.34, 3, 0.07), mats.armor), 0, 0.35, 0);
  add(mesh(new RoundedBoxGeometry(0.42, 0.28, 0.06, 2, 0.025), mats.plate), 0, 0.42, 0.17);
  add(new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), mats.amberGlow), 0, 0.42, 0.203);
  [-1, 1].forEach((sx) => add(mesh(new RoundedBoxGeometry(0.2, 0.15, 0.28, 2, 0.04), mats.plate), sx * 0.37, 0.6, 0));
  add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 12), mats.dark), 0, 0.71, 0);

  // arms holding a blaster in front of the chest
  const arm = (pts) => {
    for (let i = 0; i < pts.length - 1; i += 1) {
      const m = beam(pts[i], pts[i + 1], 0.1, mats.armor);
      m.castShadow = true;
      torso.add(m);
    }
  };
  arm([V(0.37, 0.56, 0), V(0.35, 0.32, 0.12), V(0.13, 0.44, 0.28)]);
  arm([V(-0.37, 0.56, 0), V(-0.27, 0.34, 0.28), V(0.07, 0.48, 0.47)]);
  const blaster = new THREE.Group();
  blaster.position.set(0.1, 0.52, 0.3);
  blaster.add(mesh(new THREE.BoxGeometry(0.09, 0.11, 0.42), mats.dark));
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.06), mats.redGlow);
  tip.position.z = 0.23;
  const muzzle = new THREE.Object3D();
  muzzle.position.z = 0.28;
  blaster.add(tip, muzzle);
  torso.add(blaster);

  const head = new THREE.Group();
  head.position.y = HEAD_UP;
  torso.add(head);
  head.add(mesh(new RoundedBoxGeometry(0.44, 0.36, 0.38, 3, 0.09), mats.armor));
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.085, 0.03), mats.amberGlow);
  visor.position.set(0, 0.02, 0.185);
  head.add(visor);
  [-1, 1].forEach((sx) => {
    const ear = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 14), mats.plate);
    ear.rotation.z = Math.PI / 2;
    ear.position.x = sx * 0.23;
    head.add(ear);
  });
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), mats.dark);
  antenna.position.set(0.11, 0.29, -0.04);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mats.amberGlow.clone());
  bulb.position.set(0.11, 0.41, -0.04);
  head.add(antenna, bulb);

  // a column of light when it materializes
  const beamMat = new THREE.MeshBasicMaterial({
    color: hdr(AMBER, 2.5),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const spawnBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 5, 24, 1, true), beamMat);
  spawnBeam.position.y = 2.5;
  spawnBeam.visible = false;
  root.add(spawnBeam);

  return { root, body, legs, torso, head, muzzle, bulb, spawnBeam, beamMat };
}

/* ---------- your gun, held in front of the camera ---------- */

function makeGun(mats, textures) {
  const pivot = new THREE.Group(); // turned so +z points at what you aim at
  pivot.position.set(0.23, -0.21, -0.52);
  const model = new THREE.Group(); // kicks back when you fire
  pivot.add(model);
  const add = (m, x, y, z, rx = 0) => {
    m.position.set(x, y, z);
    m.rotation.x = rx;
    model.add(m);
    return m;
  };
  // receiver, with a light stripe and a glowing energy line along each side
  add(new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.095, 0.34, 2, 0.016), mats.gunMetal), 0, 0, 0.05);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.074, 0.026, 0.14, 2, 0.008), mats.gunPlate), 0, 0.022, 0.12);
  [-1, 1].forEach((sx) => add(new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.01, 0.22), mats.tealGlow), sx * 0.036, -0.018, 0.06));
  // a scope on a rail
  add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.2), mats.dark), 0, 0.057, 0.06);
  const scope = add(new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.14, 16), mats.gunMetal), 0, 0.087, 0.04);
  scope.rotation.x = Math.PI / 2;
  add(new THREE.Mesh(new THREE.CircleGeometry(0.016, 20), mats.tealDim), 0, 0.087, -0.031).rotation.y = Math.PI;
  // the shroud with vents, the barrel and a glowing muzzle ring
  add(new THREE.Mesh(new RoundedBoxGeometry(0.056, 0.064, 0.26, 2, 0.012), mats.gunMetal), 0, 0.002, 0.34);
  [0.27, 0.33, 0.39].forEach((z) =>
    [-1, 1].forEach((sx) => add(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.018, 0.035), mats.tealGlow), sx * 0.029, 0.004, z)),
  );
  const barrel = add(new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.015, 0.12, 12), mats.dark), 0, 0.002, 0.52);
  barrel.rotation.x = Math.PI / 2;
  add(new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.004, 8, 20), mats.tealGlow), 0, 0.002, 0.58);
  // magazine with a charge window, grip, stock
  add(new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.12, 0.07), mats.gunMetal), 0, -0.1, 0.15, 0.18);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.022, 0.04), mats.tealDim), 0, -0.11, 0.155, 0.18);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.12, 0.058), mats.dark), 0, -0.085, -0.05, -0.32);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.08, 0.12), mats.gunMetal), 0, -0.012, -0.17);

  const muzzle = new THREE.Object3D(); // on the pivot, so the recoil does not move it
  muzzle.position.set(0, 0.002, 0.6);
  const flash = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: textures.flash,
      color: hdr(new THREE.Color('#c9fbff'), 5),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  );
  flash.position.copy(muzzle.position);
  flash.visible = false;
  const light = new THREE.PointLight(TEAL, 0, 7, 1.6);
  light.position.copy(muzzle.position);
  pivot.add(muzzle, flash, light);
  return { pivot, model, muzzle, flash, light };
}

/* ---------- effects: pools the engine draws from ---------- */

function makeFx(scene, textures) {
  // sparks: short glowing streaks
  const SPARKS = 600;
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 6), 3).setUsage(THREE.DynamicDrawUsage));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPARKS * 6), 3).setUsage(THREE.DynamicDrawUsage));
  const sparkLines = new THREE.LineSegments(
    sparkGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  sparkLines.frustumCulled = false;
  scene.add(sparkLines);

  // shards of an exploded robot: plain and glowing
  const box = new THREE.BoxGeometry(1, 1, 1);
  const shards = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.4 }), 220);
  const glowShards = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 90);
  [shards, glowShards].forEach((m) => {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.castShadow = true;
    m.count = 0;
    scene.add(m);
  });

  // shock rings (on the ground) and crossing markers (on a roof plane)
  const rings = Array.from({ length: 8 }, () => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.93, 1, 72),
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    m.visible = false;
    scene.add(m);
    return m;
  });

  const boomLight = new THREE.PointLight(AMBER, 0, 14, 1.4);
  scene.add(boomLight);

  const glowSprite = (color, size) => {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: textures.glow,
        color,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    sp.scale.set(size, size, 1);
    sp.visible = false;
    scene.add(sp);
    return sp;
  };

  // the laser sight: your line of fire, up to the first thing in the way
  const laserMat = new THREE.MeshBasicMaterial({
    color: hdr(TEAL, 2.2),
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const unitRod = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
  unitRod.translate(0, 0.5, 0); // from 0 to 1 along y, so scale.y is its length
  const laser = new THREE.Mesh(unitRod, laserMat);
  laser.frustumCulled = false;
  scene.add(laser);
  const laserDot = glowSprite(hdr(TEAL, 3), 0.35);

  // the rest of the line after the crossing, shown in the bullet cam
  const ghost = new THREE.Mesh(
    unitRod,
    new THREE.MeshBasicMaterial({
      color: hdr(TEAL, 1.6),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    }),
  );
  ghost.frustumCulled = false;
  ghost.renderOrder = 5;
  ghost.visible = false;
  scene.add(ghost);

  return { SPARKS, sparkGeo, shards, glowShards, rings, boomLight, laser, laserMat, laserDot, ghost, unitRod, glowSprite };
}

/* ---------- everything ---------- */

export function buildWorld(renderer) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#150820', 20, 100);
  scene.background = new THREE.Color('#030309');

  const textures = {
    glow: glowTexture(),
    flash: flashTexture(),
    n: letterTexture('n', '#22d3ee'),
    concrete: concreteTexture(renderer),
  };

  const mats = {
    concrete: new THREE.MeshStandardMaterial({ map: textures.concrete, color: '#6c7384', roughness: 0.82, metalness: 0.15 }),
    pillar: new THREE.MeshStandardMaterial({ color: '#1a1e2a', metalness: 0.45, roughness: 0.6 }),
    armor: new THREE.MeshStandardMaterial({ color: '#a3acbf', metalness: 0.3, roughness: 0.42 }),
    plate: new THREE.MeshStandardMaterial({
      color: '#e0691c',
      metalness: 0.35,
      roughness: 0.38,
      emissive: '#ff6a00',
      emissiveIntensity: 0.4,
    }),
    dark: new THREE.MeshStandardMaterial({ color: '#2a2f3a', metalness: 0.6, roughness: 0.45 }),
    gunMetal: new THREE.MeshStandardMaterial({ color: '#262b34', metalness: 0.8, roughness: 0.3 }),
    gunPlate: new THREE.MeshStandardMaterial({ color: '#aeb6c4', metalness: 0.4, roughness: 0.35 }),
    tealDim: new THREE.MeshStandardMaterial({ color: '#08161b', metalness: 0.9, roughness: 0.15, emissive: TEAL, emissiveIntensity: 0.15 }),
    amberGlow: new THREE.MeshBasicMaterial({ color: hdr(AMBER, 5) }),
    redGlow: new THREE.MeshBasicMaterial({ color: hdr(RED, 5) }),
    tealGlow: new THREE.MeshBasicMaterial({ color: hdr(TEAL, 4) }),
    pinkGlow: new THREE.MeshBasicMaterial({ color: hdr(new THREE.Color('#ff3fa4'), 3) }),
  };

  scene.add(makeSky(), makeStars(), makeMountains());
  const sun = makeSun(textures.glow);
  scene.add(sun);
  scene.add(makeGround(renderer));
  const embers = makeEmbers(textures.glow);
  scene.add(embers);
  PILLARS.forEach((p) => scene.add(makePillar(p, mats)));
  const serif = (style) => `${style} 118px KaTeX_Main, Georgia, serif`;
  const ital = '118px KaTeX_Math, Georgia, serif';
  scene.add(
    makeSign(
      [
        ['x', serif('bold')],
        [' = ', serif('')],
        ['p', serif('bold')],
        [' + ', serif('')],
        ['t', ital],
        ['v', serif('bold')],
      ],
      '#22d3ee',
      -14,
      -44,
    ),
    makeSign(
      [
        ['a', ital],
        ['x', ital],
        [' + ', serif('')],
        ['b', ital],
        ['y', ital],
        [' + ', serif('')],
        ['c', ital],
        ['z', ital],
        [' = ', serif('')],
        ['d', ital],
      ],
      '#ff2d55',
      14,
      -44,
    ),
  );

  // light: a cool moon behind you, a pink rim from the sun, the sky
  scene.add(new THREE.HemisphereLight('#6d5ad8', '#1b0f26', 0.9));
  const moon = new THREE.DirectionalLight('#cdd6ff', 2.2);
  moon.position.set(-9, 16, 10);
  moon.target.position.set(0, 0, -13);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 60 });
  moon.shadow.bias = -0.0004;
  moon.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight('#ff4d8d', 1.1);
  rim.position.set(-30, 10, -60);
  rim.target.position.set(0, 0, -12);
  scene.add(moon, moon.target, rim, rim.target);

  const blocks = BLOCKS.map((b) => {
    const blk = makeBlock(b, mats, textures);
    scene.add(blk.group);
    return blk;
  });
  const robots = BLOCKS.map(() => {
    const r = makeRobot(mats);
    scene.add(r.root);
    return r;
  });

  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 1000);
  const gun = makeGun(mats, textures);
  camera.add(gun.pivot);
  const fill = new THREE.PointLight('#bfefff', 1.2, 2.5, 2);
  fill.position.set(-0.3, 0.25, 0.1);
  camera.add(fill);
  scene.add(camera);

  const fx = makeFx(scene, textures);

  // reflections for the metal: the sky, with a teal and a pink light strip
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(makeSky());
  const strip = (color, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(40, 3, 1), new THREE.MeshBasicMaterial({ color: hdr(new THREE.Color(color), 3) }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    envScene.add(m);
  };
  strip('#22d3ee', -60, 25, 40);
  strip('#ff3fa4', 60, 15, -50);
  strip('#ffd0a0', 0, 60, 0);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = 0.7;
  pmrem.dispose();

  return { scene, camera, blocks, robots, gun, fx, sun, embers, mats, textures };
}
