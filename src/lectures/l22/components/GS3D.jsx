import { useRef } from 'react';
import Space, { Arrow3, Seg3, Dot3, PlanePatch, PlaneGrid, RightAngle3 } from './Space.jsx';
import Fragment from './Fragment.jsx';
import { MAIN, MATH } from './svgmath.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { INK, TEAL, GREEN, GRAY, V1, V2, V3, W1, W2, W3, P2, P3, unit, plus, minus, times, fit, floorCorners, floorPoint, FLOOR, FLOOR_LABEL } from './gs.js';

const BG = '#fff'; // the figures' background
const TRACK = '#6b7280'; // the dashed track of a sliding tip (as on Recall: making two vectors orthogonal)

/**
 * A label at a point of space, drawn with a halo in the slide's background colour so that no arrow
 * crosses it (draw labels after all the arrows). `dx`, `dy`: a nudge in pixels.
 */
export function Lbl({ s, at, dx = 0, dy = 0, color = INK, size = 22, anchor = 'start', children, ...rest }) {
  const [x, y] = s.P(at);
  return (
    <text
      x={x + dx}
      y={y + dy}
      fill={color}
      fontSize={size}
      fontFamily={MAIN}
      textAnchor={anchor}
      stroke={BG}
      strokeWidth={5}
      strokeLinejoin="round"
      paintOrder="stroke"
      {...rest}
    >
      {children}
    </text>
  );
}

/** A vector's name, bold and upright as \mathbf in the text: <Vn n="v" i={2} /> is v₂. */
export function Vn({ n, i }) {
  return (
    <>
      <tspan fontWeight="700">{n}</tspan>
      {i !== undefined && (
        <tspan baselineShift="sub" fontSize="0.68em">
          {i}
        </tspan>
      )}
    </>
  );
}

/** A subspace's name, italic: <Sp n="V" i={1} /> is V₁. */
export function Sp({ n = 'V', i, sup }) {
  return (
    <>
      <tspan fontFamily={MATH} fontStyle="italic">
        {n}
      </tspan>
      {i !== undefined && (
        <tspan baselineShift="sub" fontSize="0.68em">
          {i}
        </tspan>
      )}
      {sup && (
        <tspan baselineShift="super" fontSize="0.68em">
          {sup}
        </tspan>
      )}
    </>
  );
}

/**
 * Proj_{V_i} v_j, set as KaTeX would: Proj upright, the subscript smaller and lower, then a thin space
 * (no parentheses round v_j: the user's request, as in the slides' formulas).
 */
export function ProjName({ i, arg, argI }) {
  return (
    <>
      <tspan>Proj</tspan>
      <tspan baselineShift="-0.35em" fontSize="0.68em">
        <tspan fontFamily={MATH} fontStyle="italic">
          V
        </tspan>
        {i !== undefined && (
          <tspan baselineShift="-0.25em" fontSize="0.8em">
            {i}
          </tspan>
        )}
      </tspan>
      <tspan>{'\u2009'}</tspan>
      <Vn n={arg} i={argI} />
    </>
  );
}

/** The floor plane spanned by the unit vectors e, e2 (a light patch and its grid). */
export function Floor({ s, e = unit(W1), e2 = unit(W2), range = FLOOR, range2 = range, fill = TEAL }) {
  return (
    <g>
      <PlanePatch s={s} P={[0, 0, 0]} e={e} e2={e2} range={range} range2={range2} fill={fill} opacity={0.09} stroke={fill} strokeOpacity={0.35} />
      <PlaneGrid s={s} P={[0, 0, 0]} e={e} e2={e2} range={range} range2={range2} color="#d5dde3" width={0.8} />
    </g>
  );
}

/** A dotted perpendicular from `from` down to its foot `to`, with the right-angle mark at the foot. */
export function Drop({ s, from, to, along, color = INK }) {
  const up = from.map((c, i) => c - to[i]);
  return (
    <g>
      <Seg3 s={s} from={from} to={to} color={color} width={2.6} strokeDasharray="0.1 6.5" />
      <RightAngle3 s={s} corner={to} a={up} b={along} size={0.22} color={color} />
    </g>
  );
}

/** A wide, pale arrow (a projection lying over another arrow, as in Lectures 5 and 6). */
export function PaleArrow({ s, to, color = TEAL }) {
  return <Arrow3 s={s} to={to} color={color} width={10} head={22} opacity={0.4} />;
}

