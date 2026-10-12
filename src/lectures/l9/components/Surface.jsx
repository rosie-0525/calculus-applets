import { useMemo } from 'react';
import { sample, levelSegments, segmentsPath, TEAL_RAMP } from './levels.js';

const CARDINAL = '#8c1515';
const WATER = '#a9cdea';

// the light comes from above, a little from the front left of the default view
const LIGHT = (() => {
  const l = [0.45, -0.35, 0.82];
  const n = Math.hypot(...l);
  return l.map((x) => x / n);
})();

/**
 * The graph z = f(x, y) of a function over a rectangle, drawn in a Space (Space.jsx) as a mesh of
 * small quadrilaterals painted back to front.
 *
 * - `f` and `x`, `y` (ranges) with `n` cells a side (or [nx, ny]); or a sampled grid `grid`
 *   (levels.js) in place of all four.
 * - `param`: (u, v) ↦ (x, y), if the grid is in other coordinates than x, y: then `x`, `y` are
 *   the ranges of u, v (e.g. polar coordinates u = r, v = θ for a graph over a disk).
 * - `zScale`: the graph is drawn at height zScale · f; `clip`: [lo, hi] clamps f (a spike).
 * - `color`: 'height' (`palette`, light → dark teal by default, over `zRange`), or one colour,
 *   shaded by the light.
 * - `mesh`: the colour of the grid lines (none if null).
 * - `water`: a level c. The horizontal plane z = c is drawn as opaque water, hiding the graph
 *   below it (only over the cells where `wet(i, j)` holds, if given). With `seeThrough`, the graph
 *   below it is drawn too, and seen through `waterColor` (translucent): the plane z = c cutting
 *   the graph.
 * - `curve`: a level c, or a list of levels. The level curves f = c are drawn on the graph, in
 *   `curveColor` (a colour, or a function of c).
 * - `lines`: more curves on the graph, [{ pts: [[x, y, z], …] (in space), color, width }], painted
 *   in depth order with the graph (e.g. the curves where vertical planes cut it).
 * - `floor`: a height z₀. The contour plot of `floorLevels` is drawn on the plane z = z₀ under the
 *   graph, in `floorColor(level)`; with `dropCurve` the level curve f = curve is drawn there too.
 */
