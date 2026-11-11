import { useEffect, useState } from 'react';
import { PRINT } from './print.js';

/**
 * Seconds since the picture was built, ticking (every frame) only while its slide is on screen
 * (`ref` is an element in it); frozen at `still` in print mode (PartSlide.jsx's clock).
 */
export default function useClock(ref, still = 0) {
  const [t, setT] = useState(still);
  useEffect(() => {
    if (PRINT) return undefined;
    const t0 = performance.now();
    let frame;
    const step = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) setT((now - t0) / 1000);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ref]);
  return t;
}
