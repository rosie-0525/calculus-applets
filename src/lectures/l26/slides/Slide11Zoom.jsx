import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import DiagCard from '../components/DiagCard.jsx';
// import ZoomContour from '../components/ZoomContour.jsx'; // its two plots removed (the user's request)

// the question's options (the user's request): circles, ellipses, ellipses the other way; the
// contour plots of x² + y², 4x² + y² (longer along the y-axis) and x² + 4y² (along the x-axis: c,
// the answer)
export const OPTIONS = [
  { l1: 1, l2: 1, title: 'Circles' },
  { l1: 4, l2: 1, title: 'Ellipses, longer along the y-axis' },
  { l1: 1, l2: 4, title: 'Ellipses, longer along the x-axis', correct: true },
];

/**
 * Poll (the user's request: it was Contour plots near a critical point): an example, f(x, y) =
 * 2 cos x + 2 cos 2y (the user's request: integer coefficients in its quadratic approximation; it was
 * cos x + cos 2y), with a local maximum at (0, 0), and the question what its contour plot looks like
 * there (in the poll's box, untitled, the slide being Poll; no owl: the user's requests), its options
 * three contour plots: circles, ellipses longer along the y-axis, ellipses longer along the x-axis
 * (OPTIONS). Key press 1 (the user's request: before the answer), under the poll's box, "The
 * quadratic approximation gives f(x, y) ≈ 4 − x² − 4y²" (the user's words); 2, c is outlined (as a poll's answer);
 * 3, at the end (the user's request: moved from Contour plots of ax² + by²), Mark's box: the level
 * sets of f near a critical point a are well-approximated by those of q_{Hf(a)}. (The approximation
 * near any critical point, which was under the poll, went to the next slide, then was removed: the
 * user's requests.) (The picture under it, ZoomContour.jsx: Example 3's f
 * zooming into the local minimum (1, 1), beside the contour plot of q_{Hf(1,1)}, then into the saddle
 * point (3, 0), beside q_{Hf(3,0)}: removed, the user's request, the two plots confusing.)
 */
export default function Slide11Zoom() {
  return (
    <section>
      <h2>Poll</h2>

      {/* (Hf)(x, y) = [−2 cos x 0; 0 −8 cos 2y], (Hf)(0, 0) = [−2 0; 0 −8], so
          f(h₁, h₂) ≈ 4 − h₁² − 4h₂²: level sets h₁² + 4h₂² = c, ellipses twice as long along the x-axis
          (the smaller |λ|, 2): c. */}
      <FxMarker index={2} id="poll-answer" />
      <div className="block poll fx-host l26-zq-poll">
        <p>
          <Tex tex={r`f(x,y)=2\cos x+2\cos 2y`} /> has a local maximum at <Tex tex={r`\vv a=(0,0)`} />. What does its contour plot look like near <Tex tex="(0,0)" />?
        </p>
        <ul className="poll-options l26-zq-opts">
          {OPTIONS.map((o, k) => (
            <li key={o.title} className={o.correct ? 'correct' : undefined}>
              <span className="opt">{'abc'[k]})</span>
              <DiagCard l1={o.l1} l2={o.l2} size={165} title={o.title} axisLabels />
            </li>
          ))}
        </ul>
      </div>

      <Fragment index={1} as="p" className="l26-zq-approx">
        The quadratic approximation gives{' '}
        <span className="nowrap">
          <Tex tex={r`f(x,y)\approx 4-x^2-4y^2`} />.
        </span>
      </Fragment>

      {/* Mark's box (moved from Contour plots of ax² + by²: the user's request), after the answer */}
      <Fragment index={3} className="block theorem l26-zoom-box l26-zq-box">
        <p>
          Level sets of <Tex tex="f" /> near a critical point <Tex tex={r`\vv a`} /> are well-approximated by the level sets of the quadratic form{' '}
          <Tex tex={r`q_{(Hf)(\vv a)}`} />.
        </p>
      </Fragment>

      {/* the two plots (ZoomContour): removed (the user's request)
      <ZoomContour
        at={1}
        size={300}
        labels={[
          <Tex key="f" tex="f(x,y)=x^2y+xy^2-3xy" />,
          <Tex key="q0" tex={r`q_{(Hf)(1,1)}(\vv h)=2h_1^2+2h_1h_2+2h_2^2`} />,
          <Tex key="q1" tex={r`q_{(Hf)(3,0)}(\vv h)=6h_1h_2+6h_2^2`} />,
        ]}
      />
      */}
    </section>
  );
}
