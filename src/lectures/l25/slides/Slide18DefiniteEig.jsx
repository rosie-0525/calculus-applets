import Fragment, { FxMarker } from '../components/Fragment.jsx';
import DefCards from '../components/DefCards.jsx';
import DiagBox from '../components/DiagBox.jsx';

/**
 * Definiteness and eigenvalues (the end of Mark's box Diagonalization formula; the textbook's
 * Proposition 24.2.10): on arrival, Diagonalization formula's red box glides here, full size (the
 * user's request: it was smaller here), and stays at the top (auto-animate, DiagBox.jsx); under it,
 * Therefore, a symmetric matrix is: in a blue box (the user's request: it was red). Key press 1: in the
 * red box, the brace with ≥ 0 under (wᵢ · wᵢ)tᵢ² (the user's request; its FxMarker l25-diag-brace,
 * deck.css); 2–4: Definiteness's cards again (DefCards.jsx, `shift`; `compact`, smaller graphs, so
 * that the slide fits under the full-size box), in the same order, each clause
 * now on the signs of the eigenvalues, each graph with its eigenvalues; 5: the semidefinite cases; 6:
 * the reference (in the blue box's corner, so that the slide fits). No slide title (the user removed
 * the title Definiteness and eigenvalues).
 */
export default function Slide18DefiniteEig() {
  return (
    <section data-auto-animate="">
      <FxMarker index={1} id="l25-diag-brace" />
      <DiagBox />
      {/* it fades in once the red box has landed (it would show through it on the way) */}
      <div className="block definition l25-defs-box l25-defs-therefore" data-auto-animate-delay="0.7" data-auto-animate-duration="0.5">
        <p>Therefore, a symmetric matrix is:</p>
        <Fragment index={6} as="p" className="pointer corner">
          (→ Proposition 24.2.10)
        </Fragment>
      </div>
      <DefCards run="eig" shift={1} compact />
    </section>
  );
}
