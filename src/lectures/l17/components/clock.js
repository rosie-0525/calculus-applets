import { useEffect, useState } from 'react';
import { PRINT } from './print.js';

/**
 * The seconds since the slide holding `ref` came on screen (reveal gives it the class `present`):
 * 0 while it is not on screen, so a picture left behind does not keep moving, and always 0 in
 * print mode (the copies of a slide run no animation). `on` false stops the clock.
 */
export function useClock(ref, { on = true } = {}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (PRINT || !on) return undefined;
    let frame;
    let t0;
    const tick = (now) => {
      const section = ref.current?.closest('section');
      if (section?.classList.contains('present')) {
        if (t0 === undefined) t0 = now;
        setT((now - t0) / 1000);
      } else {
        t0 = undefined;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ref, on]);
  return t;
}

/** Smoothstep: 0 → 1 with an easy start and end. */
export const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
