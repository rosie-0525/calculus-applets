import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { hills as f, HILLS_R as R, hillsTone as tone, BIG_TOP, SMALL_TOP, toLevel } from '../components/hills.js';

// The heights on this slide are those of slide 9 shifted and scaled, (h − 0.75)/0.3, so that the
// levels, every 0.3 from 0.15, are the integers −2, −1, …, 3: f = HEIGHT(c) on the graph is the
// level c here. The lowest one also runs through the valley between the hills and the ground
// rising at the corners.
export const LEVELS = [-2, -1, 0, 1, 2, 3];
export const HEIGHT = (c) => 0.75 + 0.3 * c;
export const HEIGHTS = LEVELS.map(HEIGHT);
export const toneOf = (c) => tone(HEIGHT(c));

// the contour plot shows a little less than the graph: all the closed level curves are inside
export const TOP_R = [-2.6, 2.6];

// the levels written on the contour plot, each at its own angle down the big hill so that the
// labels do not crowd (3, a small ring at the top, is left bare), down the small hill for the
// curves around it alone, and on each side of the valley, on the way down from the corner
export const LABELS = [
  ...[
    [2, 70],
    [1, 20],
    [0, -30],
    [-1, 110],
    [-2, 165],
  ].map(([c, angle]) => ({ c, at: toLevel(BIG_TOP, angle, HEIGHT(c)) })),
  ...[
    [1, 200],
    [0, 240],
  ].map(([c, angle]) => ({ c, at: toLevel(SMALL_TOP, angle, HEIGHT(c)) })),
  ...[
    [[-2.6, 2.6], -45, -1],
    [[-2.6, 2.6], -45, -2],
    [[2.6, -2.6], 135, -2],
  ].map(([corner, angle, c]) => ({ c, at: toLevel(corner, angle, HEIGHT(c)) })),
];

/**
 * Contour plots, from the level sets of slide 9 (the same two hills, the same view). The level
 * sets f(x, y) = c for c = −2, −1, …, 3 at once, on the graph, darker for higher: closed around the
 * hills, open on the two sides, where the ground rises out of the valley. Key press 1: seen from
 * above, labelled: the contour plot. 2: Mark's definition.
 */
export default function Slide10ContourPlot() {
  return (
    <section className="dense">
      <h2>Contour plots</h2>

      <div className="level-stage">
        <figure className="level-3d">
          <Space width={560} height={380} unit={68} center={[0.5, 0.62]} axes={false} az={102} el={28} swing={6} title="The graph of the function with two hills, with its level curves for c = −2, −1, 0, 1, 2, 3">
            {(s) => <Surface s={s} f={f} x={R} y={R} n={34} zScale={1.1} mesh="rgba(15, 40, 50, 0.12)" curve={HEIGHTS} curveColor={tone} curveWidth={2.4} />}
          </Space>
        </figure>

        <div className="level-side">
          <p className="motiv-question">
            Draw the level sets <Tex tex="f(x,y)=c" /> with <Tex tex={r`c=-2,\ -1,\ 0,\ 1,\ 2,\ 3`} />.
          </p>

          <Fragment index={1} className="level-below contour-below">
            <ContourPlot f={f} x={TOP_R} y={TOP_R} size={320} levels={HEIGHTS} color={tone} width={2} title="The contour plot of the function with two hills, the level curves labelled with their level c">
              {(p) =>
                LABELS.filter((l) => l.at).map(({ c, at }) => (
                  <g key={`${c}-${at[0]}`}>
                    <rect x={p.px(at[0]) - 15} y={p.py(at[1]) - 8} width={30} height={16} rx={3} fill="#fff" />
                    <text x={p.px(at[0])} y={p.py(at[1]) + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill={toneOf(c)}>
                      {c < 0 ? `−${-c}` : c}
                    </text>
                  </g>
                ))
              }
            </ContourPlot>
          </Fragment>
        </div>
      </div>

      <Fragment index={2} className="block definition graph-def">
        <p>
          If <Tex tex="f" /> is a function <Tex tex={r`\mathbb{R}^2\to\mathbb{R}`} />, then a{' '}
          <strong>contour plot</strong> for <Tex tex="f" /> is a picture in <Tex tex={r`\mathbb{R}^2`} /> that
          depicts the level sets <Tex tex="f(x,y)=c" /> with <Tex tex="c" /> evenly spaced.
        </p>
      </Fragment>
    </section>
  );
}
