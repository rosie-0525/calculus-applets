import { useEffect, useState } from 'react';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Hunt from '../components/Hunt.jsx';
import Slider from '../components/Slider.jsx';
import Tex, { r } from '../components/Tex.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import { useMarkers } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { BLUE } from '../components/eig.js';

// the rotation by `deg` degrees, exact at the multiples of 90° (so that Ax = x and Ax = −x are
// recognized)
export const rot = (deg) => {
  const t = (deg * Math.PI) / 180;
  const c = deg % 180 === 90 ? 0 : Math.cos(t);
  const s = deg % 180 === 0 ? 0 : Math.sin(t);
  return [
    [c, -s],
    [s, c],
  ];
};
export const X0 = [1.25, 0.5];

/**
 * Poll (Christine's: true or false, all matrices have eigenvectors), by show of hands. Key press 1:
 * False is outlined; 2: why: the rotation by 90° (the textbook's Example 23.1.7), What the three
 * matrices do's animation, zoomed in to 2 × 2 squares a quadrant (the grid, the unit square and F
 * turn: every line turns); 3: x (to drag), Ax and the dotted line of x on top (Rotations' hunt, the
 * slide it replaces); 4: the slider for θ, which turns the grid, F and Ax (the line lights up at 0°
 * and 180°); 5: the slogan (the user's words). Print: θ = 90°.
 */
export default function Slide11Poll() {
  const [markers, on] = useMarkers([2, 4]);
  const t = useTween(on[0], { ms: 2800, delay: 1000 });
  const [x, setX] = useState(X0);
  const [theta, setTheta] = useState(90);
  const sliding = on[1];
  // back before the slider: θ returns to 90°, where the turn ended
  useEffect(() => {
    if (!sliding) setTheta(90);
  }, [sliding]);
  const M = rot(PRINT ? 90 : sliding ? theta : 90 * t);
  return (
    <section>
      <h2>Poll</h2>
      {markers}

      <FxMarker index={1} id="poll-answer" />
      <div className="block poll fx-host">
        <p>
          <strong>True or false?</strong> Every square matrix has an eigenvector.
        </p>
        <ul className="poll-options two">
          <li>
            <span className="opt">a)</span> True
          </li>
          <li className="correct">
            <span className="opt">b)</span> False
          </li>
        </ul>
      </div>

      <div className="l24-poll-why">
        <Fragment index={2}>
          <Hunt
            M={M}
            x={x}
            onDrag={PRINT ? undefined : setX}
            index={{ x: 3, ax: 3, line: 3 }}
            unit={93}
            pad={6}
            xRange={[-2, 2]}
            yRange={[-2, 2]}
            under={(p) => (
              <g opacity="0.7">
                <GridImage p={p} M={M} />
                <FImage p={p} home />
                <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
              </g>
            )}
            title="The grid, the unit square and F turned by θ; x, to drag, and Ax"
          />
        </Fragment>
        <div className="l24-poll-side">
          <Fragment index={4} className="lc-sliders l24-rot-slider">
            <Slider name="theta" label={<Tex tex={r`\theta`} />} value={theta} onChange={setTheta} min={0} max={180} step={5} format={(v) => `${v}°`} color={BLUE} />
          </Fragment>
          <Fragment index={5} as="p" className="l24-poll-slogan">
            The rotation matrix <Tex tex={r`R_\theta`} /> does not have an eigenvector unless <Tex tex={r`\theta=0^\circ`} /> and{' '}
            <Tex tex={r`180^\circ`} />.
          </Fragment>
        </div>
      </div>
    </section>
  );
}
