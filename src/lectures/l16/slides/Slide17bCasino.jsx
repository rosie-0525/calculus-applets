import { useEffect, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { clamp } from '../components/markov.js';

// a fair roulette wheel with only 6 pockets, 1 to 6 clockwise, red and black in turn: 3 red, 3 black
// (the user's request: a fair game, and fewer pockets than a real wheel's 36 or 38, so that it is
// less confusing)
export const POCKETS = ['1', '2', '3', '4', '5', '6'];
export const REDS = [1, 3, 5];
export const colorOf = (s) => (REDS.includes(Number(s)) ? 'red' : 'black');
export const POCKET = { red: '#c62828', black: '#1f2937' };
export const A = 360 / POCKETS.length;
export const GOLD = '#d4a017';

// the wheel (viewBox 400 × 400, centre C): the pockets between R_IN and R_OUT, their numbers at
// R_NUM, in the middle of each (the user's request), the ball's track at R_TRACK and its place in a
// pocket at R_BALL, beyond the number; a spin's length (ms)
export const C = 200;
export const R_IN = 112;
export const R_OUT = 170;
export const R_NUM = (R_IN + R_OUT) / 2;
export const R_TRACK = 182;
export const R_BALL = 163;
export const SPIN = 3600;
// your money in $20 chips: 2 ($40) at the start, and you stop at none or at GOAL ($100)
export const START = 2;
export const GOAL = 5;

/** The point at `deg` degrees clockwise from the top, `rad` from the centre. */
export const at = (deg, rad) => [C + rad * Math.sin((deg * Math.PI) / 180), C - rad * Math.cos((deg * Math.PI) / 180)];
export const pt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;

/** Pocket k's wedge. */
export function wedge(k) {
  const [a0, a1] = [(k - 0.5) * A, (k + 0.5) * A];
  return `M${pt(at(a0, R_OUT))} A${R_OUT},${R_OUT} 0 0 1 ${pt(at(a1, R_OUT))} L${pt(at(a1, R_IN))} A${R_IN},${R_IN} 0 0 0 ${pt(at(a0, R_IN))}Z`;
}

/**
 * The wheel turned by `turn` degrees, with the ball (`ball`: its angle and its distance from the
 * centre) and the pointer at the top, where the ball comes to rest. Plain fills, no gradients: an
 * SVG id would name the copy of the slide on an earlier page in print (README).
 */
export function Wheel({ turn, ball }) {
  return (
    <svg className="l16-cas-wheel" viewBox="0 0 400 400" width={300} height={300} aria-hidden="true">
      <circle cx={C} cy={C} r={198} fill="#5b3416" />
      <circle cx={C} cy={C} r={190} fill="#8a5a2b" />
      <circle cx={C} cy={C} r={R_OUT + 4} fill={GOLD} />
      <g transform={`rotate(${turn.toFixed(2)} ${C} ${C})`}>
        {POCKETS.map((s, k) => (
          <path key={s} d={wedge(k)} fill={POCKET[colorOf(s)]} stroke={GOLD} strokeWidth="1.2" />
        ))}
        {/* each number upright however the wheel is turned, so that the 6 never looks like a 9 */}
        {POCKETS.map((s, k) => {
          const [x, y] = at(k * A, R_NUM);
          return (
            <text key={s} x={x.toFixed(1)} y={y.toFixed(1)} transform={`rotate(${(-turn).toFixed(2)} ${x.toFixed(1)} ${y.toFixed(1)})`} textAnchor="middle" dominantBaseline="central" className="l16-cas-num">
              {s}
            </text>
          );
        })}
        {/* the cone in the middle, darker to the edge, and its gold turret */}
        <circle cx={C} cy={C} r={R_IN} fill="#5b3416" stroke={GOLD} strokeWidth="2" />
        <circle cx={C} cy={C} r={R_IN - 18} fill="#6e4220" />
        <circle cx={C} cy={C} r={R_IN - 40} fill="#82522a" />
        {[0, 90].map((a) => (
          <rect key={a} x={C - 4} y={C - 46} width={8} height={92} rx={4} fill={GOLD} transform={`rotate(${a + 45} ${C} ${C})`} />
        ))}
        <circle cx={C} cy={C} r={16} fill={GOLD} stroke="#a37a12" strokeWidth="2" />
      </g>
      {ball && <circle cx={at(...ball)[0].toFixed(1)} cy={at(...ball)[1].toFixed(1)} r={8} fill="#fff" stroke="#9ca3af" strokeWidth="1.5" />}
      <polygon points={`${C - 10},2 ${C + 10},2 ${C},20`} fill={GOLD} stroke="#a37a12" strokeWidth="1.5" />
    </svg>
  );
}

/** A $20 chip, or the empty place of one. */
export function Chip({ on }) {
  return (
    <svg viewBox="0 0 40 40" width={30} height={30} aria-hidden="true">
      {on ? (
        <g>
          <circle cx={20} cy={20} r={18} fill="#1d4ed8" />
          <circle cx={20} cy={20} r={16} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="5 7.57" />
          <circle cx={20} cy={20} r={10} fill="none" stroke="#fff" strokeWidth="1.5" />
        </g>
      ) : (
        <circle cx={20} cy={20} r={17} fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" />
      )}
    </svg>
  );
}

export const NAMES = { red: 'Red', black: 'Black' };

/**
 * Roulette, for the presenter to play: a click on Spin spins the wheel (at random, about 3.6 s), the
 * ball running the other way and dropping into a pocket at the top; red wins a $20 chip, black loses
 * one; at $100 or $0 the game is over, and the button starts it again. In print mode:
 * the wheel at rest, $40.
 */
export function Roulette() {
  const [chips, setChips] = useState(START);
  const [turn, setTurn] = useState(0);
  const [ball, setBall] = useState(null);
  const [last, setLast] = useState(null);
  const [busy, setBusy] = useState(false);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const over = chips === 0 || chips === GOAL;

  const spin = (e) => {
    e.currentTarget.blur();
    if (busy) return;
    if (over) {
      setChips(START);
      setLast(null);
      setBall(null);
      return;
    }
    const k = Math.floor(Math.random() * POCKETS.length);
    // pocket k to the top: three more turns, then on to −k·A (mod 360)
    const from = turn;
    const to = from + 3 * 360 + ((((-k * A - from) % 360) + 360) % 360);
    setBusy(true);
    setLast(null);
    let t0;
    const step = (now) => {
      t0 ??= now;
      const t = Math.min(1, (now - t0) / SPIN);
      const e = 1 - (1 - t) ** 3;
      setTurn(from + (to - from) * e);
      // the ball runs the other way round its track, then drops into the pocket at the top
      const d = clamp((t - 0.7) / 0.25);
      setBall([-(1 - e) * 4 * 360, R_TRACK + (R_BALL - R_TRACK) * d * d * (3 - 2 * d)]);
      if (t < 1) {
        frame.current = requestAnimationFrame(step);
        return;
      }
      setBusy(false);
      setLast(POCKETS[k]);
      setChips((c) => c + (colorOf(POCKETS[k]) === 'red' ? 1 : -1));
    };
    frame.current = requestAnimationFrame(step);
  };

  const color = last && colorOf(last);
  return (
    <div className="l16-cas-game" data-prevent-swipe>
      <Wheel turn={turn} ball={ball} />
      <p className="l16-cas-said">
        {last ? (
          <>
            <span style={{ color: POCKET[color] }}>
              {NAMES[color]} {last}
            </span>
            : you {color === 'red' ? 'win' : 'lose'} $20
          </>
        ) : busy ? (
          'The ball is rolling…'
        ) : (
          'Place your bet: $20 on red'
        )}
      </p>
      <div className="l16-cas-row">
        <span className="l16-cas-chips" aria-label={`You have $${20 * chips}`}>
          {Array.from({ length: GOAL }, (_, q) => (
            <Chip key={q} on={q < chips} />
          ))}
        </span>
        <span className="l16-cas-money">${20 * chips}</span>
        <button type="button" className="l16-cas-spin" disabled={busy} onClick={spin}>
          {over ? 'Play again' : 'Spin'}
        </button>
      </div>
      {over && <p className={`l16-cas-end ${chips ? 'l16-win' : 'l16-lose'}`}>{chips ? 'You leave with $100!' : 'You are broke.'}</p>}
    </div>
  );
}

/**
 * Gambler's ruin, the story (the user's request: one player against the casino, the usual
 * gambler's ruin, for the students to imagine themselves at the table): you, $40, and roulette, $20
 * on red each spin, until you have $100 or nothing; the wheel beside it, to play. Key press 1: 3
 * of the 6 pockets red, a fair game (the user's request, in place of a real wheel's 9/19; its chance
 * a spin, ½, left out: the user's request); 2: the question.
 */
export default function Slide17bCasino() {
  return (
    <section>
      <h2>A night at the casino</h2>

      <div className="l16-cas">
        <div className="l16-cas-story">
          <p>
            Imagine: you walk into a Las Vegas casino with <strong>$40</strong>, hoping to leave with <strong>$100</strong>.
          </p>
          <ul>
            <li>Each spin of the roulette wheel, you bet $20 on red.</li>
            <li>Red: you win $20. Black: you lose your $20.</li>
            <li>You stop when you have $100 or nothing left.</li>
          </ul>
          <Fragment index={1} as="p" className="l16-cas-odds">
            3 of the 6 pockets are red. A fair game!
          </Fragment>
          <Fragment index={2} as="p" className="question l16-cas-q">
            What is the chance that you leave with $100?
          </Fragment>
        </div>
        <Roulette />
      </div>
    </section>
  );
}
