import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import RotationPicture from '../components/Rotation.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

// θ on the slider: the multiples of π/6 and π/4 in [0, 2π), whose cosines and sines are exact
export const ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** θ (degrees) in radians, as TeX: 0, π/6, …, π, …, 11π/6 (slashed, to read at the slider's size). */
export const radians = (deg) => {
  if (deg === 0) return '0';
  const g = gcd(deg, 180);
  const [n, d] = [deg / g, 180 / g];
  const top = n === 1 ? r`\pi` : r`${n}\pi`;
  return d === 1 ? top : r`${top}/${d}`;
};
// a cosine or sine of one of ANGLES, as TeX (slashed, like the angle)
export const EXACT = [
  [0, '0'],
  [0.5, '1/2'],
  [Math.SQRT2 / 2, r`\sqrt2/2`],
  [Math.sqrt(3) / 2, r`\sqrt3/2`],
  [1, '1'],
];
export const exact = (x) => {
  const [, t] = EXACT.find(([v]) => Math.abs(Math.abs(x) - v) < 1e-9);
  return x < -1e-9 ? `-${t}` : t;
};

/**
 * The matrix of R_θ (Section 14.4, (14.4.1)): its columns, where e₁ and e₂ go. Key press 1:
 * R_θ(e₁) = (cos θ, sin θ) (the picture: e₁ turning to it on the unit circle, its coordinates); 2:
 * R_θ(e₂) = (−sin θ, cos θ), likewise; 3: the box, the matrix, and its exact entries next to the
 * slider for θ, which takes only the multiples of π/6 and π/4 (the user's request).
 */
export default function Slide07bRotationMatrix() {
  const [k, setK] = useState(ANGLES.indexOf(60));
  const theta = ANGLES[k];
  const [c, s] = [Math.cos((theta * Math.PI) / 180), Math.sin((theta * Math.PI) / 180)];
  const e1Ref = useRef(null);
  const e2Ref = useRef(null);
  const t1 = useTween(useFragmentShown(e1Ref), { ms: 1500, delay: 300 });
  const t2 = useTween(useFragmentShown(e2Ref), { ms: 1500, delay: 300 });
  const turn = (t) => theta * (PRINT ? 1 : t);
  return (
    <section className="dense">
      <h2>
        The matrix of <Tex tex={r`R_\theta`} />
      </h2>
      <span ref={e1Ref} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <span ref={e2Ref} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />

      <div className="stage l14-rot-stage">
        <div className="stage-text">
          <ul className="bullets l14-rot-cols">
            <Fragment index={1} as="li">
              <Tex tex={r`R_\theta(\vv e_1)=\begin{bmatrix}\cos\theta\\ \sin\theta\end{bmatrix}`} />
            </Fragment>
            <Fragment index={2} as="li">
              <Tex tex={r`R_\theta(\vv e_2)=\begin{bmatrix}-\sin\theta\\ \cos\theta\end{bmatrix}`} />
            </Fragment>
          </ul>

          <Fragment index={3} className="block theorem">
            <p>
              The matrix of <Tex tex={r`R_\theta:\mathbb R^2\to\mathbb R^2`} /> is
            </p>
            <Tex display tex={r`\begin{bmatrix}\cos\theta&-\sin\theta\\ \sin\theta&\cos\theta\end{bmatrix}.`} />
          </Fragment>
        </div>

        <div className="stage-fig l14-rot-fig">
          <RotationPicture
            theta={theta}
            pair={false}
            basis={{ e1: { index: 1, theta: turn(t1) }, e2: { index: 2, theta: turn(t2) } }}
            unit={132}
          />
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
            <Fragment index={3} as="span">
              <Tex tex={r`\begin{bmatrix}${exact(c)}&${exact(-s)}\\ ${exact(s)}&${exact(c)}\end{bmatrix}`} />
            </Fragment>
          </div>
        </div>
      </div>
    </section>
  );
}
