import '../lectures/l22/styles/deck.css';
import { SolveDuo, SOLVE } from '../lectures/l22/components/SolutionSets.jsx';

export const lecture = 22;

/*
 * How many solutions?, its last two examples, without its title: 2x = b₁, x = b₂ (2 equations in
 * 1 unknown: A = [2; 1], rank 1, nullity 0; the unknown's number line is the horizontal axis, N(A)
 * the point 0), starting at the lecture's first system, 2x = 4, x = 3, and under its picture "No
 * solution" or "Solution!" (the solution is not drawn); and x + y + z = b (1 equation in 3 unknowns:
 * A = [1 1 1], rank 1, nullity 2; N(A) a plane, and on top b's number line, all of it C(A), along
 * which b is dragged; the solutions, the plane through x₀ parallel to N(A), and under the picture
 * "2-dimensional space of solutions"; dragging the planes turns the view). On the slide each picture
 * is built up a key press at a time (T_A's animation, C(A), rank, b, N(A), the solutions, nullity),
 * and the second example comes after the first; here all at once.
 */
export default function SolutionsOther() {
  return (
    <div className="l22-duo">
      <SolveDuo ex={SOLVE.tall} />
      <SolveDuo ex={SOLVE.wide} />
    </div>
  );
}
