import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import CautionSign from '../components/CautionSign.jsx';
import Space, { Seg3, Patch3 } from '../components/Space.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, BLUE, AMBER, GREEN } from '../components/inv.js';
import { F } from '../components/FPanel.jsx';

export const GRAY = '#9ca3af';
export const SHEET = '#dbe7f5';

/** The 12 edges of the box [x0, x1] × [y0, y1] × [z0, z1]. */
export function boxEdges([x0, x1], [y0, y1], [z0, z1]) {
  const xs = [x0, x1];
  const ys = [y0, y1];
  const zs = [z0, z1];
  const out = [];
  for (const i of [0, 1]) for (const j of [0, 1]) out.push([[xs[i], ys[j], z0], [xs[i], ys[j], z1]]);
  for (const i of [0, 1]) for (const k of [0, 1]) out.push([[xs[i], y0, zs[k]], [xs[i], y1, zs[k]]]);
  for (const j of [0, 1]) for (const k of [0, 1]) out.push([[x0, ys[j], zs[k]], [x1, ys[j], zs[k]]]);
  return out;
}

export function Box({ s, x = [-1, 1], y = [-1, 1], z, dashed = false }) {
  return (
    <g>
      {boxEdges(x, y, z).map(([a, b], k) => (
        <Seg3 key={k} s={s} from={a} to={b} color={GRAY} width={dashed ? 1.2 : 1.6} opacity={dashed ? 0.7 : 1} dashed={dashed} />
      ))}
    </g>
  );
}

export const VIEW = { width: 320, height: 262, unit: 68, center: [0.5, 0.55], az: -38, el: 28, swing: 10, axes: false };

// T_A: ℝ² → ℝ³ lifts each point of ℝ² straight up or down onto the plane z = SLOPE · x (keeping its
// x and y), and T_B: ℝ³ → ℝ² squashes straight down, (x, y, z) ↦ (x, y) (the user's names: T_A first):
// so T_B ∘ T_A is the identity map of ℝ², and T_A ∘ T_B is not the identity map of ℝ³. ℝ² is the
// plane z = 0, through the middle of the gray box (ℝ³).
export const SLOPE = -0.7;
export const lift = ([u, v], k = 1) => [u, v, SLOPE * u * k];
export const SQUARE = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];
export const BOX_Z = [-0.9, 0.95];

/** ℝ², the blue square with its grid lines, each point q of it drawn at put(q). */
export function Sheet({ s, put }) {
  return (
    <g>
      <Patch3 s={s} corners={SQUARE.map(put)} fill={SHEET} opacity={0.85} stroke={BLUE} strokeOpacity={0.9} strokeWidth={1.8} />
      {[-0.5, 0, 0.5].map((c) => (
        <g key={c}>
          <Seg3 s={s} from={put([c, -1])} to={put([c, 1])} color={BLUE} width={0.9} opacity={0.45} />
          <Seg3 s={s} from={put([-1, c])} to={put([1, c])} color={BLUE} width={0.9} opacity={0.45} />
        </g>
      ))}
    </g>
  );
}

/** The labels: ℝ² (blue) at the point `r2`, ℝ³ at the top corner of the box, its top at height `top`. */
export function Names({ s, r2, top }) {
  return (
    <g>
      <TexSvg x={s.P(r2)[0] + 7} y={s.P(r2)[1]} tex={r`\mathbb R^2`} size={22} color={BLUE} anchor="start" w={50} h={34} />
      {top > 0.3 && <TexSvg x={s.P([-1, -1, top])[0] - 5} y={s.P([-1, -1, top])[1]} tex={r`\mathbb R^3`} size={22} color={INK} anchor="end" w={50} h={34} />}
    </g>
  );
}

