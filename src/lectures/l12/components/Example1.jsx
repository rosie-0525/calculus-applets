import ContourPlot from './ContourPlot.jsx';
import Ticks from './Ticks.jsx';
import { lineColor } from './levels.js';
import { MAIN } from './svgmath.jsx';

/** Mark's Example 1: f(x, y) = x³ + xy + y² on the circle g(x, y) = x² + y² = 2. */
export const f = (x, y) => x ** 3 + x * y + y * y;
export const gradF = (x, y) => [3 * x * x + y, x + 2 * y];
export const gradG = (x, y) => [2 * x, 2 * y];
export const R = Math.SQRT2; // the circle's radius
export const onCircle = (t) => [R * Math.cos(t), R * Math.sin(t)];

export const RED = '#8c1515'; // f and ∇f
export const PURPLE = '#6d28d9'; // the constraint g = c and ∇g
export const INK = '#14213d';

const BOX = [
  [-2, 2],
  [-2, 2],
];
export const LEVELS = [-3, -1, 0, 1, 2, 2.5, 3.25]; // Mark's
const tone = (c) => lineColor(0.15 + (0.85 * (LEVELS.indexOf(c) + 0.5)) / LEVELS.length);

/**
 * The points of the circle where f, as a function of the angle t, has a local max or min: the
 * solutions of the Lagrange equations (the derivative of f(√2 cos t, √2 sin t) changes sign there;
 * found by bisection). Each: { t, at, value, lambda, kind }.
 */
const df = (t) => {
  const [x, y] = onCircle(t);
  const [u, v] = gradF(x, y);
  return -u * y + v * x; // ∇f · (−y, x), the derivative along the circle
};
export const EXTREMA = (() => {
  const out = [];
  const N = 720;
  for (let k = 0; k < N; k += 1) {
    let a = (2 * Math.PI * k) / N;
    let b = (2 * Math.PI * (k + 1)) / N;
    if (Math.sign(df(a)) === Math.sign(df(b))) continue;
    const kind = df(a) > 0 ? 'max' : 'min';
    for (let i = 0; i < 60; i += 1) {
      const m = (a + b) / 2;
      if (Math.sign(df(m)) === Math.sign(df(a))) a = m;
      else b = m;
    }
    const at = onCircle(a);
    const [u, v] = gradF(...at);
    const [p, q] = gradG(...at);
    out.push({ t: a, at, value: f(...at), lambda: (u * p + v * q) / (p * p + q * q), kind });
  }
  return out;
})();
export const MAX = EXTREMA.reduce((m, e) => (e.value > m.value ? e : m));
export const MIN = EXTREMA.reduce((m, e) => (e.value < m.value ? e : m));

/** A point of the plot, with its name. */
export function NamedPoint({ p, at, name, dx = 0, dy = -14, color = INK, anchor = 'middle', r = 5.5 }) {
  return (
    <g>
      <circle cx={p.px(at[0])} cy={p.py(at[1])} r={r} fill={color} stroke="#fff" strokeWidth="1.5" />
      {name && (
        <text x={p.px(at[0]) + dx} y={p.py(at[1]) + dy} textAnchor={anchor} fontSize="17" fontFamily={MAIN} fill={color} className="map-label">
          {name}
        </text>
      )}
    </g>
  );
}

/** The circle x² + y² = 2 (solid; dashed in Mark's picture). */
export function Circle({ p, color = PURPLE, width = 2.6 }) {
  return (
    <circle
      cx={p.px(0)}
      cy={p.py(0)}
      r={p.px(R) - p.px(0)}
      fill="none"
      stroke={color}
      strokeWidth={width}
    />
  );
}

/**
 * Mark's picture: the level sets of f on [−2, 2]² (his levels, labelled), with ticks; the
 * circle g = 2 unless `circle` is false; `children(p)` draws more (over the circle), and the level
 * labels keep clear of the pixel rectangles [x0, y0, x1, y1] of `labelAvoid(p)`.
 */
export function Example1Plot({ size = 470, circle = true, highlight, labelAvoid, title, children }) {
  return (
    <ContourPlot
      f={f}
      x={BOX[0]}
      y={BOX[1]}
      size={size}
      pad={[8, 8, 28, 34]}
      n={180}
      levels={LEVELS}
      color={tone}
      highlight={highlight}
      highlightColor={RED}
      highlightWidth={3}
      labels={(c) => String(c).replace('-', '−')}
      labelSize={14}
      labelAvoid={labelAvoid}
      title={title ?? 'Level sets of f(x, y) = x³ + xy + y², the levels −3, −1, 0, 1, 2, 2.5 and 3.25 labelled, and the circle x² + y² = 2'}
    >
      {(p) => (
        <g>
          <Ticks p={p} box={BOX} x={[-2, -1, 0, 1, 2]} y={[-2, -1, 0, 1, 2]} />
          {circle && <Circle p={p} />}
          {children?.(p)}
        </g>
      )}
    </ContourPlot>
  );
}
