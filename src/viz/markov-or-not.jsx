import { useState } from 'react';
import '../lectures/l16/styles/deck.css';
import { EXAMPLES } from '../lectures/l16/slides/Slide07Markov.jsx';

export const lecture = 16;

/*
 * Markov chains: the four processes side by side, each under its cartoon (Monopoly's dice roll
 * while the applet is on screen). On the slide each process comes on a key press and its verdict on
 * the next; here a process shows its verdict, and why, when its picture is clicked, and hides it on
 * the next click. (The definition is the caption.)
 */
export default function MarkovOrNot() {
  const [checked, setChecked] = useState([]);
  const toggle = (k) => setChecked((v) => (v.includes(k) ? v.filter((n) => n !== k) : [...v, k]));
  return (
    <ul className="l16-mc-examples">
      {EXAMPLES.map((e, k) => {
        const on = checked.includes(k);
        return (
          <li key={e.text}>
            <button type="button" className="mc-check" aria-pressed={on} aria-label={`${e.text.replace(/ /g, ' ')}: a Markov chain or not?`} onClick={() => toggle(k)}>
              <e.Cartoon />
            </button>
            <div>
              <span className="l16-mc-name">{e.text}</span>
              <span className="l16-mc-why">
                {on ? (
                  <>
                    <span className={`verdict ${e.yes ? 'yes' : 'no'}`}>{e.yes ? '✓ Markov chain' : '✗ Not a Markov chain'}:</span> {e.why}
                  </>
                ) : (
                  <span className="mc-ask">Markov chain or not?</span>
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
