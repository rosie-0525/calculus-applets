import { useId, useState } from 'react';
import Plane, { Arrow, Dot } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { I, MAIN } from './svgmath.jsx';
import { C1, C2 } from './LinearityMap.jsx';

export const INK = '#14213d';
const DOTS = '#4b5563';

// Mark's picture: f(x) = Ax with A = [a b; c d], columns (a, c) and (b, d) not parallel
const A = [
  [1.7, 0.5],
  [0.6, 1.4],
];
const f = ([x, y]) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
const DET = A[0][0] * A[1][1] - A[0][1] * A[1][0];
const fInv = ([u, v]) => [(A[1][1] * u - A[0][1] * v) / DET, (A[0][0] * v - A[1][0] * u) / DET];
const UNIT = 100;
const Y = [-0.45, 2.42];
const X_LEFT = [-0.55, 1.95];
const X_RIGHT = [-0.5, 3.25];
const S_POINT = [0.62, 0.38]; // s = a e₁ + b e₂ on arrival (and in print), inside S
const clamp01 = (t) => Math.max(0, Math.min(1, t));

// the tiles: S and f(S) orange as in the textbook, S′ (right of S) green, S″ (above S) purple, the
// rest a checkerboard of two pale tints
const S_FILL = '#f2b37a';
export const tileFill = (k, l) => {
  if (k === 0 && l === 0) return S_FILL;
  if (k === 1 && l === 0) return '#a9d8bb';
  if (k === 0 && l === 1) return '#cdb8e8';
  return (k + l) % 2 === 0 ? '#dfe8f3' : '#f1ece2';
};
const RANGE = [-3, -2, -1, 0, 1, 2, 3];

const pts = (p, qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');
const square = (k, l) => [
  [k, l],
  [k + 1, l],
  [k + 1, l + 1],
  [k, l + 1],
];

/** Mouse/touch position in the coordinates of the svg's viewBox. */
export function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}

/** A text label in KaTeX's fonts at a point of the plane. */
function L({ p, at, dx = 0, dy = 0, anchor = 'middle', children }) {
  return (
    <text x={p.px(at[0]) + dx} y={p.py(at[1]) + dy} textAnchor={anchor} fontSize="22" fontFamily={MAIN} fill={INK}>
      {children}
    </text>
  );
}

/**
 * One panel: the tiles through g (the identity on the left, f on the right), with g(s) for the
 * shared point s = (a, b) of S; dragging anywhere on the panel moves it (`inv` takes a point of the
 * panel back to S, and s stays in S).
 */
