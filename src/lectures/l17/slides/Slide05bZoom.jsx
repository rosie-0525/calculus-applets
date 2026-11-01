import Fragment from '../components/Fragment.jsx';
import Zoom from '../components/Zoom.jsx';

/**
 * Why does the chain rule hold? (after Zooming in; in place of the algebra of
 * Slide05Why.jsx): a patch round a with the letter F, its
 * images under g and f ∘ g; key press 1: the three pictures zoom in, and the curved images
 * straighten out (near a point, a function is its linear approximation: Lecture 13, and Zooming
 * in, just before); 2: zoomed in, g is the
 * matrix (Dg)(a) and f is (Df)(g(a)); 3: one after the other is their product (Lecture 15's
 * composition of linear maps), the chain rule, with the textbook reference. (The recall of the
 * linear approximation above the picture and the sentence under it were removed.)
 */
export default function Slide05bZoom() {
  return (
    <section className="dense">
      <h2>Why does the chain rule hold?</h2>
      <Zoom />
      <Fragment index={3} as="p" className="pointer right">
        (→ Section 17.4)
      </Fragment>
    </section>
  );
}
