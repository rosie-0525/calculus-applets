import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, ease, clamp, rng } from '../components/markov.js';

export const CARDS = 52;
export const DX = 21.5;
export const DW = CARDS * DX + 40;
export const DH = 236;
export const BASE = 92; // the cards' top edge, at rest
export const CARD_H = 92;
export const LIFT = 46;

/**
 * A riffle shuffle (Gilbert–Shannon–Reeds, Bayer and Diaconis's model): cut the deck about in half
 * (each card a coin toss), then drop the cards one at a time from the bottom of the two packets, a
 * packet with chance in proportion to its size.
 */
export function riffle(order, rand) {
  let c = 0;
  for (let i = 0; i < order.length; i += 1) if (rand() < 0.5) c += 1;
  const left = order.slice(0, c);
  const right = order.slice(c);
  const out = [];
  while (left.length || right.length) {
    if (rand() * (left.length + right.length) < left.length) out.push(left.shift());
    else out.push(right.shift());
  }
  return { order: out, cut: c };
}

// the deck after 0, 1, …, 7 shuffles (the same every time), each with its cut
export const rand = rng(2026);
export const ORDERS = [{ order: Array.from({ length: CARDS }, (_, i) => i), cut: 0 }];
for (let k = 1; k <= 7; k += 1) ORDERS.push(riffle(ORDERS[k - 1].order, rand));
export const STOPS = [0, 1, 2, 3, 7]; // the shuffles done after key presses 0-4

/** Each card's place in the deck. */
export const places = (order) => {
  const at = Array(CARDS);
  order.forEach((card, p) => {
    at[card] = p;
  });
  return at;
};

/**
 * The deck, each card coloured by its place in a new deck (a rainbow), from shuffle `k` to shuffle
 * k + 1 at phase t: the two packets part (up, down), interleave, and close.
 */
export function CardDeck({ k, t = 0, count }) {
  const from = places(ORDERS[k].order);
  const to = places(ORDERS[Math.min(7, k + 1)].order);
  const cut = ORDERS[Math.min(7, k + 1)].cut;
  const lift = t <= 0 ? 0 : t < 0.3 ? ease(t / 0.3) : t < 0.75 ? 1 : 1 - ease((t - 0.75) / 0.25);
  const slide = ease(clamp((t - 0.3) / 0.45));
  return (
    <svg className="l16-deck" viewBox={`0 0 ${DW} ${DH}`} width={DW} height={DH} aria-hidden="true">
      {Array.from({ length: CARDS }, (_, card) => {
        const x = 20 + DX * (from[card] + (to[card] - from[card]) * slide);
        const y = BASE + (from[card] < cut ? -LIFT : LIFT) * lift;
        return (
          <rect
            key={card}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            width={DX - 3}
            height={CARD_H}
            rx={4}
            fill={`hsl(${Math.round((300 * card) / (CARDS - 1))} 75% 52%)`}
            stroke="#fff"
            strokeWidth="1.5"
          />
        );
      })}
      <text x={20} y={28} className="l16-deck-count" fill={INK}>
        {count === 0 ? 'a new deck' : `${count} shuffle${count === 1 ? '' : 's'}`}
      </text>
    </svg>
  );
}

// Bayer and Diaconis (1992), Table 1, n = 52: the variation distance after k riffle shuffles,
// k = 1, …, 10 (recomputed exactly from their formula)
export const DIST = [1.0, 1.0, 1.0, 1.0, 0.924, 0.614, 0.334, 0.167, 0.085, 0.043];
export const GW = 560;
export const GH = 300;
export const GL = 60;
export const GB = 54;
export const GT = 30;
export const gx = (k) => GL + ((GW - GL - 10) * (k - 0.5)) / 10;
export const gy = (d) => GH - GB - (GH - GB - GT) * d;

