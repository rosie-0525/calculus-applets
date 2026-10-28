import { useCallback, useRef } from 'react';
import '../lectures/l16/styles/deck.css';
import BirdIslands, { ISLANDS, idle, startRun, gather, toStart, allOn, allBirds, useBirds } from '../lectures/l16/components/BirdIslands.jsx';
import { M_BIRDS } from '../lectures/l16/components/markov.js';
import { UOverlay } from '../lectures/l16/slides/Slide11PollLimit.jsx';

export const lecture = 16;

/*
 * Independence of the initial distribution: the textbook's migration with u in the corner and each
 * island's share of the 30,000 birds under its number (as on the slide once the birds stop). The
 * years run from 10,000 birds on each island while the applet is on screen; a click on an island,
 * or its button, flies all the birds there and runs the years from there (on the slide, island A,
 * then island C, on key presses, the birds stopped under u). 10,000 on each flies them back.
 */
export default function InitialDistribution() {
  const ref = useRef(null);
  const [st, setSt] = useBirds(ref, () => startRun(idle(M_BIRDS)), false);
  const clicks = useRef(0);
  const onIsland = useCallback(
    (i) => {
      clicks.current += 1;
      setSt((s) => gather(s, allOn(i), allBirds(i), { start: i, run: true, seed: 10 + clicks.current }));
    },
    [setSt],
  );
  return (
    <div className="viz-col" ref={ref}>
      <div className="l16-birds-frame">
        <BirdIslands st={st} onIsland={onIsland} />
        <UOverlay />
      </div>
      <div className="viz-toggle" role="group" aria-label="Where the birds start">
        {ISLANDS.map((I, i) => (
          <button key={I.name} type="button" className="viz-button" aria-pressed={st.start === i} onClick={() => onIsland(i)}>
            All on {I.name}
          </button>
        ))}
        <button type="button" className="viz-button" aria-pressed={st.start === null} onClick={() => setSt((s) => toStart(s, true))}>
          10,000 on each
        </button>
      </div>
    </div>
  );
}
