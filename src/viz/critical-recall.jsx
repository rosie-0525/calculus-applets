import '../lectures/l9/styles/deck.css';
import Plane from '../lectures/l9/components/Plane.jsx';
import { Flat, path, f, XR, YR, RED, TEAL, GRAY, INK } from '../lectures/l9/slides/Slide03Recall.jsx';

export const lecture = 9;

/* The slide's picture with everything showing, without the bullets beside it (the caption says
   them): the graph of f, a local maximum at −2 and a local minimum at 0 with their horizontal
   tangent lines, and at 2 a critical point that is neither. */
export default function CriticalRecall() {
  return (
    <Plane xRange={XR} yRange={YR} unit={[80, 22]} xTicks={[-2, -1, 1, 2, 3]} yTicks={[]} grid={false} title="The graph of a function with a local maximum at −2, a local minimum at 0, and a flat point at 2 that is neither">
      {(p) => (
        <g>
          <path d={path(p, XR)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <text x={p.px(-2.55)} y={p.py(-3.2)} fill={INK} fontSize="20" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
            y = f(x)
          </text>
          <Flat p={p} c={-2} color={RED} label="local maximum" dy={-16} />
          <Flat p={p} c={0} color={TEAL} label="local minimum" dy={30} dx={14} anchor="start" />
          <Flat p={p} c={2} color={GRAY} label="neither" dy={30} dx={10} anchor="start" />
        </g>
      )}
    </Plane>
  );
}
