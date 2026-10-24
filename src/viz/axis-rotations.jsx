import { useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import { FxMarker } from '../lectures/l14/components/Fragment.jsx';
import Slider from '../lectures/l14/components/Slider.jsx';
import AxisRotation from '../lectures/l14/components/Rotation3.jsx';
import { Sub } from '../lectures/l14/components/Space.jsx';
import { THETA, EL, AXES } from '../lectures/l14/slides/Slide10Axes.jsx';

export const lecture = 14;

/*
 * Rotations around the coordinate axes with every step showing: around the z-axis, e₁, e₂, e₃ and
 * their images, over R_z(θ), all of its columns in their red (the markers c2, c3 show them); then
 * around the x-axis and the y-axis, each picture over its matrix. The slide draws them at θ = 40°,
 * the images of e₁ and e₂ turning to their places one per key press; here they are there, and the
 * slider (Example 3's, a slide the deck has commented out) turns all three.
 */
export default function AxisRotations() {
  const [theta, setTheta] = useState(THETA);
  return (
    <div className="viz-col">
      <FxMarker index={4} id="c2" />
      <FxMarker index={6} id="c3" />
      <div className="l14-axes">
        {AXES.map((a) => (
          <div key={a.k} className="l14-axis">
            <p className="l14-axis-name">
              Around the <Tex tex={a.name} />
              -axis
            </p>
            <AxisRotation
              k={a.k}
              theta={theta}
              width={380}
              height={310}
              unit={104}
              el={EL}
              {...(a.k === 2
                ? {
                    steps: [1, 3, 5],
                    name: (
                      <>
                        R<Sub>z</Sub>
                      </>
                    ),
                  }
                : { imageLabels: false })}
            />
            <Tex tex={a.tex} />
          </div>
        ))}
      </div>
      <div className="l14-rot-controls axes-slider">
        <Slider name="θ" label={<Tex tex={r`\theta`} />} value={theta} onChange={setTheta} min={0} max={360} step={1} format={(v) => `${v}°`} />
      </div>
    </div>
  );
}
