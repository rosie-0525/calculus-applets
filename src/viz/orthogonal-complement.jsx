import { useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import { useTween } from '../lectures/l20/components/useFragmentTween.js';
import { TEAL, AMBER } from '../lectures/l20/components/gs.js';
import { Picture } from '../lectures/l20/slides/Slide15Complement.jsx';
import { from } from './redundancies.jsx';

export const lecture = 20;

const name = (tex, color) => r`\textcolor{${color}}{${tex}}`;

/*
 * Orthogonal complement, without its title, its definition (the caption has it) and "Recall from the
 * Week 3 workshop": V₁ = span{(1, 2, 3), (4, 5, 6)}, a plane (teal), beside the picture of it with
 * its two vectors; V₁⊥ = span{(1, −2, 1)}, the line growing out of 0 perpendicular to it (amber);
 * (V₁⊥)⊥ = V₁: V₁ turns into a dashed grey ghost, and a vector perpendicular to the line sweeps once
 * round it, sweeping out the plane (V₁⊥)⊥, which lands on V₁. The 3-D picture rocks while the applet
 * is on screen and turns when dragged. On the slide these come on two key presses; here two
 * buttons, the second after the first.
 */
export default function OrthogonalComplement() {
  const [n, setN] = useState(0);
  const t1 = useTween(n >= 1, { ms: 1500, delay: 300 });
  const t2 = useTween(n >= 2, { ms: 700, delay: 300 });
  const t3 = useTween(n >= 2, { ms: 2600, delay: 1100 });
  return (
    <div className="viz-col">
      <div className="stage l20-ws-stage">
        <div className="stage-text">
          <div className="l20-oc-rows">
            <Tex tex={r`${name('V_1', TEAL)}=\operatorname{span}\left\{\begin{bmatrix}1\\2\\3\end{bmatrix},\begin{bmatrix}4\\5\\6\end{bmatrix}\right\}`} />
            <span>a plane</span>
            <span style={from(n, 1)}>
              <Tex tex={r`${name(r`V_1^\perp`, AMBER)}=\operatorname{span}\left\{\begin{bmatrix}1\\-2\\1\end{bmatrix}\right\}`} />
            </span>
            <span style={from(n, 1)}>
              the line perpendicular to <Tex tex={name('V_1', TEAL)} />
            </span>
            <span style={from(n, 2)}>
              <Tex tex={r`${name(r`(V_1^\perp)^\perp`, TEAL)}=${name('V_1', TEAL)}`} />
            </span>
            <span style={from(n, 2)}>
              the plane perpendicular to <Tex tex={name(r`V_1^\perp`, AMBER)} />
            </span>
          </div>
        </div>
        <div className="stage-fig">
          <Picture t1={t1} t2={t2} t3={t3} title="The plane V1 spanned by (1, 2, 3) and (4, 5, 6); the line V1 perp perpendicular to it; the perp of that line, swept out perpendicular to it, is V1" />
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={n === 1} onClick={() => setN(1)}>
          The line <Tex tex={r`V_1^\perp`} />
        </button>
        <button type="button" className="viz-button" aria-pressed={n === 2} disabled={n === 0} onClick={() => setN(2)}>
          Its complement <Tex tex={r`(V_1^\perp)^\perp`} />
        </button>
        <button type="button" className="viz-button" disabled={n === 0} onClick={() => setN(0)}>
          Start again
        </button>
      </div>
    </div>
  );
}
