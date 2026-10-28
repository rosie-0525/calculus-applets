import { useEffect, useState } from 'react';
import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import { CardDeck, Distances, RIFFLE_MS, FAST_MS } from '../lectures/l16/slides/Slide14Shuffles.jsx';

export const lecture = 16;

// the shuffles the deck goes up to (the slide's: 1, 2, 3, then 7)
const MOST = 7;

/*
 * How many times should we shuffle after a card game?: a deck of 52 cards, coloured as a rainbow
 * by their places in a new deck, riffle-shuffled; under it, the Markov chain (52! states, u) and
 * Bayer and Diaconis's distance from perfectly mixed after k shuffles. On the slide the deck is
 * shuffled 1, 2, 3 and then 7 times on key presses; here Shuffle shuffles it once more, Shuffle
 * to 7 up to seven times (the shuffles after the first three faster), and New deck starts again.
 * The shuffles are the slide's, the same every time.
 */
export default function Shuffles() {
  const [target, setTarget] = useState(0); // the shuffles asked for
  const [done, setDone] = useState(0); // the shuffles shown so far
  const [t, setT] = useState(0); // the phase of the shuffle under way

  useEffect(() => {
    if (target < done) {
      setDone(target);
      setT(0);
      return undefined;
    }
    if (target === done) return undefined;
    // one more shuffle, then (through `done`) the next
    const ms = target - done > 1 || done >= 3 ? FAST_MS : RIFFLE_MS;
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      setT(k);
      if (k < 1) frame = requestAnimationFrame(step);
      else {
        setT(0);
        setDone((d) => d + 1);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, done]);

  const busy = target !== done;
  return (
    <div className="viz-col">
      <CardDeck k={done} t={t} count={t > 0.75 ? done + 1 : done} />
      <div className="viz-toggle">
        <button type="button" className="viz-button" disabled={busy || done >= MOST} onClick={() => setTarget(done + 1)}>
          Shuffle
        </button>
        <button type="button" className="viz-button" disabled={busy || done >= MOST} onClick={() => setTarget(MOST)}>
          Shuffle to {MOST}
        </button>
        <button type="button" className="viz-button" disabled={done === 0 && !busy} onClick={() => setTarget(0)}>
          New deck
        </button>
      </div>

      <div className="l16-shuffle-row">
        <div className="l16-shuffle-text">
          <p>Markov chain:</p>
          <ul className="bullets">
            <li>
              states: the <Tex tex={r`52!\approx8\times10^{67}`} /> orders of the deck
            </li>
            <li>
              Markov matrix: <Tex tex={r`52!\times52!`} />
            </li>
            <li>
              stationary vector <Tex tex={r`\mathbf u=\left(\tfrac1{52!},\ldots,\tfrac1{52!}\right)`} />: every order equally likely
            </li>
          </ul>
          <div className="l16-shuffle-more">
            <p>
              How fast do we get close to the stationary distribution{' '}
              <span className="nowrap">
                <Tex tex={r`\mathbf u`} />?
              </span>
            </p>
            <p>
              That is the chain&rsquo;s <strong>mixing time</strong>, a research area of its own (look up the &ldquo;cutoff phenomenon&rdquo;).
            </p>
          </div>
        </div>
        <div className="l16-shuffle-chart">
          <Distances />
          <p className="l16-credit">Bayer and Diaconis (Stanford), 1992</p>
        </div>
      </div>
    </div>
  );
}
