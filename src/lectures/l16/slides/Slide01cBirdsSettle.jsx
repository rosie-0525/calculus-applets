import { useCallback, useEffect, useRef } from 'react';
import Fragment from '../components/Fragment.jsx';
import BirdIslands, { ISLANDS, Stills, idle, skipTo, fromAll, gather, toStart, allOn, allBirds, useBirds } from '../components/BirdIslands.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { M_BIRDS } from '../components/markov.js';
import { Isle } from './Slide01bBirds.jsx';

/** The rules in words: A's and B's as before, C's new (in violet), each on one line. */
export function Rules() {
  return (
    <div className="l16-birds-rules l16-birds-rules-wide">
      <p>Every year:</p>
      <ul>
        <li>
          <Isle i={0} />: half fly to B, half to C.
        </li>
        <li>
          <Isle i={1} />: half fly to A, half to C.
        </li>
        <li>
          <Isle i={2} />: <span className="l16-birds-new">a third stay, a third fly to A, a third to B.</span>
        </li>
      </ul>
    </div>
  );
}

/** Key press 2: all the birds on one island; 3: what the students have seen. */
export function Caption({ start }) {
  return (
    <div className="l16-stack l16-birds-caption">
      <Fragment index={2}>
        <Fragment index={3} effect="fade-out">
          Start again, with all 30,000 birds on island {ISLANDS[start ?? 0].name}.
        </Fragment>
      </Fragment>
      <Fragment index={3}>The birds never stop flying, but the numbers stop changing.</Fragment>
    </div>
  );
}

/**
 * The opener, its second migration, the textbook's (Section 16.1): the same, but a third of C's
 * birds stay, a third fly to A, a third to B. Key press 1: the years go by, the numbers settling at
 * 8,571, 8,571, 12,857 by about year 6 (the years then run on, the numbers fixed); 2: all 30,000
 * birds fly to island A and start again from there, to the same numbers; 3: the punch line. A click
 * on an island starts all the birds there. In print mode: year 0, then year 20 of each run.
 */
export default function Slide01cBirdsSettle() {
  const m1 = useRef(null);
  const m2 = useRef(null);
  const s1 = useFragmentShown(m1);
  const s2 = useFragmentShown(m2);
  const [st, setSt] = useBirds(m1, () => idle(M_BIRDS), PRINT);
  const clicks = useRef(0);

  // key press 2: all the birds to island A, then the years; else from 10,000 on each (the years
  // running from key press 1)
  useEffect(() => {
    if (PRINT) return;
    if (s2) setSt((s) => gather(s, allOn(0), allBirds(0), { start: 0, run: true, seed: 2 }));
    else setSt((s) => toStart(s, s1));
  }, [s1, s2, setSt]);

  const onIsland = useCallback(
    (i) => {
      clicks.current += 1;
      setSt((s) => gather(s, allOn(i), allBirds(i), { start: i, run: true, seed: 10 + clicks.current }));
    },
    [setSt],
  );

  return (
    <section>
      <h2>Where will the birds be in 20 years?</h2>
      <span ref={m1} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <span ref={m2} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />
      <div className="l16-birds-frame">
        {PRINT ? <Stills stills={[idle(M_BIRDS), skipTo(idle(M_BIRDS), 20), skipTo(fromAll(M_BIRDS, 0, 2), 20)]} /> : <BirdIslands st={st} onIsland={onIsland} />}
        <Rules />
      </div>
      <Caption start={PRINT ? 0 : st.start} />
    </section>
  );
}
