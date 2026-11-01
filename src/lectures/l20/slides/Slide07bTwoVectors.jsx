import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot, RightAngle } from '../components/Plane.jsx';
import { Lbl, Vn } from '../components/GS3D.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, GREEN, GRAY, minus, plus, times, norm, proj } from '../components/gs.js';

// Lecture 6's u = (4, 1) and v = (2, 3), in today's letters
export const V1 = [4, 1];
export const V2 = [2, 3];
export const P = proj(V2, V1); // Proj_{v₁}(v₂)
export const W2 = minus(V2, P);
export const X_RANGE = [-1.0, 4.6];
export const UNIT = 78;
export const TRACK = '#6b7280';

/**
 * Lecture 6's animation (An orthogonal basis for a plane): v₁ and v₂; with `moving`, the tip of v₂
 * slides `t` of the way along a dashed track parallel to v₁, until v₂ is at a right angle to v₁
 * (t = 1), where it turns green: that is w₂. Where v₂ was stays, dashed grey. Then (the user's
 * request) v₂ collapses `c` of the way onto the line of v₁, straight down to Proj_{v₁}(v₂), which
 * does not change: the track comes down with it, and w₂ = v₂ − Proj_{v₁}(v₂) shrinks to 0.
 */
export function Picture({ t, c = 0, moving, title }) {
  const v2 = minus(V2, times(c, W2));
  const tip = minus(v2, times(t, P));
  const done = t > 0.999;
  const zero = done && c > 0.999;
  // w₂ fades out as it gets shorter than its head
  const fade = Math.min(1, Math.max(0, (norm(tip) * UNIT - 8) / 22));
  const a = plus(v2, times(0.25, P));
  const b = minus(v2, times(1.15, P));
  return (
    <Plane xRange={X_RANGE} yRange={[-0.5, 3.4]} unit={UNIT} grid={false} axes={false} title={title}>
      {(p) => {
        const s = { P: ([x, y]) => [p.px(x), p.py(y)] };
        return (
          <g>
            {/* the line of v₁ */}
            <line x1={p.px(X_RANGE[0])} y1={p.py(X_RANGE[0] / 4)} x2={p.px(X_RANGE[1])} y2={p.py(X_RANGE[1] / 4)} stroke={GRAY} strokeWidth="1.4" />
            {moving && (
              /* the track of the tip, parallel to v₁ */
              <line x1={p.px(a[0])} y1={p.py(a[1])} x2={p.px(b[0])} y2={p.py(b[1])} stroke={TRACK} strokeWidth="1.5" strokeDasharray="6 6" />
            )}

            <Arrow p={p} to={V1} color={INK} width={3.4} />
            {/* where v₂ was, over v₁ so that it still shows when it has collapsed onto it */}
            {moving && <Arrow p={p} to={v2} color={GRAY} width={2.2} head={11} dashed />}
            {done && <RightAngle p={p} at={[0, 0]} a={W2} b={V1} size={13} color={GREEN} opacity={fade} />}
            {!zero && <Arrow p={p} to={tip} color={done ? GREEN : INK} width={done ? 4 : 3.4} opacity={fade} />}
            <Dot p={p} at={[0, 0]} color={zero ? GREEN : INK} r={zero ? 6 : 4} />

            {/* labels last; the label of where v₂ was comes in as v₂ moves away from it */}
            <Lbl s={s} at={V1} dx={6} dy={24}>
              <Vn n="v" i={1} />
            </Lbl>
            {moving && (
              <Lbl s={s} at={v2} dx={8} dy={22} color={GRAY} opacity={Math.min(1, 5 * t)}>
                <Vn n="v" i={2} />
              </Lbl>
            )}
            {zero ? (
              <Lbl s={s} at={[0, 0]} dx={-10} dy={-14} color={GREEN} anchor="end">
                <Vn n="w" i={2} /> = <Vn n="0" />
              </Lbl>
            ) : (
              <Lbl s={s} at={tip} dx={-34} dy={-10} color={done ? GREEN : INK} opacity={fade}>
                <Vn n={done ? 'w' : 'v'} i={2} />
              </Lbl>
            )}
          </g>
        );
      }}
    </Plane>
  );
}

/**
 * Recall (Lecture 6, Theorem 7.1.1), the case of two vectors before the general Gram–Schmidt process,
 * in today's letters (Lecture 6's u, v, v′ are v₁, v₂, w₂): the statement, w₂ orthogonal to v₁ with
 * the same span (the answer, for two vectors, to the question on Orthogonal vectors are linearly
 * independent), beside v₁ and v₂; key press 1: Lecture 6's animation, v₂ sliding parallel to v₁ until
 * it is orthogonal to v₁, w₂ (in print, a still before and after); 2: v₂ collapses onto the line of v₁
 * and w₂ shrinks to 0 (in print, the still after), and under the picture, v₁, v₂ are multiples of
 * each other ⟺ w₂ = 0 (the user's simplification of the two cases).
 */
export default function Slide07bTwoVectors() {
  const m = useRef(null);
  const shown = useFragmentShown(m);
  const t = useTween(shown);
  const m2 = useRef(null);
  const shown2 = useFragmentShown(m2);
  const t2 = useTween(shown2);
  return (
    <section>
      <span ref={m} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <span ref={m2} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />
      <h2>Recall: making two vectors orthogonal</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block theorem">
            <p>
              For nonzero vectors <Tex tex={r`\vv v_1`} /> and <Tex tex={r`\vv v_2`} /> in <Tex tex={r`\mathbb R^n`} />,
            </p>
            <Tex display tex={r`\vv w_2=\vv v_2-\operatorname{Proj}_{\vv v_1}(\vv v_2)`} />
            <p>
              is orthogonal to <Tex tex={r`\vv v_1`} />, and
            </p>
            <Tex display tex={r`\operatorname{span}\{\vv v_1,\vv w_2\}=\operatorname{span}\{\vv v_1,\vv v_2\}.`} />
          </div>
        </div>

        <div className="stage-fig">
          {PRINT ? (
            <div className="l20-stills">
              <Fragment index={1} effect="fade-out">
                <Picture t={0} moving={false} title="v1 and v2, which are not orthogonal" />
              </Fragment>
              <Fragment index={1}>
                <Fragment index={2} effect="fade-out">
                  <Picture t={1} moving title="v2 slid parallel to v1 until it is perpendicular to v1: that is w2" />
                </Fragment>
              </Fragment>
              <Fragment index={2}>
                <Picture t={1} c={1} moving title="v2 collapsed onto the line of v1: w2 = 0" />
              </Fragment>
            </div>
          ) : (
            <Picture t={t} c={t2} moving={shown} title="v1 and v2; the tip of v2 slides parallel to v1 until v2 is perpendicular to v1: that is w2; then v2 collapses onto the line of v1 and w2 shrinks to 0" />
          )}

          <Fragment index={2} as="p" className="l20-two-iff">
            <span className="nowrap">
              <Tex tex={r`\vv v_1`} /> and <Tex tex={r`\vv v_2`} /> are multiples of each other
            </span>{' '}
            <span className="nowrap">
              <Tex tex={r`\iff\ \vv w_2=\vv 0`} />.
            </span>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
