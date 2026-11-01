import { useEffect, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { RED, AMBER } from '../components/inv.js';
import { CW, CH, seg, Egg, Umbrella, Zipper } from '../components/LifeCartoons.jsx';

// (stirring milk into coffee, encrypting a message and popping a balloon, Coffee, Message and
// Balloon in LifeCartoons.jsx, removed by the user)
export const CARDS = [
  { name: 'Opening an umbrella', Pic: Umbrella, ok: true },
  { name: 'Zipping a jacket', Pic: Zipper, ok: true },
  { name: 'Breaking an egg', Pic: Egg, ok: false },
];

/** Seconds the slide has been on screen (paused while it is not); 0 in print. */
export function usePresentClock(ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (PRINT) return undefined;
    let frame;
    let last;
    let acc = 0;
    const step = (now) => {
      if (last !== undefined && ref.current?.classList.contains('present')) {
        acc += (now - last) / 1000;
        setT(acc);
      }
      last = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ref]);
  return t;
}

// a card's loop (s): the process 0.4–2.6; then the undo icon; if it can be undone, the process runs
// backward 3.4–5.4; if not, it stays done and fades out at the end, to start again
export const LOOP = 6.6;

/** The undo arrow, amber; crossed out in red when the process can't be undone. */
export function UndoIcon({ ok, opacity }) {
  const color = ok ? AMBER : RED;
  return (
    <g opacity={opacity} transform="translate(270 28)">
      <path d="M -9 -7 A 11 11 0 1 1 -11 3" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <polygon points="-15,-12 -3,-11 -10,-1" fill={color} />
      {!ok && <path d="M -15 -15 L 15 15 M 15 -15 L -15 15" stroke={RED} strokeWidth="3.4" strokeLinecap="round" />}
    </g>
  );
}

/** One process on its loop, `t` s since its card came up; in print, done. */
export function LifeCard({ card, t }) {
  const k = t % LOOP;
  const fwd = seg(k, 0.4, 2.6);
  const p = PRINT ? 1 : fwd - (card.ok ? seg(k, 3.4, 5.4) : 0);
  const icon = PRINT ? 0 : seg(k, 3.0, 3.3) * (1 - seg(k, 5.6, 5.9));
  const fade = PRINT || card.ok ? 1 : k < 0.3 ? seg(k, 0, 0.3) : 1 - seg(k, 6.1, LOOP);
  const { Pic } = card;
  return (
    <svg className="l18-life-pic" viewBox={`0 0 ${CW} ${CH}`} width={CW} height={CH} role="img" aria-label={card.name}>
      <rect x={1} y={1} width={CW - 2} height={CH - 2} rx={12} fill="#f6f7f9" stroke="#e5e7eb" strokeWidth="1.5" />
      <g opacity={fade}>
        <Pic p={p} time={PRINT ? 0.6 : t} />
      </g>
      <UndoIcon ok={card.ok} opacity={icon} />
    </svg>
  );
}

/**
 * Which can be undone? (the user's request, before Linear transformation: Invertible or not?,
 * first also titled Which can be undone?): "A transformation is invertible if it can be undone" (the user's sentence,
 * rephrased), then three processes from real life as animated cartoons, in a row, one per key
 * press, in the user's order: opening an umbrella (in the rain) and zipping a jacket, which can be
 * undone, and breaking an egg, which can't (of six; the user kept these three). Each card plays its process on a loop
 * from the moment it comes up; then an undo arrow, amber, and the process runs backward, or crossed
 * out in red, and the process stays done. Under each, "invertible" or "not invertible" (first "can
 * be undone" or "can't be undone"; the user's request). Print: each process done.
 */
export default function Slide02aLife() {
  const ref = useRef(null);
  const refs = CARDS.map(() => useRef(null));
  const on = refs.map(useFragmentShown);
  const clock = usePresentClock(ref);
  const clockRef = useRef(0);
  clockRef.current = clock;
  // when each card came up (on the clock), null while it is hidden
  const [starts, setStarts] = useState(() => CARDS.map(() => null));
  const key = on.map(Number).join('');
  useEffect(() => {
    setStarts((prev) => prev.map((s, k) => (on[k] ? (s ?? clockRef.current) : null)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <section ref={ref}>
      <h2>Which can be undone?</h2>
      {refs.map((r, k) => (
        <span key={k} ref={r} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      <p className="l18-life-lead">
        A transformation is <strong>invertible</strong> if it can be undone.
      </p>

      <div className="l18-undo l18-life">
        {CARDS.map((card, k) => (
          <Fragment key={card.name} index={k + 1} as="figure" className="l18-undo-card">
            <LifeCard card={card} t={starts[k] == null ? 0 : clock - starts[k]} />
            <figcaption>
              {card.name}
              <br />
              {card.ok ? <span className="l18-undo-by">invertible</span> : <span className="l18-not">not invertible</span>}
            </figcaption>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
