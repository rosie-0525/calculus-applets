/**
 * Level sets of a function sampled on a grid, and the colour ramps of the pictures.
 *
 * A grid is { nx, ny, x0, x1, y0, y1, v } with v[j][i] = f(x_i, y_j) at the (nx + 1) × (ny + 1)
 * points x_i = x0 + i (x1 − x0)/nx, y_j = y0 + j (y1 − y0)/ny.
 */

/** Samples f on the grid over xRange × yRange with nx × ny cells. */
export function sample(f, [x0, x1], [y0, y1], nx, ny = nx) {
  const v = [];
  for (let j = 0; j <= ny; j += 1) {
    const row = new Float64Array(nx + 1);
    const y = y0 + ((y1 - y0) * j) / ny;
    for (let i = 0; i <= nx; i += 1) row[i] = f(x0 + ((x1 - x0) * i) / nx, y);
    v.push(row);
  }
  return { nx, ny, x0, x1, y0, y1, v };
}

/**
 * The level set f = c as line segments [[x, y], [x', y']] (marching squares); each segment also
 * carries its cell, seg.i and seg.j. `keep(i, j)`, if given, keeps only the segments of the cell
 * (i, j) for which it is true.
 */
export function levelSegments(g, c, keep) {
  const { nx, ny, x0, x1, y0, y1, v } = g;
  const hx = (x1 - x0) / nx;
  const hy = (y1 - y0) / ny;
  const segs = [];
  // where the level crosses the edge from corner a to corner b (in grid units along the edge)
  const t = (a, b) => (a === b ? 0.5 : (c - a) / (b - a));
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      if (keep && !keep(i, j)) continue;
      const a = v[j][i]; // (i, j)
      const b = v[j][i + 1]; // (i + 1, j)
      const d = v[j + 1][i + 1]; // (i + 1, j + 1)
      const e = v[j + 1][i]; // (i, j + 1)
      if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(d) && Number.isFinite(e))) continue;
      const k = (a >= c ? 1 : 0) | (b >= c ? 2 : 0) | (d >= c ? 4 : 0) | (e >= c ? 8 : 0);
      if (k === 0 || k === 15) continue;
      const X = (u) => x0 + (i + u) * hx;
      const Y = (u) => y0 + (j + u) * hy;
      const S = [X(t(a, b)), Y(0)]; // bottom edge
      const R = [X(1), Y(t(b, d))]; // right edge
      const N = [X(t(e, d)), Y(1)]; // top edge
      const L = [X(0), Y(t(a, e))]; // left edge
      const centre = (a + b + d + e) / 4 >= c;
      const before = segs.length;
      switch (k) {
        case 1: case 14: segs.push([L, S]); break;
        case 2: case 13: segs.push([S, R]); break;
        case 3: case 12: segs.push([L, R]); break;
        case 4: case 11: segs.push([R, N]); break;
        case 6: case 9: segs.push([S, N]); break;
        case 7: case 8: segs.push([L, N]); break;
        case 5: // a and d above
          if (centre) segs.push([L, N], [S, R]);
          else segs.push([L, S], [R, N]);
          break;
        case 10: // b and e above
          if (centre) segs.push([L, S], [R, N]);
          else segs.push([L, N], [S, R]);
          break;
        default:
      }
      for (let m = before; m < segs.length; m += 1) {
        segs[m].i = i;
        segs[m].j = j;
      }
    }
  }
  return segs;
}

/** An SVG path through the segments, after mapping each point with `map` (to pixels). */
export function segmentsPath(segs, map) {
  let d = '';
  for (const [p, q] of segs) {
    const [a, b] = map(p);
    const [c, e] = map(q);
    d += `M${a.toFixed(1)} ${b.toFixed(1)}L${c.toFixed(1)} ${e.toFixed(1)}`;
  }
  return d;
}

const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));

/** A colour ramp through the hex stops (equally spaced), as a function of t in [0, 1]. */
export function ramp(stops) {
  const rgb = stops.map(hex);
  return (t, mix = 1) => {
    const u = Math.max(0, Math.min(1, t)) * (rgb.length - 1);
    const k = Math.min(rgb.length - 2, Math.floor(u));
    const s = u - k;
    const c = rgb[k].map((x, n) => x + s * (rgb[k + 1][n] - x));
    // mix < 1 darkens (shading), mix > 1 lightens toward white
    const out = mix <= 1 ? c.map((x) => x * mix) : c.map((x) => x + (255 - x) * (mix - 1));
    return `rgb(${out.map((x) => Math.round(Math.max(0, Math.min(255, x)))).join(',')})`;
  };
}

/** Height, as one hue light → dark (teal, the deck's second accent). */
export const TEAL_RAMP = ramp(['#d4ecf0', '#a3d3dc', '#65b2c2', '#2f8ba1', '#0f6278', '#0a4352']);

/** The same ramp for lines on white: starts dark enough to read (≥ 2:1 on the page). */
export const lineColor = (t) => TEAL_RAMP(0.38 + 0.62 * t);
