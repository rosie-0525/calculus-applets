/**
 * Tick marks and their numbers on the bottom and left edges of a ContourPlot (its `pad` leaves
 * room for them), inside its children: {(p) => <Ticks p={p} x={[…]} y={[…]} />}. `box`: the plot's
 * frame [x0, x1] × [y0, y1] in its coordinates.
 */
export default function Ticks({ p, box, x = [], y = [], size = 14, color = '#6b7280', fmt = (v) => String(v).replace('-', '−') }) {
  const [[x0, x1], [y0, y1]] = box;
  const left = p.px(x0);
  const bottom = p.py(y0);
  return (
    <g fill={color} fontSize={size} stroke="none">
      <rect x={left} y={p.py(y1)} width={p.px(x1) - left} height={bottom - p.py(y1)} fill="none" stroke="#9ca3af" strokeWidth="1" />
      {x.map((v) => (
        <g key={`x${v}`}>
          <line x1={p.px(v)} y1={bottom} x2={p.px(v)} y2={bottom + 5} stroke={color} />
          <text x={p.px(v)} y={bottom + 7 + size} textAnchor="middle">
            {fmt(v)}
          </text>
        </g>
      ))}
      {y.map((v) => (
        <g key={`y${v}`}>
          <line x1={left - 5} y1={p.py(v)} x2={left} y2={p.py(v)} stroke={color} />
          <text x={left - 8} y={p.py(v) + size * 0.35} textAnchor="end">
            {fmt(v)}
          </text>
        </g>
      ))}
    </g>
  );
}
