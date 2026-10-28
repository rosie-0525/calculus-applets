import { useEffect, useRef, useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import { useTween } from '../lectures/l15/components/useFragmentTween.js';
import { AMBER, VIOLET } from '../lectures/l15/components/la.js';
import { X0, Picture } from '../lectures/l15/slides/Slide09Cancellation.jsx';

export const lecture = 15;

/** True from the first time the applet is on screen (its section `present`, see Applet.jsx). */
function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section || seen) return undefined;
    const check = () => section.classList.contains('present') && setSeen(true);
    check();
    const mo = new MutationObserver(check);
    mo.observe(section, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [ref, seen]);
  return seen;
}

// when C and A come (the slide's key presses 2 and 3), after B's turn (by 2.1 s) and C's flip (by
// 1.9 s after it) are over
const C_AT = 2400;
const A_AT = C_AT + 2200;

/*
 * Caution 1 without its words (the caption says them): B, C and A, and the picture, x turning by
 * 180° to Bx, flipping to Cx, and then the plane squashed onto the x-axis, where Bx and Cx land on
 * the same point. On the slide B, C and A come on a key press each; here they come one after the
 * other the first time the applet is on screen, and again on Replay, with the slide's tweens. x can
 * be dragged.
 */
export default function NoCancellation() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [x, setX] = useState(X0);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    setStep(1);
    const timers = [setTimeout(() => setStep(2), C_AT), setTimeout(() => setStep(3), A_AT)];
    return () => timers.forEach(clearTimeout);
  }, [seen, run]);
  const tb = useTween(step >= 1, { ms: 1500, delay: 600 });
  const tc = useTween(step >= 2, { ms: 1500, delay: 400 });
  const tt = useTween(step >= 3, { ms: 2200, delay: 400 });
  const replay = () => {
    setStep(0);
    setRun((n) => n + 1);
  };
  return (
    <div className="viz-col" ref={ref}>
      <div className="l15-cancel">
        <div className="l15-cancel-text">
          <ul className="bullets l15-cancel-maps">
            <li>
              <Tex tex={r`\textcolor{${AMBER}}{B}`} />: rotation by <Tex tex={r`180^\circ`} />
            </li>
            <li>
              <Tex tex={r`\textcolor{${VIOLET}}{C}`} />: reflection across the <Tex tex="y" />-axis
            </li>
            <li>
              <Tex tex="A" />: projection onto the <Tex tex="x" />-axis
            </li>
          </ul>
        </div>
        <div className="l15-cancel-pic">
          <Picture x={x} sb={step >= 2 ? 1 : tb} sc={step >= 3 ? 1 : tc} t={tt} onDrag={setX} />
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  );
}
