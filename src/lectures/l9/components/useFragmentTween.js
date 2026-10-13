import { useEffect, useRef, useState } from 'react';

/**
 * True while the reveal.js fragment `ref` is shown: reveal adds the class `visible` to it, which a
 * MutationObserver notices (so this needs no handle on the Reveal instance).
 */
export function useFragmentShown(ref) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setShown(el.classList.contains('visible'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [ref]);
  return shown;
}

/**
 * A number that glides from 0 to 1 (eased) over `ms` milliseconds, `delay` ms after `on` turns true,
 * and drops back to 0 at once when `on` turns false (going back a key press).
 */
export function useTween(on, { ms = 1800, delay = 600 } = {}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) {
      setT(0);
      return undefined;
    }
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      setT(k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, ms, delay]);
  return t;
}

/** A number that glides to `target` whenever the target changes; it can also be set by hand. */
export function useGlide(target, ms = 1800) {
  const [v, setV] = useState(target);
  const now = useRef(v);
  now.current = v;
  useEffect(() => {
    const from = now.current;
    if (from === target) return undefined;
    let frame;
    let t0;
    const step = (t) => {
      if (t0 === undefined) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      setV(from + (target - from) * e);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return [v, setV];
}
