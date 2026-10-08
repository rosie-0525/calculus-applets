import { useEffect, useRef, useState } from 'react';
import { Arrow } from './Plane.jsx';

/**
 * A small picture of ℝ³ drawn as SVG, the 3-D counterpart of Plane.jsx.
 *
 * `children` is a render prop that receives the projection helpers, so a
 * slide draws in space coordinates and never in pixels:
 *
 *   <Space unit={40} axisLen={3}>
 *     {(s) => <Arrow3 s={s} to={[1, 2, 1]} color="#8c1515" />}
 *   </Space>
 *
 * The view looks at the origin from the direction of the positive x-axis,
 * a little to the side (azimuth `az`) and from above (elevation `el`), so
 * x comes toward the viewer, y runs to the right and z is up, as in the
 * textbook's figures. While its slide is showing the view rocks slowly from
 * side to side (`rock`), and dragging the picture turns it by hand (`drag`);
 * both are off under prefers-reduced-motion.
 *
 * `s.P([x, y, z])` gives the pixel position of a point, `s.depth` how close
 * it is to the viewer (larger = closer), for the odd occlusion decision.
 */

const deg = (d) => (d * Math.PI) / 180;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isShowing = (el) => el?.closest('section')?.classList.contains('present');

/** Mouse/touch position in the coordinates of the svg's viewBox. */
function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}

/**
 * The azimuth and elevation of the view (degrees). The azimuth rocks about
 * `az0` while the slide is showing until the picture is turned by hand.
 */
