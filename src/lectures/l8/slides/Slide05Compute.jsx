import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Space, { Seg3, Dot3, Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import SlicedGraph, { along } from '../components/Slices.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const GRAY = '#9ca3af';
export const CARDINAL = '#8c1515';
export const GREEN = '#175e54';
export const INK = '#14213d';
export const TEAL = '#0e7490'; // the tangent line, as on Single variable function
export const PLANE_INK = '#3b5f91';
export const AXIS = '#6b7280'; // as Space draws the axes
export const NOTE = '#6b7280'; // "we treat y as a constant", by the grey y²
export const MESH = 'rgba(15, 40, 50, 0.16)';
export const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };

// the picture, in the style of Multivariable functions: the graph of f with the axes, the point
// (2, 1, f(2, 1)) on it, and the planes y = 1 and x = 2 through it
export const F = (x, y) => x * x - x * y * y; // increasing in x, decreasing in y at (2, 1)
// the first quadrant, where f falls in the y direction everywhere (f_y = −2xy) and rises in the x
// direction nearly everywhere
export const XR = [0, 3];
export const YR = [0, 1.8];
export const Z = 0.2; // heights drawn at 0.2 × f
export const ZP = [-0.6, 1.5]; // the planes, from under the graph to above the slices
export const ZL = 2.2; // the z-axis, up to z = 2.2
export const PERIOD = 6; // seconds, there and back, for the moving point

/**
 * The graph of f in one of four states: 0, the graph and the point (2, 1, 2); 1, cut by the plane
 * y = 1, the slice z = f(x, 1) in red; 2, the same with the tangent line at the point, "slope 3"; 3,
 * cut by the plane x = 2, the slice z = f(2, y) in green, the red slice still on the graph. The
 * point is drawn over (x, y), (2, 1) unless given.
 */
export function Picture({ s, state, at: [x, y] = [2, 1] }) {
  const base = { f: F, x: XR, y: YR, n: 30, zScale: Z, mesh: MESH };
  // the z-axis above the graph, painted with it in depth order
  const zAxis = { pts: along([Z * F(0, 0), ZL], (t) => [0, 0, t], 12), color: AXIS, width: 1.5 };
  const point = <Dot3 s={s} at={[x, y, Z * F(x, y)]} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />;
  const label = (text, at, dx) => (
    <Label3 s={s} at={at} dx={dx} dy={-8} color={PLANE_INK} size={19} fontWeight="400" textAnchor={dx < 0 ? 'end' : 'start'} {...halo}>
      {text[0]}
      <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
        {' = '}
        {text[1]}
      </tspan>
    </Label3>
  );
  if (state === 1 || state === 2) {
    const tangent = (t) => [2 + t, 1, Z * (F(2, 1) + 3 * t)];
    return (
      <g>
        <SlicedGraph s={s} {...base} cut={{ axis: 'y', at: 1, z: ZP }} curveColor={CARDINAL} curveWidth={4} lines={[zAxis]} />
        {state === 2 && (
          <g>
            {/* on a white underlay, to stand out from the red slice it touches */}
            <Seg3 s={s} from={tangent(-0.9)} to={tangent(0.9)} color="#fff" width={7} />
            <Seg3 s={s} from={tangent(-0.9)} to={tangent(0.9)} color={TEAL} width={3.5} />
            <Label3 s={s} at={tangent(0.35)} dx={6} dy={26} color={TEAL} size={18} italic={false} textAnchor="start" {...halo}>
              slope 3
            </Label3>
          </g>
        )}
        {point}
        {label(['y', '1'], [XR[1], 1, ZP[1]], 6)}
      </g>
    );
  }
  if (state === 3) {
    // the red slice in two pieces, each painted with the part of the graph it lies on
    const red = (r0, r1) => ({ pts: along([r0, r1], (t) => [t, 1, Z * F(t, 1)]), color: CARDINAL, width: 4 });
    return (
      <g>
        <SlicedGraph s={s} {...base} cut={{ axis: 'x', at: 2, z: ZP }} curveColor={GREEN} curveWidth={4.5} lines={[zAxis, red(XR[0], 2), red(2, XR[1])]} />
        {point}
        {label(['x', '2'], [2, YR[1], ZP[1]], -6)}
      </g>
    );
  }
  return (
    <g>
      <Surface s={s} {...base} lines={[zAxis]} />
      {point}
    </g>
  );
}

/** Seconds since `on` became true, counted while the slide is showing; 0 while off, and in print. */
export function useClock(on, ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    setT(0);
    if (PRINT || !on) return undefined;
    let id;
    let t0;
    const tick = (now) => {
      t0 ??= now;
      if (ref.current?.closest('section')?.classList.contains('present')) setT((now - t0) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on, ref]);
  return t;
}

/**
 * The graph of f beside the computation: key press 5, the plane y = 1, the point moving back and
 * forth along the slice (x varies, y = 1); 7, the point at (2, 1, 2) with its tangent line, slope 3;
 * 10, the plane x = 2, the point moving along that slice (y varies). In print, a still per state.
 */
