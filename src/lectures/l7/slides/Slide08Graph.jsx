import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot, PlaneLabel } from '../components/Plane.jsx';
import Space, { Seg3, Dot3, Label3, PlanePatch } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';

export const INK = '#14213d';
export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';

export const f1 = (x) => x * x;
export const f2 = (x, y) => x * x + y * y;
export const X1 = 1.5; // the point x of the one-variable graph
export const XY = [0.45, 1.0]; // the point (x, y) of the two-variable graph
export const R = [-1.3, 1.3];
export const Z = 0.5; // heights drawn at 0.5 × f

// the parabola y = x², as an SVG path
export const parabola = (p) =>
  Array.from({ length: 81 }, (_, k) => -2.05 + (4.1 * k) / 80)
    .map((x, k) => `${k ? 'L' : 'M'}${p.px(x).toFixed(1)},${p.py(f1(x)).toFixed(1)}`)
    .join(' ');

/**
 * Visualizing scalar-valued functions: the graph of f (Mark's definition), then examples. Key
 * press 1: n = 1, a function of one variable, f(x) = x², whose graph is a curve in 2D. 2: n = 2, a
 * function of two variables, f(x, y) = x² + y², whose graph is a surface in 3D.
 */
export default function Slide08Graph() {
  const top = [...XY, Z * f2(...XY)];
  return (
    <section className="dense">
      <h2>Visualizing scalar-valued functions</h2>

      <div className="block definition graph-def">
        <p>
          Let <Tex tex={r`f:\mathbb{R}^n\to\mathbb{R}`} /> be a scalar-valued function. The <strong>graph</strong>{' '}
          of <Tex tex="f" /> is the set{' '}
          <Tex tex={r`\{(x_1,\ldots,x_n,z)\in\mathbb{R}^{n+1}:z=f(x_1,\ldots,x_n)\}`} />.
        </p>
      </div>

      <div className="scalar-pair">
        <Fragment index={1} className="scalar-case">
          <p>
            <Tex tex="n=1" />: a function of one variable.
          </p>
          <div className="scalar-plot">
            <Plane xRange={[-4, 4]} yRange={[-0.5, 4.3]} unit={50} xTicks={[-3, -2, -1, 1, 2, 3]} yTicks={[1, 2, 3, 4]} title="The graph of x squared, a parabola in the plane">
              {(p) => (
                <g>
                  <path d={parabola(p)} fill="none" stroke={CARDINAL} strokeWidth="3.5" strokeLinecap="round" />
                  <line x1={p.px(X1)} y1={p.py(0)} x2={p.px(X1)} y2={p.py(f1(X1))} stroke={INK} strokeWidth="2" strokeDasharray="0.1 6" strokeLinecap="round" />
                  <Dot p={p} at={[X1, 0]} color={TEAL} r={6} />
                  <Dot p={p} at={[X1, f1(X1)]} color={CARDINAL} r={6.5} />
                  <PlaneLabel p={p} at={[X1, 0]} dx={-4} dy={-12} color={TEAL} textAnchor="end">
                    x
                  </PlaneLabel>
                  <PlaneLabel p={p} at={[X1, f1(X1)]} dx={12} dy={6} color={CARDINAL}>
                    (x, f(x))
                  </PlaneLabel>
                </g>
              )}
            </Plane>
            <span className="scalar-formula">
              <Tex tex="f(x)=x^2" />
            </span>
          </div>
          <p className="scalar-graph">The graph is a curve in 2D.</p>
        </Fragment>

        <Fragment index={2} className="scalar-case">
          <p>
            <Tex tex="n=2" />: a function of two variables.
          </p>
          <div className="scalar-plot">
            <Space width={480} height={284} unit={80} center={[0.5, 0.7]} axes={false} az={-36} el={24} swing={10} title="The graph of x squared plus y squared, a bowl in space">
              {(s) => (
                <g>
                  <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
                  <Surface s={s} f={f2} x={R} y={R} n={24} zScale={Z} />
                  <Seg3 s={s} from={[...XY, 0]} to={top} color={INK} width={2} strokeDasharray="0.1 6" />
                  <Dot3 s={s} at={[...XY, 0]} color={TEAL} r={6} />
                  <Dot3 s={s} at={top} color={CARDINAL} r={6.5} />
                  <Label3 s={s} at={[...XY, 0]} dx={10} dy={18} color={TEAL} size={17}>
                    (x, y)
                  </Label3>
                  <Label3 s={s} at={top} dx={12} dy={-8} color={CARDINAL} size={17} paintOrder="stroke" stroke="#fff" strokeWidth="4">
                    (x, y, f(x, y))
                  </Label3>
                </g>
              )}
            </Space>
            <span className="scalar-formula">
              <Tex tex="f(x,y)=x^2+y^2" />
            </span>
          </div>
          <p className="scalar-graph">The graph is a surface in 3D.</p>
        </Fragment>
      </div>
    </section>
  );
}
