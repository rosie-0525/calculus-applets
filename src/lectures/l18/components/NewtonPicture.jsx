import Plane, { Dot } from './Plane.jsx';
import TexSvg from './TexSvg.jsx';
import { r } from './Tex.jsx';
import { sample, levelSegments, segmentsPath } from './levels.js';
import { INK, RED, BLUE, AMBER, f1, ZERO, ZERO2 } from './inv.js';
import { XR, YR, NUNIT } from './basins.js';
import { Sub, B, MAIN } from './svgmath.jsx';

// the window, in basins.js (scripts/basins.mjs draws More steps' regions for it)
export { XR, YR };
// f₁ = 0, and f₂ = y(x² + xy − 1) = 0: the x-axis and the curve x² + xy = 1
const SEG1 = levelSegments(sample(f1, XR, YR, 180), 0);
const SEG2 = levelSegments(sample((x, y) => x * x + x * y - 1, XR, YR, 180), 0);

/** a_k: a dot and its name. */
export function Point({ p, at, k, color = INK, dx = 10, dy = -10 }) {
  return (
    <g>
      <Dot p={p} at={at} color={color} r={6} />
      <text x={p.px(at[0]) + dx} y={p.py(at[1]) + dy} fontSize="22" fontFamily={MAIN} fill={color} fontWeight="700" className="l18-halo">
        <B>a</B>
        <Sub>{k}</Sub>
      </text>
    </g>
  );
}

/**
 * Newton's method for f(x, y) = (x³ + xy + 2y³ − 3, x²y + xy² − y) (Example 5): the faint grid and
 * axes, the curves f₁ = 0 (blue) and f₂ = 0 (amber), and where they cross, the zeros of f (red
 * rings; `name` labels the one Example 5 finds). `under(p)` draws under the curves (More steps'
 * regions and the curve det (Df) = 0), `children(p)` on top; `onPick(q)`, if given, is called with
 * the point clicked.
 */
export default function NewtonPicture({ unit = NUNIT, curves = true, name = true, onPick, under, children }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={unit} pad={8} grid={false} axes={false} title="The curves f₁ = 0 and f₂ = 0, crossing at the zeros of f">
      {(p) => (
        <g>
          <g stroke="#eef0f3" strokeWidth="1">
            {[0, 0.5, 1, 1.5].map((k) => (
              <g key={k}>
                <line x1={p.px(k)} y1={p.py(YR[0])} x2={p.px(k)} y2={p.py(YR[1])} />
                <line x1={p.px(XR[0])} y1={p.py(k)} x2={p.px(XR[1])} y2={p.py(k)} />
              </g>
            ))}
          </g>
          <line x1={p.px(0)} y1={p.py(YR[0])} x2={p.px(0)} y2={p.py(YR[1])} stroke="#c4c9d1" strokeWidth="1.4" />
          {under && <g>{under(p)}</g>}
          {curves && (
            <g fill="none" strokeWidth="3.5" strokeLinecap="round">
              <path d={segmentsPath(SEG1, ([x, y]) => [p.px(x), p.py(y)])} stroke={BLUE} />
              <path d={segmentsPath(SEG2, ([x, y]) => [p.px(x), p.py(y)])} stroke={AMBER} />
              <line x1={p.px(XR[0])} y1={p.py(0)} x2={p.px(XR[1])} y2={p.py(0)} stroke={AMBER} />
              <TexSvg x={p.px(0.1)} y={p.py(1.3)} tex={r`f_1=0`} size={22} color={BLUE} w={90} h={34} className="l18-halo" />
              <TexSvg x={p.px(0.7)} y={p.py(1.42)} tex={r`f_2=0`} size={22} color={AMBER} w={90} h={34} className="l18-halo" />
              <TexSvg x={p.px(-0.12)} y={p.py(0.07)} tex={r`f_2=0`} size={22} color={AMBER} w={90} h={34} className="l18-halo" />
              {[ZERO, ZERO2].map((z, k) => (
                <circle key={k} cx={p.px(z[0])} cy={p.py(z[1])} r={11} fill="none" stroke={RED} strokeWidth="2.6" />
              ))}
              {name && <TexSvg x={p.px(ZERO[0]) + 30} y={p.py(ZERO[1]) - 6} tex={r`\vv a`} size={24} color={RED} w={40} h={34} className="l18-halo" />}
            </g>
          )}
          {/* the svg's own viewport clips what runs off the picture (no clipPath: in print, reveal copies each slide once per key press, and a url(#id) then names a hidden copy on an earlier page) */}
          <g>{children?.(p)}</g>
          {onPick && (
            <rect
              x={0}
              y={0}
              width={p.W}
              height={p.H}
              fill="transparent"
              className="l18-pick"
              data-prevent-swipe
              onPointerDown={(e) => {
                const svg = e.currentTarget.ownerSVGElement;
                const pt = svg.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                const q = pt.matrixTransform(svg.getScreenCTM().inverse());
                onPick([XR[0] + (q.x - p.px(XR[0])) / unit, YR[0] + (p.py(YR[0]) - q.y) / unit]);
              }}
            />
          )}
        </g>
      )}
    </Plane>
  );
}
