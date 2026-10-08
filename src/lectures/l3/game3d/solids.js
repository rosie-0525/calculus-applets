import { Matrix4, Vector3 } from 'three';

/*
 * The geometry of the 3-D game, with no drawing in it: the cover blocks and
 * their roof planes, the enemies' poses, and where a segment first runs into
 * something.
 *
 * Scene coordinates are three.js's: x to the right, y up, z toward you, so
 * you look down the negative z-axis. You stand at the origin. The HUD shows
 * everything in the lecture's coordinates instead (x to the right, y ahead,
 * z up); `toMath` converts. It is a rotation, so dot products, and with them
 * the equations of the planes, are the same in both.
 */

export const SPEED = 48; // your bolts, in m/s: the velocity v has this length, so t is in seconds
export const ENEMY_SPEED = 22;
export const EYE = new Vector3(0, 1.7, 0);
export const CELL = 0.5; // grid spacing on the roof planes, in m
export const HEAD_R = 0.24; // the enemy's head, as a ball, for hits
export const BEHIND = 0.65; // how far behind its block an enemy stands

/** Lecture coordinates (x right, y ahead, z up) of a scene vector. */
export const toMath = (v) => [v.x, -v.z, v.y];

const Y = new Vector3(0, 1, 0);

/**
 * A cover block: a wedge whose front-bottom-centre is at (x, 0, z), turned by
 * `yaw` (radians) about the vertical, `w` wide and `depth` deep. Its top slopes
 * up from h1 at the front lip to h2 at the back edge; that top is a piece of
 * the block's roof plane n · X = d.
 *
 * In the block's own frame the front face is z = 0 and the back face z = −depth,
 * and the solid is the set of points with n_k · q ≤ c_k for the six planes below.
 */
function makeBlock(b) {
  const s = (b.h2 - b.h1) / b.depth;
  const matrix = new Matrix4().makeRotationY(b.yaw).setPosition(b.x, 0, b.z);
  const n = new Vector3(0, 1, s).applyAxisAngle(Y, b.yaw);
  return {
    ...b,
    s,
    matrix,
    inv: matrix.clone().invert(),
    n, // not a unit vector: its vertical component is 1, so c = 1 in ax + by + cz = d
    d: n.dot(new Vector3(b.x, 0, b.z)) + b.h1,
    slopeLen: Math.hypot(b.depth, b.h2 - b.h1),
    planes: [
      { n: [0, -1, 0], c: 0, kind: 'wall' },
      { n: [0, 0, 1], c: 0, kind: 'wall' },
      { n: [0, 0, -1], c: b.depth, kind: 'wall' },
      { n: [-1, 0, 0], c: b.w / 2, kind: 'wall' },
      { n: [1, 0, 0], c: b.w / 2, kind: 'wall' },
      { n: [0, 1, s], c: b.h1, kind: 'roof' },
    ],
  };
}

export const BLOCKS = [
  { x: -3.6, z: -8.0, yaw: 0.3, w: 3.2, depth: 1.7, h1: 0.85, h2: 1.35 },
  { x: 0.5, z: -11.6, yaw: -0.06, w: 3.4, depth: 1.8, h1: 0.9, h2: 1.42 },
  { x: 4.0, z: -8.8, yaw: -0.34, w: 3.2, depth: 1.7, h1: 0.85, h2: 1.35 },
].map(makeBlock);

/** Which side of block b's roof plane X is on: n · X − d (> 0 on your side). */
export const side = (b, X) => b.n.dot(X) - b.d;

/** A box-shaped solid (a pillar), centred at (x, h/2, z). */
export function makeBox({ x, z, w, h, depth, yaw = 0 }) {
  const matrix = new Matrix4().makeRotationY(yaw).setPosition(x, h / 2, z);
  return {
    x,
    z,
    w,
    h,
    depth,
    yaw,
    matrix,
    inv: matrix.clone().invert(),
    planes: [
      { n: [1, 0, 0], c: w / 2, kind: 'wall' },
      { n: [-1, 0, 0], c: w / 2, kind: 'wall' },
      { n: [0, 1, 0], c: h / 2, kind: 'wall' },
      { n: [0, -1, 0], c: h / 2, kind: 'wall' },
      { n: [0, 0, 1], c: depth / 2, kind: 'wall' },
      { n: [0, 0, -1], c: depth / 2, kind: 'wall' },
    ],
  };
}

export const PILLARS = [-1, 1].flatMap((sgn) =>
  [-5, -14, -23].map((z) => makeBox({ x: sgn * 11.5, z, w: 0.9, h: 7, depth: 0.9 })),
);

