import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import RowOp from '../components/RowOp.jsx';
import { BLUE } from '../components/la.js';

// c, in E, the copy and the sums, blue (first red; changed at the user's request)
export const blue = (t) => r`\textcolor{${BLUE}}{${t}}`;

// each E is I (3 × 3, all of them, the user's request) with c in row i, column j (from 1): EA adds c
// times row j to row i, and AE adds c times column i to column j (Example 3's 3 × 3 E, with −1,
// removed by the user)
export const EXAMPLES = [
  { n: 3, i: 1, j: 2, c: 1 },
  { n: 3, i: 2, j: 1, c: -3 },
  { n: 3, i: 1, j: 3, c: 4 },
];
// A, a generic 3 × 3 matrix (first B, 2 × 2 or 3 × 3)
export const A = [
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
  ['g', 'h', 'i'],
];
export const texM = (rows) => r`\begin{bmatrix}${rows.map((row) => row.join('&')).join(r`\\ `)}\end{bmatrix}`;

export const matrixE = ({ n, i, j, c }) =>
  r`\begin{bmatrix}${Array.from({ length: n }, (_, a) =>
    Array.from({ length: n }, (__, b) => (a === b ? '1' : a === i - 1 && b === j - 1 ? blue(c) : '0')).join('&'),
  ).join(r`\\ `)}\end{bmatrix}`;

/** "adds c times row j / to row i" (c in blue; "adds row j to row i" when c = 1), on two lines. */
export function Adds({ c, from, to, what }) {
  return (
    <>
      adds{' '}
      {c !== 1 && (
        <>
          <Tex tex={blue(c)} /> times{' '}
        </>
      )}
      {what} {from}
      <br />
      to {what} {to}
    </>
  );
}

/** A product, A turning into it (RowOp), and what it does, small, beside it once it is done. */
export function Product({ e, by, index }) {
  const row = by === 'row';
  const [from, to] = row ? [e.j, e.i] : [e.i, e.j];
  return (
    <Fragment index={index} className="l15-adds-prod">
      <RowOp B={A} by={by} from={from - 1} to={to - 1} c={e.c} color={BLUE} />
      <p className="l15-op-label">
        <Adds c={e.c} from={from} to={to} what={row ? 'row' : 'column'} />
      </p>
    </Fragment>
  );
}

/**
 * Adding rows and columns (before Row and column operations; the user's request: examples of a
 * matrix and the row or column it adds to another): a generic 3 × 3 matrix A, small, to the right of
 * the title (the user's request; first B, 2 × 2 and 3 × 3, under it); three 3 × 3 matrices E, each I
 * with one more entry c (blue, first red). Key presses 1–6: EA, then AE, for each in turn, computed as an
 * animation (the user's request), a blue copy of the row (column), times c, gliding onto the other,
 * whose entries become the sums, then what it does, small, beside it. (Example 3's 3 × 3 E, with −1,
 * and the rule in a box, removed by the user.)
 */
export default function Slide18bAddRows() {
  return (
    <section className="dense">
      <div className="l15-adds-top">
        <h2>Adding rows and columns</h2>
        <Tex tex={r`A=${texM(A)}`} className="l15-adds-a" />
      </div>

      <div className="l15-adds">
        <div className="l15-adds-row l15-adds-head">
          <Tex tex="E" />
          <Tex tex="EA" />
          <Tex tex="AE" />
        </div>
        {EXAMPLES.map((e, k) => (
          <div key={k} className="l15-adds-row">
            <Tex tex={matrixE(e)} />
            <Product e={e} by="row" index={2 * k + 1} />
            <Product e={e} by="col" index={2 * k + 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
