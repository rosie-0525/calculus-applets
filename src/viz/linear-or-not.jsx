import { useRef, useState } from 'react';
import '../lectures/l14/styles/deck.css';
import { CARDS, Card, useClock, phase } from '../lectures/l14/slides/Slide05bLinearOrNot.jsx';

export const lecture = 14;

/*
 * Linear or not?: the eight maps of ℝ², each a card where the grid, the unit square S and the F in
 * it glide to their images and back, on a loop, all in step (while the applet is on screen). On the
 * slide the cards come one per key press, each followed by its verdict; here a card shows its
 * verdict when it is clicked, and hides it on the next click.
 */
export default function LinearOrNot() {
  const ref = useRef(null);
  const s = phase(useClock(ref, 0));
  const [checked, setChecked] = useState([]);
  const toggle = (name) => setChecked((v) => (v.includes(name) ? v.filter((n) => n !== name) : [...v, name]));
  return (
    <div className="l14-lin-grid" ref={ref}>
      {CARDS.map((card) => {
        const on = checked.includes(card.name);
        return (
          <figure key={card.name} className="l14-lin-card">
            <button type="button" className="l14-lin-pic lin-check" aria-pressed={on} aria-label={`${card.name}: linear or not?`} onClick={() => toggle(card.name)}>
              <Card card={card} s={s} />
              {on && <span className={`l14-lin-verdict ${card.linear ? 'yes' : 'no'}`}>{card.linear ? '✓ linear' : '✗ not linear'}</span>}
            </button>
            <figcaption>{card.name}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
