import { useRef, useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import GSPicture, { GSOverview } from '../lectures/l20/components/GS3D.jsx';
import { useReplay } from './zoom-in.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 20;

// the stages after the idea, as on the slide's key presses 3–7: what each button says, and the
// stages of GSPicture it adds
const STAGES = [
  [r`\vv w_1=\vv v_1`, ['w1']],
  [r`\vv w_2=\vv v_2-\operatorname{Proj}_{V_1}\vv v_2`, ['proj2', 'w2']],
  [r`V_2`, ['plane']],
  [r`\vv w_3=\vv v_3-\operatorname{Proj}_{V_2}\vv v_3`, ['proj3', 'w3']],
  [r`\vv w_1,\vv w_2,\vv w_3`, ['done']],
];

// a key press after every stage reached, kept hidden (GSPicture shows Proj_{V₂}(v₃) with the floor
// when the slide has no stage for it)
const LATER = 99;

/**
 * GSPicture's steps at stage n: the stages before it at once (0), its own on key press 1, which the
 * page shows as it mounts, so that v₂ or v₃ slides, and the ones after it on LATER.
 */
function stepsAt(n) {
  return Object.fromEntries(STAGES.flatMap(([, ids], k) => ids.map((id) => [id, k < n - 1 ? 0 : k === n - 1 ? 1 : LATER])));
}

/*
 * The Gram–Schmidt process, without its title and its goal (the caption has it): first the idea at
 * a glance (GSOverview), v₂ sliding until it is orthogonal to v₁, then v₃ until it is orthogonal to
 * both; then Mark's box beside the textbook's Figure 19.2.1 in stages: w₁ = v₁ and the line V₁;
 * Proj_{V₁}(v₂) and v₂ sliding to w₂; the floor V₂ with w₁, w₂ and v₃; Proj_{V₂}(v₃) and v₃
 * sliding to w₃; v₃ fading back. The 3-D picture rocks while the applet is on screen and turns when
 * dragged. On the slide these come one key press at a time; here a button picks the stage (the
 * picture drawn afresh for each, so that its slide plays, the stages after it hidden), the idea
 * plays the first time the applet is on screen and again on its button, and the box's lines not
 * reached yet are faded.
 */
export default function GramSchmidt() {
  const ref = useRef(null);
  const pic = useRef(null);
  const [run, replay] = useReplay(ref);
  const [n, setN] = useState(0);
  useFragmentSteps(pic, 1);
  const line = (stage) => ({ opacity: n >= stage ? 1 : 0.3, transition: 'opacity 0.3s ease' });
  return (
    <div className="viz-col" ref={ref}>
      <div className="viz-toggle gs-pick" role="group" aria-label="How far the process goes">
        <button
          type="button"
          className="viz-button"
          aria-pressed={n === 0}
          onClick={() => {
            setN(0);
            replay();
          }}
        >
          The idea
        </button>
        {STAGES.map(([tex], k) => (
          <button key={tex} type="button" className="viz-button" aria-pressed={n === k + 1} onClick={() => setN(k + 1)}>
            <Tex tex={tex} />
          </button>
        ))}
      </div>
      <div className="stage gs-stage">
        <div className="stage-text">
          <div className="block theorem l20-gs-box" style={{ opacity: n === 0 ? 0.3 : 1, transition: 'opacity 0.3s ease' }}>
            <p>
              Let <Tex tex={r`V_i=\operatorname{span}\{\vv v_1,\dots,\vv v_i\}`} /> for <Tex tex={r`1\le i\le k`} />. Then:
            </p>
            <ol className="l20-gs-steps">
              <li style={line(1)}>
                Let <Tex tex={r`\vv w_1=\vv v_1`} />.
              </li>
              <li style={line(2)}>
                Let <Tex tex={r`\vv w_2=\vv v_2-\operatorname{Proj}_{V_1}\vv v_2`} />.
              </li>
              <li style={line(4)}>
                At each step, let <Tex tex={r`\vv w_i=\vv v_i-\operatorname{Proj}_{V_{i-1}}\vv v_i`} />.
              </li>
            </ol>
            <p style={line(5)}>
              The resulting nonzero vectors <Tex tex={r`\vv w_i`} /> form an orthogonal basis of <Tex tex={r`V=V_k`} />.
            </p>
          </div>
        </div>
        <div className="stage-fig" ref={pic}>
          {n === 0 ? (
            run ? <GSOverview key={run} at={1} width={560} height={420} /> : <GSOverview still={0} width={560} height={420} />
          ) : (
            <GSPicture key={n} steps={stepsAt(n)} width={560} height={420} />
          )}
        </div>
      </div>
    </div>
  );
}
