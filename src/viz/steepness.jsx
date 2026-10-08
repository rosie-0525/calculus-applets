import '../lectures/l7/styles/deck.css';
import Space, { Dot3, Label3 } from '../lectures/l7/components/Space.jsx';
import ContourPlot from '../lectures/l7/components/ContourPlot.jsx';
import { HILLS_LEVELS as LEVELS, hillsTone as tone } from '../lectures/l7/components/hills.js';
import { Graph, PATHS, downTo, f, XR, YR, Z, CARDINAL, AMBER } from '../lectures/l7/slides/Slide11Steepness.jsx';

export const lecture = 7;

const HALO = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };

/* The slide with everything showing, without the rule (the caption says it): the hill with a cliff
   on one side, its contour plot, and a path down each side with its crossings of the levels. */
export default function Steepness() {
  return (
    <div className="steep">
      <figure className="steep-3d">
        <Space width={600} height={350} unit={76} center={[0.5, 0.7]} axes={false} az={114} el={22} swing={6} title="The graph of a hill with a cliff on its west side and a gentle slope on its east side, with its level curves">
          {(s) => (
            <g>
              <Graph s={s} paths={2} />
              {PATHS.map(({ side, color, dots }) => (
                <g key={side}>
                  {dots.map(({ c, x }) => (
                    <Dot3 key={c} s={s} at={[x, 0, Z * c]} color={color} r={4} stroke="#fff" strokeWidth="1.2" />
                  ))}
                  {side < 0 ? (
                    <Label3 s={s} at={[downTo(-1, 0.9), 0, Z * 0.9]} dx={-16} dy={0} color={CARDINAL} size={17} italic={false} textAnchor="end" {...HALO}>
                      steep
                    </Label3>
                  ) : (
                    <Label3 s={s} at={[downTo(1, 0.6), 0, Z * 0.6]} dx={6} dy={-14} color={AMBER} size={17} italic={false} {...HALO}>
                      less steep
                    </Label3>
                  )}
                </g>
              ))}
            </g>
          )}
        </Space>
        <figcaption>Graph of f</figcaption>
      </figure>

      <figure className="steep-top">
        <ContourPlot f={f} x={XR} y={YR} size={[400, 320]} levels={LEVELS} color={tone} width={2} title="The contour plot of the hill, every 0.3, with the two paths down and their crossings with the level curves">
          {(p) => (
            <g>
              {PATHS.map(({ side, color, from, to, dots, note }) => (
                <g key={side}>
                  <line x1={p.px(from)} y1={p.py(0)} x2={p.px(to)} y2={p.py(0)} stroke={color} strokeWidth="3" strokeLinecap="round" />
                  {dots.map(({ c, x }) => (
                    <circle key={c} cx={p.px(x)} cy={p.py(0)} r="4" fill={color} stroke="#fff" strokeWidth="1.2" />
                  ))}
                  <text x={(p.px(from) + p.px(to)) / 2} y={p.py(0) + (side < 0 ? -80 : 88)} textAnchor="middle" fontSize="15" fontWeight="700" fill={color} {...HALO}>
                    {note}
                  </text>
                </g>
              ))}
            </g>
          )}
        </ContourPlot>
        <figcaption>Contour plot</figcaption>
      </figure>
    </div>
  );
}
