import { useRef } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { useTween } from '../lectures/l18/components/useFragmentTween.js';
import { ComposeAB, ComposeBA } from '../lectures/l18/slides/Slide04cCaution.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 18;

// each map's glide (ms), the pause before the second map, and before the second picture
const MS = 1600;
const GAP = 600;
const NEXT = 1200;

const stepA = <Tex tex={r`T_A:\mathbb R^2\to\mathbb R^3`} />;
const stepB = (
  <>
    <Tex tex={r`T_B:\mathbb R^3\to\mathbb R^2`} /> <span className="l18-caution-nobreak">collapsing into a plane</span>
  </>
);
const step = (t) => `l18-caution-step${t > 0 ? ' is-on' : ''}`;
const verdict = (t) => `l18-caution-verdict${t >= 1 ? ' is-on' : ''}`;

/**
 * The two pictures of Caution, as there, the second once the first has ended: T_B ∘ T_A, ℝ² and an F
 * on it lifted into ℝ³ and squashed back onto themselves; T_A ∘ T_B, ℝ³ squashed onto ℝ² and lifted
 * onto the plane, an upright F flattened to a segment. Each with its steps beside it as its maps
 * start, and its verdict under it once it ends.
 */
function Cards() {
  const t0 = 500;
  const t1 = t0 + 2 * MS + GAP + NEXT;
  const baA = useTween(true, { ms: MS, delay: t0 });
  const baB = useTween(true, { ms: MS, delay: t0 + MS + GAP });
  const abB = useTween(true, { ms: MS, delay: t1 });
  const abA = useTween(true, { ms: MS, delay: t1 + MS + GAP });
  return (
    <div className="l18-caution-row">
      <div className="l18-caution-card">
        <div className="l18-caution-left">
          <p className="l18-caution-name">
            <Tex tex={r`T_B\circ T_A:\mathbb R^2\to\mathbb R^2`} />
          </p>
          <div className="l18-caution-pic">
            <ComposeBA a={baA} b={baB} />
          </div>
          <p className={verdict(baB)}>composition is identity</p>
        </div>
        <div className="l18-caution-steps">
          <p className={step(baA)}>{stepA}</p>
          <p className={step(baB)}>{stepB}</p>
        </div>
      </div>
      <div className="l18-caution-card">
        <div className="l18-caution-left">
          <p className="l18-caution-name">
            <Tex tex={r`T_A\circ T_B:\mathbb R^3\to\mathbb R^3`} />
          </p>
          <div className="l18-caution-pic">
            <ComposeAB b={abB} a={abA} />
          </div>
          <p className={verdict(abA)}>
            composition is <span className="l18-not">NOT</span> identity
          </p>
        </div>
        <div className="l18-caution-steps">
          <p className={step(abB)}>{stepB}</p>
          <p className={step(abA)}>{stepA}</p>
        </div>
      </div>
    </div>
  );
}

/*
 * Caution, without its title, its sign and its sentence (the caption has it): T_B ∘ T_A and
 * T_A ∘ T_B, each in one 3-D picture (rocking while the applet is on screen, and dragged to turn
 * it). On the slide each comes on a key press; here they play one after the other the first time the
 * applet is on screen, and again on Play again.
 */
export default function OneSided() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  return (
    <div className="viz-col" ref={ref}>
      <Cards key={run} />
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Play again
        </button>
      </div>
    </div>
  );
}
