import { useRef, useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import TwoStepF from '../lectures/l21/components/TwoStepF.jsx';
import { FxMarker } from '../lectures/l21/components/Fragment.jsx';
import { STEPS, SHORT } from '../lectures/l21/slides/Slide21Products.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

/**
 * A true-or-false poll, as on the slide (the deck's poll box, its options), its options buttons: a
 * click on either outlines the right one (the deck's poll-answer marker is always reached on the
 * page, so the option is `correct` only once picked) and the wrong one if picked, and shows
 * `children(true)`, why; the next click starts again.
 */
export function TrueFalse({ statement, answer = 'True', children }) {
  const [picked, setPicked] = useState(null);
  return (
    <div className="viz-col tf">
      <FxMarker index={0} id="poll-answer" />
      <div className="block poll fx-host tf-poll">
        <p>{statement}</p>
        <ul className="poll-options two">
          {['True', 'False'].map((opt, k) => (
            <li key={opt} className={picked && opt === answer ? 'correct tf-correct' : picked === opt ? 'tf-wrong' : ''}>
              <button type="button" className="tf-opt" aria-pressed={picked === opt} onClick={() => setPicked((p) => (p ? null : opt))}>
                <span className="opt">{'AB'[k]}</span> {opt}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="tf-why" style={from(picked ? 1 : 0, 1)}>
        {children(!!picked)}
      </div>
    </div>
  );
}

/*
 * Poll: products of orthogonal matrices, without its title: true or false, if A and B are n × n
 * orthogonal matrices, is AB orthogonal? Then why, by algebra, (AB)ᵀ(AB) = BᵀAᵀAB = BᵀB = Iₙ, and by
 * geometry: T_A and T_B preserve lengths, so does T_AB = T_A ∘ T_B, beside a picture on a loop: F
 * rotated by T_B (by 90°, amber), then flipped by T_A (across the y-axis, blue), then F back home
 * and T_AB (the reflection across y = x, purple) straight to the same place. On the slide the answer
 * and the two columns come on three key presses; here a click on True or False shows them all, and
 * the picture starts.
 */
export default function OrthogonalProducts() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  return (
    <div ref={ref}>
      <TrueFalse
        statement={
          <>
            True or false: if <Tex tex="A" /> and <Tex tex="B" /> are <Tex tex={r`n\times n`} /> orthogonal matrices, then <Tex tex="AB" /> is orthogonal.
          </>
        }
      >
        {(on) => (
          <div className="l21-ag l21-poll-ag">
            <div className="l21-ag-col">
              <p className="l21-ag-head">Algebra</p>
              <p className="l21-ag-f">
                <Tex tex={r`(AB)^{\top}(AB)=B^{\top}A^{\top}AB=B^{\top}B=I_n`} />
              </p>
              <p>
                <Tex tex={r`\Rightarrow`} /> <Tex tex="AB" /> is orthogonal
              </p>
            </div>
            <div className="l21-ag-col">
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
                <TwoStepF steps={STEPS} shortcut={SHORT} on={on} live={live} title="F rotated by T_B, then flipped by T_A, then taken straight there by T_AB: its size never changes" />
              </div>
            </div>
          </div>
        )}
      </TrueFalse>
    </div>
  );
}
