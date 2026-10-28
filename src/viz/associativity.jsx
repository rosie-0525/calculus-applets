import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import TexSvg from '../lectures/l15/components/TexSvg.jsx';
import { INK, BLUE, AMBER } from '../lectures/l15/components/la.js';
import { W, H, Y, XS, R, SPACES, MAPS, LOW, HIGH, Head, Shortcut } from '../lectures/l15/slides/Slide08Associative.jsx';

export const lecture = 15;

// the two routes, each a shortcut and the button that draws it
const ROUTES = [
  { key: 'bc', c: LOW, label: 'T_{BC}', labelAt: [(XS[0] + XS[2]) / 2, Y + 148], color: BLUE, tex: r`A(BC)\colon\ T_A\circ T_{BC}` },
  { key: 'ab', c: HIGH, label: 'T_{AB}', labelAt: [(XS[1] + XS[3]) / 2, Y - 148], color: AMBER, tex: r`(AB)C\colon\ T_{AB}\circ T_C` },
];

/*
 * Associativity without the box (the caption says it): the chain ℝᵏ → ℝᵖ → ℝⁿ → ℝᵐ by T_C, T_B, T_A,
 * and the shortcuts T_BC below and T_AB above. On the slide each shortcut is drawn on (CSS) on a key
 * press; here a button draws it, and hides it on the next click. The page shows every fragment, so
 * a drawn shortcut is in a `fragment visible` of its own, set only when its button is pressed.
 */
export default function Associativity() {
  const [drawn, setDrawn] = useState([]);
  const toggle = (k) => setDrawn((v) => (v.includes(k) ? v.filter((n) => n !== k) : [...v, k]));
  return (
    <div className="viz-col">
      <svg className="l15-chain l15-chain-assoc" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="R^k to R^p to R^n to R^m by T_C, T_B, T_A; the shortcuts T_BC and T_AB">
        {XS.slice(0, 3).map((x, k) => (
          <g key={MAPS[k]}>
            <line x1={x + R + 4} y1={Y} x2={XS[k + 1] - R - 14} y2={Y} stroke={INK} strokeWidth="2.6" />
            <Head tip={[XS[k + 1] - R - 4, Y]} dir={[1, 0]} color={INK} />
            <TexSvg x={(x + XS[k + 1]) / 2} y={Y - 22} tex={MAPS[k]} size={26} color={INK} />
          </g>
        ))}
        {XS.map((x, k) => (
          <g key={SPACES[k]}>
            <circle cx={x} cy={Y} r={R} fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
            <TexSvg x={x} y={Y} tex={SPACES[k]} size={30} color={INK} />
          </g>
        ))}
        {ROUTES.map(({ key, c, label, labelAt, color }) => (
          <g key={key} className={drawn.includes(key) ? 'fragment visible' : 'assoc-undrawn'}>
            <Shortcut c={c} label={label} labelAt={labelAt} color={color} />
          </g>
        ))}
      </svg>
      <div className="viz-toggle" role="group" aria-label="Draw a shortcut">
        {ROUTES.map(({ key, tex }) => (
          <button key={key} type="button" className="viz-button" aria-pressed={drawn.includes(key)} onClick={() => toggle(key)}>
            <Tex tex={tex} />
          </button>
        ))}
      </div>
    </div>
  );
}
