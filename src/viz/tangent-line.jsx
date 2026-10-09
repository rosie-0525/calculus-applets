import { useRef } from 'react';
import '../lectures/l8/styles/deck.css';
import Plane, { Dot, PlaneLabel } from '../lectures/l8/components/Plane.jsx';
import { useSwing, path, f, df, XR, YR, BACK, AHEAD, ALONG, LABEL_W, INK, CARDINAL, TEAL, GRAY } from '../lectures/l8/slides/Slide02Recall.jsx';

export const lecture = 8;

/* The slide's picture without the definition beside it (the caption recalls it): the graph of f,
   the point (c, f(c)) and its tangent line, "slope = f′(c)"; c swings back and forth, through the
   top of the bump, and the tangent line turns with it. */
export default function TangentLine() {
  const ref = useRef(null);
  const c = useSwing(true, ref);
  const fc = f(c);
  const m = df(c);
  const u = [1 / Math.hypot(1, m), m / Math.hypot(1, m)]; // along the tangent line (same unit on both axes)
  const at = (s) => [c + s * u[0], fc + s * u[1]];
  const dotted = { strokeDasharray: '0.1 6', strokeLinecap: 'round' };
  return (
    <figure ref={ref} className="recall-fig">
      <Plane xRange={XR} yRange={YR} unit={90} xTicks={[]} yTicks={[]} grid={false} title="The graph of a function and its tangent line at a point c that moves back and forth">
        {(p) => {
          // "slope = f′(c)", level, on the upper side of the tangent line, as on the slide
          const w = LABEL_W / p.unit;
          const [qx] = at(ALONG);
          const nx = -u[1]; // the upward normal is (−u[1], u[0])
          const X = qx + (10 / p.unit) * nx;
          const left = X - (0.5 - 0.5 * nx) * w;
          const right = left + w;
          const bottom = fc + Math.max(m * (left - c), m * (right - c)) + 6 / p.unit;
          return (
            <g>
              <path d={path(p, f, [0, 4.45])} fill="none" stroke={CARDINAL} strokeWidth="3.5" strokeLinecap="round" />
              <PlaneLabel p={p} at={[4.05, f(4.05) - 0.42]} color={CARDINAL} textAnchor="middle">
                y = f(x)
              </PlaneLabel>

              <path d={`M${p.px(at(-BACK)[0])},${p.py(at(-BACK)[1])} L${p.px(at(AHEAD)[0])},${p.py(at(AHEAD)[1])}`} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
              <text x={p.px((left + right) / 2)} y={p.py(bottom) - 5} fill={TEAL} fontSize="18" fontWeight="700" textAnchor="middle" fontFamily="KaTeX_Main, Georgia, serif">
                slope = <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">f</tspan>
                <tspan dx="1.5" dy="-7" fontSize="13">′</tspan>
                <tspan dy="7">(</tspan>
                <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">c</tspan>)
              </text>

              <line x1={p.px(c)} y1={p.py(0)} x2={p.px(c)} y2={p.py(fc)} stroke={GRAY} strokeWidth="1.8" {...dotted} />
              <Dot p={p} at={[c, 0]} color={INK} r={5} />
              <PlaneLabel p={p} at={[c, 0]} dy={26} color={INK} size={17} textAnchor="middle">
                c
              </PlaneLabel>
              <Dot p={p} at={[c, fc]} color={CARDINAL} r={6.5} stroke="#fff" strokeWidth="1.5" />
              <PlaneLabel p={p} at={[c, fc]} dx={-12} dy={-(10 + Math.max(0, -m) * 80)} color={CARDINAL} size={17} textAnchor="end">
                (c, f(c))
              </PlaneLabel>
            </g>
          );
        }}
      </Plane>
    </figure>
  );
}