export function Distances() {
  return (
    <svg className="l16-dist" viewBox={`0 0 ${GW} ${GH}`} width={GW} height={GH} aria-hidden="true">
      {[0, 0.5, 1].map((d) => (
        <g key={d}>
          <line x1={GL} x2={GW - 10} y1={gy(d)} y2={gy(d)} stroke="#e5e7eb" />
          <text x={GL - 8} y={gy(d) + 6} textAnchor="end" className="l16-axis">
            {d}
          </text>
        </g>
      ))}
      {DIST.map((d, i) => (
        <g key={i}>
          <rect x={gx(i + 1) - 17} y={gy(d)} width={34} height={gy(0) - gy(d)} fill={i === 6 ? RED : '#9ca3af'} rx={3} />
          <text x={gx(i + 1)} y={gy(0) + 24} textAnchor="middle" className={i === 6 ? 'l16-axis l16-seven' : 'l16-axis'}>
            {i + 1}
          </text>
        </g>
      ))}
      <text x={gx(7)} y={gy(DIST[6]) - 10} textAnchor="middle" className="l16-dist-val" fill={RED}>
        0.33
      </text>
      <text x={(GL + GW) / 2} y={GH - 4} textAnchor="middle" className="l16-axis-name">
        shuffles
      </text>
      <text x={GL - 6} y={16} className="l16-axis-name">
        distance from perfectly mixed
      </text>
    </svg>
  );
}

export const RIFFLE_MS = 1500;
export const FAST_MS = 900;

/**
 * How many times should we shuffle after a card game? (the user's title; first "Seven shuffles"; an application of the
 * theorem, after it): a deck of 52 cards, coloured as a rainbow, riffle-shuffled: key presses 1-3,
 * one shuffle each (the rainbow still shows); 4: four more, seven in all; then, in the user's
 * order: 5, the Markov chain on the left, its 52! states and u; 6, in the blue box under it, how
 * fast do we get close to u?; 7, on the right, Bayer and Diaconis's distance from perfectly mixed
 * after k shuffles, its drop at 7; 8, in the box, the mixing time (7 is the first k with distance
 * < ½, not a best number: with the usual ¼ the mixing time would be 8). In print mode: the stills
 * after 0, 1, 2, 3 and 7 shuffles.
 */
export default function Slide14Shuffles() {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const shown = refs.map(useFragmentShown);
  const target = STOPS[shown.lastIndexOf(true) + 1];
  const [done, setDone] = useState(0); // shuffles shown so far
  const [t, setT] = useState(0); // the phase of the shuffle under way

  useEffect(() => {
    if (PRINT) return undefined;
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

  return (
    <section className="dense">
      <h2>How many times should we shuffle after a card game?</h2>
      {refs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      {PRINT ? (
        <div className="l16-stack">
          <Fragment index={1} effect="fade-out">
            <CardDeck k={0} count={0} />
          </Fragment>
          {STOPS.slice(1).map((n, k) => (
            <Fragment key={n} index={k + 1}>
              {k + 2 < STOPS.length ? (
                <Fragment index={k + 2} effect="fade-out">
                  <CardDeck k={n} count={n} />
                </Fragment>
              ) : (
                <CardDeck k={n} count={n} />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <CardDeck k={done} t={t} count={t > 0.75 ? done + 1 : done} />
      )}

      <div className="l16-shuffle-row">
        <div className="l16-shuffle-text">
          <Fragment index={5}>
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
          </Fragment>
          <Fragment index={6} className="l16-shuffle-more">
            <p>
              How fast do we get close to the stationary distribution{' '}
              <span className="nowrap">
                <Tex tex={r`\mathbf u`} />?
              </span>
            </p>
            <Fragment index={8} as="p">
              That is the chain&rsquo;s <strong>mixing time</strong>, a research area of its own (look up the &ldquo;cutoff
              phenomenon&rdquo;).
            </Fragment>
          </Fragment>
        </div>
        <Fragment index={7} className="l16-shuffle-chart">
          <Distances />
          <p className="l16-credit">Bayer and Diaconis (Stanford), 1992</p>
        </Fragment>
      </div>
    </section>
  );
}
