import { useRef } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { useTween } from '../lectures/l18/components/useFragmentTween.js';
import { BLUE, AMBER } from '../lectures/l18/components/inv.js';
import { Picture } from '../lectures/l18/slides/Slide09Diagonal.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 18;

/** F stretched by D, from when it mounts, then brought back by D⁻¹; each matrix as its map starts. */
function Glides() {
  const t = useTween(true, { ms: 1500, delay: 500 });
  const b = useTween(true, { ms: 1500, delay: 2800 });
  const from = (k) => ({ opacity: k > 0 ? 1 : 0, transition: 'opacity 0.4s ease' });
  return (
    <div className="l18-diag">
      <Picture t={t} b={b} />
      <div className="l18-diag-mats">
        <p style={from(t)}>
          <Tex tex={r`\textcolor{${BLUE}}{D=\begin{bmatrix}2&0\\0&1/2\end{bmatrix}}`} />
        </p>
        <p style={from(b)}>
          <Tex tex={r`\textcolor{${AMBER}}{D^{-1}=\begin{bmatrix}1/2&0\\0&2\end{bmatrix}}`} />
        </p>
      </div>
    </div>
  );
}

/*
 * Inverse of a diagonal matrix, without its title and its box (the caption has it): D = diag(2, 1/2)
 * (blue) stretches F along x and squeezes it along y, then D⁻¹ = diag(1/2, 2) (amber) takes it back.
 * On the slide each comes on a key press; here they play one after the other the first time the
 * applet is on screen, and again on Play again.
 */
export default function DiagonalInverse() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  return (
    <div className="viz-col" ref={ref}>
      <Glides key={run} />
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Play again
        </button>
      </div>
    </div>
  );
}
