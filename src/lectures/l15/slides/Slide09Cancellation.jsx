import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { DragTarget, TipLabel } from '../components/SumPicture.jsx';
import CautionSign from '../components/CautionSign.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, AMBER, VIOLET, apply, lerpM, I2, pts } from '../components/la.js';

// A: projection onto the x-axis; B: rotation by 180°; C: reflection across the y-axis (Lecture 14's
// gallery has the first two). Bx and Cx are mirror images across the x-axis, so A(Bx) = A(Cx): AB = AC,
// but B ≠ C. (Before, at the user's request: Christine's Example 3, A = [1 −1; −1 1], B = [1 0; 3 4],
// C = [0 1; 2 5], AB = AC = [−2 −4; 2 4], A squashing the plane onto the line y = −x.)
export const A = [
  [1, 0],
  [0, 0],
];
export const turn = (s) => [
  [Math.cos(Math.PI * s), -Math.sin(Math.PI * s)],
  [Math.sin(Math.PI * s), Math.cos(Math.PI * s)],
];
export const flip = (s) => [
  [Math.cos(Math.PI * s), 0],
  [0, 1],
];
export const X0 = [1.2, 0.8];
export const XR = [-2.2, 2.2];
export const YR = [-1.6, 1.6];
export const GRID = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
export const inside = (v) => v[0] > XR[0] + 0.12 && v[0] < XR[1] - 0.12 && Math.abs(v[1]) < 1;

/**
 * x; Bx, x turning by 180° (sb from 0 to 1), and Cx, x flipping over the y-axis (sc); then (t from 0
 * to 1) the plane squashed by A onto the x-axis, the grid with it (by (1 − t)I + tA): Bx and Cx slide
 * straight down or up, along the dashed line, to A(Bx) = A(Cx), their gray copies staying behind.
 */
