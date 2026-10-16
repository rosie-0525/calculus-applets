import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3, PlanePatch } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import { I, MAIN } from '../components/svgmath.jsx';

export const INK = '#14213d';
export const PLANE = '#f2c14e';
export const LINE = '#d99a1e'; // the tangent line, in the tangent plane's gold
export const CURVE = '#0e7490';
export const GRAY = '#6b7280';
// one variable: g(x) = 0.09 (x − 1)² + 0.5 at a = 4, where g(a) = 1.31 and g′(a) = 0.54
export const g = (x) => 0.09 * (x - 1) ** 2 + 0.5;
export const GA = 4;
export const gLine = (x) => g(GA) + 0.18 * (GA - 1) * (x - GA);
export const GX = [-0.3, 6.3];
export const GY = [-0.3, 3.1];
// the textbook's Example 11.1.2 and Figure 11.1.2: f(x, y) = x² + 2y² + xy at a = (1, 1)
export const f = (x, y) => x * x + 2 * y * y + x * y;
export const A = [1, 1];
export const tangent = (x, y) => 4 + 3 * (x - 1) + 5 * (y - 1);
export const Z = 0.11;
export const R = [-1.2, 2.2];
export const FLOOR = -1.2;

/** The graph of a function of one variable and its tangent line at (a, f(a)). */
export function TangentLineFigure() {
  return (
    <Plane xRange={GX} yRange={GY} unit={61} pad={18} xTicks={[]} yTicks={[]} grid={false} axisLabels={['x', 'y']} title="The graph of a function f of one variable and its tangent line at the point (a, f(a))">
      {(p) => {
        const N = 80;
        const d = Array.from({ length: N + 1 }, (_, k) => GX[0] + 0.1 + ((GX[1] - GX[0] - 0.2) * k) / N)
          .map((x, k) => `${k ? 'L' : 'M'}${p.px(x).toFixed(1)},${p.py(g(x)).toFixed(1)}`)
          .join(' ');
        const [x1, x2] = [GA - 1.9, GA + 1.7];
        return (
          <g>
            <path d={d} fill="none" stroke={CURVE} strokeWidth="3.5" strokeLinecap="round" />
            <line x1={p.px(x1)} y1={p.py(gLine(x1))} x2={p.px(x2)} y2={p.py(gLine(x2))} stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
            <line x1={p.px(GA)} y1={p.py(0)} x2={p.px(GA)} y2={p.py(g(GA))} stroke={GRAY} strokeWidth="1.8" strokeDasharray="0.1 6" strokeLinecap="round" />
            <Dot p={p} at={[GA, 0]} color={INK} r={4.5} />
            <text x={p.px(GA)} y={p.py(0) + 24} textAnchor="middle" fontSize="19" fontFamily={MAIN} fill={INK}>
              <I>a</I>
            </text>
            <Dot p={p} at={[GA, g(GA)]} color={INK} r={6} stroke="#fff" strokeWidth="1.5" />
            <text x={p.px(GA) - 12} y={p.py(g(GA)) - 14} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={INK}>
              (<I>a</I>, <I>f</I>(<I>a</I>))
            </text>
            <text x={p.px(5.6)} y={p.py(2.95)} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={CURVE}>
              <I>y</I> = <I>f</I>(<I>x</I>)
            </text>
            <text x={p.px(4.55)} y={p.py(1.15)} textAnchor="start" fontSize="19" fontFamily={MAIN} fill={LINE}>
              <I>y</I> = <I>L</I>(<I>x</I>)
            </text>
          </g>
        );
      }}
    </Plane>
  );
}

