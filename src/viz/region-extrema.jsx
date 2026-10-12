import '../lectures/l9/styles/deck.css';
import Tex, { r } from '../lectures/l9/components/Tex.jsx';
import { IntervalGraph, IntervalMark, IV, HillsOnD, HillMark, HILL } from '../lectures/l9/components/regions.jsx';
import { RED, TEAL } from '../lectures/l9/slides/Slide12bLocalRegion.jsx';

export const lecture = 9;

/* The slide's two pictures, without the definition above them (the caption says it): f on [a, b],
   local extrema at its two critical points and at its two endpoints; the two hills on a rectangle
   D, local maxima at the small top and at a corner of D. */
export default function RegionExtrema() {
  return (
    <div className="global-pics">
      <div className="global-pic">
        <p className="global-label">
          <Tex tex={r`f:[a,b]\to\mathbb{R}`} />
        </p>
        <IntervalGraph unit={[76, 40]} title="The graph of a function on an interval [a, b]: local maxima at the endpoint a and at a critical point, local minima at a critical point and at the endpoint b">
          {(p) => (
            <g>
              <IntervalMark p={p} c={IV.a} color={RED} label="local max" anchor="start" dx={10} dy={-10} />
              <IntervalMark p={p} c={IV.min} color={TEAL} label="local min" flat below />
              <IntervalMark p={p} c={IV.max} color={RED} label="local max" flat />
              <IntervalMark p={p} c={IV.b} color={TEAL} label="local min" anchor="end" dx={-14} dy={6} />
            </g>
          )}
        </IntervalGraph>
      </div>

      <div className="global-pic">
        <p className="global-label">
          <Tex tex={r`f:D\to\mathbb{R}`} />
        </p>
        <HillsOnD title="The graph of the two hills over a rectangle D only: local maxima at the top of the small hill and at a corner of D">
          {(s) => (
            <g>
              <HillMark s={s} at={HILL.small} color={RED} label="local max" />
              <HillMark s={s} at={HILL.corner} color={RED} label="local max" />
            </g>
          )}
        </HillsOnD>
      </div>
    </div>
  );
}