export function Picture({ x, sb, sc, t, onDrag }) {
  const M = lerpM(I2, A, t);
  const bx = apply(turn(sb), x);
  const cx = apply(flip(sc), x);
  const mb = apply(M, bx);
  const mc = apply(M, cx);
  return (
    <Plane xRange={XR} yRange={YR} unit={125} pad={8} grid={false} axes={false} title="Bx and Cx, then A projects the plane onto the x-axis: A(Bx) = A(Cx)">
      {(p) => (
        <g>
          <defs>
            <clipPath id="l15-cancel-clip">
              <rect x={0} y={0} width={p.W} height={p.H} rx={10} />
            </clipPath>
          </defs>
          <g clipPath="url(#l15-cancel-clip)">
            <g stroke="#e3e6eb" strokeWidth="1.2">
              {GRID.map((k) => (
                <g key={k}>
                  <polyline points={pts(p, [apply(M, [k, -4]), apply(M, [k, 4])])} />
                  <polyline points={pts(p, [apply(M, [-4, k]), apply(M, [4, k])])} />
                </g>
              ))}
            </g>
            <g stroke="#b9bfc9" strokeWidth="1.6">
              <polyline points={pts(p, [apply(M, [-4, 0]), apply(M, [4, 0])])} />
              <polyline points={pts(p, [apply(M, [0, -4]), apply(M, [0, 4])])} />
            </g>
            {t > 0.97 && <polyline points={pts(p, [[-3, 0], [3, 0]])} stroke={RED} strokeWidth="2" opacity="0.35" />}
          </g>
          <DragTarget p={p} onDrag={onDrag} ok={inside} />
          <g opacity={1 - 0.75 * t}>
            <Arrow p={p} to={x} color={INK} width={3} />
            <TipLabel p={p} v={x} tex={r`\mathbf x`} color={INK} gap={14} dy={-4} />
          </g>
          {t > 0 && (
            <g opacity={0.35}>
              <polyline points={pts(p, [bx, cx])} stroke={INK} strokeWidth="1.6" strokeDasharray="5 5" fill="none" />
              <Arrow p={p} to={bx} color={AMBER} width={2.5} />
              <Arrow p={p} to={cx} color={VIOLET} width={2.5} />
            </g>
          )}
          {/* on the x-axis, Bx a wider arrow under Cx, so that both show */}
          {sb > 0 && <Arrow p={p} to={mb} color={AMBER} width={3.5 + 4 * t} head={14 + 8 * t} />}
          {sc > 0 && <Arrow p={p} to={mc} color={VIOLET} />}
          <g opacity={Math.max(0, 1 - 4 * t)}>
            {sb >= 1 && <TipLabel p={p} v={bx} tex={r`B\mathbf x`} color={AMBER} gap={16} />}
            {sc >= 1 && <TipLabel p={p} v={cx} tex={r`C\mathbf x`} color={VIOLET} gap={16} />}
          </g>
          {t > 0.97 && (
            <>
              <Dot p={p} at={mb} color={RED} r={5} />
              <TexSvg x={Math.min(Math.max(p.px(mb[0]), 90), p.W - 90)} y={p.py(-Math.abs(x[1]) - 0.4)} tex={r`A(B\mathbf x)=A(C\mathbf x)`} size={22} color={RED} w={240} />
            </>
          )}
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Plane>
  );
}

/**
 * Caution 1: No cancellation law (Mark's first not-so-nice consequence; after How much faster?, at
 * the user's request, with a caution sign by its title): AB = AC does not give B = C, on a projection
 * (the user's request: B ≠ C is easy to see, and the algebra comes later). B, C and A on a key
 * press each, each with its part of the picture (the user's request). Key press 1: B, rotation by
 * 180°, and the picture: x (it can be dragged) and a copy turning to Bx; 2: C, reflection across the
 * y-axis, and another copy flipping to Cx; 3: A, projection onto the x-axis: it squashes the plane
 * onto the x-axis, the grid with it, and Bx and Cx land on the same point; 4: Example 1 (board), the
 * matrices A, B, C (in place of AB = AC and the algebra, at the user's request; the answers are
 * commented out).
 */
export default function Slide09Cancellation() {
  const [x, setX] = useState(X0);
  const refs = [useRef(null), useRef(null), useRef(null)];
  const on1 = useFragmentShown(refs[0]);
  const on2 = useFragmentShown(refs[1]);
  const on3 = useFragmentShown(refs[2]);
  const tb = useTween(on1, { ms: 1500, delay: 600 });
  const tc = useTween(on2, { ms: 1500, delay: 400 });
  const tt = useTween(on3, { ms: 2200, delay: 400 });
  // each key press finishes the turn before it, if it is still on its way
  const sb = on2 || on3 ? 1 : tb;
  const sc = on3 ? 1 : tc;
  return (
    <section>
      <div className="l15-caution-head">
        <h2>Caution 1: No cancellation law</h2>
        <CautionSign />
      </div>
      {refs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      <div className="l15-cancel">
        <div className="l15-cancel-text">
          <p>
            <Tex tex="AB=AC" /> does not imply <Tex tex="B=C" />.
          </p>
          <ul className="bullets l15-cancel-maps">
            <Fragment index={1} as="li">
              <Tex tex={r`\textcolor{${AMBER}}{B}`} />: rotation by <Tex tex={r`180^\circ`} />
            </Fragment>
            <Fragment index={2} as="li">
              <Tex tex={r`\textcolor{${VIOLET}}{C}`} />: reflection across the <Tex tex="y" />-axis
            </Fragment>
            <Fragment index={3} as="li">
              <Tex tex="A" />: projection onto the <Tex tex="x" />-axis
            </Fragment>
          </ul>
          <Fragment index={4} as="p" className="l15-cancel-eg">
            <strong>Example 1</strong> <span className="board-pill">board</span> Write down the matrices <Tex tex="A" />, <Tex tex="B" /> and{' '}
            <Tex tex="C" />, and verify <Tex tex="AB=AC" />.
          </Fragment>
          {/* A = [1 0; 0 0], B = [−1 0; 0 −1], C = [−1 0; 0 1]; AB = AC = [−1 0; 0 0], but B ≠ C. (Before the
              board example, at the user's request: (AB)x = A(Bx) = A(Cx) = (AC)x for every x, so AB = AC,
              but B ≠ C; then AB and AC computed.) */}
          {/* The Why? box, A(B − C) = 0 with B − C ≠ 0, moved to Distributive laws (it needs sums,
              which now come later). */}
        </div>

        <Fragment index={1} className="l15-cancel-pic">
          {PRINT ? (
            <div className="l15-stills">
              <Fragment index={2} effect="fade-out">
                <Picture x={X0} sb={1} sc={0} t={0} onDrag={setX} />
              </Fragment>
              <Fragment index={2}>
                <Fragment index={3} effect="fade-out">
                  <Picture x={X0} sb={1} sc={1} t={0} onDrag={setX} />
                </Fragment>
              </Fragment>
              <Fragment index={3}>
                <Picture x={X0} sb={1} sc={1} t={1} onDrag={setX} />
              </Fragment>
            </div>
          ) : (
            <Picture x={x} sb={sb} sc={sc} t={tt} onDrag={setX} />
          )}
        </Fragment>
      </div>
    </section>
  );
}
