import { useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex, { r } from '../lectures/l26/components/Tex.jsx';
import Space, { Dot3 } from '../lectures/l26/components/Space.jsx';
import Surface from '../lectures/l26/components/Surface.jsx';
import { CASES, R, Z } from '../lectures/l26/slides/Slide06gInconclusive.jsx';

export const lecture = 26;

/*
 * When the test is inconclusive, without its title: the slide's three columns (Classifying critical
 * points' classes), each a graph with its critical point 0, a dot, and under it its formula and its
 * Hessian at 0: x² + y⁴, −x² − y⁴, x² − y⁴, with (Hf)(0) = [2 0; 0 0], [−2 0; 0 0], [2 0; 0 0], each
 * with the eigenvalue 0. On the slide what 0 is comes over each graph on a key press: a local minimum,
 * a local maximum, a saddle point. Here that place is a button, which asks in gray, what is 0?, until it
 * is clicked (Lecture 18's inv-pick). Each graph turns when dragged. In a narrow box the columns are one under
 * the other (definiteness.jsx's .def-cards rules).
 */
export default function Inconclusive() {
  const [checked, setChecked] = useState(() => CASES.map(() => false));
  return (
    <div className="def-cards inc-ask">
      <div className="l25-defs l26-defs-goal l26-inc">
        {CASES.map((c, k) => (
          <div key={c.name} className="l25-def">
            <p className="l25-def-clause">
              <button
                type="button"
                className="inv-pick inc-pick"
                aria-pressed={checked[k]}
                onClick={() => setChecked((v) => v.map((x, i) => x || i === k))}
              >
                {checked[k] ? <strong>{c.kind}</strong> : <span className="inv-ask">
                    What is <Tex tex={r`\vv 0`} />?
                  </span>}
              </button>
            </p>
            <div className="l25-def-pic">
              <Space width={390} height={248} unit={78} center={[0.5, c.c]} el={22} axes={false} rock={false} title={`The graph of ${c.name}`}>
                {(s) => (
                  <g>
                    <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
                    <Dot3 s={s} at={[0, 0, 0]} color="#14213d" r={5.5} stroke="#fff" strokeWidth="1.5" />
                  </g>
                )}
              </Space>
              <p className="l25-def-q">
                <Tex tex={`f(x,y)=${c.q}`} />
              </p>
              <p className="l25-def-q">
                <Tex tex={r`(Hf)(\vv 0)=${c.h}`} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
