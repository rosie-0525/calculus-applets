import { createRef, useEffect, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';

/**
 * Invisible markers for the key presses `ats` (fragment indices; a fixed list): returns the markers
 * (to render in the slide, outside any svg) and, for each, whether its key press has been reached.
 * A picture that moves on key presses reads them through this (see useFragmentShown).
 */
export function useMarkers(ats) {
  const refs = useRef(ats.map(() => createRef())).current;
  const [on, setOn] = useState(() => ats.map(() => false));
  useEffect(() => {
    const els = refs.map((ref) => ref.current);
    const update = () => {
      const now = els.map((el) => !!el && el.classList.contains('visible'));
      setOn((old) => (old.every((v, i) => v === now[i]) ? old : now));
    };
    update();
    const observer = new MutationObserver(update);
    els.forEach((el) => el && observer.observe(el, { attributes: true, attributeFilter: ['class'] }));
    return () => observer.disconnect();
  }, [refs]);
  const markers = ats.map((k, i) => <span key={i} ref={refs[i]} className="fragment fx-marker" data-fragment-index={k} aria-hidden="true" />);
  return [markers, on];
}

/**
 * Print mode: a still per key press, stacked in one place. `stills` = [{ at, node }], in order; the
 * one with no `at` shows on arrival; each shows from its key press until the next one's.
 */
export function Stills({ stills, className = '' }) {
  return (
    <div className={`l24-stack ${className}`.trim()}>
      {stills.map(({ at, node }, i) => {
        const next = stills[i + 1]?.at;
        const inner =
          next != null ? (
            <Fragment index={next} effect="fade-out">
              {node}
            </Fragment>
          ) : (
            node
          );
        return at == null ? (
          <div key={i}>{inner}</div>
        ) : (
          <Fragment key={i} index={at}>
            {inner}
          </Fragment>
        );
      })}
    </div>
  );
}
