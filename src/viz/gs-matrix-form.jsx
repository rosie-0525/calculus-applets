import { useRef, useState } from 'react';
import '../lectures/l23/styles/deck.css';
import Tex, { r } from '../lectures/l23/components/Tex.jsx';
import Fragment, { FxMarker } from '../lectures/l23/components/Fragment.jsx';
import TexMorph from '../lectures/l23/components/TexMorph.jsx';
import { STEPS, NORMALIZE, MATRIX_W, MATRIX, g } from '../lectures/l23/slides/Slide13GSToQR.jsx';
import { useKeyPresses } from './back-substitution.jsx';

export const lecture = 23;

// The deck's last stage, the r's in place, writes its thin spaces as \, in a plain template string,
// where they turn into commas (r₁₁, w₁′): put back as thin spaces (none of the other stages joins
// two pieces with a comma)
const STAGES = STEPS.map((tex) => tex.replaceAll('},\\htmlData', '}\\,\\htmlData'));

// the slide's key presses: from the second (step 1 and its formulas) to the last (the names Q, R)
const FIRST = 2;
const LAST = 13;

/*
 * Gram–Schmidt in matrix form, without its title: "Let v₁, v₂, v₃ be columns of a matrix A", then
 * three numbered steps on the left, each with its stage of a derivation on the right, in a card,
 * that morphs in place (TexMorph.jsx: a piece in both stages glides to its new place, the others
 * fade out or in). 1. Gram–Schmidt turns v₁, v₂, v₃ into an orthogonal collection {w₁, w₂, w₃}: wᵢ
 * = vᵢ minus its projections onto the w's before it. 2. Rearrange: vᵢ glides to the left, wᵢ to the
 * right end, the minus signs turn into red plus signs; under the card A = [w₁ w₂ w₃] times the
 * coefficients (1 on the diagonal), [w₁ w₂ w₃] braced "not quite orthogonal". 3. Normalize, w′ᵢ =
 * wᵢ/‖wᵢ‖: each wⱼ becomes ‖wⱼ‖ wⱼ′, the norms in red; amber braces name the coefficients r_ij, which
 * then glide into their places; and A = QR in place of A = [w₁ w₂ w₃][…], the braces orthogonal
 * matrix Q and upper triangular matrix R. On the slide each step and each change is a key press;
 * here it starts at step 1 with its formulas, and buttons take the next step (the formulas glide
 * there), the one before (they glide back), or start again.
 */
export default function GSMatrixForm() {
  const ref = useRef(null);
  const [n, setN] = useState(FIRST);
  useKeyPresses(ref, n);
  return (
    <div className="viz-col gsqr-site" ref={ref}>
      <div className="stage l23-gsqr">
        <div className="stage-text">
          <p>
            Let <Tex tex={r`\vv v_1,\vv v_2,\vv v_3`} /> be columns of a matrix <Tex tex="A" />.
          </p>
          <div className="l23-gsqr-cols">
            <ol className="steps l23-gsqr-steps">
              <Fragment index={1} as="li">
                Gram–Schmidt turns <Tex tex={r`\vv v_1`} />, <Tex tex={r`\vv v_2`} /> and <Tex tex={r`\vv v_3`} /> into an orthogonal collection <Tex tex={r`\{${g(1)},${g(2)},${g(3)}\}`} />
              </Fragment>
              <Fragment index={3} as="li">
                Rearrange to write <Tex tex={r`\vv v_1,\vv v_2,\vv v_3`} /> in terms of <Tex tex={r`${g(1)},${g(2)},${g(3)}`} />
              </Fragment>
              <Fragment index={7} as="li">
                <span className="l23-nowrap">
                  Normalize: <Tex tex={NORMALIZE} />
                </span>
              </Fragment>
            </ol>
            <div className="l23-gsqr-work">
              <Fragment index={2} className="l23-gsqr-morph l23-gsqr-card">
                <TexMorph steps={STAGES} at={[4, 8, 9, 10]} />
              </Fragment>
              <FxMarker index={6} id="gsqr-not" />
              <FxMarker index={12} id="gsqr-qr" />
              <FxMarker index={13} id="gsqr-names" />
              <div className="l23-gsqr-matrix fx-host">
                <Fragment index={5}>
                  <Fragment index={11} effect="fade-out">
                    <Tex tex={MATRIX_W} />
                  </Fragment>
                </Fragment>
                <Fragment index={11}>
                  <Tex tex={MATRIX} />
                </Fragment>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" disabled={n <= FIRST} onClick={() => setN((k) => Math.max(FIRST, k - 1))}>
          Back
        </button>
        <button type="button" className="viz-button" disabled={n >= LAST} onClick={() => setN((k) => Math.min(LAST, k + 1))}>
          Next step
        </button>
        <button type="button" className="viz-button" disabled={n <= FIRST} onClick={() => setN(FIRST)}>
          Start again
        </button>
      </div>
    </div>
  );
}
