import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { PRINT } from '../components/print.js';
import { M_BIRDS, matpow } from '../components/markov.js';

export const K_MIN = 2;
export const K_MAX = 15;
// an entry of M^k to three places; 0 and 1 (to that precision) as 0 and 1
export const f3 = (x) => (Math.abs(x) < 5e-4 ? '0' : Math.abs(x - 1) < 5e-4 ? '1' : x.toFixed(3));
export const bmatrix = (P) => r`\begin{bmatrix}${P.map((row) => row.map(f3).join('&')).join('\\\\ ')}\end{bmatrix}`;

// Example 1's M and M², exact, and its u, ≈ the columns of M^k for k large, to three places (the
// user's request)
export const M_TEX = r`M=\begin{bmatrix}0&\tfrac12&\tfrac13\\[2pt] \tfrac12&0&\tfrac13\\[2pt] \tfrac12&\tfrac12&\tfrac13\end{bmatrix}`;
export const M2_TEX = r`M^2=\begin{bmatrix}\tfrac5{12}&\tfrac16&\tfrac5{18}\\[2pt] \tfrac16&\tfrac5{12}&\tfrac5{18}\\[2pt] \tfrac5{12}&\tfrac5{12}&\tfrac49\end{bmatrix}`;
export const U_TEX = r`\mathbf u=\begin{bmatrix}\tfrac27\\[2pt] \tfrac27\\[2pt] \tfrac37\end{bmatrix}\approx\begin{bmatrix}0.286\\[2pt] 0.286\\[2pt] 0.429\end{bmatrix}`;
export const POWERS = Array.from({ length: K_MAX + 1 }, (_, k) => matpow(M_BIRDS, k));

/**
 * Equilibrium: Mark's theorem (→ Remark 16.1.2, the textbook's place for it); then Example 1 alone
 * (the user's request, in place of Examples 1 and 2 side by side): key press 1, M; 2, M², all its
 * entries positive; 3, M^k, k from 2 to 15, a click on a media player's step-forward button going to
 * the next k, and the round button beside it back to 2 (the user's choice of design, in place of a
 * slider); 4, Mark's equilibrium vector; 5, u beside M^k. In print mode: k = 15.
 */
export default function Slide10Equilibrium() {
  const [k, setK] = useState(PRINT ? K_MAX : K_MIN);
  const click = (next) => (e) => {
    setK(next);
    e.currentTarget.blur();
  };
  return (
    <section className="dense">
      <h2>Equilibrium</h2>

      <div className="block theorem">
        <p className="block-title">Theorem</p>
        <p>
          If <Tex tex="M" /> is a Markov matrix where <Tex tex="M^a" /> has all positive entries for some positive integer <Tex tex="a" />, then
        </p>
        <Tex display tex={r`\lim_{k\to\infty}M^k=\begin{bmatrix}\mathbf u&\mathbf u&\cdots&\mathbf u\end{bmatrix},`} />
        <p>
          where <Tex tex={r`\mathbf u`} /> is the unique probability vector satisfying <Tex tex={r`M\mathbf u=\mathbf u`} />.
        </p>
        <p className="pointer corner">(→ Remark 16.1.2)</p>
      </div>

      <div className="l16-eq">
        <Fragment index={1} className="l16-eq-cell">
          <Tex display className="l16-eq-mat" tex={M_TEX} />
        </Fragment>
        <Fragment index={2} className="l16-eq-cell">
          <Tex display className="l16-eq-mat" tex={M2_TEX} />
          <p className="l16-eq-note">All entries are positive</p>
        </Fragment>
        <Fragment index={3} className="l16-eq-cell">
          <Tex display className="l16-eq-mat l16-eq-power" tex={r`M^{${k}}\approx${bmatrix(POWERS[k])}`} />
          <div className="l16-eq-k" data-prevent-swipe>
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
        </Fragment>
        <Fragment index={5} className="l16-eq-cell">
          <Tex display className="l16-eq-mat" tex={U_TEX} />
        </Fragment>
      </div>

      <Fragment index={4} as="p" className="l16-eq-def">
        <Tex tex={r`\mathbf u`} /> is known as the <strong>equilibrium vector</strong>, or <strong>stationary vector</strong>, for the Markov process{' '}
        <Tex tex="M" />.
      </Fragment>
    </section>
  );
}
