import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Space, { Dot3 } from './Space.jsx';
import Surface from './Surface.jsx';
import TexSvg from './TexSvg.jsx';
import { BLUE, RED, GREEN } from './eig.js';

// Lecture 21's three graphs (Quadratic forms in two variables), as they were drawn there
const R = [-1.4, 1.4];
const Z = 0.42;
const X0 = r`\vv x\neq\vv 0`;
// on Recall: definiteness of quadratic forms, the indefinite graph's two curves through 0 (the user's
// request): along the x-axis, q_A > 0 (red), and along the y-axis, q_A < 0 (green), as Lecture 9's
// saddle x² − y²
const along = (g) => Array.from({ length: 41 }, (_, i) => g(-1.4 + (2.8 * i) / 40));
const POS_LINE = { pts: along((t) => [t, 0, Z * t * t]), color: RED, width: 3.5 };
const NEG_LINE = { pts: along((t) => [0, t, -Z * t * t]), color: GREEN, width: 3.5 };
const CARDS = [
  {
    name: 'positive-definite',
    def: (
      <>
        if <Tex tex={r`q_A(\vv x)>0`} /> for all <Tex tex={X0} />
      </>
    ),
    eig: (
      <>
        all eigenvalues of <Tex tex="A>0" />
      </>
    ),
    // on Recall: definiteness of quadratic forms, where q_A(0) = 0 goes, from the origin (px)
    zero: { dx: 0, dy: 26, anchor: 'middle' },
    test: (
      <>
        (all eigenvalues <Tex tex=">0" />)
      </>
    ),
    then: 'local minimum',
    semi: 'positive-semidefinite',
    semiDef: (
      <>
        if <Tex tex={r`q_A(\vv x)\geq 0`} /> for all <Tex tex={X0} />
      </>
    ),
    semiEig: (
      <>
        if all its eigenvalues are <Tex tex={r`\geq 0`} />
      </>
    ),
    c: 0.82,
    f: (x, y) => x * x + y * y,
    m: r`\begin{bmatrix}1&0\\0&1\end{bmatrix}`,
    q: r`x^2+y^2`,
    lams: r`1,\ 1`,
  },
  {
    name: 'negative-definite',
    def: (
      <>
        if <Tex tex={r`q_A(\vv x)<0`} /> for all <Tex tex={X0} />
      </>
    ),
    eig: (
      <>
        all eigenvalues of <Tex tex="A<0" />
      </>
    ),
    zero: { dx: 0, dy: -24, anchor: 'middle' },
    test: (
      <>
        (all eigenvalues <Tex tex="<0" />)
      </>
    ),
    then: 'local maximum',
    semi: 'negative-semidefinite',
    semiDef: (
      <>
        if <Tex tex={r`q_A(\vv x)\leq 0`} /> for all <Tex tex={X0} />
      </>
    ),
    semiEig: (
      <>
        if all its eigenvalues are <Tex tex={r`\leq 0`} />
      </>
    ),
    c: 0.18,
    f: (x, y) => -x * x - y * y,
    m: r`\begin{bmatrix}-1&0\\0&-1\end{bmatrix}`,
    q: r`-x^2-y^2`,
    lams: r`-1,\ -1`,
  },
  {
    name: 'indefinite',
    def: (
      <>
        if <Tex tex={r`q_A(\vv x)`} /> takes both positive
        <br />
        and negative values
      </>
    ),
    // on Recall: definiteness of quadratic forms, the definition in one line (as short as the eigenvalue
    // clause, the user's request: "if it has both positive and negative eigenvalues" was too long)
    defShort: (
      <>
        if <Tex tex={r`q_A(\vv x)`} /> takes both signs
      </>
    ),
    eig: (
      <>
        eigenvalues of <Tex tex="A" /> of both signs
      </>
    ),
    zero: { dx: 13, dy: 0, anchor: 'start' },
    test: (
      <>
        (a positive and a negative eigenvalue)
      </>
    ),
    then: 'saddle point',
    c: 0.5,
    f: (x, y) => x * x - y * y,
    m: r`\begin{bmatrix}1&0\\0&-1\end{bmatrix}`,
    q: r`x^2-y^2`,
    lams: r`1,\ -1`,
  },
];

