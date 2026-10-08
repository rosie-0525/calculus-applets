import { useEffect, useState } from 'react';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isShowing = (el) => el?.closest('section')?.classList.contains('present');

/**
 * The view of a WebGL picture, as Space.jsx's for the SVG ones: the azimuth rocks slowly about
 * `az` (degrees) while the slide is showing, until the picture is turned by dragging it.
 * Returns { az, el, handlers } (handlers go on the canvas).
 */
export default function useOrbit(ref, { az: az0, el: el0, rock = true, swing = 14, period = 12, elRange = [-10, 80] }) {
  const [t, setT] = useState(0);
  const [turn, setTurn] = useState(null); // { az, el } once turned by hand
  const [grab, setGrab] = useState(null);

  useEffect(() => {
    if (!rock || turn || reducedMotion()) return undefined;
    let id;
    const start = performance.now();
    const tick = (now) => {
      if (isShowing(ref.current)) setT((now - start) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [rock, turn, ref]);

  const az = turn ? turn.az : az0 + swing * Math.sin((2 * Math.PI * t) / period);
  const el = turn ? turn.el : el0;

  const handlers = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setGrab({ at: [e.clientX, e.clientY], az, el });
    },
    onPointerMove: (e) => {
      if (!grab) return;
      setTurn({
        az: grab.az - (e.clientX - grab.at[0]) * 0.4,
        el: Math.max(elRange[0], Math.min(elRange[1], grab.el + (e.clientY - grab.at[1]) * 0.4)),
      });
    },
    onPointerUp: () => setGrab(null),
    onPointerCancel: () => setGrab(null),
  };

  return { az, el, handlers };
}
