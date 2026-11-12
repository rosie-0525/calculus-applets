import { SolveDuo, SOLVE } from '../components/SolutionSets.jsx';

/**
 * How many solutions?, the examples, continued (SolutionSets.jsx; see Slide16cSolutionSets, whose
 * right half this example was until [2 4; 1 2] got a second picture, at the user's request):
 * x + y = 1, y = 2 (A = [1 1; 0 1], rank 2, nullity 0), alone on the slide. On arrival, its system
 * and matrix; key presses 1 to 6, its picture, built up a key press at a time (T_A's animation,
 * C(A), rank, b, to drag, then N(A), nullity): C(A) = ℝ², N(A) the point 0: always one point.
 * No button on this slide (the user's request: "remove the "All solutions" button. Simply say "There
 * is a solution for any b"; then along with nullity = 0, "There is a unique solution for any b""):
 * under the picture, with b (key press 4), the first sentence; with nullity = 0 (key press 6), the
 * second in its place. The solution is not drawn.
 * The two systems that are not square are on the next slide (Slide16dSolutionSets).
 */
export default function Slide16eSolutionSets() {
  return (
    <section>
      <h2>How many solutions?</h2>

      <div className="l22-duo l22-duo-one">
        <SolveDuo ex={SOLVE.shear} />
      </div>
    </section>
  );
}
