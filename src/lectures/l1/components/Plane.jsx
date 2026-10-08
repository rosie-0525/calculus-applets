/**
 * A small 2-D coordinate plane drawn as SVG, shared by every picture slide.
 *
 * `children` is a render prop that receives the coordinate helpers, so a slide
 * can draw in mathematical coordinates and never in pixels:
 *
 *   <Plane xRange={[-1, 6]} yRange={[-1, 6]}>
 *     {(p) => <Arrow p={p} to={[1, 3]} color="#8c1515" label="v" />}
 *   </Plane>
 */
export default function Plane({
  xRange = [-1, 6],
  yRange = [-1, 6],
  unit = 54,
  pad = 22,
  xTicks,
  yTicks,
  grid = true,
  title = 'Coordinate plane',
  children,
}) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const W = (xMax - xMin) * unit + 2 * pad;
  const H = (yMax - yMin) * unit + 2 * pad;

  const px = (x) => pad + (x - xMin) * unit;
  const py = (y) => H - pad - (y - yMin) * unit;
  const p = { px, py, unit, W, H };

  const range = (a, b) => {
    const out = [];
    for (let k = Math.ceil(a); k <= Math.floor(b); k += 1) out.push(k);
    return out;
  };
  const xs = xTicks ?? range(xMin, xMax);
  const ys = yTicks ?? range(yMin, yMax);

  return (
    <svg
      className="figure-svg"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={title}
    >
      {grid && (
        <g stroke="#eef0f3">
          {xs.map((x) => (
            <line key={`gx${x}`} x1={px(x)} y1={pad} x2={px(x)} y2={H - pad} />
          ))}
          {ys.map((y) => (
            <line key={`gy${y}`} x1={pad} y1={py(y)} x2={W - pad} y2={py(y)} />
          ))}
        </g>
      )}

      {/* axes */}
      <g stroke="#6b7280" strokeWidth="1.5">
        <line x1={pad} y1={py(0)} x2={W - pad} y2={py(0)} />
        <line x1={px(0)} y1={pad} x2={px(0)} y2={H - pad} />
      </g>
      <g fill="#6b7280" fontSize="13">
        {xs
          .filter((x) => x !== 0)
          .map((x) => (
            <text key={`tx${x}`} x={px(x)} y={py(0) + 17} textAnchor="middle">
              {x}
            </text>
          ))}
        {ys
          .filter((y) => y !== 0)
          .map((y) => (
            <text key={`ty${y}`} x={px(0) - 8} y={py(y) + 4} textAnchor="end">
              {y}
            </text>
          ))}
        <text x={W - pad - 2} y={py(0) - 8} textAnchor="end" fontSize="15" fontStyle="italic">
          x
        </text>
        <text x={px(0) + 9} y={pad + 13} fontSize="15" fontStyle="italic">
          y
        </text>
      </g>

      {typeof children === 'function' ? children(p) : children}
    </svg>
  );
}

/**
 * An arrow in plane coordinates. The head is a polygon rather than an SVG
 * `<marker>`, because markers cannot inherit the shaft colour in every browser.
 * `shaftProps` / `headProps` are passed to the <line> and <polygon>, e.g. a
 * class name for a CSS animation. An arrow of (almost) zero length draws nothing.
 */
export function Arrow({
  p,
  from = [0, 0],
  to,
  color = '#111827',
  width = 3.5,
  dashed = false,
  head = 14,
  opacity = 1,
  shaftProps = {},
  headProps = {},
  ...rest
}) {
  const x1 = p.px(from[0]);
  const y1 = p.py(from[1]);
  const x2 = p.px(to[0]);
  const y2 = p.py(to[1]);
  const len = Math.hypot(x2 - x1, y2 - y1);
  // A zero-length arrow would be all head, e.g. a v when a slider sets a = 0
  if (len < 2) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const hw = head * 0.42;
  const bx = x2 - ux * head * 0.9;
  const by = y2 - uy * head * 0.9;
  const tip = `${x2},${y2}`;
  const left = `${x2 - ux * head - uy * hw},${y2 - uy * head + ux * hw}`;
  const right = `${x2 - ux * head + uy * hw},${y2 - uy * head - ux * hw}`;

  return (
    <g opacity={opacity} {...rest}>
      <line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '9 7' : undefined}
        {...shaftProps}
      />
      <polygon points={`${tip} ${left} ${right}`} fill={color} {...headProps} />
    </g>
  );
}

/** A text label placed at a point of the plane, nudged by `dx`/`dy` pixels. */
export function PlaneLabel({ p, at, dx = 0, dy = 0, color = '#111827', size = 19, children, ...rest }) {
  return (
    <text
      x={p.px(at[0]) + dx}
      y={p.py(at[1]) + dy}
      fill={color}
      fontSize={size}
      fontWeight="700"
      fontStyle="italic"
      fontFamily="KaTeX_Math, Georgia, serif"
      {...rest}
    >
      {children}
    </text>
  );
}

/** A filled dot marking a point of the plane. */
export function Dot({ p, at, color = '#111827', r: radius = 5, ...rest }) {
  return <circle cx={p.px(at[0])} cy={p.py(at[1])} r={radius} fill={color} {...rest} />;
}
