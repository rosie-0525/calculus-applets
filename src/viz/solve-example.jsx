import { useState } from 'react';
import '../lectures/l22/styles/deck.css';
import Tex, { r } from '../lectures/l22/components/Tex.jsx';
import SolveCard, { B_START } from '../lectures/l22/components/SolveCard.jsx';
import { B_IN, B_OUT } from '../lectures/l22/components/ls.js';

export const lecture = 22;

// where b starts, and the two right-hand sides of the example's parts (iv) and (v)
const PLACES = [
  { name: null, b: B_START },
  { name: r`\vv b=(5,4,-4)`, b: B_IN },
  { name: r`\vv b=(0,1,0)`, b: B_OUT },
];

/*
 * Example 1 (board), without its title and its parts (the caption has them): the system (∗) and,
 * beside it, its picture (SolveCard.jsx): the plane C(A) = span{v₁, v₂, v₃} of the columns of A as a
 * floor (v₃ = v₁ + v₂, v₂ dashed from v₁'s tip to v₃'s), and b, dragged by its tip (dragging the
 * picture elsewhere turns it); within a little of the plane b lands on it. Under it, "Ax = b has a
 * solution!" or "no solution!". On the slide key presses 2 and 3 put b at (5, 4, −4), in the plane,
 * and at (0, 1, 0), off it; here two buttons, each drawing the card afresh with b there.
 */
export default function SolveExample() {
  const [k, setK] = useState(0);
  const [turn, setTurn] = useState(0);
  return (
    <div className="viz-col solve-ex">
      <div className="l22-ex-row">
        <div className="l22-ex-text">
          <Tex display tex={r`\left\{\begin{aligned}2x+y+3z&=b_1\\ x+2y+3z&=b_2\\ -x-2y-3z&=b_3\end{aligned}\right.\qquad(*)`} />
        </div>
        <SolveCard key={`${k}-${turn}`} first={0} stages={[{ at: 0, b: PLACES[k].b }]} />
      </div>
      <div className="viz-toggle" role="group" aria-label="Where b is">
        {PLACES.map((pl, i) =>
          i === 0 ? null : (
            <button
              key={pl.name}
              type="button"
              className="viz-button"
              aria-pressed={k === i}
              onClick={() => {
                setK(i);
                setTurn((t) => t + 1);
              }}
            >
              <Tex tex={pl.name} />
            </button>
          ),
        )}
        <button
          type="button"
          className="viz-button"
          disabled={k === 0}
          onClick={() => {
            setK(0);
            setTurn((t) => t + 1);
          }}
        >
          Start again
        </button>
      </div>
    </div>
  );
}
