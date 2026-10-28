import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import SumPicture, { A, X0 } from '../lectures/l15/components/SumPicture.jsx';
import { RED, BLUE, AMBER } from '../lectures/l15/components/la.js';
import { XR, YR, texM } from '../lectures/l15/slides/Slide04SumMaps.jsx';

export const lecture = 15;

/*
 * What A + B does without the theorem (the caption says it): A, B and A + B named in their arrows'
 * colours, beside x, Ax, Bx and (A + B)x = Ax + Bx with the parallelogram. On the slide each matrix
 * and its arrow come on a key press; here all are there. x can be dragged anywhere on the picture.
 */
export default function SumMaps() {
  const [x, setX] = useState(X0);
  return (
    <div className="l15-summap">
      <div className="l15-summap-ms">
        <Tex tex={r`\textcolor{${BLUE}}{A}=${texM(A)}`} />
        <Tex tex={r`\textcolor{${AMBER}}{B}=\begin{bmatrix}0&-1\\ 1&0\end{bmatrix}`} />
        <Tex tex={r`\textcolor{${RED}}{A+B}=\begin{bmatrix}1&0\\ 1&1\end{bmatrix}`} />
      </div>
      <div className="l15-summap-pic">
        <SumPicture x={x} unit={100} xRange={XR} yRange={YR} index={[1, 2, 3]} onDrag={setX} />
      </div>
    </div>
  );
}
