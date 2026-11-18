/** A label in the slide's own type (as the eigenspaces' names on the slides: bold, in its colour),
 *  centred on (x, y) px, turned by `deg`, with a white halo. Also for Example 2's picture. */
export default function Name({ x, y, deg = 0, color, opacity = 1, children }) {
  const w = 180;
  const h = 32;
  return (
    <g opacity={opacity} transform={deg ? `rotate(${deg} ${x} ${y})` : undefined}>
      <foreignObject x={x - w / 2} y={y - h / 2} width={w} height={h} style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <div xmlns="http://www.w3.org/1999/xhtml" className="l24-space-name" style={{ color }}>
          {children}
        </div>
      </foreignObject>
    </g>
  );
}
