import Space, { Arrow3, Seg3, Dot3, Patch3, RightAngle3 } from './Space.jsx';
import TexSvg from './TexSvg.jsx';
import Tex from './Tex.jsx';
import Name from './SpaceName.jsx';
import { useMarkers, Stills } from './Staged.jsx';
import { useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { INK, BLUE, AMBER, PURPLE, clamp01, col } from './eig.js';

// Mark's Example 2: B is the projection onto the plane P: x + 2y + 3z = 0, spanned by a and b; n ⟂ P
const A = [2, -1, 0];
const B = [3, 0, -1];
const N = [1, 2, 3];
const dot3 = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const sc = (c, u) => u.map((x) => c * x);
const add = (u, v) => u.map((x, i) => x + v[i]);
const unit3 = (u) => sc(1 / Math.hypot(...u), u);
// the picture's frame: P is its floor (E1, E2 in P, a right-handed frame with E3 = n/‖n‖), turned by
// PHI in the floor so that a comes towards the front left and b towards the front right
const E1 = unit3(A);
const E2 = unit3(add(B, sc(-dot3(B, E1), E1)));
const E3 = unit3(N);
const PHI = (24 * Math.PI) / 180;
const view = (p) => {
  const [x, y, z] = [dot3(p, E1), dot3(p, E2), dot3(p, E3)];
  return [x * Math.cos(PHI) - y * Math.sin(PHI), x * Math.sin(PHI) + y * Math.cos(PHI), z];
};
const PA = view(A);
const PB = view(B);
const PN = view(N);
const X = [-0.3, -2.0, 2.0]; // a vector off the plane, in the picture's frame; Bx is under it
const BX = [X[0], X[1], 0];
const PATCH = [
  [-1.6, -2.6, 0],
  [3.3, -2.6, 0],
  [3.3, 3.3, 0],
  [-1.6, 3.3, 0],
];
// the line through 0 in P along d, from edge to edge of the patch (a little inside it): on Eigenspace's
// Example 2, the eigenlines of a and b, and the line of a − b
const across = (d, k = 0.97) => {
  let lo = -Infinity;
  let hi = Infinity;
  [0, 1].forEach((i) => {
    if (Math.abs(d[i]) < 1e-9) return;
    const [t1, t2] = [PATCH[0][i] / d[i], PATCH[2][i] / d[i]];
    lo = Math.max(lo, Math.min(t1, t2));
    hi = Math.min(hi, Math.max(t1, t2));
  });
  return [sc(k * lo, d), sc(k * hi, d)];
};
const LINE_A = across(PA);
const LINE_B = across(PB);
const LINE = across(add(PA, sc(-1, PB)));
const vec3 = (v) => String.raw`\begin{bmatrix}${v.join(String.raw`\\ `)}\end{bmatrix}`;
// Eigenspace's Example 2: where the eigenspaces' names go, P's on the free left part of the patch, n's
// beside its line, on the left (its vector's label is on the right)
const NAME_P = [2.03, -1.51, 0];
const NAME_N = 0.7;

/**
 * The picture at a moment: `ab` (opacity of a, b), or `a` and `b` for each on its own; `n` (of n), `tn` (0 → 1: Bn shrinks from n into
 * 0), `x` (opacity of x), `tx` (0 → 1: Bx drops from x onto P), `glow` (P and the line of n lit up),
 * or `glowP` and `glowN` for each on its own; `line` (opacity of an eigenline in P, the line of a − b, amber).
 * For Eigenspace's Example 2 (SpacesChart.jsx): `lineA`, `lineB` (the eigenlines of a and b, amber), `lineN`
 * (the line of n, without lighting up P), `haloN` (a soft purple band round it: its eigenspace);
 * `names`: the opacities of the names of P and of the line of n, the 1-eigenspace and the
 * 0-eigenspace = N(B) (Eigenspace's Example 2, the user's requests).
 */
export function ProjScene({ ab = 0, a = ab, b = ab, n = 0, tn = 0, x = 0, tx = 0, glow = 0, glowP = glow, glowN = glow, lineN = glowN, haloN = 0, line = 0, lineA = 0, lineB = 0, names = [0, 0], width, height, unit, center }) {
  const bn = sc(1 - tn, PN);
  const bx = [X[0], X[1], X[2] * (1 - tx)];
  const landed = clamp01((tx - 0.85) / 0.15);
  return (
    <Space width={width} height={height} unit={unit} center={center} axes={false} swing={8} title="The plane P, two vectors in it, and the vector n perpendicular to it, which the projection B sends to 0">
      {(s) => {
        const lab = (at, tex, color, dx, dy, opacity, w = 60) => <TexSvg x={s.P(at)[0] + dx} y={s.P(at)[1] + dy} tex={tex} size={17} color={color} opacity={opacity} w={w} h={70} />;
        return (
          <g>
            {/* the line of n under the plane */}
            <Seg3 s={s} from={sc(-0.42, PN)} to={[0, 0, 0]} color={PURPLE} width={12} opacity={0.18 * haloN} strokeLinecap="round" />
            <Seg3 s={s} from={sc(-0.42, PN)} to={[0, 0, 0]} color={PURPLE} width={2.4} opacity={0.5 * lineN} />
            <Patch3 s={s} corners={PATCH} fill={AMBER} opacity={0.1 + 0.16 * glowP} stroke={AMBER} strokeOpacity={0.55 + 0.3 * glowP} strokeWidth={1.4} />
            <Seg3 s={s} from={LINE_A[0]} to={LINE_A[1]} color={AMBER} width={2.6} opacity={0.6 * lineA} />
            <Seg3 s={s} from={LINE_B[0]} to={LINE_B[1]} color={AMBER} width={2.6} opacity={0.6 * lineB} />
            <Seg3 s={s} from={LINE[0]} to={LINE[1]} color={AMBER} width={3} opacity={line} />
            <Arrow3 s={s} to={PA} color={AMBER} width={3.4} head={12} opacity={a} />
            <Arrow3 s={s} to={PB} color={AMBER} width={3.4} head={12} opacity={b} />
            <g opacity={x}>
              <Seg3 s={s} from={X} to={bx} color={INK} width={2} strokeDasharray="0.1 6.5" />
              <g opacity={landed}>
                <RightAngle3 s={s} corner={BX} a={[0, 0, 1]} b={sc(-1, BX)} size={0.3} color={INK} />
              </g>
              <Arrow3 s={s} to={bx} color={BLUE} width={4} head={13} />
              <Arrow3 s={s} to={X} color={INK} width={3} head={12} />
            </g>
            <g opacity={n}>
              <Seg3 s={s} from={[0, 0, 0]} to={sc(1.12, PN)} color={PURPLE} width={12} opacity={0.18 * haloN} strokeLinecap="round" />
              <Seg3 s={s} from={[0, 0, 0]} to={sc(1.12, PN)} color={PURPLE} width={2.4} opacity={0.5 * lineN} />
              {/* where n was, once Bn has left it */}
              <Seg3 s={s} from={[0, 0, 0]} to={PN} color={PURPLE} width={2} strokeDasharray="5 5" opacity={tn > 0.02 ? 0.75 * (1 - glowN) : 0} />
              {tn < 0.985 && <Arrow3 s={s} to={bn} color={PURPLE} width={3.6} head={12} />}
            </g>
            <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3.6} />

            <g className="l15-sum-labels">
              {lab(PATCH[3], col(AMBER, 'P'), AMBER, -40, 2, 1, 30)}
              {lab(PA, vec3(A), AMBER, -22, 34, a)}
              {lab(PB, vec3(B), AMBER, 24, 30, b)}
              {lab(PN, vec3(N), PURPLE, 30, 6, n)}
              {lab(X, String.raw`\vv x`, INK, -14, -10, x, 30)}
              {lab(BX, String.raw`B\vv x`, BLUE, -30, 8, x * landed, 50)}
              {names[0] > 0 && (
                <Name x={s.P(NAME_P)[0]} y={s.P(NAME_P)[1]} color={AMBER} opacity={names[0]}>
                  <Tex tex="1" />
                  -eigenspace
                </Name>
              )}
              {names[1] > 0 && (
                <Name x={s.P(sc(NAME_N, PN))[0] - 82} y={s.P(sc(NAME_N, PN))[1]} color={PURPLE} opacity={names[1]}>
                  <Tex tex="0" />
                  -eigenspace <Tex tex="{}=N(B)" />
                </Name>
              )}
            </g>
          </g>
        );
      }}
    </Space>
  );
}

