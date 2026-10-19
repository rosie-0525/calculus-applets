import Space, { PlanePatch, Dot3, Seg3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { lineColor } from '../components/levels.js';
import { f, R, onCircle, MAX, MIN, RED, PURPLE, LEVELS } from '../components/Example1.jsx';

export const FLOOR = -1.35;
export const Z = 0.32;
export const polar = (r, t) => [r * Math.cos(t), r * Math.sin(t)];
export const N = 180;
export const LIFTED = Array.from({ length: N + 1 }, (_, k) => {
  const [x, y] = onCircle((2 * Math.PI * k) / N);
  return [x, y, Z * f(x, y)];
});
export const FLOOR_CIRCLE = Array.from({ length: N + 1 }, (_, k) => [...onCircle((2 * Math.PI * k) / N), FLOOR]);
export const tone = (c) => lineColor(0.15 + (0.85 * (LEVELS.indexOf(c) + 0.5)) / LEVELS.length);

/**
 * Mark's Example 1's f(x, y) = x³ + xy + y² over the disk x² + y² ≤ 2, with the circle x² + y² = 2 on the
 * floor (with the contour plot of f) and lifted onto the graph, its rim (red): the highest
 * and the lowest points of the rim, the max and the min of f on the circle, are marked.
 */
export function CoverFigure() {
  return (
    <Space
      width={500}
      height={440}
      unit={112}
      center={[0.5, 0.5]}
      axes={false}
      az={75}
      el={20}
      swing={10}
      title="The graph of f(x, y) = x³ + xy + y² over the disk x² + y² ≤ 2, with the circle x² + y² = 2 on the floor and lifted onto the graph, its highest and lowest points marked"
    >
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={[-2, 2]} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <Surface
            s={s}
            f={f}
            param={polar}
            x={[0, R]}
            y={[0, 2 * Math.PI]}
            n={[16, 64]}
            zScale={Z}
            mesh="rgba(15, 40, 50, 0.14)"
            floor={FLOOR}
            floorLevels={LEVELS}
            floorColor={tone}
            lines={[{ pts: LIFTED, color: RED, width: 3.2 }]}
            under={
              <g>
                <polyline
                  points={FLOOR_CIRCLE.map((q) => s.P(q).join(',')).join(' ')}
                  fill="none"
                  stroke={PURPLE}
                  strokeWidth="2.4"
                />
                {[MAX, MIN].map((e) => (
                  <Seg3 key={e.kind} s={s} from={[...e.at, FLOOR]} to={[...e.at, Z * e.value]} color="#6b7280" width={1.2} dashed />
                ))}
              </g>
            }
          />
          {[MAX, MIN].map((e) => (
            <Dot3 key={e.kind} s={s} at={[...e.at, Z * e.value]} color={RED} r={6.5} stroke="#fff" strokeWidth="1.6" />
          ))}
        </g>
      )}
    </Space>
  );
}

export default function Slide01Title() {
  return (
    <section className="title-slide">
      <div className="title-fig">
        <CoverFigure />
      </div>
      <div>
        <p className="eyebrow">Math 51 · 19 October 2026</p>
        <h1>Constrained&nbsp;optimization via&nbsp;Lagrange&nbsp;multipliers</h1>
        <p className="reference">Textbook Chapter 12 – Constrained optimization via Lagrange multipliers</p>
      </div>
    </section>
  );
}
