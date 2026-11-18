import '../lectures/l25/styles/deck.css';
import DefCards from '../lectures/l25/components/DefCards.jsx';

export const lecture = 25;

/*
 * Definiteness, without its box (the caption has the definition): DefCards.jsx's three columns,
 * positive-definite, negative-definite and indefinite, each its clause, the definition's (on the
 * values of q_A), over its example, Lecture 21's graph of x² + y², −x² − y² or x² − y² (a bowl, a
 * dome, a saddle), with A and q_A under it. On the slide the clauses come one key press at a time,
 * then the examples; here all at once, and each graph turns when dragged. In a narrow box the columns
 * are one under the other.
 */
export default function Definiteness() {
  return (
    <div className="def-cards">
      <DefCards run="def" semi={false} />
    </div>
  );
}
