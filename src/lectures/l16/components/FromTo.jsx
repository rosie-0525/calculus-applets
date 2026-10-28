import Tex from './Tex.jsx';
import Fragment from './Fragment.jsx';

/** Shown on key press `index`, or always without one. */
function Maybe({ index, className, style, children }) {
  return index == null ? (
    <span className={className} style={style}>
      {children}
    </span>
  ) : (
    <Fragment as="span" index={index} className={className} style={style}>
      {children}
    </Fragment>
  );
}

/**
 * A Markov matrix with its states as labels: "from" over the columns, "to" left of the rows, each
 * column tinted in the colour of its state, and under it, on key press `sumsAt`, its sum (`sums`,
 * TeX). Optional: `rowSums` (TeX, right of the rows, gray, on key press `rowSumsAt`), `name` (TeX
 * before the matrix, e.g. "M ="), `labels={false}` (no "from" and "to" labels), `bandsAt` (key
 * presses: column j's band shows from bandsAt[j] until the next column's, the last one stays; on
 * the same key press, they show together and stay), `bands={false}` (no tints), `marks` ([{ i, j, at, bg }]:
 * entries (i, j), from 0, each highlighted on its key press `at`, in `bg` or the deck's yellow),
 * `labelsAt` (the key press on which the labels appear).
 *
 * - `rows`: TeX entries, row by row;
 * - `states`: [{ label, color, tint }] (tint: the column's band).
 */
export default function FromTo({ rows, states, name, sums, sumsAt, rowSums, rowSumsAt, labels = true, labelsAt, bandsAt, bands = true, marks = [], className = '' }) {
  const n = rows[0].length;
  const m = rows.length;
  // grid columns: the "to" labels, the name, the left bracket, the n entries, the right bracket, the row sums
  // grid rows: the "from" labels, the m rows, the column sums
  const style = {
    gridTemplateColumns: `auto auto auto repeat(${n}, minmax(2.4em, auto)) auto auto`,
    gridTemplateRows: `auto repeat(${m}, auto) auto`,
  };
  return (
    <span className={`l16-ft ${className}`.trim()} style={style}>
      <span className="l16-ft-corner" style={{ gridColumn: 1, gridRow: 1 }} />
      {labels &&
        states.slice(0, n).map((s, j) => (
          <Maybe key={`f${j}`} index={labelsAt} className="l16-ft-from" style={{ gridColumn: j + 4, gridRow: 1, color: s.color }}>
            <span className="l16-ft-word">from</span> {s.label}
          </Maybe>
        ))}
      {labels &&
        states.slice(0, m).map((s, i) => (
          <Maybe key={`t${i}`} index={labelsAt} className="l16-ft-to" style={{ gridColumn: 1, gridRow: i + 2 }}>
            <span className="l16-ft-word">to</span> <span style={{ color: s.color }}>{s.label}</span>
          </Maybe>
        ))}
      {name && (
        <span className="l16-ft-name" style={{ gridColumn: 2, gridRow: `2 / ${m + 2}` }}>
          <Tex tex={name} />
        </span>
      )}
      <span className="l13-bracket left" style={{ gridColumn: 3, gridRow: `2 / ${m + 2}` }} />
      <span className="l13-bracket right" style={{ gridColumn: n + 4, gridRow: `2 / ${m + 2}` }} />
      {bands &&
        states.slice(0, n).map((s, j) => {
          const at = { gridColumn: j + 4, gridRow: `2 / ${m + 2}` };
          if (!bandsAt) return <span key={`b${j}`} className="l16-ft-band" style={{ ...at, background: s.tint }} />;
          const fill = { background: s.tint };
          return (
            <Fragment key={`b${j}`} as="span" index={bandsAt[j]} className="l16-ft-band l16-ft-band-hi" style={at}>
              {j + 1 < n && bandsAt[j + 1] !== bandsAt[j] ? (
                <Fragment as="span" index={bandsAt[j + 1]} effect="fade-out" style={fill} />
              ) : (
                <span style={fill} />
              )}
            </Fragment>
          );
        })}
      {marks.map(({ i, j, at, bg }) => (
        <Maybe key={`m${i}-${j}`} index={at} className="l16-ft-mark" style={{ gridColumn: j + 4, gridRow: i + 2, ...(bg && { background: bg }) }} />
      ))}
      {rows.map((row, i) =>
        row.map((e, j) => (
          <span key={`e${i}-${j}`} className="l16-ft-entry" style={{ gridColumn: j + 4, gridRow: i + 2 }}>
            <Tex tex={e} />
          </span>
        )),
      )}
      {sums &&
        sums.map((t, j) => (
          <Maybe key={`s${j}`} index={sumsAt} className="l16-ft-sum" style={{ gridColumn: j + 4, gridRow: m + 2, color: states[j].color }}>
            <Tex tex={t} />
          </Maybe>
        ))}
      {rowSums &&
        rowSums.map((t, i) => (
          <Maybe key={`r${i}`} index={rowSumsAt} className="l16-ft-rowsum" style={{ gridColumn: n + 5, gridRow: i + 2 }}>
            <Tex tex={t} />
          </Maybe>
        ))}
    </span>
  );
}

/** The raccoons' three cities as states of FromTo, with a light tint per column. */
export const CITY_STATES = [
  { label: 'MV', color: '#3b6ea8', tint: 'rgba(59, 110, 168, 0.1)' },
  { label: 'PA', color: '#8c1515', tint: 'rgba(140, 21, 21, 0.08)' },
  { label: 'MP', color: '#2f7d4f', tint: 'rgba(47, 125, 79, 0.1)' },
];

/** Mark's raccoon matrix, in TeX (`\dfrac`: the fractions full size). */
export const M_TEX = [
  ['\\dfrac12', '\\dfrac14', '0'],
  ['\\dfrac12', '\\dfrac12', '\\dfrac23'],
  ['0', '\\dfrac14', '\\dfrac13'],
];

/** Example 1's three islands as states of FromTo, with a light tint per column. */
export const ISLAND_STATES = [
  { label: 'A', color: '#3b6ea8', tint: 'rgba(59, 110, 168, 0.1)' },
  { label: 'B', color: '#c2702a', tint: 'rgba(194, 112, 42, 0.1)' },
  { label: 'C', color: '#2f7d4f', tint: 'rgba(47, 125, 79, 0.1)' },
];

/** The textbook's bird migration matrix, in TeX. */
export const M_BIRDS_TEX = [
  ['0', '\\dfrac12', '\\dfrac13'],
  ['\\dfrac12', '0', '\\dfrac13'],
  ['\\dfrac12', '\\dfrac12', '\\dfrac13'],
];
