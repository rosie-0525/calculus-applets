import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import RowOp from '../lectures/l15/components/RowOp.jsx';
import { BLUE } from '../lectures/l15/components/la.js';
import { EXAMPLES, A, texM, matrixE, Adds } from '../lectures/l15/slides/Slide18bAddRows.jsx';

export const lecture = 15;

/**
 * A product EA (`by` "row") or AE ("col"), a button: a ? until it is clicked; then A turning into
 * it (RowOp: a blue copy of the row or column, times c, gliding onto the other, whose entries
 * become the sums) and what it does, small, beside it, again on each click. RowOp's animation (CSS)
 * runs in a `fragment visible`, mounted afresh by each click.
 */
function Product({ e, by, run, onClick }) {
  const row = by === 'row';
  const [from, to] = row ? [e.j, e.i] : [e.i, e.j];
  const what = row ? 'EA' : 'AE';
  return (
    <button type="button" className="ops-pick" aria-label={`Compute ${what}`} onClick={onClick}>
      {run ? (
        <span key={run} className="fragment visible l15-adds-prod">
          <RowOp B={A} by={by} from={from - 1} to={to - 1} c={e.c} color={BLUE} />
          <span className="l15-op-label">
            <Adds c={e.c} from={from} to={to} what={row ? 'row' : 'column'} />
          </span>
        </span>
      ) : (
        <span className="ops-ask">
          <Tex tex={r`${what}=\,?`} />
        </span>
      )}
    </button>
  );
}

/*
 * Adding rows and columns: the generic 3 × 3 matrix A, and the table of three matrices E, each I
 * with one more entry c (blue), with EA and AE. On the slide each product is computed, as an
 * animation, on a key press; here on a click (and again on the next one).
 */
export default function AddingRows() {
  const [runs, setRuns] = useState({});
  const click = (k) => setRuns((v) => ({ ...v, [k]: (v[k] ?? 0) + 1 }));
  return (
    <div className="viz-col adds-col">
      <Tex tex={r`A=${texM(A)}`} className="l15-adds-a" />
      <div className="l15-adds">
        <div className="l15-adds-row l15-adds-head">
          <Tex tex="E" />
          <Tex tex="EA" />
          <Tex tex="AE" />
        </div>
        {EXAMPLES.map((e, k) => (
          <div key={k} className="l15-adds-row">
            <Tex tex={matrixE(e)} />
            {['row', 'col'].map((by) => (
              <Product key={by} e={e} by={by} run={runs[`${k}${by}`] ?? 0} onClick={() => click(`${k}${by}`)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
