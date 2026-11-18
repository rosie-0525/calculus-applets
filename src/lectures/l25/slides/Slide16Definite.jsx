import Tex, { r } from '../components/Tex.jsx';
import DefCards from '../components/DefCards.jsx';

/**
 * Definiteness (Mark's box, the textbook's Definition 24.2.2): on arrival, the definition's first
 * sentence; the definition, then the examples (the user's request; DefCards.jsx, `split`): key presses
 * 1–3, positive-definite, negative-definite, indefinite; 4–6, each column's example: Lecture 21's bowl,
 * dome and saddle, with A and q_A under each. The semidefinite clauses moved to Semidefinite, next,
 * each with an example (the user's request; `semi={false}`). The same cards come again on
 * Definiteness and eigenvalues (there a column per key press, then the semidefinite clauses). No
 * slide title (the user removed the title Definiteness).
 */
export default function Slide16Definite() {
  return (
    <section>
      <div className="block definition l25-defs-box">
        <p className="block-title">Definition</p>
        <p>
          Let <Tex tex="A" /> be an <Tex tex={r`n\times n`} /> symmetric matrix and <Tex tex={r`q_A(\vv x)`} /> its associated quadratic form. We say <Tex tex="A" /> is:
        </p>
      </div>
      <DefCards run="def" split semi={false} />
    </section>
  );
}
