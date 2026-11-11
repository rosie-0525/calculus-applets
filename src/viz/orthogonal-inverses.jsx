import { useRef } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import TwoStepF from '../lectures/l21/components/TwoStepF.jsx';
import { STEPS } from '../lectures/l21/slides/Slide21bInverses.jsx';
import { TrueFalse } from './orthogonal-products.jsx';

export const lecture = 21;

/*
 * Poll: inverses of orthogonal matrices, without its title: true or false, if A is an n × n
 * orthogonal matrix, is A invertible with A⁻¹ orthogonal? Then why, two bullets: AᵀA = Iₙ ⇒ A is
 * invertible; T_A preserves length ⇒ T_A⁻¹ also preserves length ⇒ A⁻¹ is orthogonal; beside them,
 * a picture on a loop: F turned by T_A (by 90°, blue), then back by T_A⁻¹ (amber). On the slide the
 * answer and the bullets come on three key presses; here a click on True or False shows them all, and
 * the picture starts.
 */
export default function OrthogonalInverses() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  return (
    <div ref={ref}>
      <TrueFalse
        statement={
          <>
            True or false: if <Tex tex="A" /> is an <Tex tex={r`n\times n`} /> orthogonal matrix, then <Tex tex="A" /> is invertible and <Tex tex={r`A^{-1}`} /> is orthogonal.
          </>
        }
      >
        {(on) => (
          <div className="l21-inv-why">
            <ul>
              <li>
                <Tex tex={r`A^{\top}A=I_n`} /> <Tex tex={r`\Rightarrow`} /> <Tex tex="A" /> is invertible
              </li>
              <li>
                <Tex tex="T_A" /> preserves length <Tex tex={r`\Rightarrow`} /> <Tex tex={r`T_A^{-1}`} /> also preserves length <Tex tex={r`\Rightarrow`} /> <Tex tex={r`A^{-1}`} /> is orthogonal
              </li>
            </ul>
            <TwoStepF steps={STEPS} on={on} live={live} title="F turned by T_A, then turned back by its inverse" />
          </div>
        )}
      </TrueFalse>
    </div>
  );
}
