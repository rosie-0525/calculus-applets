// Lecture 26's functions and helpers: numerical gradients and Hessians, quadratic approximations,
// and the functions of the examples.

const H = 1e-4;

/** The gradient of f at a = (a₁, a₂), by central differences. */
export const grad = (f, [a, b]) => [(f(a + H, b) - f(a - H, b)) / (2 * H), (f(a, b + H) - f(a, b - H)) / (2 * H)];

/** The Hessian of f at a, [[f_xx, f_xy], [f_yx, f_yy]], by central differences of the gradient. */
export const hess = (f, [a, b]) => {
  const xx = (grad(f, [a + H, b])[0] - grad(f, [a - H, b])[0]) / (2 * H);
  const xy = (grad(f, [a, b + H])[0] - grad(f, [a, b - H])[0]) / (2 * H);
  const yy = (grad(f, [a, b + H])[1] - grad(f, [a, b - H])[1]) / (2 * H);
  return [
    [xx, xy],
    [xy, yy],
  ];
};

/** The linear approximation of f near a, as a function of (x, y). */
export const linear = (f, a) => {
  const fa = f(...a);
  const g = grad(f, a);
  return (x, y) => fa + g[0] * (x - a[0]) + g[1] * (y - a[1]);
};

/** The quadratic approximation of f near a: f(a) + ∇f(a) · h + ½ hᵀ Hf(a) h, with h = (x, y) − a. */
export const quadratic = (f, a, M = hess(f, a)) => {
  const fa = f(...a);
  const g = grad(f, a);
  return (x, y) => {
    const [h, k] = [x - a[0], y - a[1]];
    return fa + g[0] * h + g[1] * k + 0.5 * (M[0][0] * h * h + 2 * M[0][1] * h * k + M[1][1] * k * k);
  };
};

// Example 3: f(x, y) = 3x²y − 6xy² + 4y³ − 3y = y(3x² − 6xy + 4y² − 3) (the user's requests: in place
// of Mark's Example 1's −x³ + 6x² + 3y² − 2y³, a contour plot easier to draw; then ellipses near the
// critical points, not circles, the saddles' X's not square, the ellipses rotated; then f simple and
// expanded; then, in place of x²y + xy² − 3xy, a local minimum, a local maximum and two saddle points,
// the Hessians not diagonal; x³ − 3x²y + 3xy² + 2y³ − 3x − 6y, then back to this simpler one), critical
// points: (1, 1) a local minimum (f = −2), (−1, −1) a local maximum (2), (1, 0) and (−1, 0) saddle
// points (0; the level 0 is the line y = 0 and the ellipse 3x² − 6xy + 4y² = 3);
// Hf(x, y) = [6y, 6x − 12y; 6x − 12y, −12x + 24y]
export const fEx = (x, y) => 3 * x * x * y - 6 * x * y * y + 4 * y ** 3 - 3 * y;
export const hessEx = (x, y) => [
  [6 * y, 6 * x - 12 * y],
  [6 * x - 12 * y, -12 * x + 24 * y],
];
