import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { GSBasisPicture } from '../components/GSProj.jsx';
import { TEAL } from '../components/gs.js';
import { BLUE } from '../components/la.js';

export const sumW = r`\textcolor{${BLUE}}{\operatorname{Proj}_{\vv w_1}\vv v+\operatorname{Proj}_{\vv w_2}\vv v}`;
export const projV = r`\textcolor{${TEAL}}{\operatorname{Proj}_V\vv v}`;

/**
 * The projection at each step (after the recall of Gram–Schmidt): the step w_i = v_i − Proj_{V_{i−1}} v_i
 * at once, beside the general picture, a plane V with w₁, w₂ (green, at a right angle), a vector v
 * above it and Proj_V v (teal). Key press 1: to compute the projection Proj_V v, use the orthogonal
 * projection formula, one box: if w₁, …, w_m is an orthogonal basis of V, then Proj_V v is the sum of
 * the projections onto the w's (Lecture 5's Theorem 6.2.4; the user removed the second line, the
 * Fourier formula with the fractions), a blue box with its title in the box's blue and the rest in black (the user's
 * request). With it, the picture shows the two projections Proj_{w₁} v, Proj_{w₂} v as blue arrows and
 * their parallelogram closing on Proj_V v; drag anywhere on the picture to turn w₂ and change the angle
 * θ between w₁ and w₂ (the user removed the slider for θ); under the picture, the live verdict, = at 90° and ≠ elsewhere: the
 * two arrows add up to Proj_V v only when w₁, w₂ are orthogonal (the user's request, replacing the
 * dropped slide Why not v₁ and v₂?). In print, θ = 90°.
 * (The user shortened the first version's two boxes, 1. we project onto V_{i−1} = span{v's} =
 * span{w's}, 2. we compute it with the w's, to this one box, then made it general.) The first sentence arrives from Last time:
 * the Gram–Schmidt process, where it is the box's step 3 (the user's request; auto-animate, data-id
 * l21-gs-each).
 */
export default function Slide01eGSProjection() {
  const [theta, setTheta] = useState(90);
  const equal = Math.abs(theta - 90) < 0.5;
  return (
    <section data-auto-animate="" data-auto-animate-duration="0.6">
      <h2>The projection at each step</h2>

      <div className="stage">
        <div className="stage-text">
          <p className="l21-gs-step" data-id="l21-gs-each">
            At each step, <Tex tex={r`\vv w_i=\vv v_i-\textcolor{${TEAL}}{\operatorname{Proj}_{V_{i-1}}\vv v_i}`} />.
          </p>

          <Fragment index={1} as="p" className="l21-gs-step">
            To compute the projection <Tex tex={r`\operatorname{Proj}_V\vv v`} />, use
          </Fragment>

          <Fragment index={1} className="block definition l21-gs-fact">
            <p className="block-title">Orthogonal projection formula</p>
            <p>If <Tex tex={r`\vv w_1,\dots,\vv w_m`} /> is an orthogonal basis of <Tex tex="V" />, then</p>
            <Tex display tex={r`\operatorname{Proj}_V\vv v=\operatorname{Proj}_{\vv w_1}\vv v+\dots+\operatorname{Proj}_{\vv w_m}\vv v.`} />
          </Fragment>
        </div>

        <div className="stage-fig">
          <GSBasisPicture theta={theta} onTheta={setTheta} sumAt={1} width={560} height={420} />
          <Fragment index={1} className="l21-stack l21-gs-verdict">
            <span className="l21-gs-fade" style={{ opacity: equal ? 1 : 0 }}>
              <Tex tex={r`${sumW}=${projV}`} />
            </span>
            <span className="l21-gs-fade" style={{ opacity: equal ? 0 : 1 }}>
              <Tex tex={r`${sumW}\ne${projV}`} />
            </span>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
