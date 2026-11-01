import { useEffect, useRef, useState } from 'react';
import '../lectures/l17/styles/deck.css';
import Tex, { r } from '../lectures/l17/components/Tex.jsx';
import { ZoomOne } from '../lectures/l17/components/Zoom.jsx';
import { G_COLOR } from '../lectures/l17/components/ChainPicture.jsx';

export const lecture = 17;

/**
 * A key for a picture that plays once its fragments are shown (Zoom.jsx's zooms, LinearOrNot): 0,
 * then 1 the first time the applet is on screen (the section `present`), and one more on each
 * `replay()`, so that a picture mounted afresh with it plays where it is seen. The page shows every
 * fragment as soon as the module loads, a screen or two before the reader gets there.
 */
export function useReplay(ref) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section) return undefined;
    const mo = new MutationObserver(() => check());
    const check = () => {
      if (!section.classList.contains('present')) return;
      setRun((n) => n || 1);
      mo.disconnect();
    };
    mo.observe(section, { attributes: true, attributeFilter: ['class'] });
    check();
    return () => mo.disconnect();
  }, [ref]);
  return [run, () => setRun((n) => n + 1)];
}

/*
 * Zooming in, without its title and the sentence above the picture (the caption has it): g: ℝ² → ℝ²,
 * the patch round a with the letter F and its image round g(a), bent, the vectors x − a and
 * g(x) − g(a), x to drag; both pictures zoom in, ×1 to ×100, the image straightening into a
 * parallelogram, "multiply by (Dg)(a)" under the arrow; then the box g(x) − g(a) ≈ (Dg)(a)(x − a).
 * On the slide the picture, the vectors, the zoom and the matrix come one per key press; here the
 * zoom plays the first time the applet is on screen, and again on Zoom in again (x back where it
 * started).
 */
export default function ZoomIn() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  return (
    <div className="viz-col zoom-col" ref={ref}>
      <ZoomOne key={run} />
      <div className="block definition l17-zoomone-box">
        <Tex display tex={r`g(\vv x)-g(\vv a)\approx\textcolor{${G_COLOR}}{(Dg)(\vv a)}\,(\vv x-\vv a)\quad\text{near }\vv a`} />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Zoom in again
        </button>
      </div>
    </div>
  );
}
