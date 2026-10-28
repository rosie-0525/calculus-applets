import { useEffect, useRef, useState } from 'react';
import '../lectures/l16/styles/deck.css';
import BirdIslands, { setup, startStep, startRun, toStart, useBirds } from '../lectures/l16/components/BirdIslands.jsx';
import { M_STAY } from '../lectures/l16/components/markov.js';
import { Rules } from '../lectures/l16/slides/Slide01bBirds.jsx';

export const lecture = 16;

// the pause before each island's birds fly, and before the years (ms)
const PAUSE = 700;

/*
 * Where will the birds be in 20 years?, the opener's first migration: three islands, 10,000 birds
 * on each, and no bird ever leaves island C. On the slide the first year is set up one island per
 * key press (its birds fly, their numbers on the lanes), and the next key press runs the years;
 * here the islands go one after the other and then the years run, while the applet is on screen
 * (the birds' clock runs only then), and again on Replay, the birds flying home first.
 */
export default function BirdsStay() {
  const ref = useRef(null);
  const [st, setSt] = useBirds(ref, () => setup(M_STAY, 0), false);
  const [next, setNext] = useState(0); // the island whose birds fly next; 3: the years
  useEffect(() => {
    if (st.phase !== 'hover' || st.run || next > 3) return undefined;
    const timer = setTimeout(() => {
      setSt((s) => (next < 3 ? startStep(s, next) : startRun(s)));
      setNext(next + 1);
    }, PAUSE);
    return () => clearTimeout(timer);
  }, [st.phase, st.run, next, setSt]);
  const replay = () => {
    setSt((s) => toStart(s, false));
    setNext(0);
  };
  return (
    <div className="viz-col" ref={ref}>
      <div className="l16-birds-frame">
        <BirdIslands st={st} />
        <Rules />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  );
}
