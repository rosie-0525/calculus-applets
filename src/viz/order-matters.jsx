import { useEffect, useRef, useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Fragment from '../lectures/l14/components/Fragment.jsx';
import { R1, R2, W, H, O, GAP, Turning, Step } from '../lectures/l14/slides/Slide18Order.jsx';

export const lecture = 14;

/** True from the first time the applet is on screen (its section `present`, see Applet.jsx). */
function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section || seen) return undefined;
    const check = () => section.classList.contains('present') && setSeen(true);
    check();
    const mo = new MutationObserver(check);
    mo.observe(section, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [ref, seen]);
  return seen;
}

// when the arrow and the second ball of each row come, after the first ball has turned (from 0.5 s
// to 2.1 s, Turning's tween)
const NEXT = 2300;

/**
 * A row of Order matters: the ball turned by `first`; from `stage` 1, an arrow and a copy of the
 * ball, `arriving` (hidden, the copy over the first ball: site.css) until stage 2, when they fade in,
 * the copy glides to the right of the arrow and turns by `second` (as on the slide's next key press).
 */
function Row({ first, second, stage }) {
  const arriving = stage < 2 ? ' arriving' : '';
  return (
    <div className="l14-order-row">
      <figure>
        <Turning index={1} s={first} />
        <Step s={first} m={0} index={1} />
      </figure>
      {stage > 0 && (
        <>
          <Fragment index={2} className={`l14-order-arrow${arriving}`}>
            <svg viewBox={`0 0 ${GAP} ${H}`} width={GAP} height={H} aria-hidden="true">
              <line x1={14} y1={O[1]} x2={GAP - 20} y2={O[1]} stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points={`${GAP - 12},${O[1]} ${GAP - 24},${O[1] - 7} ${GAP - 24},${O[1] + 7}`} fill="#6b7280" />
            </svg>
          </Fragment>
          <Fragment index={2} as="figure" className={arriving}>
            <Turning index={2} s={second} M0={first.turn(1)} glide={W + GAP} />
            <Step s={second} m={1} index={2} />
          </Fragment>
        </>
      )}
    </div>
  );
}

/*
 * Order matters: four pumpkin balls in two rows, R₁ (90° around the z-axis) then R₂ (90° around the
 * y-axis), and R₂ then R₁. On the slide each turn is a key press, one row after the other; here both
 * rows run the first time the applet is on screen (a ball mounted before then has turned unseen, so
 * it starts afresh), and again on Replay: the first balls turn, then the copies glide in and turn.
 */
export default function OrderMatters() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    let frame;
    const timer = setTimeout(() => {
      setStage(1);
      // a frame drawn with the copies `arriving`, so that they glide from there
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setStage(2));
      });
    }, NEXT);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [seen, run]);
  const replay = () => {
    setStage(0);
    setRun((n) => n + 1);
  };
  return (
    <div className="viz-col" ref={ref}>
      <div className="l14-order-rows">
        {[
          [R1, R2],
          [R2, R1],
        ].map(([a, b]) => (
          <Row key={`${a.name}-${seen}-${run}`} first={a} second={b} stage={stage} />
        ))}
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  );
}
