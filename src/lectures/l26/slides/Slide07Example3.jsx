import Tex, { r } from '../components/Tex.jsx';
import BoardOwl from '../components/BoardOwl.jsx';
import ExContour from '../components/ExContours.jsx';

/**
 * Example 3 (board; after Mark's Example 1, Christine's Example 4): f(x, y) = 3x²y − 6xy² + 4y³ − 3y (the
 * user's requests: in place of Mark's −x³ + 6x² + 3y² − 2y³, a contour plot easier to draw; then ellipses
 * near the critical points, not circles, the saddles' X's not square; then the ellipses rotated; then f
 * simple and expanded: xy(x + y − 3), a local minimum and three saddle points, no local maximum; then
 * one local maximum, one local minimum and two saddle points, the Hessians there not diagonal:
 * x³ − 3x²y + 3xy² + 2y³ − 3x − 6y; then back to the simpler y(3x² − 6xy + 4y² − 3), with a simpler
 * contour plot); one
 * sentence (the user's request, in place of his three parts: the Hessians, the quadratic
 * approximations, the comparison with the plots; then two parts), find all critical points and
 * classify them; then two parts again (the user's request, so that the handout can put (ii) on its
 * next page): (i) find critical points of f, (ii) classify them; beside it, the contour plot of f with all four critical points (one plot, the user's
 * request, in place of Mark's two windows; ExContours.jsx). The answers are commented out. (A key press
 * with the question, what does the contour plot look like near a critical point?, was added and then
 * removed: the user's requests.)
 */
export default function Slide07Example3() {
  return (
    <section>
      <h2>
        Example 3{' '}
        <span className="board-pill">
          <BoardOwl />
          board
        </span>
      </h2>

      <div className="l26-ex3">
        <div>
          <p className="l26-ex-lead">
            Let{' '}
            <span className="nowrap">
              <Tex tex="f(x,y)=3x^2y-6xy^2+4y^3-3y" />.
            </span>
          </p>
          <ol className="parts l26-ex3-parts">
            <li>
              Find critical points of <Tex tex="f" />.
            </li>
            <li>Classify the critical points into local maxima, local minima and saddle points.</li>
          </ol>
          {/* f_x = 6xy − 6y² = 6y(x − y), f_y = 3x² − 12xy + 12y² − 3 = 3(x − 2y)² − 3; both 0:
                y = 0 or y = x, and x − 2y = ±1, so four critical points:
                (1, 0), (−1, 0) (y = 0, x = ±1), and (1, 1), (−1, −1) (y = x, −x = ±1).
              Hf = [6y, 6x − 12y; 6x − 12y, −12x + 24y], and ∇f(a) = 0, so f(a + h) ≈ f(a) + ½ q_{Hf(a)}(h):
                (1, 1): Hf = [6 −6; −6 12], det 36 > 0, trace 18 > 0 (eigenvalues 9 ± 3√5), positive-definite,
                  f ≈ −2 + 3h₁² − 6h₁h₂ + 6h₂²: a local minimum (f = −2).
                (−1, −1): Hf = [−6 6; 6 −12], det 36 > 0, trace −18 < 0 (eigenvalues −9 ± 3√5),
                  negative-definite, f ≈ 2 − 3h₁² + 6h₁h₂ − 6h₂²: a local maximum (f = 2).
                (1, 0): Hf = [0 6; 6 −12], det −36 < 0, indefinite: a saddle point (f = 0).
                (−1, 0): Hf = [0 −6; −6 12], det −36 < 0, indefinite: a saddle point (f = 0).
                (f_xx = 0 at the saddle points: the det decides.)
                On the plot: the level 0 is the line y = 0 and the ellipse 3x² − 6xy + 4y² = 3, crossing
                at the saddle points (an X at each, not square: the axis and the line h₁ = h₂, as
                q = ±12h₂(h₁ − h₂)); closed curves round (1, 1) inside the ellipse above the axis and
                round (−1, −1) under it, ellipses near them, tilted, their long axes along
                (2, √5 − 1) (about 32°), (3 + √5)/2 ≈ 2.6 times the short ones. */}
        </div>
        <div className="l26-ex3-plots">
          <ExContour k={0} size={[520, 443]} labelSize={14} tickSize={16} />
        </div>
      </div>
    </section>
  );
}
