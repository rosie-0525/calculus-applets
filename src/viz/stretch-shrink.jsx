import { useRef, useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import StretchHunt from '../lectures/l24/components/StretchHunt.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { A0, BLUE, col, texMh } from '../lectures/l24/components/eig.js';
import { UNIT } from '../lectures/l24/slides/Slide01bStretch.jsx';
import { useReplay } from './zoom-in.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 24;

// the slide's key press on which x, Ax and the line of x come and the square and F fade back
const HUNT = 3;
// where x starts, as on the slide
const X_START = [1.5, -0.5];

/** StretchHunt with T_A on its way: `run` > 0 plays it (the unit square and F moved by A). */
function Picture({ run, x, onDrag }) {
  const t = useTween(run > 0, { ms: 2400, delay: 300 });
  return <StretchHunt x={x} onDrag={onDrag} t={t} fade={HUNT} index={{ x: HUNT, ax: HUNT, line: HUNT }} unit={UNIT} />;
}

/*
 * Stretch and shrink, without its title and the owl's question (the caption has it): A = [1 1/2;
 * 1/2 1] in blue beside its picture (StretchHunt.jsx): T_A moves the unit square and F (the grid with
 * them) to a rhombus, stretched by 3/2 along y = x and shrunk by 1/2 along y = −x. Then x (dragged
 * from anywhere on the picture) and Ax on top, the moved square and F faded back; the line of x
 * lights up, and Ax reads Ax = (3/2)x or (1/2)x, when x is on a diagonal. On the slide T_A plays on
 * key press 1 and x and Ax come on key press 3; here T_A plays the first time the applet is on
 * screen and again on its button, and x and Ax come on theirs (the slide's fragments faded by hand).
 */
export default function StretchShrink() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  const [hunt, setHunt] = useState(false);
  const [x, setX] = useState(X_START);
  useFragmentSteps(ref, hunt ? HUNT : 0);
  return (
    <div className="viz-col sts" ref={ref}>
      <div className="l24-hunt sts-row">
        <p className="sts-a">
          <Tex tex={`${col(BLUE, 'A')}=${texMh(A0)}`} />
        </p>
        <div className="l24-hunt-pic">
          <Picture key={run} run={run} x={x} onDrag={hunt ? setX : undefined} />
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Play <Tex tex="T_A" /> again
        </button>
        <button type="button" className="viz-button" aria-pressed={hunt} onClick={() => setHunt((h) => !h)}>
          <Tex tex={r`\vv x`} /> and <Tex tex={r`A\vv x`} />
        </button>
      </div>
    </div>
  );
}
