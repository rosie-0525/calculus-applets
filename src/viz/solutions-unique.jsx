import '../lectures/l22/styles/deck.css';
import { SolveDuo, SOLVE } from '../lectures/l22/components/SolutionSets.jsx';

export const lecture = 22;

/*
 * How many solutions?, its second example, without its title: x + y = b₁, y = b₂ (A = [1 1; 0 1],
 * rank 2, nullity 0), one picture: C(A) all of ℝ², tinted teal, N(A) the green point 0, and b on top,
 * to drag anywhere; under it "There is a unique solution for any b" (on the slide first "There is a
 * solution for any b", and "unique" in its place with nullity = 0). The solution is not drawn. On
 * the slide the picture is built up a key press at a time (T_A's animation, C(A), rank, b, N(A),
 * nullity); here all at once.
 */
export default function SolutionsUnique() {
  return (
    <div className="l22-duo l22-duo-one">
      <SolveDuo ex={SOLVE.shear} />
    </div>
  );
}
