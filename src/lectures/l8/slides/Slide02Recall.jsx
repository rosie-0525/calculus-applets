import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot, PlaneLabel } from '../components/Plane.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const INK = '#14213d';
export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';

// a bump: f rises, bends over and comes down
export const f = (x) => 0.4 + 0.3 * x + 1.6 * Math.exp(-((x - 2.4) ** 2) / 1.4);
export const df = (x) => 0.3 + 1.6 * Math.exp(-((x - 2.4) ** 2) / 1.4) * (-(2 * (x - 2.4)) / 1.4);
// c swings where the graph bends down (it lies under its tangent lines, away from their labels):
export const C0 = 1.55; // c, before it moves (the steepest point, slope 1.46), and one end of the swing
export const C1 = 2.9; // the other end: the slope goes down through 0 to −0.65
export const PERIOD = 9; // seconds, there and back
export const XR = [-0.3, 4.6];
export const YR = [-0.3, 3.4];
export const BACK = 0.8; // the tangent line runs this far left of the point, and AHEAD to the right
export const AHEAD = 1.2;
export const ALONG = 0.75; // the label "slope = f′(c)" sits by the tangent line this far along it from the point
export const LABEL_W = 112; // its width in pixels

export const path = (p, g, [a, b], N = 80) =>
  Array.from({ length: N + 1 }, (_, k) => a + ((b - a) * k) / N)
    .map((x, k) => `${k ? 'L' : 'M'}${p.px(x).toFixed(1)},${p.py(g(x)).toFixed(1)}`)
    .join(' ');

/**
 * c, swinging from C0 to C1 and back (slowing down at the ends) while `on`, and its slide is
 * showing; C0 otherwise, and in print.
 */
export function useSwing(on, ref) {
  const [c, setC] = useState(C0);
  useEffect(() => {
    if (!on || PRINT) {
      setC(C0);
      return undefined;
    }
    let id;
    let t0;
    const tick = (now) => {
      t0 ??= now;
      const t = Math.max(0, now - t0 - 700) / 1000; // the tangent line shows first
      if (ref.current?.closest('section')?.classList.contains('present')) {
        setC(C0 + ((C1 - C0) * (1 - Math.cos((2 * Math.PI * t) / PERIOD))) / 2);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on, ref]);
  return c;
}

/**
 * Single variable function: the derivative (the limit in h). Key press 1: the other notations.
 * 2: (i) the infinitesimal rate of change. 3: (ii) the linear approximation, f(x + h) ≈ f(x) +
 * f′(x) h. 4: (iii) the slope of the tangent line at (c, f(c)), drawn on the picture, labelled
 * "slope = f′(c)" beside the line; c then swings back and forth, the tangent line turning with it.
 */
export default function Slide02Recall() {
  const marker = useRef(null);
  const c = useSwing(useFragmentShown(marker), marker);
  const fc = f(c);
  const m = df(c);
  const u = [1 / Math.hypot(1, m), m / Math.hypot(1, m)]; // along the tangent line (same unit on both axes)
  const at = (s) => [c + s * u[0], fc + s * u[1]];
  const dotted = { strokeDasharray: '0.1 6', strokeLinecap: 'round' };
  return (
    <section className="dense">
      <h2>Single variable function</h2>
      <span ref={marker} className="fragment fx-marker" data-fragment-index={4} aria-hidden="true" />

      <div className="recall-stage">
        <div className="recall-text">
          <div className="block definition">
            <p>
              The <strong>derivative</strong> of <Tex tex={r`f:\mathbb{R}\to\mathbb{R}`} /> at <Tex tex="c" /> is
            </p>
            <Tex display tex={r`f'(c)=\lim_{h\to 0}\frac{f(c+h)-f(c)}{h}.`} />
            <Fragment index={1} as="p">
              Other notations: <Tex tex={r`\dfrac{df}{dx}(c)`} /> or <Tex tex={r`\dfrac{df}{dx}\Big|_{x=c}`} />.
            </Fragment>
          </div>

          <ol className="parts recall-parts">
            <Fragment index={2} as="li">
              <Tex tex="f'(c)" /> measures the <strong>infinitesimal rate of change</strong> of <Tex tex="f" /> with
              respect to <Tex tex="x" />.
            </Fragment>
            <Fragment index={3} as="li">
              <strong>Linear approximation</strong>: <Tex tex={r`f(x+h)\approx f(x)+f'(x)\,h`} /> when{' '}
              <Tex tex="h" /> is small.
            </Fragment>
            <Fragment index={4} as="li">
              <Tex tex="f'(c)" /> is the <strong>slope</strong> of the tangent line at <Tex tex="(c,f(c))" />.
            </Fragment>
          </ol>
        </div>

        <figure className="recall-fig">
          <Plane xRange={XR} yRange={YR} unit={90} xTicks={[]} yTicks={[]} grid={false} title="The graph of a function and its tangent line at a point c that moves back and forth">
            {(p) => {
              // "slope = f′(c)", level, on the upper side of the tangent line (the graph bends away
              // below it): pushed off the line at ALONG along it toward the upward normal (to the
              // left of a steep line, centred over a flat one), and raised until it clears the line
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

                  {/* (ii) the tangent line at c, "slope = f′(c)" above it */}
                  <Fragment as="g" index={4}>
                    <path d={`M${p.px(at(-BACK)[0])},${p.py(at(-BACK)[1])} L${p.px(at(AHEAD)[0])},${p.py(at(AHEAD)[1])}`} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
                    <text x={p.px((left + right) / 2)} y={p.py(bottom) - 5} fill={TEAL} fontSize="18" fontWeight="700" textAnchor="middle" fontFamily="KaTeX_Main, Georgia, serif">
                      slope = <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">f</tspan>
                      <tspan dx="1.5" dy="-7" fontSize="13">′</tspan>
                      <tspan dy="7">(</tspan>
                      <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">c</tspan>)
                    </text>
                  </Fragment>

                  {/* the point c */}
                  <line x1={p.px(c)} y1={p.py(0)} x2={p.px(c)} y2={p.py(fc)} stroke={GRAY} strokeWidth="1.8" {...dotted} />
                  <Dot p={p} at={[c, 0]} color={INK} r={5} />
                  <PlaneLabel p={p} at={[c, 0]} dy={26} color={INK} size={17} textAnchor="middle">
                    c
                  </PlaneLabel>
                  <Dot p={p} at={[c, fc]} color={CARDINAL} r={6.5} stroke="#fff" strokeWidth="1.5" />
                  {/* up and left of the point, raised above the tangent line when it slopes down */}
                  <PlaneLabel p={p} at={[c, fc]} dx={-12} dy={-(10 + Math.max(0, -m) * 80)} color={CARDINAL} size={17} textAnchor="end">
                    (c, f(c))
                  </PlaneLabel>
                </g>
              );
            }}
          </Plane>
        </figure>
      </div>
    </section>
  );
}
