import { useRef, useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import Plane from '../lectures/l24/components/Plane.jsx';
import Name from '../lectures/l24/components/SpaceName.jsx';
import { ProjScene } from '../lectures/l24/components/ProjPlane.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { EIGS2, len, pts, times } from '../lectures/l24/components/eig.js';
import { Scene, XR, YR, UNIT } from '../lectures/l24/slides/Slide05Example1.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 24;

// Example 2's picture, at The linear transformation T_B's size (on the slide, smaller: 310 × 289)
const SIZE = { width: 460, height: 420, unit: 54, center: [0.535, 0.59] };
const FADE = { ms: 400, delay: 0 };
const GLOW = { ms: 600, delay: 0 };
// Scene's frame (Slide05Example1): its Plane's pad
const PAD = 8;
// Example 1's eigenspaces' names, along their lines on the bottom half, set off the line by OFF px
// (as SpacesChart.jsx's NAMES, which it does not export)
const OFF = 17;
const NAMES = [
  {
    c: -0.8,
    off: [-1, -1],
    deg: -45,
    name: (
      <>
        <Tex tex="2" />
        -eigenspace
      </>
    ),
  },
  {
    c: 0.8,
    off: [1, -1],
    deg: 45,
    name: (
      <>
        <Tex tex="(-1)" />
        -eigenspace
      </>
    ),
  },
];

const STAGES = [
  <>
    What do <Tex tex="A" /> and <Tex tex="B" /> do?
  </>,
  <>Their eigenvectors</>,
  <>Their eigenspaces</>,
];

/** Over Example 1's picture, in its frame: a soft band round each eigenline and its name, `glow`. */
function Spaces1({ glow }) {
  return (
    <div className="es-over">
      <Plane xRange={XR} yRange={YR} unit={UNIT} pad={PAD} grid={false} axes={false} title="The eigenspaces of A, the lines of u and v">
        {(p) => (
          <g>
            {EIGS2.map((e, i) => {
              const f = times(6 / len(e.v), e.v);
              return <polyline key={i} points={pts(p, [times(-1, f), f])} stroke={e.color} strokeWidth="14" strokeLinecap="round" opacity={0.18 * glow} fill="none" />;
            })}
            {EIGS2.map((e, i) => {
              const m = NAMES[i];
              const q = times(m.c, e.v);
              return (
                <Name key={i} x={p.px(q[0]) + (OFF * m.off[0]) / Math.SQRT2} y={p.py(q[1]) + (OFF * m.off[1]) / Math.SQRT2} deg={m.deg} color={e.color} opacity={glow}>
                  {m.name}
                </Name>
              );
            })}
          </g>
        )}
      </Plane>
    </div>
  );
}

/** Both pictures at stage `s`, the stage's moves played as they mount (once `play`). */
function Pictures({ s, play }) {
  const move = useTween(play, { ms: 4000, delay: 600 });
  const fade = useTween(play, FADE);
  const shrink = useTween(play, { ms: 1900, delay: 900 });
  const glow = useTween(play, GLOW);
  const all = s >= 1 ? 1 : 0;
  const ex1 = s === 0 ? <Scene t={move} /> : <Scene t={s === 1 ? move : 1} eigs images steps />;
  const vs = s === 1 ? fade : all;
  const ex2 =
    s === 0 ? (
      <ProjScene {...SIZE} x={fade} tx={shrink} />
    ) : (
      <ProjScene
        {...SIZE}
        a={vs}
        lineA={vs}
        b={vs}
        lineB={vs}
        n={vs}
        lineN={vs}
        tn={s === 1 ? shrink : 1}
        glowP={s === 2 ? glow : 0}
        haloN={s === 2 ? glow : 0}
        line={s === 2 ? glow : 0}
        names={s === 2 ? [glow, glow] : [0, 0]}
      />
    );
  return (
    <div className="l22-tchart l24-spaces es-chart">
      <div className="l22-tcol">
        <p className="l22-thead">Example 1</p>
        <div className="l24-spaces-ex">
          <Tex tex={r`A=\dfrac12\begin{bmatrix}1&3\\3&1\end{bmatrix}`} />
          <div className="l24-spaces-pic es-ex1">
            {ex1}
            {s === 2 && <Spaces1 glow={glow} />}
          </div>
        </div>
      </div>
      <div className="l22-tcol">
        <p className="l22-thead">Example 2</p>
        <div className="l24-spaces-ex">
          <Tex tex={r`B=\dfrac1{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          <div className="l24-spaces-pic">{ex2}</div>
        </div>
      </div>
    </div>
  );
}

/*
 * Eigenspace, without its title and its definition (the caption has it): Examples 1 and 2 in a
 * T-chart (SpacesChart.jsx's, composed here from the pictures it is made of: its own are not
 * exported), each with its matrix over its picture. Example 1: A = (1/2)[1 3; 3 1] moving the grid,
 * the unit square and F (Slide05Example1's Scene); then u and v on their eigenlines, and A again, u
 * stretching by 2, v flipping; then the eigenspaces, a soft band round each line, named in the
 * picture: the 2-eigenspace and the (−1)-eigenspace. Example 2 (ProjPlane.jsx's ProjScene): B
 * dropping a vector x onto the plane P; then (2, −1, 0), (3, 0, −1) and (1, 2, 3) on their
 * eigenlines, and B again, (1, 2, 3) shrinking into 0; then P lights up, the 1-eigenspace, with one
 * more eigenline in it, and the line of (1, 2, 3), the 0-eigenspace = N(B). On the slide these come
 * one per key press, 1–14, Example 1 then Example 2; here three buttons take both examples a step at a
 * time (the pictures drawn afresh for each, so that its moves play), the first played when the applet
 * is first on screen. The 3-D picture rocks while on screen and turns when dragged.
 */
export default function EigenspaceExamples() {
  const ref = useRef(null);
  const [run] = useReplay(ref);
  const [s, setS] = useState(0);
  const [turn, setTurn] = useState(0);
  return (
    <div className="viz-col es" ref={ref}>
      <Pictures key={`${s}-${run}-${turn}`} s={s} play={run > 0} />
      <div className="viz-toggle es-pick" role="group" aria-label="What the pictures show">
        {STAGES.map((label, i) => (
          <button
            key={i}
            type="button"
            className="viz-button"
            aria-pressed={s === i}
            onClick={() => {
              setS(i);
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
