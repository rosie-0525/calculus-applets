/**
 * The line of best fit, computed the way the lecture does it: with X̂ = X − x̄1 and 1 an
 * orthogonal basis of span(X, 1), Proj(Y) = (Y·X̂ / X̂·X̂) X̂ + ȳ 1 = m X + (ȳ − m x̄) 1.
 * `points` is a list of [x, y]; the x's must not all be equal.
 */
export function bestFit(points) {
  const n = points.length;
  const xbar = points.reduce((s, [x]) => s + x, 0) / n;
  const ybar = points.reduce((s, [, y]) => s + y, 0) / n;
  const yDotXh = points.reduce((s, [x, y]) => s + y * (x - xbar), 0);
  const xhDotXh = points.reduce((s, [x]) => s + (x - xbar) ** 2, 0);
  const m = yDotXh / xhDotXh;
  return { n, xbar, ybar, m, b: ybar - m * xbar };
}

/** The errors y_i − (m x_i + b), the entries of Y − (mX + b1). */
export const errors = (points, m, b) => points.map(([x, y]) => y - (m * x + b));
