import '../lectures/l7/styles/deck.css';
import Space from '../lectures/l7/components/Space.jsx';
import Surface from '../lectures/l7/components/Surface.jsx';
import ContourPlot from '../lectures/l7/components/ContourPlot.jsx';
import { hills as f, HILLS_R as R, hillsTone as tone } from '../lectures/l7/components/hills.js';
import { HEIGHTS, TOP_R, LABELS, toneOf } from '../lectures/l7/slides/Slide10ContourPlot.jsx';

export const lecture = 7;

/* The slide's two pictures without its words: the graph with its level curves for c = −2, …, 3,
   and the same curves seen from above, labelled with their levels. */
export default function ContourPlotApplet() {
  return (
    <div className="steep">
      <figure>
        <Space width={560} height={380} unit={68} center={[0.5, 0.62]} axes={false} az={102} el={28} swing={6} title="The graph of the function with two hills, with its level curves for c = −2, −1, 0, 1, 2, 3">
          {(s) => <Surface s={s} f={f} x={R} y={R} n={34} zScale={1.1} mesh="rgba(15, 40, 50, 0.12)" curve={HEIGHTS} curveColor={tone} curveWidth={2.4} />}
        </Space>
        <figcaption>Graph of f, with its level sets</figcaption>
      </figure>
      <figure>
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
        <figcaption>Contour plot</figcaption>
      </figure>
    </div>
  );
}
