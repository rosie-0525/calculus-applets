import { useId, useRef } from 'react';

/**
 * A plot of data drawn as SVG (the statistics counterpart of Plane.jsx): its axes sit on the lower
 * and left edges of the data window, with light grid lines at the ticks, so the window need not
 * contain 0 (heights from 61 to 75 inches, say).
 *
 * `children` is a render prop that receives the coordinate helpers:
 *   px, py   data → pixels;
 *   toData   a pointer event → [x, y] in data coordinates (for dragging);
 *   clip     a clip-path that keeps lines inside the data window;
 *   xMin, xMax  the window's horizontal range.
 */
export default function DataPlot({
  width = 700,
  height = 480,
  xRange,
  yRange,
  xTicks = [],
  yTicks = [],
  xLabel,
  yLabel,
  fmtX = (x) => `${x}`,
  fmtY = (y) => `${y}`,
  title = 'Data plot',
  className = '',
  children,
  ...rest
}) {
  const svgRef = useRef(null);
  const clipId = `clip${useId().replace(/:/g, '')}`;
  const left = yLabel ? 70 : 46;
  const bottom = xLabel ? 54 : 34;
  const top = 16;
  const right = 18;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const px = (x) => left + ((x - xMin) / (xMax - xMin)) * (width - left - right);
  const py = (y) => height - bottom - ((y - yMin) / (yMax - yMin)) * (height - top - bottom);
  const ix = (X) => xMin + ((X - left) / (width - left - right)) * (xMax - xMin);
  const iy = (Y) => yMin + ((height - bottom - Y) / (height - top - bottom)) * (yMax - yMin);

  const toData = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [ix(q.x), iy(q.y)];
  };
  const p = { px, py, toData, clip: `url(#${clipId})`, left, right: width - right, top, bottom: height - bottom, xMin, xMax };

  return (
    <svg
      ref={svgRef}
      className={`figure-svg data-plot ${className}`.trim()}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={title}
      data-prevent-swipe
      {...rest}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={left} y={top} width={width - left - right} height={height - top - bottom} />
        </clipPath>
      </defs>
      <g stroke="#eef0f3">
        {xTicks.map((x) => (
          <line key={`gx${x}`} x1={px(x)} y1={top} x2={px(x)} y2={height - bottom} />
        ))}
        {yTicks.map((y) => (
          <line key={`gy${y}`} x1={left} y1={py(y)} x2={width - right} y2={py(y)} />
        ))}
      </g>
      <g stroke="#6b7280" strokeWidth="1.5">
        <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} />
        <line x1={left} y1={top} x2={left} y2={height - bottom} />
      </g>
      <g fill="#6b7280" fontSize="14">
        {xTicks.map((x) => (
          <text key={`tx${x}`} x={px(x)} y={height - bottom + 19} textAnchor="middle">
            {fmtX(x)}
          </text>
        ))}
        {yTicks.map((y) => (
          <text key={`ty${y}`} x={left - 8} y={py(y) + 5} textAnchor="end">
            {fmtY(y)}
          </text>
        ))}
        {xLabel && (
          <text x={(left + width - right) / 2} y={height - 10} textAnchor="middle" fontSize="15">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={18}
            y={(top + height - bottom) / 2}
            textAnchor="middle"
            fontSize="15"
            transform={`rotate(-90 18 ${(top + height - bottom) / 2})`}
          >
            {yLabel}
          </text>
        )}
      </g>
      {typeof children === 'function' ? children(p) : children}
    </svg>
  );
}
