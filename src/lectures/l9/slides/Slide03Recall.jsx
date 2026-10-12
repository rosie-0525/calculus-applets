import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';

export const RED = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';
export const INK = '#14213d';
export const SANS = 'Source Sans Pro, Helvetica, sans-serif';

// f′(x) = x (x + 2)(x − 2)²: a local maximum at −2, a local minimum at 0, and at 2 a critical point
// that is neither (f′ does not change sign there, as for x³ at 0)
export const f = (x) => x ** 5 / 5 - x ** 4 / 2 - (4 * x ** 3) / 3 + 4 * x * x;
export const XR = [-2.75, 3.15];
export const YR = [-5, 14.5];

export const path = (p, [a, b], N = 160) =>
  Array.from({ length: N + 1 }, (_, k) => a + ((b - a) * k) / N)
    .map((t, k) => `${k ? 'L' : 'M'}${p.px(t).toFixed(1)},${p.py(f(t)).toFixed(1)}`)
    .join(' ');

/** The point (c, f(c)) with its horizontal tangent line and a label. */
export function Flat({ p, c, color, label, dy, anchor = 'middle', dx = 0 }) {
  return (
    <g>
      <line x1={p.px(c - 0.7)} x2={p.px(c + 0.7)} y1={p.py(f(c))} y2={p.py(f(c))} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Dot p={p} at={[c, f(c)]} color={color} r={6.5} stroke="#fff" strokeWidth="1.5" />
      <text x={p.px(c) + dx} y={p.py(f(c)) + dy} textAnchor={anchor} fill={color} fontSize="19" fontWeight="700" fontFamily={SANS}>
        {label}
      </text>
    </g>
  );
}

/**
 * Single variable function (recall): the graph of a function with a local maximum, a local minimum
 * and a critical point that is neither, and three bullets. Key press 1: critical points; 2: a local
 * maximum or minimum at c gives f′(c) = 0, so c is a critical point (the two points, with their
 * horizontal tangent lines); 3: not every critical point is a local maximum or minimum (the third
 * point).
 */
export default function Slide03Recall() {
  return (
    <section>
      <h2>Single variable function</h2>

      <div className="stage">
        <ul className="stage-text recall-text bullets">
          <Fragment index={1} as="li">
            We say <Tex tex="c" /> is a <strong>critical point</strong> of <Tex tex="f" /> if <Tex tex="f'(c)=0" />
          </Fragment>
          <Fragment index={2} as="li">
            <Tex tex="f" /> has local maximum/minimum at <Tex tex="c" /> <Tex tex={r`\;\Rightarrow\; f'(c)=0`} />, so{' '}
            <Tex tex="c" /> is a critical point
          </Fragment>
          <Fragment index={3} as="li">
            Not every critical point is a local max/min
          </Fragment>
        </ul>

        <Plane xRange={XR} yRange={YR} unit={[80, 22]} xTicks={[-2, -1, 1, 2, 3]} yTicks={[]} grid={false} title="The graph of a function with a local maximum at −2, a local minimum at 0, and a flat point at 2 that is neither">
          {(p) => (
            <g>
              <path d={path(p, XR)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <text x={p.px(-2.55)} y={p.py(-3.2)} fill={INK} fontSize="20" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
                y = f(x)
              </text>
              <Fragment as="g" index={2}>
                <Flat p={p} c={-2} color={RED} label="local maximum" dy={-16} />
                <Flat p={p} c={0} color={TEAL} label="local minimum" dy={30} dx={14} anchor="start" />
              </Fragment>
              <Fragment as="g" index={3}>
                <Flat p={p} c={2} color={GRAY} label="neither" dy={30} dx={10} anchor="start" />
              </Fragment>
            </g>
          )}
        </Plane>
      </div>
    </section>
  );
}