/** The graph of f and its tangent plane at (1, 1, 4). */
export function TangentFigure() {
  return (
    <Space width={440} height={350} unit={56} center={[0.5, 0.58]} axes={false} az={135} el={22} swing={10} title="The graph of f(x, y) = x² + 2y² + xy and its tangent plane at the point (1, 1, 4)">
      {(s) => {
        const [px, py] = s.P([...A, Z * f(...A)]);
        const [fx, fy] = s.P([R[1], R[1], Z * f(R[1], R[1])]); // the graph's highest corner
        const [lx, ly] = s.P([-0.2, -0.2, Z * tangent(-0.2, -0.2)]); // the plane's lowest corner
        return (
          <g>
            <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
            <Surface
              s={s}
              f={f}
              x={R}
              y={R}
              n={30}
              zScale={Z}
              mesh="rgba(15, 40, 50, 0.16)"
              patches={[{ f: tangent, x: [-0.2, 2.2], y: [-0.2, 2.2], n: 12, fill: PLANE, opacity: 0.82, stroke: 'rgba(120, 90, 20, 0.25)' }]}
            />
            <Dot3 s={s} at={[...A, Z * f(...A)]} color={INK} r={6} stroke="#fff" strokeWidth="1.5" />
            <text x={px - 12} y={py - 14} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={INK} className="map-label">
              (<I>a</I>, <I>b</I>, <I>f</I>(<I>a</I>, <I>b</I>))
            </text>
            <text x={fx + 14} y={fy + 6} textAnchor="start" fontSize="19" fontFamily={MAIN} fill={CURVE}>
              <I>z</I> = <I>f</I>(<I>x</I>, <I>y</I>)
            </text>
            <text x={lx + 16} y={ly + 6} textAnchor="start" fontSize="19" fontFamily={MAIN} fill={LINE}>
              <I>z</I> = <I>L</I>(<I>x</I>, <I>y</I>)
            </text>
          </g>
        );
      }}
    </Space>
  );
}

/**
 * The formula f(…) ≈ L(…), f in the graph's blue and L in the tangent's gold, with a brace under
 * L(…) that waits for the key press of its marker (`data-fx`, .l10-la-brace in deck.css).
 */
export function Approx({ tex, brace, label, at }) {
  return (
    <>
      <span className="fragment fx-marker" data-fragment-index={at} data-fx={brace} aria-hidden="true" />
      <Tex
        display
        className={`l10-la-${brace}`}
        tex={r`\textcolor{${CURVE}}{${tex[0]}}\approx\htmlClass{l10-la-brace}{\textcolor{${LINE}}{\underbrace{${tex[1]}}_{\htmlClass{l10-la-label}{${label}}}}}`}
      />
    </>
  );
}

/**
 * Linear approximation, after the slide that defines it (Mark's definition is at the end of
 * Slide03Steps.jsx), one variable first, each case beside its picture: for f(x), near a, f(x) in the
 * graph's blue and the rest in the tangent line's gold; key press 1: a brace under it, L(x), a line;
 * 2: the graph of L(x) is the tangent line (a graph and its tangent line y = L(x)); 3: for f(x, y), written
 * out, coloured the same; 4: a brace, L(x, y), a plane; 5: the graph of L(x, y) is the tangent plane (the
 * picture: the textbook's f(x, y) = x² + 2y² + xy at (1, 1), its Figure 11.1.2, with z = f(x, y) and
 * z = L(x, y)).
 */
export default function Slide05LinearApprox() {
  return (
    <section className="dense">
      <h2>Linear approximation</h2>

      {/* two rows, one variable then two: the text, and its picture on the right */}
      <div className="l10-la">
        <div className="stage-text">
          <p>
            For <Tex tex="f(x)" />, near <Tex tex="a" />:
          </p>
          <Approx tex={[r`f(x)`, r`f(a)+f'(a)(x-a)`]} brace="b1" label={r`L(x)\text{, a line}`} at={1} />
          <Fragment index={2} as="p">
            The graph of <Tex tex="L(x)" /> is the <strong>tangent line</strong> to the graph of <Tex tex="f" /> at <Tex tex="(a,f(a))" />.
          </Fragment>
        </div>
        <Fragment index={2} as="div" className="l10-la-fig">
          <TangentLineFigure />
        </Fragment>

        <div className="stage-text">
          <Fragment index={3}>
            <p>
              For <Tex tex="f(x,y)" />, near <Tex tex="(a,b)" />:
            </p>
            <Approx tex={[r`f(x,y)`, r`f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)`]} brace="b2" label={r`L(x,y)\text{, a plane}`} at={4} />
          </Fragment>
          <Fragment index={5} as="p">
            The graph of <Tex tex="L(x,y)" /> is the <strong>tangent plane</strong> to the graph of <Tex tex="f" /> at <Tex tex="(a,b,f(a,b))" />.
          </Fragment>
        </div>
        <Fragment index={5} as="div" className="l10-la-fig">
          <TangentFigure />
        </Fragment>
      </div>
    </section>
  );
}
