import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { pts, RED, BLUE, AMBER } from '../components/inv.js';

export const XR = [-1.5, 2.5];
export const YR = [-1.5, 2];
// the line ax + by = c across the picture
export const across = ([a, b, c]) =>
  Math.abs(b) > Math.abs(a)
    ? [XR[0], XR[1]].map((x) => [x, (c - a * x) / b])
    : [YR[0], YR[1]].map((y) => [(c - b * y) / a, y]);

/**
 * The two lines of a 2 × 2 system (blue, amber; the second dashed over the first when they agree),
 * the system itself in the empty corner at the top right.
 */
export function Lines({ e1, e2, sys, point, same, title }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={62} pad={8} title={title}>
      {(p) => (
        <g>
          {/* the svg's own viewport clips what runs off the picture (no clipPath: in print, reveal copies each slide once per key press, and a url(#id) then names a hidden copy on an earlier page) */}
          <g>
            <polyline points={pts(p, across(e1))} stroke={BLUE} strokeWidth={same ? 7 : 3.5} fill="none" opacity={same ? 0.55 : 1} />
            <polyline points={pts(p, across(e2))} stroke={AMBER} strokeWidth="3.5" fill="none" strokeDasharray={same ? '12 9' : undefined} />
          </g>
          {point && <Dot p={p} at={point} color={RED} r={7} />}
          <TexSvg
            x={p.px(1.55)}
            y={p.py(1.42)}
            tex={r`\begin{cases}\textcolor{${BLUE}}{${sys[0]}}\\ \textcolor{${AMBER}}{${sys[1]}}\end{cases}`}
            size={19}
            w={140}
            h={60}
            className="l18-sys-label"
          />
        </g>
      )}
    </Plane>
  );
}

export const CASES = [
  { sys: [r`x+y=1`, r`x-2y=1`], e: [[1, 1, 1], [1, -2, 1]], point: [1, 0], label: 'one solution', title: 'Two lines crossing at one point' },
  { sys: [r`x+y=1`, r`2x+2y=1`], e: [[1, 1, 1], [2, 2, 1]], label: 'no solution', title: 'Two parallel lines' },
  { sys: [r`x+y=1`, r`2x+2y=2`], e: [[1, 1, 1], [2, 2, 2]], same: true, label: 'infinitely many solutions', title: 'The same line twice' },
];

/**
 * Solving systems of linear equations (first Solving Ax = b; renamed by the user): Mark's box (the
 * textbook's Theorem 18.3.3), in a box without a title, cut down as far as it goes (the user's
 * request: too many words): a system of n linear equations in n unknowns can be written as Ax = b,
 * where A is an n × n matrix (a sentence, the user's request); A invertible: exactly one
 * solution, x = A⁻¹b; not invertible: none or infinitely many, depending on b; a bullet per key press. Under it, 2 × 2 systems as two lines each (the system in the picture's corner), those of Example 4 ([1 1; 1 −2] and
 * [1 1; 2 2]): key press 1 (with the first bullet): A invertible, the lines cross at one
 * point; 2 (with the second): A not invertible, parallel lines, no solution; 3: the same line,
 * infinitely many solutions.
 */
export default function Slide12Systems() {
  return (
    <section className="dense">
      <h2>Solving systems of linear equations</h2>

      <div className="block theorem l18-systems-box">
        {/* Mark's wording, cut down (the user's request: too many words; the Ax = 0 remarks dropped), its first line a sentence (the user's request) */}
        <p>
          A system of <Tex tex="n" /> linear equations in <Tex tex="n" /> unknowns can be written as <Tex tex={r`A\vv x=\vv b`} />, where <Tex tex="A" /> is an{' '}
          <Tex tex={r`n\times n`} /> matrix.
        </p>
        <ul className="bullets">
          <Fragment index={1} as="li">
            If <Tex tex="A" /> is invertible, <Tex tex={r`A\vv x=\vv b`} /> has exactly one solution, <Tex tex={r`\vv x=A^{-1}\vv b`} />.
          </Fragment>
          <Fragment index={2} as="li">
            <Tex tex="A" /> not invertible: <Tex tex={r`A\vv x=\vv b`} /> has no solution or infinitely many, depending on <Tex tex={r`\vv b`} />.
          </Fragment>
        </ul>
        <p className="pointer right">(→ Theorem 18.3.3)</p>
      </div>

      <div className="l18-systems">
        {CASES.map((c, k) => (
          <Fragment key={k} index={k + 1} className="l18-system">
            <Lines e1={c.e[0]} e2={c.e[1]} sys={c.sys} point={c.point} same={c.same} title={c.title} />
            <p className={k === 0 ? 'l18-system-label' : 'l18-system-label l18-not'}>{c.label}</p>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
