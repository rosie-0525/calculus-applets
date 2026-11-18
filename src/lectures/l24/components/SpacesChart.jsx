import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Plane, { Arrow } from './Plane.jsx';
import { TipLabel } from './SumPicture.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { ProjScene } from './ProjPlane.jsx';
import { useMarkers, Stills } from './Staged.jsx';
import { useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { A2, EIGS2, INK, BLUE, apply, len, pts, times } from './eig.js';
import Name from './SpaceName.jsx';

// Eigenspace's Examples 1 and 2 (the user's request: Eigenspaces in Examples 1 and 2, Slide10bEigenspaces,
// moved onto Eigenspace, under the definition; its lines "2-eigenspace of A = span{u}" etc. removed, to
// save space: each eigenspace's name is a label in its picture instead, as it lights up)

const XR = [-1.4, 2.5];
const YR = [-1.45, 2.45];
const UNIT = 70;
// Example 2's picture, as tall as Example 1's, so that the rows under them are level
const SIZE = { width: 310, height: 289, unit: 36, center: [0.535, 0.59] };
const FADE = { ms: 400, delay: 0 };
const GLOW = { ms: 600, delay: 0 };
// T_A on its way, as on Example 1. The first play, as a whole: (1 − t)I + tA. The second, with u and
// v, in two steps: u's line stretches, its factor 1 → 2 (t from 0 to 0.45); a pause; then the plane
// turns over about u's line, v's factor cos(πs) from 1 to −1 (t from 0.55 to 1). In the eigenbasis:
// M = a u r₁ + b v r₂, with r₁, r₂ the rows of [u v]⁻¹.
const whole = (t) => A2.map((row, i) => row.map((a, j) => (1 - t) * (i === j ? 1 : 0) + t * a));
const [EU, EV] = EIGS2.map((e) => e.v);
const DET = EU[0] * EV[1] - EV[0] * EU[1];
const R = [
  [EV[1] / DET, -EV[0] / DET],
  [-EU[1] / DET, EU[0] / DET],
];
const clamp = (x) => Math.min(1, Math.max(0, x));
const along = (t) => {
  const a = 1 + clamp(t / 0.45);
  const b = Math.cos(Math.PI * clamp((t - 0.55) / 0.45));
  return [0, 1].map((i) => [0, 1].map((j) => a * EU[i] * R[0][j] + b * EV[i] * R[1][j]));
};
// the labels once the second play is over (Example 1's), at the tips of 2u and −v
const END = [
  { tex: String.raw`A\vv u=2\vv u`, dx: -58, dy: -10 },
  { tex: String.raw`A\vv v=-\vv v`, dx: 40, dy: -22 },
];
// each eigenspace's name, along its line on the bottom half (2u and −v are on the top half once T_A
// has played): at c times its eigenvector, set off the line by OFF px, clear of its band (u's to the
// upper left, v's to the upper right, away from each other)
const OFF = 17;
const NAMES = [
  { c: -0.8, off: [-1, -1], deg: -45, name: <><Tex tex="2" />-eigenspace</> },
  { c: 0.8, off: [1, -1], deg: 45, name: <><Tex tex="(-1)" />-eigenspace</> },
];


/**
 * Example 1's picture, in its style: the grid, the unit square and F moved by T_A on its way (gray:
 * where they start); `back` (0 → 1): back where they start, faded; `show`: the opacity of u and of v,
 * each with its eigenline (amber, purple); `again` (0 → 1): T_A's second play, u and v moving with
 * the grid and F, u stretching, then v flipping; their labels leave as it starts, and Au = 2u and
 * Av = −v come when it is over; `halo`: a soft band round each line, its eigenspace, and its name
 * along it (2-eigenspace, (−1)-eigenspace).
 */
function Scene1({ t = 0, back = 0, show = [0, 0], again = 0, halo = [0, 0] }) {
  const M = again > 0 ? along(again) : whole(t * (1 - back));
  return (
    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={8} grid={false} axes={false} title="The grid, the unit square and F under A = (1/2)[1 3; 3 1], then u and v and their lines, the eigenspaces of A">
      {(p) => (
        <g>
          <g opacity={1 - 0.5 * back}>
            <GridImage p={p} M={M} />
            <FImage p={p} home />
            <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
          </g>
          {EIGS2.map((e, i) => {
            const f = times(6 / len(e.v), e.v);
            const line = pts(p, [times(-1, f), f]);
            const tip = apply(M, e.v);
            return (
              <g key={i} opacity={show[i]}>
                <polyline points={line} stroke={e.color} strokeWidth="14" strokeLinecap="round" opacity={0.18 * halo[i]} fill="none" />
                <polyline points={line} stroke={e.color} strokeWidth="2.6" opacity="0.6" fill="none" />
                {/* v passes through 0 as it flips */}
                {len(tip) > 0.06 && <Arrow p={p} to={tip} color={e.color} width={3} head={12} />}
              </g>
            );
          })}
          <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
          <g className="l15-sum-labels">
            {EIGS2.map((e, i) => (
              <g key={i} opacity={show[i]}>
                {again < 0.001 && <TipLabel p={p} v={e.v} tex={e.name} color={e.color} size={20} gap={i === 0 ? 2 : 16} dx={i === 0 ? 4 : 12} dy={i === 0 ? 18 : 0} />}
                {again > 0.999 && <TipLabel p={p} v={apply(M, e.v)} tex={END[i].tex} color={e.color} size={20} gap={0} dx={END[i].dx} dy={END[i].dy} />}
              </g>
            ))}
            {EIGS2.map((e, i) => {
              const n = NAMES[i];
              const q = times(n.c, e.v);
              return (
                <Name key={i} x={p.px(q[0]) + (OFF * n.off[0]) / Math.SQRT2} y={p.py(q[1]) + (OFF * n.off[1]) / Math.SQRT2} deg={n.deg} color={e.color} opacity={halo[i]}>
                  {n.name}
                </Name>
              );
            })}
          </g>
        </g>
      )}
    </Plane>
  );
}

/**
 * Example 1: key press 1, the picture comes with A and, a moment later, T_A moves the grid, the square
 * and F (Example 1's first play); 2, they go back where they start, faded, and u comes with its
 * eigenline; 3, v and its eigenline; 4, T_A plays again, u and v moving with it (Example 1's second
 * play); 5 and 6, each line lights up, its eigenspace. Print: a still per key press, the end of each.
 */
function Picture1() {
  const [markers, on] = useMarkers([1, 2, 3, 4, 5, 6]);
  const t = useTween(on[0], { ms: 4000, delay: 1200 });
  const back = useTween(on[1], { ms: 700, delay: 0 });
  const u = useTween(on[1], { ms: 400, delay: 600 });
  const v = useTween(on[2], FADE);
  const again = useTween(on[3], { ms: 4000, delay: 600 });
  const hu = useTween(on[4], GLOW);
  const hv = useTween(on[5], GLOW);
  if (PRINT) {
    const both = { back: 1, show: [1, 1] };
    return (
      <>
        {markers}
        <Stills
          stills={[
            { at: 1, node: <Scene1 t={1} /> },
            { at: 2, node: <Scene1 back={1} show={[1, 0]} /> },
            { at: 3, node: <Scene1 {...both} /> },
            { at: 4, node: <Scene1 {...both} again={1} /> },
            { at: 5, node: <Scene1 {...both} again={1} halo={[1, 0]} /> },
            { at: 6, node: <Scene1 {...both} again={1} halo={[1, 1]} /> },
          ]}
        />
      </>
    );
  }
  return (
    <>
      {markers}
      <Scene1 t={t} back={back} show={[u, v]} again={again} halo={[hu, hv]} />
    </>
  );
}

/**
 * Example 2: The linear transformation T_B's picture. Key press 7, P comes with B, then a vector x and,
 * a moment later, Bx dropping onto P (T_B's projection, as there); 8, x and Bx fade out, and a =
 * (2, −1, 0) comes with its eigenline in P (amber); 9, b = (3, 0, −1) and its eigenline; 10, n =
 * (1, 2, 3) and its eigenline (purple); 11, T_B plays again on them: a and b stay, and Bn shrinks
 * into 0 (a dashed copy of n stays), as there; 12, P lights up (the 1-eigenspace); 13, the line of n
 * lights up (the 0-eigenspace, named "0-eigenspace = N(B)", the user's request: the example before
 * the general fact, on Eigenspace's key press 15); 14, one more eigenline in P, the line of a − b. Each eigenspace's
 * name comes as it lights up (ProjScene's `names`). Print: a still per key
 * press, the end of each.
 */
function Picture2() {
  const [markers, on] = useMarkers([7, 8, 9, 10, 11, 12, 13, 14]);
  const xIn = useTween(on[0], FADE);
  const tx = useTween(on[0], { ms: 1900, delay: 1000 });
  const xOut = useTween(on[1], FADE);
  const a = useTween(on[1], { ms: 400, delay: 300 });
  const b = useTween(on[2], FADE);
  const n = useTween(on[3], FADE);
  const tn = useTween(on[4], { ms: 1900, delay: 600 });
  const glowP = useTween(on[5], GLOW);
  const haloN = useTween(on[6], GLOW);
  const line = useTween(on[7], GLOW);
  if (PRINT) {
    const ab = { a: 1, lineA: 1, b: 1, lineB: 1 };
    const abn = { ...ab, n: 1, lineN: 1 };
    const moved = { ...abn, tn: 1 };
    return (
      <>
        {markers}
        <Stills
          stills={[
            { at: 7, node: <ProjScene {...SIZE} x={1} tx={1} /> },
            { at: 8, node: <ProjScene {...SIZE} a={1} lineA={1} /> },
            { at: 9, node: <ProjScene {...SIZE} {...ab} /> },
            { at: 10, node: <ProjScene {...SIZE} {...abn} /> },
            { at: 11, node: <ProjScene {...SIZE} {...moved} /> },
            { at: 12, node: <ProjScene {...SIZE} {...moved} glowP={1} names={[1, 0]} /> },
            { at: 13, node: <ProjScene {...SIZE} {...moved} glowP={1} haloN={1} names={[1, 1]} /> },
            { at: 14, node: <ProjScene {...SIZE} {...moved} glowP={1} haloN={1} line={1} names={[1, 1]} /> },
          ]}
        />
      </>
    );
  }
  return (
    <>
      {markers}
      <ProjScene {...SIZE} x={xIn * (1 - xOut)} tx={tx} a={a} lineA={a} b={b} lineB={b} n={n} lineN={n} tn={tn} glowP={glowP} haloN={haloN} line={line} names={[glowP, haloN]} />
    </>
  );
}

/**
 * Examples 1 and 2 on Eigenspace (once Eigenspaces in Examples 1 and 2, its own slide, after
 * Eigenspace): a T-chart, Example 1 | Example 2, the examples one after the other (the user's order):
 * each comes with its matrix and what it does (Example 1's play of T_A; The linear transformation T_B's
 * x dropping onto P), then its eigenvectors one by one, each with its eigenline, then the
 * transformation plays again on them, then its eigenspaces, each lighting up in its picture with its
 * name (the user's request, in place of the lines under the pictures). Example 1, key presses 1–6: A
 * and T_A; u; v; T_A again, Au = 2u and Av = −v; the 2-eigenspace of A, span{u} (amber); the
 * (−1)-eigenspace, span{v} (purple). Example 2, 7–13: B and T_B; (2, −1, 0); (3, 0, −1); (1, 2, 3);
 * T_B again, (1, 2, 3) shrinking into 0; the 1-eigenspace of B, the plane P (amber); the 0-eigenspace = N(B),
 * the line of (1, 2, 3) (purple). 14: one more line in P lights up, an eigenline in the 1-eigenspace.
 */
export default function SpacesChart() {
  return (
    <div className="l22-tchart l24-spaces">
      <Fragment index={1} className="l22-tcol">
        <p className="l22-thead">Example 1</p>
        <div className="l24-spaces-ex">
          <Tex tex={r`A=\dfrac12\begin{bmatrix}1&3\\3&1\end{bmatrix}`} />
          <div className="l24-spaces-pic">
            <Picture1 />
          </div>
        </div>
      </Fragment>
      <Fragment index={7} className="l22-tcol">
        <p className="l22-thead">Example 2</p>
        <div className="l24-spaces-ex">
          <Tex tex={r`B=\dfrac1{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          <div className="l24-spaces-pic">
            <Picture2 />
          </div>
        </div>
      </Fragment>
    </div>
  );
}
