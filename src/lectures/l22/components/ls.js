// Lecture 22's colours, Mark's Example 1 and the vector helpers shared by its pictures.
import { dot, plus, minus, times, norm, proj } from './vec.js';

export { dot, plus, minus, times, norm, proj };

export const INK = '#14213d';
export const RED = '#8c1515';
export const BLUE = '#3b6ea8'; // v₁
export const AMBER = '#c2702a'; // v₁
export const PURPLE = '#5b3f99'; // v₂
export const TEAL = '#0e7490'; // C(A)
export const GREEN = '#175e54'; // N(A)
export const LEAF = '#2e8540'; // b on Linear system in matrix form (the user: green; a lighter one than N(A)'s)
export const GRAY = '#9ca3af';
export const ROSE = '#b5407f'; // v₃, first v₁ (the user's request: not blue, the definitions' and b ∈ C(A)'s colour now, nor red)
export const COLS = [AMBER, PURPLE, ROSE]; // the columns v₁, v₂, v₃: orange, purple, pink (the user's order: orange in ℝ¹)

// Mark's Example 1: 2x − y + z = a, x + y + 2z = b, −x − y − 2z = c
export const A = [
  [2, -1, 1],
  [1, 1, 2],
  [-1, -1, -2],
];
export const V1 = [2, 1, -1];
export const V2 = [-1, 1, -1];
export const V3 = [1, 2, -2]; // = v₁ + v₂
export const N1 = [1, 1, -1]; // N(A) = span{(1, 1, −1)}: v₁ + v₂ − v₃ = 0
export const B_IN = [3, 3, -3]; // = 2v₁ + v₂ = v₁ + v₃: in C(A)
export const B_OUT = [0, 1, 0]; // not in C(A): Proj = (0, 1/2, −1/2)
export const X0 = [2, 1, 0]; // two solutions of Ax = (3, 3, −3)
export const X1 = [1, 0, 1];

export const mul = (M, x) => M.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
export const cross = ([a, b, c], [d, e, f]) => [b * f - c * e, c * d - a * f, a * e - b * d];
export const unit = (v) => times(1 / norm(v), v);
export const lerp = (e, f, t) => e.map((c, i) => c + t * (f[i] - c));
export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
export const clamp01 = (t) => Math.max(0, Math.min(1, t));

// C(A) is the plane y + z = 0, with the orthogonal basis v₁, v₂ (v₁ · v₂ = 0)
const U1 = unit(V1);
const U2 = unit(V2);
const NHAT = unit(cross(V1, V2)); // (0, 1, 1)/√2

/**
 * The pictures of Example 1 show C(A) as a horizontal floor (as projection pictures read best,
 * rule 16): a rotation of ℝ³ (the axes are hidden, so nothing else changes) taking C(A) to the plane
 * z = 0, its normal (0, 1, 1) up, and v₁, v₂ to the floor directions `phi` degrees either side of
 * the one that runs to the right at the default view (az −40°): v₁ down-right, v₂ up-right.
 */
export function floorView(phi = -45) {
  const az = (-40 * Math.PI) / 180;
  const R = [Math.sin(az), Math.cos(az), 0]; // the floor direction that runs to the right
  const D = [-Math.cos(az), Math.sin(az), 0]; // the one that runs away from the viewer
  const f = (phi * Math.PI) / 180;
  const a = plus(times(Math.cos(f), R), times(Math.sin(f), D));
  const b = plus(times(-Math.sin(f), R), times(Math.cos(f), D));
  return (p) => {
    const s = dot(p, U1);
    const t = dot(p, U2);
    const h = dot(p, NHAT);
    return [s * a[0] + t * b[0], s * a[1] + t * b[1], h];
  };
}

export const VIEW = floorView();

/** Proj_{C(A)}(p) for Example 1, by the orthogonal basis v₁, v₂. */
export const projC = (p) => plus(proj(p, V1), proj(p, V2));
