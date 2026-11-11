import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import GSPicture, { GSOverview } from '../components/GS3D.jsx';
import { PRINT } from '../components/print.js';

/**
 * The Gram–Schmidt process: first the idea at a glance (the user's request): v₁, v₂, v₃ alone, and on
 * key press 1, v₂ slides until it is orthogonal to v₁, then v₃ until it is orthogonal to both
 * (GSOverview; in print, a still before and after). Key press 2: Mark's box, and the picture starts
 * again, the textbook's Figure 19.2.1 in stages, a line of the box per key press: 3: w₁ = v₁ and the
 * line V₁; 4: step 2, and Proj_{V₁}(v₂) with its perpendicular from v₂, dashed grey, and then, on the
 * same key press (the user's request), v₂ slides to w₂, its tip parallel to V₁ (as on Recall: making
 * two vectors orthogonal), and the dashed grey line from v₂ to w₂ fades in; 5: only the floor V₂ with
 * w₁, w₂ and v₃, v₁ and v₂ gone (no step yet); 6: step 3, Proj_{V₂}(v₃) and then, on the same key
 * press, v₃ slides to w₃, its tip parallel to the floor (the user's requests); 7: the last sentence,
 * v₃ fading back.
 */
export default function Slide09GramSchmidt() {
  return (
    <section>
      <h2>The Gram&ndash;Schmidt process</h2>

      <p className="l20-gs-goal">
        <strong>Goal:</strong> Make a collection of nonzero vectors <Tex tex={r`\vv v_1,\dots,\vv v_k`} /> orthogonal.
      </p>

      <div className="stage">
        <div className="stage-text">
          <Fragment index={2} className="block theorem l20-gs-box">
            <p>
              Let <Tex tex={r`V_i=\operatorname{span}\{\vv v_1,\dots,\vv v_i\}`} /> for <Tex tex={r`1\le i\le k`} />. Then:
            </p>
            <ol className="l20-gs-steps">
              <Fragment index={3} as="li">
                Let <Tex tex={r`\vv w_1=\vv v_1`} />.
              </Fragment>
              <Fragment index={4} as="li">
                Let <Tex tex={r`\vv w_2=\vv v_2-\operatorname{Proj}_{V_1}\vv v_2`} />.
              </Fragment>
              <Fragment index={6} as="li">
                At each step, let <Tex tex={r`\vv w_i=\vv v_i-\operatorname{Proj}_{V_{i-1}}\vv v_i`} />.
              </Fragment>
            </ol>
            <Fragment index={7} as="p">
              The resulting nonzero vectors <Tex tex={r`\vv w_i`} /> form an orthogonal basis of <Tex tex={r`V=V_k`} />.
            </Fragment>
          </Fragment>
        </div>

        <div className="stage-fig">
          <div className="l20-stills">
            <Fragment index={2} effect="fade-out">
              {PRINT ? (
                <div className="l20-stills">
                  <Fragment index={1} effect="fade-out">
                    <GSOverview still={0} width={560} height={420} />
                  </Fragment>
                  <Fragment index={1}>
                    <GSOverview still={1} width={560} height={420} />
                  </Fragment>
                </div>
              ) : (
                <GSOverview at={1} width={560} height={420} />
              )}
            </Fragment>
            <Fragment index={2}>
              <GSPicture steps={{ w1: 3, proj2: 4, w2: 4, plane: 5, proj3: 6, w3: 6, done: 7 }} width={560} height={420} />
            </Fragment>
          </div>
        </div>
      </div>
    </section>
  );
}
