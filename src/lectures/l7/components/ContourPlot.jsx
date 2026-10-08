import { useMemo } from 'react';
import { sample, levelSegments, segmentsPath } from './levels.js';

/**
 * A contour plot: the level sets f = c of a function over a rectangle, for the levels in
 * `levels`, drawn in a framed square of `size` pixels (or [width, height]).
 *
 * - `color(c)`: the colour of the level c (one ink by default); `width` its stroke width.
 * - `highlight`: a level drawn on top, thicker, in `highlightColor` (e.g. the level of a slider).
 * - `axes`: draw the x- and y-axes through the origin (faint).
 * - `children(p)`: more drawing, with p.px, p.py mapping the plane to pixels.
 * - `n`: grid cells a side for marching squares.
 */
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

  const px = (u) => pad + ((u - x[0]) / (x[1] - x[0])) * (W - 2 * pad);
  const py = (v) => H - pad - ((v - y[0]) / (y[1] - y[0])) * (H - 2 * pad);
  const map = ([u, v]) => [px(u), py(v)];
  const p = { px, py, W, H };

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
      {typeof children === 'function' ? children(p) : children}
    </svg>
  );
}