/**
 * The three kinds of definiteness, one set of examples played for the definition and again for the
 * eigenvalue test (the lecture-slides skill: one set of examples, replayed for each related concept):
 * three columns, positive-definite, negative-definite, indefinite, each a clause over Lecture 21's
 * graph of x² + y², −x² − y², x² − y². `run`: 'def' (the clause is the definition, on q_A's values) or
 * 'eig' (the clause is on the signs of the eigenvalues, and under each graph, its eigenvalues in place
 * of its formula). Under each graph, its matrix A first (the user's request), I₂, −I₂, [1 0; 0 −1]:
 * over the formula ('def'), beside the eigenvalues ('eig'). Each clause is the name over its condition. The columns share three rows (clause,
 * graph, semidefinite clause), so that the three graphs are level. Key presses 1–3: a column each
 * (clause and graph); 4: the semidefinite clauses, at the foot of the first two columns, under the
 * graphs (the user's request: they were between the clause and the graph). `split` (Definiteness, the
 * user's request): the definition first, then the examples: key presses 1–3, a column's clause each,
 * with its semidefinite clause; 4–6, a column's example each (graph, A, formula). `semi={false}`
 * (Definiteness, the user's request): no semidefinite clauses (they are on Semidefinite, next).
 * `shift`: every key press that many later (Definiteness and eigenvalues: 1, the brace in the box first).
 * `compact` (Definiteness and eigenvalues, under the full-size red box): smaller graphs, tighter rows.
 * Lecture 26: `run` 'eig' (Recall: definiteness of quadratic forms, the user's requests): the name, the
 * definition (on q_A's values; the indefinite one shortened, `defShort`) and the graph a column per key
 * press (1–3), each graph with its origin and q_A(0) = 0 by it (the user's request); on the indefinite
 * one, key presses 4 and 5 (the user's request), the curve through 0 along the x-axis where q_A > 0 (red,
 * labelled q_A(x) > 0), then along the y-axis where q_A < 0 (green); then, one per key press (6–8), its
 * condition on the eigenvalues of A under the graph (the user's requests: below the plot, no ⟺, "of A";
 * A and its eigenvalues were there). `run` 'test' (Second derivative test): the clause is "… (all eigenvalues > 0)" and under
 * each graph, the graph of f near a, the conclusion "a is a local minimum" (maximum, saddle point), with
 * a dot at a; no semidefinite clauses. `run` 'goal' (Classifying critical points, the user's request):
 * only the kind of critical point over each graph, local minimum (maximum, saddle point), with a dot
 * at it, and its formula under the graph; no semidefinite clauses; then (the user's request) key
 * presses 4–6, in each column its quadratic form in blue (the user's requests: not a yellow highlight,
 * and one colour for all), and under it, in the same blue, what kind of quadratic form it is:
 * positive-definite, negative-definite, indefinite (deck.css: the colour follows the label, :has). The
 * semidefinite and neither columns (x³ ± y², y²) are gone (the user's request: only the three main
 * cases, to avoid confusion). `picsFirst` (Last time: definiteness, the
 * user's request: the class has just seen the graphs, on Classifying critical points): the graphs, with
 * A and q_A, on arrival; key presses 1–3, a clause each over its graph.
 */
