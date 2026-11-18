import * as THREE from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { W, H, K, RAYS, CAMERA, WALL_X, WALL_Z, WALL_R, WINDOW, PRISM_X, PRISM_Z, BL, BR, APEX, N_LEFT, N_RIGHT, P0, S0, LEN, BEAM, BEAM_Y, SHEET_Z } from './prismOptics.js';

// The Spectral Theorem's picture as a three.js scene (the user's request: built like Lecture 9's
// train over Donner Pass, PassTrain.jsx, "a much better implementation"; it was one fragment shader
// that computed every pixel from formulas). The room is made of real things, lit and shaded by
// three.js: three painted walls, a sash window with its reveal, sill and frame (the day outside is a
// picture behind it), a wooden table, and a prism of glass (it lets the room through, bent, and
// mirrors the window; its edges are bevelled and catch the light) that casts a soft shadow.
// What three.js has no notion of is drawn by materials of our own, on top of the scene:
// - the light in the air, three volumes (the white sheet from the window to the prism, the colours in
//   the glass, the fan of colours from the prism to the wall): for the ray through each pixel, the glow
//   of the sheets it crosses in the haze, added up (prismOptics.js traces the K colours); it is faint
//   and soft-sided, and only brightens what is behind it;
// - the light spectrum, a patch on the wall facing the window: where the colours land, bright, they take
//   the place of the wall's own colour.
// The light comes in at its own pace (uHead, n times slower in the glass); the haze drifts and its
// dust twinkles (uTime).

const f = (x) => x.toFixed(5);
const v2 = (a) => `vec2(${f(a[0])}, ${f(a[1])})`;
const MID = RAYS[K >> 1];
const RED = RAYS[0];
const VIOLET = RAYS[K - 1];
/** How long (in optical path) a colour takes to come up on the wall, once it gets there. */
export const RAMP = 1.5;
// the two sides of a sheet of light are soft: it fades out from z = ±(SHEET_Z - ZS) to ±(SHEET_Z + ZS)
const ZS = 0.14;
const SZS = SHEET_Z + ZS;

// ---------- the materials of the light ----------

const VERTEX = `
varying vec3 vWorld;
void main() {
  vec4 p = modelMatrix * vec4(position, 1.0);
  vWorld = p.xyz;
  gl_Position = projectionMatrix * viewMatrix * p;
}`;

