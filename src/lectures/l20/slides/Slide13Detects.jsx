import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Arrow3, Dot3, RightAngle3 } from '../components/Space.jsx';
import { Floor, Lbl, Vn, Sp, Drop } from '../components/GS3D.jsx';
import { hl } from '../components/Redund.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, TEAL, GREEN, W1, W2, W3, V3, P3, lerp, times, fit, floorCorners, floorPoint, FLOOR_LABEL } from '../components/gs.js';

/** The floor V₂, w₁, w₂, and v₃ lowered `t` of the way into the floor; w₃ shrinking with it. */
export function Lowering({ s, t }) {
  const v3 = lerp(V3, P3, t);
  const w3 = times(1 - t, W3);
  const flat = t > 0.995;
  return (
    <g>
      <Floor s={s} />
      <Arrow3 s={s} to={W1} color={GREEN} width={3.6} />
      <Arrow3 s={s} to={W2} color={GREEN} width={3.6} />
      <RightAngle3 s={s} corner={[0, 0, 0]} a={W1} b={W2} size={0.26} color={GREEN} />
      {!flat && <Arrow3 s={s} to={P3} color={TEAL} width={3.4} />}
      {!flat && <Drop s={s} from={v3} to={P3} along={P3} />}
      <Arrow3 s={s} to={v3} color={INK} width={3.6} />
      {!flat && <Arrow3 s={s} to={w3} color={GREEN} width={4} />}
      <Dot3 s={s} at={[0, 0, 0]} color={flat ? GREEN : INK} r={flat ? 6 : 4} />

      <Lbl s={s} at={floorPoint(...FLOOR_LABEL)} dx={-14} dy={6} color={TEAL} anchor="end">
        <Sp i={2} />
      </Lbl>
      <Lbl s={s} at={W1} dx={8} dy={-8} color={GREEN}>
        <Vn n="w" i={1} />
      </Lbl>
      <Lbl s={s} at={W2} dx={-12} dy={22} color={GREEN} anchor="end">
        <Vn n="w" i={2} />
      </Lbl>
      <Lbl s={s} at={v3} dx={10} dy={flat ? 26 : 0}>
        <Vn n="v" i={3} />
      </Lbl>
      {flat ? (
        <Lbl s={s} at={[0, 0, 0]} dx={6} dy={-14} color={GREEN}>
          <Vn n="w" i={3} />
          <tspan> = </tspan>
          <Vn n="0" />
        </Lbl>
      ) : (
        <Lbl s={s} at={w3} dx={-10} dy={4} color={GREEN} anchor="end">
          <Vn n="w" i={3} />
        </Lbl>
      )}
    </g>
  );
}

export const FIVE = [1, 2, 3, 4, 5];
export const ZEROS = [2, 4]; // the w's that come out 0 in the example

/**
 * The example with five vectors (the user's request: "design and animate these ideas in an elegant
 * and intriguing way"): V = span{v₁, …, v₅}; on its key press (`run`) a down arrow, Gram–Schmidt,
 * draws itself under V, and a copy of each v_i in turn peels off, slides down and turns into w_i,
 * so that V = span{w₁, …, w₅}; w₂ and w₄ land amber, with "= 0" under them, written vertically (the
 * user's request: a sideways = and the 0 under it). On key press `redundant`,
 * v₂ and v₄ turn amber (the deck's redundant vectors), dashed amber links join them to their zero w's
 * (the conclusion is in the text column, Conclusion). The moves are CSS animations (deck.css, l20-c5),
 * off in print.
 */
export function FiveVectors({ run, redundant }) {
  return (
    <>
      <span className="fragment fx-marker" data-fragment-index={redundant} data-fx="l20-red" aria-hidden="true" />
      <div className="fx-host l20-c5">
        <div className="l20-c5-row">
          <span className="l20-c5-pre">
            <Tex tex={r`V=\operatorname{span}\{`} />
          </span>
          {FIVE.map((i) => (
            <span key={i} className={`l20-c5-tok${ZEROS.includes(i) ? ' l20-c5-red' : ''}${i === 5 ? ' l20-c5-last' : ''}`}>
              <Tex tex={String.raw`\vv v_${i}${i < 5 ? ',' : ''}`} />
            </span>
          ))}
          <Tex tex={r`\}`} />
        </div>

        <Fragment index={run} className="l20-c5-run">
          <div className="l20-c5-gap">
            <span className="l20-c5-shaft" />
            <span className="l20-c5-head" />
            <span className="l20-c5-gs">Gram&ndash;Schmidt</span>
          </div>
          <div className="l20-c5-row l20-c5-row2">
            <span className="l20-c5-pre">
              <Tex tex={r`V=\operatorname{span}\{`} />
            </span>
            {FIVE.map((i, k) => {
              const zero = ZEROS.includes(i);
              return (
                <span key={i} className={`l20-c5-tok l20-c5-w${zero ? ' l20-c5-zero' : ''}${i === 5 ? ' l20-c5-last' : ''}`} style={{ '--k': k }}>
                  <span className="l20-c5-from">
                    <Tex tex={String.raw`\vv v_${i}`} />
                  </span>
                  <span className="l20-c5-to">
                    <Tex tex={String.raw`\vv w_${i}${i < 5 ? ',' : ''}`} />
                  </span>
                  {zero && (
                    <>
                      <span className="l20-c5-eq">
                        <span className="l20-c5-veq">
                          <Tex tex="=" />
                        </span>
                        <Tex tex={r`\vv 0`} />
                      </span>
                      <span className="l20-c5-link" />
                    </>
                  )}
                </span>
              );
            })}
            <span className="l20-c5-close">
              <Tex tex={r`\}`} />
            </span>
          </div>
        </Fragment>

      </div>
    </>
  );
}

