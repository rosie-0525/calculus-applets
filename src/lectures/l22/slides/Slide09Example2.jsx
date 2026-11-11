import Tex, { r } from '../components/Tex.jsx';
import SolveCard, { B_START } from '../components/SolveCard.jsx';
import { B_IN, B_OUT } from '../components/ls.js';

/**
 * Example 1 (Example 2 until the board Example 1 and Solving Ax = b were removed: the user's request;
 * board; Christine's Example 2, on Mark's A; the parts reworded by the user): the system (∗),
 * 2x − y + z = b₁, x + y + 2z = b₂, −x − y − 2z = b₃; (i) in the form Ax = b; (ii) an orthogonal basis
 * of C(A); (iii) b = (0, 0, 0): does (∗) have a solution? (iv) b = (3, 3, −3):
 * Proj_{C(A)}(b), and does (∗) have a solution? (v) the same for b = (0, 1, 0) (the rank of A, part (iii) before, is asked on Example 2 now: the user's
 * request). All parts at once;
 * the answers are commented out. Beside them, from key press 1, the picture of Solving Ax = b (SolveCard.jsx; moved here at the
 * user's request): the plane C(A), b dragged by its tip, "Ax = b has a solution!" or "no solution!";
 * key press 2: b = (3, 3, −3), in the plane; 3: b = (0, 1, 0), off it, the dotted perpendicular to
 * its projection. ("be the matrix of Example 1" and "Is this consistent with Example 1?" went with
 * the old Example 1.)
 */
export const STAGES = [
  { at: 0, b: B_START },
  { at: 2, b: B_IN },
  { at: 3, b: B_OUT },
];

export default function Slide09Example2() {
  return (
    <section>
      <h2>
        Example 1 <span className="board-pill">board</span>
      </h2>

      <div className="l22-ex-row">
      <div className="l22-ex-text">
      <p>Consider the system of linear equations</p>
      <Tex display tex={r`\left\{\begin{aligned}2x-y+z&=b_1\\ x+y+2z&=b_2\\ -x-y-2z&=b_3\end{aligned}\right.\qquad(*)`} />
      <ol className="parts l22-parts l22-ex1-parts">
        <li>
          Write the system of equations in the form <Tex tex={r`A\vv x=\vv b`} />.
        </li>
        {/* A = [2 −1 1; 1 1 2; −1 −1 −2], x = (x, y, z), b = (b₁, b₂, b₃). */}
        <li>
          Find an orthogonal basis for the column space of <Tex tex="A" />.
        </li>
        {/* v₁ · v₂ = −2 + 1 + 1 = 0 and v₃ = v₁ + v₂, so {v₁, v₂} = {(2, 1, −1), (−1, 1, −1)} is an orthogonal
            basis of C(A) (Gram–Schmidt on v₁, v₂, v₃ gives w₁ = v₁, w₂ = v₂, w₃ = 0). */}
        <li>
          When <Tex tex={r`\vv b=(0,0,0)`} />, does <Tex tex="(*)" /> have a solution?
        </li>
        {/* Yes: x = 0 (0 is in every subspace, so 0 ∈ C(A)). */}
        <li>
          For <Tex tex={r`\vv b=(3,3,-3)`} />, compute <Tex tex={r`\operatorname{Proj}_{C(A)}(\vv b)`} />. Does <Tex tex="(*)" /> have a solution?
        </li>
        {/* b · v₁ = 12, v₁ · v₁ = 6; b · v₂ = 3, v₂ · v₂ = 3; Proj = 2v₁ + v₂ = (3, 3, −3) = b, so b ∈ C(A): yes
            (x = (2, 1, 0) solves it). */}
        <li>
          For <Tex tex={r`\vv b=(0,1,0)`} />, compute <Tex tex={r`\operatorname{Proj}_{C(A)}(\vv b)`} />. Does <Tex tex="(*)" /> have a solution?
        </li>
        {/* b · v₁ = 1, b · v₂ = 1; Proj = v₁/6 + v₂/3 = (0, 1/2, −1/2) ≠ b, so b ∉ C(A): no solution. */}
      </ol>
      </div>
      <SolveCard first={1} stages={STAGES} />
      </div>
    </section>
  );
}