export default function Surface({
  s,
  f,
  x,
  y,
  n = 24,
  grid,
  param,
  zScale = 1,
  clip,
  color = 'height',
  palette = TEAL_RAMP,
  zRange,
  mesh = 'rgba(15, 40, 50, 0.28)',
  meshWidth = 0.6,
  water,
  wet,
  waterColor = WATER,
  seeThrough = false,
  curve,
  curveColor = CARDINAL,
  curveWidth = 3,
  floor,
  floorLevels = [],
  floorColor = () => '#9ca3af',
  floorWidth = 1.3,
  dropCurve = false,
  lines = [],
}) {
  const g = useMemo(() => {
    if (grid) return grid;
    const [nx, ny] = Array.isArray(n) ? n : [n, n];
    return sample(param ? (u, v) => f(...param(u, v)) : f, x, y, nx, ny);
  }, [grid, f, x, y, n, param]);

  const vals = useMemo(() => {
    if (!clip) return g.v;
    return g.v.map((row) => row.map((t) => Math.max(clip[0], Math.min(clip[1], t))));
  }, [g, clip]);

  const [lo, hi] = useMemo(() => {
    if (zRange) return zRange;
    let a = Infinity;
    let b = -Infinity;
    for (const row of vals) for (const t of row) if (Number.isFinite(t)) { a = Math.min(a, t); b = Math.max(b, t); }
    return [a, b];
  }, [vals, zRange]);

  // the floor's contour lines do not depend on the view
  const floorSegs = useMemo(
    () => (floor === undefined ? [] : floorLevels.map((c) => ({ c, segs: levelSegments(g, c) }))),
    [g, floor, floorLevels],
  );

  const { nx, ny, x0, x1, y0, y1 } = g;
  const hx = (x1 - x0) / nx;
  const hy = (y1 - y0) / ny;
  const X = (i) => x0 + i * hx;
  const Y = (j) => y0 + j * hy;
  // a point of the grid's coordinates (u, v), with a height, in space
  const toXY = param ?? ((u, v) => [u, v]);
  const at3 = (u, v, z) => [...toXY(u, v), z];
  const pts = (poly) => poly.map((q) => s.P(q).map((v) => v.toFixed(1)).join(',')).join(' ');
  const centroid = (poly) => poly.reduce((m, q) => m.map((v, k) => v + q[k] / poly.length), [0, 0, 0]);

  const items = [];
  // the depth of the front-most polygon of each cell, so that a curve on the graph is painted
  // just after its own cell
  const cellDepth = new Float64Array(nx * ny).fill(-Infinity);
  const mark = (i, j, d) => {
    cellDepth[j * nx + i] = Math.max(cellDepth[j * nx + i], d);
    return d;
  };
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      const corner = [
        [X(i), Y(j), vals[j][i]],
        [X(i + 1), Y(j), vals[j][i + 1]],
        [X(i + 1), Y(j + 1), vals[j + 1][i + 1]],
        [X(i), Y(j + 1), vals[j + 1][i]],
      ]; // in grid coordinates (u, v, value)
      if (corner.some((q) => !Number.isFinite(q[2]))) continue;
      const level = water !== undefined && (!wet || wet(i, j)) ? water : undefined;

      // the part of the cell above the water (all of it, without water) and the part below
      let above = corner;
      let below = [];
      if (level !== undefined) {
        above = [];
        for (let k = 0; k < 4; k += 1) {
          const p = corner[k];
          const q = corner[(k + 1) % 4];
          if (p[2] >= level) above.push(p);
          else below.push(p);
          if (p[2] >= level !== q[2] >= level) {
            const t = (level - p[2]) / (q[2] - p[2]);
            const cut = [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]), level];
            above.push(cut);
            below.push(cut);
          }
        }
      }

      // shading from the normal of the whole cell
      const [p0, p1, p2, p3] = corner.map(([a, b, c]) => at3(a, b, zScale * c));
      const u = p2.map((v, k) => v - p0[k]);
      const w = p3.map((v, k) => v - p1[k]);
      const nrm = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const len = Math.hypot(...nrm) || 1;
      const lambert = Math.max(0, (nrm[0] * LIGHT[0] + nrm[1] * LIGHT[1] + nrm[2] * LIGHT[2]) / len);
      // a piece of the graph over the cell (all of it, or the part above or below the water)
      const piece = (part, key) => {
        const poly = part.map(([a, b, c]) => at3(a, b, zScale * c));
        const mean = part.reduce((m, q) => m + q[2], 0) / part.length;
        const fill =
          color === 'height'
            ? palette((mean - lo) / (hi - lo || 1), 0.8 + 0.2 * lambert)
            : shade(color, 0.62 + 0.38 * lambert);
        items.push({
          depth: mark(i, j, s.depth(centroid(poly))),
          el: (
            <polygon
              key={`${key}${i},${j}`}
              points={pts(poly)}
              fill={fill}
              stroke={mesh ?? fill}
              strokeWidth={mesh ? meshWidth : 0.6}
              strokeLinejoin="round"
            />
          ),
        });
      };

      if (above.length >= 3) piece(above, 's');
      if (below.length >= 3) {
        if (seeThrough) piece(below, 'u');
        const poly = below.map(([a, b]) => at3(a, b, zScale * level));
        items.push({
          depth: mark(i, j, s.depth(centroid(poly))),
          el: seeThrough ? (
            <polygon key={`w${i},${j}`} points={pts(poly)} fill={waterColor} stroke="none" />
          ) : (
            <polygon key={`w${i},${j}`} points={pts(poly)} fill={waterColor} stroke={waterColor} strokeWidth="0.6" />
          ),
        });
      }
    }
  }

  // the level curves, cell by cell, each segment just in front of its cell
  const curveLevels = curve === undefined ? [] : [].concat(curve);
  const colorOf = typeof curveColor === 'function' ? curveColor : () => curveColor;
  const bias = 0.02 * Math.hypot(hx, hy);
  curveLevels.forEach((lv) => {
    levelSegments({ ...g, v: vals }, lv).forEach((seg, k) => {
      const [p, q] = seg;
      p.i = seg.i;
      p.j = seg.j;
      const A3 = at3(p[0], p[1], zScale * lv);
      const B3 = at3(q[0], q[1], zScale * lv);
      const a = s.P(A3);
      const b = s.P(B3);
      const own = cellDepth[p.j * nx + p.i] ?? -Infinity;
      items.push({
        depth: Number.isFinite(own) ? own + 1e-6 : s.depth(A3.map((v, k) => (v + B3[k]) / 2)) + bias,
        el: (
          <line
            key={`c${lv},${k}`}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke={colorOf(lv)}
            strokeWidth={curveWidth}
            strokeLinecap="round"
          />
        ),
      });
    });
  });

  lines.forEach((ln, n) => {
    for (let k = 0; k + 1 < ln.pts.length; k += 1) {
      const A3 = ln.pts[k];
      const B3 = ln.pts[k + 1];
      const a = s.P(A3);
      const b = s.P(B3);
      const mid = A3.map((v, m) => (v + B3[m]) / 2);
      let own = -Infinity;
      if (!param) {
        // the cells on either side of the midpoint (it may lie on a grid line)
        for (const du of [-1e-6, 1e-6]) {
          for (const dv of [-1e-6, 1e-6]) {
            const ci = Math.floor((mid[0] - x0) / hx + du);
            const cj = Math.floor((mid[1] - y0) / hy + dv);
            if (ci >= 0 && ci < nx && cj >= 0 && cj < ny) own = Math.max(own, cellDepth[cj * nx + ci]);
          }
        }
      }
      items.push({
        depth: Number.isFinite(own) ? own + 1e-6 : s.depth(mid) + bias,
        el: (
          <line
            key={`l${n},${k}`}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke={ln.color}
            strokeWidth={ln.width ?? 3}
            strokeLinecap="round"
          />
        ),
      });
    }
  });

  items.sort((A, B) => A.depth - B.depth);

  const onFloor = ([a, b]) => s.P(at3(a, b, floor));
  return (
    <g>
      {floor !== undefined && (
        <g fill="none" strokeLinecap="round">
          {floorSegs.map(({ c, segs }) => (
            <path key={c} d={segmentsPath(segs, onFloor)} stroke={floorColor(c)} strokeWidth={floorWidth} />
          ))}
          {dropCurve &&
            curveLevels.map((lv) => (
              <path
                key={`d${lv}`}
                d={segmentsPath(levelSegments({ ...g, v: vals }, lv), onFloor)}
                stroke={colorOf(lv)}
                strokeWidth={curveWidth}
              />
            ))}
        </g>
      )}
      {items.map((it) => it.el)}
    </g>
  );
}

/** A hex colour scaled by k (k < 1 darker). */
function shade(hexColor, k) {
  const c = [1, 3, 5].map((m) => parseInt(hexColor.slice(m, m + 2), 16));
  return `rgb(${c.map((v) => Math.round(Math.min(255, v * k))).join(',')})`;
}
