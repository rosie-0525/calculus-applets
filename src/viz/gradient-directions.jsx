import '../lectures/l11/styles/deck.css';
import { CubicContour, NamedPoint } from '../lectures/l11/components/Cubic.jsx';
import { GradArrow, MORE } from '../lectures/l11/slides/Slide08Example2.jsx';

export const lecture = 11;

/* Example 2's picture with every arrow showing, without the questions (the caption asks the last
   one): the contour plot of f(x, y) = x³ + xy + y², and the direction of ∇f at (1, 0), at
   (−2, −1) and at seven more points of the level curves. */
export default function GradientDirections() {
  return (
    <CubicContour title="Contour plot of f(x, y) = x³ + xy + y², with arrows in the direction of the gradient at nine points of the level curves">
      {(p) => (
        <g>
          {MORE.map((q) => (
            <GradArrow key={q.join()} p={p} q={q} />
          ))}
          <GradArrow p={p} q={[1, 0]} />
          <GradArrow p={p} q={[-2, -1]} />
          <NamedPoint p={p} at={[1, 0]} name="(1, 0)" dx={0} dy={-12} />
          <NamedPoint p={p} at={[-2, -1]} name="(−2, −1)" dx={-6} dy={-10} anchor="end" />
        </g>
      )}
    </CubicContour>
  );
}
