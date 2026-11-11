import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { LoopPic, SYSTEM_MAPS, RANK1_MAP } from '../components/ImageCards.jsx';

/**
 * Going back to linear systems (titled Rank before, renamed at the user's request). On arrival, a
 * recall in the user's words (red bullets; in place of the chart Matrices ⇄ Linear systems, an m × n
 * matrix A ⇄ m equations in n unknowns, removed at the user's request): a linear system with m
 * equations in n unknowns can be written as Ax = b, where A is an m × n matrix; key press 1: Ax = b
 * has a solution ⟺ b ∈ C(A), where the column space C(A) ⊂ ℝᵐ. Then Mark's remark in a T-chart (rule
 * 14d; his definition of rank moved to Image and column space, the user's request), a side per key
 * press (2, 3), each with an animation from Linear system in matrix form, played once (the user's
 * request; LoopPic, SYSTEM_MAPS; first still pictures of a dozen b's): dim C(A) = m, every Ax = b
 * has a solution (x + y = 3, y = 1: ℝ² → ℝ², the image all of ℝ², b in it); dim C(A) < m, "most" b
 * are not in C(A) (a 2 × 2 matrix of rank 1, the user's request, in place of 2x = 4, x = 3: the image
 * a line, b off it; b can be dragged in both pictures, and snaps onto the line when close); each side's matrix A written beside its picture (the user's request). (A last line, Example 1: rank
 * of A = 2 < 3, removed at the user's request.)
 */
export default function Slide07Rank() {
  return (
    <section>
      <h2>Going back to linear systems</h2>

      {/* the recall, in the user's words (in place of the chart Matrices ⇄ Linear systems, removed at
          the user's request) */}
      <ul className="bullets l22-back-recall">
        <li>
          A linear system with <Tex tex="m" /> equations in <Tex tex="n" /> unknowns can be written as <Tex tex={r`A\vv x=\vv b`} />, where <Tex tex="A" /> is an{' '}
          <Tex tex={r`m\times n`} /> matrix.
        </li>
        <Fragment as="li" index={1}>
          <Tex tex={r`A\vv x=\vv b`} /> has a solution <Tex tex={r`\iff\vv b\in C(A)`} />, where the column space <Tex tex={r`C(A)\subset\mathbb R^m`} />.
        </Fragment>
      </ul>

      <div className="l22-tchart">
        <Fragment index={2} className="l22-tcol">
          <p className="l22-thead">
            <Tex tex={r`\dim C(A)=m`} />
          </p>
          <p>
            Every <Tex tex={r`A\vv x=\vv b`} /> has a solution
          </p>
          <div className="l22-back-pic">
            <Tex tex={r`A=\begin{bmatrix}1&1\\0&1\end{bmatrix}`} />
            <LoopPic index={2} ex={SYSTEM_MAPS[1]} once drag />
          </div>
        </Fragment>
        <Fragment index={3} className="l22-tcol">
          <p className="l22-thead">
            <Tex tex={r`\dim C(A)<m`} />
          </p>
          <p>
            “Most” <Tex tex={r`\vv b\in\mathbb R^m`} /> are not in <Tex tex="C(A)" />
          </p>
          <div className="l22-back-pic">
            <Tex tex={r`A=\begin{bmatrix}1&2\\1&2\end{bmatrix}`} />
            <LoopPic index={3} ex={RANK1_MAP} once drag />
          </div>
        </Fragment>
      </div>
    </section>
  );
}
