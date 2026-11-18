import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { AMBER } from '../components/eig.js';

// Definiteness's graphs (DefCards.jsx), as they are drawn there
export const R = [-1.4, 1.4];
export const Z = 0.42;
export const X0 = r`\vv x\neq\vv 0`;
// the line where q_A = 0 (besides 0), on the graph
export const ZERO = (axis) => Array.from({ length: 15 }, (_, i) => -1.4 + (2.8 * i) / 14).map((u) => (axis === 'y' ? [0, u, 0] : [u, 0, 0]));
export const CARDS = [
  {
    name: 'positive-semidefinite',
    def: (
      <>
        if <Tex tex={r`q_A(\vv x)\geq 0`} /> for all <Tex tex={X0} />
      </>
    ),
    c: 0.653,
    dy: 0,
    f: (x, y) => x * x,
    m: r`\begin{bmatrix}1&0\\0&0\end{bmatrix}`,
    q: 'x^2',
    sign: r`\geq 0`,
    zero: 'y',
    label: 'q_A(0,y)=0',
    not: 'not positive-definite',
  },
  {
    name: 'negative-semidefinite',
    def: (
      <>
        if <Tex tex={r`q_A(\vv x)\leq 0`} /> for all <Tex tex={X0} />
      </>
    ),
    c: 0.382,
    dy: -22,
    f: (x, y) => -y * y,
    m: r`\begin{bmatrix}0&0\\0&-1\end{bmatrix}`,
    q: '-y^2',
    sign: r`\leq 0`,
    zero: 'x',
    label: 'q_A(x,0)=0',
    not: 'not negative-definite',
  },
];

/**
 * Semidefinite (the user's request: Definiteness's positive-semidefinite and negative-semidefinite
 * clauses, moved here, each with an example): Definiteness's box again, then two columns in its
 * cards' style (DefCards.jsx's classes): positive-semidefinite and negative-semidefinite (the clauses as
 * they were on Definiteness), each one's example, its graph drawn as Definiteness's, A and q_A under it: [1 0; 0 0], x² ≥ 0, a trough, and [0 0; 0 −1], −y² ≤ 0 (the
 * signs, the user's request), a
 * ridge (seen from a little higher than there, so that the trough's floor shows; the graphs a little
 * taller than there, room for not … under the label). Key presses 1, 2:
 * the clauses; 3: the first example; 4: on its graph, the line where q_A = 0 (the y-axis) with its
 * label q_A(0, y) = 0 beyond its end, and under the label, not positive-definite (the user's request: it was
 * under the graph, after q_A(0, y) = 0); 5, 6:
 * the same for the second (the x-axis, not negative-definite). The line, the label and not … in
 * amber (the user's request: they were red, and the line came with the graph). No slide title, as
 * Definiteness.
 */
export default function Slide16bSemidefinite() {
  return (
    <section>
      <div className="block definition l25-defs-box">
        <p className="block-title">Definition</p>
        <p>
          Let <Tex tex="A" /> be an <Tex tex={r`n\times n`} /> symmetric matrix and <Tex tex={r`q_A(\vv x)`} /> its associated quadratic form. We say <Tex tex="A" /> is:
        </p>
      </div>
      <div className="l25-defs l25-semis">
        {CARDS.map((c, k) => (
          <Fragment key={c.name} index={k + 1} className="l25-def">
            <p className="l25-def-clause">
              <strong>{c.name}</strong>
              <span>{c.def}</span>
            </p>
            <Fragment index={2 * k + 3} className="l25-def-pic">
              <Space width={330} height={187} unit={52} center={[0.5, c.c]} el={34} axes={false} rock={false} title={`The graph of ${c.q}, zero along the ${c.zero}-axis`}>
                {(s) => {
                  // the line where q_A = 0, and its label beyond its right-hand end, not … under it, on the
                  // next key press; the ridge's label raised by dy, so that not … clears the ridge
                  const line = ZERO(c.zero).map((q) => s.P(q));
                  const end = line[0][0] > line[line.length - 1][0] ? line[0] : line[line.length - 1];
                  return (
                    <g>
                      <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
                      <Fragment as="g" index={2 * k + 4}>
                        <polyline points={line.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" />
                        <TexSvg x={end[0] + 8} y={end[1] + c.dy} tex={c.label} color={AMBER} size={22} anchor="start" w={140} h={32} />
                        <text className="l25-semi-not" x={end[0] + 11} y={end[1] + c.dy + 25} fill={AMBER}>
                          {c.not}
                        </text>
                      </Fragment>
                    </g>
                  );
                }}
              </Space>
              <p className="l25-def-q">
                <Tex tex={`A=${c.m}`} />
                <br />
                <Tex tex={`q_A(x,y)=${c.q}${c.sign}`} />
              </p>
            </Fragment>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
