import { useRef, useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import StretchHunt from '../lectures/l24/components/StretchHunt.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { UNIT } from '../lectures/l24/slides/Slide04Eigenlines.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 24;

// the slide's key presses: the two eigenlines (3); x and Ax fade out and T_A plays again, with u and
// v (5)
const LINES = 3;
const PLAY = 5;
const STEP = [0, LINES, PLAY];
const X_START = [1.5, -0.5];

const STAGES = [
  <>
    <Tex tex={r`\vv x`} /> and <Tex tex={r`A\vv x`} />
  </>,
  <>Eigenlines</>,
  <>
    <Tex tex="T_A" /> on <Tex tex={r`\vv u`} /> and <Tex tex={r`\vv v`} />
  </>,
];

/** Stretch and shrink's applet at stage `k`; at the last, T_A plays again as it mounts. */
function Picture({ k, x, onDrag }) {
  const tw = useTween(k === 2, { ms: 2800, delay: 600 });
  return (
    <StretchHunt
      x={x}
      onDrag={k < 2 ? onDrag : undefined}
      index={{ gone: PLAY }}
      lines={LINES}
      arrows={PLAY}
      t={k === 2 ? tw : 1}
      unit={UNIT}
      title="x, to drag, and Ax, and the eigenlines of A = [1 1/2; 1/2 1], on top of the unit square and F moved by A"
    />
  );
}

/*
 * Eigenlines, without its title, its theorem, its why and its definition (the caption has them):
 * Stretch and shrink's applet (StretchHunt.jsx), A = [1 1/2; 1/2 1], the square and F faded back, x
 * dragged from anywhere on the picture. On the slide, key press 3 lights up the two eigenlines, u's
 * amber and v's purple, and 5 fades x and Ax out and plays T_A again, the square and F moving with u
 * and v (an amber and a purple arrow): u stretched by 3/2, v shrunk by 1/2. Here three buttons pick
 * x and Ax, the eigenlines, and T_A again (played afresh on each click); the slide's fragments are
 * faded by hand.
 */
export default function Eigenlines() {
  const ref = useRef(null);
  const [k, setK] = useState(0);
  const [turn, setTurn] = useState(0);
  const [x, setX] = useState(X_START);
  useFragmentSteps(ref, STEP[k]);
  return (
    <div className="viz-col eln" ref={ref}>
      <Picture key={k === 2 ? `play-${turn}` : 'drag'} k={k} x={x} onDrag={setX} />
      <div className="viz-toggle eln-pick" role="group" aria-label="What the picture shows">
        {STAGES.map((label, i) => (
          <button
            key={i}
            type="button"
            className="viz-button"
            aria-pressed={k === i}
            onClick={() => {
              setK(i);
              setTurn((n) => n + 1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
