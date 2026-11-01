import { useLayoutEffect, useRef, useState } from 'react';
import '../lectures/l18/styles/deck.css';
import { CARDS, LifeCard, usePresentClock } from '../lectures/l18/slides/Slide02aLife.jsx';
import { CW, CH, seg } from '../lectures/l18/components/LifeCartoons.jsx';

export const lecture = 18;

/**
 * A ref to the applet's section, for the deck's clocks that take the slide's own (they run while it
 * is `present`, which the page sets while the applet is on screen).
 */
export function useSection(ref) {
  const section = useRef(null);
  useLayoutEffect(() => {
    section.current = ref.current?.closest('section') ?? null;
  });
  return section;
}

// the process alone on a loop (s): 0.4–2.6 as on the slide, then it stays done and fades out, to
// start again (no undo arrow, no way back)
const LOOP = 4.4;

/** A process on its loop, `t` s on the clock, before it is checked: LifeCard without the answer. */
function ForwardCard({ card, t }) {
  const k = t % LOOP;
  const fade = k < 0.3 ? seg(k, 0, 0.3) : 1 - seg(k, LOOP - 0.5, LOOP);
  const { Pic } = card;
  return (
    <svg className="l18-life-pic" viewBox={`0 0 ${CW} ${CH}`} width={CW} height={CH} role="img" aria-label={card.name}>
      <rect x={1} y={1} width={CW - 2} height={CH - 2} rx={12} fill="#f6f7f9" stroke="#e5e7eb" strokeWidth="1.5" />
      <g opacity={fade}>
        <Pic p={seg(k, 0.4, 2.6)} time={t} />
      </g>
    </svg>
  );
}

/*
 * Which can be undone?, without its title and its sentence (the caption has it): opening an
 * umbrella, zipping a jacket, breaking an egg, each as a cartoon on a loop (while the applet is on
 * screen). On the slide each card comes on a key press with its undo arrow, and the process runs
 * backward or the arrow is crossed out, its verdict under it; here a card plays its process only,
 * until it is clicked: then its loop starts again with the undo arrow, and its verdict shows. The
 * next click hides them.
 */
export default function UndoLife() {
  const ref = useRef(null);
  const clock = usePresentClock(useSection(ref));
  // the clock's time when each card was checked
  const [checked, setChecked] = useState({});
  const toggle = (k) =>
    setChecked(({ [k]: was, ...rest }) => (was === undefined ? { ...rest, [k]: clock } : rest));
  return (
    <div className="l18-undo l18-life" ref={ref}>
      {CARDS.map((card, k) => {
        const on = checked[k] !== undefined;
        return (
          <figure key={card.name} className="l18-undo-card">
            <button type="button" className="inv-pick" aria-pressed={on} aria-label={`${card.name}: can it be undone?`} onClick={() => toggle(k)}>
              {on ? <LifeCard card={card} t={clock - checked[k]} /> : <ForwardCard card={card} t={clock} />}
            </button>
            <figcaption>
              {card.name}
              <br />
              {!on ? (
                <span className="inv-ask">can it be undone?</span>
              ) : card.ok ? (
                <span className="l18-undo-by">invertible</span>
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
