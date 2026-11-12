import { SolveDuo, SOLVE, DUO_STEPS } from '../components/SolutionSets.jsx';

/**
 * How many solutions?, the examples, continued (SolutionSets.jsx; see Slide16cSolutionSets): the
 * two systems that are not square, each with one picture, built up a key press at a time (T_A's
 * animation, C(A), rank, b, to drag, then N(A), nullity).
 * On arrival, 2x = 4, x = 3, the lecture's first system (2 equations, 1 unknown: A = [2; 1], rank 1,
 * nullity 0); key presses 1 to 6, its picture: the unknown's number line is the horizontal axis
 * (T_A moves it onto the line C(A)), N(A) the point 0; b off
 * the line C(A), no solution; on it, one point. No button for this example (the user's request: "do
 * the Solution!/No solution instead of "All solution""): under its picture, with b, "No solution" or
 * "Solution!"; the solution is not drawn.
 * Key press 7, x + y + z = 2 (1 equation, 3 unknowns: A = [1 1 1], rank 1, nullity 2); key presses
 * 8 to 14, its picture: T_A moves a cube of inputs up onto a number line, each level slice to one
 * number; that line is C(A) = ℝ, along which b is dragged; N(A) a plane: always a plane parallel to
 * N(A). No button for this example either (the user's request: "instead of "All solutions" say
 * "2-dimensional space of solutions", which appear on key press after N(A) along with the solution
 * space"): key press 13, right after N(A)'s, the solutions, the plane through x₀, and under the
 * picture "2-dimensional space of solutions"; key press 14, nullity = 2.
 */
export default function Slide16dSolutionSets() {
  return (
    <section>
      <h2>How many solutions?</h2>

      <div className="l22-duo">
        <SolveDuo ex={SOLVE.tall} />
        <SolveDuo ex={SOLVE.wide} at={DUO_STEPS + 1} />
      </div>
    </section>
  );
}
