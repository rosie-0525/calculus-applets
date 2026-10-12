import { useMemo } from 'react';
import { sample, levelSegments, segmentsPath, polylines } from './levels.js';

/**
 * A contour plot: the level sets f = c of a function over a rectangle, for the levels in
 * `levels`, drawn in a framed square of `size` pixels (or [width, height]).
 *
 * - `color(c)`: the colour of the level c (one ink by default); `width` its stroke width.
 * - `highlight`: a level drawn on top, thicker, in `highlightColor` (e.g. the level of a slider).
 * - `axes`: draw the x- and y-axes through the origin (faint).
 * - `children(p)`: more drawing, with p.px, p.py mapping the plane to pixels.
 * - `n`: grid cells a side for marching squares.
 * - `pad`: the margin around the plot in pixels, or [top, right, bottom, left] (room for labels).
 * - `labels(c)`: the text of the level c, written on each of its curves at least `labelMin`
 *   pixels long, along the curve, in `labelColor(c)` (`color` by default), on a white patch that
 *   breaks the curve; the places avoid one another, the other curves and the rectangles
 *   [x0, y0, x1, y1] (pixels) of `labelAvoid(p)` (e.g. other labels).
 */

// the width of a label of `size` pixels: digits about 0.52 em, a point 0.26 em, a minus 0.6 em
const textWidth = (t, size) =>
  size * [...t].reduce((w, ch) => w + (ch === '.' ? 0.26 : ch === '\u2212' || ch === '-' ? 0.6 : 0.53), 0);

/** Whether two convex polygons (lists of corners) come within `gap` pixels of each other (separating axes). */
function overlap(A, B, gap) {
  for (const P of [A, B]) {
    for (let k = 0; k < P.length; k += 1) {
      const [x0, y0] = P[k];
      const [x1, y1] = P[(k + 1) % P.length];
      const n = [y0 - y1, x1 - x0];
      const len = Math.hypot(...n) || 1;
      const proj = (Q) => Q.map(([x, y]) => (x * n[0] + y * n[1]) / len);
      const a = proj(A);
      const b = proj(B);
      if (Math.max(...a) + gap < Math.min(...b) || Math.max(...b) + gap < Math.min(...a)) return false;
    }
  }
  return true;
}

/**
 * Where to write the labels: for each curve, the point along it (and the angle of the curve
 * there) where the label's box stays in the frame, clear of the boxes in `avoid` and of the labels
 * already placed, crosses the fewest other curves, and lies on a straight stretch near the middle.
 */
