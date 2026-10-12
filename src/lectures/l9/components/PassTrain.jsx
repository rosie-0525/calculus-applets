import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PRINT } from './print.js';
import { X_R, Y_R, LAKE_Z, groundZ, farZ, inside, railroad, along, fbm, smoothstep } from './pass3d.js';

const STEP = 0.02; // the terrain's grid
const ZX = 1.8; // the heights, exaggerated
const FAR = { x: [-11, 15], y: [-9, 19], step: 0.12 }; // the land out to the horizon
const SPEED = 0.4; // units a second
const PAUSE = 1.2; // seconds with no train between runs
const TRAIN_SCALE = 1.7; // the train, the track and the portals, larger than life
const SMOKE_EVERY = 0.13; // seconds
const SMOKE_LIFE = 3;
const VIEW = { target: [-0.3, 0, 1.0], az: -35, el: 11, dist: 7.5, fov: 22 }; // from the west-southwest

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const mix = (a, b, t) => a + (b - a) * t;

// ---------- the terrain, cut for the railroad ----------

/** The heights on the grid, the railroad cut into them, and how far each vertex is from it. */
function buildHeights(rr) {
  const nx = Math.round((X_R[1] - X_R[0]) / STEP);
  const ny = Math.round((Y_R[1] - Y_R[0]) / STEP);
  const H = new Float32Array((nx + 1) * (ny + 1));
  const D = new Float32Array((nx + 1) * (ny + 1)).fill(9);
  // the railroad's points in bins of 0.2
  const B = 0.2;
  const bins = new Map();
  rr.pts.forEach(([x, y], k) => {
    const key = `${Math.floor(x / B)},${Math.floor(y / B)}`;
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(k);
  });
  const [iW, iE] = rr.portals;
  for (let j = 0; j <= ny; j += 1) {
    for (let i = 0; i <= nx; i += 1) {
      const x = X_R[0] + i * STEP;
      const y = Y_R[0] + j * STEP;
      let h = groundZ(x, y);
      let best = 9;
      let kb = -1;
      const bx = Math.floor(x / B);
      const by = Math.floor(y / B);
      for (let a = -1; a <= 1; a += 1) {
        for (let b = -1; b <= 1; b += 1) {
          for (const k of bins.get(`${bx + a},${by + b}`) ?? []) {
            const d = Math.hypot(x - rr.pts[k][0], y - rr.pts[k][1]);
            if (d < best) {
              best = d;
              kb = k;
            }
          }
        }
      }
      if (kb >= 0) {
        const zt = rr.pts[kb][2];
        if (kb <= iW || kb >= iE) {
          const bed = zt - 0.003;
          // rock under the track where the ground falls away, then the cut (or fill) of the grade
          if (bed - h < 0.05) h = Math.max(h, bed - (0.9 + 0.3 * fbm(9 * x, 9 * y, 2)) * Math.max(0, best - 0.05));
          h = bed + (h - bed) * smoothstep(0.04, 0.15, best);
          D[j * (nx + 1) + i] = best / TRAIN_SCALE;
        }
      }
      H[j * (nx + 1) + i] = h;
    }
  }
  return { H, D, nx, ny };
}

/** Granite, forest, meadow and snow, from the height, the slope and some noise. */
function cover(x, y, z, nz, north) {
  const rock = Math.max(smoothstep(0.97, 0.9, nz), 0.85 * smoothstep(0.08, 0.3, fbm(3.5 * x - 7, 3.5 * y + 3, 4)));
  const snow = smoothstep(0.98, 1.08, z + 0.1 * fbm(6 * x, 6 * y, 3) + 0.08 * north);
  const veg = (1 - rock) * (1 - snow) * smoothstep(0.7, 0.56, z);
  const forest = veg * smoothstep(-0.08, 0.2, fbm(2.6 * x + 40, 2.6 * y - 13, 4));
  return { rock, snow, veg, forest };
}

