import '../lectures/l22/styles/deck.css';
import { SolveDuo, SOLVE } from '../lectures/l22/components/SolutionSets.jsx';

export const lecture = 22;

/*
 * Back to linear systems, its last two examples, without its title: 2x = b₁, x = b₂ (2 equations in
 * 1 unknown: A = [2; 1], rank 1, nullity 0; the unknown's number line is the horizontal axis, each
 * equation's solution a gray tick), starting at the lecture's first system, 2x = 4, x = 3; and
 * x + y + z = b (1 equation in 3 unknowns: A = [1 1 1], rank 1, nullity 2; N(A) a plane, and on top
 * b's number line, all of it C(A), along which b is dragged; dragging the planes turns the view). As
 * in solutions-square.jsx, All solutions shows them once b is in C(A). On the slide the second comes
 * on a key press; here both at once.
 */
export default function SolutionsOther() {
  return (
    <div className="l22-duo">
      <SolveDuo ex={SOLVE.tall} />
      <SolveDuo ex={SOLVE.wide} />
    </div>
  );
}