const COMMON = `
#define K ${K}
uniform float uTime;  // seconds: the haze drifts, the dust twinkles
uniform float uHead;  // how far the light has come (optical path length); negative: no light yet
uniform vec4 uA[K];   // each colour: where it leaves the glass (x, y), its direction after
uniform vec4 uB[K];   // its direction in the glass, the glass's index for it, its optical path so far
uniform vec4 uC[K];   // its sheet's half-thickness in the glass and after, its brightness there
uniform vec4 uD[K];   // its colour, where it lands on the wall (y)
varying vec3 vWorld;

const float XW = ${f(WALL_X)};     // the wall with the window
const float WD = ${f(WINDOW.depth)};
const float XF = ${f(WALL_R)};     // the wall facing the window
const vec2 BL = ${v2(BL)};         // the prism's section: its base's ends, its faces' normals
const vec2 BR = ${v2(BR)};
const vec2 NL = ${v2(N_LEFT)};
const vec2 NR = ${v2(N_RIGHT)};
const float SZ = ${f(SHEET_Z)};    // the light: from z = -SZ to SZ, its two sides soft (ZS)
const float ZS = ${f(ZS)};
const float SZS = ${f(SZS)};
const vec2 P0 = ${v2(P0)};
const vec2 S0 = ${v2(S0)};
const vec2 QM = ${v2(MID.q)};
const float OPLQ = ${f(MID.oplQ)};
const float LEN = ${f(LEN)};
const float BEAM = ${f(BEAM)};

const float SOFT = 1.0;     // the light's head is soft
const float RAMP = ${f(RAMP)};
const float EDGE = 0.4;     // how soft a sheet's two faces are
const vec3 SUN = vec3(1.0, 0.965, 0.9);   // sunlight in the haze: a little warm

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// the haze in the air (slow smoke, about 1 on average) and its dust: one mote to a cell, drifting
// round and twinkling; both show only where light falls on them
float dust(vec2 p) {
  vec2 h = p * 1.05 + vec2(0.030, -0.018) * uTime;
  float s = 0.5 * noise(h) + 0.25 * noise(h * 2.03 + 17.3) + 0.125 * noise(h * 4.1 + 31.0);
  vec2 g = p / 0.26;
  vec2 id = floor(g);
  float m = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = id + vec2(float(i), float(j));
      float r = hash(c);
      vec2 o = vec2(hash(c + 7.7), hash(c + 3.1));
      o += 0.34 * vec2(sin(uTime * (0.21 + 0.33 * r) + 6.28 * r), cos(uTime * (0.17 + 0.29 * o.x) + 6.28 * o.y));
      vec2 e = (g - c - o) * 26.0;
      float twinkle = 0.5 + 0.5 * sin(uTime * (0.9 + 2.1 * r) + 40.0 * r);
      m += twinkle * twinkle * exp(-dot(e, e) / (0.5 + 0.9 * r));
    }
  }
  return 0.72 + 0.64 * s + 1.5 * m;
}
float erf(float x) {
  float x2 = x * x;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));
}
// the integral of erf
float ierf(float x) {
  return x * erf(x) + 0.5641896 * exp(-x * x);
}
// A sheet of light is even across its thickness, with soft faces: its brightness u half-thicknesses
// from its middle, and the mean of that for u from a to b.
float across(float u) {
  return 0.5 * (erf((u + 1.0) / EDGE) - erf((u - 1.0) / EDGE));
}
float bell(float a, float b) {
  float d = b - a;
  if (abs(d) < 0.05) return across(0.5 * (a + b));
  return 0.5 * EDGE * (ierf((b + 1.0) / EDGE) - ierf((b - 1.0) / EDGE) - ierf((a + 1.0) / EDGE) + ierf((a - 1.0) / EDGE)) / d;
}
// 1 where the light has already come, 0 ahead of it
float arrived(float opl) {
  return 1.0 - smoothstep(uHead - SOFT, uHead, opl);
}
// how bright a sheet is at z: 1 in the middle, fading out round z = -SZ and SZ, its two sides
float side(float z) {
  return 1.0 - smoothstep(SZ - ZS, SZ + ZS, abs(z));
}
// The ray from the camera through this pixel, while z is between -SZS and SZS (where a sheet's two
// sides have faded out) and before it meets the table or the wall facing the window: from a to b,
// len long. False if it has no such stretch.
bool stretch(out vec3 a, out vec3 b, out float len) {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - cameraPosition);
  if (abs(rd.z) < 1e-4) return false;
  float t1 = (-SZS - ro.z) / rd.z;
  float t2 = (SZS - ro.z) / rd.z;
  float ta = max(min(t1, t2), 0.0);
  float tb = max(t1, t2);
  if (rd.y < 0.0) tb = min(tb, -ro.y / rd.y);
  if (rd.x > 0.0) tb = min(tb, (XF - ro.x) / rd.x);
  if (tb <= ta) return false;
  a = ro + ta * rd;
  b = ro + tb * rd;
  len = tb - ta;
  return true;
}
// A sheet of light: in the xy-plane a strip through q along d, half-thickness w. Along the stretch
// from a to b: how bright the sheet is, on average, and where the ray crosses its middle (at).
float strip(vec3 a, vec3 b, vec2 q, vec2 d, float w, out vec2 at) {
  vec2 n = vec2(-d.y, d.x);
  float da = dot(a.xy - q, n);
  float db = dot(b.xy - q, n);
  float den = da - db;
  bool crosses = abs(den) > 1e-6;
  at = mix(a.xy, b.xy, crosses ? clamp(da / den, 0.0, 1.0) : 0.5);
  // the sheet's sides are soft: how bright it is, on average, over the part of the stretch inside it
  float s1 = crosses ? clamp((da - w) / den, 0.0, 1.0) : 0.0;
  float s2 = crosses ? clamp((da + w) / den, 0.0, 1.0) : 1.0;
  float soft = (side(mix(a.z, b.z, s1)) + 4.0 * side(mix(a.z, b.z, 0.5 * (s1 + s2))) + side(mix(a.z, b.z, s2))) / 6.0;
  return bell(da / w, db / w) * soft;
}
// The glow of the light in the air, as the screen shows it: faint light is helped a little (GAMMA),
// its colour kept, so that the fan still shows where it has opened wide.
vec3 glow(vec3 sum, float gain) {
  float top = max(sum.r, max(sum.g, sum.b));
  if (top < 1e-6) return vec3(0.0);
  return sum * (gain * pow(top, GAMMA - 1.0));
}`;

