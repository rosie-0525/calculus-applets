import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import Ticks from '../components/Ticks.jsx';
import { lineColor } from '../components/levels.js';
import { PURPLE } from '../components/Example1.jsx';

export const f = (x, y) => y;
export const BOX = [
  [-2, 2],
  [-1, 2],
];
export const LEVELS = [-0.5, 0, 0.5, 1, 1.5];
export const tone = (c) => lineColor(0.15 + (0.85 * (LEVELS.indexOf(c) + 0.5)) / LEVELS.length);
// the curve x² = y³, that is y = |x|^(2/3), with a cusp at (0, 0)
export const CURVE = Array.from({ length: 201 }, (_, k) => {
  const x = -2 + (4 * k) / 200;
  return [x, Math.abs(x) ** (2 / 3)];
});
// the level lines' labels keep clear of the curve, and of the cusp most of all (pixel boxes)
export const avoid = (p) => [
  [p.px(0) - 30, p.py(0) - 30, p.px(0) + 30, p.py(0) + 30],
  ...CURVE.filter((_, k) => k % 2 === 0).map(([x, y]) => [p.px(x) - 3, p.py(y) - 3, p.px(x) + 3, p.py(y) + 3]),
];

/**
 * Example 4 (board; Christine's Example 3): minimize y subject to x² − y³ = 0, the curve with a
 * cusp at (0, 0), drawn over the level lines of f = y, on key press 1 (large, with the axes named,
 * and the labels of the level lines clear of the curve and its cusp). The three parts were
 * removed at the user's request; the answer is commented out: the minimum is at (0, 0), where
 * ∇g = 0 and no λ works.
 */
export default function Slide10Example3() {
  return (
    <section>
      <h2>
        Example 4 <span className="board-pill">board</span>
      </h2>

      <div className="stage">
        <div className="stage-text">
          <p>
            Minimize <Tex tex="f(x,y)=y" /> subject to{' '}
            <span className="l12-nowrap">
              <Tex tex="g(x,y)=x^2-y^3=0" />.
            </span>
          </p>
          {/* ∇f = (0, 1), ∇g = (2x, −3y²). ∇g = 0 at (0, 0), which is on the curve. ∇f = λ∇g:
              0 = 2λx and 1 = −3λy², so λ ≠ 0, x = 0, then y³ = x² = 0, y = 0, and 1 = 0: no
              solution. The only candidate is (0, 0), the minimum: on the curve, y³ = x² ≥ 0, so
              y ≥ 0 = f(0, 0). (The level line y = 0 is not tangent to the curve there: the curve has a
              cusp.) */}
        </div>

        <Fragment index={1} className="stage-fig">
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
        </Fragment>
      </div>
    </section>
  );
}
