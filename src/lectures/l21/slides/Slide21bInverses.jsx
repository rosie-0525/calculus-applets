import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import TwoStepF from '../components/TwoStepF.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { BLUE, AMBER, rot } from '../components/tr.js';

// the picture: F turned by T_A (by 90°), then turned back by T_A⁻¹ (named as in the second bullet)
export const STEPS = [
  { tex: 'T_A', color: BLUE, at: (k) => rot(90 * k) },
  { tex: 'T_A^{-1}', color: AMBER, at: (k) => rot(-90 * k) },
];

/**
 * Poll (the user's request: Inverses of orthogonal matrices turned into a true-or-false question;
 * Mark's property, the textbook's Proposition 20.4.4): if A is an n × n orthogonal matrix, is A
 * invertible with A⁻¹ orthogonal? Key press 1: True is outlined; then why, two bullets, the user's
 * words (in place of the Algebra and Geometry columns, at the user's request), one per key press:
 * 2: AᵀA = Iₙ ⇒ A is invertible; 3: T_A preserves length ⇒ T_A⁻¹ also preserves length ⇒ A⁻¹ is
 * orthogonal. ⇒ for "so", no periods (the first poll's simple style). Beside them, a picture, on a
 * loop from key press 3: F turned by T_A (90°, blue), then back by
 * T_{A⁻¹} (amber) after a stop (the user's request), T_A or T_{A⁻¹} shown while it acts (TwoStepF). Print: F back home. (Two
 * white cards, tried, were reverted.) (The strip, F turned by A and back by A⁻¹, was dropped
 * with the slide's title and its theorem box.)
 */
export default function Slide21bInverses() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const shown = useFragmentShown(ref);
  return (
    <section>
      <h2>Poll</h2>

      <FxMarker index={1} id="poll-answer" />
      <div className="block poll fx-host">
        <p>
          True or false: if <Tex tex="A" /> is an <Tex tex={r`n\times n`} /> orthogonal matrix, then <Tex tex="A" /> is invertible and <Tex tex={r`A^{-1}`} /> is orthogonal.
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
      <div className="l21-inv-why">
        <ul>
          <Fragment index={2} as="li">
            <Tex tex={r`A^{\top}A=I_n`} /> <Tex tex={r`\Rightarrow`} /> <Tex tex="A" /> is invertible
          </Fragment>
          <Fragment index={3} as="li">
            <Tex tex="T_A" /> preserves length <Tex tex={r`\Rightarrow`} /> <Tex tex={r`T_A^{-1}`} /> also preserves length <Tex tex={r`\Rightarrow`} /> <Tex tex={r`A^{-1}`} /> is orthogonal
          </Fragment>
        </ul>
        <Fragment index={3}>
          <TwoStepF steps={STEPS} on={shown} live={live} title="F turned by T_A, then turned back by its inverse" />
        </Fragment>
      </div>
    </section>
  );
}
