import { useEffect, useRef, useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import Fragment, { FxMarker } from '../lectures/l14/components/Fragment.jsx';
import { R90, R45, W, H, GAP, GREEN, Panel, Step } from '../lectures/l14/slides/Slide18cCommute.jsx';

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

// when the arrow and the second panel of each row come, after the first one has turned (from 0.4 s
// to 1.9 s, Panel's tween), and when the two panels the rows end in are outlined, after the second
// ones have glided in and turned (1.4 s to 2.9 s after they come)
const NEXT = 2100;
const SAME = NEXT + 3100;

/**
 * A row: S and F turned by `first`; from `stage` 1, an arrow and a copy, `arriving` (hidden, the copy
 * over the first panel: site.css) until stage 2, when they fade in, the copy glides to the right of
 * the arrow and turns by `second` (as on the slide's next key press).
 */
function Row({ first, second, stage }) {
  const arriving = stage < 2 ? ' arriving' : '';
  return (
    <div className="l14-spin-row">
      <figure>
        <Panel index={1} s={first} />
        <Step s={first} m={0} index={1} />
      </figure>
      {stage > 0 && (
        <>
          <Fragment index={2} className={arriving}>
            <svg viewBox={`0 0 ${GAP} ${H}`} width={GAP} height={H} aria-hidden="true">
              <line x1={12} y1={H / 2} x2={GAP - 18} y2={H / 2} stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points={`${GAP - 10},${H / 2} ${GAP - 22},${H / 2 - 7} ${GAP - 22},${H / 2 + 7}`} fill="#6b7280" />
            </svg>
          </Fragment>
          <Fragment index={2} as="figure" className={arriving}>
            <Panel index={2} s={second} from={first.deg} glide={W + GAP} last />
            <Step s={second} m={1} index={2} />
          </Fragment>
        </>
      )}
    </div>
  );
}

/*
 * Rotations of ℝ² commute: two rows of S and F, R_90° then R_45°, and R_45° then R_90°; the two
 * panels they end in, the same, outlined green and joined by a bracket, "both = R_135°"; beside
 * them, R_β ∘ R_α = R_α ∘ R_β = R_{α+β} and the product of the matrices. On the slide each turn is a
 * key press, one row after the other; here both rows run the first time the applet is on screen
 * (a panel mounted before then has turned unseen, so it starts afresh), and again on Replay; the
 * rule and the matrices are there from the start.
 */
export default function RotationsCommute() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    let frame;
    const next = setTimeout(() => {
      setStage(1);
      // a frame drawn with the copies `arriving`, so that they glide from there
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setStage(2));
      });
    }, NEXT);
    const same = setTimeout(() => setStage(3), SAME);
    return () => {
      clearTimeout(next);
      clearTimeout(same);
      cancelAnimationFrame(frame);
    };
  }, [seen, run]);
  const replay = () => {
    setStage(0);
    setRun((n) => n + 1);
  };
  return (
    <div className="viz-col" ref={ref}>
      {stage === 3 && <FxMarker index={5} id="spin-same" />}
      <div className="l14-spin">
        <div className="l14-spin-left">
          <div className="l14-spin-rows">
            {[
              [R90, R45],
              [R45, R90],
            ].map(([a, b]) => (
              <Row key={`${a.deg}-${seen}-${run}`} first={a} second={b} stage={stage} />
            ))}
          </div>
          <Fragment index={5} className={`l14-spin-both${stage < 3 ? ' arriving' : ''}`} style={{ '--c': GREEN }}>
            <span className="l14-spin-brace" />
            <span>
              both <Tex tex={r`=R_{135^\circ}`} />
            </span>
          </Fragment>
        </div>

        <div className="l14-spin-text">
          <div className="block theorem">
            <p>
              For any angles <Tex tex={r`\alpha`} /> and <Tex tex={r`\beta`} />,
            </p>
            <Tex display tex={r`R_\beta\circ R_\alpha=R_\alpha\circ R_\beta=R_{\alpha+\beta}.`} />
          </div>
          <div className="l14-spin-matrices">
            <p>In matrices:</p>
            <Tex
              display
              tex={r`\begin{aligned}&\begin{bmatrix}\cos\beta&-\sin\beta\\ \sin\beta&\cos\beta\end{bmatrix}\begin{bmatrix}\cos\alpha&-\sin\alpha\\ \sin\alpha&\cos\alpha\end{bmatrix}\\ &\quad=\begin{bmatrix}\cos(\alpha+\beta)&-\sin(\alpha+\beta)\\ \sin(\alpha+\beta)&\cos(\alpha+\beta)\end{bmatrix}.\end{aligned}`}
            />
          </div>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  );
}