// the white light, level, from the window's glass to the prism, and a little of it scattered round it
const WHITE = `
const float GAMMA = 1.0;
${COMMON}
uniform float uAir;
void main() {
  vec3 a;
  vec3 b;
  float len;
  if (!stretch(a, b, len)) discard;
  vec2 at;
  float g = strip(a, b, S0, vec2(1.0, 0.0), BEAM, at);
  vec2 wide;
  g += 0.05 * strip(a, b, S0, vec2(1.0, 0.0), 4.0 * BEAM, wide);
  g *= smoothstep(XW - WD, XW - WD + 0.3, at.x) * smoothstep(0.0, 0.03, dot(at - BL, NL)) * arrived(at.x - XW);
  gl_FragColor = vec4(glow(vec3(len * g), uAir) * dust(0.5 * (a.xy + b.xy)) * SUN, 1.0);
}`;

// the colours, from the prism to the wall
const FAN = `
const float GAMMA = 0.7;
${COMMON}
uniform float uAir;
void main() {
  vec3 a;
  vec3 b;
  float len;
  if (!stretch(a, b, len)) discard;
  vec2 at;
  vec3 sum = vec3(0.0);
  for (int k = 0; k < K; k++) {
    vec2 q = uA[k].xy;
    vec2 d = uA[k].zw;
    float g = strip(a, b, q, d, uC[k].y, at);
    sum += uD[k].rgb * (uC[k].w * g * smoothstep(0.0, 0.03, dot(at - BR, NR)) * arrived(uB[k].w + dot(at - q, d)));
  }
  gl_FragColor = vec4(glow(len * sum, uAir) * dust(0.5 * (a.xy + b.xy)) * SUN, 1.0);
}`;

// the colours in the glass, between the two faces, and the glint of each face where the sheet crosses it
const INSIDE = `
const float GAMMA = 1.0;
${COMMON}
uniform float uGlass;
uniform float uGlint;
// how near the ray passes the line along z through c (in the xy-plane), where the sheet is
float glint(vec3 ro, vec3 rd, vec2 c) {
  vec2 v = c - ro.xy;
  float l2 = max(dot(rd.xy, rd.xy), 1e-6);
  float t = dot(v, rd.xy) / l2;
  return exp(-(dot(v, v) - t * t * l2) / 0.0005) * side(ro.z + t * rd.z);
}
void main() {
  vec3 col = vec3(0.0);
  vec3 a;
  vec3 b;
  float len;
  if (stretch(a, b, len)) {
    vec2 at;
    vec3 sum = vec3(0.0);
    for (int k = 0; k < K; k++) {
      vec2 d = uB[k].xy;
      float g = strip(a, b, P0, d, uC[k].x, at);
      float inside = smoothstep(0.0, 0.02, -dot(at - BL, NL)) * smoothstep(0.0, 0.02, -dot(at - BR, NR));
      sum += uD[k].rgb * (uC[k].z * g * inside * arrived(LEN + uB[k].z * dot(at - P0, d)));
    }
    col = glow(len * sum, uGlass) * SUN;
  }
  vec3 rd = normalize(vWorld - cameraPosition);
  col += uGlint * vec3(1.0, 0.985, 0.96) * (
    glint(cameraPosition, rd, P0) * smoothstep(LEN - 0.2, LEN + 0.4, uHead)
    + 0.75 * glint(cameraPosition, rd, QM) * smoothstep(OPLQ - 0.2, OPLQ + 0.5, uHead));
  gl_FragColor = vec4(col, 1.0);
}`;

