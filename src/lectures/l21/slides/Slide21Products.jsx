import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import TwoStepF from '../components/TwoStepF.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { BLUE, AMBER, PURPLE, rot } from '../components/tr.js';

// the Geometry card's picture (the user's suggestion): F rotated by T_B (by 90°), then flipped by T_A
// (across the y-axis, F turning over like a card)
export const STEPS = [
  { tex: 'T_B', color: AMBER, at: (k) => rot(90 * k) },
  {
    tex: 'T_A',
    color: BLUE,
    at: (k) => [
      [1 - 2 * k, 0],
      [0, 1],
    ],
  },
];
// then the shortcut (the user's request): AB, the reflection across y = x, in one step, F turning
// over that line like a card
export const SHORT = {
  tex: 'T_{AB}',
  color: PURPLE,
  at: (k) => [
    [1 - k, k],
    [k, 1 - k],
  ],
};

/**
 * Poll (the user's request: Products of orthogonal matrices turned into a true-or-false question;
 * Mark's property, the textbook's Proposition 20.4.4): if A and B are n × n orthogonal matrices, is AB
 * orthogonal? Key press 1: True is outlined; 2: why, by algebra, (AB)ᵀ(AB) = BᵀAᵀAB = BᵀB = Iₙ; 3:
 * and by geometry, the user's words: since T_A and T_B preserve lengths, so does T_AB = T_A ∘ T_B ⇒
 * AB is orthogonal (Orthogonal matrices preserve lengths and angles). No periods after the lines
 * (the user's request). Beside the Geometry column's text, a picture, on a loop from key press 3 (the
 * user's request): F rotated by T_B (90°, amber), then flipped by T_A (across the y-axis, blue), then
 * F back home and T_AB (the reflection across y = x, purple) straight to the same place (the user's
 * request: T_B, a stop, T_A, then T_AB, then again), each name shown while it acts (TwoStepF). (Two white cards, tried, were reverted.)
 * Print: F rotated and flipped. (The strip, F reflected by B and turned by A, was dropped with the
 * slide's title and its theorem box.)
 */
export default function Slide21Products() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const shown = useFragmentShown(ref);
  return (
    <section>
      <h2>Poll</h2>

      <FxMarker index={1} id="poll-answer" />
      <div className="block poll fx-host">
        <p>
          True or false: if <Tex tex="A" /> and <Tex tex="B" /> are <Tex tex={r`n\times n`} /> orthogonal matrices, then <Tex tex="AB" /> is orthogonal.
        </p>
        <ul className="poll-options two">
          <li className="correct">
            <span className="opt">A</span> True
          </li>
          <li>
            <span className="opt">B</span> False
          </li>
        </ul>
      </div>

      <span ref={ref} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <div className="l21-ag l21-poll-ag">
        <Fragment index={2} className="l21-ag-col">
          <p className="l21-ag-head">Algebra</p>
          <p className="l21-ag-f">
            <Tex tex={r`(AB)^{\top}(AB)=B^{\top}A^{\top}AB=B^{\top}B=I_n`} />
          </p>
          <p>
            <Tex tex={r`\Rightarrow`} /> <Tex tex="AB" /> is orthogonal
          </p>
        </Fragment>
        <Fragment index={3} className="l21-ag-col">
          <p className="l21-ag-head">Geometry</p>
          <div className="l21-ag-geo">
            <div>
              <p>
                Since <Tex tex="T_A" /> and <Tex tex="T_B" /> preserve lengths, so does
              </p>
              <p className="l21-ag-f">
                <Tex tex={r`T_{AB}=T_A\circ T_B`} />
              </p>
              <p>
                <Tex tex={r`\Rightarrow`} /> <Tex tex="AB" /> is orthogonal
              </p>
            </div>
            <TwoStepF steps={STEPS} shortcut={SHORT} on={shown} live={live} title="F rotated by T_B, then flipped by T_A, then taken straight there by T_AB: its size never changes" />
          </div>
        </Fragment>
      </div>
    </section>
  );
}
