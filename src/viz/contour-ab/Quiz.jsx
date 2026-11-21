import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Tex from '../../lectures/l26/components/Tex.jsx';
import { AbPlot, formula, formulaText } from './shared.jsx';

/*
 * The story's quiz: four contour plots, A to D, of x² + 4y², 4x² + y², x² − 4y² and −4x² + y² (wide
 * and tall ellipses; hyperbolas with their asymptotes closer to the x-axis, and to the y-axis), in
 * another order, and the four formulas as labels in a tray over them, to drag into the place under
 * each plot (the user's request, in place of a menu under each). A label dropped on a plot, or on
 * its place, goes there; one already there goes back to where the new one came from (the tray, or
 * the other place). Dropped on the tray it goes back; dropped anywhere else it flies back to where
 * it was. Without dragging: click (or tap, or Enter) a label, then a plot or its place. Every move
 * glides (FLIP: each label is measured before the move and slides from there).
 *
 * Check marks each place right (green, a tick) or wrong (red, a shake), with the right formula under
 * a wrong one, and counts them; all four right, the plots hop one after the other and the empty tray
 * says so. A new move takes the marks away; Start over puts every label back in the tray. A screen reader hears "Contour plot
 * A", not the formula.
 */

const FORMS = [
  [1, 4],
  [4, 1],
  [1, -4],
  [-4, 1],
];
const PLOTS = [3, 0, 2, 1]; // the form of each plot, A to D
const LETTERS = 'ABCD';
const EMPTY = PLOTS.map(() => null);

/** The label k moved to the place `to` (an index) or to the tray (null): the new places. */
function move(place, k, to) {
  const from = place.indexOf(k);
  if (to === null) return from < 0 ? place : place.map((x, i) => (i === from ? null : x));
  if (from === to) return place;
  const there = place[to];
  return place.map((x, i) => (i === to ? k : i === from ? there : x));
}

/** The scale of the figure the element is in (Figure.jsx scales it to fit). */
const scaleOf = (el) => el.getBoundingClientRect().width / el.offsetWidth || 1;

const still = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const inside = (el, x, y) => {
  const b = el?.getBoundingClientRect();
  return b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
};

