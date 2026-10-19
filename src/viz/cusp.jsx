import '../lectures/l12/styles/deck.css';
import ContourPlot from '../lectures/l12/components/ContourPlot.jsx';
import Ticks from '../lectures/l12/components/Ticks.jsx';
import { PURPLE } from '../lectures/l12/components/Example1.jsx';
import { f, BOX, LEVELS, tone, CURVE, avoid } from '../lectures/l12/slides/Slide10Example3.jsx';

export const lecture = 12;

/* Example 4's picture, without the problem (the caption says it): the curve x² = y³, with a cusp at
   the origin, over the level lines of f(x, y) = y, their labels clear of the curve. */
export default function Cusp() {
  return (
    <ContourPlot
      f={f}
      x={BOX[0]}
      y={BOX[1]}
      size={[600, 465]}
      pad={[8, 10, 50, 48]}
      n={40}
      levels={LEVELS}
      color={tone}
      labels={(c) => String(c).replace('-', '−')}
      labelSize={15}
      labelAvoid={avoid}
      title="Level lines y = −0.5, 0, 0.5, 1 and 1.5 of f(x, y) = y, and the curve x² = y³, with a cusp at the origin"
    >
      {(p) => (
        <g>
          <Ticks p={p} box={BOX} x={[-2, -1, 0, 1, 2]} y={[-1, 0, 1, 2]} names={['x', 'y']} />
          <polyline
            points={CURVE.map(([x, y]) => `${p.px(x).toFixed(1)},${p.py(y).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={PURPLE}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </g>
      )}
    </ContourPlot>
  );
}
