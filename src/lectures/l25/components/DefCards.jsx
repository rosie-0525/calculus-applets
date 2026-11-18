import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Space from './Space.jsx';
import Surface from './Surface.jsx';

// Lecture 21's three graphs (Quadratic forms in two variables), as they were drawn there
const R = [-1.4, 1.4];
const Z = 0.42;
const X0 = r`\vv x\neq\vv 0`;
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
        if all its eigenvalues are <Tex tex=">0" />
      </>
    ),
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
        if all its eigenvalues are <Tex tex="<0" />
      </>
    ),
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
    eig: (
      <>
        if it has both positive
        <br />
        and negative eigenvalues
      </>
    ),
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
 */
export default function DefCards({ run = 'def', split = false, semi = true, shift = 0, compact = false }) {
  const eig = run === 'eig';
  // split: the example (graph, A, formula) on its own key press, after the three clauses
  const Pic = ({ k, children }) =>
    split ? (
      <Fragment index={shift + k + 4} className="l25-def-pic">
        {children}
      </Fragment>
    ) : (
      <div className="l25-def-pic">{children}</div>
    );
  return (
    <div className={`l25-defs${compact ? ' l25-defs-compact' : ''}`}>
      {CARDS.map((c, k) => (
        <Fragment key={c.name} index={shift + k + 1} className="l25-def">
          <p className="l25-def-clause">
            <strong>{c.name}</strong>
            <span>{eig ? c.eig : c.def}</span>
          </p>
          <Pic k={k}>
            <Space width={330} height={compact ? 112 : 165} unit={compact ? 36 : 52} center={[0.5, c.c]} el={22} axes={false} rock={false} title={`The graph of ${c.q}`}>
              {(s) => <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />}
            </Space>
            <p className="l25-def-q">
              {eig ? (
                <>
                  <Tex tex={`A=${c.m}`} />, eigenvalues <Tex tex={c.lams} />
                </>
              ) : (
                <>
                  <Tex tex={`A=${c.m}`} />
                  <br />
                  <Tex tex={`q_A(x,y)=${c.q}`} />
                </>
              )}
            </p>
          </Pic>
          {semi && c.semi && (
            <Fragment index={shift + (split ? k + 1 : 4)} as="p" className="l25-def-clause l25-def-semi">
              <strong>{c.semi}</strong>
              <span>{eig ? c.semiEig : c.semiDef}</span>
            </Fragment>
          )}
        </Fragment>
      ))}
    </div>
  );
}
