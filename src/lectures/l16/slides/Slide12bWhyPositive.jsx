import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { Island } from '../components/BirdIslands.jsx';
import { ISLES, head } from '../components/markov.js';

// a diagram's two islands, as on Careful: where each is drawn, its label and its colour (Example
// 1's A and B)
export const W = 440;
export const H = 160;
export const ISLE = [
  { at: [110, 92], label: [88, 136], color: ISLES[0].color },
  { at: [330, 92], label: [352, 136], color: ISLES[1].color },
];

/** n + 1 points along the Bézier curve with control points `p` (3 or 4 of them). */
export function bezier(p, n = 24) {
  return Array.from({ length: n + 1 }, (_, q) => {
    const e = q / n;
    const w = p.length === 3 ? [(1 - e) ** 2, 2 * e * (1 - e), e * e] : [(1 - e) ** 3, 3 * e * (1 - e) ** 2, 3 * e * e * (1 - e), e ** 3];
    return [0, 1].map((c) => w.reduce((s, wi, i) => s + wi * p[i][c], 0));
  });
}

// the arrows of each example, dashed as on Careful, each in the colour of the island it leaves,
// with its 100% at `at`: the swap (island 1's birds over the top, island 2's under), and every bird
// staying home (a loop over each island)
export const SWAP = [
  { p: [[150, 62], [220, -10], [290, 62]], i: 0, at: [220, 18] },
  { p: [[296, 106], [220, 166], [144, 106]], i: 1, at: [220, 155] },
];
export const STAY = [
  { p: [[88, 72], [52, 10], [168, 10], [132, 72]], i: 0, at: [110, 18] },
  { p: [[308, 72], [272, 10], [388, 10], [352, 72]], i: 1, at: [330, 18] },
];

/** The two islands of an example and its arrows. */
export function Diagram({ arrows }) {
  return (
    <svg className="l16-why-diagram" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <rect width={W} height={H} rx="16" fill="#a9daea" />
      {ISLE.map((I, i) => (
        <Island key={i} at={I.at} s={0.27} flip={i === 1} />
      ))}
      {arrows.map(({ p, i, at }) => {
        const pts = bezier(p);
        const n = pts.length - 1;
        return (
          <g key={`${i}-${at}`}>
            <polyline points={pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')} fill="none" stroke={ISLE[i].color} strokeWidth="2.6" strokeDasharray="8 6" opacity="0.8" />
            <polygon points={head(pts[n - 1], pts[n], 13, 11)} fill={ISLE[i].color} opacity="0.8" />
            <text x={at[0]} y={at[1]} textAnchor="middle" className="l16-swap-rate" fill={ISLE[i].color}>
              100%
            </text>
          </g>
        );
      })}
      {ISLE.map((I, i) => (
        <g key={i}>
          <rect x={I.label[0] - 42} y={I.label[1] - 14} width={84} height={28} rx={8} fill="#fff" opacity="0.94" stroke={I.color} strokeWidth="2" />
          <text x={I.label[0]} y={I.label[1] + 6} textAnchor="middle" className="l16-why-name" fill={I.color}>
            Island {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/**
 * Why all positive entries? (in place of Careful, the user's request; the textbook names irreducibility
 * only, in Section D.2): without proof, some power of M has all positive entries exactly when the
 * chain is irreducible and aperiodic, so there are only two ways things can go wrong. First "There
 * are two ways things can go wrong" and the examples, above the box (the user's request): the
 * periodic one, Remark 16.1.3's M = [0 1; 1 0], each bird back on its island every 2 years; key press 1:
 * no limit; 2: the reducible example, M = I₂, every bird staying home; 3: the long run depends on
 * p₀; 4: the box.
 */
export default function Slide12bWhyPositive() {
  return (
    <section className="dense">
      <h2>Why all positive entries?</h2>

      <p className="l16-why-only">There are two ways things can go wrong:</p>

      <div className="l16-cards l16-why-cards">
        <div className="l16-card l16-why-card periodic">
          <p className="l16-why-tag">Periodic</p>
          <Diagram arrows={SWAP} />
          <div className="l16-why-row">
            <Tex tex={r`M=\begin{bmatrix}0&1\\ 1&0\end{bmatrix}`} />
            <div>
              <p>A bird is back on its island only every 2 years: period 2.</p>
              <Fragment index={1} as="p" className="l16-why-so">
                <Tex tex="M^k" /> has no limit: <Tex tex={r`M,\ I_2,\ M,\ I_2,\ \ldots`} />
              </Fragment>
            </div>
          </div>
        </div>

        <Fragment index={2} className="l16-card l16-why-card reducible">
          <p className="l16-why-tag">Reducible</p>
          <Diagram arrows={STAY} />
          <div className="l16-why-row">
            <Tex tex={r`M=\begin{bmatrix}1&0\\ 0&1\end{bmatrix}`} />
            <div>
              <p>The birds on island 1 can never reach island 2.</p>
              <Fragment index={3} as="p" className="l16-why-so">
                <Tex tex={r`M^k\mathbf p_0=\mathbf p_0`} />: the long run depends on <Tex tex={r`\mathbf p_0`} />.
              </Fragment>
            </div>
          </div>
        </Fragment>
      </div>

      <Fragment index={4} className="block theorem l16-why-box">
        <p>
          Some power of <Tex tex="M" /> has all positive entries exactly when the Markov chain is
        </p>
        <ul className="bullets">
          <li>
            <strong>irreducible</strong>: from every state, the chain can reach every state, and
          </li>
          <li>
            <strong>aperiodic</strong>: no state can be returned to only at multiples of some <Tex tex={r`d\ge2`} /> steps.
          </li>
        </ul>
      </Fragment>
    </section>
  );
}
