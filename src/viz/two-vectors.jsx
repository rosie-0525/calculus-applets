import { useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import { useTween } from '../lectures/l20/components/useFragmentTween.js';
import { Picture } from '../lectures/l20/slides/Slide07bTwoVectors.jsx';
import { from } from './redundancies.jsx';

export const lecture = 20;

/*
 * Recall: making two vectors orthogonal, without its title and its box (the caption has it): v₁ and
 * v₂; the tip of v₂ slides parallel to v₁ until v₂ is at a right angle to v₁, w₂ (green), where v₂
 * was dashed grey; then v₂ collapses onto the line of v₁ and w₂ shrinks to 0, and under the picture,
 * v₁ and v₂ are multiples of each other ⟺ w₂ = 0. On the slide these come on two key presses; here
 * two buttons, the second after the first.
 */
export default function TwoVectors() {
  const [n, setN] = useState(0);
  const t = useTween(n >= 1);
  const c = useTween(n >= 2);
  return (
    <div className="viz-col">
      <Picture t={t} c={c} moving={n >= 1} title="v1 and v2; the tip of v2 slides parallel to v1 until v2 is perpendicular to v1: that is w2; then v2 collapses onto the line of v1 and w2 shrinks to 0" />
      <p className="l20-two-iff" style={from(n, 2)}>
        <span className="nowrap">
          <Tex tex={r`\vv v_1`} /> and <Tex tex={r`\vv v_2`} /> are multiples of each other
        </span>{' '}
        <span className="nowrap">
          <Tex tex={r`\iff\ \vv w_2=\vv 0`} />.
        </span>
      </p>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={n === 1} onClick={() => setN(1)}>
          Make <Tex tex={r`\vv v_2`} /> orthogonal to <Tex tex={r`\vv v_1`} />
        </button>
        <button type="button" className="viz-button" aria-pressed={n === 2} disabled={n === 0} onClick={() => setN(2)}>
          What if <Tex tex={r`\vv v_2`} /> is a multiple of <Tex tex={r`\vv v_1`} />?
        </button>
        <button type="button" className="viz-button" disabled={n === 0} onClick={() => setN(0)}>
          Start again
        </button>
      </div>
    </div>
  );
}
