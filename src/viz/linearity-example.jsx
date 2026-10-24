import { useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import LinearityMap from '../lectures/l14/components/LinearityMap.jsx';
import { F1, F2, ASKED } from '../lectures/l14/slides/Slide02aLinearity.jsx';

export const lecture = 14;

/*
 * Example 1 of Linearity Principle without the principle (the caption says it): f(x) = Ax with
 * A = [2 −1; 1 1], f(e₁) and f(e₂), and the picture, e₁, e₂ beside f(e₁), f(e₂). On the slide the
 * three questions come on key presses, each built tip-to-tail on the left, then through f on the
 * right, the one before fading back; here a button picks one (again to put it away): its copies of
 * e₁, e₂ and of f(e₁), f(e₂) glide tip-to-tail, and its answer is under the picture (`lm-pick` in
 * site.css shows only the picked question's fragments of LinearityMap).
 */
export default function LinearityExample() {
  const [q, setQ] = useState(null);
  return (
    <div className="viz-col lm-applet">
      <p className="lm-example">
        Let <Tex tex={r`f(\vv x)=A\vv x`} /> with <Tex tex={r`A=\begin{bmatrix}2&-1\\ 1&1\end{bmatrix}`} />. Then{' '}
        <Tex tex={r`${F1}=\begin{bmatrix}2\\ 1\end{bmatrix}`} /> and <Tex tex={r`${F2}=\begin{bmatrix}-1\\ 1\end{bmatrix}`} />.
      </p>
      <div className="viz-toggle" role="group" aria-label="Where does it go?">
        {ASKED.map((a, k) => (
          <button key={a.v} type="button" className="viz-button" aria-pressed={q === k} onClick={() => setQ(q === k ? null : k)}>
            Where does <Tex tex={a.v} /> go?
          </button>
        ))}
      </div>
      <div className="lm-pick" data-q={q ?? ''}>
        <LinearityMap />
      </div>
      <div className="lm-answers" aria-live="polite">
        {ASKED.map((a, k) => (
          <p key={a.v} className={q === k ? 'lm-shown' : undefined}>
            <Tex tex={r`f(${a.v})=${a.to}`} />
          </p>
        ))}
      </div>
    </div>
  );
}