function Panel({ xRange, g, inv, s, setS, shapeIndex, pointIndex, tilesIndex, arrows, shape, point, formula, title }) {
  const clip = `clip${useId().replace(/:/g, '')}`; // no colons in url(#…)
  const [grab, setGrab] = useState(false);
  return (
    <Plane xRange={xRange} yRange={Y} unit={UNIT} pad={12} grid={false} axes={false} title={title}>
      {(p) => {
        const tile = (k, l) => <polygon key={`${k},${l}`} points={pts(p, square(k, l).map(g))} fill={tileFill(k, l)} stroke="#fff" strokeWidth="2" />;
        const [a, b] = s;
        const at = g(s);
        const toS = (e) => {
          const [sx, sy] = svgPoint(e.currentTarget.ownerSVGElement, e);
          const [u, v] = inv([(sx - p.px(0)) / UNIT, (p.py(0) - sy) / UNIT]);
          return [clamp01(u), clamp01(v)];
        };
        const handlers = {
          onPointerDown: (e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setGrab(true);
            setS(toS(e));
          },
          onPointerMove: (e) => grab && setS(toS(e)),
          onPointerUp: () => setGrab(false),
          onPointerCancel: () => setGrab(false),
        };
        return (
          <g>
            <defs>
              {/* visible even inside a hidden fragment: print mode's copies of the slide all use
                  the first copy's clip path, and a hidden one clips everything away */}
              <clipPath id={clip}>
                <rect x={6} y={6} width={p.W - 12} height={p.H - 12} rx="8" visibility="visible" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clip})`}>
              <Fragment as="g" index={tilesIndex}>
                {RANGE.flatMap((k) => RANGE.filter((l) => k !== 0 || l !== 0).map((l) => tile(k, l)))}
              </Fragment>
              <Fragment as="g" index={shapeIndex}>
                {tile(0, 0)}
              </Fragment>
            </g>
            <Fragment as="g" index={shapeIndex}>
              <polygon points={pts(p, square(0, 0).map(g))} fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
              {shape(p, g)}
            </Fragment>
            {/* s = a e₁ + b e₂: dotted lines from g(s) to a g(e₁) and to b g(e₂) */}
            <Fragment as="g" index={pointIndex}>
              {[g([a, 0]), g([0, b])].map((foot, k) => (
                <polyline
                  key={k}
                  points={pts(p, [at, foot])}
                  fill="none"
                  stroke={DOTS}
                  strokeWidth="2.4"
                  strokeDasharray="0.1 6"
                  strokeLinecap="round"
                />
              ))}
            </Fragment>
            {arrows(p, g)}
            <circle cx={p.px(0)} cy={p.py(0)} r="4.5" fill={INK} />
            <Fragment as="g" index={pointIndex}>
              <Dot p={p} at={at} color={INK} r={5.5} />
              <text x={p.px(at[0]) + 10} y={p.py(at[1]) - 8} fontSize="22" fill={INK}>
                {point}
              </text>
              {formula(p)}
              {/* a large invisible target, so the point is easy to grab */}
              <rect x={0} y={0} width={p.W} height={p.H} fill="transparent" className="drag-target" data-prevent-swipe {...handlers} />
            </Fragment>
          </g>
        );
      }}
    </Plane>
  );
}

/**
 * Mark's picture of f(x) = Ax: e₁, e₂ on the left and Ae₁, Ae₂ on the right (in Example 1's
 * colours), with an arrow f between them. On key press `squareIndex`, the unit square S and its
 * caption; on `imageIndex`, its image f(S), a parallelogram, and its caption; on `pointIndex`, a
 * point s = a e₁ + b e₂ of S and f(s) = a Ae₁ + b Ae₂, each with dotted lines to the two arrows and
 * its formula at the top of its panel, which the presenter can drag (either one, s staying in S);
 * on `tilesIndex`, the Tiling Principle: the tiling by copies of S and its image, the tiling by
 * copies of f(S) (S and f(S) orange, S′ and f(S′) green, S″ and f(S″) purple, as in the textbook's
 * Figure 14.1.4). `captions`, if given, go under the two pictures.
 */
export default function SquareMap({ squareIndex, imageIndex, pointIndex, tilesIndex, captions }) {
  const [s, setS] = useState(S_POINT);
  const id = (v) => v;
  const under = (k, panel) =>
    captions ? (
      <figure className="l14-sq-fig">
        {panel}
        <Fragment as="figcaption" index={k === 0 ? squareIndex : imageIndex}>
          {captions[k]}
        </Fragment>
      </figure>
    ) : (
      panel
    );
  return (
    <div className={`l14-squaremap ${captions ? 'l14-squaremap-captioned' : ''}`.trim()}>
      {under(
        0,
        <Panel
          xRange={X_LEFT}
          g={id}
          inv={id}
          s={s}
          setS={setS}
          shapeIndex={squareIndex}
          pointIndex={pointIndex}
          tilesIndex={tilesIndex}
          title="The unit square S with a point s = a e1 + b e2"
          point={
            <tspan fontFamily={MAIN} fontWeight="700">
              s
            </tspan>
          }
          arrows={(p) => (
            <g>
              <Arrow p={p} to={[1, 0]} color={C1} width={3.4} />
              <Arrow p={p} to={[0, 1]} color={C2} width={3.4} />
              <TexSvg x={p.px(1) + 8} y={p.py(0) + 22} anchor="start" tex={String.raw`\vv e_1`} size={22} color={C1} />
              <TexSvg x={p.px(0) - 10} y={p.py(1)} anchor="end" tex={String.raw`\vv e_2`} size={22} color={C2} />
            </g>
          )}
          shape={(p) => (
            <L p={p} at={[0.5, 0.5]} dx={-20} dy={-6}>
              <I>S</I>
            </L>
          )}
          formula={(p) => (
            <TexSvg
              x={p.px(0.7)}
              y={p.py(2.12)}
              tex={String.raw`\vv s=a\textcolor{${C1}}{\vv e_1}+b\textcolor{${C2}}{\vv e_2}`}
              size={22}
              color={INK}
              w={240}
            />
          )}
        />,
      )}
      <svg className="l14-map-arrow" viewBox="0 0 90 60" width="90" height="60" aria-hidden="true">
        <line x1="8" y1="40" x2="72" y2="40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <polygon points="84,40 70,33 70,47" fill={INK} />
        <text x="45" y="24" textAnchor="middle" fontSize="26" fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic" fill={INK}>
          f
        </text>
      </svg>
      {under(
        1,
        <Panel
          xRange={X_RIGHT}
          g={f}
          inv={fInv}
          s={s}
          setS={setS}
          shapeIndex={imageIndex}
          pointIndex={pointIndex}
          tilesIndex={tilesIndex}
          title="Its image f(S), a parallelogram, with f(s) = a Ae1 + b Ae2"
          point={
            <>
              <I>f</I>(<tspan fontFamily={MAIN} fontWeight="700">s</tspan>)
            </>
          }
          arrows={(p, g) => (
            <g>
              <Arrow p={p} to={g([1, 0])} color={C1} width={3.4} />
              <Arrow p={p} to={g([0, 1])} color={C2} width={3.4} />
              <TexSvg x={p.px(g([1, 0])[0]) + 8} y={p.py(g([1, 0])[1]) + 18} anchor="start" tex={String.raw`A\vv e_1`} size={22} color={C1} />
              <TexSvg x={p.px(g([0, 1])[0]) - 10} y={p.py(g([0, 1])[1])} anchor="end" tex={String.raw`A\vv e_2`} size={22} color={C2} />
            </g>
          )}
          shape={(p, g) => (
            <L p={p} at={g([0.5, 0.5])} dx={-34} dy={-14}>
              <I>f</I>(<I>S</I>)
            </L>
          )}
          formula={(p) => (
            <TexSvg
              x={p.px(-0.38)}
              y={p.py(2.12)}
              anchor="start"
              tex={String.raw`f(\vv s)=a\textcolor{${C1}}{A\vv e_1}+b\textcolor{${C2}}{A\vv e_2}`}
              size={22}
              color={INK}
              w={300}
            />
          )}
        />,
      )}
    </div>
  );
}
