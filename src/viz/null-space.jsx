import { useState } from 'react';
import '../lectures/l22/styles/deck.css';
import { Picked, COLLAPSE_2, COLLAPSE_3 } from '../lectures/l22/components/ImageCards.jsx';

export const lecture = 22;

// [1 2; 1 2] and the shear [1 1; 0 1]; then the projections onto the xy-plane and onto the z-axis
const EXAMPLES = [...COLLAPSE_2, ...COLLAPSE_3];

/*
 * Null space, without its title and its definition (the caption has it): four of Image's examples,
 * two by two, each matrix beside its picture, played once: the inputs (the grid of ℝ², or a cube in
 * ℝ³) move onto their outputs and C(A) lights up in teal. On the slide N(A) comes on the next key
 * press, dashed on the collapsed picture, and on the one after the picture plays again with N(A)
 * solid green among the inputs, shrinking into 0; here a click on a card plays it again with N(A)
 * (its dashed copy and label stay), and says what N(A) is under it. (N(A) is hidden by site.css
 * until then; each card is its own Picked, drawn afresh to play again.)
 */
export default function NullSpace() {
  // how many times each card has been clicked (0: not checked yet)
  const [plays, setPlays] = useState(() => EXAMPLES.map(() => 0));
  const play = (k) => setPlays((p) => p.map((v, i) => (i === k ? v + 1 : v)));
  return (
    <div className="ns-grid">
      {EXAMPLES.map((ex, k) => (
        <div
          key={k}
          role="button"
          tabIndex={0}
          className={`ns-card${plays[k] ? ' ns-checked' : ''}`}
          aria-label={plays[k] ? 'Play it again' : 'What is N(A)? Click to check'}
          onClick={() => play(k)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              play(k);
            }
          }}
        >
          <Picked key={plays[k]} run="null" examples={[ex]} />
        </div>
      ))}
    </div>
  );
}
