import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import SumPicture, { A, X0 } from '../components/SumPicture.jsx';
import { RED, BLUE, AMBER } from '../components/la.js';

// the picture's ranges: room for x to go round (wider than the title slide's)
export const XR = [-2.4, 2.6];
export const YR = [-1.25, 2.05];
export const texM = (M) => r`\begin{bmatrix}${M.map((row) => row.join('&')).join(r`\\ `)}\end{bmatrix}`;

/**
 * What A + B does: Mark's theorem (→ Proposition 15.2.4), its first sentence (its second, on cA, is
 * on What cA does, split from this slide at the user's request). The matrices' names in the colours
 * of their arrows (the user's request). Key press 1: A (a shear), and x, Ax on the picture; 2: B
 * (rotation by 90°), and Bx; 3: A + B, and (A + B)x with the parallelogram of Ax and Bx (the copy
 * of Bx gliding to the tip of Ax removed by the user), and the textbook reference. x can be dragged
 * (a ring round its tip shows it).
 */
export default function Slide04SumMaps() {
  const [x, setX] = useState(X0);
  return (
    <section className="dense">
      <h2>
        What <Tex tex="A+B" /> does
      </h2>

      <div className="block theorem">
        <p className="block-title">Theorem</p>
        <p>
          The linear functions associated to the matrices <Tex tex="A" />, <Tex tex="B" /> and <Tex tex="A+B" /> satisfy{' '}
          <Tex tex={r`T_{A+B}(\vv x)=T_A(\vv x)+T_B(\vv x)`} />.
        </p>
        <Fragment index={3} as="p" className="pointer corner">
          (→ Proposition 15.2.4)
        </Fragment>
      </div>

      <Fragment index={1} className="l15-summap">
        <div className="l15-summap-ms">
          <Tex tex={r`\textcolor{${BLUE}}{A}=${texM(A)}`} />
          <Fragment index={2}>
            <Tex tex={r`\textcolor{${AMBER}}{B}=\begin{bmatrix}0&-1\\ 1&0\end{bmatrix}`} />
          </Fragment>
          <Fragment index={3}>
            <Tex tex={r`\textcolor{${RED}}{A+B}=\begin{bmatrix}1&0\\ 1&1\end{bmatrix}`} />
          </Fragment>
        </div>
        <div className="l15-summap-pic">
          <SumPicture x={x} unit={100} xRange={XR} yRange={YR} index={[1, 2, 3]} onDrag={setX} />
        </div>
      </Fragment>
    </section>
  );
}
