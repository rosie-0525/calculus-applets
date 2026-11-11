import { useRef } from 'react';
import '../lectures/l22/styles/deck.css';
import { Examples } from '../lectures/l22/components/ImageCards.jsx';
import { useClickToCheck } from './image-r1.jsx';

export const lecture = 22;

/**
 * The examples of The rank–nullity theorem for the groups `groups` (ImageCards.jsx, run 'rn'), a
 * bullet for each ℝⁿ → ℝᵐ and its examples under it, each matrix beside its picture on a loop: the
 * inputs move onto their outputs, N(A) green among them shrinking into 0 (a dashed copy stays), and
 * the image C(A) lights up in teal. On the slide each card's rank and nullity come on the key press
 * after it; here when the card is clicked.
 */
export function RankNullityExamples({ groups }) {
  const ref = useRef(null);
  useClickToCheck(ref, '.l22-rn-cell');
  return (
    <div ref={ref} className="rn-ask">
      <Examples run="rn" groups={groups} />
    </div>
  );
}

/* The rank–nullity theorem and its first continuation, without their titles and the theorem's box
   (the caption has it): ℝ² → ℝ², the zero matrix, [1 2; 1 2] and the shear [1 1; 0 1]; ℝ² → ℝ³, the
   zero matrix, [0 0; 1 −1; 1 −1] and [1 0; 0 1; 1 1]. */
export default function RankNullityR2() {
  return <RankNullityExamples groups={['r22', 'r23']} />;
}
