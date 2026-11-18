import Fragment from './Fragment.jsx';
import { Arrow } from './Plane.jsx';
import Hunt, { snapper } from './Hunt.jsx';
import { Stage } from './SumPicture.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { A0 as A, EIGS0 as EIGS, INK, BLUE, apply, half, pts, times } from './eig.js';

// A = [1 1/2; 1/2 1] (eig.js) stretches by 3/2 along (1, 1) and shrinks by 1/2 along (1, −1), the
// diagonals of the unit square
export const XR = [-1.25, 2.25];
export const YR = [-1.25, 2.25];
const snap = snapper(EIGS);
// T_B on its way, (1 − t)I + tB (for A, eigenvalues 1 + t/2 and 1 − t/2: it never flattens)
const along = (B, t) => B.map((row, i) => row.map((a, j) => (1 - t) * (i === j ? 1 : 0) + t * a));
// Ax = (3/2)x and Ax = (1/2)x in fractions, as in A (the user's request), full size (\dfrac): the
// label's small type makes a text-size fraction unreadable
const scaled = (lam, v) => `${half(Math.round(2 * lam) / 2).replace('\\frac', '\\dfrac')}\\,${v}`;

/** The unit square and F (Lecture 18's look): the grid and the blue square and F moved by
 *  (1 − t)I + tB (B: A, or another matrix, as on Sums of eigenvectors), the gray square and F where
 *  they start. For A, at t = 1 the square is a rhombus: its diagonal from 0 to (1, 1) is 3/2 as long,
 *  the other one, from e₁ to e₂, half as long. */
export function FLayer({ p, t, B = A }) {
  const M = along(B, t);
  return (
    <g>
      <GridImage p={p} M={M} n={4} />
      <FImage p={p} home />
      <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
      <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
    </g>
  );
}

/**
 * Stretch and shrink's applet, shared with Eigenvectors and eigenvalues and Eigenlines (the user's
 * requests): x (to drag) and Ax on top of the unit square and F moved by A; the line of x lights up,
 * amber or purple, and Ax reads Ax = (3/2)x or Ax = (1/2)x, when x is on a diagonal.
 * `t`: how far T_A has moved the square and F. `fade`: the key press on which they fade back (none:
 * faded from the start, as after Stretch and shrink). `index`: Hunt's key presses of x, Ax and the line
 * of x (and `gone`, the key press on which x and Ax fade out). `lines`: the key press of the two
 * eigenlines, amber and purple (true: from the start; false: none). `arrows`: the key press of u and v,
 * an amber and a purple arrow, moved with the square and F by (1 − t)I + tA, so that a replay of T_A
 * shows u stretched by 3/2, v shrunk by 1/2 (Eigenlines, in place of dots on the lines: the user;
 * false: none). No `onDrag`: x stays put (print).
 */
export default function StretchHunt({ x, onDrag, t = 1, fade = null, index = {}, lines = false, arrows = false, unit = 130, title }) {
  const under = (p) => (
    <>
      {fade == null ? (
        <g opacity="0.5">
          <FLayer p={p} t={t} />
        </g>
      ) : (
        <Fragment as="g" index={fade} effect="semi-fade-out">
          <FLayer p={p} t={t} />
        </Fragment>
      )}
      {lines !== false && (
        <Stage index={lines === true ? undefined : lines}>
          {EIGS.map((e, i) => {
            const f = times(4, e.v);
            return <polyline key={i} points={pts(p, [times(-1, f), f])} stroke={e.color} strokeWidth="2.6" opacity="0.6" fill="none" />;
          })}
        </Stage>
      )}
      {arrows !== false && (
        <Stage index={arrows === true ? undefined : arrows}>
          {EIGS.map((e, i) => (
            <Arrow key={i} p={p} to={apply(along(A, t), e.v)} color={e.color} width={3.8} head={14} />
          ))}
        </Stage>
      )}
    </>
  );
  return (
    <Hunt
      M={A}
      x={x}
      onDrag={onDrag}
      snap={snap}
      eigs={EIGS}
      index={index}
      scaled={scaled}
      hitH={27}
      unit={unit}
      xRange={XR}
      yRange={YR}
      under={under}
      title={title ?? 'x, to drag, and Ax on top of the unit square and F moved by A = [1 1/2; 1/2 1]'}
    />
  );
}
