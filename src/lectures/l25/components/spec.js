// Lecture 25's matrices and 2 × 2 helpers. The colours are Lecture 24's (eig.js): a matrix and what it
// does are blue, the two eigenvectors of a picture, with their eigenlines and eigenvalues, amber and
// purple, x is ink.
import { AMBER, PURPLE } from './eig.js';

export const mul = (M, N) => M.map((row) => [0, 1].map((j) => row[0] * N[0][j] + row[1] * N[1][j]));

/** The rotation by `deg` degrees. */
export const rot = (deg) => {
  const t = (deg * Math.PI) / 180;
  return [
    [Math.cos(t), -Math.sin(t)],
    [Math.sin(t), Math.cos(t)],
  ];
};

/** The symmetric matrix that multiplies by a along w₁ and by b along w₂ (w₁ ⟂ w₂). */
export const stretch = ([w1, w2], [a, b]) => {
  const [n1, n2] = [w1[0] ** 2 + w1[1] ** 2, w2[0] ** 2 + w2[1] ** 2];
  return [0, 1].map((i) => [0, 1].map((j) => (a * w1[i] * w1[j]) / n1 + (b * w2[i] * w2[j]) / n2));
};

// Example 1 (the textbook's Example 24.3.2): A = [1 2; 2 −2], Aw₁ = 2w₁, Aw₂ = −3w₂, w₁ ⟂ w₂
export const A3 = [
  [1, 2],
  [2, -2],
];
export const EIGS3 = [
  { v: [2, 1], lam: 2, color: AMBER, name: String.raw`\vv w_1` },
  { v: [-1, 2], lam: -3, color: PURPLE, name: String.raw`\vv w_2` },
];

// Mark's Example 1 on quadratic forms (the textbook's Example 24.2.1): A = [13 −3; −3 5],
// q_A(x, y) = 13x² − 6xy + 5y², Aw₁ = 14w₁, Aw₂ = 4w₂, w₁ ⟂ w₂
export const AQ = [
  [13, -3],
  [-3, 5],
];
export const EIGSQ = [
  { v: [3, -1], lam: 14, color: AMBER, name: String.raw`\vv w_1` },
  { v: [1, 3], lam: 4, color: PURPLE, name: String.raw`\vv w_2` },
];
export const qA = (x, y) => 13 * x * x - 6 * x * y + 5 * y * y;
// the angle of w₁ = (3, −1): turning the plane by −TILT puts w₁ on the positive x-axis and w₂ on the
// positive y-axis
export const TILT = (Math.atan2(-1, 3) * 180) / Math.PI;

// a matrix that is not symmetric, from the poll: [1 1; 0 2], e₁ (eigenvalue 1) and (1, 1) (eigenvalue 2)
export const AN = [
  [1, 1],
  [0, 2],
];
export const EIGSN = [
  { v: [1, 0], lam: 1, color: AMBER, name: String.raw`\vv e_1` },
  { v: [1, 1], lam: 2, color: PURPLE, name: String.raw`\vv v` },
];