/**
 * The Gram–Schmidt process on three vectors of ℝ³ (Figure 19.2.1), in stages. `steps` gives the
 * key press of each stage (a missing stage is not drawn, 0 is shown at once):
 *   w1     w₁ = v₁ (green over v₁) and the line V₁;
 *   proj2  Proj_{V₁}(v₂), pale teal over w₁, with the perpendicular from v₂, dashed grey like the
 *          line from v₂ to w₂ (the user's request: one style throughout, no change at w2);
 *   w2     v₂ slides to w₂ (the user's request, as on Recall: making two vectors orthogonal): a copy
 *          of v₂ whose tip moves parallel to V₁, by −t Proj_{V₁}(v₂), until it is at a right angle to
 *          w₁, and turns green; only then the dashed line from the tip of v₂ to that of w₂ fades in
 *          (the user's request);
 *   plane  the floor V₂ = span(w₁, w₂); v₁ and v₂ (and "= v₁" in w₁'s label), Proj_{V₁}(v₂) and the
 *          dashed lines fading out (the user's request: clearer);
 *   proj3  Proj_{V₂}(v₃) with its perpendicular from v₃, dashed grey (with the plane if missing);
 *   w3     v₃ slides to w₃ in the same way, its tip parallel to the floor, until it stands up from
 *          it, then the dashed line from v₃ to w₃;
 *   done   v₃ and the projections fade back, the orthogonal w's stay.
 */
/**
 * A group shown from key press `i` (with `effect`, e.g. fading out at `i`); a plain group when `i` is
 * undefined (not a fragment: a fragment that is never reached would add a key press).
 */
export function fx(i, children, effect) {
  if (i === undefined || i === null) return <g>{children}</g>;
  return (
    <Fragment as="g" index={i} effect={effect}>
      {children}
    </Fragment>
  );
}

/** The unit and centre that fit the Gram–Schmidt picture (its vectors and floor) in a W × H Space. */
export const gsFit = (W, H, pad = 26) => fit([[0, 0, 0], V1, V2, V3, W3, times(1.32, W1), times(-0.45, W1), ...floorCorners()], W, H, { pad });

/**
 * The idea of the Gram–Schmidt process at a glance (the user's request: an overview before the steps
 * of GSPicture, kept simple): v₁, v₂, v₃ alone; from key press `at`, v₂ slides to w₂ (its tip
 * parallel to v₁, until it is orthogonal to v₁), then v₃ to w₃ (its tip parallel to the plane of v₁
 * and v₂, until it is orthogonal to both), as on Recall: making two vectors orthogonal. Where each
 * was stays, dashed grey; each turns green, with its right angles, when it is orthogonal. No lines,
 * planes or projections. In the same place as GSPicture (the same fit). `still` (0 or 1): a still,
 * for print.
 */
export function GSOverview({ at, still, width = 520, height = 400, rock = true }) {
  const { unit: u, center } = gsFit(width, height);
  const m = useRef(null);
  const shown = useFragmentShown(m);
  const tw2 = useTween(shown, { delay: 600 });
  const tw3 = useTween(shown, { delay: 2900 });
  const t2 = still ?? tw2;
  const t3 = still ?? tw3;
  const tip2 = minus(V2, times(t2, P2));
  const tip3 = minus(V3, times(t3, P3));
  const done2 = t2 > 0.999;
  const done3 = t3 > 0.999;
  return (
    <>
      {still === undefined && <span ref={m} className="fragment fx-marker" data-fragment-index={at} aria-hidden="true" />}
      <Space width={width} height={height} unit={u} center={center} axes={false} rock={rock} title="v1, v2, v3; v2 slides until it is orthogonal to v1, then v3 until it is orthogonal to both">
        {(s) => (
          <g>
            {t2 > 0 && <Arrow3 s={s} to={V2} color={GRAY} width={2.2} head={11} dashed />}
            {t3 > 0 && <Arrow3 s={s} to={V3} color={GRAY} width={2.2} head={11} dashed />}
            <Arrow3 s={s} to={V1} color={INK} width={3.4} />
            <Arrow3 s={s} to={tip2} color={done2 ? GREEN : INK} width={done2 ? 4 : 3.4} />
            <Arrow3 s={s} to={tip3} color={done3 ? GREEN : INK} width={done3 ? 4 : 3.4} />
            {done2 && <RightAngle3 s={s} corner={[0, 0, 0]} a={W1} b={W2} size={0.26} color={GREEN} />}
            {done3 && (
              <>
                <RightAngle3 s={s} corner={[0, 0, 0]} a={W3} b={W1} size={0.26} color={GREEN} />
                <RightAngle3 s={s} corner={[0, 0, 0]} a={W3} b={W2} size={0.26} color={GREEN} />
              </>
            )}
            <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />

            <Lbl s={s} at={V1} dx={-30} dy={-14}>
              <Vn n="v" i={1} />
            </Lbl>
            <Lbl s={s} at={V2} dx={10} dy={16} color={t2 > 0 ? GRAY : INK}>
              <Vn n="v" i={2} />
            </Lbl>
            <Lbl s={s} at={V3} dx={10} dy={0} color={t3 > 0 ? GRAY : INK}>
              <Vn n="v" i={3} />
            </Lbl>
            {done2 && (
              <Lbl s={s} at={W2} dx={-12} dy={22} color={GREEN} anchor="end">
                <Vn n="w" i={2} />
              </Lbl>
            )}
            {done3 && (
              <Lbl s={s} at={W3} dx={-10} dy={4} color={GREEN} anchor="end">
                <Vn n="w" i={3} />
              </Lbl>
            )}
          </g>
        )}
      </Space>
    </>
  );
}

