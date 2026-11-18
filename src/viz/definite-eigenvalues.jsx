import '../lectures/l25/styles/deck.css';
import DefCards from '../lectures/l25/components/DefCards.jsx';

export const lecture = 25;

/*
 * Definiteness and eigenvalues, without the diagonalization formula's box and "Therefore, a symmetric
 * matrix is:" (the caption has them): Definiteness's three columns again (DefCards.jsx, run 'eig'),
 * each clause now on the signs of the eigenvalues, each graph (a bowl, a dome, a saddle) with its
 * matrix and its eigenvalues under it, and under the first two graphs the semidefinite clauses. On
 * the slide the columns come one key press at a time, smaller under the box; here all at once, at
 * Definiteness's size, and each graph turns when dragged. In a narrow box the columns are one under
 * the other.
 */
export default function DefiniteEigenvalues() {
  return (
    <div className="def-cards">
      <DefCards run="eig" />
    </div>
  );
}