export function ComputeFigure() {
  const m5 = useRef(null);
  const m7 = useRef(null);
  const m10 = useRef(null);
  const s5 = useFragmentShown(m5);
  const s7 = useFragmentShown(m7);
  const s10 = useFragmentShown(m10);
  const state = s10 ? 3 : s7 ? 2 : s5 ? 1 : 0;
  const w = (2 * Math.PI * useClock(state === 1 || state === 3, m5)) / PERIOD;
  const at = state === 1 ? [2 + 0.6 * Math.sin(w), 1] : state === 3 ? [2, 1 + 0.45 * Math.sin(w)] : [2, 1];
  return (
    <>
      <span ref={m5} className="fragment fx-marker" data-fragment-index={5} aria-hidden="true" />
      <span ref={m7} className="fragment fx-marker" data-fragment-index={7} aria-hidden="true" />
      <span ref={m10} className="fragment fx-marker" data-fragment-index={10} aria-hidden="true" />
      <Space width={450} height={380} unit={70} center={[0.5, 0.66]} axisLen={[3.8, 2.6, ZL]} az={140} el={22} swing={6} title="The graph of f(x, y) = x² − x y² with the axes and the point (2, 1, 2), cut by the plane y = 1, then by the plane x = 2">
        {(s) =>
          PRINT ? (
            <g>
              <Picture s={s} state={0} />
              <Fragment as="g" index={5}>
                <Fragment as="g" index={7} effect="fade-out">
                  <Picture s={s} state={1} />
                </Fragment>
              </Fragment>
              <Fragment as="g" index={7}>
                <Fragment as="g" index={10} effect="fade-out">
                  <Picture s={s} state={2} />
                </Fragment>
              </Fragment>
              <Fragment as="g" index={10}>
                <Picture s={s} state={3} />
              </Fragment>
            </g>
          ) : (
            <Picture s={s} state={state} at={at} />
          )
        }
      </Space>
    </>
  );
}

/**
 * Computing partial derivatives: f(x, y) = x² − x y², how to compute f_x(2, 1)? (the textbook's
 * Example 9.3.1, two ways; Mark's definition for f: ℝⁿ → ℝ is on More variables), in a blue answer
 * box, the graph of f beside it. Key press 1: ∂f/∂x, y² greyed out; 2: an arrow to the grey y², "we
 * treat y as a constant"; 3: = 2x − y² = 2x − y²; 4: f_x(2, 1) = 3; 5: beside it, plug in y = 1, then
 * differentiate: f(x, 1) (the plane y = 1, the point moving along the slice); 6: f_x(x, 1); 7:
 * ⇒ f_x(2, 1) = 3, level with the first (the tangent line, slope 3); 8: under each way, its name: the
 * symbolic and the numerical method; 9: Example 1 (board), f_y(2, 1) using both methods, the answer
 * commented out; 10: the plane x = 2 on the graph.
 */
export default function Slide05Compute() {
  const c = (v) => r`\textcolor{${GRAY}}{${v}}`;
  // under the grey y², shown on key press 2 (the pd-const marker); \mathclap keeps it from widening y²;
  // the second line, = 2x − y², on key press 3 (the pd-step marker)
  const note = r`\htmlClass{pd-const}{\mathclap{\textcolor{${NOTE}}{\begin{array}{c}\big\uparrow\\ \textstyle\text{we treat }y\\ \textstyle\text{as a constant}\end{array}}}}`;
  return (
    <section className="dense">
      <h2>Computing partial derivatives</h2>

      <div className="stage pd-stage">
        <div className="stage-text pd-demo">
          <p>
            Let <Tex tex={r`f(x,y)=x^2-xy^2`} />. How to compute <Tex tex="f_x(2,1)" />?
          </p>

          <FxMarker index={2} id="pd-const" />
          <FxMarker index={3} id="pd-step" />
          <FxMarker index={5} id="pd-num" />
          {/* the answer: the two methods side by side, one step per key press, a rule between them
              from key press 5; each one's work, then its result (level with the other's), then its name */}
          <Fragment index={1} className="block pd-answer pd-ways fx-host">
            <div>
              <Tex display tex={r`\begin{aligned}\frac{\partial f}{\partial x}&=\frac{\partial}{\partial x}\bigl(x^2-x\,\underset{${note}}{${c('y^2')}}\bigr)\\&\htmlClass{pd-step}{=2x-${c('y^2')}=2x-y^2,}\end{aligned}`} />
            </div>
            <div className="pd-work">
              <Fragment index={5}>
                <p>
                  Plug in <Tex tex="y=1" />, then differentiate:
                </p>
                <Tex display tex={r`f(x,1)=x^2-x,`} />
              </Fragment>
              <Fragment index={6}>
                <Tex display tex={r`f_x(x,1)=2x-1,`} />
              </Fragment>
              {/* at the foot of the column, just above f_x(2, 1), with it: fills the gap */}
              <Fragment index={7} className="pd-then">
                <Tex display tex={r`\Rightarrow`} />
              </Fragment>
            </div>
            <Fragment index={4}>
              <Tex display tex={r`f_x(2,1)=2\cdot 2-1^2=3.`} />
            </Fragment>
            <div>
              <Fragment index={7}>
                <Tex display tex={r`f_x(2,1)=2\cdot 2-1=3.`} />
              </Fragment>
            </div>
            <p className="pd-name">
              <Fragment index={8} as="span">
                Symbolic method
              </Fragment>
            </p>
            <p className="pd-name">
              <Fragment index={8} as="span">
                Numerical method
              </Fragment>
            </p>
          </Fragment>

          <Fragment index={9} as="p" className="pd-board">
            <strong>Example 1</strong> <span className="board-pill">board</span> Compute <Tex tex="f_y(2,1)" /> using
            both methods.
            {/* Answer commented out (worked on the board):
                symbolic: ∂f/∂y = ∂/∂y(x² − x y²) = 0 − x · 2y = −2xy, so f_y(2, 1) = −2 · 2 · 1 = −4;
                numerical: f(2, y) = 4 − 2y², f_y(2, y) = −4y, so f_y(2, 1) = −4 · 1 = −4. */}
          </Fragment>
        </div>

        <figure className="pd-fig">
          <ComputeFigure />
        </figure>
      </div>
    </section>
  );
}
