import Tex, { r } from './Tex.jsx';
import { BLUE } from './la.js';

const paint = (color, t) => r`\textcolor{${color}}{${t}}`;
/** c times the entry x, as it is added: x, −x, 4x, −3x. */
const scaled = (c, x) => (c === 1 ? x : c === -1 ? `-${x}` : `${c}${x}`);
/** e + c·x, the added term in `color`: a+c, c−3a, a+4g. */
const sum = (e, c, x, color) => (c < 0 ? r`${e}${paint(color, scaled(c, x))}` : r`${e}+${paint(color, scaled(c, x))}`);

/**
 * B (a square matrix of letters) turned into EB or BE by one operation, as on Row and column
 * operations: a copy of row `from` (`by="row"`) or column `from` (`by="col"`), times c, in `color`
 * (blue unless given), glides onto row (column) `to`, whose entries become the sums, when the
 * fragment around it is shown (CSS, the copy's distance in --d). Rows and columns count from 0.
 */
export default function RowOp({ B, by, from, to, c, color = BLUE }) {
  const n = B.length;
  const row = by === 'row';
  const changed = (i, j) => (row ? i === to : j === to);
  const src = (i, j) => (row ? B[from][j] : B[i][from]);
  const copy = row ? { gridRow: from + 1, gridColumn: `1 / ${n + 1}` } : { gridRow: `1 / ${n + 1}`, gridColumn: from + 1 };
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
                    <Tex tex={sum(e, c, src(i, j), color)} />
                  </span>
                </>
              ) : (
                <Tex tex={e} />
              )}
            </span>
          )),
        )}
        <span className="l15-op-copy" style={{ ...copy, '--d': to - from }}>
          {B.map((_, k) => (
            <span key={k} className="l15-op-cell">
              <Tex tex={paint(color, scaled(c, row ? B[from][k] : B[k][from]))} />
            </span>
          ))}
        </span>
      </span>
      <span className="l15-op-brk right" />
    </span>
  );
}
