import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { BLUE, AMBER, INK } from '../lectures/l18/components/inv.js';
import { Foot, Step } from '../lectures/l18/slides/Slide14Socks.jsx';

export const lecture = 18;

// the four steps: the matrix, what it does, its colour; and the foot after it
const STEPS = [
  { name: 'B', what: 'sock on', color: AMBER, sock: true, shoe: false },
  { name: 'A', what: 'shoe on', color: BLUE, sock: true, shoe: true },
  { name: 'A^{-1}', what: 'shoe off', color: BLUE, sock: true, shoe: false },
  { name: 'B^{-1}', what: 'sock off', color: AMBER, sock: false, shoe: false },
];

/*
 * Socks and shoes, without its title and its box (the caption has it): a foot; B puts on the sock, A
 * the shoe, and AB under the first three feet; A⁻¹ takes off the shoe, B⁻¹ the sock, and
 * (AB)⁻¹ = B⁻¹A⁻¹ under the last three. On the slide each step comes on a key press; here the
 * buttons pick how far it goes, and the steps after it are hidden. In a narrow box (see site.css)
 * the shoe going on and coming off are two rows, each with its bracket and its name.
 */
export default function SocksShoes() {
  const [n, setN] = useState(4);
  const shown = (k) => ({ opacity: n >= k ? 1 : 0, transition: 'opacity 0.35s ease' });
  return (
    <div className="viz-col">
      <div className="viz-toggle" role="group" aria-label="How far the steps go">
        {STEPS.map((s, k) => (
          <button key={s.name} type="button" className="viz-button" aria-pressed={n === k + 1} onClick={() => setN(k + 1)}>
            <Tex tex={s.name} />: {s.what}
          </button>
        ))}
      </div>
      <div className="l18-socks">
        <div className="l18-socks-row">
          <Foot />
          {STEPS.map((s, k) => [
            <div key={`s${k}`} style={shown(k + 1)}>
              <Step color={s.color} name={s.name} what={s.what} />
            </div>,
            <div key={`f${k}`} style={shown(k + 1)}>
              <Foot sock={s.sock} shoe={s.shoe} />
            </div>,
            // in a narrow box the steps break into two rows, and the second starts again from the shoe
            k === 1 && (
              <div key="again" className="socks-again" style={shown(3)} aria-hidden="true">
                <Foot sock shoe />
              </div>
            ),
          ])}
        </div>
        {/* the brackets and the names under the feet, as on the slide */}
        <svg className="l18-socks-brackets" width="1190" height="34" viewBox="0 0 1190 34" aria-hidden="true">
          <g style={shown(2)}>
            <path d="M 75 0 V 18 H 590" fill="none" stroke={INK} strokeWidth="2.5" />
            <path d="M 590 18 V 2" fill="none" stroke={INK} strokeWidth="2.5" />
          </g>
          <g style={shown(4)}>
            <path d="M 600 2 V 18 H 1115 V 0" fill="none" stroke={INK} strokeWidth="2.5" />
          </g>
        </svg>
        <div className="l18-socks-names">
          <p style={shown(2)}>
            <Tex tex="AB" />
          </p>
          <p style={shown(4)}>
            <Tex tex={r`(AB)^{-1}=\textcolor{${AMBER}}{B^{-1}}\textcolor{${BLUE}}{A^{-1}}`} />
          </p>
        </div>
      </div>
    </div>
  );
}
