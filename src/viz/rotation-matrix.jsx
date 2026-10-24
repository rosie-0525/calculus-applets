import { useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import Fragment from '../lectures/l14/components/Fragment.jsx';
import Slider from '../lectures/l14/components/Slider.jsx';
import RotationPicture from '../lectures/l14/components/Rotation.jsx';
import { ANGLES, radians, exact } from '../lectures/l14/slides/Slide07bRotationMatrix.jsx';

export const lecture = 14;

/*
 * The matrix of R_θ with every step showing: R_θ(e₁) and R_θ(e₂), the box with the matrix (14.4.1),
 * and the picture, e₁ and e₂ on the unit circle with their images and coordinates, over the slider
 * for θ (the multiples of π/6 and π/4) and the matrix's exact entries. On the slide e₁ and e₂ each
 * turn to their image on a key press; here they are there.
 */
export default function RotationMatrix() {
  const [k, setK] = useState(ANGLES.indexOf(60));
  const theta = ANGLES[k];
  const [c, s] = [Math.cos((theta * Math.PI) / 180), Math.sin((theta * Math.PI) / 180)];
  return (
    <div className="stage l14-rot-stage">
      <div className="stage-text">
        <ul className="bullets l14-rot-cols">
          <li>
            <Tex tex={r`R_\theta(\vv e_1)=\begin{bmatrix}\cos\theta\\ \sin\theta\end{bmatrix}`} />
          </li>
          <li>
            <Tex tex={r`R_\theta(\vv e_2)=\begin{bmatrix}-\sin\theta\\ \cos\theta\end{bmatrix}`} />
          </li>
        </ul>

        <div className="block theorem">
          <p>
            The matrix of <Tex tex={r`R_\theta:\mathbb R^2\to\mathbb R^2`} /> is
          </p>
          <Tex display tex={r`\begin{bmatrix}\cos\theta&-\sin\theta\\ \sin\theta&\cos\theta\end{bmatrix}.`} />
        </div>
      </div>

      <div className="stage-fig l14-rot-fig">
        <RotationPicture theta={theta} pair={false} basis unit={132} />
        <div className="l14-rot-controls l14-rot-exact">
          <Slider
            name="θ"
            label={<Tex tex={r`\theta`} />}
            value={k}
            onChange={setK}
            min={0}
            max={ANGLES.length - 1}
            step={1}
            format={(j) => <Tex tex={radians(ANGLES[j])} />}
          />
          {/* a fragment, as on the slide, for its box of a fixed size (l14-rot-exact in deck.css) */}
          <Fragment index={3} as="span">
            <Tex tex={r`\begin{bmatrix}${exact(c)}&${exact(-s)}\\ ${exact(s)}&${exact(c)}\end{bmatrix}`} />
          </Fragment>
        </div>
      </div>
    </div>
  );
}
