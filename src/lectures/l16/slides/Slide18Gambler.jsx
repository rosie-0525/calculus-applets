import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { GREEN, head } from '../components/markov.js';
import { POCKET } from './Slide17bCasino.jsx';

export const STATE_X = (i) => 80 + 150 * i;
export const VH = 250;
export const SY = 120;
export const SR = 40;
export const LOSE = '#6b7280';

// the colours (the user's request: a new design): red up (a red pocket), slate down (black); the
// states in slate, the start in the chips' blue, $0 in grey and $100 in green, each filled with a
// light tint of its colour
export const UP = POCKET.red;
export const DOWN = '#475569';
export const LOOK = [
  { stroke: '#9ca3af', fill: '#f3f4f6', text: LOSE },
  { stroke: '#94a3b8', fill: '#f8fafc', text: '#334155' },
  { stroke: '#1d4ed8', fill: '#eff6ff', text: '#1d4ed8' },
  { stroke: '#94a3b8', fill: '#f8fafc', text: '#334155' },
  { stroke: '#94a3b8', fill: '#f8fafc', text: '#334155' },
  { stroke: GREEN, fill: '#e6f2ea', text: GREEN },
];

// the story, one state's spins per key press (the user's request): $40 at once; 1, its two spins, to
// $60 and $20; 2, $60's, to $80; 3, $20's, to $0, where you stay; 4, $80's, to $100, where you stay.
// OUT_AT[i]: the key press of state i's two spins; IN_AT[i]: the key press of state i
export const OUT_AT = [0, 3, 1, 2, 4, 0];
export const IN_AT = [3, 1, 0, 1, 2, 4];

/** Part of the diagram, shown on key press `at` (at once if 0). */
export const At = ({ at, children }) =>
  at ? (
    <Fragment as="g" index={at}>
      {children}
    </Fragment>
  ) : (
    <g>{children}</g>
  );

/**
 * Your money, $0 to $100, as states: red (½) one to the right, black (½) one to the left; $0 and
 * $100, where the game ends, each with a loop (1). The first two spins, from $40, are labelled red
 * and black.
 */
export function Ladder({ width = 900 }) {
  return (
    <svg className="l16-ladder" viewBox={`0 0 900 ${VH}`} width={width} height={(width * VH) / 900} aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <At key={i} at={OUT_AT[i]}>
          {/* red: up $20, above; black: down $20, below */}
          <path
            d={`M${STATE_X(i) + 28},${SY - 30} Q${STATE_X(i) + 75},${SY - 72} ${STATE_X(i + 1) - 28},${SY - 30}`}
            fill="none"
            stroke={UP}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <polygon points={head([STATE_X(i) + 75, SY - 72], [STATE_X(i + 1) - 28, SY - 30])} fill={UP} />
          <TexSvg x={STATE_X(i) + 75} y={SY - 82} tex={r`\dfrac12`} size={24} color={UP} w={50} h={56} />
          <path
            d={`M${STATE_X(i) - 28},${SY + 30} Q${STATE_X(i) - 75},${SY + 72} ${STATE_X(i - 1) + 28},${SY + 30}`}
            fill="none"
            stroke={DOWN}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <polygon points={head([STATE_X(i) - 75, SY + 72], [STATE_X(i - 1) + 28, SY + 30])} fill={DOWN} />
          <TexSvg x={STATE_X(i) - 75} y={SY + 84} tex={r`\dfrac12`} size={24} color={DOWN} w={50} h={56} />
          {i === 2 && (
            <>
              <text x={STATE_X(i) + 95} y={SY - 76} className="l16-ladder-word" fill={UP}>
                red
              </text>
              {/* left of its ½, clear of "You start" */}
              <text x={STATE_X(i) - 95} y={SY + 90} textAnchor="end" className="l16-ladder-word" fill={DOWN}>
                black
              </text>
            </>
          )}
        </At>
      ))}
      {[0, 5].map((i) => (
        <At key={i} at={IN_AT[i]}>
          <path
            d={`M${STATE_X(i) - 18},${SY - 37} C${STATE_X(i) - 50},${SY - 100} ${STATE_X(i) + 50},${SY - 100} ${STATE_X(i) + 18},${SY - 37}`}
            fill="none"
            stroke={LOOK[i].stroke}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <polygon points={head([STATE_X(i) + 50, SY - 100], [STATE_X(i) + 18, SY - 37])} fill={LOOK[i].stroke} />
          <TexSvg x={STATE_X(i)} y={SY - 98} tex="1" size={21} color={LOOK[i].text} w={40} h={34} />
        </At>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <At key={i} at={IN_AT[i]}>
          <circle cx={STATE_X(i)} cy={SY} r={SR} fill={LOOK[i].fill} stroke={LOOK[i].stroke} strokeWidth={i === 2 ? 4 : 2.6} />
          <text x={STATE_X(i)} y={SY + 10} textAnchor="middle" className="l16-ladder-money" fill={LOOK[i].text}>
            ${20 * i}
          </text>
          {(i === 0 || i === 2 || i === 5) && (
            <text x={STATE_X(i)} y={SY + 74} textAnchor="middle" className="l16-ladder-end" fill={LOOK[i].text}>
              {i === 0 ? 'You’re broke' : i === 2 ? 'You start' : 'You leave'}
            </text>
          )}
        </At>
      ))}
    </svg>
  );
}

