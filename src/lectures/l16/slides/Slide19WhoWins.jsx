import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, GREEN, matvec } from '../components/markov.js';
import { LOSE } from './Slide18Gambler.jsx';

// the gambler's ruin matrix (your money $0 to $100, in $20 chips: up with chance ½, red, down with
// chance ½, black) and p(n) = Mⁿ p(0), n = 0, …, 30
export const M = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (__, j) => (i === 0 && j === 0) || (i === 5 && j === 5) ? 1 : j >= 1 && j <= 4 ? (i === j - 1 || i === j + 1 ? 1 / 2 : 0) : 0));
export const N_MAX = 30;
export const P = [[0, 0, 1, 0, 0, 0]];
for (let n = 0; n < N_MAX; n += 1) P.push(matvec(M, P[n]));
// the money you start with, and the goals the − and + buttons step through, from $100 down or up:
// you leave with the goal with chance $40/goal (a fair game), else you go broke
export const START = 40;
export const GOALS = [60, 80, 100, 200, 500, 1000, 10000, 1000000];
export const G100 = GOALS.indexOf(100);

export const W = 660;
export const H = 420;
export const L = 30;
export const B = 56;
export const T = 34;
export const bx = (i) => L + 30 + i * 102;
export const by = (p) => H - B - (H - B - T) * p;

/** p(n) as six bars, $0 to $100, the two ends coloured (you're broke, you leave with $100). */
export function Bars({ p }) {
  return (
    <svg className="l16-gr-bars" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <line x1={L} x2={W - 10} y1={by(0)} y2={by(0)} stroke="#9ca3af" strokeWidth="1.6" />
      {p.map((x, i) => {
        const c = i === 0 ? LOSE : i === 5 ? GREEN : INK;
        return (
          <g key={i}>
            <rect x={bx(i)} y={by(x)} width={72} height={by(0) - by(x)} fill={c} opacity={i === 0 || i === 5 ? 0.85 : 0.55} rx={3} />
            <text x={bx(i) + 36} y={by(x) - 8} textAnchor="middle" className="l16-gr-val" fill={c}>
              {x < 0.0005 ? '0' : x.toFixed(3)}
            </text>
            <text x={bx(i) + 36} y={by(0) + 30} textAnchor="middle" className="l16-ladder-money" fill={c}>
              ${20 * i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// p(n)'s entries, to three places; 0 and 1 (to that precision) as 0 and 1
export const fp = (x) => (x < 5e-4 ? '0' : x > 1 - 5e-4 ? '1' : x.toFixed(3));
// a chance in per cent, to as many places as it needs (40%, 0.4%, 99.996%), or to one place when
// it never ends (66.7%)
export const pct = (x) => {
  const v = 100 * x;
  const d = [0, 1, 2, 3, 4].find((k) => Math.abs(v - Number(v.toFixed(k))) < 1e-9) ?? 1;
  return `${Number(v.toFixed(d))}%`;
};

/** Equilibrium's media-player buttons: step forward (disabled at the end) and back to the start. */
export function Buttons({ label, next, atEnd, onNext, onReset }) {
  const press = (f) => (e) => {
    f();
    e.currentTarget.blur();
  };
  return (
    <>
      <button type="button" className="l16-step" aria-label={next} disabled={atEnd} onClick={press(onNext)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4l10 8-10 8z" />
          <rect x="16" y="4" width="3" height="16" />
        </svg>
      </button>
      <button type="button" className="l16-cal-reset" aria-label={label} onClick={press(onReset)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
          <path d="M5 3.5v4.6h4.6" />
        </svg>
      </button>
    </>
  );
}

/**
 * Do you leave with $100? (gambler's ruin, continued; first "Who wins?", Alice against Bob): p(n) as
 * bars, your chances flowing to $0 and $100, and as a vector under them; n from 0 to 30, a click on
 * the step-forward button going to the next n and the round button beside it back to 0 (the user's
 * request, in place of n running by itself; Equilibrium's buttons); from the start, the conclusion,
 * you leave with $100 with chance 40%, you go broke with chance 60% (the limit of Mⁿ, and the game
 * over before spin 10, removed: the user's request); key press 1: $100 highlighted, the same
 * statement for another goal, from $60 to $1,000,000, a − and a + button stepping it down or up (the
 * user's request: a style of their own, no reset); 2, under them: the greedier you are, the likelier
 * you go broke first; 3, in a box, what gambler's ruin means, in the user's words (no "Takeaway:";
 * the history removed: the user's request). In print mode: n = 30, the goal $100.
 */
export default function Slide19WhoWins() {
  const m2 = useRef(null);
  const vary = useFragmentShown(m2);
  const [n, setN] = useState(PRINT ? N_MAX : 0);
  const [g, setG] = useState(G100);
  // back before key press 2: the goal $100 again
  useEffect(() => {
    if (!vary) setG(G100);
  }, [vary]);
  const step = (d) => (e) => {
    setG((v) => Math.max(0, Math.min(GOALS.length - 1, v + d)));
    e.currentTarget.blur();
  };
  const goal = GOALS[g];
  const win = START / goal;
  return (
    <section className="dense">
      <h2>Do you leave with $100?</h2>

      <div className="l16-gr-wins">
        <div className="l16-gr-left">
          <Bars p={P[n]} />
          <div className="l16-eq-k l16-gr-k" data-prevent-swipe>
            <span className="l16-eq-kval">
              <Tex tex={`n=${n}`} />
            </span>
            <Buttons next="Next n" label="Start again" atEnd={n >= N_MAX} onNext={() => setN((v) => Math.min(N_MAX, v + 1))} onReset={() => setN(0)} />
          </div>
          <p className="l16-gr-pn">
            <Tex tex={r`\mathbf p(${n})=(${P[n].map(fp).join(', ')})`} />
          </p>
        </div>
        {/* the conclusion; from key press 1, the goal (highlighted) changes with the buttons under it;
            2 and 3, what gambler's ruin means, under them (the user's request) */}
        <div className="l16-gr-odds">
          <span ref={m2} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
          <p>
            You leave with <span className={vary ? 'l16-gr-goal l16-gr-goal-on' : 'l16-gr-goal'}>${goal.toLocaleString('en-US')}</span>:{' '}
            <strong className="l16-win">{pct(win)}</strong>
          </p>
          <p>
            You go broke: <strong className="l16-lose">{pct(1 - win)}</strong>
          </p>
          <Fragment index={1}>
            <div className="l16-gr-goalrow" data-prevent-swipe>
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
          </Fragment>
          <Fragment index={2} as="p" className="l16-gr-greedy">
            The more greedy you are, the more likely you are to go broke before reaching your goal!
          </Fragment>
          <Fragment index={3} className="l16-gr-end">
            <p>
              Even with fair games, play on and on against a casino that never runs out of money, and you are sure to lose everything: this is{' '}
              <strong>gambler&rsquo;s ruin</strong>.
            </p>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