function useView({ az: az0, el: el0, rock, swing, period }, svgRef) {
  const [t, setT] = useState(0);
  const [turn, setTurn] = useState(null); // { az, el } once turned by hand
  const [grab, setGrab] = useState(null);

  useEffect(() => {
    if (!rock || turn || reducedMotion()) return undefined;
    let id;
    const start = performance.now();
    const tick = (now) => {
      if (isShowing(svgRef.current)) setT((now - start) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [rock, turn, svgRef]);

  const az = turn ? turn.az : az0 + swing * Math.sin((2 * Math.PI * t) / period);
  const el = turn ? turn.el : el0;

  const handlers = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setGrab({ at: svgPoint(svgRef.current, e), az, el });
    },
    onPointerMove: (e) => {
      if (!grab) return;
      const [x, y] = svgPoint(svgRef.current, e);
      setTurn({
        az: grab.az - (x - grab.at[0]) * 0.45,
        el: Math.max(2, Math.min(80, grab.el + (y - grab.at[1]) * 0.45)),
      });
    },
    onPointerUp: () => setGrab(null),
    onPointerCancel: () => setGrab(null),
  };

  return { az, el, handlers };
}

export default function Space({
  width = 420,
  height = 340,
  unit = 40,
  center = [0.5, 0.56], // where the origin sits, as fractions of the width and height
  az = -40,
  el = 24,
  rock = true,
  swing = 14,
  period = 12, // seconds
  drag = true,
  axes = true,
  axisLen = 3, // one length, or [x, y, z]
  axisLabels = ['x', 'y', 'z'],
  negAxes = true,
  ticks = false,
  title = 'Three-dimensional space',
  className = '',
  children,
}) {
  const svgRef = useRef(null);
  const view = useView({ az, el, rock, swing, period }, svgRef);
  const A = deg(view.az);
  const E = deg(view.el);
  const O = [width * center[0], height * center[1]];

  const P = ([x, y, z]) => {
    const xr = x * Math.cos(A) - y * Math.sin(A);
    const yr = x * Math.sin(A) + y * Math.cos(A);
    return [O[0] + unit * yr, O[1] - unit * (z * Math.cos(E) - xr * Math.sin(E))];
  };
  const depth = ([x, y, z]) => {
    const xr = x * Math.cos(A) - y * Math.sin(A);
    return xr * Math.cos(E) + z * Math.sin(E);
  };
  const s = { P, depth, W: width, H: height, unit, az: view.az, el: view.el };

  const lens = Array.isArray(axisLen) ? axisLen : [axisLen, axisLen, axisLen];

  return (
    <svg
      ref={svgRef}
      className={`figure-svg space ${drag ? 'space-drag' : ''} ${className}`.trim()}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={title}
      {...(drag ? view.handlers : {})}
    >
      {axes && (
        <g>
          {[0, 1, 2].map((k) => {
            const e = [0, 0, 0];
            e[k] = lens[k];
            const o = P([0, 0, 0]);
            const pos = P(e);
            const neg = P(e.map((c) => -c * 0.55));
            const lab = P(e.map((c) => c * 1.1));
            return (
              <g key={k}>
                {negAxes && (
                  <line
                    x1={o[0]}
                    y1={o[1]}
                    x2={neg[0]}
                    y2={neg[1]}
                    stroke="#9ca3af"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                )}
                <line x1={o[0]} y1={o[1]} x2={pos[0]} y2={pos[1]} stroke="#6b7280" strokeWidth="1.5" />
                {ticks &&
                  Array.from({ length: Math.floor(lens[k]) }, (_, i) => i + 1).map((i) => {
                    const q = [0, 0, 0];
                    q[k] = i;
                    const [tx, ty] = P(q);
                    return <circle key={i} cx={tx} cy={ty} r="2" fill="#6b7280" />;
                  })}
                <text
                  x={lab[0]}
                  y={lab[1] + 5}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="15"
                  fontStyle="italic"
                  fontFamily="KaTeX_Math, Georgia, serif"
                >
                  {axisLabels[k]}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {typeof children === 'function' ? children(s) : children}
    </svg>
  );
}

const ID = { px: (x) => x, py: (y) => y };

/** An arrow between two points of space (see Arrow in Plane.jsx for the options). */
export function Arrow3({ s, from = [0, 0, 0], to, ...rest }) {
  return <Arrow p={ID} from={s.P(from)} to={s.P(to)} {...rest} />;
}

/** A straight segment between two points of space. */
export function Seg3({ s, from, to, color = '#6b7280', width = 1.5, dashed = false, ...rest }) {
  const a = s.P(from);
  const b = s.P(to);
  return (
    <line
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? '6 5' : undefined}
      {...rest}
    />
  );
}

/** A filled dot at a point of space. */
export function Dot3({ s, at, color = '#111827', r = 5, ...rest }) {
  const [x, y] = s.P(at);
  return <circle cx={x} cy={y} r={r} fill={color} {...rest} />;
}

/** A text label at a point of space, nudged by `dx`/`dy` pixels. */
export function Label3({
  s,
  at,
  dx = 0,
  dy = 0,
  color = '#111827',
  size = 18,
  italic = true,
  children,
  ...rest
}) {
  const [x, y] = s.P(at);
  return (
    <text
      x={x + dx}
      y={y + dy}
      fill={color}
      fontSize={size}
      fontWeight="700"
      fontStyle={italic ? 'italic' : 'normal'}
      fontFamily={italic ? 'KaTeX_Math, Georgia, serif' : 'KaTeX_Main, Georgia, serif'}
      {...rest}
    >
      {children}
    </text>
  );
}

/** A polygon through points of space (a patch of a plane, a triangle, ...). */
export function Patch3({
  s,
  corners,
  fill = '#0e7490',
  opacity = 0.16,
  stroke = '#0e7490',
  strokeWidth = 1.2,
  strokeOpacity = 0.6,
  ...rest
}) {
  const pts = corners.map((c) => s.P(c).map((v) => v.toFixed(1)).join(',')).join(' ');
  return (
    <polygon
      points={pts}
      fill={fill}
      fillOpacity={opacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      strokeLinejoin="round"
      {...rest}
    />
  );
}

/** The point P + t e + t' e'. */
export const at = (P, e, e2, t, t2 = 0) => P.map((c, i) => c + t * e[i] + t2 * e2[i]);

/**
 * The parallelogram patch of the plane P + t e + t' e' for t in `range` and
 * t' in `range2`.
 */
export function PlanePatch({ s, P, e, e2, range = [-1, 1], range2 = range, ...rest }) {
  const [a, b] = range;
  const [c, d] = range2;
  const corners = [at(P, e, e2, a, c), at(P, e, e2, b, c), at(P, e, e2, b, d), at(P, e, e2, a, d)];
  return <Patch3 s={s} corners={corners} {...rest} />;
}

/**
 * Grid lines t = const and t' = const on the plane P + t e + t' e', one per
 * integer in the ranges.
 */
export function PlaneGrid({ s, P, e, e2, range = [-2, 2], range2 = range, color = '#9ca3af', width = 0.8 }) {
  const ints = ([a, b]) => {
    const out = [];
    for (let k = Math.ceil(a); k <= Math.floor(b); k += 1) out.push(k);
    return out;
  };
  return (
    <g stroke={color} strokeWidth={width} opacity="0.8">
      {ints(range).map((t) => (
        <Seg3 key={`t${t}`} s={s} from={at(P, e, e2, t, range2[0])} to={at(P, e, e2, t, range2[1])} color={color} width={width} />
      ))}
      {ints(range2).map((t) => (
        <Seg3 key={`u${t}`} s={s} from={at(P, e, e2, range[0], t)} to={at(P, e, e2, range[1], t)} color={color} width={width} />
      ))}
    </g>
  );
}

/**
 * The small square marking a right angle at `corner`, between the directions
 * `a` and `b` (vectors of space), with sides `size` space units long.
 */
export function RightAngle3({ s, corner, a, b, size = 0.28, color = '#6b7280', ...rest }) {
  const norm = (v) => Math.hypot(...v) || 1;
  const ua = a.map((c) => (c / norm(a)) * size);
  const ub = b.map((c) => (c / norm(b)) * size);
  const p1 = corner.map((c, i) => c + ua[i]);
  const p2 = corner.map((c, i) => c + ua[i] + ub[i]);
  const p3 = corner.map((c, i) => c + ub[i]);
  const d = [p1, p2, p3].map((q, i) => `${i ? 'L' : 'M'} ${s.P(q).map((v) => v.toFixed(1)).join(' ')}`).join(' ');
  return <path d={d} fill="none" stroke={color} strokeWidth="1.6" {...rest} />;
}
