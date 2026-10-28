import { useEffect, useRef } from 'react';
import Fragment from '../components/Fragment.jsx';
import BirdIslands, { Stills, setup, startStep, startRun, skipTo, useBirds } from '../components/BirdIslands.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { ISLES, M_STAY } from '../components/markov.js';

/** "Island A", in its colour. */
export function Isle({ i }) {
  return <b style={{ color: ISLES[i].color }}>Island {ISLES[i].name}</b>;
}

/** The rules in words, one per key press, each with its island's birds flying. */
export function Rules() {
  return (
    <div className="l16-birds-rules">
      <p>Every year:</p>
      <ul>
        <Fragment as="li" index={1}>
          <Isle i={0} />: half fly to B, half to C.
        </Fragment>
        <Fragment as="li" index={2}>
          <Isle i={1} />: half fly to A, half to C.
        </Fragment>
        <Fragment as="li" index={3}>
          <Isle i={2} />: all stay.
        </Fragment>
      </ul>
    </div>
  );
}

/**
 * The opener, its first migration, the obvious one: three islands, 10,000 birds circling over
 * each (each bird drawn stands for 100, in its island's colour), and no bird ever leaves island C.
 * The setup, one island per key press: 1, A's birds fly, half to B, half to C (the numbers on
 * their lanes); 2, B's birds; 3, C's birds stay (a hop), year 1 done; 4: the years go by, and all
 * the birds end up on C. In print mode: a still per key press (year 20 for the last).
 */
export default function Slide01bBirds() {
  const m1 = useRef(null);
  const m2 = useRef(null);
  const m3 = useRef(null);
  const m4 = useRef(null);
  const s1 = useFragmentShown(m1);
  const s2 = useFragmentShown(m2);
  const s3 = useFragmentShown(m3);
  const s4 = useFragmentShown(m4);
  const stage = s4 ? 4 : s3 ? 3 : s2 ? 2 : s1 ? 1 : 0;
  const [st, setSt] = useBirds(m1, () => setup(M_STAY, 0), PRINT);

  // key presses 1 to 3: the islands' birds after the earlier steps, then this island's flying; 4:
  // the years run from year 1
  useEffect(() => {
    if (PRINT) return;
    setSt((s) => {
      if (stage === 0) return { ...setup(M_STAY, 0), clock: s.clock };
      if (stage <= 3) return startStep({ ...setup(M_STAY, stage - 1), clock: s.clock }, stage - 1);
      return startRun({ ...setup(M_STAY, 3), clock: s.clock });
    });
  }, [stage, setSt]);

  return (
    <section>
      <h2>Where will the birds be in 20 years?</h2>
      {[m1, m2, m3, m4].map((m, i) => (
        <span key={i} ref={m} className="fragment fx-marker" data-fragment-index={i + 1} aria-hidden="true" />
      ))}
      <div className="l16-birds-frame">
        {PRINT ? <Stills stills={[0, 1, 2, 3].map((n) => setup(M_STAY, n)).concat([skipTo(setup(M_STAY, 3), 20)])} /> : <BirdIslands st={st} />}
        <Rules />
      </div>
      {/* an empty line where the next slide has its caption: the same height, so that reveal centres
          both slides alike and the picture stays put between them */}
      <div className="l16-birds-caption" aria-hidden="true">
        &nbsp;
      </div>
    </section>
  );
}
