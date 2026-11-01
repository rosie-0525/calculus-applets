import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Arrow3, Seg3, Dot3, Patch3, RightAngle3 } from '../components/Space.jsx';
import { Lbl, Sp } from '../components/GS3D.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, TEAL, AMBER, GRAY, fit } from '../components/gs.js';

/*
 * The workshop's vectors a = (1, 2, 3), b = (4, 5, 6), drawn in a frame where V₁ = span{a, b} is the
 * floor z = 0 and V₁′ = span{(1, −2, 1)} the vertical line: a and b keep their lengths and the angle
 * between them (12.95°), b clockwise from a seen from above, so that (1, −2, 1) = −(a × b)/3 points
 * up. All three are scaled by K. V₁ and the plane (V₁⊥)⊥ are a rectangle of the floor (a plane, not a
 * disc, at the user's request), 2RX by 2RY, turned TURN off level so that it shows as a parallelogram;
 * the sweep fills the rectangle.
 */
export const K = 0.28;
export const deg = (d) => (d * Math.PI) / 180;
export const PHI_A = deg(97);
export const PHI_B = PHI_A - Math.acos(32 / Math.sqrt(14 * 77));
export const flat = (phi, len = 1) => [len * Math.cos(phi), len * Math.sin(phi), 0];
export const A = flat(PHI_A, K * Math.sqrt(14));
export const B = flat(PHI_B, K * Math.sqrt(77));
export const N = [0, 0, K * Math.sqrt(6)];
export const RX = 3.1;
export const RY = 2.6;
export const TOP = 2.3; // the ends of the line
export const BOT = -1.3;
export const SWEEP0 = deg(10); // where the vector sweeping out (V₁⊥)⊥ starts, at the front left
export const TURN = deg(-40 + 30); // Space's default azimuth, −40°, turned by 30°
export const ACROSS = [Math.sin(TURN), Math.cos(TURN)]; // left to right, were the turn 0
export const TOWARDS = [Math.cos(TURN), -Math.sin(TURN)]; // towards the viewer, likewise
/** The floor's point u along the rectangle's long side and w along its short side. */
export const at = (u, w) => [u * ACROSS[0] + w * TOWARDS[0], u * ACROSS[1] + w * TOWARDS[1], 0];
export const PLANE = [at(RX, RY), at(-RX, RY), at(-RX, -RY), at(RX, -RY)];
export const LABEL_AT = at(-0.62 * RX, 0.5 * RY); // the planes' label, inside the rectangle at the front left
/** Where the ray from 0 at angle phi leaves the rectangle. */
export function edge(phi) {
  const [c, s] = [Math.cos(phi), Math.sin(phi)];
  const u = Math.abs(c * ACROSS[0] + s * ACROSS[1]);
  const w = Math.abs(c * TOWARDS[0] + s * TOWARDS[1]);
  return flat(phi, Math.min(RX / u, RY / w));
}
/** The part of the rectangle swept out from angle `from` to `to`: 0, then its edge, corners included. */
export function sector(from, to, steps = 96) {
  const corners = PLANE.map(([x, y]) => {
    let a = Math.atan2(y, x);
    while (a <= from) a += 2 * Math.PI;
    return a;
  }).filter((a) => a < to);
  const angles = [...Array.from({ length: steps + 1 }, (_, k) => from + ((to - from) * k) / steps), ...corners].sort((a, b) => a - b);
  return [[0, 0, 0], ...angles.map(edge)];
}
export const W = 460;
export const H = 330;
export const EL = 32; // the view a little higher than the deck's 24°, so that the plane reads as a sheet
export const FIT = fit([...PLANE, [0, 0, TOP], [0, 0, BOT]], W, H, { pad: 22, el: EL });

/** c₁ on a straight path to c₂ (hex colours), t from 0 to 1. */
export function mix(c1, c2, t) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [a, b] = [p(c1), p(c2)];
  return `rgb(${a.map((v, i) => Math.round(v + t * (b[i] - v))).join(',')})`;
}

/** (V₁⊥)⊥, for the picture's labels. */
export function PerpPerp() {
  return (
    <>
      (<Sp i={1} sup="⊥" />)
      <tspan baselineShift="super" fontSize="0.68em">
        ⊥
      </tspan>
    </>
  );
}

