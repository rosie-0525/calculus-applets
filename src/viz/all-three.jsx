import '../lectures/l7/styles/deck.css';
import Space, { Dot3, Label3 } from '../lectures/l7/components/Space.jsx';
import Surface from '../lectures/l7/components/Surface.jsx';
import ContourPlot from '../lectures/l7/components/ContourPlot.jsx';
import { f, R, Z, LEVELS, tone, POINTS, C_LABELS, cText, CARDINAL } from '../lectures/l7/slides/Slide11cAllThree.jsx';

export const lecture = 7;

const HALO = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };

/* Example 1 of the slides with its answer: the contour plot of sin x + sin y with the maximum, the
   minimum and the two saddle points marked, and the graph with the same points. */
export default function AllThree() {
  return (
    <div className="viz-row all3-pair">
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
              {POINTS.map(({ at, name }) => (
                <g key={name + at[0]}>
                  <circle cx={p.px(at[0])} cy={p.py(at[1])} r="6" fill={CARDINAL} stroke="#fff" strokeWidth="1.5" />
                  <text x={p.px(at[0]) + 10} y={p.py(at[1]) - 9} fontSize="15" fontWeight="700" fill={CARDINAL} {...HALO}>
                    {name}
                  </text>
                </g>
              ))}
            </g>
          )}
        </ContourPlot>
      </figure>

      <figure className="all3-graph">
        <Space width={520} height={370} unit={57} center={[0.5, 0.52]} axes={false} az={45} el={30} swing={6} title="The graph, with its level curves, the maximum, the minimum and the two saddle points">
          {(s) => (
            <g>
              <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} color="#e4edf1" mesh="rgba(20, 33, 61, 0.16)" curve={LEVELS} curveColor={tone} curveWidth={2.2} />
              {POINTS.map(({ at, name }) => (
                <g key={name + at[0]}>
                  <Dot3 s={s} at={[...at, Z * f(...at)]} color={CARDINAL} r={6.5} stroke="#fff" strokeWidth="1.5" />
                  <Label3 s={s} at={[...at, Z * f(...at)]} dx={10} dy={-10} color={CARDINAL} size={17} italic={false} {...HALO}>
                    {name}
                  </Label3>
                </g>
              ))}
            </g>
          )}
        </Space>
      </figure>
    </div>
  );
}
