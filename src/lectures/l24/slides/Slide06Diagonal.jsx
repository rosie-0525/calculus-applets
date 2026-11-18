import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import EigGrid from '../components/EigGrid.jsx';
import { useMarkers } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { EIGSD } from '../components/eig.js';

export const D_EIGS = [
  { ...EIGSD[0], end: String.raw`D\vv e_1=2\vv e_1`, label: { gap: 0, dx: -4, dy: 22 }, labelEnd: { gap: 0, dx: 62, dy: 0 } },
  { ...EIGSD[1], end: String.raw`D\vv e_2=-\vv e_2`, label: { gap: 0, dx: -20, dy: 6 }, labelEnd: { gap: 0, dx: 0, dy: 22 } },
];

// the animation: the picture fades in, the grid stretches along e₁, then flips along e₂
export const STRETCH = { ms: 1900, delay: 900 };
export const FLIP = { ms: 1900, delay: 900 + 1900 + 600 };

/**
 * Example 3 (board; was Diagonal matrices, the user's request: the file keeps its name; Mark's remark; the textbook's Example 23.2.1), on the D = [2 0; 0 −1] of
 * his question after Example 1: the students find the eigenvectors and their eigenvalues (the user's
 * request; the answers are commented out). Key press 1: the picture, and the animation, the grid
 * stretching along e₁ (De₁ = 2e₁), then flipping along e₂ (De₂ = −e₂); 2: Mark's sentence for a
 * diagonal matrix with diagonal entries d₁, …, dₙ, made briefer (the user's request): each eᵢ is an
 * eigenvector with eigenvalue dᵢ; 3: his remark on Iₙ, in the user's words: in
 * particular, every nonzero v is an eigenvector of Iₙ with eigenvalue 1 (made briefer, the user's request). Print: the picture at the end of its move.
 */
export default function Slide06Diagonal() {
  const [markers, on] = useMarkers([1]);
  const s1 = useTween(on[0], STRETCH);
  const s2 = useTween(on[0], FLIP);
  return (
    <section>
      <h2>
        Example 3 <span className="board-pill">board</span>
      </h2>
      {markers}

      <div className="l24-diag">
        <div className="l24-diag-text">
          <p>
            Find the eigenvectors of <Tex tex={r`D=\begin{bmatrix}2&0\\0&-1\end{bmatrix}`} />.
          </p>
          <p className="l24-ex-ask">What are their eigenvalues?</p>
          {/* De₁ = (2, 0) = 2e₁: eigenvalue 2; De₂ = (0, −1) = −e₂: eigenvalue −1. The eigenvectors: the
              nonzero multiples of e₁ (eigenvalue 2) and of e₂ (eigenvalue −1). */}
        </div>
        <Fragment index={1} className="l24-diag-pic">
          <EigGrid eigs={D_EIGS} s={PRINT ? [1, 1] : [s1, s2]} unit={84} xRange={[-2.5, 3.5]} yRange={[-1.75, 1.6]} lines={1} />
        </Fragment>
      </div>

      <Fragment index={2} className="block theorem l24-diag-box">
        <p>
          If <Tex tex="M" /> is diagonal with entries <Tex tex={r`d_1,\dots,d_n`} />, then each <Tex tex={r`\vv e_i`} /> is an eigenvector with eigenvalue{' '}
          <Tex tex="d_i" />.
        </p>
      </Fragment>
      <Fragment index={3} as="p" className="l24-diag-id">
        In particular, every nonzero <Tex tex={r`\vv v`} /> is an eigenvector of <Tex tex="I_n" /> with eigenvalue 1.
      </Fragment>
    </section>
  );
}
