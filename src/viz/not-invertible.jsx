import { useRef } from 'react';
import '../lectures/l18/styles/deck.css';
import { r } from '../lectures/l18/components/Tex.jsx';
import { A, ZERO, Example } from '../lectures/l18/slides/Slide04bNotAll.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 18;

/*
 * Not all square matrices are invertible, without its title: the zero matrix and the projection onto
 * the x-axis, each on a card in the style of Inverse of a matrix: T_A taking F to AF, gliding, two
 * points (blue, amber) landing on the same point (ringed); T_B ?, dashed, to "F again?" and a "?" by
 * the two points; the matrix A, and "no such B". On the slide each card comes in four key presses;
 * here both are shown, and play the first time the applet is on screen, and again on Play again.
 */
export default function NotInvertible() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  return (
    <div className="viz-col" ref={ref}>
      <div key={run}>
        <Example tag="Zero matrix" A={ZERO} matrix={r`A=\begin{bmatrix}0&0\\0&0\end{bmatrix}`} at={1} />
        <Example tag="Projection onto the x-axis" A={A} matrix={r`A=\begin{bmatrix}1&0\\0&0\end{bmatrix}`} at={5} className="l18-notall-next" />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Play again
        </button>
      </div>
    </div>
  );
}