/**
 * The plane V₁ (teal) with a and b; `t1`: the line V₁⊥ (amber) grows out of 0, perpendicular to it;
 * `t2`: V₁ fades to a dashed grey ghost; `t3`: a vector perpendicular to the line sweeps once round
 * it, sweeping out (V₁⊥)⊥ (teal), which lands on V₁.
 */
export function Picture({ t1, t2, t3, title }) {
  const planeCol = mix(TEAL, GRAY, t2);
  const swept = t3 > 0.999;
  const th = SWEEP0 + 2 * Math.PI * t3;
  const u = flat(th, 2.1);
  return (
    <Space width={W} height={H} {...FIT} el={EL} axes={false} title={title}>
      {(s) => (
        <g>
          {/* the line below the floor, behind it */}
          {t1 > 0 && <Seg3 s={s} from={[0, 0, BOT * t1]} to={[0, 0, 0]} color={AMBER} width={3} opacity={0.45} />}

          {/* V₁, a ghost while (V₁⊥)⊥ is swept out, which then takes its place */}
          {!swept && (
            <Patch3 s={s} corners={PLANE} fill={planeCol} opacity={0.1 - 0.05 * t2} stroke={planeCol} strokeOpacity={0.6} strokeDasharray={t2 > 0 ? '6 5' : undefined} />
          )}
          {t3 > 0 && <Patch3 s={s} corners={swept ? PLANE : sector(SWEEP0, th)} fill={TEAL} opacity={0.1} stroke={TEAL} strokeOpacity={swept ? 0.6 : 0} />}

          <Arrow3 s={s} to={A} color={INK} width={3.2} />
          <Arrow3 s={s} to={B} color={INK} width={3.2} />

          {t1 > 0 && <Seg3 s={s} from={[0, 0, 0]} to={[0, 0, TOP * t1]} color={AMBER} width={3} />}
          {t1 > 0.999 && (
            <g>
              <Arrow3 s={s} to={N} color={AMBER} width={3.6} />
              <RightAngle3 s={s} corner={[0, 0, 0]} a={[0, 0, 1]} b={A} size={0.26} color={AMBER} />
              <RightAngle3 s={s} corner={[0, 0, 0]} a={[0, 0, 1]} b={B} size={0.26} color={AMBER} />
            </g>
          )}
          {t3 > 0 && !swept && (
            <g>
              <Arrow3 s={s} to={u} color={TEAL} width={3.4} />
              <RightAngle3 s={s} corner={[0, 0, 0]} a={[0, 0, 1]} b={u} size={0.26} color={TEAL} />
            </g>
          )}
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />

          {/* labels last */}
          <Lbl s={s} at={A} dx={2} dy={-12} size={17}>
            (1, 2, 3)
          </Lbl>
          <Lbl s={s} at={B} dx={8} dy={18} size={17}>
            (4, 5, 6)
          </Lbl>
          {t1 > 0.999 && (
            <Lbl s={s} at={N} dx={-10} dy={0} size={17} color={AMBER} anchor="end">
              (1, −2, 1)
            </Lbl>
          )}
          {t1 > 0 && (
            <Lbl s={s} at={[0, 0, TOP * t1]} dx={10} dy={10} color={AMBER} opacity={t1}>
              <Sp i={1} sup="⊥" />
            </Lbl>
          )}
          <Lbl s={s} at={LABEL_AT} dy={8} color={swept ? TEAL : planeCol} anchor="middle">
            {swept ? (
              <>
                <PerpPerp /> = <Sp i={1} />
              </>
            ) : (
              <Sp i={1} />
            )}
          </Lbl>
        </g>
      )}
    </Space>
  );
}

// the picture at each key press from the first, for print (1: V₁; 2: and V₁⊥; 3: (V₁⊥)⊥ = V₁)
export const STILLS = [
  { t1: 0, t2: 0, t3: 0, title: 'The plane V1 spanned by (1, 2, 3) and (4, 5, 6)' },
  { t1: 1, t2: 0, t3: 0, title: 'V1 perp: the line through (1, -2, 1), perpendicular to the plane V1' },
  { t1: 1, t2: 1, t3: 1, title: 'The perp of the line V1 perp: the plane perpendicular to it, which is V1' },
];

