import { useEffect, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { Dot } from '../components/Plane.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { FImage, GridImage } from '../components/FShape.jsx';
import { EXAMPLES, along, UndoPlane } from '../components/UndoExamples.jsx';
import { PRINT } from '../components/print.js';
import { INK, BLUE, AMBER } from '../components/inv.js';

/** Seconds the slide has been on screen (paused while it is not); 0 in print (as on Slide02aLife). */
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

/** When each of the fragments `on` came up, on the clock `clockRef`; null while it is hidden. */
export function useStarts(on, clockRef) {
  const [starts, setStarts] = useState(() => on.map(() => null));
  const key = on.map(Number).join('');
  useEffect(() => {
    setStarts((prev) => prev.map((s, k) => (on[k] ? (s ?? clockRef.current) : null)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return starts;
}

export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
export const clamp = (k) => Math.min(1, Math.max(0, k));

// each card's loop: at home 0.7 s, gliding to the image 1.3 s, there 2 s, fading out 0.5 s; once
// it is known to be invertible, after 0.7 s at the image the inverse brings it back in 1.3 s
export const LOOP = 4.5;
export const LOOP_BACK = 6.2;

/**
 * The card on its plane `p`: the grid and axes, F's home in gray, F taken `s` of the way to its
 * image (blue) and, as `b` goes from 0 to 1, brought back by the inverse (amber; the blue F left
 * faint, the grid going back too); `fade` for the end of a loop.
 */
export function layers(p, ex, s, b, fade) {
  const M = b > 0 ? along(ex, 1 - b) : along(ex, s);
  return (
    <g>
      <g opacity={fade}>
        <GridImage p={p} M={M} />
      </g>
      <FImage p={p} home />
      <FImage p={p} M={along(ex, s)} color={BLUE} opacity={(b > 0 ? 0.35 : 0.9) * fade} />
      {b > 0 && <FImage p={p} M={M} color={AMBER} opacity={0.9 * fade} />}
      <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
    </g>
  );
}

/**
 * One example on a loop, `t` s since it came up or since its verdict did: the plane and F glide to
 * their images, stay, and fade out, to start again from home (no glide back, which would look like
 * an undo); once `undo` (its verdict is up, key press `verdict`) and the example is invertible, the
 * inverse brings them back before the fade. Print: the image, then, if invertible, the image and F
 * back home on the verdict's key press.
 */
export function LoopCard({ ex, t, undo, verdict }) {
  const back = undo && !!ex.undo;
  const L = back ? LOOP_BACK : LOOP;
  const k = ((t % L) + L) % L;
  const s = ease(clamp((k - 0.7) / 1.3));
  const b = back ? ease(clamp((k - 2.7) / 1.3)) : 0;
  const fade = k < 0.3 ? k / 0.3 : k > L - 0.5 ? (L - k) / 0.5 : 1;
  return (
    <UndoPlane unit={88} title={ex.name}>
      {(p) =>
        !PRINT ? (
          layers(p, ex, s, b, fade)
        ) : ex.undo ? (
          <g>
            <Fragment as="g" index={verdict} effect="fade-out">
              {layers(p, ex, 1, 0, 1)}
            </Fragment>
            <Fragment as="g" index={verdict}>
              {layers(p, ex, 1, 1, 1)}
            </Fragment>
          </g>
        ) : (
          layers(p, ex, 1, 0, 1)
        )
      }
    </UndoPlane>
  );
}

/**
 * Linear transformation: Invertible or not? (first Which can be undone?; the user's request: a page
 * of examples, invertible and not, to build intuition before Invertible linear transformations):
 * six linear transformations of ℝ², two rows of three cards, two key presses each (the user's
 * request), before the next card: on key press 2k + 1, card k comes up, on its loop from that
 * moment; on 2k + 2, its verdict, "invertible" (amber), and its loop starts again with the inverse
 * bringing the plane and F back, or "not invertible" (red). Invertible linear transformations, next,
 * gives the definition and names the inverses.
 */
export default function Slide02bUndo() {
  const ref = useRef(null);
  const refs = EXAMPLES.map(() => useRef(null));
  const verdictRefs = EXAMPLES.map(() => useRef(null));
  const on = refs.map(useFragmentShown);
  const told = verdictRefs.map(useFragmentShown);
  const clock = usePresentClock(ref);
  const clockRef = useRef(0);
  clockRef.current = clock;
  const starts = useStarts(on, clockRef);
  const verdictStarts = useStarts(told, clockRef);
  return (
    <section ref={ref}>
      <h2>Linear transformation: Invertible or not?</h2>
      {refs.map((r, k) => (
        <span key={k} ref={r} className="fragment fx-marker" data-fragment-index={2 * k + 1} aria-hidden="true" />
      ))}
      {verdictRefs.map((r, k) => (
        <span key={k} ref={r} className="fragment fx-marker" data-fragment-index={2 * k + 2} aria-hidden="true" />
      ))}
      <div className="l18-undo">
        {EXAMPLES.map((ex, k) => {
          const since = verdictStarts[k] ?? starts[k];
          return (
            <Fragment key={ex.name} index={2 * k + 1} as="figure" className="l18-undo-card">
              <LoopCard ex={ex} t={since == null ? 0 : clock - since} undo={told[k]} verdict={2 * k + 2} />
              <figcaption>
                {ex.name}
                <br />
                <Fragment as="span" index={2 * k + 2} className={ex.undo ? 'l18-undo-by' : 'l18-not'}>
                  {ex.undo ? 'invertible' : 'not invertible'}
                </Fragment>
              </figcaption>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