function placeLabels(curves, { text, size, inside, avoid, minLen }) {
  const placed = [];
  const others = curves.flatMap(({ c, pts }) => pts.map(([x, y]) => ({ c, x, y })));
  const lengths = (pts) => {
    const s = [0];
    for (let k = 1; k < pts.length; k += 1) s.push(s[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    return s;
  };
  const pointAt = (pts, s, t) => {
    let k = 1;
    while (k < s.length - 1 && s[k] < t) k += 1;
    const u = (t - s[k - 1]) / (s[k] - s[k - 1] || 1);
    return [pts[k - 1][0] + u * (pts[k][0] - pts[k - 1][0]), pts[k - 1][1] + u * (pts[k][1] - pts[k - 1][1])];
  };
  // the shortest curves first: they have the fewest places
  const order = curves.map((cv) => ({ ...cv, s: lengths(cv.pts) })).sort((a, b) => a.s[a.s.length - 1] - b.s[b.s.length - 1]);
  for (const { c, pts, s } of order) {
    const L = s[s.length - 1];
    if (L < minLen) continue;
    const label = text(c);
    const hw = textWidth(label, size) / 2 + 2;
    const hh = size / 2 + 1;
    const closed = pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
    let best = null;
    for (let t = closed ? 0 : Math.min(hw + 4, L / 2); t <= (closed ? L : L - Math.min(hw + 4, L / 2)); t += 3) {
      const q = pointAt(pts, s, t);
      const a = pointAt(pts, s, closed ? (t - hw + L) % L : Math.max(0, t - hw));
      const b = pointAt(pts, s, closed ? (t + hw) % L : Math.min(L, t + hw));
      let ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const corners = [
        [-hw, -hh],
        [hw, -hh],
        [hw, hh],
        [-hw, hh],
      ].map(([u, v]) => [q[0] + u * cos - v * sin, q[1] + u * sin + v * cos]);
      if (!corners.every(inside)) continue;
      const hit = (r) => corners.some(([x, y]) => x > r[0] && x < r[2] && y > r[1] && y < r[3]) || (q[0] > r[0] - hw && q[0] < r[2] + hw && q[1] > r[1] - hh && q[1] < r[3] + hh);
      if (avoid.some(hit)) continue;
      if (placed.some((o) => overlap(o.corners, corners, 2))) continue;
      // other curves under the box
      let cross = 0;
      for (const o of others) {
        if (o.c === c) continue;
        const dx = o.x - q[0];
        const dy = o.y - q[1];
        if (Math.abs(dx * cos + dy * sin) < hw + 2 && Math.abs(-dx * sin + dy * cos) < hh + 2) cross += 1;
      }
      // how much the curve bends under the label
      const m = pointAt(pts, s, closed ? (t - hw / 2 + L) % L : Math.max(0, t - hw / 2));
      const bend = Math.abs((m[0] - a[0]) * (b[1] - a[1]) - (m[1] - a[1]) * (b[0] - a[0])) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
      const score = 10 * cross + bend + (closed ? 0 : 6 * Math.abs(t / L - 0.5));
      if (!best || score < best.score) best = { score, x: q[0], y: q[1], deg: (ang * 180) / Math.PI, hw, hh, label, c, corners };
    }
    if (best) placed.push(best);
  }
  return placed;
}
export default function ContourPlot({
  f,
  x = [-3, 3],
  y = [-3, 3],
  size = 200,
  n = 120,
  levels,
  color = () => '#14213d',
  width = 1.6,
  highlight,
  highlightColor = '#8c1515',
  highlightWidth = 3,
  labels,
  labelColor,
  labelSize = 11,
  labelMin = 40,
  labelAvoid,
  axes = false,
  pad = 1,
  title = 'Contour plot',
  className = '',
  children,
}) {
  const [W, H] = Array.isArray(size) ? size : [size, size];
  const g = useMemo(() => sample(f, x, y, n, Math.round((n * H) / W)), [f, x, y, n, W, H]);
  const paths = useMemo(() => levels.map((c) => ({ c, segs: levelSegments(g, c) })), [g, levels]);
  const hl = useMemo(() => (highlight === undefined ? null : levelSegments(g, highlight)), [g, highlight]);

  const [pt, pr, pb, pl] = Array.isArray(pad) ? pad : [pad, pad, pad, pad];
  const px = (u) => pl + ((u - x[0]) / (x[1] - x[0])) * (W - pl - pr);
  const py = (v) => H - pb - ((v - y[0]) / (y[1] - y[0])) * (H - pt - pb);
  const map = ([u, v]) => [px(u), py(v)];
  const p = { px, py, W, H };

  const placed = useMemo(() => {
    if (!labels) return [];
    const curves = paths.flatMap(({ c, segs }) => polylines(segs).map((pts) => ({ c, pts: pts.map(map) })));
    const inside = ([u, v]) => u > pl + 1 && u < W - pr - 1 && v > pt + 1 && v < H - pb - 1;
    return placeLabels(curves, { text: labels, size: labelSize, inside, avoid: labelAvoid ? labelAvoid(p) : [], minLen: labelMin });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths, labels, labelSize, labelMin, labelAvoid, W, H, pt, pr, pb, pl]);

  return (
    <svg
      className={`figure-svg contour-plot ${className}`.trim()}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={title}
    >
      {axes && (
        <g stroke="#c7ccd3" strokeWidth="1">
          <line x1={px(x[0])} y1={py(0)} x2={px(x[1])} y2={py(0)} />
          <line x1={px(0)} y1={py(y[0])} x2={px(0)} y2={py(y[1])} />
        </g>
      )}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {paths.map(({ c, segs }) => (
          <path key={c} d={segmentsPath(segs, map)} stroke={color(c)} strokeWidth={width} />
        ))}
        {hl && <path d={segmentsPath(hl, map)} stroke={highlightColor} strokeWidth={highlightWidth} />}
      </g>
      {placed.map((l, k) => (
        <g key={k} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.deg.toFixed(1)})`}>
          <rect x={-l.hw} y={-l.hh} width={2 * l.hw} height={2 * l.hh} fill="#fff" />
          <text y={labelSize * 0.36} textAnchor="middle" fontSize={labelSize} fontWeight="600" fill={(labelColor ?? color)(l.c)}>
            {l.label}
          </text>
        </g>
      ))}
      {typeof children === 'function' ? children(p) : children}
    </svg>
  );
}
