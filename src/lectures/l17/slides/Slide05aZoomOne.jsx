import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { ZoomOne } from '../components/Zoom.jsx';
import { G_COLOR } from '../components/ChainPicture.jsx';

/**
 * Zooming in (right before Why does the chain rule hold?, on the same g and a): the
 * linear approximation in words, above the picture; key press 1: the picture, g: ℝ² → ℝ², the patch
 * round a with the letter F and its image under g, bent; 2: x − a and g(x) − g(a), x draggable; 3:
 * both pictures zoom in, the image straightens out into a parallelogram and g(x) − g(a) turns into
 * (Dg)(a)(x − a); 4: multiply by (Dg)(a) under the arrow; 5: g(x) − g(a) ≈ (Dg)(a)(x − a) near a,
 * in a box: the linear approximation (Lecture 13).
 */
export default function Slide05aZoomOne() {
  return (
    <section className="dense">
      <h2>Zooming in</h2>
      <p className="l17-zoom-recall">Linear approximation: locally, any function is approximately multiplication by its derivative matrix.</p>
      <ZoomOne index={{ show: 1, vectors: 2, zoom: 3, matrix: 4 }} />
      <Fragment index={5} className="block definition l17-zoomone-box">
        <Tex display tex={r`g(\vv x)-g(\vv a)\approx\textcolor{${G_COLOR}}{(Dg)(\vv a)}\,(\vv x-\vv a)\quad\text{near }\vv a`} />
      </Fragment>
    </section>
  );
}
