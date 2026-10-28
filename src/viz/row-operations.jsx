import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import Matrix from '../lectures/l15/components/Matrix.jsx';
import { B, E, D, late, dBands, rowBands, colBands, times, Op } from '../lectures/l15/slides/Slide19RowOps.jsx';

export const lecture = 15;

// the four products, as on the slide: DB and EB (rows, on the left), BD and BE (columns, on the right)
const ITEMS = [
  {
    key: 'DB',
    side: 0,
    factors: [<Matrix key="d" rows={D} bands={dBands} />, <Matrix key="b" rows={B} bands={rowBands} />],
    result: (
      <Matrix
        rows={[
          [late('2a', 0), late('2b', 0)],
          [late('7c', 1), late('7d', 1)],
        ]}
        bands={rowBands}
        labels={[
          { row: 0, text: times(0, 2) },
          { row: 1, text: times(1, 7) },
        ]}
      />
    ),
  },
  {
    key: 'EB',
    side: 0,
    factors: [<Matrix key="e" rows={E} />, <Matrix key="b" rows={B} />],
    result: <Op row />,
    label: 'adds 5 times row 2 to row 1',
  },
  {
    key: 'BD',
    side: 1,
    factors: [<Matrix key="b" rows={B} bands={colBands} />, <Matrix key="d" rows={D} bands={dBands} />],
    result: (
      <Matrix
        rows={[
          [late('2a', 0), late('7b', 1)],
          [late('2c', 0), late('7d', 1)],
        ]}
        bands={colBands}
        labels={[
          { col: 0, text: times(0, 2) },
          { col: 1, text: times(1, 7) },
        ]}
      />
    ),
  },
  {
    key: 'BE',
    side: 1,
    factors: [<Matrix key="b" rows={B} />, <Matrix key="e" rows={E} />],
    result: <Op row={false} />,
    label: 'adds 5 times column 1 to column 2',
  },
];

/**
 * A product, a button: its factors = ? until it is clicked; then the product computed as on the
 * slide's key press (D's entries tinted with the rows or columns they multiply, or a copy of a row
 * or column, times 5, gliding onto the other), again on each click. The animations (CSS) run in a
 * `fragment visible`, mounted afresh by each click.
 */
function Item({ item, run, onClick }) {
  const { key, factors, result, label } = item;
  return (
    <button type="button" className="ops-pick" aria-label={`Compute ${key}`} onClick={onClick}>
      {run ? (
        <span key={run} className="fragment visible l15-rc-item">
          <span className="l15-eq-row">
            {factors}
            <Tex tex="=" />
            {result}
          </span>
          {label && <span className="l15-op-label">{label}</span>}
        </span>
      ) : (
        <span className="l15-rc-item">
          <span className="l15-eq-row">
            {factors}
            <Tex tex={r`=\,?`} />
          </span>
        </span>
      )}
    </button>
  );
}

/*
 * Row and column operations without the box (the caption says it): rows on the left, DB and EB,
 * columns on the right, BD and BE. On the slide each product is computed on a key press; here on a
 * click (and again on the next one).
 */
export default function RowOperations() {
  const [runs, setRuns] = useState({});
  const click = (k) => setRuns((v) => ({ ...v, [k]: (v[k] ?? 0) + 1 }));
  return (
    <div className="l15-rc ops-col">
      {[0, 1].map((side) => (
        <div key={side} className="l15-rc-side">
          {ITEMS.filter((it) => it.side === side).map((it) => (
            <Item key={it.key} item={it} run={runs[it.key] ?? 0} onClick={() => click(it.key)} />
          ))}
        </div>
      ))}
    </div>
  );
}
