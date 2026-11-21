import { useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex from '../lectures/l26/components/Tex.jsx';
import Plane, { Dot } from '../lectures/l26/components/Plane.jsx';
import { Flat, path, f, XR, YR, RED, TEAL, GRAY, INK } from '../lectures/l26/slides/Slide06bRecallTest.jsx';

export const lecture = 26;

// the three cases of the test, in the box's order, each with its critical point as the slide draws it
const CASES = [
  { tex: "f''(c)>0", c: 0, color: TEAL, label: 'local minimum', dy: 46, dx: 14, anchor: 'start' },
  { tex: "f''(c)<0", c: -2, color: RED, label: 'local maximum', dy: -16 },
  { tex: "f''(c)=0", c: 2, color: GRAY, label: 'neither', dy: 30, dx: 10, anchor: 'start' },
];

/*
 * Recall: second derivative test, without its title, its box and the owl's line (the caption has
 * them): Lecture 9's graph of f, with f′(x) = x(x + 2)(x − 2)². On the slide each case of the box comes
 * on a key press with its critical point on the graph, its horizontal tangent line and what it is:
 * f″(c) > 0, a local minimum at 0; f″(c) < 0, a local maximum at −2; f″(c) = 0, at 2, neither. Here the
 * three critical points are dots on the graph from the start, and each case's button shows its point
 * (the buttons are independent).
 */
export default function OneVariableTest() {
  const [on, setOn] = useState(() => CASES.map(() => false));
  const flip = (k) => setOn((o) => o.map((v, i) => (i === k ? !v : v)));
  return (
    <div className="viz-col ovt">
      <Plane xRange={XR} yRange={YR} unit={[80, 22]} xTicks={[-2, -1, 1, 2, 3]} yTicks={[]} grid={false} title="The graph of a function with a local maximum at −2, a local minimum at 0, and a flat point at 2 that is neither">
        {(p) => (
          <g>
            <path d={path(p, XR)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <text x={p.px(-2.55)} y={p.py(-3.2)} fill={INK} fontSize="20" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
              y = f(x)
            </text>
            {CASES.map((c, k) =>
              on[k] ? <Flat key={c.c} p={p} c={c.c} color={c.color} label={c.label} dy={c.dy} dx={c.dx} anchor={c.anchor} /> : <Dot key={c.c} p={p} at={[c.c, f(c.c)]} color={INK} r={5} stroke="#fff" strokeWidth="1.5" />,
            )}
          </g>
        )}
      </Plane>
      <div className="viz-toggle">
        {CASES.map((c, k) => (
          <button key={c.c} type="button" className="viz-button" aria-pressed={on[k]} onClick={() => flip(k)}>
            <Tex tex={c.tex} />
          </button>
        ))}
      </div>
    </div>
  );
}
