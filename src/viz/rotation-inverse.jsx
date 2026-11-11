import { useRef, useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import Strip from '../lectures/l21/components/Strip.jsx';
import useSwing from '../lectures/l21/components/useSwing.js';
import { STEPS, Rot } from '../lectures/l21/slides/Slide01cUndo.jsx';
import { from, useFragmentSteps } from './redundancies.jsx';

export const lecture = 21;

/**
 * Strip's steps at stage `n`: a step already taken is frozen where it ended (its `path` constant),
 * so that when the strip is drawn afresh for a stage (its tweens run as it mounts: the page shows
 * every fragment), only the newest step moves.
 */
const stepsAt = (n) => STEPS.map((s, k) => (k < n - 1 ? { ...s, path: () => s.path(1) } : s));

const ASK = [
  [<>Turn <Tex tex="F" /> by <Tex tex={r`R_\theta`} /></>, 1],
  [<>Turn it back by <Tex tex={r`R_\theta^{-1}`} /></>, 2],
  [<>Compare <Tex tex={r`R_\theta`} /> and <Tex tex={r`R_\theta^{-1}`} /></>, 3],
];

/*
 * Inverse of a rotation, without its title, its first line (the caption has it) and the owl's
 * question (the next applet's caption asks it): a strip, F turned by R_θ (θ = 60°, blue), then back
 * by R_θ⁻¹ (amber), each arrow's matrix under it; then R_θ flipping across its diagonal into R_θ⁻¹
 * and back. On the slide these come on three key presses, and the flip loops; here three buttons,
 * each after the one before: the strip is drawn afresh for each step (the steps before it frozen),
 * and the flip loops as on the slide.
 */
export default function RotationInverse() {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useFragmentSteps(ref, n);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const k = useSwing(n >= 3, { ms: 1700, hold: 1400, delay: 500, live });
  return (
    <div className="viz-col rinv" ref={ref}>
      <div className="l21-undo-strip">
        <Strip key={Math.min(n, 2)} steps={stepsAt(n)} unit={84} named={false} />
      </div>
      <div className="l21-undo-row rinv-flip" style={from(n, 3)}>
        <div className="l21-undo-flip">
          <span className="l21-stack">
            <span style={{ opacity: 1 - k }}>
              <Tex tex={r`R_\theta=`} />
            </span>
            <span style={{ opacity: k }}>
              <Tex tex={r`R_\theta^{-1}=`} />
            </span>
          </span>
          <Rot t={k} diag />
        </div>
      </div>
      <div className="viz-toggle">
        {ASK.map(([label, k2]) => (
          <button key={k2} type="button" className="viz-button" aria-pressed={n === k2} disabled={n < k2 - 1} onClick={() => setN(k2)}>
            {label}
          </button>
        ))}
        <button type="button" className="viz-button" disabled={n === 0} onClick={() => setN(0)}>
          Start again
        </button>
      </div>
    </div>
  );
}
