import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { HillsGraph, HillsOnD, HillMark, HILL } from '../components/regions.jsx';

export const RED = '#8c1515';
export const GRAY = '#6b7280';

/**
 * Global extrema: Mark's definition, f: D → ℝ on D ⊂ ℝ², then (key press 1) the (global) maximum
 * and minimum. Under it the two hills: as a function on ℝ², its global maximum is the top of the
 * big hill, and the small hill's top is only a local maximum; key press 2: on the region
 * D = [−3, 0.5] × [−3, 0.4] (the graph over D only, D shaded on the floor), the global maximum is
 * at the corner (0.5, 0.4) of D, a boundary point, not a critical point (both graphs in
 * regions.jsx); 3: find the global extrema by finding all the local extrema and comparing them.
 */
export default function Slide13Global() {
  return (
    <section className="dense">
      <h2>Global extrema</h2>

      <div className="block definition">
        <p className="block-title">Definition</p>
        <p>
          Let <Tex tex={r`f:D\to\mathbb{R}`} /> be a scalar-valued function defined on a subset{' '}
          <Tex tex={r`D\subset\mathbb{R}^2`} />.
        </p>
        <Fragment index={1}>
          <p>
            We say <Tex tex="f" /> has a <strong>(global) maximum</strong> on <Tex tex="D" /> at the point{' '}
            <Tex tex={r`\mathbf{a}=(a_1,\ldots,a_n)`} /> in <Tex tex="D" /> if
          </p>
          <Tex display tex={r`f(\mathbf{a})\ge f(\mathbf{x})\quad\text{for all }\mathbf{x}=(x_1,\ldots,x_n)\text{ in }D.`} />
          <p>
            A <strong>(global) minimum</strong> on <Tex tex="D" /> is defined similarly.
          </p>
        </Fragment>
      </div>

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

        <Fragment index={2} className="global-pic">
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
        </Fragment>
      </div>

      <Fragment index={3} as="p" className="global-find">
        We can find the global extrema by finding all the local extrema and comparing their values.
      </Fragment>
    </section>
  );
}
