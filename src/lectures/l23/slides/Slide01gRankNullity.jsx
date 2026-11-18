import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import RankPicture, { A } from '../components/RankPicture.jsx';
import { TEAL, GREEN, PURPLE } from '../components/ls22.js';

export const c = (color, tex) => r`\textcolor{${color}}{${tex}}`;

// the key presses (the user's order): the first bullet on arrival; A and T_A played, no colour; e₁, e₂,
// e₃; N(A); T_A again, N(A) collapsing; T_A again, e₁, e₂ onto Ae₁, Ae₂, with the second bullet; rank,
// with the third; the box, its second equivalence
export const AT = { play1: 1, axes: 2, nul: 3, play2: 4, play3: 5, rank: 6, box: 7, box2: 8 };
export const MATRIX = r`A=\begin{bmatrix}${A.map((row) => row.join('&')).join(r`\\`)}\end{bmatrix}`;

/**
 * Rank–nullity theorem (after Last time: linear systems; the user's request: "illustrate that
 * T_A: R^n -> R^m collapses k = nullity A many dimensions, and the rest (n-k) dimensions maps with no
 * collapsion to R^m, so rank = n-k"), beside the bullets: A = [1 −1 0; 0 1 0; −1 0 0], T_A: ℝ³ → ℝ³
 * under it, and its picture (RankPicture.jsx), T_A played three times, a layer more each time (the
 * user's order). On arrival, the first bullet, T_A collapses k = nullity(A) dimensions (k green); key
 * press 1, A and the picture, the cube playing T_A with no colour; 2, back to the inputs, e₁, e₂, e₃;
 * 3, N(A), green; 4, T_A again, N(A) shrinking into 0; 5, the rest (n − k) dimensions map
 * invertibly into ℝᵐ (the user's words; n − k purple): T_A again, the square on e₁, e₂ purple, onto the parallelogram on
 * Ae₁, Ae₂ in C(A), which lights up. 6, so rank = n − k (rank teal), and under the picture,
 * rank = 3 − 1 = 2. (Before: the picture in two steps; Lecture 22's projection onto the xy-plane; its
 * Null space examples, KEPT and WHOLE in ImageCards.jsx.) Key press 7 (the user's request: "it
 * should be clear that a matrix is invertible <=> it is a square n x n matrix with rank = n and
 * nullity = 0"), the box, in the user's words; 8, under it, the user's second
 * equivalence, ⟺ Ax = b has a solution for every b (the ⟺ signs aligned). (The last line, in this
 * case, Ax = b has a unique solution, today: how to solve it, removed at the user's request.)
 */
export default function Slide01gRankNullity() {
  return (
    <section>
      <h2>Rank–nullity theorem</h2>

      <div className="l23-rnk-row">
      <ul className="bullets l23-rnk-list">
        <li>
          <Tex tex={r`T_A:\mathbb R^n\to\mathbb R^m`} /> collapses{' '}
          <span className="l23-nowrap">
            <Tex tex={c(GREEN, r`k=\operatorname{nullity}(A)`)} />
          </span>{' '}
          dimensions.
        </li>
        <Fragment index={AT.play3} as="li">
          The rest (<Tex tex={c(PURPLE, 'n-k')} />) dimensions map invertibly into <Tex tex={r`\mathbb R^m`} />.
        </Fragment>
        <Fragment index={AT.rank} as="li">
          So <span style={{ color: TEAL }}>rank</span> <Tex tex={`=${c(PURPLE, 'n-k')}`} />.
        </Fragment>
      </ul>

      {/* the example, beside the bullets, from key press 1 (the user's request: T_A played, then e₁, e₂, e₃,
          N(A), T_A again for N(A), again for e₁, e₂; first Lecture 22's projection onto the xy-plane, and
          before that its Null space examples, KEPT and WHOLE in ImageCards.jsx) */}
      <Fragment index={AT.play1} className="l22-pick">
        <div className="l22-img-card">
          <div className="l22-img-text">
            <Tex tex={MATRIX} />
            <div className="l23-rnk-sig">
              <Tex tex={r`T_A:\mathbb R^3\to\mathbb R^3`} />
            </div>
          </div>
          <RankPicture at={AT} />
        </div>
        <Fragment index={AT.rank} as="p" className="l23-rnk-says">
          <span className="l22-rn-rank">rank</span> <Tex tex={r`=3-\textcolor{${GREEN}}{1}=2`} />
        </Fragment>
      </Fragment>
      </div>

      {/* the ⟺ signs one under the other: a grid, "A is invertible" in its first column; the second
          equivalence (the user's request) on its own key press */}
      <Fragment index={AT.box} className="block theorem l23-rnk-box">
        <div className="l23-rnk-eq">
          <span>
            <Tex tex="A" /> is invertible
          </span>
          <span>
            <Tex tex={r`\iff`} /> <Tex tex="A" /> is a square <Tex tex={r`n\times n`} /> matrix with <span style={{ color: TEAL }}>rank</span>{' '}
            <Tex tex={c(TEAL, '=n')} /> and <span style={{ color: GREEN }}>nullity</span> <Tex tex={c(GREEN, '=0')} />
          </span>
          <Fragment index={AT.box2} as="span" className="l23-rnk-eq-2">
            <Tex tex={r`\iff A\vv x=\vv b`} /> has a solution for every <Tex tex={r`\vv b`} />.
          </Fragment>
        </div>
      </Fragment>
    </section>
  );
}
