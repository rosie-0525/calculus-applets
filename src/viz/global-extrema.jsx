import '../lectures/l9/styles/deck.css';
import Tex, { r } from '../lectures/l9/components/Tex.jsx';
import { HillsGraph, HillsOnD, HillMark, HILL } from '../lectures/l9/components/regions.jsx';
import { RED, GRAY } from '../lectures/l9/slides/Slide13Global.jsx';

export const lecture = 9;

/* The slide's two pictures, without the definition above them (the caption says it): the two hills
   on ℝ², whose global maximum is the top of the big hill, the small one's only local; and on the
   region D, where the global maximum is at a corner of D. */
export default function GlobalExtrema() {
  return (
    <div className="global-pics">
      <div className="global-pic">
        <p className="global-label">
          <Tex tex={r`f:\mathbb{R}^2\to\mathbb{R}`} />
        </p>
        <HillsGraph title="The graph of the two hills: the top of the big hill is the global maximum, the top of the small hill a local maximum">
          {(s) => (
            <g>
              <HillMark s={s} at={HILL.big} color={RED} label="global maximum" />
              <HillMark s={s} at={HILL.small} color={GRAY} label="local maximum" />
            </g>
          )}
        </HillsGraph>
      </div>

      <div className="global-pic">
        <p className="global-label">
          <Tex tex={r`f:D\to\mathbb{R}`} />
        </p>
        <HillsOnD title="The graph over the region D only: its highest point is at a corner of D">
          {(s) => (
            <g>
              <HillMark s={s} at={HILL.small} color={GRAY} label="local maximum" />
              <HillMark s={s} at={HILL.corner} color={RED} label="global maximum on D" />
            </g>
          )}
        </HillsOnD>
      </div>
    </div>
  );
}