// the letter F in ℝ² (the unit square's F, enlarged), lying upright for the viewer (its right along
// (sin az, cos az), its up along (−cos az, sin az), away from the viewer), at the back, x < 0, where
// T_A's plane is above ℝ², so that the whole F rises
export const AZ = (VIEW.az * Math.PI) / 180;
export const FL = F.map(([p, q]) => {
  const [a, b] = [1.15 * (p - 0.515), 1.15 * (q - 0.5)];
  return [-0.48 + a * Math.sin(AZ) - b * Math.cos(AZ), 0.02 + a * Math.cos(AZ) + b * Math.sin(AZ)];
});

// an F standing upright in ℝ³ (the user's request, in place of two points on a vertical line), facing
// the viewer (its right along (sin az, cos az), its up along z), above ℝ²: T_B flattens it to a
// segment, so T_A ∘ T_B cannot bring it back
export const FV = F.map(([p, q]) => {
  const a = 1.15 * (p - 0.515);
  return [0.12 + a * Math.sin(AZ), 0.22 + a * Math.cos(AZ), 0.48 + 1.15 * (q - 0.5)];
});

/**
 * T_B ∘ T_A: ℝ² → ℝ², in one picture: T_A (`a`: ℝ², with an F on it, lifted onto the plane inside ℝ³,
 * a gray box), then T_B on top of it (`b`: the box squashed straight down, the plane with it), so that
 * ℝ² lands back on itself (its dashed outline), the F on its dashed outline, outlined in green.
 */
export function ComposeBA({ a, b }) {
  const h = 1 - b;
  const put = (q) => {
    const [x, y, z] = lift(q, a);
    return [x, y, z * h];
  };
  return (
    <Space {...VIEW} title="A plane lifted into three-dimensional space and squashed straight back: every point comes back to itself">
      {(s) => (
        <g>
          <Box s={s} z={BOX_Z.map((z) => z * h)} />
          <Patch3 s={s} corners={SQUARE.map((q) => [...q, 0])} fill="none" stroke={BLUE} strokeOpacity={0.6} strokeWidth={1.3} strokeDasharray="6 5" />
          <Sheet s={s} put={put} />
          <Patch3 s={s} corners={FL.map((q) => [...q, 0])} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.3} strokeDasharray="5 4" />
          <Patch3 s={s} corners={FL.map(put)} fill={AMBER} opacity={0.85} stroke={AMBER} strokeOpacity={1} strokeWidth={1.3} />
          {b >= 1 && (
            <Patch3 s={s} corners={FL.map((q) => [...q, 0])} fill="none" stroke={GREEN} strokeOpacity={1} strokeWidth={3} className="l18-caution-pop" />
          )}
          <Names s={s} r2={put([1, 1])} top={BOX_Z[1] * h} />
        </g>
      )}
    </Space>
  );
}

/**
 * T_A ∘ T_B: ℝ³ → ℝ³, in one picture: T_B (`b`: ℝ³, a gray box, squashed onto ℝ², an upright F
 * flattening to a segment), then T_A on top of it (`a`: ℝ² lifted onto the plane, the flattened F with
 * it), inside ℝ³ (the box, dashed once squashed): the F ends as a segment on the plane, away from
 * where it started (its dashed outline).
 */
export function ComposeAB({ b, a }) {
  const h = 1 - b;
  const put = (q) => lift(q, a);
  const move = ([x, y, z]) => [x, y, z * h + SLOPE * x * a];
  return (
    <Space {...VIEW} title="Three-dimensional space squashed onto a plane and lifted onto another: the points do not come back">
      {(s) => (
        <g>
          {b > 0 && <Box s={s} z={BOX_Z} dashed />}
          <Sheet s={s} put={put} />
          {h > 0 && <Box s={s} z={BOX_Z.map((z) => z * h)} />}
          {b > 0 && <Patch3 s={s} corners={FV} fill="none" stroke={INK} strokeOpacity={0.8} strokeWidth={1.6} strokeDasharray="5 4" />}
          <Patch3 s={s} corners={FV.map(move)} fill={AMBER} opacity={0.85} stroke={AMBER} strokeOpacity={1} strokeWidth={2.4} strokeLinejoin="round" />
          <Names s={s} r2={put([1, 1])} top={BOX_Z[1]} />
        </g>
      )}
    </Space>
  );
}

