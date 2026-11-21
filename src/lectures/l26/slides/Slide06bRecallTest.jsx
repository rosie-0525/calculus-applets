import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import NoteOwl from '../components/NoteOwl.jsx';

export const RED = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';
export const INK = '#14213d';
export const SANS = 'Source Sans Pro, Helvetica, sans-serif';

// Lecture 9's Single variable function graph: f′(x) = x (x + 2)(x − 2)², so f″(−2) = −32 < 0 (a local
// maximum), f″(0) = 8 > 0 (a local minimum) and f″(2) = 0 (neither)
export const f = (x) => x ** 5 / 5 - x ** 4 / 2 - (4 * x ** 3) / 3 + 4 * x * x;
export const XR = [-2.75, 3.15];
export const YR = [-5, 14.5];

export const path = (p, [a, b], N = 160) =>
  Array.from({ length: N + 1 }, (_, k) => a + ((b - a) * k) / N)
    .map((t, k) => `${k ? 'L' : 'M'}${p.px(t).toFixed(1)},${p.py(f(t)).toFixed(1)}`)
    .join(' ');

/** The point (c, f(c)) with its horizontal tangent line and a label (Lecture 9's). */
export function Flat({ p, c, color, label, dy, anchor = 'middle', dx = 0 }) {
  return (
    <g>
      <line x1={p.px(c - 0.7)} x2={p.px(c + 0.7)} y1={p.py(f(c))} y2={p.py(f(c))} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Dot p={p} at={[c, f(c)]} color={color} r={6.5} stroke="#fff" strokeWidth="1.5" />
      <text x={p.px(c) + dx} y={p.py(f(c)) + dy} textAnchor={anchor} fill={color} fontSize="19" fontWeight="700" fontFamily={SANS}>
        {label}
      </text>
    </g>
  );
}

/**
 * Recall: second derivative test (one variable; the user's request, before Example 3), in the words of
 * Mark's box on Second derivative test, but each case a sentence, If f″(c) … (the user's request: no
 * "…"). Beside it Lecture 9's Single
 * variable function graph, as it was there. Key press 1: f″(c) > 0, a local minimum, with the point at
 * 0; 2: f″(c) < 0, a local maximum, with the point at −2; 3: f″(c) = 0, no conclusion, with the point
 * at 2 (neither); 4: Let’s generalize this to f: ℝⁿ → ℝ, after Lecture 25's note owl
 * (NoteOwl.jsx, the user's request: a cute owl), which waddles in as the line appears. The label local minimum lower than in Lecture 9,
 * clear of the tick 1.
 */
export default function Slide06bRecallTest() {
  return (
    <section>
      <h2>Recall: second derivative test</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block theorem l26-rt-box">
            <p>
              Let <Tex tex={r`f:\mathbb R\to\mathbb R`} /> be a function, and <Tex tex="c" /> a critical point of <Tex tex="f" />.
            </p>
            <ul className="bullets l26-rt-cases">
              <Fragment index={1} as="li">
                If <Tex tex="f''(c)>0" />, then <Tex tex="c" /> is a local minimum.
              </Fragment>
              <Fragment index={2} as="li">
                If <Tex tex="f''(c)<0" />, then <Tex tex="c" /> is a local maximum.
              </Fragment>
              <Fragment index={3} as="li">
                If <Tex tex="f''(c)=0" />, no conclusion.
              </Fragment>
            </ul>
          </div>

          <Fragment index={4} as="p" className="l25-note l26-rt-today">
            <NoteOwl />
            Let’s generalize this to <Tex tex={r`f:\mathbb R^n\to\mathbb R`} />.
          </Fragment>
        </div>

        <Plane xRange={XR} yRange={YR} unit={[80, 22]} xTicks={[-2, -1, 1, 2, 3]} yTicks={[]} grid={false} title="The graph of a function with a local maximum at −2, a local minimum at 0, and a flat point at 2 that is neither">
          {(p) => (
            <g>
              <path d={path(p, XR)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <text x={p.px(-2.55)} y={p.py(-3.2)} fill={INK} fontSize="20" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
                y = f(x)
              </text>
              <Fragment as="g" index={1}>
                <Flat p={p} c={0} color={TEAL} label="local minimum" dy={46} dx={14} anchor="start" />
              </Fragment>
              <Fragment as="g" index={2}>
                <Flat p={p} c={-2} color={RED} label="local maximum" dy={-16} />
              </Fragment>
              <Fragment as="g" index={3}>
                <Flat p={p} c={2} color={GRAY} label="neither" dy={30} dx={10} anchor="start" />
              </Fragment>
            </g>
          )}
        </Plane>
      </div>
    </section>
  );
}
