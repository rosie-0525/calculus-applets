import '../lectures/l11/styles/deck.css';
import ContourPlot from '../lectures/l11/components/ContourPlot.jsx';
import { Arrow } from '../lectures/l11/components/Plane.jsx';
import { hills as f, HILLS_LEVELS, hillsTone } from '../lectures/l11/components/hills.js';
import { I, B, MAIN } from '../lectures/l11/components/svgmath.jsx';
import { HillGraph, A, U, X, Y, tip, RED, BLUE } from '../lectures/l11/slides/Slide13Steepest.jsx';

export const lecture = 11;

/*
 * Direction of fastest increase without the theorem (the caption says it, and why, from the slide
 * after it): the graph of the hill, with a on its slope and the paths from a in the directions of
 * ∇f(a) (up, red) and −∇f(a) (down, blue), beside the contour plot with ∇f(a) and −∇f(a).
 */
export default function FastestIncrease() {
  const down = [-U[0], -U[1]];
  return (
    <div className="l10-st-pics">
      <HillGraph />
      <ContourPlot
        f={f}
        x={X}
        y={Y}
        size={300}
        levels={HILLS_LEVELS.concat([0.15, 0.45, 0.75, 1.05, 1.35, 1.65])}
        color={hillsTone}
        title="Contour plot of a hill, with the gradient and minus the gradient at a point on its slope"
      >
        {(p) => (
          <g>
            <Arrow p={p} from={A} to={tip(U)} color={RED} width={3.5} head={13} />
            <Arrow p={p} from={A} to={tip(down)} color={BLUE} width={3.5} head={13} />
            <circle cx={p.px(A[0])} cy={p.py(A[1])} r="5.5" fill="#14213d" stroke="#fff" strokeWidth="1.5" />
            <text x={p.px(tip(U)[0]) - 4} y={p.py(tip(U)[1]) - 10} fontSize="19" fontFamily={MAIN} fill={RED} textAnchor="middle" className="map-label">
              ∇<I>f</I>(<B>a</B>)
            </text>
            <text x={p.px(tip(down)[0])} y={p.py(tip(down)[1]) + 24} fontSize="19" fontFamily={MAIN} fill={BLUE} textAnchor="middle" className="map-label">
              −∇<I>f</I>(<B>a</B>)
            </text>
            <text x={p.px(A[0]) - 10} y={p.py(A[1]) + 22} fontSize="19" fontFamily={MAIN} fill="#14213d" textAnchor="end" className="map-label">
              <B>a</B>
            </text>
          </g>
        )}
      </ContourPlot>
    </div>
  );
}