const GRANITE = new THREE.Color('#aca89d');
const GRANITE_DARK = new THREE.Color('#827e76');
const MEADOW = new THREE.Color('#7a8455');
const FOREST_FLOOR = new THREE.Color('#43553a');
const SNOW = new THREE.Color('#f1f4f6');
const SHORE = new THREE.Color('#9b937d');
const BALLAST = new THREE.Color('#857d70');

function terrainMesh(rr) {
  const { H, D, nx, ny } = buildHeights(rr);
  const n = (nx + 1) * (ny + 1);
  const pos = new Float32Array(3 * n);
  for (let j = 0; j <= ny; j += 1) {
    for (let i = 0; i <= nx; i += 1) {
      const k = j * (nx + 1) + i;
      pos[3 * k] = X_R[0] + i * STEP;
      pos[3 * k + 1] = Y_R[0] + j * STEP;
      pos[3 * k + 2] = H[k];
    }
  }
  const index = new Uint32Array(6 * nx * ny);
  let q = 0;
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      const a = j * (nx + 1) + i;
      index.set([a, a + 1, a + nx + 2, a, a + nx + 2, a + nx + 1], q);
      q += 6;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(new THREE.BufferAttribute(index, 1));
  geo.computeVertexNormals();
  const nrm = geo.getAttribute('normal');
  paint(geo, (k) => D[k] < 0.03);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return { mesh, H, nx, ny };
}

