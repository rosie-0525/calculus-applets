import Fragment from '../components/Fragment.jsx';
import Space, { Dot3, Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { lineColor } from '../components/levels.js';

export const CARDINAL = '#8c1515';

// sin x + sin y over [−π, π]²: a maximum, a minimum and two saddle points, all where sin x and
// sin y are at their top or bottom
export const f = (x, y) => Math.sin(x) + Math.sin(y);
export const R = [-Math.PI, Math.PI];
export const Z = 0.62; // heights drawn at 0.62 × f
export const LEVELS = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];
export const tone = (c) => lineColor((c + 2) / 4);
export const H = Math.PI / 2;

// with the key press that marks each on the contour plot: the maximum, the minimum, the two saddles
export const POINTS = [
  { at: [H, H], name: 'max', step: 1 },
  { at: [-H, -H], name: 'min', step: 2 },
  { at: [H, -H], name: 'saddle', step: 3 },
  { at: [-H, H], name: 'saddle', step: 3 },
];

// the levels written on the contour plot: 1.5, 1, 0.5 on the line x = π/2 from the maximum down to
// a saddle point (f = 1 + sin y there), −1.5, −1, −0.5 on x = −π/2 from the minimum up to the other
// (f = −1 + sin y), and 0 at the centre, on the line y = −x
export const C_LABELS = [
  ...[1.5, 1, 0.5].map((c) => ({ c, at: [H, Math.asin(c - 1)] })),
  ...[-1.5, -1, -0.5].map((c) => ({ c, at: [-H, Math.asin(c + 1)] })),
  { c: 0, at: [0, 0] },
];
export const cText = (c) => (c < 0 ? `−${-c}` : `${c}`);

/**
 * Example 1 (in place of Mark's Example 1, the Stanford Dish, left out for now): all three in one
 * graph, f(x, y) = sin x + sin y over [−π, π]² (not said on the slide). Its contour plot, with the
 * levels written on it, and the task: label all maximum, minimum and saddle points on it. The
 * answer on the contour plot, one key press each: 1: the maximum at (π/2, π/2) (2); 2: the minimum
 * at (−π/2, −π/2) (−2); 3: the two saddle points, (π/2, −π/2) and (−π/2, π/2), where the level 0
 * crosses itself. 4: the graph, with its level curves and the same points.
 */
export default function Slide11cAllThree() {
  const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };
  return (
    <section className="dense">
      <h2>Example 1</h2>

      <div className="level-stage all3-stage">
        <figure className="all3-plot">
          <ContourPlot f={f} x={R} y={R} size={420} levels={LEVELS} color={tone} width={2} title="A contour plot with a maximum, a minimum and two saddle points, its levels written on it">
            {(p) => (
              <g>
                {C_LABELS.map(({ c, at }) => (
                  <g key={c}>
                    <rect x={p.px(at[0]) - 16} y={p.py(at[1]) - 8} width={32} height={16} rx={3} fill="#fff" />
                    <text x={p.px(at[0])} y={p.py(at[1]) + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill={tone(c)}>
                      {cText(c)}
                    </text>
                  </g>
                ))}
                {POINTS.map(({ at, name, step }) => (
                  <Fragment as="g" index={step} key={name + at[0]}>
                    <circle cx={p.px(at[0])} cy={p.py(at[1])} r="6" fill={CARDINAL} stroke="#fff" strokeWidth="1.5" />
                    <text x={p.px(at[0]) + 10} y={p.py(at[1]) - 9} fontSize="15" fontWeight="700" fill={CARDINAL} {...halo}>
                      {name}
                    </text>
                  </Fragment>
                ))}
              </g>
            )}
          </ContourPlot>
        </figure>

        <div className="level-side all3-side">
          <p className="motiv-question">Label all maximum, minimum and saddle points on the contour plot.</p>

          <Fragment index={4} className="all3-graph">
            <Space width={520} height={370} unit={57} center={[0.5, 0.52]} axes={false} az={45} el={30} swing={6} title="The graph, with its level curves, the maximum, the minimum and the two saddle points">
              {(s) => (
                <g>
                  <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} color="#e4edf1" mesh="rgba(20, 33, 61, 0.16)" curve={LEVELS} curveColor={tone} curveWidth={2.2} />
                  {POINTS.map(({ at, name }) => (
                    <g key={name + at[0]}>
                      <Dot3 s={s} at={[...at, Z * f(...at)]} color={CARDINAL} r={6.5} stroke="#fff" strokeWidth="1.5" />
                      <Label3 s={s} at={[...at, Z * f(...at)]} dx={10} dy={-10} color={CARDINAL} size={17} italic={false} {...halo}>
                        {name}
                      </Label3>
                    </g>
                  ))}
                </g>
              )}
            </Space>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
