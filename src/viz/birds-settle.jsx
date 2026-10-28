import { useRef } from 'react';
import '../lectures/l16/styles/deck.css';
import BirdIslands, { idle, startRun, toStart, useBirds } from '../lectures/l16/components/BirdIslands.jsx';
import { M_BIRDS } from '../lectures/l16/components/markov.js';
import { Rules } from '../lectures/l16/slides/Slide01cBirdsSettle.jsx';

export const lecture = 16;

/*
 * Where will the birds be in 20 years?, the textbook's migration (a third of C's birds stay, a
 * third fly to A, a third to B): the years run from 10,000 birds on each island while the applet is
 * on screen, the numbers settling at 8,571, 8,571, 12,857 while the birds keep flying. Start again
 * flies them home and runs the years again. On the slide a key press, or a click on an island,
 * starts all the birds on one island: that is initial-distribution.jsx's, with u.
 */
export default function BirdsSettle() {
  const ref = useRef(null);
  const [st, setSt] = useBirds(ref, () => startRun(idle(M_BIRDS)), false);
  return (
    <div className="viz-col" ref={ref}>
      <div className="l16-birds-frame">
        <BirdIslands st={st} />
        <Rules />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setSt((s) => toStart(s, true))}>
          Start again
        </button>
      </div>
    </div>
  );
}