// the light spectrum on the wall: each colour's sheet lands as a soft stripe, one above the other;
// where the light is strong, it takes the place of the wall's own colour (as on film, exposed for it)
const SPECTRUM = `
const float GAMMA = 1.0;
${COMMON}
uniform float uRain;
const float BLUR = 2.0;     // the wall's paint spreads the light that lands on it a little
void main() {
  vec3 p = vWorld;
  float band = side(p.z);
  float halo = exp(-max(abs(p.z) - SZ, 0.0) / 0.22);
  vec3 e = vec3(0.0);
  for (int k = 0; k < K; k++) {
    float cx = uA[k].z;   // how squarely the colour meets the wall
    float y = (p.y - uD[k].w) * cx / (BLUR * uC[k].y);
    e += uD[k].rgb * (uC[k].w * cx / BLUR * exp(-y * y) * smoothstep(0.0, RAMP, uHead - uB[k].w - (XF - uA[k].x) / cx));
  }
  e *= uRain * (band + 0.07 * halo);
  float top = max(e.r, max(e.g, e.b));
  if (top < 2e-3) discard;
  vec3 hue = mix(e / top, vec3(1.0), 0.05);
  gl_FragColor = vec4(pow(hue, vec3(1.0 / 2.2)), 1.0 - exp(-top));
}`;

// ---------- the room's textures, painted once ----------

let cache = null;
const rand = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
const sheet = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};
// the table spans TABLE_W along x and TABLE_D along z (from the wall behind it towards the camera)
const TABLE_W = WALL_R - WALL_X;
const TABLE_D = 12;
const BOARD = 0.74; // a board's width
const EDGE_R = 0.01; // the prism's ground edges

/** The table's wood: boards along x, their grain, the joints between them, and the dark where the prism stands. */
function woodCanvas() {
  const N = 2048;
  const [c, x] = sheet(N, N);
  const r = rand(7);
  const u = N / TABLE_W; // pixels a unit; the picture is TABLE_W square, and repeats along z
  x.fillStyle = '#c59a66';
  x.fillRect(0, 0, N, N);
  const rows = Math.ceil(TABLE_W / BOARD);
  for (let row = 0; row < rows; row += 1) {
    const y0 = row * BOARD * u;
    const h = BOARD * u;
    const tone = r();
    // the board's own tone
    x.fillStyle = `hsl(${30 + 3 * tone}, ${40 + 6 * r()}%, ${60 + 5 * tone}%)`;
    x.fillRect(0, y0, N, h);
    // its grain: long thin streaks, lighter and darker
    for (let n = 0; n < 420; n += 1) {
      const len = (0.4 + 3.2 * r()) * u;
      const gx = r() * (N + len) - len;
      const gy = y0 + r() * h;
      const dark = r() < 0.62;
      x.fillStyle = dark ? `rgba(104, 66, 30, ${0.03 + 0.09 * r()})` : `rgba(255, 236, 200, ${0.03 + 0.08 * r()})`;
      x.fillRect(gx, gy, len, 0.6 + 2.2 * r());
    }
    // a few wide bands of the grain
    for (let n = 0; n < 9; n += 1) {
      x.fillStyle = `rgba(120, 78, 38, ${0.02 + 0.05 * r()})`;
      x.fillRect(0, y0 + r() * h, N, 4 + 14 * r());
    }
    // the joint with the next board
    const g = x.createLinearGradient(0, y0 + h - 5, 0, y0 + h);
    g.addColorStop(0, 'rgba(60, 38, 18, 0)');
    g.addColorStop(1, 'rgba(60, 38, 18, 0.34)');
    x.fillStyle = g;
    x.fillRect(0, y0 + h - 5, N, 5);
    x.fillStyle = 'rgba(255, 240, 214, 0.16)';
    x.fillRect(0, y0, N, 2);
  }
  return c;
}

/**
 * A wall's shading where it meets its neighbours, which three.js's lights do not give: darker towards
 * the table (the bottom of the picture) and towards the corners named in `corners` ('l', 'r').
 */
