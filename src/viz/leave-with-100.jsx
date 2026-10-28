import { useState } from 'react';
import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import { P, N_MAX, START, GOALS, G100, Bars, Buttons, fp, pct } from '../lectures/l16/slides/Slide19WhoWins.jsx';

export const lecture = 16;

/*
 * Do you leave with $100?: p(n) as bars, $0 to $100, and as a vector under them, n from 0 to 30
 * by the step-forward button (the round one back to 0); beside them, your chances, $40 ÷ goal to
 * leave with the goal and the rest to go broke, the goal stepped from $60 to $1,000,000 by − and +.
 * On the slide the goal's buttons, the greedier-you-are line and the box on gambler's ruin come
 * one per key press; here the buttons are there at once, and the two conclusions are left for
 * the reader.
 */
export default function LeaveWith100() {
  const [n, setN] = useState(0);
  const [g, setG] = useState(G100);
  const step = (d) => (e) => {
    setG((v) => Math.max(0, Math.min(GOALS.length - 1, v + d)));
    e.currentTarget.blur();
  };
  const goal = GOALS[g];
  const win = START / goal;
  return (
    <div className="l16-gr-wins">
      <div className="l16-gr-left">
        <Bars p={P[n]} />
        <div className="l16-eq-k l16-gr-k">
          <span className="l16-eq-kval">
            <Tex tex={`n=${n}`} />
          </span>
          <Buttons next="Next n" label="Start again" atEnd={n >= N_MAX} onNext={() => setN((v) => Math.min(N_MAX, v + 1))} onReset={() => setN(0)} />
        </div>
        <p className="l16-gr-pn">
          <Tex tex={r`\mathbf p(${n})=(${P[n].map(fp).join(', ')})`} />
        </p>
      </div>
      <div className="l16-gr-odds">
        <p>
          You leave with <span className="l16-gr-goal l16-gr-goal-on">${goal.toLocaleString('en-US')}</span>: <strong className="l16-win">{pct(win)}</strong>
        </p>
        <p>
          You go broke: <strong className="l16-lose">{pct(1 - win)}</strong>
        </p>
        <div className="l16-gr-goalrow">
          <span className="l16-gr-goal-label">Goal</span>
          <span className="l16-gr-stepper">
            <button type="button" aria-label="Lower goal" disabled={g <= 0} onClick={step(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button type="button" aria-label="Higher goal" disabled={g >= GOALS.length - 1} onClick={step(1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
