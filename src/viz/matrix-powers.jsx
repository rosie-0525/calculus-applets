import { useState } from 'react';
import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import { K_MIN, K_MAX, M_TEX, M2_TEX, U_TEX, POWERS, bmatrix } from '../lectures/l16/slides/Slide10Equilibrium.jsx';

export const lecture = 16;

/*
 * Equilibrium, its example without the theorem (the caption states it): Example 1's M; M², all
 * its entries positive; M^k, k from 2 to 15, a click on the step-forward button going to the next k
 * and the round button back to 2; and u. On the slide they come one per key press, the definition
 * of the equilibrium vector under them; here they are all shown, the definition in the caption.
 */
export default function MatrixPowers() {
  const [k, setK] = useState(K_MIN);
  const click = (next) => (e) => {
    setK(next);
    e.currentTarget.blur();
  };
  return (
    <div className="l16-eq">
      <div className="l16-eq-cell">
        <Tex display className="l16-eq-mat" tex={M_TEX} />
      </div>
      <div className="l16-eq-cell">
        <Tex display className="l16-eq-mat" tex={M2_TEX} />
        <p className="l16-eq-note">All entries are positive</p>
      </div>
      <div className="l16-eq-cell">
        <Tex display className="l16-eq-mat l16-eq-power" tex={r`M^{${k}}\approx${bmatrix(POWERS[k])}`} />
        <div className="l16-eq-k">
          <span className="l16-eq-kval">
            <Tex tex={`k=${k}`} />
          </span>
          <button type="button" className="l16-step" aria-label="Next k" disabled={k >= K_MAX} onClick={click((kk) => Math.min(K_MAX, kk + 1))}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 4l10 8-10 8z" />
              <rect x="16" y="4" width="3" height="16" />
            </svg>
          </button>
          <button type="button" className="l16-cal-reset" aria-label="Start again" onClick={click(K_MIN)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
              <path d="M5 3.5v4.6h4.6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="l16-eq-cell">
        <Tex display className="l16-eq-mat" tex={U_TEX} />
      </div>
    </div>
  );
}