export default function Quiz() {
  const [place, setPlace] = useState(EMPTY); // the label in each place, A to D (an index of FORMS)
  const [checked, setChecked] = useState(false);
  const [held, setHeld] = useState(null); // the label clicked, to put somewhere with a second click
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(undefined); // where it would drop: a place, the tray (null), or nowhere

  const chips = useRef(new Map()); // label → its element
  const items = useRef([]); // each plot with its place
  const tray = useRef(null);
  const drag = useRef(null);
  const before = useRef(null); // label → where it was, before a move
  const clickless = useRef(false); // the click that ends a drag is not a click

  const right = PLOTS.map((k, i) => place[i] === k);
  const score = right.filter(Boolean).length;
  const full = place.every((k) => k !== null);
  const inTray = FORMS.map((_, k) => k).filter((k) => !place.includes(k));

  const commit = (next) => {
    if (next === place) return;
    const m = new Map();
    chips.current.forEach((el, k) => m.set(k, el.getBoundingClientRect()));
    before.current = m;
    setPlace(next);
    setChecked(false);
  };
  const put = (k, to) => {
    setHeld(null);
    commit(move(place, k, to));
  };

  // Glide every label from where it was to where it is now.
  useLayoutEffect(() => {
    const m = before.current;
    before.current = null;
    if (!m || still()) return;
    chips.current.forEach((el, k) => {
      const a = m.get(k);
      if (!a || !el.isConnected) return;
      const b = el.getBoundingClientRect();
      const s = scaleOf(el);
      const dx = (a.left + a.width / 2 - b.left - b.width / 2) / s;
      const dy = (a.top + a.height / 2 - b.top - b.height / 2) / s;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.getBoundingClientRect();
      el.style.transition = 'transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.15)';
      el.style.transform = '';
    });
  }, [place]);

  // Escape lets go of a clicked label.
  useEffect(() => {
    if (held === null) return undefined;
    const key = (e) => e.key === 'Escape' && setHeld(null);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [held]);

  const target = (x, y) => {
    const i = items.current.findIndex((el) => inside(el, x, y));
    if (i >= 0) return i;
    return inside(tray.current, x, y) ? null : undefined;
  };

  const down = (e, k) => {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = { k, el, id: e.pointerId, x: e.clientX, y: e.clientY, s: scaleOf(el), moved: false };
  };
  const moveTo = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      d.moved = true;
      setDragging(d.k);
      setHeld(null);
    }
    d.el.style.transition = 'none';
    d.el.style.transform = `translate(${dx / d.s}px, ${dy / d.s}px) rotate(-3deg) scale(1.06)`;
    setOver(target(e.clientX, e.clientY));
  };
  const up = (e, cancel) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return; // a click
    // the click that follows (if the label is still there), not a click
    clickless.current = true;
    setTimeout(() => {
      clickless.current = false;
    });
    setDragging(null);
    setOver(undefined);
    const to = cancel ? undefined : target(e.clientX, e.clientY);
    const next = to === undefined ? place : move(place, d.k, to);
    if (next !== place) {
      commit(next);
    } else {
      // back to where it was
      d.el.style.transition = still() ? 'none' : 'transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.15)';
      d.el.style.transform = '';
    }
  };

  const clickChip = (e, k) => {
    e.stopPropagation();
    if (clickless.current) {
      clickless.current = false;
      return;
    }
    const at = place.indexOf(k);
    if (held === null || held === k) setHeld(held === k ? null : k);
    else if (at >= 0) put(held, at); // the clicked label's place: swap
    else setHeld(k);
  };
  const clickPlace = (i) => held !== null && put(held, i);
  const startOver = () => {
    setHeld(null);
    commit(EMPTY);
  };
  const clickTray = () => held !== null && place.includes(held) && put(held, null);

  const chip = (k, i) => {
    const [a, b] = FORMS[k];
    const mark = checked && i !== undefined ? (right[i] ? ' right' : ' wrong') : '';
    return (
      <button
        key={k}
        type="button"
        ref={(el) => el && chips.current.set(k, el)}
        className={`cab-quiz-chip${held === k ? ' held' : ''}${dragging === k ? ' dragging' : ''}${mark}`}
        aria-pressed={held === k}
        aria-label={i === undefined ? formulaText(a, b) : `${formulaText(a, b)}, under plot ${LETTERS[i]}`}
        onPointerDown={(e) => down(e, k)}
        onPointerMove={moveTo}
        onPointerUp={(e) => up(e)}
        onPointerCancel={(e) => up(e, true)}
        onLostPointerCapture={(e) => up(e, true)}
        onClick={(e) => clickChip(e, k)}
      >
        <Tex tex={formula(a, b)} />
        {mark === ' right' ? (
          <span className="cab-quiz-tick" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className={`cab-quiz${held !== null || dragging !== null ? ' cab-quiz-moving' : ''}`}>
      <div className={`cab-quiz-tray${over === null ? ' over' : ''}`} ref={tray} onClick={clickTray}>
        {inTray.map((k) => chip(k))}
        {inTray.length ? null : (
          <span className={`cab-quiz-hint${checked && score === 4 ? ' won' : ''}`}>
            {!checked ? 'All placed. Check your answers.' : score === 4 ? 'All four right!' : 'Drag the red labels to try again.'}
          </span>
        )}
      </div>
      <div className="cab-quiz-grid">
        {PLOTS.map((k, i) => {
          const [a, b] = FORMS[k];
          const won = checked && score === 4;
          return (
            <figure
              className={`cab-fig cab-quiz-item${won ? ' won' : ''}`}
              key={LETTERS[i]}
              ref={(el) => {
                items.current[i] = el;
              }}
              style={won ? { animationDelay: `${i * 110}ms` } : undefined}
              onClick={() => clickPlace(i)}
            >
              <figcaption className="cab-quiz-letter">{LETTERS[i]}</figcaption>
              <AbPlot a={a} b={b} size={140} nameSize={14} title={`Contour plot ${LETTERS[i]}`} />
              <div className={`cab-quiz-place${over === i ? ' over' : ''}${place[i] === null ? ' empty' : ''}`}>
                {place[i] === null ? (
                  <button
                    type="button"
                    className="cab-quiz-drop"
                    aria-label={`Under plot ${LETTERS[i]}: empty`}
                    onClick={(e) => {
                      e.stopPropagation();
                      clickPlace(i);
                    }}
                  >
                    drop here
                  </button>
                ) : (
                  chip(place[i], i)
                )}
              </div>
              <p className={`cab-quiz-mark${checked ? (right[i] ? ' right' : ' wrong') : ''}`} aria-live="polite">
                {checked ? (
                  right[i] ? (
                    'Right'
                  ) : (
                    <>
                      No: <Tex tex={formula(a, b)} />
                    </>
                  )
                ) : (
                  ' '
                )}
              </p>
            </figure>
          );
        })}
      </div>
      <div className="cab-quiz-check">
        <button type="button" className="viz-button" onClick={() => setChecked(true)} disabled={!full}>
          Check
        </button>
        <button type="button" className="viz-button" onClick={startOver} disabled={place.every((k) => k === null)}>
          Start over
        </button>
        <span className="cab-quiz-score" aria-live="polite">
          {checked ? `${score} of 4 right.` : ''}
        </span>
      </div>
    </div>
  );
}
