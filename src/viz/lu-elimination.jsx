import { useRef, useState } from 'react';
import '../lectures/l23/styles/deck.css';
import Tex, { r } from '../lectures/l23/components/Tex.jsx';
import Fragment from '../lectures/l23/components/Fragment.jsx';
import { ElimMatrix, OpArrow, MultiplierFlight } from '../lectures/l23/components/Elim.jsx';
import { AMBER, L, U, col } from '../lectures/l23/components/lu.js';
import { A, UU, LL, named, NA, NA1, NU, SLOTS } from '../lectures/l23/slides/Slide08cElimLU.jsx';
import { useKeyPresses } from './back-substitution.jsx';

export const lecture = 23;

// the slide's key presses 1–3, each a button
const STAGES = [r`R_2-2R_1,\ R_3-4R_1`, r`R_3-3R_2`, r`A=LU`];

/*
 * LU decomposition by elimination, without its title and its sentence (the caption has it): A =
 * [2 1 1; 4 3 3; 8 7 9]; R₂ − 2R₁ and R₃ − 4R₁ clear its first column, then R₃ − 3R₂ the second,
 * giving U = [2 1 1; 0 1 1; 0 0 2]; then A = LU, L = [1 0 0; 2 1 0; 4 3 1] holding the multipliers
 * (blue). The row operations are animated (Elim.jsx): each step's arrow draws itself; for each
 * operation its label lights up, the pivot row blue and the row it changes amber, ×(−2) beside the
 * pivot row, the row's entries turn into the sums (4−4) and then the new entries, each new zero
 * bursting into confetti; after the second step U's upper triangle shimmers and "= U" pops in; at
 * A = LU the multipliers fly from the arrows' labels into their places in L. On the slide each step
 * is a key press; here a button picks the step (the steps before it showing their ends, its own
 * played; picked again, it plays again).
 */
export default function LUElimination() {
  const ref = useRef(null);
  const trigger = useRef(null);
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);
  useKeyPresses(ref, n, run);
  const pick = (k) => {
    if (k === n) setRun((m) => m + 1);
    setN(k);
  };
  return (
    <div className="viz-col elim-lu" ref={ref}>
      <div className="viz-toggle elim-lu-pick" role="group" aria-label="How far the elimination goes">
        {STAGES.map((tex, k) => (
          <button key={tex} type="button" className="viz-button" aria-pressed={n === k + 1} onClick={() => pick(k + 1)}>
            <Tex tex={tex} />
          </button>
        ))}
        <button type="button" className="viz-button" disabled={n === 0} onClick={() => setN(0)}>
          Start again
        </button>
      </div>
      <div key={run} className="elim-lu-body">
        <div className="l23-elim-steps">
          <Tex tex="A=" />
          <ElimMatrix before={NA} />
          <Fragment index={1} className="l23-elim-step">
            <OpArrow
              labels={[
                { pre: 'R_2', mult: '2', post: 'R_1', slot: '21' },
                { pre: 'R_3', mult: '4', post: 'R_1', slot: '31' },
              ]}
            />
            <ElimMatrix
              before={NA}
              after={NA1}
              ops={[
                { from: 0, to: 1, c: -2 },
                { from: 0, to: 2, c: -4 },
              ]}
            />
          </Fragment>
          <Fragment index={2} className="l23-elim-step">
            <OpArrow labels={[{ pre: 'R_3', mult: '3', post: 'R_2', slot: '32' }]} />
            <ElimMatrix before={NA1} after={NU} ops={[{ from: 1, to: 2, c: -3 }]} upper />
            <span className="l23-elim-isU">
              <Tex tex={`=${U}`} />
            </span>
          </Fragment>
        </div>
        <span ref={trigger} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
        <Fragment index={3} className="l23-elim-lu">
          <Tex tex={`${A}=${named(LL, L)}${named(UU, col(AMBER, 'U'))}`} />
        </Fragment>
        <MultiplierFlight trigger={trigger} slots={SLOTS} />
      </div>
    </div>
  );
}