/** The colours of the vertices of a terrain geometry (unexaggerated), from its cover. */
function paint(geo, onTrack = () => false) {
  const pos = geo.getAttribute('position');
  const nrm = geo.getAttribute('normal');
  const col = new Float32Array(3 * pos.count);
  const c = new THREE.Color();
  const g = new THREE.Color();
  for (let k = 0; k < pos.count; k += 1) {
    const x = pos.getX(k);
    const y = pos.getY(k);
    const z = pos.getZ(k);
    const { rock, snow, forest } = cover(x, y, z, nrm.getZ(k), nrm.getY(k));
    c.copy(MEADOW).lerp(FOREST_FLOOR, forest);
    c.lerp(g.copy(GRANITE_DARK).lerp(GRANITE, 0.5 + 0.5 * fbm(9 * x + 2, 9 * y - 5, 3)), rock);
    c.lerp(SNOW, snow);
    if (z < LAKE_Z + 0.02) c.lerp(SHORE, smoothstep(LAKE_Z + 0.02, LAKE_Z + 0.005, z));
    if (onTrack(k)) c.lerp(BALLAST, 0.8);
    col.set([c.r, c.g, c.b], 3 * k);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

/** The land around the terrain's rectangle, coarser, out to the horizon (a hole in the middle). */
function farMesh() {
  const { x: XF, y: YF, step } = FAR;
  const nx = Math.round((XF[1] - XF[0]) / step);
  const ny = Math.round((YF[1] - YF[0]) / step);
  const pos = new Float32Array(3 * (nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j += 1) {
    for (let i = 0; i <= nx; i += 1) {
      const x = XF[0] + i * step;
      const y = YF[0] + j * step;
      // just under the fine terrain where they overlap
      pos.set([x, y, farZ(x, y) - 0.01 * smoothstep(-0.2, 0.1, inside(x, y))], 3 * (j * (nx + 1) + i));
    }
  }
  const index = [];
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      const x = XF[0] + (i + 0.5) * step;
      const y = YF[0] + (j + 0.5) * step;
      if (inside(x, y) > step) continue;
      const a = j * (nx + 1) + i;
      index.push(a, a + 1, a + nx + 2, a, a + nx + 2, a + nx + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  paint(geo);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

/** Pine trees where the cover is forest, as one instanced mesh. */
function treesMesh({ H, nx }) {
  const at = (x, y) => {
    if (inside(x, y) < STEP) return farZ(x, y);
    const i = Math.min(nx - 1, Math.max(0, Math.floor((x - X_R[0]) / STEP)));
    const j = Math.max(0, Math.floor((y - Y_R[0]) / STEP));
    const u = (x - X_R[0]) / STEP - i;
    const v = (y - Y_R[0]) / STEP - j;
    const h = (a, b) => H[(j + b) * (nx + 1) + i + a];
    return mix(mix(h(0, 0), h(1, 0), u), mix(h(0, 1), h(1, 1), u), v);
  };
  const lower = new THREE.ConeGeometry(0.0105, 0.03, 7);
  lower.rotateX(Math.PI / 2);
  lower.translate(0, 0, 0.019);
  const upper = new THREE.ConeGeometry(0.0072, 0.022, 7);
  upper.rotateX(Math.PI / 2);
  upper.translate(0, 0, 0.033);
  const geo = mergeGeometries([lower, upper]);
  const MAX = 5000;
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: '#ffffff' }), MAX);
  let seed = 12345;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const m = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const c = new THREE.Color();
  let count = 0;
  for (let k = 0; k < 90000 && count < MAX; k += 1) {
    const x = X_R[0] - 1.5 + rnd() * (X_R[1] - X_R[0] + 3);
    const y = Y_R[0] - 1.5 + rnd() * (Y_R[1] - Y_R[0] + 3);
    const z = at(x, y);
    if (z < LAKE_Z + 0.025) continue;
    const zx = (at(x + 0.03, y) - at(x - 0.03, y)) / 0.06;
    const zy = (at(x, y + 0.03) - at(x, y - 0.03)) / 0.06;
    const nz = 1 / Math.hypot(zx, zy, 1);
    const { forest } = cover(x, y, z, nz, -zy * nz);
    if (rnd() > forest * 1.1) continue;
    const s = 0.75 + 0.55 * rnd();
    quat.setFromAxisAngle(zAxis, rnd() * 6.28);
    m.compose(new THREE.Vector3(x, y, ZX * z - 0.004), quat, new THREE.Vector3(s, s, s * (0.9 + 0.4 * rnd())));
    mesh.setMatrixAt(count, m);
    c.set('#2c4a2c').lerp(new THREE.Color('#47663a'), rnd());
    mesh.setColorAt(count, c);
    count += 1;
  }
  mesh.count = count;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------- the railroad ----------

/** A strip along the railroad (outside the tunnel), `off` to the side, `dz` above the grade. */
function strip(rr, k0, k1, width, off, dz, color, offset) {
  const pos = [];
  const index = [];
  for (let k = k0; k <= k1; k += 1) {
    const a = rr.pts[Math.max(k0, k - 1)];
    const b = rr.pts[Math.min(k1, k + 1)];
    const t = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(...t) || 1;
    const nrm = [-t[1] / l, t[0] / l];
    const [x, y, z] = rr.pts[k];
    for (const side of [-1, 1]) {
      const o = off + (side * width) / 2;
      pos.push(x + nrm[0] * o, y + nrm[1] * o, z + dz);
    }
    if (k > k0) {
      const v = 2 * (k - k0);
      index.push(v - 2, v - 1, v + 1, v - 2, v + 1, v);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({
    color,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: offset,
    polygonOffsetUnits: offset,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function trackGroup(rr) {
  const g = new THREE.Group();
  const [iW, iE] = rr.portals;
  for (const [k0, k1] of [
    [0, iW],
    [iE, rr.pts.length - 1],
  ]) {
    const k = TRAIN_SCALE;
    g.add(strip(rr, k0, k1, 0.032 * k, 0, 0.0, '#9a9285', -1));
    g.add(strip(rr, k0, k1, 0.022 * k, 0, 0.0008, '#6e5c49', -2));
    g.add(strip(rr, k0, k1, 0.0018 * k, -0.0085 * k, 0.0022, '#2a2a2a', -3));
    g.add(strip(rr, k0, k1, 0.0018 * k, 0.0085 * k, 0.0022, '#2a2a2a', -3));
  }
  return g;
}

/** A stone portal at point k of the railroad, facing `out` (+1: along the railroad, −1: back). */
function portal(rr, k, out) {
  const p = rr.pts[k];
  const q = rr.pts[k + out];
  const u = new THREE.Vector3(q[0] - p[0], q[1] - p[1], 0).normalize();
  const across = new THREE.Vector3(-u.y, u.x, 0);
  const up = new THREE.Vector3(0, 0, 1);
  const g = new THREE.Group();
  const ts = TRAIN_SCALE;
  const wallH = 0.085 * ts;
  const thick = 0.014 * ts;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(thick, 0.1 * ts, wallH), new THREE.MeshLambertMaterial({ color: '#b9b2a2' }));
  wall.castShadow = true;
  wall.receiveShadow = true;
  wall.position.set(thick / 2, 0, wallH / 2 - 0.01 * ts);
  g.add(wall);
  const r = 0.02 * ts;
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0);
  shape.lineTo(r, 0);
  shape.lineTo(r, 0.034 * ts);
  shape.absarc(0, 0.034 * ts, r, 0, Math.PI, false);
  shape.lineTo(-r, 0);
  const arch = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), new THREE.MeshBasicMaterial({ color: '#0b0b0c' }));
  // the arch's plane: its x across, its y up, facing out
  arch.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
  arch.position.set(thick + 0.0004, 0, -0.002);
  g.add(arch);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, across, up));
  g.position.set(p[0], p[1], ZX * p[2]);
  return g;
}

// ---------- the train ----------
const mats = new Map();
const mat = (color, emissive) => {
  const key = `${color}${emissive ?? ''}`;
  if (!mats.has(key)) mats.set(key, new THREE.MeshLambertMaterial({ color, emissive: emissive ?? '#000000' }));
  return mats.get(key);
};
function part(geo, color, [x, y, z], emissive) {
  const m = new THREE.Mesh(geo, mat(color, emissive));
  m.position.set(x, y, z);
  return m;
}
const box = (w, d, h, color, at, emissive) => part(new THREE.BoxGeometry(w, d, h), color, at, emissive);
/** A cylinder along the axis 'x', 'y' or 'z'. */
function cyl(r0, r1, len, color, axis, at) {
  const geo = new THREE.CylinderGeometry(r0, r1, len, 18);
  if (axis === 'x') geo.rotateZ(-Math.PI / 2);
  if (axis === 'z') geo.rotateX(Math.PI / 2);
  return part(geo, color, at);
}
const wheels = (g, xs, r, color) =>
  xs.forEach((x) => [-0.0085, 0.0085].forEach((y) => g.add(cyl(r, r, 0.002, color, 'y', [x, y, r]))));

const RED = '#8c1515';
/** A 4-4-0 locomotive of the 1860s, forward along +x, on the rails at the origin. */
function locomotive() {
  const g = new THREE.Group();
  g.add(box(0.075, 0.016, 0.006, '#1a1a1a', [0, 0, 0.011]));
  g.add(cyl(0.0085, 0.0085, 0.044, '#1d2633', 'x', [0.01, 0, 0.024]));
  [0, 0.02].forEach((x) => g.add(cyl(0.0089, 0.0089, 0.0016, '#b8913f', 'x', [x, 0, 0.024])));
  g.add(cyl(0.009, 0.009, 0.012, '#121212', 'x', [0.036, 0, 0.024]));
  g.add(cyl(0.0088, 0.0038, 0.016, '#121212', 'z', [0.036, 0, 0.04]));
  g.add(cyl(0.0094, 0.0088, 0.003, '#121212', 'z', [0.036, 0, 0.0495]));
  g.add(part(new THREE.SphereGeometry(0.0042, 14, 10), '#b8913f', [0.013, 0, 0.033]));
  g.add(box(0.009, 0.009, 0.009, '#b8913f', [0.043, 0, 0.037]));
  g.add(box(0.001, 0.0062, 0.0062, '#fff2b0', [0.0476, 0, 0.037], '#c9a43a'));
  g.add(box(0.022, 0.022, 0.026, '#7a1d1d', [-0.024, 0, 0.029]));
  g.add(box(0.009, 0.0225, 0.007, '#e3cf94', [-0.022, 0, 0.034]));
  g.add(box(0.027, 0.026, 0.003, '#2a2a2a', [-0.024, 0, 0.0435]));
  const pilot = box(0.012, 0.018, 0.008, RED, [0.045, 0, 0.006]);
  pilot.rotation.y = 0.5;
  g.add(pilot);
  wheels(g, [-0.003, -0.019], 0.0072, RED);
  wheels(g, [0.024, 0.035], 0.0042, RED);
  return g;
}
function tender() {
  const g = new THREE.Group();
  g.add(box(0.044, 0.016, 0.004, '#1a1a1a', [0, 0, 0.009]));
  g.add(box(0.042, 0.021, 0.016, '#2c2f36', [0, 0, 0.019]));
  g.add(box(0.03, 0.017, 0.007, '#6b4a2b', [0.002, 0, 0.0295]));
  wheels(g, [-0.014, -0.006, 0.006, 0.014], 0.004, '#1a1a1a');
  return g;
}
function coach() {
  const g = new THREE.Group();
  g.add(box(0.07, 0.016, 0.004, '#1a1a1a', [0, 0, 0.01]));
  g.add(box(0.072, 0.021, 0.02, '#b7793f', [0, 0, 0.022]));
  g.add(box(0.064, 0.0215, 0.006, '#3a2b1f', [0, 0, 0.026]));
  g.add(box(0.075, 0.024, 0.004, '#4a3a2c', [0, 0, 0.034]));
  g.add(box(0.06, 0.012, 0.004, '#4a3a2c', [0, 0, 0.037]));
  wheels(g, [-0.03, -0.021, 0.021, 0.03], 0.004, '#1a1a1a');
  return g;
}
const CARS = [
  { make: locomotive, len: 0.08 },
  { make: tender, len: 0.045 },
  { make: coach, len: 0.075 },
  { make: coach, len: 0.075 },
  { make: coach, len: 0.075 },
];
const GAP = 0.005;
// each car's centre, behind the front of the train (before scaling)
const OFFSETS = (() => {
  let at = 0;
  return CARS.map(({ len }) => {
    const c = at + len / 2;
    at += len + GAP;
    return c;
  });
})();
const TRAIN_LEN = TRAIN_SCALE * (OFFSETS[OFFSETS.length - 1] + CARS[CARS.length - 1].len / 2);
const STACK = [0.036, 0.052]; // the top of the stack, ahead of the locomotive's centre and up

/** A soft white puff, for the smoke. */
function puffTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 31);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * The cartoon of Donner Pass in three.js: the crest between two peaks, the railroad climbing from
 * the west, through a tunnel under the pass, and along the north side of Donner Lake. `setTime(t)`
 * puts the train (and its smoke) where it is t seconds into the loop, then `render()`.
 */
export class PassScene {
  constructor(canvas, { width, height, pixelRatio = 2, preserve = false }) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: preserve });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog('#dbe5ed', 6, 22);

    const { target, az, el, dist, fov } = VIEW;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.05, 50);
    this.camera.up.set(0, 0, 1);
    const A = (az * Math.PI) / 180;
    const E = (el * Math.PI) / 180;
    this.camera.position.set(
      target[0] + dist * Math.sin(A) * Math.cos(E),
      target[1] - dist * Math.cos(A) * Math.cos(E),
      target[2] + dist * Math.sin(E),
    );
    this.camera.lookAt(...target);
    this.camera.updateMatrixWorld();

    this.scene.add(new THREE.HemisphereLight('#dfe9f3', '#5d5644', 1.15));
    const sun = new THREE.DirectionalLight('#fff0d8', 2.7);
    sun.position.set(0.6, -3.6, 2.4); // from the south: the slopes facing the west lit from the side
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 20 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight('#e6eef6', 0.7); // from the viewer's side, into the cuts
    fill.position.set(-3, -1.5, 1.5);
    this.scene.add(fill);

    const rr = railroad();
    this.rr = rr;
    // the land, drawn at its true plan and ZX times its height
    const land = new THREE.Group();
    land.scale.set(1, 1, ZX);
    this.scene.add(land);
    const terrain = terrainMesh(rr);
    land.add(terrain.mesh);
    land.add(farMesh());
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(FAR.x[1] - FAR.x[0], FAR.y[1] - FAR.y[0]),
      new THREE.MeshPhongMaterial({ color: '#3d6d8c', specular: '#a9c9de', shininess: 70 }),
    );
    water.position.set((FAR.x[0] + FAR.x[1]) / 2, (FAR.y[0] + FAR.y[1]) / 2, LAKE_Z);
    water.receiveShadow = true;
    land.add(water);
    land.add(trackGroup(rr));
    this.scene.add(treesMesh(terrain));
    const [iW, iE] = rr.portals;
    this.scene.add(portal(rr, iW, -1));
    this.scene.add(portal(rr, iE, 1));

    this.cars = CARS.map(({ make }) => {
      const c = make();
      c.scale.setScalar(TRAIN_SCALE);
      this.scene.add(c);
      return c;
    });
    // in the tunnel, the train shows faintly through the mountain (only where it is hidden)
    const ghost = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      depthFunc: THREE.GreaterDepth,
      fog: false,
    });
    this.ghosts = this.cars.map((car) => {
      const g = car.clone();
      g.traverse((o) => {
        if (o.isMesh) o.material = ghost;
      });
      g.renderOrder = 10;
      this.scene.add(g);
      return g;
    });
    const tex = puffTexture();
    this.puffs = Array.from({ length: Math.ceil(SMOKE_LIFE / SMOKE_EVERY) + 1 }, () => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#eeeeee', transparent: true, depthWrite: false, fog: true }));
      this.scene.add(sp);
      return sp;
    });

    // the train runs from where the railroad comes into the picture to where it leaves it
    const inView = rr.pts.map((p) => {
      const v = new THREE.Vector3(p[0], p[1], ZX * p[2]).project(this.camera);
      return Math.abs(v.x) < 1.04 && Math.abs(v.y) < 1.1;
    });
    const first = inView.indexOf(true);
    const last = inView.lastIndexOf(true);
    this.sIn = rr.s[Math.max(0, first)];
    this.sOut = Math.min(rr.s[Math.max(first, last)], rr.tunnel[1]) + TRAIN_LEN;
    this.period = (this.sOut - this.sIn) / SPEED + PAUSE;
  }

  /** The arc length of the front of the train at time t (it may be past the end: no train). */
  head(t) {
    const u = ((t % this.period) + this.period) % this.period;
    return this.sIn + SPEED * u;
  }

  setTime(t) {
    const { rr } = this;
    const front = this.head(t);
    const X = new THREE.Vector3();
    const Y = new THREE.Vector3();
    const Z = new THREE.Vector3(0, 0, 1);
    const m = new THREE.Matrix4();
    this.cars.forEach((car, n) => {
      const c = front - TRAIN_SCALE * OFFSETS[n];
      const half = (TRAIN_SCALE * CARS[n].len) / 3;
      const a = along(rr, c - half).p;
      const b = along(rr, c + half).p;
      car.visible = c - half > rr.s[0] && c + half < rr.s[rr.s.length - 1] && front <= this.sOut;
      car.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (ZX * (a[2] + b[2])) / 2);
      X.set(b[0] - a[0], b[1] - a[1], ZX * (b[2] - a[2])).normalize();
      Y.crossVectors(Z, X).normalize();
      m.makeBasis(X, Y, new THREE.Vector3().crossVectors(X, Y));
      car.quaternion.setFromRotationMatrix(m);
      const g = this.ghosts[n];
      g.visible = car.visible && c > rr.tunnel[0] - half && c < rr.tunnel[1] + half;
      g.position.copy(car.position);
      g.quaternion.copy(car.quaternion);
    });
    // the smoke: a puff every SMOKE_EVERY seconds from the stack, while it is out of the tunnel
    const [s0, s1] = rr.tunnel;
    const newest = Math.floor(t / SMOKE_EVERY);
    this.puffs.forEach((sp, n) => {
      const te = (newest - n) * SMOKE_EVERY;
      const age = t - te;
      const f = this.head(te);
      const at = f - TRAIN_SCALE * (OFFSETS[0] - STACK[0]);
      const out = (at < s0 || at > s1) && f <= this.sOut && at > rr.s[0] && at < rr.s[rr.s.length - 1];
      sp.visible = out && te >= 0 && age < SMOKE_LIFE;
      if (!sp.visible) return;
      const p = along(rr, at).p;
      const k = age / SMOKE_LIFE;
      const rise = 0.22 * (1 - Math.exp(-age / 1.1));
      sp.position.set(p[0] - 0.03 * age, p[1] + 0.03 * age, ZX * p[2] + TRAIN_SCALE * STACK[1] + rise);
      const size = TRAIN_SCALE * (0.016 + 0.075 * k ** 0.6);
      sp.scale.set(size, size, 1);
      sp.material.opacity = 0.6 * (1 - k) ** 1.6 * Math.min(1, age / 0.15);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    const shared = new Set(mats.values()); // the train's materials, kept for the next scene
    this.scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material && !shared.has(o.material)) o.material.dispose?.();
    });
    this.renderer.dispose();
  }
}

