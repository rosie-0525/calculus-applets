import { useRef } from 'react';
import Plane, { Arrow } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import { I, B, Sub, MAIN } from './svgmath.jsx';
import { useFragmentShown, useTween, useLoopTween } from './useFragmentTween.js';
import { PRINT } from './print.js';

export const INK = '#14213d';
export const RED = '#8c1515';
export const AMBER = '#c2702a'; // a warmer, quieter tint for f(e₁), f(e₂) (The columns of A)
export const BLUE = '#3b6ea8';
const GRAY = '#d9dde3';

// the textbook's Example 13.4.6 and Figure 13.4.1: f(x) = Ax with A = [3 3/2; 1 2]
export const A = [
  [3, 1.5],
  [1, 2],
];
const f = ([x, y]) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
const X = [-4.8, 4.8];
const Y = [-3.3, 3.3];
const KS = [-1, 0, 1]; // the blue grid: the image of the square [−1, 1]², lines a unit apart

/** The polyline of a list of points. */
const pts = (p, qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');

/** A label in KaTeX's fonts. */
function L({ p, at, dx = 0, dy = 0, anchor = 'middle', color = INK, opacity = 1, children }) {
  return (
    <text
      x={p.px(at[0]) + dx}
      y={p.py(at[1]) + dy}
      textAnchor={anchor}
      fontSize="21"
      fontFamily={MAIN}
      fill={color}
      opacity={opacity}
      className="map-label"
    >
      {children}
    </text>
  );
}

/**
 * The textbook's Figure 13.4.1: the gray square grid with e₁, e₂ and the unit square, and its image
 * under f(x) = Ax, A = [3 3/2; 1 2] (the blue grid, the image of [−1, 1]², and the image of the unit
 * square), with f(e₁) and f(e₂), the columns of A, in red. With `imageIndex`, the image comes on
 * that key press (otherwise it is there from the start); with `morph` too, it comes as the square
 * grid itself and stretches onto the image: each point v at (1 − s)v + s·Av, s gliding from 0 to 1,
 * so the unit square, e₁ and e₂ become the parallelogram, f(e₁) and f(e₂), whose labels come when
 * it lands (print mode: the image as it ends up); with `repeat` (ms), it holds that long once
 * landed, then starts again from the square. `unit`: pixels per unit (50: 504 × 354); `tint`: the
 * color of f(e₁) and f(e₂) (red by default).
 */
export default function GridMap({ imageIndex, unit = 50, morph = false, repeat, tint = RED }) {
  const marker = useRef(null);
  const on = useFragmentShown(marker);
  const once = useTween(on && !repeat, { ms: 2200, delay: 500 });
  const looped = useLoopTween(on && !!repeat, {
    ms: 2200,
    delay: 600,
    hold: repeat,
    live: () => !!marker.current?.closest('section')?.classList.contains('present'),
  });
  const t = repeat ? looped : once;
  const moving = morph && imageIndex != null && !PRINT;
  const s = moving ? t : 1;
  const g = (v) => {
    const w = f(v);
    return [v[0] + s * (w[0] - v[0]), v[1] + s * (w[1] - v[1])];
  };
  const landed = Math.min(1, Math.max(0, (s - 0.85) / 0.15)); // the labels f(e₁), f(e₂)
  const image = (p) => (
    <g>
      <polygon points={pts(p, [[0, 0], g([1, 0]), g([1, 1]), g([0, 1])])} fill="rgba(59, 110, 168, 0.16)" />
      <g stroke={BLUE} strokeWidth="1.8" fill="none">
        {KS.map((k) => (
          <g key={k}>
            <polyline points={pts(p, [g([k, -1]), g([k, 1])])} />
            <polyline points={pts(p, [g([-1, k]), g([1, k])])} />
          </g>
        ))}
      </g>
      <Arrow p={p} to={g([1, 0])} color={tint} width={3.6} />
      <Arrow p={p} to={g([0, 1])} color={tint} width={3.6} />
      <L p={p} at={g([1, 0])} dx={12} dy={8} anchor="start" color={tint} opacity={landed}>
        <I>f</I>(<B>e</B>
        <Sub>1</Sub>)
      </L>
      <L p={p} at={g([0, 1])} dy={-14} color={tint} opacity={landed}>
        <I>f</I>(<B>e</B>
        <Sub>2</Sub>)
      </L>
    </g>
  );
  return (
    <>
      {moving && <span ref={marker} className="fragment fx-marker" data-fragment-index={imageIndex} aria-hidden="true" />}
      <Plane xRange={X} yRange={Y} unit={unit} pad={12} grid={false} axes={false} title="A square grid with e1 and e2, and its image under f(x) = Ax for A = [3 3/2; 1 2], a grid of parallelograms with f(e1) = (3, 1) and f(e2) = (3/2, 2)">
        {(p) => (
          <g>
            <g stroke={GRAY} strokeWidth="1.2">
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => (
                <line key={`v${k}`} x1={p.px(k)} y1={p.py(Y[0])} x2={p.px(k)} y2={p.py(Y[1])} />
              ))}
              {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
                <line key={`h${k}`} x1={p.px(X[0])} y1={p.py(k)} x2={p.px(X[1])} y2={p.py(k)} />
              ))}
            </g>
            <rect x={p.px(0)} y={p.py(1)} width={p.px(1) - p.px(0)} height={p.py(0) - p.py(1)} fill="rgba(107, 114, 128, 0.22)" />
            {imageIndex == null ? (
              image(p)
            ) : (
              <Fragment as="g" index={imageIndex}>
                {image(p)}
              </Fragment>
            )}
            <Arrow p={p} to={[1, 0]} color={INK} width={3.6} />
            <Arrow p={p} to={[0, 1]} color={INK} width={3.6} />
            <L p={p} at={[1, 0]} dx={-4} dy={26}>
              <B>e</B>
              <Sub>1</Sub>
            </L>
            <L p={p} at={[0, 1]} dx={-10} dy={8} anchor="end">
              <B>e</B>
              <Sub>2</Sub>
            </L>
            <circle cx={p.px(0)} cy={p.py(0)} r="4.5" fill={INK} />
          </g>
        )}
      </Plane>
    </>
  );
}
