// The measures and the optics behind Prism.jsx and PrismScene.js (The Spectral Theorem's picture):
// a room in daylight, a glass prism standing on a table, point up (the user's request), and a flat sheet of white light
// from the window that crosses it and lands on the wall facing the window as the light spectrum, a
// band of colours one above the other (the user's request: on the wall, not on the table).
// World coordinates: x to the right, y up, z towards the viewer; the table is the plane y = 0, and 1
// unit is about 100 px at the prism. The light travels in the xy-plane, so its path is traced there,
// colour by colour: Snell's law at both faces; the index follows Cauchy's law, n = a + b/λ², as real
// glass does (the violet end of the spectrum is stretched, the red end squeezed); Fresnel's equations
// give how much light each face lets through; and the colour of each wavelength is the eye's (the CIE
// 1931 observer), in sunlight. Two liberties, so that the picture reads: the indices run from 1.03 to
// 1.215 (real glass: about 1.5, and ten times less spread: its level light would come down on the table,
// right beside the prism), so that level light leaves the prism nearly level and the colours part on
// their way to the wall; and the violet end, which the eye hardly sees, is a little brighter than it
// should be (LIFT).
export const W = 1280;
export const H = 392;

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (k, a) => [k * a[0], k * a[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const unit = (a) => mul(1 / Math.hypot(a[0], a[1]), a);

// the room: the wall with the window (x = WALL_X), the wall behind the table (z = WALL_Z), the wall
// facing the window (x = WALL_R), where the colours land, and the window's opening in its wall (z1 to
// z2, y1 up to y2, the glass `depth` back from the wall's face)
export const WALL_X = -4.5;
export const WALL_Z = -2.3;
export const WALL_R = 3.75;
export const WINDOW = { z1: -1.85, z2: 0.95, y1: 0.74, y2: 3.9, depth: 0.2 };

// the prism: its section an equilateral triangle on the table, from z = -PRISM_Z to PRISM_Z
export const SIDE = 2.3;
export const PRISM_X = -1.0;
export const PRISM_Z = 0.76;
export const BL = [PRISM_X - SIDE / 2, 0];
export const BR = [PRISM_X + SIDE / 2, 0];
export const APEX = [PRISM_X, (SIDE * Math.sqrt(3)) / 2];
// the outward unit normals of the two faces the light crosses
export const N_LEFT = [-Math.sqrt(3) / 2, 0.5];
export const N_RIGHT = [Math.sqrt(3) / 2, 0.5];

// the white light: a level sheet at height BEAM_Y, BEAM thick (its half-thickness), from z = -SHEET_Z
// to SHEET_Z; it starts at the window (S0) and meets the prism's left face at P0
export const BEAM = 0.034;
export const BEAM_Y = 1.5;
export const SHEET_Z = 0.5;
export const D0 = [1, 0];
export const P0 = [BL[0] + BEAM_Y / Math.sqrt(3), BEAM_Y];
export const S0 = [WALL_X, BEAM_Y];
export const LEN = P0[0] - WALL_X;

// the glass: n from N_RED (at 700 nm) to N_VIOLET (at 405 nm), linear in 1/λ²
const L_RED = 700;
const L_VIOLET = 405;
const N_RED = 1.03;
const N_VIOLET = 1.215;
const INV_RED = 1 / (L_RED * L_RED);
const INV_VIOLET = 1 / (L_VIOLET * L_VIOLET);
/** The wavelength (nm) a fraction u of the way from red to violet, evenly in 1/λ², i.e. in n. */
export const wavelength = (u) => 1 / Math.sqrt(INV_RED + u * (INV_VIOLET - INV_RED));
const index = (u) => N_RED + u * (N_VIOLET - N_RED);

/** Snell's law: the unit direction d crossing a surface, its unit normal nn facing d; eta = n1/n2. */
function refract(d, nn, eta) {
  const c = -dot(nn, d);
  const k = 1 - eta * eta * (1 - c * c);
  return unit(add(mul(eta, d), mul(eta * c - Math.sqrt(k), nn)));
}
/** Fresnel: the share of unpolarized light that crosses from index n1 (cosine ci) to n2 (cosine ct). */
function through(ci, ct, n1, n2) {
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
  const rp = (n1 * ct - n2 * ci) / (n1 * ct + n2 * ci);
  return 1 - (rs * rs + rp * rp) / 2;
}

/**
 * The path of the colour a fraction u of the way from red to violet: its direction d1 inside the
 * glass, where it leaves (q), its direction d2 after, where it lands on the wall (hit); the
 * half-thicknesses w1, w2 of its sheet inside and after (a beam is squeezed or widened as it bends);
 * the gains g1, g2 of its brightness there (Fresnel's losses, and the same light in a thicker or
 * thinner sheet); and its optical path lengths (light is n times slower in glass) to q and the wall.
 */
export function trace(u) {
  const n = index(u);
  const ci = -dot(N_LEFT, D0);
  const d1 = refract(D0, N_LEFT, 1 / n);
  const c1 = -dot(N_LEFT, d1);
  // where P0 + s d1 meets the right face
  const s = dot(sub(BR, P0), N_RIGHT) / dot(d1, N_RIGHT);
  const q = add(P0, mul(s, d1));
  const c2 = dot(N_RIGHT, d1);
  const d2 = refract(d1, mul(-1, N_RIGHT), n);
  const ce = dot(N_RIGHT, d2);
  const w1 = (BEAM * c1) / ci;
  const w2 = (w1 * ce) / c2;
  const t1 = through(ci, c1, 1, n);
  const t2 = through(c2, ce, n, 1);
  const run = (WALL_R - q[0]) / d2[0];
  const oplQ = LEN + n * s;
  return {
    lambda: wavelength(u),
    n,
    d1,
    q,
    d2,
    w1,
    w2,
    g1: (t1 * BEAM) / w1,
    g2: (t1 * t2 * BEAM) / w2,
    oplQ,
    hit: add(q, mul(run, d2)),
    oplHit: oplQ + run,
  };
}

// ---------- the colours ----------
const lobe = (x, mu, s1, s2) => Math.exp(-0.5 * ((x - mu) / (x < mu ? s1 : s2)) ** 2);
/** The CIE 1931 colour matching functions (Wyman, Sloan and Shirley's fit), wl in nm. */
function cie(wl) {
  return [
    1.056 * lobe(wl, 599.8, 37.9, 31.0) + 0.362 * lobe(wl, 442.0, 16.0, 26.7) - 0.065 * lobe(wl, 501.1, 20.4, 26.2),
    0.821 * lobe(wl, 568.8, 46.9, 40.5) + 0.286 * lobe(wl, 530.9, 16.3, 31.1),
    1.217 * lobe(wl, 437.0, 11.8, 36.0) + 0.681 * lobe(wl, 459.0, 26.0, 13.8),
  ];
}
/** Sunlight: a black body at 5800 K (Planck's law), wl in nm, up to a constant. */
const sun = (wl) => 1e15 / (wl ** 5 * (Math.exp(1.4388e7 / (wl * 5800)) - 1));
/**
 * The colour of light of wavelength wl, in linear sRGB: no screen can show a pure colour, so it is
 * mixed with just enough white of the same brightness (keep = 1), or its missing part is cut off
 * (keep = 0), which is more vivid; SATURATION picks between them.
 */
const SATURATION = 0.7;
function colour(wl) {
  const [x, y, z] = cie(wl);
  const rgb = [3.2406 * x - 1.5372 * y - 0.4986 * z, -0.9689 * x + 1.8758 * y + 0.0415 * z, 0.0557 * x - 0.204 * y + 1.057 * z];
  const low = Math.min(...rgb);
  if (low >= 0) return rgb;
  const k = y / (y - low);
  return rgb.map((v) => (1 - SATURATION) * (y + k * (v - y)) + SATURATION * Math.max(0, v));
}

/**
 * The K colours the picture is made of, red to violet, evenly in n (so evenly across the fan), each
 * with its path and its colour `rgb`: sunlight's share of that colour, the shares adding up to white.
 */
export const K = 48;
const LIFT = 1.6;
const EVEN = 0.4;
export const RAYS = (() => {
  const rays = Array.from({ length: K }, (_, k) => {
    const u = (k + 0.5) / K;
    const ray = trace(u);
    // evenly in 1/λ²: a step of u covers a range of wavelengths proportional to λ³; the eye hardly
    // sees the violet end, which the picture helps a little (LIFT), so that the spectrum reads to its end
    const power = sun(ray.lambda) * ray.lambda ** 3 * (1 + LIFT * Math.min(1, Math.max(0, (u - 0.5) / 0.5)) ** 2);
    return { ...ray, rgb: colour(ray.lambda).map((v) => v * power) };
  });
  // the eye sees the middle of the spectrum far better than its two ends, and a screen shows that
  // even less kindly: the dim colours are helped (EVEN: 0 not at all, 1 all of them as bright), so
  // that the band on the wall reads from red to violet
  const top = Math.max(...rays.map((ray) => Math.max(...ray.rgb)));
  const even = rays.map((ray) => ({ ...ray, rgb: ray.rgb.map((v) => v * (Math.max(...ray.rgb) / top) ** -EVEN) }));
  const total = [0, 1, 2].map((c) => even.reduce((sum, ray) => sum + ray.rgb[c], 0));
  return even.map((ray) => ({ ...ray, rgb: ray.rgb.map((v, c) => v / total[c]) }));
})();

// ---------- the camera ----------
// in front of the table, a little above it and to the left, looking a little down and to the right:
// the prism's triangle nearly faces it, so the light's path is seen almost as it is, and the wall the
// colours land on is seen less on edge than the window's; near enough (a wide lens) to see both
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a) => a.map((v) => v / Math.hypot(...a));
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const CAMERA = (() => {
  const eye = [-1.3, 2.7, 9.6];
  const target = [0.5, 1.25, 0];
  const forward = unit3(target.map((v, i) => v - eye[i]));
  const right = unit3(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  return { eye, target, forward, right, up, focal: 1030 };
})();
/** Where the camera sees the point p = [x, y, z], in the picture's pixels. */
export function project(p) {
  const v = p.map((c, i) => c - CAMERA.eye[i]);
  const depth = dot3(v, CAMERA.forward);
  return [W / 2 + (CAMERA.focal * dot3(v, CAMERA.right)) / depth, H / 2 - (CAMERA.focal * dot3(v, CAMERA.up)) / depth];
}
