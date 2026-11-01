import { useRef } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { FImage } from '../lectures/l18/components/FShape.jsx';
import { along } from '../lectures/l18/components/UndoExamples.jsx';
import { STRIPS, COLUMNS, StripStep } from '../lectures/l18/components/InverseStrip.jsx';
import { useTween } from '../lectures/l18/components/useFragmentTween.js';
import { BLUE, AMBER, GREEN } from '../lectures/l18/components/inv.js';
import { Panel } from '../lectures/l18/slides/Slide04bNotAll.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 18;

// the shortcut's arrow under a strip, from the middle of its first panel to the middle of its last
const W = COLUMNS.reduce((a, b) => a + b, 0);
const X0 = COLUMNS[0] / 2;
const X1 = W - COLUMNS[4] / 2;

// when each strip starts (ms after the applet comes on screen): the rotation, then the reflection
const STARTS = [500, 5600];

/** What shows only once `t` has started, fading in. */
const from = (t) => ({ opacity: t > 0 ? 1 : 0, transition: 'opacity 0.4s ease' });

/**
 * One example as on Inverse of a matrix (InverseStrip), on its card, tagged with its name: F, T_A
 * (blue) taking it to AF, gliding, `delay` ms after it mounts; then T_{A⁻¹} (amber) bringing it back
 * in the last panel; then the shortcut under the strip, T_{A⁻¹} ∘ T_A = identity map (green, as on
 * Invertible matrices). The matrices under the arrows from the start.
 */
function Strip({ strip, label, delay }) {
  const forth = useTween(true, { ms: 1500, delay });
  const back = useTween(true, { ms: 1500, delay: delay + 2100 });
  const done = back >= 1 ? 1 : 0;
  const tail = strip.same ? '=A' : '';
  return (
    <div className="l18-istrip l18-istrip-card">
      <span className="l18-istrip-tag">{label}</span>
      <div className="l18-istrip-row" style={{ gridTemplateColumns: COLUMNS.map((w) => `${w}px`).join(' ') }}>
        <Panel title="F" />
        <StripStep color={BLUE} name={<Tex tex="T_A" />} matrix={<Tex tex={`A=${strip.A}`} />} />
        <Panel title="AF">{(p) => <FImage p={p} M={along(strip.ex, forth)} color={BLUE} opacity={0.9} />}</Panel>
        <div style={from(back)}>
          <StripStep color={AMBER} name={<Tex tex="T_{A^{-1}}" />} matrix={<Tex tex={`A^{-1}=${strip.B}${tail}`} />} />
        </div>
        <div style={from(back)}>
          <Panel title="F again">{(p) => <FImage p={p} M={along(strip.ex, 1 - back)} color={AMBER} opacity={0.9} />}</Panel>
        </div>
      </div>
      <div className="l18-shortcut l18-ishortcut" style={from(done)}>
        <svg width={W} height="26" viewBox={`0 0 ${W} 26`} aria-hidden="true">
          <path d={`M ${X0} 0 V 18 H ${X1} V 12`} fill="none" stroke={GREEN} strokeWidth="3" />
          <polygon points={`${X1 - 7},13 ${X1},1 ${X1 + 7},13`} fill={GREEN} />
        </svg>
        <p>
          <span style={{ color: GREEN }}>
            <Tex tex={r`T_{A^{-1}}\circ T_A`} /> = identity map, <Tex tex={r`A^{-1}A=AA^{-1}=I_2`} />
          </span>
        </p>
      </div>
    </div>
  );
}

/*
 * Inverse of a matrix, without its title and its two boxes (the caption has them): the rotation by
 * 90° and the reflection across the y-axis, each as a strip on its card, F → AF → F again, named
 * T_A and T_{A⁻¹} with their matrices (as the slide ends, B renamed A⁻¹), and under each the
 * shortcut of Invertible matrices. On the slide the reflection's strip comes a key press at a time;
 * here the two play one after the other the first time the applet is on screen, and again on Play
 * again.
 */
export default function InverseMatrix() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  return (
    <div className="viz-col" ref={ref}>
      <div className="l18-istrips l18-istrips-cards" key={run}>
        <Strip strip={STRIPS.rotation} label="Rotation by 90°" delay={STARTS[0]} />
        <Strip strip={STRIPS.reflection} label="Reflection across the y-axis" delay={STARTS[1]} />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Play again
        </button>
      </div>
    </div>
  );
}
