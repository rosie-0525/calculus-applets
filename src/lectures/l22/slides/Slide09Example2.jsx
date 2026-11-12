import Tex, { r } from '../components/Tex.jsx';
import SolveCard, { B_START } from '../components/SolveCard.jsx';
import { B_IN, B_OUT } from '../components/ls.js';

/**
 * Example 1 (Example 2 until the board Example 1 and Solving Ax = b were removed: the user's request;
 * board; Christine's Example 2, on Mark's A, changed at the user's request so that its first two
 * columns are not orthogonal; the parts reworded by the user): the system (∗),
 * 2x + y + 3z = b₁, x + 2y + 3z = b₂, −x − 2y − 3z = b₃; (i) in the form Ax = b; (ii) an orthogonal basis
 * of C(A); (iii) b = (0, 0, 0): does (∗) have a solution? (iv) b = (5, 4, −4):
 * Proj_{C(A)}(b), and does (∗) have a solution? (v) the same for b = (0, 1, 0) (the rank of A, part (iii) before, is asked on Example 2 now: the user's
 * request). All parts at once;
 * the answers are commented out. Beside them, from key press 1, the picture of Solving Ax = b (SolveCard.jsx; moved here at the
 * user's request): the plane C(A), b dragged by its tip, "Ax = b has a solution!" or "no solution!";
 * key press 2: b = (5, 4, −4), in the plane; 3: b = (0, 1, 0), off it, the dotted perpendicular to
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
      <Tex display tex={r`\left\{\begin{aligned}2x+y+3z&=b_1\\ x+2y+3z&=b_2\\ -x-2y-3z&=b_3\end{aligned}\right.\qquad(*)`} />
      <ol className="parts l22-parts l22-ex1-parts">
        <li>
          Write the system of equations in the form <Tex tex={r`A\vv x=\vv b`} />.
        </li>
        {/* A = [2 1 3; 1 2 3; −1 −2 −3], x = (x, y, z), b = (b₁, b₂, b₃). */}
        <li>
          Find an orthogonal basis for the column space of <Tex tex="A" />.
        </li>
        {/* Gram–Schmidt on v₁ = (2, 1, −1), v₂ = (1, 2, −2), v₃ = (3, 3, −3): w₁ = v₁; v₂ · w₁ = 6, w₁ · w₁ = 6,
            so w₂ = v₂ − w₁ = (−1, 1, −1); v₃ · w₁ = 12, v₃ · w₂ = 3, w₂ · w₂ = 3, so w₃ = v₃ − 2w₁ − w₂ = 0
            (v₃ = v₁ + v₂). {w₁, w₂} = {(2, 1, −1), (−1, 1, −1)} is an orthogonal basis of C(A). */}
        <li>
          When <Tex tex={r`\vv b=(0,0,0)`} />, does <Tex tex="(*)" /> have a solution?
        </li>
        {/* Yes: x = 0 (0 is in every subspace, so 0 ∈ C(A)). */}
        <li>
          For <Tex tex={r`\vv b=(5,4,-4)`} />, compute <Tex tex={r`\operatorname{Proj}_{C(A)}(\vv b)`} />. Does <Tex tex="(*)" /> have a solution?
        </li>
        {/* b · w₁ = 18, w₁ · w₁ = 6; b · w₂ = 3, w₂ · w₂ = 3; Proj = 3w₁ + w₂ = (5, 4, −4) = b, so b ∈ C(A): yes
            (b = 2v₁ + v₂: x = (2, 1, 0) solves it). */}
        <li>
          For <Tex tex={r`\vv b=(0,1,0)`} />, compute <Tex tex={r`\operatorname{Proj}_{C(A)}(\vv b)`} />. Does <Tex tex="(*)" /> have a solution?
        </li>
        {/* b · w₁ = 1, b · w₂ = 1; Proj = w₁/6 + w₂/3 = (0, 1/2, −1/2) ≠ b, so b ∉ C(A): no solution. */}
      </ol>
      </div>
      <SolveCard first={1} stages={STAGES} />
      </div>
    </section>
  );
}
