import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { INK, BLUE, AMBER } from '../components/la.js';

export const W = 1100;
export const H = 350;
export const Y = 175; // the spaces' row
export const XS = [80, 340, 600, 860]; // ℝᵏ, ℝᵖ, ℝⁿ, ℝᵐ
export const R = 38; // the spaces' discs
export const SPACES = [r`\mathbb R^k`, r`\mathbb R^p`, r`\mathbb R^n`, r`\mathbb R^m`];
export const MAPS = ['T_C', 'T_B', 'T_A'];
// the two shortcuts: T_BC below, from ℝᵏ to ℝⁿ; T_AB above, from ℝᵖ to ℝᵐ (quadratic curves)
export const LOW = { from: [XS[0] + 22, Y + 32], ctrl: [(XS[0] + XS[2]) / 2, Y + 210], to: [XS[2] - 22, Y + 32] };
export const HIGH = { from: [XS[1] + 22, Y - 32], ctrl: [(XS[1] + XS[3]) / 2, Y - 210], to: [XS[3] - 22, Y - 32] };
export const curve = (c) => `M ${c.from[0]} ${c.from[1]} Q ${c.ctrl[0]} ${c.ctrl[1]} ${c.to[0]} ${c.to[1]}`;
export const line = (a, b) => `M ${XS[a] + R + 4} ${Y} L ${XS[b] - R - 4} ${Y}`;

/** An arrowhead at `tip`, pointing along (ux, uy). */
export function Head({ tip, dir, color, size = 15 }) {
  const len = Math.hypot(dir[0], dir[1]);
  const [ux, uy] = [dir[0] / len, dir[1] / len];
  const [bx, by] = [tip[0] - ux * size, tip[1] - uy * size];
  const w = size * 0.45;
  return <polygon points={`${tip[0]},${tip[1]} ${bx - uy * w},${by + ux * w} ${bx + uy * w},${by - ux * w}`} fill={color} />;
}

/** A shortcut T_BC or T_AB: drawn on (CSS) on its key press. */
export function Shortcut({ c, label, labelAt, color }) {
  return (
    <g className="l15-draw">
      <path d={curve(c)} pathLength="1" fill="none" stroke={color} strokeWidth="3" />
      <g className="l15-draw-head">
        <Head tip={c.to} dir={[c.to[0] - c.ctrl[0], c.to[1] - c.ctrl[1]]} color={color} />
      </g>
      <TexSvg x={labelAt[0]} y={labelAt[1]} tex={label} size={28} color={color} />
    </g>
  );
}


/**
 * Associativity (at the user's request, right after the Recall): a box, "Multiplication is
 * associative: (AB)C = A(BC)" (the user's words, for the first half of Mark's (MM3)); then why
 * (Section 15.4, the textbook's proof), on the chain: ℝᵏ → ℝᵖ → ℝⁿ → ℝᵐ by T_C, T_B, T_A.
 * Key press 1: the chain; 2: the shortcut T_BC drawn below (A(BC) is the matrix of T_A ∘ T_BC);
 * 3: T_AB drawn above ((AB)C, of T_AB ∘ T_C). (The dots travelling the routes, x, Cx, B(Cx),
 * A(B(Cx)) under the spaces, and the notes below, removed by the user: just the two arrows.)
 */
export default function Slide08Associative() {
  return (
    <section className="dense">
      <h2>Associativity</h2>

      <div className="block theorem l15-props l15-props-tight">
        {/* (MM1), moved to the Recall of Ax and AB at the user's request; Mark's (MM3), "A(BC) = (AB)C.
            Note that this implies (AB)x = A(Bx).", and the label "Why is A(BC) = (AB)C?" over the
            chain, replaced by the user's sentence */}
        <p>
          Multiplication is associative: <Tex tex="(AB)C=A(BC)" />
        </p>
      </div>

      <svg className="l15-chain l15-chain-assoc" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="R^k to R^p to R^n to R^m by T_C, T_B, T_A; the shortcuts T_BC and T_AB">
        <Fragment as="g" index={1}>
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
        </Fragment>

        {/* x, Cx, B(Cx), A(B(Cx)) under the spaces, and the dots travelling each route, removed by
            the user */}
        <Fragment as="g" index={2}>
          <Shortcut c={LOW} label="T_{BC}" labelAt={[(XS[0] + XS[2]) / 2, Y + 148]} color={BLUE} />
        </Fragment>
        <Fragment as="g" index={3}>
          <Shortcut c={HIGH} label="T_{AB}" labelAt={[(XS[1] + XS[3]) / 2, Y - 148]} color={AMBER} />
        </Fragment>
      </svg>

      {/* The notes, "A(BC) is the matrix of T_A ∘ T_BC.", "(AB)C is the matrix of T_AB ∘ T_C." and
          "Both send x to A(B(Cx)), so A(BC) = (AB)C.", removed by the user */}
    </section>
  );
}
