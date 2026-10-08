import '../lectures/l7/styles/deck.css';
import Tex from '../lectures/l7/components/Tex.jsx';
import Plane, { Dot, PlaneLabel } from '../lectures/l7/components/Plane.jsx';
import Space, { Seg3, Dot3, Label3, PlanePatch } from '../lectures/l7/components/Space.jsx';
import Surface from '../lectures/l7/components/Surface.jsx';
import { f1, f2, X1, XY, R, Z, parabola, INK, CARDINAL, TEAL } from '../lectures/l7/slides/Slide08Graph.jsx';

export const lecture = 7;

/* The slide's two examples without its definition: the parabola y = x² and the bowl
   z = x² + y², each with a point x (or (x, y)) and the point above it on the graph. */
export default function Graph() {
  const top = [...XY, Z * f2(...XY)];
  return (
    <div className="scalar-pair">
      <div className="scalar-case">
        <p>A function of one variable.</p>
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
      </div>

      <div className="scalar-case">
        <p>A function of two variables.</p>
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
      </div>
    </div>
  );
}
