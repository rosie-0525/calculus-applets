import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { PlanePatch, Dot3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';

export const RED = '#8c1515';
export const GREEN = '#175e54';
export const INK = '#14213d';

export const f = (x, y) => x * x - y * y;
export const R = [-1.4, 1.4];
export const Z = 0.6;
export const FLOOR = -1.4;
export const along = (g) => Array.from({ length: 61 }, (_, k) => g(-1.4 + (2.8 * k) / 60));
export const X_LINE = { pts: along((t) => [t, 0, Z * f(t, 0)]), color: RED, width: 4 };
export const Y_LINE = { pts: along((t) => [0, t, Z * f(0, t)]), color: GREEN, width: 4 };

/** The graph of x² − y², with the curves over the x-axis and the y-axis on it (from `lines`). */
export function SaddleGraph({ lines, title }) {
  return (
    <Space width={440} height={340} unit={82} center={[0.5, 0.5]} axes={false} az={-40} el={26} swing={8} title={title}>
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <Surface s={s} f={f} x={R} y={R} n={28} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" lines={lines} />
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </Space>
  );
}

/**
 * Saddle points: Mark's definition, its two bullets one per key press. Beside it the graph of x² − y² (Lecture 7's model saddle); key
 * press 1: the local-minimum bullet and, over the x-axis, x² (red), a local minimum at 0; 2: the
 * local-maximum bullet and, over the y-axis, −y² (green), a local maximum. The graph is
 * drawn again with each set of curves (the curves are painted in depth order with the graph).
 */
export default function Slide08Saddle() {
  return (
    <section className="dense">
      <h2>Saddle points</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block definition">
            <p className="block-title">Definition</p>
            <p>
              A critical point <Tex tex="P" /> is a <strong>saddle point</strong> if:
            </p>
            <ul className="bullets saddle-cases">
              <Fragment index={1} as="li">
                when we move through <Tex tex="P" /> along some line, <Tex tex="f" /> experiences a local minimum at{' '}
                <Tex tex="P" />
              </Fragment>
              <Fragment index={2} as="li">
                when we move through <Tex tex="P" /> along some other direction, <Tex tex="f" /> experiences a local
                maximum at <Tex tex="P" />
              </Fragment>
            </ul>
          </div>

          <p className="saddle-f">
            <Tex tex={r`f(x,y)=x^2-y^2`} />, at <Tex tex="(0,0)" />:
          </p>
          <Fragment index={1} as="p" className="saddle-line">
            <Tex tex={r`\textcolor{#8c1515}{f(x,0)=x^2}`} />: a local minimum at <Tex tex="x=0" />
          </Fragment>
          <Fragment index={2} as="p" className="saddle-line">
            <Tex tex={r`\textcolor{#175e54}{f(0,y)=-y^2}`} />: a local maximum at <Tex tex="y=0" />
          </Fragment>
        </div>

        <div className="l9-stack">
          <Fragment as="div" index={1} effect="fade-out">
            <SaddleGraph lines={[]} title="The graph of x² − y², a saddle" />
          </Fragment>
          <Fragment as="div" index={1}>
            <Fragment as="div" index={2} effect="fade-out">
              <SaddleGraph lines={[X_LINE]} title="The graph of x² − y² with the curve over the x-axis, x², which has a minimum at 0" />
            </Fragment>
          </Fragment>
          <Fragment as="div" index={2}>
            <SaddleGraph lines={[X_LINE, Y_LINE]} title="The graph of x² − y² with the curves over the x-axis (a minimum at 0) and over the y-axis (a maximum at 0)" />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
