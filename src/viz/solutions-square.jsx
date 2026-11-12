import '../lectures/l22/styles/deck.css';
import { SolveDuo, SOLVE } from '../lectures/l22/components/SolutionSets.jsx';

export const lecture = 22;

/*
 * How many solutions?, its first example, without its title: 2x + 4y = b₁, x + 2y = b₂ (A = [2 4; 1 2],
 * rank 1, nullity 1), with two pictures side by side. In the first, N(A) green, C(A) teal, and b on
 * top, to drag (near the line C(A), b lands on it); under it "No solution" or "Solution!". In the
 * second, the plane of the unknowns, each equation's line labelled with the equation; the lines
 * follow b: off C(A) they are parallel, on it they are one line, blue, the solutions, through a
 * solution x₀, and under them what they are; and a solution as x₀ + n, n (green) dragged along them.
 * On the slide the pictures are built up a key press at a time (T_A's animation, C(A), rank, b, the
 * second picture, N(A), nullity, x₀ + n); here all at once.
 */
export default function SolutionsSquare() {
  return (
    <div className="l22-duo l22-duo-one">
      <SolveDuo ex={SOLVE.rank1} />
    </div>
  );
}