/**
 * Gambler's ruin (the textbook's Section 16.2, after Careful, before PageRank: the user's order),
 * after its story, A night at the casino: you against the casino (the user's request, in place of the
 * textbook's Alice against Bob), $40, $20 on red each spin of a fair wheel, until $100 or $0. The
 * story told on the diagram (the user's request, in place of a sentence): $40 at once, then one
 * state's spins per key press, 1 to 4 (Ladder); then (the user's order) on the left, 5: the 6 × 6
 * Markov matrix M alone; 6: p(n + 1) = M p(n) around it, and p(n) = Mⁿ p(0); on the right, in a card
 * of its own (the user's request), 7: p(n); 8: "e.g." p(0); 9: p(1).
 */
export default function Slide18Gambler() {
  return (
    <section className="dense">
      <h2>Gambler&rsquo;s ruin</h2>

      <div className="l16-ladder-wrap">
        <Ladder width={940} />
      </div>

      <div className="l16-gr-row">
        {/* the matrix M first; then, around it, p(n + 1) = … p(n) (CSS hides them until the
            marker's key press), and p(n) = Mⁿ p(0) */}
        <Fragment index={5} className="l16-gr-m">
          <span className="fragment fx-marker l16-gr-mark" data-fragment-index={6} aria-hidden="true" />
          <Tex
            display
            tex={r`\htmlClass{l16-gr-later}{\mathbf p(n+1)}\mathrel{\htmlClass{l16-gr-later}{=}}\underbrace{\begin{bmatrix}1&\frac12&0&0&0&0\\[1pt] 0&0&\frac12&0&0&0\\[1pt] 0&\frac12&0&\frac12&0&0\\[1pt] 0&0&\frac12&0&\frac12&0\\[1pt] 0&0&0&\frac12&0&0\\[1pt] 0&0&0&0&\frac12&1\end{bmatrix}}_{M}\htmlClass{l16-gr-later}{\mathbf p(n)}`}
          />
          <Fragment index={6}>
            <Tex display tex={r`\mathbf p(n)=M^n\,\mathbf p(0)`} />
          </Fragment>
        </Fragment>
        {/* what p(n) is, in a card of its own, apart from the recurrence (the user's request) */}
        <Fragment index={7} className="l16-gr-p">
          <p>
            <Tex tex={r`\mathbf p(n)`} />: the probabilities that you have
            <br />
            $0, $20, …, $100 after <Tex tex="n" /> spins
          </p>
          {/* "e.g." before p(0), and its space before p(1), so that they line up */}
          <Fragment index={8} className="l16-gr-eg">
            <span>e.g.</span>
            <Tex display className="tex-left" tex={r`\mathbf p(0)=(0,0,1,0,0,0)`} />
          </Fragment>
          <Fragment index={9} className="l16-gr-eg">
            <span className="l16-gr-eg-pad" aria-hidden="true">
              e.g.
            </span>
            <Tex display className="tex-left" tex={r`\mathbf p(1)=\left(0,\tfrac12,0,\tfrac12,0,0\right)`} />
          </Fragment>
        </Fragment>
      </div>
    </section>
  );
}
