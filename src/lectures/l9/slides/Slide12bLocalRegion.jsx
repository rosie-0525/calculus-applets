import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { IntervalGraph, IntervalMark, IV, HillsOnD, HillMark, HILL } from '../components/regions.jsx';

export const RED = '#8c1515';
export const TEAL = '#0e7490';

/**
 * Local extrema on a region, the first slide on restricted domains (before Interior and boundary
 * points and Global extrema): the definition of a local maximum (minimum) of f: D → ℝ, with only
 * the points of D near a compared. Key press 1: f on [a, b], whose local extrema are the two
 * critical points (horizontal tangent lines) and the two endpoints (not); 2: the two hills on the
 * rectangle D, local maxima at the small top (a critical point) and at the corner of D (not).
 * Both pictures are in regions.jsx.
 */
export default function Slide12bLocalRegion() {
  return (
    <section className="dense">
      <h2>Local extrema on a region</h2>

      <p>
        Let <Tex tex={r`f:D\to\mathbb{R}`} /> be a scalar-valued function defined on a subset{' '}
        <Tex tex={r`D\subset\mathbb{R}^2`} />.
      </p>
      <div className="block definition">
        <p className="block-title">Definition</p>
        <p>
          <Tex tex="f" /> has a <strong>local maximum</strong> on <Tex tex="D" /> at a point <Tex tex={r`\mathbf{a}`} /> in{' '}
          <Tex tex="D" /> if for every point <Tex tex={r`\mathbf{x}`} /> in <Tex tex="D" /> sufficiently close to{' '}
          <Tex tex={r`\mathbf{a}`} /> we have <Tex tex={r`{f(\mathbf{x})\le f(\mathbf{a}).}`} />
        </p>
        <p>
          A <strong>local minimum</strong> on <Tex tex="D" /> is defined similarly.
        </p>
      </div>

      <div className="global-pics">
        <Fragment index={1} className="global-pic">
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
        </Fragment>

        <Fragment index={2} className="global-pic">
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
        </Fragment>
      </div>
    </section>
  );
}
