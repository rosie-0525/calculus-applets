import Tex from './Tex.jsx';
import Fragment from './Fragment.jsx';

/**
 * A matrix (or a vector) drawn as a CSS grid of KaTeX entries between two brackets, so that a row,
 * a column or an entry can be tinted (a band behind it) and labelled, Mark's "← first row".
 *
 *   <Matrix rows={[['2', '-1'], ['1', '3']]} bands={[{ row: 0, tone: 'row', index: 1 }]} />
 *
 * - `rows`: the entries, row by row: TeX, or { tex, index, className } for an entry that comes on
 *   key press `index` (its place is kept until then) or has a class of its own.
 * - `bands`: { row, col, tone, index, effect }: a row (`row`), a column (`col`) or an entry (both);
 *   `tone` is a class (`row`, `col`, `cell`, `c1`, `c2`, `c3`; in deck.css); with `index`, the band
 *   comes on that key press (`effect`, e.g. 'fade-in-then-out', as for any fragment); `style`, e.g.
 *   a background of its own.
 * - `labels`: { row, text } to the right of a row, { col, text } under a column (text is a node),
 *   each with an optional `index` and `tone` (its colour: `row` or `col`).
 */
export default function Matrix({ rows, bands = [], labels = [], className = '' }) {
  const m = rows.length;
  const n = rows[0].length;
  // grid columns: the left bracket, the n entries, the right bracket, the labels of the rows;
  // grid rows: the m rows of entries, the labels of the columns
  const style = {
    gridTemplateColumns: `auto repeat(${n}, auto) auto auto`,
    gridTemplateRows: `repeat(${m}, auto) auto`,
  };
  const span = (k, count, offset) => (k == null ? `${1 + offset} / ${count + 1 + offset}` : `${k + 1 + offset}`);
  const placed = (item, key, cls, gridStyle) =>
    item.index == null ? (
      <span key={key} className={cls} style={gridStyle}>
        {item.text}
      </span>
    ) : (
      <Fragment key={key} as="span" index={item.index} effect={item.effect} className={cls} style={gridStyle}>
        {item.text}
      </Fragment>
    );
  return (
    <span className={`l13-matrix ${className}`.trim()} style={style}>
      <span className="l13-bracket left" style={{ gridColumn: 1, gridRow: `1 / ${m + 1}` }} />
      <span className="l13-bracket right" style={{ gridColumn: n + 2, gridRow: `1 / ${m + 1}` }} />
      {bands.map((b, k) =>
        placed(b, `b${k}`, `l13-band ${b.tone ?? 'row'}`, { gridRow: span(b.row, m, 0), gridColumn: span(b.col, n, 1), ...b.style }),
      )}
      {rows.map((row, i) =>
        row.map((e, j) => {
          const entry = typeof e === 'string' ? { tex: e } : e;
          const cls = `l13-entry ${entry.className ?? ''}`.trim();
          return placed({ ...entry, text: <Tex tex={entry.tex} /> }, `e${i}-${j}`, cls, { gridRow: i + 1, gridColumn: j + 2 });
        }),
      )}
      {labels.map((l, k) =>
        l.row != null
          ? placed(l, `l${k}`, `l13-mlabel right ${l.tone ?? ''}`, { gridRow: l.row + 1, gridColumn: n + 3 })
          : placed(l, `l${k}`, `l13-mlabel below ${l.tone ?? ''}`, { gridRow: m + 1, gridColumn: l.col + 2 }),
      )}
    </span>
  );
}

/** A vector: a matrix with one column, given its entries. */
export function Vec({ entries, ...rest }) {
  return <Matrix rows={entries.map((e) => [e])} {...rest} />;
}