/**
 * Caution (the user's request, after Inverse of a matrix; Exercise 18.4, with little of its math, not
 * to spoil the homework): a linear transformation T: ℝⁿ → ℝᵐ cannot be invertible when n ≠ m, even
 * though a one-sided inverse might exist (the user's words). Key press 1: T_B ∘ T_A, one animation, T_A
 * and then T_B on top of it, ℝ² and an F on it coming back to themselves; 2: the other way, T_A ∘ T_B,
 * an upright F flattened to a segment on the plane, away from where it started (first two points,
 * ringed; the user's request), and (→ Exercise 18.4). Next to each
 * picture, its steps, each appearing as its map starts: "T_A: ℝ² → ℝ³", "T_B: ℝ³ → ℝ² collapsing into
 * a plane" (the user's words; T_A and T_B on their own, and the verdicts under the pictures, removed
 * by the user). Under each picture, once it has ended, its verdict (the user's request, later):
 * "composition is identity", "composition is NOT identity", the NOT red. Print: as each ends up.
 */
export default function Slide04cCaution() {
  const refs = [useRef(null), useRef(null)];
  const on = refs.map(useFragmentShown);
  const first = { ms: 1600, delay: 500 };
  const then = { ms: 1600, delay: 500 + 1600 + 600 };
  const baA = useTween(on[0], first);
  const baB = useTween(on[0], then);
  const abB = useTween(on[1], first);
  const abA = useTween(on[1], then);
  const stepA = (
    <>
      <Tex tex={r`T_A:\mathbb R^2\to\mathbb R^3`} />
    </>
  );
  const stepB = (
    <>
      <Tex tex={r`T_B:\mathbb R^3\to\mathbb R^2`} /> <span className="l18-caution-nobreak">collapsing into a plane</span>
    </>
  );
  const step = (t) => `l18-caution-step${PRINT || t > 0 ? ' is-on' : ''}`;
  // the verdict under each picture, once its animation has ended
  const verdict = (t) => `l18-caution-verdict${PRINT || t >= 1 ? ' is-on' : ''}`;
  return (
    <section>
      <div className="l15-caution-head">
        <h2>Caution</h2>
        <CautionSign />
      </div>
      {refs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      <p className="l18-caution-claim">
        A linear transformation <Tex tex={r`T:\mathbb R^n\to\mathbb R^m`} /> cannot be invertible when <Tex tex={r`n\neq m`} />, even
        though a one-sided inverse might exist.
      </p>

      <div className="l18-caution-row">
        <Fragment index={1} className="l18-caution-card">
          <div className="l18-caution-left">
            <p className="l18-caution-name">
              <Tex tex={r`T_B\circ T_A:\mathbb R^2\to\mathbb R^2`} />
            </p>
            <div className="l18-caution-pic">
              <ComposeBA a={PRINT ? 1 : baA} b={PRINT ? 1 : baB} />
            </div>
            <p className={verdict(baB)}>composition is identity</p>
          </div>
          <div className="l18-caution-steps">
            <p className={step(baA)}>{stepA}</p>
            <p className={step(baB)}>{stepB}</p>
          </div>
        </Fragment>
        <Fragment index={2} className="l18-caution-card">
          <div className="l18-caution-left">
            <p className="l18-caution-name">
              <Tex tex={r`T_A\circ T_B:\mathbb R^3\to\mathbb R^3`} />
            </p>
            <div className="l18-caution-pic">
              <ComposeAB b={PRINT ? 1 : abB} a={PRINT ? 1 : abA} />
            </div>
            <p className={verdict(abA)}>
              composition is <span className="l18-not">NOT</span> identity
            </p>
          </div>
          <div className="l18-caution-steps">
            <p className={step(abB)}>{stepB}</p>
            <p className={step(abA)}>{stepA}</p>
          </div>
        </Fragment>
      </div>

      <Fragment index={2} as="p" className="pointer right l18-caution-pointer">
        (→ Exercise 18.4)
      </Fragment>
    </section>
  );
}
