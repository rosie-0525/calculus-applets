import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import Slider, { fmt } from '../components/Slider.jsx';
import { A, X0, Backdrop, DragTarget, Stage, TipLabel, dragTowards, farthest, fits } from '../components/SumPicture.jsx';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, apply, scale } from '../components/la.js';

export const texM = (M) => r`\begin{bmatrix}${M.map((row) => row.join('&')).join(r`\\ `)}\end{bmatrix}`;
// room for x to move about, with (cA)x up to twice Ax
export const XR = [-3, 3.8];
export const YR = [-1.6, 2.2];
export const UNIT = 85;
// the labels' gap, dx, dy (as below) and half widths: x, Ax, (cA)x (its dx, dy by the sign of c)
export const LABEL_X = [16, 0, 4, 9];
export const LABEL_AX = [22, 0, -14, 18];
export const labelCAx = (c) => [8, c > 0 ? -40 : 40, c > 0 ? -22 : 22, 26];
/** Whether x, Ax and (cA)x and their labels all lie in the picture. */
export const ok = (q, c) =>
  fits(q, UNIT, XR, YR, LABEL_X) && fits(apply(A, q), UNIT, XR, YR, LABEL_AX) && fits(scale(c, apply(A, q)), UNIT, XR, YR, labelCAx(c));

/**
 * x and Ax (key press 1), then (cA)x = c(Ax) (2), the labels on top (with a halo, deck.css);
 * dragging anywhere moves x (a ring round its tip), which stops where an arrow or label would leave
 * the picture, sliding along the edge.
 */
export function ScalarPicture({ x, c, onDrag }) {
  const ax = apply(A, x);
  return (
    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={8} grid={false} axes={false} title="x, Ax and (cA)x = c(Ax)">
      {(p) => (
        <g>
          <Backdrop p={p} xRange={XR} yRange={YR} />
          <Stage index={1}>
            <circle cx={p.px(x[0])} cy={p.py(x[1])} r={15} className="l15-grab" />
            <Arrow p={p} to={x} color={INK} width={3} />
          </Stage>
          <Stage index={2}>
            <Arrow p={p} to={scale(c, ax)} color={RED} width={4} />
          </Stage>
          <Stage index={1}>
            <Arrow p={p} to={ax} color={BLUE} />
          </Stage>
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
          <g className="l15-sum-labels">
            <Stage index={1}>
              <TipLabel p={p} v={x} tex={r`\mathbf x`} color={INK} gap={16} dy={4} />
              <TipLabel p={p} v={ax} tex={r`A\mathbf x`} color={BLUE} dy={-14} />
            </Stage>
            <Stage index={2}>
              {Math.abs(c - 1) > 0.15 && (
                <TipLabel p={p} v={scale(c, ax)} tex={r`(cA)\mathbf x`} color={RED} gap={8} dx={labelCAx(c)[1]} dy={labelCAx(c)[2]} />
              )}
            </Stage>
          </g>
          {/* on top, so that the arrows don't get in the way of a drag */}
          <DragTarget p={p} onDrag={(q) => onDrag(dragTowards((v) => ok(v, c), x, q))} />
        </g>
      )}
    </Plane>
  );
}

/**
 * What cA does (split from What A + B does, at the user's request): Mark's theorem (→ Proposition
 * 15.2.4), whole. As on What A + B does (the user's request), the matrices named in their arrows'
 * colours, one per key press. Key press 1: A, and x and Ax on the picture; 2: cA with c = 2 (its
 * glide from 1 to 2 removed), (cA)x = c(Ax), a slider for c (which stops where (cA)x or its label
 * would leave the picture), and the textbook reference. x can be dragged.
 */
export default function Slide04bScalarMaps() {
  const [x, setX] = useState(X0);
  const [c, setC] = useState(2);
  const cv = PRINT ? 2 : c;
  // toward c′, as far as (cA)x and its label stay on the picture
  const slide = (to) => setC(Math.round(farthest(([k]) => ok(x, k), [c], [to])[0] * 100) / 100);
  return (
    <section className="dense">
      <h2>
        What <Tex tex="cA" /> does
      </h2>

      <div className="block theorem">
        <p className="block-title">Theorem</p>
        <p>
          The linear functions associated to the matrices <Tex tex="A" />, <Tex tex="B" /> and <Tex tex="A+B" /> satisfy{' '}
          <Tex tex={r`T_{A+B}(\vv x)=T_A(\vv x)+T_B(\vv x)`} />. Similarly, <Tex tex={r`cT_A(\vv x)=T_{cA}(\vv x)`} /> for all{' '}
          <Tex tex={r`\vv x\in\mathbb R^n`} />.
        </p>
        <Fragment index={2} as="p" className="pointer corner">
          (→ Proposition 15.2.4)
        </Fragment>
      </div>

      <Fragment index={1} className="l15-summap">
        <div className="l15-summap-ms l15-scalarmap-ms">
          <Tex tex={r`\textcolor{${BLUE}}{A}=${texM(A)}`} />
          <Fragment index={2}>
            <Tex tex={r`\textcolor{${RED}}{cA}=\begin{bmatrix}${fmt(cv)}&${fmt(cv)}\\ 0&${fmt(cv)}\end{bmatrix}`} />
          </Fragment>
        </div>
        <div className="l15-summap-pic">
          <ScalarPicture x={x} c={cv} onDrag={setX} />
          {!PRINT && (
            <Fragment index={2} className="lc-sliders l15-c-slider">
              <Slider name="c" value={Math.round(c * 10) / 10} onChange={slide} min={-1.5} max={2} step={0.1} color={RED} />
            </Fragment>
          )}
        </div>
      </Fragment>
    </section>
  );
}
