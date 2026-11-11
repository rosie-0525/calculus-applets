import { useEffect, useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import Plane, { Dot } from './Plane.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { PRINT } from './print.js';
import { INK, I2, ease } from './tr.js';

const mul = (P, Q) => [
  [P[0][0] * Q[0][0] + P[0][1] * Q[1][0], P[0][0] * Q[0][1] + P[0][1] * Q[1][1]],
  [P[1][0] * Q[0][0] + P[1][1] * Q[1][0], P[1][0] * Q[0][1] + P[1][1] * Q[1][1]],
];

// the timeline (ms), its phases in turn, then again: F at home; the first step; a stop (the user's
// request); the second step; a hold; F fades out where it ended and back in at home; with a
// shortcut, the shortcut straight there, a hold, and F back home again the same way
const STEPS_MS = [
  ['rest', 500],
  ['one', 1300],
  ['pause', 800],
  ['two', 1300],
  ['hold', 1100],
  ['out', 300],
  ['in', 300],
];
const SHORT_MS = [
  ['short', 1500],
  ['hold2', 1400],
  ['out2', 300],
  ['in2', 300],
];

/** Milliseconds into the round of `total` ms while `on`, from 0 each time round; it waits at 0 while `live()` is false (its slide not on screen), and stays at 0 without `on`. */
function useLoopClock(on, { total, delay, live }) {
  const [t, setT] = useState(0);
  const liveRef = useRef(live);
  liveRef.current = live;
  useEffect(() => {
    if (!on) {
      setT(0);
      return undefined;
    }
    let frame;
    let timer;
    let t0;
    const tick = (now) => {
      if (t0 === undefined) t0 = now;
      const e = now - t0;
      if (e >= total) {
        setT(0);
        t0 = undefined;
        round();
        return;
      }
      setT(e);
      frame = requestAnimationFrame(tick);
    };
    const round = () => {
      if (!liveRef.current()) {
        timer = setTimeout(round, 400);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    timer = setTimeout(round, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, total, delay]);
  return t;
}

/**
 * F moved by two linear transformations in turn, in one picture (the two polls on orthogonal
 * matrices). `steps` = [first, second] and `shortcut` (optional), each { tex, color, at(k) }: its
 * name, its colour and its matrix on the way from I (k from 0 to 1). On a loop while `on` (from its
 * key press): the first step, a stop, the second (F in the colour of the step under way), a hold;
 * then F back home and, with a shortcut, the shortcut taking it straight to the same place (the
 * user's request: T_B, then T_A, then T_AB). The faint grid, and F in gray where it started. Under
 * it, the name of the step under way, alone, kept through the stop or the hold after it; none while
 * F goes home or rests there. Print: F after the two steps, no name.
 */
export default function TwoStepF({ steps: [one, two], shortcut, on, live, title }) {
  const phases = shortcut ? [...STEPS_MS, ...SHORT_MS] : STEPS_MS;
  const total = phases.reduce((a, [, d]) => a + d, 0);
  const t = useLoopClock(on && !PRINT, { total, delay: 300, live });
  const end = mul(two.at(1), one.at(1));

  let name = 'hold';
  let k = 1;
  if (!PRINT) {
    let t0 = 0;
    for (const [n, d] of phases) {
      if (t < t0 + d) {
        name = n;
        k = (t - t0) / d;
        break;
      }
      t0 += d;
    }
    if (!on) name = 'rest';
  }

  const at = {
    rest: [I2, one, 1, null],
    one: [one.at(ease(k)), one, 1, one],
    pause: [one.at(1), one, 1, one],
    two: [mul(two.at(ease(k)), one.at(1)), two, 1, two],
    hold: [end, two, 1, PRINT ? null : two],
    out: [end, two, 1 - k, null],
    in: [I2, shortcut ?? one, k, shortcut ?? null],
    short: [shortcut?.at(ease(k)), shortcut, 1, shortcut],
    hold2: [shortcut?.at(1), shortcut, 1, shortcut],
    out2: [shortcut?.at(1), shortcut, 1 - k, null],
    in2: [I2, one, k, null],
  };
  const [M, step, fade, label] = at[name];

  // the frame: room for the unit square turned by 45° on the way (its corner at height √2)
  return (
    <div className="l21-two">
      <Plane xRange={[-1.12, 1.2]} yRange={[-0.25, 1.47]} unit={66} pad={4} grid={false} axes={false} title={title}>
        {(p) => (
          <g>
            <GridImage p={p} n={3} />
            <FImage p={p} home />
            {fade > 0 && <FImage p={p} M={M} color={step.color} opacity={0.9 * fade} />}
            <Dot p={p} at={[0, 0]} color={INK} r={3} />
          </g>
        )}
      </Plane>
      <p className="l21-two-step">{label && <Tex tex={r`\textcolor{${label.color}}{${label.tex}}`} />}</p>
    </div>
  );
}
