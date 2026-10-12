import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { PlanePatch, Dot3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { GGraph, GContour, Classified } from '../components/ExampleG.jsx';

export const RED = '#8c1515';
export const GREEN = '#175e54';
export const INK = '#14213d';

export const f = (x, y) => x ** 3 + y * y;
// wider in x than in y, so that x³ shows against y²
export const XR = [-1.2, 1.2];
export const YR = [-0.9, 0.9];
export const Z = 0.55;
export const FLOOR = -1;
export const along = (R, h) => Array.from({ length: 61 }, (_, k) => h(R[0] + ((R[1] - R[0]) * k) / 60));
// along the x-axis, x³ (neither); along the y-axis, y² (a local minimum)
export const LINES = [
  { pts: along(XR, (t) => [t, 0, Z * f(t, 0)]), color: RED, width: 4 },
  { pts: along(YR, (t) => [0, t, Z * f(0, t)]), color: GREEN, width: 4 },
];

/**
 * Preview, right after Saddle points: back to the graph and the contour plot of Example 1
 * (ExampleG.jsx). Key press 1: the local maximum and the local minimum, labelled on the contour
 * plot; 2: the two saddle points; 3: how to decide (→ Chapter 26); 4: f(x, y) = x³ + y² and its
 * graph, with the curves over the x-axis (x³, neither, red) and the y-axis (y², a local minimum,
 * green) through the critical point (0, 0), which is neither.
 */
export default function Slide08bNeither() {
  return (
    <section className="dense">
      <h2>Preview</h2>

      <div className="preview-figs">
        <div>
          <p className="preview-eq">
            <Tex tex={r`g(x,y)=3x^2y+y^3-6xy`} />
          </p>
          <div className="preview-pair">
            <GGraph scale={0.5} />
            <GContour width={356} labelSize={11}>{(p) => <Classified p={p} index={[1, 2]} />}</GContour>
          </div>
        </div>

        <Fragment index={4}>
          <p className="preview-eq">
            <Tex tex={r`f(x,y)=x^3+y^2`} />
          </p>
          <Space width={340} height={324} unit={78} center={[0.5, 0.52]} axes={false} az={120} el={34} swing={8} title="The graph of x³ + y², with the curves over the x-axis (x³, neither) and over the y-axis (y², a minimum) through the critical point at the origin">
            {(s) => (
              <g>
                <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={XR} range2={YR} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
                <Surface s={s} f={f} x={XR} y={YR} n={[32, 24]} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" lines={LINES} />
                <Dot3 s={s} at={[0, 0, 0]} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
              </g>
            )}
          </Space>
        </Fragment>
      </div>

      <Fragment index={3} as="p" className="neither-more">
        How to decide whether a critical point is a local max/min or a saddle point (or something else)?{' '}
        <span className="pointer">→ Chapter 26</span>
      </Fragment>
    </section>
  );
}
