import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Dot, PlaneLabel } from '../components/Plane.jsx';
import { Sub } from '../components/Space.jsx';
import Fragment from '../components/Fragment.jsx';
import { errors } from '../components/regression.js';

export const CARDINAL = '#8c1515';
export const INK = '#14213d';

/**
 * Example 2's data points, close to a line (r ≈ 0.98). Its line of best fit is y = 3x + 9, with
 * errors 0, −1, 1, 1, −1 (slide 11 works it out on the board).
 */
export const EX2 = [
  [-5, -6],
  [-4, -4],
  [-3, 1],
  [-2, 4],
  [-1, 5],
];

export const XR = [-6.4, 0.6];
export const YR = [-7, 7];
// The line's two handles sit above these x's, between the data points
export const HX = [-4.5, -1.5];
export const H_MAX = 6.8;

/** A number for the readouts: `d` decimals, a true minus sign, no "−0.0". */
export const num = (x, d = 1) => {
  const t = x.toFixed(d);
  return Number(t) === 0 ? (0).toFixed(d) : t.replace('-', '−');
};

/**
 * The example's data and a line the class moves by dragging its two handles. With key press 1, the
 * errors as red vertical lines; one key press later, their names e1, ..., e5.
 */
export function LineApplet({ h, setH }) {
  const [grab, setGrab] = useState(null); // the handle being dragged
  const m = (h[1] - h[0]) / (HX[1] - HX[0]);
  const b = h[0] - m * HX[0];

  return (
    <Plane xRange={XR} yRange={YR} unit={26} title="Five data points and a line with two handles to drag; the errors are the vertical gaps from the points to the line">
      {(p) => {
        /** The height, in the plane's coordinates, of a pointer event. */
        const toY = (e) => {
          const svg = e.currentTarget.ownerSVGElement;
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const q = pt.matrixTransform(svg.getScreenCTM().inverse());
          return YR[0] + (p.py(YR[0]) - q.y) / p.unit;
        };
        const handle = (k) => ({
          onPointerDown: (e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setGrab(k);
          },
          onPointerMove: (e) => {
            if (grab !== k) return;
            const t = Math.max(-H_MAX, Math.min(H_MAX, toY(e)));
            setH((old) => (k === 0 ? [t, old[1]] : [old[0], t]));
          },
          onPointerUp: () => setGrab(null),
          onPointerCancel: () => setGrab(null),
        });
        return (
          <g>
            {/* a steep line, and its errors, stop at the edge of the picture */}
            <defs>
              <clipPath id="bf-clip">
                <rect x={p.px(XR[0])} y={p.py(YR[1])} width={p.px(XR[1]) - p.px(XR[0])} height={p.py(YR[0]) - p.py(YR[1])} />
              </clipPath>
            </defs>
            <Fragment as="g" index={1} clipPath="url(#bf-clip)">
              {EX2.map(([x, y]) => (
                <line key={x} x1={p.px(x)} y1={p.py(y)} x2={p.px(x)} y2={p.py(m * x + b)} stroke={CARDINAL} strokeWidth="2.6" />
              ))}
            </Fragment>
            <Fragment as="g" index={2} clipPath="url(#bf-clip)">
              {EX2.map(([x, y], i) => {
                const yl = m * x + b;
                return (
                  Math.abs(y - yl) > 0.45 && (
                    <PlaneLabel key={x} p={p} at={[x, (y + yl) / 2]} dx={-24} dy={6} color={CARDINAL} size={15} stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
                      e<Sub>{i + 1}</Sub>
                    </PlaneLabel>
                  )
                );
              })}
            </Fragment>
            <line x1={p.px(XR[0])} y1={p.py(m * XR[0] + b)} x2={p.px(XR[1])} y2={p.py(m * XR[1] + b)} stroke={INK} strokeWidth="2.5" clipPath="url(#bf-clip)" />
            {HX.map((x, k) => (
              <circle key={x} className="drag-handle" cx={p.px(x)} cy={p.py(h[k])} r={10} fill="#fff" stroke={INK} strokeWidth="3" {...handle(k)} />
            ))}
            {EX2.map(([x, y]) => (
              <Dot key={x} p={p} at={[x, y]} color={INK} r={5.5} pointerEvents="none" />
            ))}
          </g>
        );
      }}
    </Plane>
  );
}

/**
 * Three topics, kept apart: on the left the general ideas, linear regression (the problem), then the
 * errors (key presses 1 and 2), in plain text, and the line of best fit (3), in a definition box; on
 * the right the example, five points and a line the class moves by dragging its handles. The
 * example follows the text: 1, its errors as red vertical lines; 2, their names e_i and values; 3, the sum of their
 * squares for the class's line, which the class can now try to make as small as possible (the best
 * line, y = 3x + 9, has 4).
 */
export default function Slide07BestFit() {
  const [h, setH] = useState([-2.5, 0.5]); // the line's heights above HX: y = x + 2
  const m = (h[1] - h[0]) / (HX[1] - HX[0]);
  const b = h[0] - m * HX[0];
  const e = errors(EX2, m, b);
  const total = e.reduce((s, t) => s + t * t, 0);
  const line = `y=${num(m, 2)}x${b < 0 ? '-' : '+'}${num(Math.abs(b), 2)}`;

  return (
    <section className="dense">
      <h2>The line of best fit</h2>

      <div className="stage">
        <div className="stage-text">
          <p>
            <strong>Linear regression</strong>: given data points{' '}
            <Tex tex="(x_1,y_1),\dots,(x_n,y_n)" />, find the line <Tex tex="y=mx+b" /> as close as
            possible to them.
          </p>

          <Fragment index={1}>
            <p>
              The <strong>errors</strong> of a line <Tex tex="y=mx+b" /> measure the vertical gaps
              between the data points and the line:
            </p>
            <Fragment index={2}>
              <Tex display className="centered" tex={r`e_i=y_i-(mx_i+b),\qquad i=1,\dots,n.`} />
            </Fragment>
          </Fragment>

          <Fragment index={3} className="block definition">
            <p className="compact">
              The <strong>line of best fit</strong> is the line <Tex tex="y=mx+b" /> that makes the{' '}
              <strong>sum of the squares</strong> of the errors as small as possible:
            </p>
            <Tex
              display
              className="centered"
              tex={r`e_1^2+e_2^2+\cdots+e_n^2.`}
            />
          </Fragment>
        </div>

        <div className="stage-fig bf-example" data-prevent-swipe>
          <p className="bf-example-head">
            <strong>Example.</strong> Five data points, and a line.
          </p>
          <LineApplet h={h} setH={setH} />
          <div className="bf-readout">
            <Tex tex={line} />
            <Fragment index={2} as="p" className="red">
              <Tex tex={r`e_1,\dots,e_5:\ ${e.map((t) => num(t)).join(r`,\ `)}`} />
            </Fragment>
            <Fragment index={3} as="p" className="bf-total">
              <Tex tex={r`e_1^2+\cdots+e_5^2=${num(total, 2)}`} />
            </Fragment>
          </div>
        </div>
      </div>
    </section>
  );
}
