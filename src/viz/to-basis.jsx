import { useRef, useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import Fragment from '../lectures/l20/components/Fragment.jsx';
import { hl } from '../lectures/l20/components/Redund.jsx';
import { During, Removing, SPANS } from '../lectures/l20/slides/Slide02aToBasis.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 20;

// the slide's key presses, 1 to 5, each a button
const STEPS = [
  'If they are dependent',
  <>
    <Tex tex={r`\vv v_k`} /> is redundant
  </>,
  <>
    Remove <Tex tex={r`\vv v_k`} />
  </>,
  'Repeat',
  'A basis',
];

/*
 * From a spanning set to a basis, without its title and its theorem (the caption has it): V =
 * span{v₁, …, v_k}; if the v's are linearly dependent, a relation with the c's not all zero; say
 * c_k ≠ 0, then v_k is in the span of the others; so V = span{v₁, …, v_{k−1}}; repeating, the
 * collection becomes linearly independent. Beside it the plane V spanned by v₁, …, v₄ (its span over
 * it, updated as vectors go): v₄ turns amber, is removed, then v₃, and v₁, v₂ turn green, a basis.
 * The 3-D picture rocks while the applet is on screen and turns when dragged. On the slide these
 * come one key press at a time; here a button picks how far it goes.
 */
export default function ToBasis() {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useFragmentSteps(ref, n);
  return (
    <div className="viz-col" ref={ref}>
      <div className="viz-toggle" role="group" aria-label="How far it goes">
        {STEPS.map((label, k) => (
          <button key={k} type="button" className="viz-button" aria-pressed={n === k + 1} onClick={() => setN(n === k + 1 ? 0 : k + 1)}>
            {label}
          </button>
        ))}
      </div>
      <div className="stage l20-tb-stage">
        <div className="stage-text">
          <p>
            Let <Tex tex={r`V=\operatorname{span}\{\vv v_1,\dots,\vv v_k\}`} />.
          </p>
          <Fragment index={1}>
            <p>
              If <Tex tex={r`\vv v_1,\dots,\vv v_k`} /> are linearly dependent, then we have a relation
            </p>
            <Tex display className="centered" tex={r`c_1\vv v_1+\dots+c_k\vv v_k=\vv 0`} />
            <p>
              where not all <Tex tex={r`c_i`} /> are zero.
            </p>
          </Fragment>
          <Fragment index={2}>
            <p>
              Say <Tex tex={r`c_k`} /> is nonzero, then
            </p>
            <Tex display className="centered" tex={String.raw`${hl(r`\vv v_k`)}=-\frac{c_1}{c_k}\vv v_1-\dots-\frac{c_{k-1}}{c_k}\vv v_{k-1}\in\operatorname{span}\{\vv v_1,\dots,\vv v_{k-1}\}.`} />
          </Fragment>
          <Fragment index={3} as="p">
            So <Tex tex={r`V=\operatorname{span}\{\vv v_1,\dots,\vv v_{k-1}\}`} />.
          </Fragment>
          <Fragment index={4} as="p">
            Repeating this, we eventually make the collection linearly independent.
          </Fragment>
        </div>

        <div className="stage-fig">
          <div className="l20-tb-tags">
            {SPANS.map(([start, end, tex]) => (
              <During key={tex} from={start} to={end} as="div" className="l20-tb-span">
                <Tex tex={tex} />
              </During>
            ))}
          </div>
          <Removing redundant={2} drop4={3} drop3={4} basis={5} />
        </div>
      </div>
    </div>
  );
}
