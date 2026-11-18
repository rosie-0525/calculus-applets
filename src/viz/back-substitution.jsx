import { useLayoutEffect, useRef, useState } from 'react';
import '../lectures/l23/styles/deck.css';
import Fragment from '../lectures/l23/components/Fragment.jsx';
import Substitution from '../lectures/l23/components/Substitution.jsx';
import HappyFigure from '../lectures/l23/components/HappyFigure.jsx';
import { UPPER, LOWER, UP_AT, LOW_COL, LOW_AT, HAPPY } from '../lectures/l23/slides/Slide03BackSub.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 23;

/**
 * The slide inside `ref` as at key press `n`, for Lecture 23's figures, whose moves are deck.css's
 * animations and its components' own watch on reveal's classes. As useFragmentSteps (which this
 * calls) the fragments not reached yet are hidden; besides:
 *   - a fragment not reached yet is marked `data-later`, and site.css stops its animations there,
 *     so that each one starts when its key press is reached (the page marks every fragment
 *     `visible` from the start, which on the slide is what starts them);
 *   - the fragments of key press n get reveal's `current-fragment`: deck.css plays only the step
 *     just shown (LU decomposition by elimination), the steps before it showing their end;
 *   - a bare marker that a component watches for reveal's `visible` (a `.fx-marker` with no
 *     `data-fx`: TexMorph's, RankPicture's, the trigger of MultiplierFlight) is taken out of the
 *     page's "every fragment visible" (it loses its class `fragment`), and is `visible` once its
 *     key press is reached.
 * Fragments React adds later are caught as they come; `redraw`, a figure's key, catches a figure
 * drawn afresh at once, before its effects look at its markers.
 */
export function useKeyPresses(ref, n, redraw) {
  useFragmentSteps(ref, n);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const apply = () => {
      root.querySelectorAll('.fx-marker[data-fragment-index]:not([data-fx]):not([data-fx-off])').forEach((m) => {
        if (m.classList.contains('fragment')) m.classList.remove('fragment');
        const on = Number(m.dataset.fragmentIndex) <= n;
        if (m.classList.contains('visible') !== on) m.classList.toggle('visible', on);
      });
      root.querySelectorAll('.fragment[data-fragment-index]').forEach((f) => {
        const k = Number(f.dataset.fragmentIndex);
        if (k > n && f.dataset.later === undefined) f.dataset.later = '';
        else if (k <= n && f.dataset.later !== undefined) delete f.dataset.later;
        if (f.classList.contains('current-fragment') !== (k === n)) f.classList.toggle('current-fragment', k === n);
      });
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(root, { subtree: true, childList: true });
    return () => mo.disconnect();
  }, [ref, n, redraw]);
}

// the slide's key presses: the upper system's (two per equation, the last one solve only), the
// lower system's, the owl; not the one that shows the lower system's column (shown from the start)
const PRESSES = [0, ...Array.from({ length: HAPPY }, (_, k) => k + 1).filter((k) => k !== LOW_COL)];

/*
 * Back substitution, without its title: a T-chart, on the left Example 2's upper triangular system
 * (3x + 6y + z = 1, 3y + z = −2, 6z = 6) solved from the bottom up, on the right the textbook's lower
 * triangular system (22.1.1) (2x = 6, −3x + y = −7, x + 4y + 3z = 5) from the top down
 * (Substitution.jsx): an equation's diagonal term gets a yellow band and its value appears at the
 * right of the row; then the value flies along its column into the other equations, in green, in
 * place of the variable. Last, the owl, up the stairs z, y, x, jumps for joy among confetti:
 * "Triangular systems are easy to solve!". On the slide these come one key press at a time and the
 * lower system comes on a key press of its own; here both systems are there from the start, and a
 * button takes the next step (each value's flight played as it is reached), another starts again.
 */
export default function BackSubstitution() {
  const ref = useRef(null);
  const [k, setK] = useState(0);
  useKeyPresses(ref, PRESSES[k]);
  const last = PRESSES.length - 1;
  return (
    <div className="viz-col bsub" ref={ref}>
      <div className="l22-tchart l23-bs">
        <div className="l22-tcol">
          <p className="l22-thead">Upper triangular: from the bottom up</p>
          <Substitution sys={UPPER} start={UP_AT} />
        </div>
        <div className="l22-tcol">
          <p className="l22-thead">Lower triangular: from the top down</p>
          <Substitution sys={LOWER} start={LOW_AT} />
        </div>
      </div>
      <Fragment index={HAPPY} className="l23-happy-row l23-bs-happy">
        <HappyFigure />
        <p className="l23-happy-say">Triangular systems are easy to solve!</p>
      </Fragment>
      <div className="viz-toggle">
        <button type="button" className="viz-button" disabled={k >= last} onClick={() => setK((s) => Math.min(last, s + 1))}>
          Next step
        </button>
        <button type="button" className="viz-button" disabled={k === 0} onClick={() => setK(0)}>
          Start again
        </button>
      </div>
    </div>
  );
}