/** The time of the still (print mode, reduced motion): the train climbing to the west portal. */
const stillTime = (s) => (s.rr.tunnel[0] - 0.35 - s.sIn) / SPEED;

/** The picture as a PNG data URL, for print mode. */
function passStill(width, height) {
  const canvas = document.createElement('canvas');
  const s = new PassScene(canvas, { width, height, preserve: true });
  s.setTime(stillTime(s));
  s.render();
  const url = canvas.toDataURL('image/png');
  s.renderer.forceContextLoss();
  s.dispose();
  return url;
}

const isShowing = (el) => {
  const frag = el?.closest('.fragment');
  return el?.closest('section')?.classList.contains('present') && (!frag || frag.classList.contains('visible'));
};

/**
 * The train over Donner Pass, animated while it shows (from the start each time it comes into
 * view); a still in print mode and under prefers-reduced-motion.
 */
export default function PassTrain({ width = 772, height = 290, title }) {
  const canvasRef = useRef(null);
  const still = useMemo(() => (PRINT ? passStill(width, height) : null), [width, height]);

  useEffect(() => {
    if (PRINT) return undefined;
    let scene = null;
    let id;
    let start = null;
    let built = false;
    const build = () => {
      if (built) return;
      built = true;
      try {
        scene = new PassScene(canvasRef.current, { width, height });
      } catch (err) {
        console.error('3-D view unavailable:', err);
      }
    };
    // build the scene once the deck is up, before the slide is reached
    const idle = setTimeout(build, 1500);
    const tick = (now) => {
      if (isShowing(canvasRef.current)) {
        build();
        if (scene) {
          if (start === null) start = now;
          scene.setTime(reducedMotion() ? stillTime(scene) : (now - start) / 1000);
          scene.render();
        }
      } else {
        start = null;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      clearTimeout(idle);
      cancelAnimationFrame(id);
      scene?.dispose();
    };
  }, [width, height]);

  if (PRINT) return <img className="pass-train" src={still} width={width} height={height} alt={title} />;
  return <canvas ref={canvasRef} className="pass-train" style={{ width, height }} role="img" aria-label={title} />;
}
