import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow } from '../components/Plane.jsx';
import { TipLabel } from '../components/SumPicture.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { A2, EIGS2, INK, BLUE, apply, len, pts, times } from '../components/eig.js';

export const XR = [-1.9, 2.9];
export const YR = [-1.7, 2.7];
export const UNIT = 96;
// T_A on its way. The first play, T_A as a whole (the user's request): (1 − t)I + tA. The second, with
// u and v, in two steps, so that the flip shows (the user's request): u's line stretches, its factor 1 → 2 (t from 0 to 0.45); a pause; then the plane turns
// over about u's line like a page, v's factor cos(πs) from 1 to −1 (t from 0.55 to 1). In the
// eigenbasis: M = a u r₁ + b v r₂, with r₁, r₂ the rows of [u v]⁻¹.
export const [EU, EV] = EIGS2.map((e) => e.v);
export const DET = EU[0] * EV[1] - EV[0] * EU[1];
export const R = [
  [EV[1] / DET, -EV[0] / DET],
  [-EU[1] / DET, EU[0] / DET],
];
export const clamp = (x) => Math.min(1, Math.max(0, x));
export const along = (t) => {
  const a = 1 + clamp(t / 0.45);
  const b = Math.cos(Math.PI * clamp((t - 0.55) / 0.45));
  return [0, 1].map((i) => [0, 1].map((j) => a * EU[i] * R[0][j] + b * EV[i] * R[1][j]));
};
export const whole = (t) => A2.map((row, i) => row.map((a, j) => (1 - t) * (i === j ? 1 : 0) + t * a));
export const END = [
  { tex: String.raw`A\vv u=2\vv u`, dx: -58, dy: -10 },
  { tex: String.raw`A\vv v=-\vv v`, dx: 40, dy: -22 },
];

/**
 * The square grid, the unit square and F moved by T_A on its way (gray: where they start), Stretch and
 * shrink's look: as a whole, (1 − t)I + tA, or, with `steps`, the stretch, then the flip. `eigs`: also u and v, in the style of the applets on Eigenlines: the square and F
 * faded back, the eigenlines amber and purple, u and v in their lines' colours. `images`: u and v
 * themselves move with T_A, u stretching, v flipping (the user's request; before, blue Au and Av
 * moved over them); their labels leave as they start, and when they are where A puts them, Au = 2u
 * (amber) and Av = −v (purple).
 */
export function Scene({ t, eigs, images, steps }) {
  const M = steps ? along(t) : whole(t);
  const [U, V] = EIGS2;
  return (
    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={8} grid={false} axes={false} title={eigs ? 'The grid, the unit square and F under A = (1/2)[1 3; 3 1], with u to 2u and v to −v' : 'The grid, the unit square and F under A = (1/2)[1 3; 3 1]'}>
      {(p) => {
        const Au = apply(M, U.v);
        const Av = apply(M, V.v);
        return (
          <g>
            <g opacity={eigs ? 0.5 : 1}>
              <GridImage p={p} M={M} />
              <FImage p={p} home />
              <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
            </g>
            {eigs && (
              <g>
                {EIGS2.map((e, i) => {
                  const f = times(6 / len(e.v), e.v);
                  return <polyline key={i} points={pts(p, [times(-1, f), f])} stroke={e.color} strokeWidth="2.6" opacity="0.6" fill="none" />;
                })}
                {/* u and v, or, with `images`, where T_A has taken them so far (v passes through 0 as it flips) */}
                {[images ? Au : U.v, images ? Av : V.v].map((q, i) => len(q) > 0.06 && <Arrow key={i} p={p} to={q} color={EIGS2[i].color} width={3} head={12} />)}
              </g>
            )}
            <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
            {eigs && (
              <g className="l15-sum-labels">
                {(!images || t < 0.001) &&
                  EIGS2.map((e, i) => <TipLabel key={i} p={p} v={e.v} tex={e.name} color={e.color} size={20} gap={i === 0 ? 2 : 16} dx={i === 0 ? 4 : 12} dy={i === 0 ? 18 : 0} />)}
                {images &&
                  t > 0.999 &&
                  EIGS2.map((e, i) => <TipLabel key={i} p={p} v={apply(M, e.v)} tex={END[i].tex} color={e.color} gap={0} dx={END[i].dx} dy={END[i].dy} />)}
              </g>
            )}
          </g>
        );
      }}
    </Plane>
  );
}

/**
 * What A does, played twice (the user's requests): key press 1, the picture appears and, a moment
 * later, T_A moves the grid, the unit square and F, as a whole; 2, they are back where they start, faded, with u
 * and v and their eigenlines (u amber like its line, v purple; the applets' style); 3, T_A plays again,
 * u and v moving with it, in two steps: u stretches by 2, then v flips; then Au = 2u (amber) and
 * Av = −v (purple).
 * Print: the end of the first play; u and v; the end of the second.
 */
export function Picture() {
  const [markers, on] = useMarkers([1, 2, 3]);
  const t1 = useTween(on[0], { ms: 4000, delay: 1200 });
  const t3 = useTween(on[2], { ms: 4000, delay: 600 });
  if (PRINT) {
    return (
      <>
        {markers}
        <Stills
          stills={[
            { at: 1, node: <Scene t={1} /> },
            { at: 2, node: <Scene t={0} eigs /> },
            { at: 3, node: <Scene t={1} eigs images /> },
          ]}
        />
      </>
    );
  }
  const scene = on[2] ? <Scene t={t3} eigs images steps /> : on[1] ? <Scene t={0} eigs /> : <Scene t={t1} />;
  return (
    <>
      {markers}
      <Fragment index={1}>{scene}</Fragment>
    </>
  );
}

/**
 * Example 1 (board): Mark's Example 1, in the user's words, on the user's A = (1/2)[1 3; 3 1] (it
 * stretches by 2 along y = x, u = (1, 1), and flips along y = −x, v = (1, −1); Mark's A = [3 −2; 2 −2],
 * u = (2, 1), v = (1, 2), was too complicated to be enlightening): show that u and v are eigenvectors,
 * and find their eigenvalues. The answers are commented out; key presses 1 to 3
 * (the user's requests): what A does, first to the unit square and F; then u, v and their eigenlines;
 * then T_A again, moving u and v.
 */
export default function Slide05Example1() {
  return (
    <section>
      <h2>
        Example 1 <span className="board-pill">board</span>
      </h2>

      <div className="l24-ex1">
        <div>
          <p className="l24-ex1-q">
            Show that <Tex tex={r`\vv u=\begin{bmatrix}1\\1\end{bmatrix}`} /> and <Tex tex={r`\vv v=\begin{bmatrix}1\\-1\end{bmatrix}`} /> are eigenvectors of{' '}
            <Tex tex={r`A=\dfrac12\begin{bmatrix}1&3\\3&1\end{bmatrix}`} />.
          </p>
          <p className="l24-ex-ask">
            What are the eigenvalues associated to <Tex tex={r`\vv u`} /> and <Tex tex={r`\vv v`} />?
          </p>
          {/* Au = (1/2)(1 + 3, 3 + 1) = (2, 2) = 2u: eigenvalue 2. Av = (1/2)(1 − 3, 3 − 1) = (−1, 1) = −v: eigenvalue −1. */}
        </div>
        <div className="l24-ex1-pic">
          <Picture />
        </div>
      </div>
    </section>
  );
}
