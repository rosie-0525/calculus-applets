import { MAIN, MATH } from './svgmath.jsx';
import { INK, ROWS, lerp } from './tr.js';

/**
 * A matrix in an SVG picture that flips across its diagonal as `t` goes from 0 to 1: entry (i, j)
 * glides straight across the diagonal to (j, i), the brackets stretch from m × n to n × m. Each row
 * keeps its colour (`colors`, by row), so row i of A is seen to become column i of Aᵀ.
 *
 * - `x`, `y`: the top-left corner of the entries' box (px); `cell`: the side of an entry's square.
 * - `diag`: the dashed diagonal, `size`: the size (m × n, then n × m) under the matrix,
 *   `label`/`labelT`: the name left of it before and after the flip (cross-faded).
 * - `ring`: [i, j], a ring round entry (i, j) (it travels with the entry).
 * - `colorAt(i, j)`: an entry's colour, in place of its row's.
 */
export default function FlipMatrix({ rows, t = 0, x, y, cell = 60, font = 30, colors = ROWS, colorAt, diag = false, size = false, label, labelT, ring, ringColor = INK }) {
  const m = rows.length;
  const n = rows[0].length;
  const w = lerp(n, m, t) * cell;
  const h = lerp(m, n, t) * cell;
  const pad = 0.12 * cell;
  const serif = 0.16 * cell;
  const bracket = (side) => {
    const bx = side < 0 ? x - pad : x + w + pad;
    const s = side < 0 ? serif : -serif;
    return `M${bx + s},${y - pad} H${bx} V${y + h + pad} H${bx + s}`;
  };
  const at = (i, j) => [x + (lerp(j, i, t) + 0.5) * cell, y + (lerp(i, j, t) + 0.5) * cell];
  const k = Math.max(m, n);
  const sizeText = (a, b) => `${a} × ${b}`;
  return (
    <g>
      {diag && (
        <line
          x1={x - 0.25 * cell}
          y1={y - 0.25 * cell}
          x2={x + (k + 0.25) * cell}
          y2={y + (k + 0.25) * cell}
          stroke="#9ca3af"
          strokeWidth="2"
          strokeDasharray="7 6"
        />
      )}
      <path d={bracket(-1)} fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="miter" />
      <path d={bracket(1)} fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="miter" />
      {ring && (() => {
        const [cx, cy] = at(ring[0], ring[1]);
        return <circle cx={cx} cy={cy} r={0.4 * cell} fill="none" stroke={ringColor} strokeWidth="2.4" />;
      })()}
      {rows.map((row, i) =>
        row.map((e, j) => {
          const [cx, cy] = at(i, j);
          return (
            <text key={`${i}-${j}`} x={cx} y={cy} dy="0.35em" textAnchor="middle" fontFamily={MAIN} fontSize={font} fill={colorAt ? colorAt(i, j) : colors[i % colors.length]} stroke="#fff" strokeWidth={font * 0.22} paintOrder="stroke">
              {e}
            </text>
          );
        }),
      )}
      {label && (
        <g fontFamily={MATH} fontStyle="italic" fontSize={font * 1.05} fill={INK} textAnchor="end">
          <text x={x - pad - 0.3 * cell} y={y + h / 2} dy="0.35em" opacity={1 - t}>
            {label} <tspan fontFamily={MAIN} fontStyle="normal">=</tspan>
          </text>
          <text x={x - pad - 0.3 * cell} y={y + h / 2} dy="0.35em" opacity={t}>
            {labelT ?? label}
            <tspan fontFamily={MAIN} fontStyle="normal" baselineShift="super" fontSize="0.62em">
              ⊤
            </tspan>{' '}
            <tspan fontFamily={MAIN} fontStyle="normal">=</tspan>
          </text>
        </g>
      )}
      {size && (
        <g fontFamily={MAIN} fontSize={font * 0.62} fill="#6b7280" textAnchor="middle">
          <text x={x + w / 2} y={y + h + pad + 0.42 * cell} opacity={t < 0.5 ? 1 - 2 * t : 0}>
            {sizeText(m, n)}
          </text>
          <text x={x + w / 2} y={y + h + pad + 0.42 * cell} opacity={t > 0.5 ? 2 * t - 1 : 0}>
            {sizeText(n, m)}
          </text>
        </g>
      )}
    </g>
  );
}
