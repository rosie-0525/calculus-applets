// Lecture 24's colours, matrices and 2 × 2 arithmetic. A and Ax are blue (as in Lecture 15); the two
// eigenvectors of a picture, their eigenlines and their eigenvalues are amber and purple; x is ink.
export const INK = '#14213d';
export const RED = '#8c1515';
export const BLUE = '#3b6ea8';
export const AMBER = '#c2702a';
export const PURPLE = '#5b3f99';
export const GREEN = '#175e54';
export const TEAL = '#0e7490';
export const GRAY = '#9ca3af';

/** TeX in a colour: `col(BLUE, 'A')`. */
export const col = (c, tex) => String.raw`\textcolor{${c}}{${tex}}`;

/** M x for a 2 × 2 matrix M (rows) and x in ℝ². */
export const apply = (M, [x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
export const plus = (u, v) => u.map((a, i) => a + v[i]);
export const times = (c, u) => u.map((a) => c * a);
export const lerp = (u, v, t) => u.map((a, i) => a + (v[i] - a) * t);
export const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
export const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
export const len = (u) => Math.hypot(u[0], u[1]);
export const clamp01 = (k) => Math.max(0, Math.min(1, k));

/** The coefficients (a, b) of p = a v₁ + b v₂. */
export const coords = ([v1, v2], p) => {
  const d = cross(v1, v2);
  return [cross(p, v2) / d, cross(v1, p) / d];
};

/** A number with at most two decimals, no trailing zeros, no "-0". */
export const num = (x) => {
  const t = (Math.round(x * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
  return t === '-0' ? '0' : t;
};

/** TeX of a matrix (rows of numbers or TeX strings) and of a column vector. */
export const texM = (M) => String.raw`\begin{bmatrix}${M.map((row) => row.join('&')).join(String.raw`\\ `)}\end{bmatrix}`;
export const texV = (v) => String.raw`\begin{bmatrix}${v.join(String.raw`\\ `)}\end{bmatrix}`;

/** "λ v" in TeX for a number λ: 1 → v, −1 → −v, 3 → 3v. */
export const texScaled = (lam, v) => {
  const n = num(lam);
  if (n === '1') return v;
  if (n === '-1') return `-${v}`;
  return `${n}\\,${v}`;
};

/** SVG points "x,y x,y …" of plane points through a Plane's p.px, p.py. */
export const pts = (p, qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');

// The textbook's Example 23.1.5 (Figure 23.1.1), the slides' running example: Au = u, Av = 3v
export const A1 = [
  [2, -1],
  [-1, 2],
];
export const EIGS1 = [
  { v: [1, 1], lam: 1, color: AMBER, name: String.raw`\vv u` },
  { v: [1, -1], lam: 3, color: PURPLE, name: String.raw`\vv v` },
];

// Stretch and shrink's matrix, also the definition's checks: the simplest matrix that stretches in one
// direction and shrinks in another (an integer matrix can't shrink along a line of rational slope):
// Au = (3/2)u, Av = (1/2)v, along the diagonals of the unit square
export const A0 = [
  [1, 0.5],
  [0.5, 1],
];
export const EIGS0 = [
  { v: [1, 1], lam: 1.5, color: AMBER, name: String.raw`\vv u` },
  { v: [1, -1], lam: 0.5, color: PURPLE, name: String.raw`\vv v` },
];
/** A number that is a multiple of 1/2 in TeX: 1 → 1, 1.5 → 3/2, −0.5 → −1/2. */
export const half = (x) => (Number.isInteger(x) ? String(x) : `${x < 0 ? '-' : ''}\\frac{${Math.abs(2 * x)}}{2}`);
/** A matrix or column vector with halves, its rows spaced out so that the fractions don't touch (the
 *  vectors a little less: the definition's checks have little room). */
export const texMh = (M) => String.raw`{\def\arraystretch{1.35}${texM(M.map((row) => row.map(half)))}}`;
export const texVh = (v) => String.raw`{\def\arraystretch{1.2}${texV(v.map(half))}}`;

// Example 1, Au = 2u, Av = −v: A = (1/2)[1 3; 3 1] stretches by 2 along y = x and flips along y = −x
// (the user's request, in place of Mark's A = [3 −2; 2 −2], u = (2, 1), v = (1, 2): too complicated to be
// enlightening); and the diagonal matrix D Mark compares it with
export const A2 = [
  [0.5, 1.5],
  [1.5, 0.5],
];
export const EIGS2 = [
  { v: [1, 1], lam: 2, color: AMBER, name: String.raw`\vv u` },
  { v: [1, -1], lam: -1, color: PURPLE, name: String.raw`\vv v` },
];
export const D2 = [
  [2, 0],
  [0, -1],
];
export const EIGSD = [
  { v: [1, 0], lam: 2, color: AMBER, name: String.raw`\vv e_1` },
  { v: [0, 1], lam: -1, color: PURPLE, name: String.raw`\vv e_2` },
];