/**
 * The example's conclusion, in the text column under the answer (the user's request: leave space for
 * the bases; it was under the five vectors): on key press `redundant`, v₂, v₄ are redundant; on
 * `so`: , so V = span{v₁, v₃, v₅}; on `same`: = span{w₁, w₃, w₅} under it (the user's requests:
 * centred, the two = aligned, one key press each; the w's green, as in the five vectors); on `bases`
 * (the user's request: no sentence, too many words): v₁, v₃, v₅ highlighted, "basis" beside them; on
 * `obases`: w₁, w₃, w₅, "orthogonal basis".
 */
export function Conclusion({ redundant, so, same, bases, obases }) {
  return (
    <div className="l20-c5-so">
      <Fragment index={redundant} as="p" className="l20-c5-so-why">
        <Tex tex={String.raw`${hl(r`\vv v_2`)},${hl(r`\vv v_4`)}`} /> are redundant
        <Fragment index={so} as="span">
          , so
        </Fragment>
      </Fragment>
      <span className="fragment fx-marker" data-fragment-index={bases} data-fx="l20-bases" aria-hidden="true" />
      <span className="fragment fx-marker" data-fragment-index={obases} data-fx="l20-obases" aria-hidden="true" />
      {/* V | = span{v's} | basis over | = span{w's} | orthogonal basis: a grid, so that the second = is
          under the first; on `bases` the v's are highlighted (l20-hl-v) and labelled, on `obases` the w's */}
      <Fragment index={so} className="fx-host l20-c5-so-eqs">
        <Tex tex="V" />
        <Tex tex={r`{}=\operatorname{span}\{\htmlClass{l20-hl-v}{\vv v_1,\vv v_3,\vv v_5}\}`} />
        <Fragment index={bases} as="span" className="l20-c5-tag">
          basis
        </Fragment>
        <Fragment index={same} as="span" className="l20-c5-so-eq2">
          <Tex tex={String.raw`{}=\operatorname{span}\{\htmlClass{l20-hl-w}{\textcolor{${GREEN}}{\vv w_1,\vv w_3,\vv w_5}}\}.`} />
        </Fragment>
        <Fragment index={obases} as="span" className="l20-c5-tag">
          orthogonal basis
        </Fragment>
      </Fragment>
    </div>
  );
}

/**
 * Gram–Schmidt detects linear dependence (the textbook's Theorem 19.2.3). The picture: V₂ with w₁, w₂,
 * and v₃ above it with Proj_{V₂}(v₃) and w₃, and the question, what if v₃ ∈ V₂?; key press 1: v₃
 * glides down into V₂ and w₃ shrinks to 0 (in print, a still before and after); the sentence
 * the answer, a card in the redundant amber (the user's request: "do some design"): w_i = 0 ⟺ v_i
 * is redundant (the user's wording), and under it, small and gray, i.e. v_i is a linear combination
 * of v₁, …, v_{i−1}; 2: in the picture's place, the example with five
 * vectors, V = span{v₁, …, v₅}; 3: Gram–Schmidt runs, w₂ = w₄ = 0; 4: so v₂, v₄ are redundant;
 * 5: V = span{v₁, v₃, v₅}; 6: = span{w₁, w₃, w₅}; 7: v₁, v₃, v₅ highlighted as a basis; 8: w₁,
 * w₃, w₅ as an orthogonal one. The theorem is on the next slide, What Gram–Schmidt tells us.
 */
export default function Slide13Detects() {
  const m = useRef(null);
  const t = useTween(useFragmentShown(m), { ms: 2200, delay: 400 });
  const box = { width: 500, height: 360, ...fit([[0, 0, 0], W1, W2, V3, W3, ...floorCorners()], 500, 360, { pad: 26 }), axes: false };
  return (
    <section>
      <h2>Gram&ndash;Schmidt detects linear dependence</h2>

      <div className="stage">
        <div className="stage-text">
          <p className="question l20-what-if">
            What if <Tex tex={r`\vv v_3\in V_2=\operatorname{span}\{\vv v_1,\vv v_2\}`} />?
          </p>
          <Fragment index={1} className="l20-key">
            <span ref={m} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
            <span className="l20-key-main">
              <Tex tex={r`\vv w_i=\vv 0\iff\vv v_i`} /> is redundant
            </span>
            <span className="l20-key-sub">
              i.e. <Tex tex={r`\vv v_i`} /> is a linear combination of <Tex tex={r`\vv v_1,\dots,\vv v_{i-1}`} />
            </span>
          </Fragment>

          <Conclusion redundant={4} so={5} same={6} bases={7} obases={8} />
        </div>

        <div className="stage-fig">
          <div className="l20-stills">
            <Fragment index={2} effect="fade-out">
              {PRINT ? (
                <div className="l20-stills">
                  <Fragment index={1} effect="fade-out">
                    <Space {...box} rock={false} title="v3 above the plane V2 and its w3">
                      {(s) => <Lowering s={s} t={0} />}
                    </Space>
                  </Fragment>
                  <Fragment index={1}>
                    <Space {...box} rock={false} title="v3 in the plane V2: w3 = 0">
                      {(s) => <Lowering s={s} t={1} />}
                    </Space>
                  </Fragment>
                </div>
              ) : (
                <Space {...box} title="v3 lowered into the plane V2: w3 shrinks to 0">
                  {(s) => <Lowering s={s} t={t} />}
                </Space>
              )}
            </Fragment>
            <Fragment index={2} className="l20-c5-cell">
              <FiveVectors run={3} redundant={4} />
            </Fragment>
          </div>
        </div>
      </div>
    </section>
  );
}