function wallCanvas(width, height, corners) {
  const [c, x] = sheet(512, 512);
  x.fillStyle = '#fff';
  x.fillRect(0, 0, 512, 512);
  const shade = (x0, y0, x1, y1, a) => {
    const g = x.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(52, 62, 78, ${a})`);
    g.addColorStop(0.35, `rgba(52, 62, 78, ${a * 0.35})`);
    g.addColorStop(1, 'rgba(52, 62, 78, 0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 512);
  };
  shade(0, 512, 0, 512 - (512 * 1.3) / height, 0.3);
  if (corners.includes('l')) shade(0, 0, (512 * 1.5) / width, 0, 0.3);
  if (corners.includes('r')) shade(512, 0, 512 - (512 * 1.5) / width, 0, 0.3);
  return c;
}

/** The day outside the window, out of focus: the sky, paler towards the horizon, and the garden. */
function dayCanvas() {
  const [c, x] = sheet(256, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.2, '#bcd9f8');
  g.addColorStop(0.42, '#e3effc');
  g.addColorStop(0.58, '#fbfdff');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 512);
  // the garden: pale, as the day outside is far brighter than the room
  const r = rand(3);
  x.filter = 'blur(12px)';
  for (let n = 0; n < 60; n += 1) {
    x.fillStyle = `hsla(${88 + 34 * r()}, ${30 + 22 * r()}%, ${70 + 16 * r()}%, 0.8)`;
    x.beginPath();
    x.ellipse(r() * 256, 352 + 90 * r() * r(), 18 + 30 * r(), 12 + 22 * r(), 0, 0, 7);
    x.fill();
  }
  x.fillStyle = 'hsla(100, 34%, 76%, 0.95)';
  x.fillRect(-20, 410, 300, 140);
  return c;
}

/** The soft dark under the prism, where it stands on the table (the alpha of a black patch). */
function footCanvas() {
  const [c, x] = sheet(256, 256);
  x.filter = 'blur(14px)';
  x.fillStyle = '#000';
  x.fillRect(44, 60, 168, 136);
  return c;
}

function pictures() {
  if (!cache) cache = { wood: woodCanvas(), day: dayCanvas(), foot: footCanvas() };
  return cache;
}

// ---------- the shapes ----------

/** A box from (x0, y0, z0) to (x1, y1, z1). */
function box(mat, [x0, y0, z0], [x1, y1, z1]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return m;
}

/**
 * A piece of the light's path, seen from the front: the region of the xy-plane between the edges
 * left = [low, high] and right = [low, high], from z = -SZS to SZS (a convex solid with 8 corners).
 */
function slab(left, right) {
  const pts = [];
  for (const [lo, hi] of [left, right]) for (const p of [lo, hi]) for (const z of [-SZS, SZS]) pts.push(new THREE.Vector3(p[0], p[1], z));
  const centre = pts.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / 8);
  // its six faces, each turned to face outwards
  const faces = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
  const index = [];
  const n = new THREE.Vector3();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  for (const [a, b, c, d] of faces) {
    n.crossVectors(e1.subVectors(pts[b], pts[a]), e2.subVectors(pts[c], pts[a]));
    const out = n.dot(e1.subVectors(pts[a], centre)) > 0;
    index.push(...(out ? [a, b, c, a, c, d] : [a, c, b, a, d, c]));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3));
  geo.setIndex(index);
  return geo;
}

/** The glass prism: its section, the triangle BL, BR, APEX with its corners rounded, drawn out along z, its ends bevelled. */
function prismGeometry() {
  const R = 0.022; // the corners' radius, and the bevel
  const corners = [BL, BR, APEX];
  const shape = new THREE.Shape();
  corners.forEach((p, i) => {
    const towards = (q) => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const t = (R * Math.sqrt(3)) / l; // 60° corners
      return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
    };
    const a = towards(corners[(i + 2) % 3]);
    const b = towards(corners[(i + 1) % 3]);
    if (i === 0) shape.moveTo(a[0], a[1]);
    else shape.lineTo(a[0], a[1]);
    shape.quadraticCurveTo(p[0], p[1], b[0], b[1]);
  });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 2 * (PRISM_Z - R), bevelEnabled: true, bevelThickness: R, bevelSize: R, bevelOffset: -R, bevelSegments: 4, curveSegments: 8 });
  geo.translate(0, 0, -(PRISM_Z - R));
  return toCreasedNormals(geo, 0.55);
}

// ---------- the scene ----------

/**
 * The room, the prism and the light. `paint(time, head)` draws the picture with the haze as it is at
 * `time` (seconds) and the light come as far as `head` (optical path length; negative: no light).
 */
export class PrismScene {
  constructor(canvas, { pixelRatio = 2, preserve = false } = {}) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: preserve, powerPreference: 'high-performance' });
    this.renderer = renderer;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.background = new THREE.Color('#b9c6d4');

    // the camera of prismOptics.js (so that `project` there says where things are in the picture)
    const camera = new THREE.PerspectiveCamera((2 * Math.atan(H / 2 / CAMERA.focal) * 180) / Math.PI, W / H, 0.5, 60);
    camera.position.set(...CAMERA.eye);
    camera.lookAt(...CAMERA.target);
    camera.updateMatrixWorld();
    this.camera = camera;

    const pics = pictures();
    const texture = (c, repeat) => {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (repeat) {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...repeat);
      }
      return t;
    };

    // ----- the light of the day: the sky's, from all round; the window's, from the left and a little
    // above (it casts the prism's shadow, a faint one: the prism is glass); and more of it near the window
    scene.add(new THREE.HemisphereLight('#f1f6fc', '#c8b08e', 0.85));
    const day = new THREE.DirectionalLight('#fff6e6', 2.4);
    day.position.set(PRISM_X - 7, 4.6, 2.6);
    day.target.position.set(PRISM_X + 0.4, 0.5, 0);
    day.castShadow = true;
    day.shadow.mapSize.set(1024, 1024);
    Object.assign(day.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: 1, far: 20 });
    day.shadow.bias = -0.0006;
    day.shadow.normalBias = 0.02;
    day.shadow.radius = 9;
    day.shadow.intensity = 0.42;
    scene.add(day, day.target);
    const spill = new THREE.PointLight('#f3f8ff', 7, 0, 2);
    spill.position.set(WALL_X + 1.1, 0.5 * (WINDOW.y1 + WINDOW.y2) - 0.4, 0.5 * (WINDOW.z1 + WINDOW.z2) + 1.0);
    scene.add(spill);

    // ----- the room
    const PAINT = '#cadef4';
    const wall = (width, height, corners) => new THREE.MeshStandardMaterial({ color: PAINT, roughness: 0.94, metalness: 0, map: texture(wallCanvas(width, height, corners)) });
    const TOP = 7; // the walls' height
    const DEPTH = TABLE_D; // and how far they come towards the camera
    const back = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_W, TOP), wall(TABLE_W, TOP, 'lr'));
    back.position.set((WALL_X + WALL_R) / 2, TOP / 2, WALL_Z);
    const facing = new THREE.Mesh(new THREE.PlaneGeometry(DEPTH, TOP), wall(DEPTH, TOP, 'l'));
    facing.rotation.y = -Math.PI / 2;
    facing.position.set(WALL_R, TOP / 2, WALL_Z + DEPTH / 2);
    // the wall with the window: a hole in it (in the wall's own plane, u = -z)
    const { z1, z2, y1, y2, depth: WD } = WINDOW;
    const holed = new THREE.Shape([new THREE.Vector2(-WALL_Z - DEPTH, 0), new THREE.Vector2(-WALL_Z, 0), new THREE.Vector2(-WALL_Z, TOP), new THREE.Vector2(-WALL_Z - DEPTH, TOP)]);
    holed.holes.push(new THREE.Path([new THREE.Vector2(-z2, y1), new THREE.Vector2(-z2, y2), new THREE.Vector2(-z1, y2), new THREE.Vector2(-z1, y1)]));
    const windowWall = new THREE.Mesh(new THREE.ShapeGeometry(holed), new THREE.MeshStandardMaterial({ color: PAINT, roughness: 0.94, metalness: 0 }));
    windowWall.rotation.y = Math.PI / 2;
    windowWall.position.x = WALL_X;
    scene.add(back, facing, windowWall);

    // the window: the opening's four sides through the wall, a sill, and the sash's frame and rail
    const white = new THREE.MeshStandardMaterial({ color: '#f3f5f7', roughness: 0.6, metalness: 0 });
    const xo = WALL_X - WD; // the outer face of the wall
    const windowParts = [
      box(white, [xo - 0.1, y1 - 0.08, z1 - 0.08], [WALL_X - 0.001, y1, z2 + 0.08]),
      box(white, [xo - 0.1, y2, z1 - 0.08], [WALL_X - 0.001, y2 + 0.08, z2 + 0.08]),
      box(white, [xo - 0.1, y1, z1 - 0.08], [WALL_X - 0.001, y2, z1]),
      box(white, [xo - 0.1, y1, z2], [WALL_X - 0.001, y2, z2 + 0.08]),
      // the sill, a little into the room
      box(white, [WALL_X - 0.02, y1 - 0.055, z1 - 0.12], [WALL_X + 0.13, y1 + 0.004, z2 + 0.12]),
      // the frame, at the outer face, and the rail between the two sashes
      box(white, [xo, y1, z1], [xo + 0.07, y1 + 0.13, z2]),
      box(white, [xo, y2 - 0.13, z1], [xo + 0.07, y2, z2]),
      box(white, [xo, y1, z1], [xo + 0.07, y2, z1 + 0.13]),
      box(white, [xo, y1, z2 - 0.13], [xo + 0.07, y2, z2]),
      box(white, [xo, y1 + 1.52, z1], [xo + 0.08, y1 + 1.64, z2]),
    ];
    scene.add(...windowParts);
    // the day outside, a picture well behind the window
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: texture(pics.day), toneMapped: false }));
    outside.rotation.y = Math.PI / 2;
    outside.position.set(xo - 2.4, 2.2, -5.4); // where the camera's rays through the window go
    scene.add(outside);

    // the table, of boards; the dark where the prism stands is under it, in the wood's own picture, so
    // that it shows through the glass too
    const wood = new THREE.MeshStandardMaterial({ map: texture(pics.wood, [1, TABLE_D / TABLE_W]), roughness: 0.62, metalness: 0 });
    const table = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_W, TABLE_D), wood);
    table.rotation.x = -Math.PI / 2;
    table.position.set((WALL_X + WALL_R) / 2, 0, WALL_Z + TABLE_D / 2);
    table.receiveShadow = true;
    scene.add(table);
    const foot = new THREE.Mesh(
      new THREE.PlaneGeometry(BR[0] - BL[0] + 1.3, 2 * PRISM_Z + 1.3),
      new THREE.MeshBasicMaterial({ color: '#1c1408', alphaMap: texture(pics.foot), transparent: true, opacity: 0.42, depthWrite: false }),
    );
    foot.material.alphaMap.colorSpace = THREE.NoColorSpace;
    foot.rotation.x = -Math.PI / 2;
    foot.position.set(PRISM_X, 0.003, 0);
    foot.renderOrder = -1;
    scene.add(foot);

    // ----- what the room looks like from where the prism stands: the glass and the table mirror it
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.env = pmrem.fromScene(scene, 0.02, 0.1, 60, { size: 256, position: new THREE.Vector3(PRISM_X, 1.0, 0.2) });
    pmrem.dispose();
    wood.envMap = this.env.texture;
    wood.envMapIntensity = 0.5;
    wood.needsUpdate = true;

    // ----- the prism
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.02,
      metalness: 0,
      transmission: 1,
      ior: 1.5,
      thickness: 1.3,
      attenuationColor: new THREE.Color('#c2e0ea'),
      attenuationDistance: 2.6,
      envMap: this.env.texture,
      envMapIntensity: 2.0,
      depthWrite: false,
    });
    const prism = new THREE.Mesh(prismGeometry(), glass);
    prism.castShadow = true;
    scene.add(prism);
    // seen from inside, its faces mirror the room (as glass does at a glancing angle): faintly, on top
    const mirror = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.06, envMap: this.env.texture, envMapIntensity: 1.1, side: THREE.BackSide, transparent: true, opacity: 0.2, depthWrite: false });
    scene.add(new THREE.Mesh(prism.geometry, mirror));
    // its edges are ground, as a real prism's are: they show white
    const ground = new THREE.MeshStandardMaterial({ color: '#f4f8fb', roughness: 0.5, metalness: 0 });
    const centre = [(BL[0] + BR[0] + APEX[0]) / 3, (BL[1] + BR[1] + APEX[1]) / 3];
    const inset = (p, d) => {
      const l = Math.hypot(centre[0] - p[0], centre[1] - p[1]);
      return [p[0] + (d * (centre[0] - p[0])) / l, p[1] + (d * (centre[1] - p[1])) / l];
    };
    const edge = (a, b) => {
      const A = new THREE.Vector3(...a);
      const B = new THREE.Vector3(...b);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(EDGE_R, EDGE_R, A.distanceTo(B), 8, 1, true), ground);
      m.position.copy(A).add(B).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
      return m;
    };
    const corners = [BL, BR, APEX].map((p) => inset(p, 0.034));
    const ZE = PRISM_Z - 0.012;
    scene.add(
      ...corners.map((p) => edge([...p, -ZE], [...p, ZE])),
      ...[-ZE, ZE].flatMap((z) => corners.map((p, i) => edge([...p, z], [...corners[(i + 1) % 3], z]))),
    );

    // ----- the light
    const flat = (row) => new Float32Array(RAYS.flatMap(row));
    this.uniforms = {
      uTime: { value: 0 },
      uHead: { value: -1e4 },
      uA: { value: flat((ray) => [ray.q[0], ray.q[1], ray.d2[0], ray.d2[1]]) },
      uB: { value: flat((ray) => [ray.d1[0], ray.d1[1], ray.n, ray.oplQ]) },
      uC: { value: flat((ray) => [ray.w1, ray.w2, ray.g1, ray.g2]) },
      uD: { value: flat((ray) => [ray.rgb[0], ray.rgb[1], ray.rgb[2], ray.hit[1]]) },
      uAir: { value: 0.75 }, // how much of a sheet's light the air scatters towards the eye
      uGlass: { value: 0.9 }, // and the glass
      uGlint: { value: 0.55 }, // how bright a face is where the sheet crosses it
      uRain: { value: 32 }, // and how much of it the wall sends back
    };
    const light = (fragmentShader, options) => new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: VERTEX, fragmentShader, transparent: true, depthWrite: false, ...options });
    // light in the air brightens what is behind it, the more the darker that is, and never burns it
    // out (a "screen": what shows is behind + light × (1 − behind))
    const SCREEN = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneMinusDstColorFactor, blendDst: THREE.OneFactor };
    const onFace = (base, n, y) => [base[0] - (y * n[1]) / n[0], y]; // the point of a face of the prism at height y
    const M = 0.22; // room round the light, for its soft faces
    const parts = [
      // the spectrum, a patch just off the wall
      [new THREE.PlaneGeometry(2 * (SHEET_Z + 1.2), RED.hit[1] - VIOLET.hit[1] + 1.2), light(SPECTRUM, { blending: THREE.NormalBlending })],
      [slab([[WALL_X - WINDOW.depth, BEAM_Y - M], [WALL_X - WINDOW.depth, BEAM_Y + M]], [onFace(BL, N_LEFT, BEAM_Y - M), onFace(BL, N_LEFT, BEAM_Y + M)]), light(WHITE, SCREEN)],
      [slab([onFace(BL, N_LEFT, BEAM_Y - M), onFace(BL, N_LEFT, BEAM_Y + M)], [onFace(BR, N_RIGHT, VIOLET.q[1] - M), onFace(BR, N_RIGHT, RED.q[1] + M)]), light(INSIDE, { ...SCREEN, depthTest: false })],
      [slab([onFace(BR, N_RIGHT, VIOLET.q[1] - M), onFace(BR, N_RIGHT, RED.q[1] + M)], [[WALL_R, Math.max(0.004, VIOLET.hit[1] - 0.3)], [WALL_R, RED.hit[1] + 0.3]]), light(FAN, SCREEN)],
    ].map(([geo, mat], i) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = i + 1;
      mesh.frustumCulled = false;
      return mesh;
    });
    parts[0].rotation.y = -Math.PI / 2;
    parts[0].position.set(WALL_R - 0.004, (RED.hit[1] + VIOLET.hit[1]) / 2, 0);
    scene.add(...parts);
    renderer.shadowMap.needsUpdate = true; // the prism's shadow, drawn once
  }

  paint(time, head) {
    this.uniforms.uTime.value = time;
    this.uniforms.uHead.value = head;
    this.renderer.render(this.scene, this.camera);
  }

  /** The canvas's pixels per picture pixel. */
  setScale(scale) {
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(W, H, false);
  }

  /** Wait until the picture is painted (to time it). */
  wait() {
    const gl = this.renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  /** Free what the scene holds; `lose`: its WebGL context too (a still's own canvas). */
  dispose(lose = false) {
    this.scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        for (const key of ['map', 'alphaMap']) o.material[key]?.dispose();
        o.material.dispose();
      }
    });
    this.env.dispose();
    this.renderer.dispose();
    if (lose) this.renderer.forceContextLoss();
  }
}
