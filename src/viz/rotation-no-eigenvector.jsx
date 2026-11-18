import { useEffect, useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import Hunt from '../lectures/l24/components/Hunt.jsx';
import Slider from '../lectures/l24/components/Slider.jsx';
import { FImage, GridImage } from '../lectures/l24/components/FShape.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { BLUE } from '../lectures/l24/components/eig.js';
import { rot, X0 } from '../lectures/l24/slides/Slide11Poll.jsx';
import { TrueFalse } from './orthogonal-products.jsx';

export const lecture = 24;

/**
 * Why not, once the poll is answered (`on`): the grid, the unit square and F turned by 90°, x (to
 * drag) and Ax on top; then the slider for θ, which turns them by θ (until it is moved, it follows the
 * turn), and the slogan.
 */
function Why({ on }) {
  const t = useTween(on, { ms: 2800, delay: 600 });
  const [x, setX] = useState(X0);
  const [theta, setTheta] = useState(null);
  useEffect(() => {
    if (!on) {
      setTheta(null);
      setX(X0);
    }
  }, [on]);
  const deg = theta ?? Math.round(90 * t);
  const M = rot(theta ?? 90 * t);
  return (
    <div className="l24-poll-why rot-why">
      <Hunt
        M={M}
        x={x}
        onDrag={on ? setX : undefined}
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
      <div className="l24-poll-side rot-side">
        <div className="lc-sliders l24-rot-slider">
          <Slider name="theta" label={<Tex tex={r`\theta`} />} value={deg} onChange={setTheta} min={0} max={180} step={5} format={(v) => `${v}°`} color={BLUE} />
        </div>
        <p className="l24-poll-slogan">
          The rotation matrix <Tex tex={r`R_\theta`} /> does not have an eigenvector unless <Tex tex={r`\theta=0^\circ`} /> and <Tex tex={r`180^\circ`} />.
        </p>
      </div>
    </div>
  );
}

/*
 * Poll, without its title: true or false, every square matrix has an eigenvector (Christine's). Then
 * why not: the rotation by 90°, the grid, the unit square and F turning (every line turns), x (dragged
 * from anywhere on the picture) and Ax with the dotted line of x on top (Hunt.jsx: the line lights up
 * when Ax is on it); beside it the slider for θ, which turns the grid, F and Ax (the line lights up at
 * 0° and 180°), and the slogan. On the slide False is outlined on key press 1, then the turn, x and
 * Ax, the slider and the slogan come one per key press; here a click on True or False shows them all
 * and the turn plays.
 */
export default function RotationNoEigenvector() {
  return (
    <div className="rot-poll">
      <TrueFalse
        answer="False"
        statement={
          <>
            <strong>True or false?</strong> Every square matrix has an eigenvector.
          </>
        }
      >
        {(on) => <Why on={on} />}
      </TrueFalse>
    </div>
  );
}
