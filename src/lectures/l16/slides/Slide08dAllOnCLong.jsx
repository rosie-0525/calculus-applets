import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import IslandMap from '../components/IslandMap.jsx';
import { PRINT } from '../components/print.js';
import { M_STAY, matpow, matvec } from '../components/markov.js';

// Example 2's p_0; p_k = M^k p_0 = (1/(3·2^k), 1/(3·2^k), 1 − 2/(3·2^k)). k only moves with the
// buttons (the user's request), up to K_MAX; in print mode, k = K_MAX.
export const P0 = [1 / 3, 1 / 3, 1 / 3];
export const K_MAX = 15;
export const POWERS = Array.from({ length: K_MAX + 1 }, (_, k) => matpow(M_STAY, k));
// an entry to three places; 0 and 1 (to that precision) as 0 and 1
export const f3 = (x) => (Math.abs(x) < 5e-4 ? '0' : Math.abs(x - 1) < 5e-4 ? '1' : x.toFixed(3));
export const bmatrix = (P) => r`\begin{bmatrix}${P.map((row) => row.map(f3).join('&')).join('\\\\ ')}\end{bmatrix}`;
export const vec = (v) => r`\begin{bmatrix}${v.map(f3).join('\\\\ ')}\end{bmatrix}`;

/**
 * Year k, starting at `from`, as a tear-off calendar ("YEAR" over "k = 3", the user's wording): a
 * click on it turns to the next year's page (up to K_MAX), and the round button beside it goes back to the start (the user's choice of design).
 */
export function useYear(from) {
  const [k, setK] = useState(PRINT ? K_MAX : from);
  const click = (next) => (e) => {
    setK(next);
    e.currentTarget.blur();
  };
  const year = (
    <span className="l16-year" data-prevent-swipe>
      <button type="button" className="l16-cal" aria-label="Next year" disabled={k >= K_MAX} onClick={click((kk) => Math.min(K_MAX, kk + 1))}>
        <span className="l16-cal-top">YEAR</span>
        {/* a new page for each year, so that it flips in */}
        <span key={k} className="l16-cal-num">
          <Tex tex={`k=${k}`} />
        </span>
      </button>
      <button type="button" className="l16-cal-reset" aria-label="Start again" onClick={click(from)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
          <path d="M5 3.5v4.6h4.6" />
        </svg>
      </button>
    </span>
  );
  return [k, year];
}

/**
 * Example 2 in the long run, after its parts (the user's request): key press 1, M^k, with year k,
 * from 0, a tear-off calendar, and a button back to the start (the user's request, in place of a
 * slider); 2, below it, p_k = M^k p_0 for the same k (the user's request: one calendar, after M^k),
 * said in words, beside Example 2's transition diagram with p_k's shares on the islands (its birds,
 * drawn as dots for a while, removed: the user's request); 3: all the birds end up on C.
 */
export default function Slide08dAllOnCLong() {
  const [k, year] = useYear(0);
  const p = matvec(POWERS[k], P0);

  return (
    <section>
      <h2>Example 2 in the long run</h2>

      <div className="l16-long">
        <div className="l16-long-left">
          <Fragment index={1} className="l16-long-cell">
            <Tex display className="l16-long-mat l16-long-m" tex={r`M^{${k}}\approx${bmatrix(POWERS[k])}`} />
            {year}
          </Fragment>
          {/* what p_k is, in words, its year k in the sentence (the user's wording) */}
          <Fragment index={2}>
            <p className="l16-long-what">
              <strong>Fraction of birds on islands A, B, C</strong> at <Tex tex={`k=${k}`} />
            </p>
            <Tex display className="l16-long-mat" tex={k === 0 ? r`=\mathbf p_0\approx${vec(p)}` : r`=\mathbf p_{${k}}=M^{${k}}\mathbf p_0\approx${vec(p)}`} />
          </Fragment>
        </div>
        <Fragment index={2} className="l16-long-map">
          <IslandMap M={M_STAY} width={400} r={66} shares={p} format={f3} />
        </Fragment>
      </div>

      <Fragment index={3} as="p" className="l16-long-so">
        In the long run, all the birds are on island C.
      </Fragment>
    </section>
  );
}
