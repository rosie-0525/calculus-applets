import '../lectures/l16/styles/deck.css';
import { Roulette } from '../lectures/l16/slides/Slide17bCasino.jsx';

export const lecture = 16;

/*
 * A night at the casino: the story, you with $40 at roulette, $20 on red each spin until you have
 * $100 or nothing, beside a fair wheel of 6 pockets to play (Spin; at $100 or $0, Play again). The
 * slide's question, the chance that you leave with $100, is the caption.
 */
export default function Casino() {
  return (
    <div className="l16-cas">
      <div className="l16-cas-story">
        <p>
          Imagine: you walk into a Las Vegas casino with <strong>$40</strong>, hoping to leave with <strong>$100</strong>.
        </p>
        <ul>
          <li>Each spin of the roulette wheel, you bet $20 on red.</li>
          <li>Red: you win $20. Black: you lose your $20.</li>
          <li>You stop when you have $100 or nothing left.</li>
        </ul>
        <p className="l16-cas-odds">3 of the 6 pockets are red. A fair game!</p>
      </div>
      <Roulette />
    </div>
  );
}
