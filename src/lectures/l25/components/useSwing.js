import { useEffect, useRef, useState } from 'react';
import { ease } from './inv.js';

/**
 * A number that swings, eased, from 0 to 1 over `ms`, holds there `hold` ms, swings back to 0,
 * holds, and so on while `on` (a picture going there and back: T_A, then T_A⁻¹). It waits at 0
 * while `live()` is false (its slide not on screen). Without `on`, it stays at 0.
 */
export default function useSwing(on, { ms = 1600, hold = 1400, delay = 500, live = () => true } = {}) {
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
    const run = (from, to, next) => {
      let t0;
      const step = (now) => {
        if (t0 === undefined) t0 = now;
        const k = Math.min(1, (now - t0) / ms);
        setT(from + (to - from) * ease(k));
        if (k < 1) frame = requestAnimationFrame(step);
        else timer = setTimeout(next, hold);
      };
      frame = requestAnimationFrame(step);
    };
    const forth = () => {
      if (!liveRef.current()) {
        timer = setTimeout(forth, hold);
        return;
      }
      run(0, 1, () => run(1, 0, forth));
    };
    timer = setTimeout(forth, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, ms, hold, delay]);
  return t;
}
