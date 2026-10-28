// Lecture 15's colours and 2 × 2 matrix arithmetic, shared by its pictures.
export const INK = '#14213d';
export const RED = '#8c1515';
export const BLUE = '#3b6ea8'; // A and Ax
export const AMBER = '#c2702a'; // B and Bx
export const VIOLET = '#7c3aed';
export const GRAY = '#9ca3af';

/** M x for a 2 × 2 matrix M (rows) and x in ℝ². */
export const apply = (M, [x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
export const plus = (u, v) => u.map((a, i) => a + v[i]);
export const scale = (c, u) => u.map((a) => c * a);
/** (1 − t) M + t N, a matrix on its way from M (t = 0) to N (t = 1). */
export const lerpM = (M, N, t) => M.map((row, i) => row.map((m, j) => (1 - t) * m + t * N[i][j]));
export const I2 = [
  [1, 0],
  [0, 1],
];

/** SVG points "x,y x,y …" of plane points through a Plane's p.px, p.py. */
export const pts = (p, qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');

/** Mouse/touch position in the coordinates of the svg's viewBox. */
export function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}
