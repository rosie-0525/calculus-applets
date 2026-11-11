import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import FlipMatrix from '../components/FlipMatrix.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const A = [
  ['1', '2', '3'],
  ['4', '5', '6'],
];
export const CELL = 60;
export const LEFT = [110, 24]; // A
export const RIGHT = [500, 24]; // the copy that flips into Aᵀ

/**
 * Matrix transpose: Mark's definition (the columns of A written as rows), the general A and Aᵀ in
 * the box. Key press 1: the textbook's example, A = [1 2 3; 4 5 6], and a copy of it flipping across
 * its diagonal into Aᵀ, each row (red, blue) turning into a column; 2: (i, j)-th entry of Aᵀ = (j, i)-th
 * entry of A, in words (the user's wording, replacing (Aᵀ)ᵢⱼ = aⱼᵢ; the user removed the rings round
 * the entry 2 in both). Print: Aᵀ as it ends.
 */
export default function Slide02Transpose() {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const t = useTween(on, { ms: 1700, delay: 700 });
  const k = PRINT ? 1 : t;
  return (
    <section>
      <h2>Matrix transpose</h2>

      <div className="block definition l21-def">
        <p className="block-title">Definition</p>
        <p>
          The <strong>transpose</strong> matrix <Tex tex={r`A^{\top}`} /> of <Tex tex="A" /> is obtained by writing the columns of <Tex tex="A" /> as rows:
        </p>
        <Tex
          display
          className="l21-general"
          tex={r`\text{if }A=\begin{bmatrix}a_{11}&a_{12}&\cdots&a_{1n}\\ a_{21}&a_{22}&\cdots&a_{2n}\\ \vdots&\vdots&\ddots&\vdots\\ a_{m1}&a_{m2}&\cdots&a_{mn}\end{bmatrix},\ \text{ then }A^{\top}=\begin{bmatrix}a_{11}&a_{21}&\cdots&a_{m1}\\ a_{12}&a_{22}&\cdots&a_{m2}\\ \vdots&\vdots&\ddots&\vdots\\ a_{1n}&a_{2n}&\cdots&a_{mn}\end{bmatrix}.`}
        />
      </div>

      <span ref={ref} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <Fragment index={1} className="l21-flip-row">
        <svg viewBox="0 0 760 262" width="760" height="262" role="img" aria-label="A 2 by 3 matrix and its transpose">
          <FlipMatrix rows={A} t={0} x={LEFT[0]} y={LEFT[1]} cell={CELL} font={36} size label="A" />
          <FlipMatrix rows={A} t={k} x={RIGHT[0]} y={RIGHT[1]} cell={CELL} font={36} diag size label="A" />
        </svg>
        <Fragment index={2} className="l21-entry-rule">
          <span className="nowrap">
            <Tex tex="(i,j)" />-th entry of <Tex tex={r`A^{\top}`} />
          </span>
          <span className="nowrap">
            <Tex tex="=" /> <Tex tex="(j,i)" />-th entry of <Tex tex="A" />
          </span>
        </Fragment>
      </Fragment>
    </section>
  );
}
