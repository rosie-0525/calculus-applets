import { SolveDuo, SOLVE } from '../components/SolutionSets.jsx';

/**
 * Back to linear systems, the examples, continued (SolutionSets.jsx; see Slide16cSolutionSets): the
 * two systems that are not square, each with one picture and b to drag.
 * On arrival, 2x = 4, x = 3, the lecture's first system (2 equations, 1 unknown: A = [2; 1], rank 1,
 * nullity 0): the unknown's number line is the horizontal axis, N(A) the point 0, each equation's
 * solution a gray tick; b off the line C(A), no solution; on it, one point.
 * Key press 1, x + y + z = 2 (1 equation, 3 unknowns: A = [1 1 1], rank 1, nullity 2): N(A) a
 * plane, and on top b's number line, C(A) = ℝ, along which b is dragged: always a plane parallel to
 * N(A).
 */
export default function Slide16dSolutionSets() {
  return (
    <section>
      <h2>Back to linear systems</h2>

      <div className="l22-duo">
        <SolveDuo ex={SOLVE.tall} />
        <SolveDuo ex={SOLVE.wide} at={1} />
      </div>
    </section>
  );
}