const FADE = { ms: 350, delay: 0 };
const MOVE = { ms: 1900, delay: 1000 };

/**
 * The linear transformation T_B (after Example 2), on key presses `at` = { ab, n, x, all }: `ab`, a = (2, −1, 0) and
 * b = (3, 0, −1) in P; `n`, n = (1, 2, 3), then Bn shrinking into 0 (a dashed copy of n stays); `x`, a
 * vector x off the plane, then Bx dropping onto P, with the dotted perpendicular and its right angle;
 * `all`, P and the line of n light up (in any order). Print: a still per key press, the end of each.
 */
export default function ProjPlane({ at, width = 500, height = 440, unit = 60, center = [0.53, 0.58] }) {
  const [markers, on] = useMarkers([at.ab, at.n, at.x, at.all]);
  const ab = useTween(on[0], FADE);
  const n = useTween(on[1], FADE);
  const tn = useTween(on[1], MOVE);
  const x = useTween(on[2], FADE);
  const tx = useTween(on[2], MOVE);
  const glow = useTween(on[3], { ms: 600, delay: 0 });
  const size = { width, height, unit, center };
  if (PRINT) {
    // a still per key press, in the order of the key presses, each with everything shown so far
    const steps = [
      ['ab', { ab: 1 }],
      ['n', { n: 1, tn: 1 }],
      ['x', { x: 1, tx: 1 }],
      ['all', { glow: 1 }],
    ].sort((p, q) => at[p[0]] - at[q[0]]);
    const stills = [{ node: <ProjScene {...size} /> }];
    steps.reduce((shown, [k, more]) => {
      const now = { ...shown, ...more };
      stills.push({ at: at[k], node: <ProjScene {...size} {...now} /> });
      return now;
    }, {});
    return (
      <>
        {markers}
        <Stills stills={stills} />
      </>
    );
  }
  return (
    <>
      {markers}
      <ProjScene {...size} ab={ab} n={n} tn={tn} x={x} tx={tx} glow={glow} />
    </>
  );
}