/**
 * Where the segment p → q first enters a convex solid { planes } (planes in
 * the solid's frame, p and q already in it): the Cyrus–Beck clip.
 * Returns { t, kind } with t in [0, 1], or null (also when p starts inside).
 */
export function clipSegment(p, q, planes) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const dz = q.z - p.z;
  let tIn = 0;
  let tOut = 1;
  let kind = null;
  for (const { n, c, kind: k } of planes) {
    const num = c - (n[0] * p.x + n[1] * p.y + n[2] * p.z);
    const den = n[0] * dx + n[1] * dy + n[2] * dz;
    if (Math.abs(den) < 1e-12) {
      if (num < 0) return null;
    } else if (den < 0) {
      const t = num / den;
      if (t > tIn) {
        tIn = t;
        kind = k;
      }
    } else {
      tOut = Math.min(tOut, num / den);
    }
    if (tIn > tOut) return null;
  }
  return kind ? { t: tIn, kind } : null;
}

const pl = new Vector3();
const ql = new Vector3();

/** The same, for a solid placed in the scene by its `inv` (scene → solid frame). */
export function hitSolid(p, q, solid, planes = solid.planes) {
  pl.copy(p).applyMatrix4(solid.inv);
  ql.copy(q).applyMatrix4(solid.inv);
  return clipSegment(pl, ql, planes);
}

/** The first t in [0, 1] where the segment p → q touches the ball (c, r), or null. */
export function sphereHit(p, q, c, r) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const dz = q.z - p.z;
  const fx = p.x - c.x;
  const fy = p.y - c.y;
  const fz = p.z - c.z;
  const a = dx * dx + dy * dy + dz * dz;
  const b = 2 * (dx * fx + dy * fy + dz * fz);
  const k = fx * fx + fy * fy + fz * fz - r * r;
  if (k <= 0) return 0;
  const disc = b * b - 4 * a * k;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}

/** Is the point X (scene) on block b's roof, i.e. inside the sloping top face? */
export function onRoof(b, X) {
  pl.copy(X).applyMatrix4(b.inv);
  return Math.abs(pl.x) <= b.w / 2 && pl.z <= 0 && pl.z >= -b.depth;
}

/*
 * The enemy's pose, crouched by the fraction c (0 = standing, 1 = crouched),
 * in its own frame: feet on the ground at the origin, facing +z. Two legs of
 * LEG + LEG, a torso that leans forward as it crouches, and a head HEAD_UP
 * above the hip along the torso.
 */
export const LEG = 0.6;
export const HEAD_UP = 0.9;
const HIP_STAND = 1.16;
const HIP_CROUCH = 0.3;

export function robotPose(c) {
  const e = c * c * (3 - 2 * c);
  const hip = HIP_STAND + (HIP_CROUCH - HIP_STAND) * e;
  const lean = 0.18 * e;
  return {
    hip,
    lean,
    knee: Math.acos(Math.min(1, hip / (2 * LEG))), // angle of each thigh from the vertical
    head: new Vector3(0, hip + HEAD_UP * Math.cos(lean), HEAD_UP * Math.sin(lean)),
  };
}

/** The torso as a box in the enemy's frame (ignoring the lean), for hits. */
export function torsoPlanes(hip) {
  return [
    { n: [1, 0, 0], c: 0.3, kind: 'enemy' },
    { n: [-1, 0, 0], c: 0.3, kind: 'enemy' },
    { n: [0, 1, 0], c: hip + 0.66, kind: 'enemy' },
    { n: [0, -1, 0], c: -(hip + 0.04), kind: 'enemy' },
    { n: [0, 0, 1], c: 0.2, kind: 'enemy' },
    { n: [0, 0, -1], c: 0.2, kind: 'enemy' },
  ];
}

/** Where an enemy stands behind block b, u metres across it (scene coordinates). */
export function standSpot(b, u) {
  return new Vector3(u, 0, -b.depth - BEHIND).applyMatrix4(b.matrix);
}

/** Formatting for the HUD: a number with a real minus sign. */
export function num(x, digits = 2) {
  const s = (Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x).toFixed(digits);
  return s.replace('-', '−');
}

/** a x + b y + c z, written out (c = 1 for every roof here). */
export function lhs(a, b, c = 1) {
  const term = (k, v, first) => {
    const mag = Math.abs(k);
    const coef = Math.abs(mag - 1) < 0.005 ? '' : mag.toFixed(2);
    if (mag < 0.005) return '';
    if (first) return `${k < 0 ? '−' : ''}${coef}${v}`;
    return ` ${k < 0 ? '−' : '+'} ${coef}${v}`;
  };
  let s = term(a, 'x', true);
  s += term(b, 'y', !s);
  s += term(c, 'z', !s);
  return s;
}
