/**
 * The part [t₀, t₁] of the segment a → b (screen points) inside the convex polygon `poly`, or null:
 * which part of a vector below a plane the plane hides (Solving Ax = b, Is b in C(A)?).
 */
export function clipIn(a, b, poly) {
  let area = 0;
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    area += p[0] * q[1] - q[0] * p[1];
  });
  const sgn = Math.sign(area);
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < poly.length; i += 1) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const f = (z) => sgn * ((q[0] - p[0]) * (z[1] - p[1]) - (q[1] - p[1]) * (z[0] - p[0]));
    const fa = f(a);
    const fb = f(b);
    if (fa < 0 && fb < 0) return null;
    if (fa < 0) t0 = Math.max(t0, fa / (fa - fb));
    else if (fb < 0) t1 = Math.min(t1, fa / (fa - fb));
  }
  return t0 <= t1 ? [t0, t1] : null;
}
