import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Matrix from '../components/Matrix.jsx';
import { BLUE } from '../components/la.js';

// the 5, its copy and the added terms blue, as on Adding rows and columns (first red; the user's request)
export const B = [
  ['a', 'b'],
  ['c', 'd'],
];
export const E = [
  ['1', r`\textcolor{${BLUE}}{5}`],
  ['0', '1'],
];

// the diagonal example, as on Multiplying by a diagonal matrix: d₁ = 2 (orange), d₂ = 7 (violet)
export const D = [
  ['2', '0'],
  ['0', '7'],
];
export const TONES = ['c3', 'c2'];
export const tint = (k, extra) => ({ tone: `${TONES[k]} l15-tint`, style: { '--k': k }, ...extra });
export const late = (tex, k) => ({ tex, className: 'l15-tint-entry', style: { '--k': k } });
export const dBands = [tint(0, { row: 0, col: 0 }), tint(1, { row: 1, col: 1 })];
export const rowBands = [tint(0, { row: 0 }), tint(1, { row: 1 })];
export const colBands = [tint(0, { col: 0 }), tint(1, { col: 1 })];
export const times = (k, d) => <span className={`l15-times ${TONES[k]}`}>{`× ${d}`}</span>;

/**
 * B, turned into the product by a row operation (`row`: 5 × row 2 added to row 1) or a column
 * operation (5 × column 1 added to column 2): a blue copy of the row (column), times 5, glides onto
 * row 1 (column 2), whose entries become the sums (CSS, when the fragment around it is shown).
 */
export function Op({ row }) {
  const n = B.length;
  const changed = (i, j) => (row ? i === 0 : j === 1);
  const src = (i, j) => (row ? B[1][j] : B[i][0]);
  return (
    <span className={`l15-op ${row ? 'by-row' : 'by-col'}`} style={{ '--n': n }}>
      <span className="l15-op-brk left" />
      <span className="l15-op-cells">
        {B.map((line, i) =>
          line.map((e, j) => (
            <span key={`${i}${j}`} className="l15-op-cell" style={{ gridRow: i + 1, gridColumn: j + 1 }}>
              {changed(i, j) ? (
                <>
                  <span className="l15-op-before">
                    <Tex tex={e} />
                  </span>
                  <span className="l15-op-after">
                    <Tex tex={r`${e}+\textcolor{${BLUE}}{5${src(i, j)}}`} />
                  </span>
                </>
              ) : (
                <Tex tex={e} />
              )}
            </span>
          )),
        )}
        <span className="l15-op-copy" style={row ? { gridRow: 2, gridColumn: `1 / ${n + 1}` } : { gridRow: `1 / ${n + 1}`, gridColumn: 1 }}>
          {B.map((_, k) => (
            <span key={k} className="l15-op-cell">
              <Tex tex={r`\textcolor{${BLUE}}{5${row ? B[1][k] : B[k][0]}}`} />
            </span>
          ))}
        </span>
      </span>
      <span className="l15-op-brk right" />
    </span>
  );
}

/**
 * Row and column operations (Mark's remark, much shorter at the user's request, in a box; after
 * Adding rows and columns): rows on the left, columns on the right, a line between. Key press 1: DB
 * multiplies the rows of B by 2 and 7 (the diagonal example, tinted as on Multiplying by a diagonal
 * matrix); 2: EB adds 5 × row 2 to row 1 (animated, the textbook's Example 15.1.6 in 2 × 2); 3: BD
 * multiplies the columns; 4: BE adds 5 × column 1 to column 2.
 */
export default function Slide19RowOps() {
  return (
    <section className="dense">
      <h2>Row and column operations</h2>

      <div className="block theorem">
        <p>
          Multiplying <Tex tex="A" /> on the left does <strong>row operations</strong> on <Tex tex="A" />; multiplying on the right does{' '}
          <strong>column operations</strong>.
        </p>
      </div>

      <div className="l15-rc">
        <div className="l15-rc-side">
          <Fragment index={1} className="l15-rc-item">
            <div className="l15-eq-row">
              <Matrix rows={D} bands={dBands} />
              <Matrix rows={B} bands={rowBands} />
              <Tex tex="=" />
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
            </div>
          </Fragment>
          <Fragment index={2} className="l15-rc-item">
            <div className="l15-eq-row">
              <Matrix rows={E} />
              <Matrix rows={B} />
              <Tex tex="=" />
              <Op row />
            </div>
            <p className="l15-op-label">adds 5 times row 2 to row 1</p>
          </Fragment>
        </div>
        <div className="l15-rc-side">
          <Fragment index={3} className="l15-rc-item">
            <div className="l15-eq-row">
              <Matrix rows={B} bands={colBands} />
              <Matrix rows={D} bands={dBands} />
              <Tex tex="=" />
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
            </div>
          </Fragment>
          <Fragment index={4} className="l15-rc-item">
            <div className="l15-eq-row">
              <Matrix rows={B} />
              <Matrix rows={E} />
              <Tex tex="=" />
              <Op row={false} />
            </div>
            <p className="l15-op-label">adds 5 times column 1 to column 2</p>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