export default function GSPicture({ steps = {}, width = 520, height = 400, rock = true, title }) {
  const st = steps;
  const { unit: u, center } = gsFit(width, height);
  // a stage: nothing if it is not on this slide, else shown from its key press (at once if 0)
  const at = (k, children) => (st[k] === undefined ? null : st[k] === 0 ? <g>{children}</g> : fx(st[k], children));
  // fades (out, or back with `semi`) at stage k, if k is on this slide
  const off = (k, children, semi = false) => fx(st[k], children, semi ? 'semi-fade-out' : 'fade-out');
  const lineEnd = times(1.32, W1);
  const lineStart = times(-0.45, W1);
  // the slides of v₂ and v₃ to w₂ and w₃, each from its key press (in print, and when shown at once,
  // the end)
  const m2 = useRef(null);
  const m3 = useRef(null);
  // on the key press of the projection too, the slide waits for it to be seen
  const tw2 = useTween(useFragmentShown(m2), { delay: st.w2 === st.proj2 ? 1500 : 600 });
  const tw3 = useTween(useFragmentShown(m3), { delay: st.w3 === st.proj3 ? 1500 : 600 });
  const p3 = st.proj3 === undefined ? 'plane' : 'proj3'; // the stage of Proj_{V₂}(v₃)
  const t2 = PRINT || st.w2 === 0 ? 1 : tw2;
  const t3 = PRINT || st.w3 === 0 ? 1 : tw3;
  const tip2 = minus(V2, times(t2, P2));
  const tip3 = minus(V3, times(t3, P3));
  const done2 = t2 > 0.999;
  const done3 = t3 > 0.999;
  // the dashed line from the tip of v_i to that of w_i, fading in once v_i has slid to w_i
  const track = (s, v, pr, shown) => (
    <g style={{ opacity: shown ? 1 : 0, transition: 'opacity 0.6s' }}>
      <Seg3 s={s} from={plus(v, times(0.25, pr))} to={minus(v, times(1.15, pr))} color={TRACK} width={1.5} dashed />
    </g>
  );
  const marker = (k, ref) => (st[k] ? <span ref={ref} className="fragment fx-marker" data-fragment-index={st[k]} aria-hidden="true" /> : null);
  return (
    <>
    {marker('w2', m2)}
    {marker('w3', m3)}
    <Space width={width} height={height} unit={u} center={center} axes={false} rock={rock} title={title ?? 'The Gram–Schmidt process: v1, v2, v3 made into orthogonal w1, w2, w3'}>
      {(s) => (
        <g>
          {at('plane', <Floor s={s} />)}
          {at('w1', <Seg3 s={s} from={lineStart} to={lineEnd} color={GRAY} width={1.4} />)}

          {/* the v's: v₁ and v₂ go when the floor comes in, v₃ fades back at the end */}
          {off(
            'plane',
            <>
              <Arrow3 s={s} to={V1} color={INK} width={3.4} />
              <Arrow3 s={s} to={V2} color={INK} width={3.4} />
            </>,
          )}
          {off('done', <Arrow3 s={s} to={V3} color={INK} width={3.4} />, true)}

          {at(
            'proj2',
            off(
              'plane',
              <>
                <PaleArrow s={s} to={P2} />
                <Seg3 s={s} from={P2} to={V2} color={TRACK} width={1.5} dashed />
                <RightAngle3 s={s} corner={P2} a={times(-1, W1)} b={W2} size={0.22} color={TRACK} />
              </>,
            ),
          )}

          {at(
            p3,
            off(
              'done',
              <>
                <Arrow3 s={s} to={P3} color={TEAL} width={3.2} />
                <Seg3 s={s} from={P3} to={V3} color={TRACK} width={1.5} dashed />
                <RightAngle3 s={s} corner={P3} a={W3} b={P3} size={0.22} color={TRACK} />
              </>,
            ),
          )}

          {/* the w's */}
          {at('w1', <Arrow3 s={s} to={W1} color={GREEN} width={4} />)}
          {at(
            'w2',
            <>
              {off('plane', track(s, V2, P2, done2))}
              <Arrow3 s={s} to={tip2} color={done2 ? GREEN : INK} width={done2 ? 4 : 3.4} />
              {done2 && <RightAngle3 s={s} corner={[0, 0, 0]} a={W1} b={W2} size={0.26} color={GREEN} />}
            </>,
          )}
          {at(
            'w3',
            <>
              {off('done', track(s, V3, P3, done3))}
              <Arrow3 s={s} to={tip3} color={done3 ? GREEN : INK} width={done3 ? 4 : 3.4} />
              {done3 && (
                <>
                  <RightAngle3 s={s} corner={[0, 0, 0]} a={W3} b={W1} size={0.26} color={GREEN} />
                  <RightAngle3 s={s} corner={[0, 0, 0]} a={W3} b={W2} size={0.26} color={GREEN} />
                </>
              )}
            </>,
          )}
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />

          {/* labels last */}
          {at(
            'w1',
            <Lbl s={s} at={lineStart} dx={-6} dy={-6} color={GRAY} size={20} anchor="end">
              <Sp i={1} />
            </Lbl>,
          )}
          {at(
            'plane',
            <Lbl s={s} at={floorPoint(...FLOOR_LABEL)} dx={-14} dy={6} color={TEAL} size={22} anchor="end">
              <Sp i={2} />
            </Lbl>,
          )}
          {off(
            'w1',
            <Lbl s={s} at={V1} dx={-30} dy={-14}>
              <Vn n="v" i={1} />
            </Lbl>,
          )}
          {at(
            'w1',
            off(
              'plane',
              <Lbl s={s} at={V1} dx={-30} dy={-14} color={GREEN}>
                <Vn n="w" i={1} />
                <tspan fill={INK}> = </tspan>
                <tspan fill={INK}>
                  <Vn n="v" i={1} />
                </tspan>
              </Lbl>,
            ),
          )}
          {at(
            'plane',
            <Lbl s={s} at={V1} dx={-30} dy={-14} color={GREEN}>
              <Vn n="w" i={1} />
            </Lbl>,
          )}
          {off(
            'plane',
            <Lbl s={s} at={V2} dx={10} dy={16}>
              <Vn n="v" i={2} />
            </Lbl>,
          )}
          {off(
            'done',
            <>
              <Lbl s={s} at={V3} dx={10} dy={0}>
                <Vn n="v" i={3} />
              </Lbl>
            </>,
            true,
          )}
          {at(
            'proj2',
            off(
              'plane',
              <Lbl s={s} at={P2} dx={-6} dy={-16} color={TEAL} size={19} anchor="middle">
                <ProjName i={1} arg="v" argI={2} />
              </Lbl>,
            ),
          )}
          {at(
            'w2',
            done2 && (
              <Lbl s={s} at={W2} dx={-12} dy={22} color={GREEN} anchor="end">
                <Vn n="w" i={2} />
              </Lbl>
            ),
          )}
          {at(
            p3,
            off(
              'done',
              <Lbl s={s} at={P3} dx={12} dy={-12} color={TEAL} size={19}>
                <ProjName i={2} arg="v" argI={3} />
              </Lbl>,
            ),
          )}
          {at(
            'w3',
            done3 && (
              <Lbl s={s} at={W3} dx={-10} dy={4} color={GREEN} anchor="end">
                <Vn n="w" i={3} />
              </Lbl>
            ),
          )}
        </g>
      )}
    </Space>
    </>
  );
}
