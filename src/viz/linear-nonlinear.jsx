import { useRef } from 'react';
import '../lectures/l17/styles/deck.css';
import Tex, { r } from '../lectures/l17/components/Tex.jsx';
import { LinearOrNot, T_COLOR } from '../lectures/l17/components/Zoom.jsx';
import { G_COLOR } from '../lectures/l17/components/ChainPicture.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 17;

/*
 * Recall: Linearity principle, without its title: a row per function, its formula, then the patch
 * round a with the letter F and the plane round its image, the arrow named, "linear" or "nonlinear"
 * under it; a copy of the patch flies over, then T squeezes it and the grid into parallelograms, or
 * g bends them. On the slide T plays on a key press, then g comes and plays on two more; here both
 * play the first time the applet is on screen, and a click on a picture plays it again.
 */
export default function LinearNonlinear() {
  const ref = useRef(null);
  const [run] = useReplay(ref);
  return (
    <div className="lin-col" ref={ref}>
      <div className="l17-lin-row">
        <Tex tex={r`\textcolor{${T_COLOR}}{T}\begin{bmatrix}x\\y\end{bmatrix}=\begin{bmatrix}1&1\\-\tfrac12&1\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix}`} />
        <LinearOrNot key={run} which="T" play={1} />
      </div>
      <div className="l17-lin-row">
        <Tex tex={r`\textcolor{${G_COLOR}}{g}\begin{bmatrix}x\\y\end{bmatrix}=\begin{bmatrix}x+\tfrac14\sin 2y\\y-\tfrac15\sin 2x\end{bmatrix}`} />
        <LinearOrNot key={run} which="g" play={1} />
      </div>
    </div>
  );
}