/**
 * Orthogonal complement (the user's request: the definition, then the Week 3 Tuesday workshop's
 * Problem 3(a) recalled without its question, plane⊥ = line and line⊥ = plane animated): the
 * definition, V⊥ = {x ∈ ℝⁿ : x · v = 0 for all v ∈ V}; its properties are on Properties of the orthogonal complement.
 * Key press 1: the recall, V₁ = span{(1, 2, 3), (4, 5, 6)}, a plane, beside the picture of it with its
 * two vectors; 2: V₁⊥ = span{(1, −2, 1)}, the line growing out of 0 perpendicular to V₁ (amber);
 * 3: (V₁⊥)⊥ = V₁, V₁ a dashed grey ghost, then a vector perpendicular to the line sweeps once round
 * it, sweeping out the teal plane (V₁⊥)⊥, which lands on V₁. In print, a still per key press.
 */
export default function Slide15Complement() {
  const m1 = useRef(null);
  const m2 = useRef(null);
  const t1 = useTween(useFragmentShown(m1), { ms: 1500, delay: 300 });
  const sweep = useFragmentShown(m2);
  const t2 = useTween(sweep, { ms: 700, delay: 300 });
  const t3 = useTween(sweep, { ms: 2600, delay: 1100 });
  const last = STILLS.length - 1;
  const name = (tex, color) => r`\textcolor{${color}}{${tex}}`;
  return (
    <section>
      {[m1, m2].map((m, i) => (
        <span key={i} ref={m} className="fragment fx-marker" data-fragment-index={i + 2} aria-hidden="true" />
      ))}
      <h2>Orthogonal complement</h2>

      <div className="block definition l20-oc-def">
        <p>
          Let <Tex tex="V" /> be a linear subspace of <Tex tex={r`\mathbb R^n`} />. The <strong>orthogonal complement</strong> <Tex tex={r`V^\perp`} /> of{' '}
          <Tex tex="V" /> in <Tex tex={r`\mathbb R^n`} /> is
        </p>
        <Tex display tex={r`V^\perp=\{\vv x\in\mathbb R^n : \vv x\cdot\vv v=0\text{ for all }\vv v\in V\}.`} />
      </div>

      <Fragment index={1} className="stage l20-ws-stage">
        <div className="stage-text">
          <p className="l20-ws">
            <strong>Recall from the Week 3 workshop:</strong>
          </p>
          {/* each formula, and what it is in the picture */}
          <div className="l20-oc-rows">
            <Tex tex={r`${name('V_1', TEAL)}=\operatorname{span}\left\{\begin{bmatrix}1\\2\\3\end{bmatrix},\begin{bmatrix}4\\5\\6\end{bmatrix}\right\}`} />
            <span>a plane</span>
            <Fragment index={2} as="span">
              <Tex tex={r`${name(r`V_1^\perp`, AMBER)}=\operatorname{span}\left\{\begin{bmatrix}1\\-2\\1\end{bmatrix}\right\}`} />
            </Fragment>
            <Fragment index={2} as="span">
              the line perpendicular to <Tex tex={name('V_1', TEAL)} />
            </Fragment>
            <Fragment index={3} as="span">
              <Tex tex={r`${name(r`(V_1^\perp)^\perp`, TEAL)}=${name('V_1', TEAL)}`} />
            </Fragment>
            <Fragment index={3} as="span">
              the plane perpendicular to <Tex tex={name(r`V_1^\perp`, AMBER)} />
            </Fragment>
          </div>
        </div>

        <div className="stage-fig">
          {PRINT ? (
            <div className="l20-stills">
              {STILLS.map((st, k) => {
                const pic = <Picture {...st} />;
                if (k === last)
                  return (
                    <Fragment key={k} index={k + 1}>
                      {pic}
                    </Fragment>
                  );
                return (
                  <Fragment key={k} index={k + 1}>
                    <Fragment index={k + 2} effect="fade-out">
                      {pic}
                    </Fragment>
                  </Fragment>
                );
              })}
            </div>
          ) : (
            <Picture t1={t1} t2={t2} t3={t3} title="The plane V1 spanned by (1, 2, 3) and (4, 5, 6); the line V1 perp perpendicular to it; the perp of that line, swept out perpendicular to it, is V1" />
          )}
        </div>
      </Fragment>
    </section>
  );
}
