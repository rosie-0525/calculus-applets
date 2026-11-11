import { SolveDuo, SOLVE } from '../components/SolutionSets.jsx';

/**
 * Back to linear systems, the examples (the user's request: a better class of examples than the three
 * of Slide16bSolutionExamples, commented out, to show all that can happen, with b varying;
 * SolutionSets.jsx). Two systems of 2 equations in 2 unknowns, each with its matrix, its rank and
 * nullity, and one picture (the user's request: first two, the inputs beside the outputs): N(A)
 * green, C(A) teal, each equation's line gray, and b on top, to drag: the right-hand sides follow.
 * Nothing moves on a key press (the user's request: the user moves b to explore). Off C(A), "No
 * solution"; once b is in C(A), a small button, "All solutions": a click shows them, blue, and what
 * they are.
 * On arrival, 2x + 4y = 6, x + 2y = 1 (A = [2 4; 1 2], rank 1, nullity 1; the two equations
 * different, the user's request): b off the line C(A), no solution; on it, a line parallel to N(A).
 * Key press 1, x + y = 1, y = 2 (A = [1 1; 0 1], rank 2, nullity 0): C(A) = ℝ², N(A) the point 0:
 * always one point.
 * The other two kinds of matrices are on the next slide (Slide16dSolutionSets).
 */
export default function Slide16cSolutionSets() {
  return (
    <section>
      <h2>Back to linear systems</h2>

      <div className="l22-duo">
        <SolveDuo ex={SOLVE.rank1} />
        <SolveDuo ex={SOLVE.shear} at={1} />
      </div>
    </section>
  );
}
