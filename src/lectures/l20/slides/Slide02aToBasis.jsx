import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Arrow3, Dot3 } from '../components/Space.jsx';
import { Floor, Lbl, Vn, Sp } from '../components/GS3D.jsx';
import { hl } from '../components/Redund.jsx';
import { INK, GRAY, GREEN, AMBER, PURPLE, TEAL, V1, V2, plus, times, fit, floorCorners, floorPoint } from '../components/gs.js';

// A spanning set of the plane V: v₁, v₂ and two more vectors in it
export const V3 = plus(times(0.45, V1), times(0.55, V2));
export const V4 = floorPoint(0.25, 2.2);
export const W = 330;
export const H = 205;
export const FIT = fit([[0, 0, 0], V1, V2, V3, V4, ...floorCorners()], W, H, { pad: 24 });

/**
 * `children` shown from key press `from` (from the start if undefined) until `to` (to the end if
 * undefined), fading in and out. `as` is the element (a `g` in a picture).
 */
export function During({ from, to, as = 'g', className, children }) {
  let out = children;
  if (from !== undefined) {
    out = (
      <Fragment as={as} index={from} className={to === undefined ? className : undefined}>
        {out}
      </Fragment>
    );
  }
  if (to !== undefined) {
    out = (
      <Fragment as={as} index={to} effect="fade-out" className={className}>
        {out}
      </Fragment>
    );
  }
  return out;
}

/** A vector of the spanning set with its name, in `color`. */
export function Vec({ s, v, i, color, dx, dy }) {
  return (
    <g>
      <Arrow3 s={s} to={v} color={color} width={3.4} />
      <Lbl s={s} at={v} dx={dx} dy={dy} color={color}>
        <Vn n="v" i={i} />
      </Lbl>
    </g>
  );
}

/** A removed vector: a dashed ghost. */
export function Ghost({ s, v }) {
  return <Arrow3 s={s} to={v} color={GRAY} width={2.2} dashed head={11} />;
}

/**
 * The plane V spanned by v₁, …, v₄ (purple, as on the recall). Key press `redundant`: v₄ turns
 * amber; `drop4`: v₄ is removed (a dashed ghost); `drop3`: v₃ too; `basis`: v₁, v₂ turn green.
 */
export function Removing({ redundant, drop4, drop3, basis }) {
  return (
    <Space width={W} height={H} {...FIT} axes={false} title="The plane V spanned by v1, v2, v3, v4; v4, then v3 removed; v1, v2 a basis">
      {(s) => (
        <g>
          <Floor s={s} />
          <During to={redundant}>
            <Vec s={s} v={V4} i={4} color={PURPLE} dx={-30} dy={18} />
          </During>
          <During from={redundant} to={drop4}>
            <Vec s={s} v={V4} i={4} color={AMBER} dx={-30} dy={18} />
          </During>
          <During from={drop4}>
            <Ghost s={s} v={V4} />
          </During>
          <During to={drop3}>
            <Vec s={s} v={V3} i={3} color={PURPLE} dx={8} dy={22} />
          </During>
          <During from={drop3}>
            <Ghost s={s} v={V3} />
          </During>
          <During to={basis}>
            <Vec s={s} v={V1} i={1} color={PURPLE} dx={6} dy={-8} />
            <Vec s={s} v={V2} i={2} color={PURPLE} dx={10} dy={14} />
          </During>
          <During from={basis}>
            <Vec s={s} v={V1} i={1} color={GREEN} dx={6} dy={-8} />
            <Vec s={s} v={V2} i={2} color={GREEN} dx={10} dy={14} />
          </During>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          <Lbl s={s} at={floorPoint(-0.35, 1.3)} dx={-8} dy={6} color={TEAL} anchor="end">
            <Sp />
          </Lbl>
        </g>
      )}
    </Space>
  );
}

// the span over the picture, updated as vectors go: [from, to, tex]
export const SPANS = [
  [undefined, 3, r`V=\operatorname{span}\{\vv v_1,\vv v_2,\vv v_3,\vv v_4\}`],
  [3, 4, r`V=\operatorname{span}\{\vv v_1,\vv v_2,\vv v_3\}`],
  [4, 5, r`V=\operatorname{span}\{\vv v_1,\vv v_2\}`],
  [5, undefined, String.raw`V=\operatorname{span}\{\textcolor{${GREEN}}{\vv v_1,\vv v_2}\}`],
];

/**
 * From a spanning set to a basis: V = span{v₁, …, v_k}, beside a plane V spanned by v₁, …, v₄ (its
 * span written over it, updated as vectors go); key press 1: if the v's are linearly dependent, a
 * relation with the c's not all zero; 2: say c_k ≠ 0, then v_k is in the span of the others (v₄ turns
 * amber); 3: so V = span{v₁, …, v_{k−1}} (v₄ removed); 4: repeating, the collection becomes linearly
 * independent (v₃ removed); 5: the theorem, a basis is a linearly independent spanning set (Theorem
 * 19.2.3), v₁, v₂ turning green.
 */
export default function Slide02aToBasis() {
  return (
    <section>
      <h2>From a spanning set to a basis</h2>

      <div className="stage l20-tb-stage">
        <div className="stage-text">
          <p>
            Let <Tex tex={r`V=\operatorname{span}\{\vv v_1,\dots,\vv v_k\}`} />.
          </p>
          <Fragment index={1}>
            <p>
              If <Tex tex={r`\vv v_1,\dots,\vv v_k`} /> are linearly dependent, then we have a relation
            </p>
            <Tex display className="centered" tex={r`c_1\vv v_1+\dots+c_k\vv v_k=\vv 0`} />
            <p>
              where not all <Tex tex={r`c_i`} /> are zero.
            </p>
          </Fragment>
          <Fragment index={2}>
            <p>
              Say <Tex tex={r`c_k`} /> is nonzero, then
            </p>
            <Tex display className="centered" tex={String.raw`${hl(r`\vv v_k`)}=-\frac{c_1}{c_k}\vv v_1-\dots-\frac{c_{k-1}}{c_k}\vv v_{k-1}\in\operatorname{span}\{\vv v_1,\dots,\vv v_{k-1}\}.`} />
          </Fragment>
          <Fragment index={3} as="p">
            So <Tex tex={r`V=\operatorname{span}\{\vv v_1,\dots,\vv v_{k-1}\}`} />.
          </Fragment>
          <Fragment index={4} as="p">
            Repeating this, we eventually make the collection linearly independent.
          </Fragment>
        </div>

        <div className="stage-fig">
          <div className="l20-tb-tags">
            {SPANS.map(([from, to, tex]) => (
              <During key={tex} from={from} to={to} as="div" className="l20-tb-span">
                <Tex tex={tex} />
              </During>
            ))}
          </div>
          <Removing redundant={2} drop4={3} drop3={4} basis={5} />
        </div>
      </div>

      <Fragment index={5} className="block theorem l20-tb-thm">
        <p>
          A collection <Tex tex={r`\vv v_1,\dots,\vv v_k`} /> is a <strong>basis</strong> of <Tex tex="V" /> precisely when it is linearly independent and a spanning set of{' '}
          <Tex tex="V" />. <span className="pointer l20-tb-ref">(→ Theorem 19.2.3)</span>
        </p>
      </Fragment>
    </section>
  );
}