export default function DefCards({ run = 'def', split = false, semi = true, shift = 0, compact = false, picsFirst = false }) {
  const eig = run === 'eig';
  const goal = run === 'goal';
  const test = run === 'test';
  // split: the example (graph, A, formula) on its own key press, after the three clauses
  const Pic = ({ k, children }) =>
    split ? (
      <Fragment index={shift + k + 4} className="l25-def-pic">
        {children}
      </Fragment>
    ) : (
      <div className="l25-def-pic">{children}</div>
    );
  // picsFirst: the column is there on arrival, its clause comes on its key press
  const Col = ({ k, children }) =>
    picsFirst ? (
      <div className="l25-def">{children}</div>
    ) : (
      <Fragment index={shift + k + 1} className="l25-def">
        {children}
      </Fragment>
    );
  const Clause = ({ k, children }) =>
    picsFirst ? (
      <Fragment index={shift + k + 1} as="p" className="l25-def-clause">
        {children}
      </Fragment>
    ) : (
      <p className="l25-def-clause">{children}</p>
    );
  return (
    <div className={`l25-defs${compact ? ' l25-defs-compact' : ''}${goal ? ' l26-defs-goal' : ''}`}>
      {CARDS.map((c, k) => (
        <Col key={c.name} k={k}>
          <Clause k={k}>
            {goal ? (
              <strong>{c.then}</strong>
            ) : (
              <>
                <strong>{c.name}</strong>
                <span>{test ? c.test : eig ? (c.defShort ?? c.def) : c.def}</span>
              </>
            )}
          </Clause>
          <Pic k={k}>
            <Space width={goal || eig ? 390 : 330} height={compact ? 112 : goal || eig ? 248 : 165} unit={compact ? 36 : goal || eig ? 78 : 52} center={[0.5, c.c]} el={22} axes={false} rock={false} title={`The graph of ${c.q}`}>
              {(s) => {
                // Recall: definiteness of quadratic forms: the origin, q_A(0) = 0 by it; on the indefinite
                // graph, the curves where q_A > 0 and < 0 (key presses 4 and 5), each labelled at its
                // right-hand end, off the surface (the label of 0 in the wedge between them, right of 0)
                const curves = eig && c.zero && c.name === 'indefinite';
                const o = s.P([0, 0, 0]);
                const pos = s.P(POS_LINE.pts[0]);
                const neg = s.P(NEG_LINE.pts[NEG_LINE.pts.length - 1]);
                return (
                  <g>
                    <Surface
                      s={s}
                      f={c.f}
                      x={R}
                      y={R}
                      n={26}
                      zScale={Z}
                      mesh="rgba(15, 40, 50, 0.16)"
                      lines={curves ? [{ ...POS_LINE, fragment: shift + 4 }, { ...NEG_LINE, fragment: shift + 5 }] : []}
                    />
                    {(test || goal || (eig && c.zero)) && <Dot3 s={s} at={[0, 0, 0]} color="#14213d" r={5.5} stroke="#fff" strokeWidth="1.5" />}
                    {eig && c.zero && (
                      <TexSvg x={o[0] + c.zero.dx} y={o[1] + c.zero.dy} tex={r`q_A(\vv 0)=0`} size={21} anchor={c.zero.anchor} w={130} h={30} className="l26-qlabel" />
                    )}
                    {curves && (
                      <>
                        <Fragment as="g" index={shift + 4}>
                          <TexSvg x={pos[0] + 8} y={pos[1] - 8} tex={r`q_A(\vv x)>0`} size={21} color={RED} anchor="start" w={130} h={30} className="l26-qlabel" />
                        </Fragment>
                        <Fragment as="g" index={shift + 5}>
                          <TexSvg x={neg[0] + 8} y={neg[1] + 6} tex={r`q_A(\vv x)<0`} size={21} color={GREEN} anchor="start" w={130} h={30} className="l26-qlabel" />
                        </Fragment>
                      </>
                    )}
                  </g>
                );
              }}
            </Space>
            {eig ? (
              <Fragment index={shift + k + 6} as="p" className="l25-def-q l26-def-eig">
                {c.eig}
              </Fragment>
            ) : (
            <p className="l25-def-q" style={goal ? { '--l26-kind': BLUE } : undefined}>
              {goal ? (
                <Tex tex={r`\htmlClass{l26-goal-hl}{${c.q}}`} />
              ) : test ? (
                <>
                  <span className="l26-then">⇒</span> <Tex tex={r`\vv a`} /> is a <strong>{c.then}</strong>
                </>
              ) : (
                <>
                  <Tex tex={`A=${c.m}`} />
                  <br />
                  <Tex tex={`q_A(x,y)=${c.q}`} />
                </>
              )}
            </p>
            )}
            {goal && (
              <Fragment index={shift + k + 4} as="p" className="l26-goal-kind" style={{ '--l26-kind': BLUE }}>
                <strong>{c.name}</strong>
                <br />
                quadratic form
              </Fragment>
            )}
          </Pic>
          {semi && !test && !goal && c.semi && (
            <Fragment index={shift + (split ? k + 1 : 4)} as="p" className="l25-def-clause l25-def-semi">
              <strong>{c.semi}</strong>
              <span>{eig ? c.semiEig : c.semiDef}</span>
            </Fragment>
          )}
        </Col>
      ))}
    </div>
  );
}
