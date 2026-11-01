import { useRef, useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex from '../lectures/l18/components/Tex.jsx';
import { EXAMPLES } from '../lectures/l18/components/UndoExamples.jsx';
import { LoopCard, usePresentClock } from '../lectures/l18/slides/Slide02bUndo.jsx';
import { useSection } from './undo-life.jsx';

export const lecture = 18;

/** "Rotation by 90°" → "rotation by 90°", after "T =" (as on Invertible linear transformations). */
const lower = (s) => s[0].toLowerCase() + s.slice(1);

/*
 * Linear transformation: Invertible or not?, without its title: six linear transformations of ℝ², two
 * rows of three cards, each on a loop (while the applet is on screen), the plane and F gliding to
 * their images and fading, to start again. On the slide each card comes on a key press and its
 * verdict on the next; here a card shows its verdict when it is clicked, with S, what undoes it, as
 * on Invertible linear transformations, and its loop starts again with S bringing the plane and F
 * back (amber) if T is invertible. The next click hides it.
 */
export default function InvertibleOrNot() {
  const ref = useRef(null);
  const clock = usePresentClock(useSection(ref));
  // the clock's time when each card was checked
  const [checked, setChecked] = useState({});
  const toggle = (k) =>
    setChecked(({ [k]: was, ...rest }) => (was === undefined ? { ...rest, [k]: clock } : rest));
  return (
    <div className="l18-undo" ref={ref}>
      {EXAMPLES.map((ex, k) => {
        const on = checked[k] !== undefined;
        return (
          <figure key={ex.name} className="l18-undo-card">
            <button type="button" className="inv-pick" aria-pressed={on} aria-label={`${ex.name}: invertible or not?`} onClick={() => toggle(k)}>
              <LoopCard ex={ex} t={on ? clock - checked[k] : clock} undo={on} />
            </button>
            <figcaption>
              <Tex tex="T" /> = {lower(ex.name)}
              <br />
              {!on ? (
                <span className="inv-ask">invertible or not?</span>
              ) : ex.undo ? (
                <span className="l18-undo-by">
                  invertible: <Tex tex="S" /> = {ex.undo === 'itself' ? <Tex tex="T" /> : ex.undo}
                </span>
              ) : (
                <span className="l18-not">not invertible</span>
              )}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
