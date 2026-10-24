import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { INK, tileFill, svgPoint } from '../components/SquareMap.jsx';
import { C1, C2 } from '../components/LinearityMap.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { MAIN } from '../components/svgmath.jsx';

export const S_LINE = '#ec9a52'; // f(S) once it is a segment (S's orange, a shade darker)
export const UNIT = 85;
export const Y = [-0.5, 2.3];
export const X_LEFT = [-0.5, 1.6];
export const X_RIGHT = [-0.55, 3.45];
// f(e₁) stays put; f(e₂) swings from a vector of its own onto 2 f(e₁)
export const FE1 = [1, 0.5];
export const FE2_FROM = [0.6, 1.6];
export const FE2_TO = [2 * FE1[0], 2 * FE1[1]];
export const fe2 = (t) => [FE2_FROM[0] + t * (FE2_TO[0] - FE2_FROM[0]), FE2_FROM[1] + t * (FE2_TO[1] - FE2_FROM[1])];
export const RANGE = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
export const S_POINT = [0.62, 0.38]; // s on arrival (and in print), inside S
export const POINT_INDEX = 2; // s and f(s)
export const SEGMENT_INDEX = 3; // f(S)
export const clamp01 = (t) => Math.max(0, Math.min(1, t));

export const pts = (p, qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');
export const square = (k, l) => [
  [k, l],
  [k + 1, l],
  [k + 1, l + 1],
  [k, l + 1],
];

/**
 * The point at `at`, labelled with `children` (a bold s, or f(s)) in a white halo, up and to the
 * right of it (`left`: up and to the left, off the line f(e₁), f(e₂) lie on).
 */
export function Point({ p, at, left = false, children }) {
  return (
    <>
      <Dot p={p} at={at} color={INK} r={5.5} />
      <text
        x={p.px(at[0]) + (left ? -10 : 10)}
        y={p.py(at[1]) - (left ? 12 : 10)}
        textAnchor={left ? 'end' : 'start'}
        fontSize="21"
        fill={INK}
        stroke="#fff"
        strokeWidth="4"
        strokeOpacity="0.85"
        paintOrder="stroke"
      >
        {children}
      </text>
    </>
  );
}

export const BOLD_S = (
  <tspan fontFamily={MAIN} fontWeight="700">
    s
  </tspan>
);

/**
 * One panel of the picture: the tiling by copies of S through the linear map with a, b the images
 * of e₁, e₂ (S's image outlined), then `extra(p)`, the arrows a and b, `labels(p)` and `front(p)`.
 */
export function Panel({ xRange, a, b, extra, labels, front, title }) {
  const g = ([x, y]) => [x * a[0] + y * b[0], x * a[1] + y * b[1]];
  return (
    <Plane xRange={xRange} yRange={Y} unit={UNIT} pad={12} grid={false} axes={false} title={title}>
      {(p) => (
        <g>
          {RANGE.flatMap((k) =>
            RANGE.map((l) => <polygon key={`${k},${l}`} points={pts(p, square(k, l).map(g))} fill={tileFill(k, l)} stroke="#fff" strokeWidth="2" />),
          )}
          <polygon points={pts(p, square(0, 0).map(g))} fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          {extra?.(p)}
          <Arrow p={p} to={b} color={C2} width={3.4} />
          <Arrow p={p} to={a} color={C1} width={3.4} />
          <circle cx={p.px(0)} cy={p.py(0)} r="4.5" fill={INK} />
          {labels(p)}
          {front?.(p)}
        </g>
      )}
    </Plane>
  );
}

/**
 * The tiling by copies of S, with e₁ and e₂; from key press POINT_INDEX, a point s of S, which the
 * presenter drags anywhere on the panel (it stays in S).
 */
export function Source({ s, setS }) {
  const [grab, setGrab] = useState(false);
  return (
    <Panel
      xRange={X_LEFT}
      a={[1, 0]}
      b={[0, 1]}
      title="The tiling by copies of the unit square S, with a point s of S"
      labels={(p) => (
        <g>
          <TexSvg x={p.px(1) + 6} y={p.py(0) + 22} anchor="start" tex={r`\vv e_1`} size={21} color={C1} />
          <TexSvg x={p.px(0) - 10} y={p.py(1)} anchor="end" tex={r`\vv e_2`} size={21} color={C2} />
          {/* in S's top-left corner, out of the way of s */}
          <TexSvg x={p.px(0.25)} y={p.py(0.75)} tex="S" size={21} color={INK} />
        </g>
      )}
      front={(p) => {
        const toS = (e) => {
          const [sx, sy] = svgPoint(e.currentTarget.ownerSVGElement, e);
          return [clamp01((sx - p.px(0)) / UNIT), clamp01((p.py(0) - sy) / UNIT)];
        };
        return (
          <Fragment as="g" index={POINT_INDEX}>
            <Point p={p} at={s}>
              {BOLD_S}
            </Point>
            {/* a large invisible target, so the point is easy to grab */}
            <rect
              x={0}
              y={0}
              width={p.W}
              height={p.H}
              fill="transparent"
              className="drag-target"
              data-prevent-swipe
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setGrab(true);
                setS(toS(e));
              }}
              onPointerMove={(e) => grab && setS(toS(e))}
              onPointerUp={() => setGrab(false)}
              onPointerCancel={() => setGrab(false)}
            />
          </Fragment>
        );
      }}
    />
  );
}

