import Tex, { r } from '../components/Tex.jsx';
import BoardOwl from '../components/BoardOwl.jsx';
import Fragment from '../components/Fragment.jsx';
import Space from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import QPlot, { Q_RANGE, Q_LEVELS } from '../components/QPlot.jsx';
import { qA } from '../components/spec.js';

export const CURVE = () => '#5f6b7a';

/**
 * Example 1 (board; it was Example 3 before the user's new order, hence the file's name): Mark's Example 1 on quadratic forms (the textbook's Example 24.2.1), A = [13 −3;
 * −3 5], beside the graph of q_A (with its level curves) and its contour plot (with axes and ticks, so
 * that w₁ and w₂ can be drawn on it: both drawn over −3.5 ≤ x, y ≤ 3.5, so that w₁ = (3, −1) and
 * w₂ = (1, 3) fit; their tips lie on the level curves 140 and 40). Simplified (the user's request: it
 * had Mark's five parts, too many): it comes after Definiteness and the poll, which ends with how to
 * tell if a quadratic form is positive-definite?; the lead gives q_A (Mark's (i)), and three parts:
 * find the eigenvectors w₁ and w₂ of A and their eigenvalues (the user's words: (iii) needs the names; Mark's (ii) and (iii), the
 * characteristic polynomial and the null spaces); draw the eigenvectors on the contour plot, what do you
 * observe? (the user's words; Mark's (iv)); q_A(t₁w₁ + t₂w₂), and is A positive-definite? (Mark's (v); t₁, t₂, not c₁, c₂, as in the
 * Diagonalization formula and the textbook: the user's request). All three parts show
 * with the problem, beside the contour plot; the answers are commented out. Key press 1, under (i)
 * (the user's request: it was under the parts), in a blue box: w₁ and w₂ form an orthogonal basis of eigenvectors, as guaranteed by the
 * Spectral Theorem (the user's words, "guaranteed" for their "predicted"); 2, w₁ (amber) and w₂
 * (purple) on the contour plot, with the right-angle mark (the user's request, in place of Lines of
 * symmetry's picture, which the user removed); 3, under (ii), in a blue box (the user's request): the
 * observation, w₁ and w₂ lie along the lines of symmetry of the ellipses ((iii)'s answer, in a blue
 * box, removed by the user); 4, at the very end (the user's request): the graph of q_A, a bowl, under the
 * contour plot (the user's request: the contour plot on the right of the question, the graph at the
 * bottom). Under the contour plot, its caption (the user's request): the contour plot of
 * q_A(x, y) = 13x² − 6xy + 5y².
 */
export default function Slide14Example3() {
  return (
    <section>
      <h2>
        Example 1{' '}
        <span className="board-pill">
          <BoardOwl />
          board
        </span>
      </h2>

      <div className="l25-ex3">
        <div>
          <p className="l25-ex-lead">
            Let <Tex tex={r`A=\begin{bmatrix}13&-3\\-3&5\end{bmatrix}`} />, so{' '}
            <span className="nowrap">
              <Tex tex="q_A(x,y)=13x^2-6xy+5y^2" />.
            </span>
          </p>
          <ol className="parts l24-parts l25-ex3-parts">
            <li>
              Find the eigenvectors <Tex tex={r`\vv w_1`} /> and <Tex tex={r`\vv w_2`} /> of <Tex tex="A" /> and their eigenvalues.
              <Fragment index={1} className="block l25-ex3-box">
                <p>
                  <Tex tex={r`\vv w_1`} /> and <Tex tex={r`\vv w_2`} /> form an orthogonal basis of eigenvectors, as guaranteed by the Spectral Theorem.
                </p>
              </Fragment>
            </li>
            {/* P_A(λ) = λ² − tr(A)λ + det(A) = λ² − 18λ + 56 = (λ − 14)(λ − 4): eigenvalues 14 and 4.
                N(A − 14I₂) = N([−1 −3; −3 −9]) = span{(3, −1)}: w₁ = (3, −1).
                N(A − 4I₂) = N([9 −3; −3 1]) = span{(1, 3)}: w₂ = (1, 3). (w₁ · w₂ = 0, as the Spectral
                Theorem says.) */}
            <li>
              Draw the eigenvectors on the contour plot. What do you observe?
              <Fragment index={3} className="block l25-ex3-box">
                <p>
                  <Tex tex={r`\vv w_1`} /> and <Tex tex={r`\vv w_2`} /> lie along the lines of symmetry of the ellipses.
                </p>
              </Fragment>
            </li>
            {/* They are perpendicular, along the axes (the lines of symmetry) of the ellipses: w₁
                (eigenvalue 14) along the short one, where q_A grows fastest, w₂ (eigenvalue 4) along the
                long one. */}
            <li>
              Write <Tex tex={r`q_A(t_1\vv w_1+t_2\vv w_2)`} /> in terms of <Tex tex="t_1" /> and <Tex tex="t_2" />. Is <Tex tex="A" /> positive-definite?
            </li>
            {/* q_A(v) = v · (Av) = (t₁w₁ + t₂w₂) · (14t₁w₁ + 4t₂w₂) = 14(w₁ · w₁)t₁² + 4(w₂ · w₂)t₂²
                = 140t₁² + 40t₂², since w₁ · w₂ = 0: no cross-terms. It is > 0 unless t₁ = t₂ = 0, i.e.
                v = 0: positive-definite. */}
          </ol>
        </div>
        <div className="l25-ex3-pics">
          <figure className="l25-ex3-fig">
            <QPlot size={300} arrows names revealAt={2} />
            <figcaption>
              The contour plot of
              <br />
              <Tex tex="q_A(x,y)=13x^2-6xy+5y^2" />
            </figcaption>
          </figure>
          <Fragment index={4}>
            <Space width={300} height={187} unit={21.8} center={[0.5, 0.86]} el={22} axes={false} rock={false} title="The graph of q_A, a bowl">
              {(s) => <Surface s={s} f={qA} x={Q_RANGE} y={Q_RANGE} n={26} zScale={0.021} mesh="rgba(15, 40, 50, 0.14)" curve={Q_LEVELS} curveColor={CURVE} curveWidth={1.3} />}
            </Space>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
