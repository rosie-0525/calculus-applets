import { useEffect, useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import { Arrow, RightAngle } from './Plane.jsx';
import { NamedPoint, PURPLE, INK } from './Example1.jsx';
import { B, I, MAIN } from './svgmath.jsx';
import { PRINT } from './print.js';

/**
 * A curve g = c with a point a on it, ∇g(a) and the tangent line at a: MovingPoint is used on Recall:
 * Gradient is perpendicular to the level curves (on Example 1's picture, CurveMap.jsx) and on When
 * ∇g(a) = 0 (moved by sliders); CirclePicture, a going round the circle by itself, only on the
 * commented-out Tangent line to the curve g=c.
 */

/** A picture of the plane, [x0, x1] × [y0, y1] fitted into w × h, with faint axes; `children(p)` draws on it. */
export function Panel({ range: [x0, x1, y0, y1], w, h, title, svgRef, children }) {
  const pad = 12;
  const s = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
  const cx = w / 2 - (s * (x0 + x1)) / 2;
  const cy = h / 2 + (s * (y0 + y1)) / 2;
  const p = { px: (x) => cx + s * x, py: (y) => cy - s * y };
  return (
    <svg ref={svgRef} className="figure-svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={title}>
      <g stroke="#d1d5db" strokeWidth="1">
        <line x1={p.px(x0)} y1={p.py(0)} x2={p.px(x1)} y2={p.py(0)} />
        <line x1={p.px(0)} y1={p.py(y0)} x2={p.px(0)} y2={p.py(y1)} />
      </g>
      {children(p)}
    </svg>
  );
}

export const path = (p, pts) => pts.map(([x, y], k) => `${k ? 'L' : 'M'}${p.px(x).toFixed(1)},${p.py(y).toFixed(1)}`).join(' ');
export const sample = (f, a, b, n = 120) => Array.from({ length: n + 1 }, (_, k) => f(a + ((b - a) * k) / n));

const clamp = (v) => Math.min(1, Math.max(0, v));

/**
 * The seconds the slide of `ref` has been showing, counted from 0 on its first showing; 0 for good
 * in print mode (a still) and with reduced motion.
 */
export function useClock(ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (PRINT || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let id;
    let last = null;
    let total = 0;
    const tick = (now) => {
      const on = ref.current?.closest('section')?.classList.contains('present');
      if (on && last !== null) {
        total += Math.min(0.1, (now - last) / 1000);
        setT(total);
      }
      last = on ? now : null;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [ref]);
  return t;
}


/**
 * The point a of a curve g = c, with ∇g(a) (in purple, drawn `scale` times its length) and the
 * tangent line at a (dashed, `reach` each way) at a right angle to it; `fn` and `color` name and
 * colour another function (f, in red, for a level curve of f), and `name` the point; `turn` turns
 * the name's direction from a by that many degrees (to keep two names apart). As ∇g(a) shrinks to 0 they
 * fade out and "∇g(a) = 0" fades in, at `zero` (pixels from a). The name a sits on the side of a
 * away from ∇g(a), or, as ∇g(a) shrinks to 0, at `rest` (pixels from a, the centre of the letter).
 */
export function MovingPoint({ p, a, grad, scale, reach, zero = [12, 24], rest = [0, 18], fn = 'g', color = PURPLE, name = 'a', turn = 0 }) {
  const ax = p.px(a[0]);
  const ay = p.py(a[1]);
  const tip = [a[0] + scale * grad[0], a[1] + scale * grad[1]];
  const dx = p.px(tip[0]) - ax;
  const dy = p.py(tip[1]) - ay;
  const len = Math.hypot(dx, dy); // ∇g(a) on the picture, in pixels
  const u = len > 1e-9 ? [dx / len, dy / len] : [0, 0];
  const g = Math.hypot(grad[0], grad[1]);
  const dir = g > 1e-12 ? [-grad[1] / g, grad[0] / g] : [0, 0]; // the tangent line's direction
  const lineOn = clamp((len - 2) / 10);
  const labelOn = clamp((len - 14) / 16);
  const zeroOn = 1 - clamp(len / 6);
  const w = clamp(len / 12);
  const c = Math.cos((turn * Math.PI) / 180);
  const sn = Math.sin((turn * Math.PI) / 180);
  const away = [-(c * u[0] - sn * u[1]), -(sn * u[0] + c * u[1])];
  const nx = w * (ax + 17 * away[0]) + (1 - w) * (ax + rest[0]);
  const ny = w * (ay + 17 * away[1]) + (1 - w) * (ay + rest[1]);
  const off = 12 + 22 * Math.abs(u[0]);
  return (
    <g>
      {lineOn > 0 && (
        <g opacity={lineOn}>
          <line
            x1={p.px(a[0] - reach * dir[0])}
            y1={p.py(a[1] - reach * dir[1])}
            x2={p.px(a[0] + reach * dir[0])}
            y2={p.py(a[1] + reach * dir[1])}
            stroke={INK}
            strokeWidth="1.8"
            strokeDasharray="6 5"
          />
          <RightAngle p={p} at={a} a={[a[0] + dir[0], a[1] + dir[1]]} b={tip} color={INK} size={Math.min(12, 0.5 * len)} />
          <Arrow p={p} from={a} to={tip} color={color} width={3.2} head={Math.min(12, 0.6 * len)} />
        </g>
      )}
      {labelOn > 0 && (
        <text x={p.px(tip[0]) + off * u[0]} y={p.py(tip[1]) + off * u[1] + 6} textAnchor="middle" fontSize="18" fontFamily={MAIN} fill={color} className="map-label" opacity={labelOn}>
          ∇<I>{fn}</I>(<B>{name}</B>)
        </text>
      )}
      <NamedPoint p={p} at={a} />
      <text x={nx} y={ny + 6} textAnchor="middle" fontSize="19" fontFamily={MAIN} fill={INK} className="map-label">
        <B>{name}</B>
      </text>
      {zeroOn > 0 && (
        <text x={ax + zero[0]} y={ay + zero[1]} fontSize="18" fontFamily={MAIN} fill={color} className="map-label" opacity={zeroOn}>
          ∇<I>{fn}</I>(<B>{name}</B>) = <B>0</B>
        </text>
      )}
    </g>
  );
}

const CIRCLE = sample((t) => [Math.cos(t), Math.sin(t)], 0, 2 * Math.PI, 160);
const T0 = (40 * Math.PI) / 180; // where a starts (the still of print mode)

/**
 * The circle x² + y² = 1, g = c, with a point a going round it once every `period` seconds, ∇g(a) = 2a
 * (drawn at 0.4 times its length) and the tangent line at a; its equation under it.
 */
export function CirclePicture({ period = 12 }) {
  const ref = useRef(null);
  const t = useClock(ref);
  const th = T0 + (2 * Math.PI * t) / period;
  const a = [Math.cos(th), Math.sin(th)];
  return (
    <>
      <Panel range={[-2.1, 2.1, -2.1, 2.1]} w={460} h={440} svgRef={ref} title="The circle g = c, a point a going round it, the gradient of g at a, and the tangent line at a, perpendicular to it">
        {(p) => (
          <g>
            <path d={path(p, CIRCLE)} fill="none" stroke={PURPLE} strokeWidth="2.6" />
            <text x={p.px(-0.78)} y={p.py(-0.95)} textAnchor="end" fontSize="18" fontFamily={MAIN} fill={PURPLE} className="map-label">
              <I>g</I> = <I>c</I>
            </text>
            <MovingPoint p={p} a={a} grad={[2 * a[0], 2 * a[1]]} scale={0.4} reach={0.95} />
          </g>
        )}
      </Panel>
      <figcaption>
        <Tex tex={r`x^2+y^2=1`} />
      </figcaption>
    </>
  );
}
