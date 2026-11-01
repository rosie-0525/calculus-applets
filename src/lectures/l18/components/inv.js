// Lecture 18's colours, 2 × 2 matrix helpers and the f of Newton's method (Example 5, the
// textbook's Example 18.5.6), shared by its pictures. A is blue, A⁻¹ amber, as A and B in Lecture 15.
export { INK, RED, BLUE, AMBER, VIOLET, GRAY, apply, plus, scale, lerpM, I2, pts, svgPoint } from './la.js';

export const GREEN = '#175e54';

export const det2 = (M) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
/** The inverse of a 2 × 2 matrix (its determinant must not be 0). */
export const inv2 = (M) => {
  const d = det2(M);
  return [
    [M[1][1] / d, -M[0][1] / d],
    [-M[1][0] / d, M[0][0] / d],
  ];
};
/** The rotation of ℝ² by `deg` degrees, counterclockwise. */
export const rot = (deg) => {
  const t = (deg * Math.PI) / 180;
  return [
    [Math.cos(t), -Math.sin(t)],
    [Math.sin(t), Math.cos(t)],
  ];
};
/** Eased 0 → 1 (as in useFragmentTween.js). */
export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
export const clamp01 = (t) => Math.max(0, Math.min(1, t));

// Newton's method: f(x, y) = (x³ + xy + 2y³ − 3, x²y + xy² − y), its derivative matrix, one step
export const f = ([x, y]) => [x ** 3 + x * y + 2 * y ** 3 - 3, x * x * y + x * y * y - y];
export const f1 = (x, y) => x ** 3 + x * y + 2 * y ** 3 - 3;
export const f2 = (x, y) => x * x * y + x * y * y - y;
export const Df = ([x, y]) => [
  [3 * x * x + y, x + 6 * y * y],
  [2 * x * y + y * y, x * x + 2 * x * y - 1],
];
/** a − ((Df)(a))⁻¹ f(a), or null where (Df)(a) is (almost) not invertible. */
export function newtonStep(a) {
  const J = Df(a);
  if (Math.abs(det2(J)) < 1e-9) return null;
  const h = apply2(inv2(J), f(a));
  return [a[0] - h[0], a[1] - h[1]];
}
const apply2 = (M, [x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
/** a₁, a₂, … (at most `n` points), stopping early where a step can't be taken or runs off. */
export function newtonPath(a1, n = 12) {
  const out = [a1];
  for (let k = 1; k < n; k += 1) {
    const next = newtonStep(out[k - 1]);
    if (!next || !next.every(Number.isFinite) || Math.hypot(...next) > 1e4) break;
    out.push(next);
  }
  return out;
}
// the zeros of f: the one Example 5 finds from (0, 1), and the one on the x-axis (x³ = 3)
export const ZERO = [0.6115472935490038, 1.0236492162690372];
export const ZERO2 = [Math.cbrt(3), 0];
// and the third, out of the pictures of Example 5 and More steps (on Which zero does Newton's method find?)
export const ZERO3 = [-3.005126471095241, 2.672361773962364];