/**
 * Its image through f, with f(e₂) at fe2(t); from key press POINT_INDEX, f(s); from SEGMENT_INDEX,
 * f(S), a thick orange segment, once f(e₂) = 2 f(e₁).
 */
export function Image({ t, s }) {
  const b = fe2(t);
  const fs = [s[0] * FE1[0] + s[1] * b[0], s[0] * FE1[1] + s[1] * b[1]];
  return (
    <Panel
      xRange={X_RIGHT}
      a={FE1}
      b={b}
      title="Its image through f"
      extra={(p) => (
        <g>
          {/* f(S), the segment from 0 to f(e₁) + f(e₂) */}
          <Fragment as="g" index={SEGMENT_INDEX}>
            <line x1={p.px(0)} y1={p.py(0)} x2={p.px(FE1[0] + b[0])} y2={p.py(FE1[1] + b[1])} stroke={S_LINE} strokeWidth="11" strokeLinecap="round" />
            <TexSvg x={p.px(FE1[0] + b[0]) + 4} y={p.py(FE1[1] + b[1]) + 26} anchor="start" tex="f(S)" size={21} color={INK} />
          </Fragment>
        </g>
      )}
      labels={(p) => (
        <g>
          <TexSvg x={p.px(FE1[0]) + 2} y={p.py(FE1[1]) + 24} anchor="start" tex={r`f(\vv e_1)`} size={21} color={C1} />
          {/* up and to the left of its tip, then, as it swings onto the line, above it (clear of f(s)) */}
          <TexSvg x={p.px(b[0]) - 6 + 32 * t} y={p.py(b[1]) - 18 - 8 * t} anchor="end" tex={r`f(\vv e_2)`} size={21} color={C2} />
        </g>
      )}
      front={(p) => (
        <Fragment as="g" index={POINT_INDEX}>
          <Point p={p} at={fs} left>
            <tspan fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic">
              f
            </tspan>
            ({BOLD_S})
          </Point>
        </Fragment>
      )}
    />
  );
}

/**
 * What if f(e₁) and f(e₂) are scalar multiples of each other? On arrival, the tiling and its image,
 * as on Tiling Principle. Key press 1: f(e₂) swings onto 2 f(e₁), and the parallelograms flatten onto
 * a line; 2: a point s of S and f(s), on that line, for the presenter to drag (the user's request, in
 * place of the bullets f(xe₁ + ye₂) = (x + 2y) f(e₁) and "f(S) does not tile ℝ²"); 3: f(S), a segment
 * (thick, orange). Print mode shows f(e₂) before and after the swing.
 */
export default function Slide02cCollapse() {
  const marker = useRef(null);
  const t = useTween(useFragmentShown(marker), { ms: 2400, delay: 300 });
  const [s, setS] = useState(S_POINT);
  return (
    <section className="dense">
      <h2>
        When <Tex tex={r`f(\vv e_1)`} /> and <Tex tex={r`f(\vv e_2)`} /> are scalar multiples
      </h2>

      <p>
        What if <Tex tex={r`f(\vv e_2)=2f(\vv e_1)`} />, say?
      </p>

      <span ref={marker} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <div className="l14-squaremap l14-collapse-map">
        <Source s={s} setS={setS} />
        <svg className="l14-map-arrow" viewBox="0 0 90 60" width="90" height="60" aria-hidden="true">
          <line x1="8" y1="40" x2="72" y2="40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <polygon points="84,40 70,33 70,47" fill={INK} />
          <text x="45" y="24" textAnchor="middle" fontSize="26" fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic" fill={INK}>
            f
          </text>
        </svg>
        {PRINT ? (
          <div className="l14-collapse-stills">
            <Fragment index={1} effect="fade-out">
              <Image t={0} s={s} />
            </Fragment>
            <Fragment index={1}>
              <Image t={1} s={s} />
            </Fragment>
          </div>
        ) : (
          <Image t={t} s={s} />
        )}
      </div>
    </section>
  );
}
