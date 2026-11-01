import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { BLUE, RED } from '../lectures/l18/components/inv.js';

export const lecture = 18;

const STEPS = [
  { id: 'swap', text: <>swap <Tex tex={r`\textcolor{${BLUE}}{a}`} /> and <Tex tex={r`\textcolor{${BLUE}}{d}`} /></> },
  { id: 'sign', text: <>change the signs of <Tex tex={r`\textcolor{${RED}}{b}`} /> and <Tex tex={r`\textcolor{${RED}}{c}`} /></> },
  { id: 'divide', text: <>divide by <Tex tex={r`\det(A)=ad-bc`} /></> },
];

/** An entry of [a b; c d], with the minus sign that step 2 shows on b and c. */
function cell(name) {
  return (
    <span className={`l18-cell ${name}`}>
      {(name === 'b' || name === 'c') && <span className="l18-minus">−</span>}
      <Tex tex={name} />
    </span>
  );
}

/*
 * Determinant's recipe for A⁻¹, without the title and the two boxes (the caption has them): A = [a b;
 * c d], done in place by the deck's CSS: a and d swap places (blue), b and c change sign (red), then
 * the matrix is divided by ad − bc and A becomes A⁻¹. On the slide the steps come on three key
 * presses (their fx-markers); here the markers are the page's own, not fragments, and a click on a
 * step does the steps up to it; Start again undoes them.
 */
export default function InverseFormula() {
  const [done, setDone] = useState(0);
  return (
    <div className="viz-col">
      {STEPS.map((s, k) => (
        <span key={s.id} className={`fx-marker${done > k ? ' visible' : ''}`} data-fx={s.id} aria-hidden="true" />
      ))}
      <div className="l18-recipe fx-host">
        <div className="l18-recipe-name">
          <span className="l18-name-a">
            <Tex tex="A=" />
          </span>
          <span className="l18-name-inv">
            <Tex tex="A^{-1}=" />
          </span>
        </div>
        <span className="l18-recipe-factor">
          <Tex tex={r`\dfrac{1}{ad-bc}`} />
        </span>
        <span className="l18-mat">
          {cell('a')}
          {cell('b')}
          {cell('c')}
          {cell('d')}
        </span>
        <ol className="l18-recipe-steps">
          {STEPS.map((s, k) => (
            <li key={s.id}>
              <button type="button" className="inv-step" aria-pressed={done > k} onClick={() => setDone(k + 1)}>
                {s.text}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setDone(0)} disabled={!done}>
          Start again
        </button>
      </div>
    </div>
  );
}
