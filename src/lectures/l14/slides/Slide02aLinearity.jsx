import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import LinearityMap, { C1, C2, QUESTIONS, SHOW_F } from '../components/LinearityMap.jsx';

export const F1 = r`\textcolor{${C1}}{f(\vv e_1)}`;
export const F2 = r`\textcolor{${C2}}{f(\vv e_2)}`;

// Example 1's questions (their key presses are in LinearityMap's QUESTIONS) and answers
export const ASKED = [
  { v: r`\vv e_1+\vv e_2`, to: r`${F1}+${F2}=\begin{bmatrix}1\\ 2\end{bmatrix}` },
  { v: r`2\vv e_1`, to: r`2${F1}=\begin{bmatrix}4\\ 2\end{bmatrix}` },
  { v: r`2\vv e_1+\vv e_2`, to: r`2${F1}+${F2}=\begin{bmatrix}3\\ 3\end{bmatrix}` },
];

/**
 * Linearity Principle (Mark's, Section 1; the slide's title names it, so its box has none). Key
 * press 1: Example 1, f(x) = Ax with A = [2 −1; 1 1], and the picture (LinearityMap) with e₁, e₂; 2:
 * f(e₁), on the picture too; 3: f(e₂), likewise; 4–9: where e₁ + e₂, 2e₁ and 2e₁ + e₂ go, each the
 * question (its sum built tip-to-tail on the left), then the answer (the same through f on the
 * right).
 */
export default function Slide02aLinearity() {
  return (
    <section className="dense">
      <h2>Linearity Principle</h2>

      <div className="block theorem">
        <p>
          For <Tex tex={r`c_1,c_2\in\mathbb R`} /> and <Tex tex={r`\vv v_1,\vv v_2\in\mathbb R^n`} />, we have{' '}
          <Tex tex={r`f(c_1\vv v_1+c_2\vv v_2)=c_1f(\vv v_1)+c_2f(\vv v_2)`} />.
        </p>
      </div>

      <Fragment index={1} as="p" className="l14-ex-a">
        <strong>Example 1.</strong> Let <Tex tex={r`f(\vv x)=A\vv x`} /> be the linear transformation given by the
        matrix <Tex tex={r`A=\begin{bmatrix}2&-1\\ 1&1\end{bmatrix}`} />.
      </Fragment>
      <p className="l14-ex-b">
        <Fragment index={SHOW_F[0]} as="span">
          Then <Tex tex={r`${F1}=\begin{bmatrix}2\\ 1\end{bmatrix}`} />
        </Fragment>{' '}
        <Fragment index={SHOW_F[1]} as="span">
          and <Tex tex={r`${F2}=\begin{bmatrix}-1\\ 1\end{bmatrix}`} />.
        </Fragment>
      </p>
      <div className="l14-ex">
        <ul className="bullets l14-ex-q">
          {ASKED.map((q, k) => (
            <Fragment key={k} index={QUESTIONS[k].index} as="li">
              Where does <Tex tex={q.v} /> go?
              <Fragment index={QUESTIONS[k].index + 1}>
                <Tex tex={r`f(${q.v})=${q.to}`} />.
              </Fragment>
            </Fragment>
          ))}
        </ul>
        <Fragment index={1}>
          <LinearityMap />
        </Fragment>
      </div>
    </section>
  );
}
