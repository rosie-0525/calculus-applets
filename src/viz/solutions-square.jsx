import '../lectures/l22/styles/deck.css';
import { SolveDuo, SOLVE } from '../lectures/l22/components/SolutionSets.jsx';

export const lecture = 22;

/*
 * Back to linear systems, its first two examples, without its title: 2x + 4y = b₁, x + 2y = b₂
 * (A = [2 4; 1 2], rank 1, nullity 1) and x + y = b₁, y = b₂ (A = [1 1; 0 1], rank 2, nullity 0),
 * each with one picture: N(A) green, C(A) teal, each equation's solutions a gray line, and b on top,
 * to drag; the right-hand sides follow. Off C(A), "No solution"; once b is in C(A) (near the line
 * C(A), b lands on it), the button All solutions shows them, blue, N(A) moved to a solution x₀. On
 * the slide the second comes on a key press; here both at once.
 */
export default function SolutionsSquare() {
  return (
    <div className="l22-duo">
      <SolveDuo ex={SOLVE.rank1} />
      <SolveDuo ex={SOLVE.shear} />
    </div>
  );
}
