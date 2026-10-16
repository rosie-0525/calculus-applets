import ContourPlot from './ContourPlot.jsx';
import Ticks from './Ticks.jsx';
import { lineColor } from './levels.js';
import { MAIN } from './svgmath.jsx';

/** Mark's Example 1 (Example 2 here): f(x, y) = x³ + xy + y² and its gradient. */
export const cubic = (x, y) => x ** 3 + x * y + y * y;
export const cubicGrad = (x, y) => [3 * x * x + y, x + 2 * y];

const BOX = [
  [-4.6, 4.6],
  [-4.6, 4.6],
];
export const CUBIC_LEVELS = [-50, -20, -5, 1, 8, 35, 100]; // Mark's levels
const tone = (c) => lineColor(0.25 + (0.75 * (CUBIC_LEVELS.indexOf(c) + 0.5)) / CUBIC_LEVELS.length);

/** A point of the plot with its name, e.g. "(1, 0)". */
export function NamedPoint({ p, at, name, dx = 0, dy = -14, color = '#14213d', anchor = 'middle' }) {
  return (
    <g>
      <circle cx={p.px(at[0])} cy={p.py(at[1])} r="5.5" fill={color} stroke="#fff" strokeWidth="1.5" />
      {name && (
        <text x={p.px(at[0]) + dx} y={p.py(at[1]) + dy} textAnchor={anchor} fontSize="17" fontFamily={MAIN} fill={color} className="map-label">
          {name}
        </text>
      )}
    </g>
  );
}

/** The contour plot of Mark's Example 1, his levels labelled, with ticks; `children(p)` draws more. */
export function CubicContour({ size = 440, title, children }) {
  return (
    <ContourPlot
      f={cubic}
      x={BOX[0]}
      y={BOX[1]}
      size={size}
      pad={[8, 8, 28, 34]}
      n={160}
      levels={CUBIC_LEVELS}
      color={tone}
      labels={(c) => String(c).replace('-', '−')}
      labelSize={13}
      title={title ?? 'Contour plot of f(x, y) = x³ + xy + y², with the levels −50, −20, −5, 1, 8, 35 and 100 labelled'}
    >
      {(p) => (
        <g>
          <Ticks p={p} box={BOX} x={[-4, -2, 0, 2, 4]} y={[-4, -2, 0, 2, 4]} />
          {children?.(p)}
        </g>
      )}
    </ContourPlot>
  );
}
