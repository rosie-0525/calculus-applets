import { useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import { INK } from '../lectures/l14/components/SquareMap.jsx';
import { useGlide } from '../lectures/l14/components/useFragmentTween.js';
import { Source, Image, S_POINT } from '../lectures/l14/slides/Slide02cCollapse.jsx';

export const lecture = 14;

/*
 * When f(e₁) and f(e₂) are scalar multiples, without its question (the caption asks it): the tiling
 * by copies of S with a point s to drag, and its image through f. On the slide a key press swings
 * f(e₂) onto 2 f(e₁), the parallelograms flattening onto a line, and the next one shows f(S), a
 * segment; here the button swings it there and back, and f(S) shows once f(e₂) has arrived
 * (`collapse-flat` in site.css).
 */
export default function Collapse() {
  const [flat, setFlat] = useState(false);
  const [t] = useGlide(flat ? 1 : 0, 2400);
  const [s, setS] = useState(S_POINT);
  return (
    <div className="viz-col">
      <div className={`l14-squaremap l14-collapse-map${t > 0.999 ? ' collapse-flat' : ''}`}>
        <Source s={s} setS={setS} />
        <svg className="l14-map-arrow" viewBox="0 0 90 60" width="90" height="60" aria-hidden="true">
          <line x1="8" y1="40" x2="72" y2="40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <polygon points="84,40 70,33 70,47" fill={INK} />
          <text x="45" y="24" textAnchor="middle" fontSize="26" fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic" fill={INK}>
            f
          </text>
        </svg>
        <Image t={t} s={s} />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setFlat(!flat)}>
          Swing <Tex tex={r`f(\vv e_2)`} /> {flat ? 'back' : <>onto <Tex tex={r`2f(\vv e_1)`} /></>}
        </button>
      </div>
    </div>
  );
}
