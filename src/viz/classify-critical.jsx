import { useEffect, useRef } from 'react';
import '../lectures/l26/styles/deck.css';
import DefCards from '../lectures/l26/components/DefCards.jsx';

export const lecture = 26;

/**
 * Click to check, on cards the deck draws (as image-r1.jsx's useClickToCheck): each `card` inside
 * `ref` is made a button (focusable, Enter or Space), and a click on it marks it `data-checked`, for
 * site.css to show its answer. A click that ends a drag (turning a graph) does not count. The mark
 * stays until the applet is drawn afresh.
 */
export function useCheckCards(ref, card, label) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const cards = [...root.querySelectorAll(card)];
    const mark = (c) => {
      c.dataset.checked = '';
      c.setAttribute('aria-label', 'Checked');
    };
    cards.forEach((c) => {
      c.tabIndex = 0;
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', label);
    });
    let down = null;
    const press = (e) => {
      down = [e.clientX, e.clientY];
    };
    const click = (e) => {
      const c = e.target.closest?.(card);
      if (!c || !root.contains(c)) return;
      if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
      mark(c);
    };
    const key = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const c = e.target.closest?.(card);
      if (!c || !root.contains(c) || e.target !== c) return;
      e.preventDefault();
      mark(c);
    };
    root.addEventListener('pointerdown', press);
    root.addEventListener('click', click);
    root.addEventListener('keydown', key);
    return () => {
      root.removeEventListener('pointerdown', press);
      root.removeEventListener('click', click);
      root.removeEventListener('keydown', key);
    };
  }, [ref, card, label]);
}

/*
 * Classifying critical points, without its title: DefCards.jsx's three columns (run 'goal'), each a
 * graph with its critical point 0 (a dot), what 0 is over it, a local minimum, a local maximum, a
 * saddle point, and its formula under it, x² + y², −x² − y², x² − y². On the slide the columns come one
 * key press at a time, then in each in turn its quadratic form turns blue, with what kind of quadratic
 * form it is under it: positive-definite, negative-definite, indefinite. Here the columns are there at
 * once, and a column shows its kind once it is clicked (useCheckCards; site.css hides it until then).
 * Each graph turns when dragged. In a narrow box the columns are one under the other (definiteness.jsx's
 * .def-cards rules).
 */
export default function ClassifyCritical() {
  const ref = useRef(null);
  useCheckCards(ref, '.l25-def', 'What kind of quadratic form? Click to check');
  return (
    <div ref={ref} className="def-cards cc-ask">
      <DefCards run="goal" semi={false} />
    </div>
  );
}
