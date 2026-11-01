import { useRef } from 'react';
import '../lectures/l17/styles/deck.css';
import Zoom from '../lectures/l17/components/Zoom.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 17;

/*
 * Why does the chain rule hold?, without its title and the pointer to Section 17.4: the patch round
 * a with the letter F, its images round g(a) under g and round f(g(a)) under f; the three pictures
 * zoom in, ×1 to ×100, and the bent images straighten out into the images under (Dg)(a) and
 * (Df)(g(a)), named under the arrows; the shortcut f ∘ g under them, with their product. On the
 * slide the zoom, the matrices and the shortcut come one per key press; here the zoom plays the
 * first time the applet is on screen, and again on Zoom in again (or a click on the picture).
 */
export default function ChainZoom() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  return (
    <div className="viz-col zoom-col" ref={ref}>
      <Zoom key={run} />
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Zoom in again
        </button>
      </div>
    </div>
  );
}
