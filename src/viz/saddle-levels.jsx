import '../lectures/l7/styles/deck.css';
import Space from '../lectures/l7/components/Space.jsx';
import Surface from '../lectures/l7/components/Surface.jsx';
import ContourPlot from '../lectures/l7/components/ContourPlot.jsx';
import { AxisNames, onGraph, STAGES, f, R, LEVELS, Z, VIEW, ramp, CARDINAL, MESH, FILL, AXIS } from '../lectures/l7/slides/Slide14bExample3D.jsx';

export const lecture = 7;

const LINES = onGraph(STAGES.flat(), 3);

/* The slide with everything showing: the saddle z = xy/4.5 with all its level curves on it (the
   level 0, the two axes, in red), beside its contour plot. */
export default function SaddleLevels() {
  return (
    <div className="ex3d">
      <figure className="ex3d-graph">
        <Space width={720} height={460} unit={80} center={[0.5, 0.38]} axes={false} {...VIEW} swing={8} title="A saddle, with its level curves on it">
          {(s) => (
            <g>
              <Surface s={s} f={f} x={R} y={R} n={30} zScale={Z} color={FILL} mesh={MESH} lines={LINES} />
              <AxisNames s={s} />
            </g>
          )}
        </Space>
        <figcaption>Graph of f</figcaption>
      </figure>

      <figure className="ex3d-plot">
        <ContourPlot f={f} x={R} y={R} size={340} levels={LEVELS} color={ramp} width={1.8} axes title="The contour plot of the saddle">
          {(p) => (
            <g>
              <g stroke={CARDINAL} strokeWidth="3" strokeLinecap="round">
                <line x1={p.px(R[0])} y1={p.py(0)} x2={p.px(R[1])} y2={p.py(0)} />
                <line x1={p.px(0)} y1={p.py(R[0])} x2={p.px(0)} y2={p.py(R[1])} />
              </g>
              <g fill={AXIS} fontSize="17" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif" paintOrder="stroke" stroke="#fff" strokeWidth="4">
                <text x={p.px(R[1]) - 14} y={p.py(0) + 20}>
                  x
                </text>
                <text x={p.px(0) + 8} y={p.py(R[1]) + 18}>
                  y
                </text>
              </g>
            </g>
          )}
        </ContourPlot>
        <figcaption>Contour plot</figcaption>
      </figure>
    </div>
  );
}
