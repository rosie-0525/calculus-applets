import { useRef } from 'react';
import ContourPlot from './ContourPlot.jsx';
import Tex, { r } from './Tex.jsx';
import { INK, RED } from './la.js';
import { PRINT } from './print.js';
import { useClock } from './clock.js';

/** The mountain h(x, y) = 200 − 3x² − xy − y² and Janja's path p(t) = (t − 20, 3t − 60) (Example 4). */
export const h = (x, y) => 200 - 3 * x * x - x * y - y * y;
export const p = (t) => [t - 20, 3 * t - 60];

const X = [-40, 40];
const Y = [-75, 45];
const LEVELS = [0, -1000, -2000, -4000, -6000, -9000, -12000];
const T_END = 26; // minutes drawn (the summit is at t = 20)
const CLIMB = 9; // seconds for the whole path
const PERIOD = 13; // then a rest before she starts again
const fmt = (v) => Math.round(v).toLocaleString('en-US').replace(/-/g, '−');

/**
 * The contour plot of the mountain (grey level curves, labelled) with Janja's path in red, the
 * summit, and Janja running up the path on a loop (still at t = 12 in print); the time and the
 * altitude h(p(t)) under the plot.
 */
export default function Climb({ width = 330, height = 470 }) {
  const ref = useRef(null);
  const clock = useClock(ref);
  const t = PRINT ? 12 : Math.min(T_END, ((clock % PERIOD) / CLIMB) * T_END);
  const [x, y] = p(t);
  const path = Array.from({ length: 53 }, (_, k) => p((T_END * k) / 52));
  return (
    <div ref={ref} className="l17-climb">
      <ContourPlot
        f={h}
        x={X}
        y={Y}
        size={[width, height]}
        n={90}
        levels={LEVELS}
        color={() => '#9aa5b1'}
        width={1.2}
        labels={(c) => fmt(c)}
        labelSize={12}
        labelColor={() => '#6b7280'}
        labelMin={70}
        axes
        pad={1}
        title="The contour plot of the mountain, Janja's straight path up to the summit, and Janja on it"
      >
        {(q) => (
          <g>
            <polyline points={path.map(([u, v]) => `${q.px(u).toFixed(1)},${q.py(v).toFixed(1)}`).join(' ')} fill="none" stroke={RED} strokeWidth="2.4" />
            <circle cx={q.px(0)} cy={q.py(0)} r="3.2" fill={INK} />
            <text x={q.px(0) + 7} y={q.py(0) - 6} fontSize="12" fontWeight="600" fill={INK}>
              summit
            </text>
            <circle cx={q.px(-20)} cy={q.py(-60)} r="3" fill={RED} />
            <text x={q.px(-20) + 7} y={q.py(-60) + 4} fontSize="12" fontWeight="600" fill={RED}>
              p(0)
            </text>
            <circle cx={q.px(x)} cy={q.py(y)} r="6.5" fill={RED} stroke="#fff" strokeWidth="2" />
            <text x={q.px(x) - 10} y={q.py(y) + 5} fontSize="13" fontWeight="700" fontStyle="italic" fill={RED} textAnchor="end" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 }}>
              p(t)
            </text>
          </g>
        )}
      </ContourPlot>
      <p className="l17-climb-readout">
        <Tex tex={r`t=${Math.round(t)}\text{ min}`} />
        <Tex tex={r`h(\mathbf p(t))=${fmt(h(x, y))}`} />
      </p>
    </div>
  );
}
