import { dot, minus, plus, times, norm, proj } from './vec.js';

// Lecture 20's colours: the v's in ink, their projections teal, the w's that Gram–Schmidt makes
// green (Lecture 6's v′ = v − Proj_u(v) was green), as in Lectures 5 and 6.
export const INK = '#14213d';
export const RED = '#8c1515';
export const TEAL = '#0e7490';
export const GREEN = '#175e54';
export const GRAY = '#9ca3af';
export const AMBER = '#c2702a';
export const PURPLE = '#5b3f99'; // a spanning set (Recall: spanning sets and bases); its basis green

export { dot, minus, plus, times, norm, proj };

/** The projection of x onto span(w₁, …, w_k), for orthogonal w's. */
export const projOnto = (x, ws) => ws.reduce((acc, w) => plus(acc, proj(x, w)), x.map(() => 0));

/** A unit vector along v. */
export const unit = (v) => times(1 / norm(v), v);

/**
 * The vectors of the Gram–Schmidt picture (the floor z = 0 is V₂ = span(v₁, v₂); at the default
 * view, az −40°, el 24°, v₁ runs to the right, v₂ towards the viewer, v₃ up).
 */
export const V1 = [-0.3, 2.4, 0];
export const V2 = [2.2, 1.6, 0];
export const V3 = [1.0, 1.3, 2.0];
export const W1 = V1;
export const P2 = proj(V2, W1); // Proj_{V₁}(v₂)
export const W2 = minus(V2, P2);
export const P3 = projOnto(V3, [W1, W2]); // Proj_{V₂}(v₃), the foot of v₃ on the floor
export const W3 = minus(V3, P3);

/** e on a straight path to f, t from 0 to 1. */
export const lerp = (e, f, t) => e.map((c, i) => c + t * (f[i] - c));

/**
 * The `unit` and `center` of a Space (width W, height H) that fit `points` with `pad` pixels to spare
 * on every side (room for labels), over the view's rocking (az −40° ± 14°, el 24°).
 */
export function fit(points, W, H, { pad = 34, el = 24, az = -40, swing = 14, maxUnit = 140 } = {}) {
  const r = (d) => (d * Math.PI) / 180;
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
  for (let a = az - swing; a <= az + swing; a += 2) {
    const A = r(a);
    const E = r(el);
    for (const [x, y, z] of points) {
      const xr = x * Math.cos(A) - y * Math.sin(A);
      const X = x * Math.sin(A) + y * Math.cos(A);
      const Y = -(z * Math.cos(E) - xr * Math.sin(E));
      x0 = Math.min(x0, X);
      x1 = Math.max(x1, X);
      y0 = Math.min(y0, Y);
      y1 = Math.max(y1, Y);
    }
  }
  const unit = Math.min(maxUnit, (W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0));
  const center = [(W / 2 - (unit * (x0 + x1)) / 2) / W, (H / 2 - (unit * (y0 + y1)) / 2) / H];
  return { unit, center };
}

/** The corners of the floor patch t u₁ + t′ u₂ (u₁, u₂ the unit vectors along w₁, w₂), t, t′ in `range`. */
export const floorCorners = (range = FLOOR, e = unit(W1), e2 = unit(W2)) =>
  [
    [range[0], range[0]],
    [range[1], range[0]],
    [range[1], range[1]],
    [range[0], range[1]],
  ].map(([a, b]) => e.map((c, i) => a * c + b * e2[i]));

/** The floor's extent along u₁ and u₂: just past the vectors of the Gram–Schmidt picture. */
export const FLOOR = [-0.35, 2.75];

/** The floor point a u₁ + b u₂ (where its label goes: on the right edge, between w₁ and v₂). */
export const floorPoint = (a, b) => unit(W1).map((c, i) => a * c + b * unit(W2)[i]);
export const FLOOR_LABEL = [2.75, 1.45];
