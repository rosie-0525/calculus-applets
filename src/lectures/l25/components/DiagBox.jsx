import Tex, { r } from './Tex.jsx';
import { RED, col } from './eig.js';

/**
 * Mark's box, the diagonalization formula (the textbook's (24.2.2); its reference removed by the
 * user): on Diagonalization formula, and again, full size (the user's request), at the top of
 * Definiteness and eigenvalues, where it glides (auto-animate, data-id l25-diag-box; the user's
 * request: the red box should transit and stay in the next slide). Its sentence is a div, not a p, so that auto-animate does not also
 * match it by its text inside the box (it would move twice); `small` (deck.css): 0.65 of the size,
 * width and font alike, so that the box scales evenly on its way. The data-id is on a wrapper whose
 * font size is the same on both slides, the smaller font on the box inside it: auto-animate then only
 * scales the wrapper, and does not also shrink the font on the way (the text would reflow). Under
 * (wᵢ · wᵢ)tᵢ², a brace with ≥ 0 (red; the user's request: it was a line under Why?), on Definiteness
 * and eigenvalues only, on its key press 1 (the user's request; the wrapper is an fx-host, its
 * FxMarker l25-diag-brace there, deck.css): `noBrace` (Diagonalization formula; the user removed it
 * there, it was on key press 5) hides it, keeping its room, so that the box is the same on both slides.
 */
export default function DiagBox({ small = false, noBrace = false }) {
  return (
    <div className={`l25-diag-wrap fx-host${small ? ' l25-diag-small' : ''}${noBrace ? ' l25-diag-nobrace' : ''}`} data-id="l25-diag-box">
      <div className="block theorem l25-diag-box">
        <div className="l25-diag-if">
          If <Tex tex={r`\vv v=\sum t_i\vv w_i`} />, where <Tex tex={r`\vv w_i`} /> is an orthogonal basis of eigenvectors for the symmetric matrix <Tex tex="A" />, then
        </div>
        <Tex display tex={`q_A(\\vv v)=\\sum\\lambda_i\\htmlClass{l25-diag-brace}{\\underbrace{(\\vv w_i\\cdot\\vv w_i)\\,t_i^2}_{\\htmlClass{l25-diag-brace-label}{${col(RED, r`\geq 0`)}}}}.`} />
      </div>
    </div>
  );
}
