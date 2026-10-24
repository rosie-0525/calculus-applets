import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import AxisRotation from '../components/Rotation3.jsx';
import { Sub } from '../components/Space.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const THETA = 40; // the angle drawn
export const EL = 36; // seen from higher than usual, so that R_z(e₁) doesn't point at the viewer

/** An entry of R_z(θ) in column j, hidden until its key press (`l14-c2`, `l14-c3` in deck.css). */
export const c = (j, tex) => r`\htmlClass{l14-c${j}}{${tex}}`;

export const AXES = [
  {
    k: 2,
    name: 'z',
    tex: r`R_z(\theta)=\begin{bmatrix}${c(1, r`\cos\theta`)}&${c(2, r`-\sin\theta`)}&${c(3, '0')}\\ ${c(1, r`\sin\theta`)}&${c(2, r`\cos\theta`)}&${c(3, '0')}\\ ${c(1, '0')}&${c(2, '0')}&${c(3, '1')}\end{bmatrix}`,
  },
  { k: 0, name: 'x', tex: r`R_x(\theta)=\begin{bmatrix}1&0&0\\ 0&\cos\theta&-\sin\theta\\ 0&\sin\theta&\cos\theta\end{bmatrix}` },
  {
    k: 1,
    name: 'y',
    tex: r`R_y(\theta)=\begin{bmatrix}\cos\theta&0&\htmlClass{l14-sign}{\sin\theta}\\ 0&1&0\\ \htmlClass{l14-sign}{-\sin\theta}&0&\cos\theta\end{bmatrix}`,
  },
];

/**
 * Rotations around the coordinate axes (Section 14.5), drawn at θ = 40°. Around the z-axis, one per
 * key press, alternating: 1, 3, 5: R_z(e₁), R_z(e₂), R_z(e₃) = e₃ in the picture (red; e₁ and e₂
 * each turning to its image); 2, 4, 6: the first, second, third column of R_z(θ) (red). 7, 8: the
 * x-axis, then the y-axis, each a picture over its matrix, its two other basis vectors turning to
 * their images, the sin θ upper right and −sin θ lower left of R_y(θ) in red.
 */
export default function Slide10Axes() {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const tz1 = useTween(useFragmentShown(refs[0]), { ms: 1500, delay: 300 });
  const tz2 = useTween(useFragmentShown(refs[1]), { ms: 1500, delay: 300 });
  const tx = useTween(useFragmentShown(refs[2]), { ms: 1500, delay: 300 });
  const ty = useTween(useFragmentShown(refs[3]), { ms: 1500, delay: 300 });
  const turn = (t) => THETA * (PRINT ? 1 : t);
  // the angle each image has turned, [e₁'s, e₂'s, e₃'s], in each picture
  const turns = { 2: [turn(tz1), turn(tz2), 0], 0: [0, turn(tx), turn(tx)], 1: [turn(ty), 0, turn(ty)] };
  return (
    <section className="dense">
      <h2>Rotations around the coordinate axes</h2>
      {[1, 3, 7, 8].map((n, m) => (
        <span key={n} ref={refs[m]} className="fragment fx-marker" data-fragment-index={n} aria-hidden="true" />
      ))}

      <FxMarker index={4} id="c2" />
      <FxMarker index={6} id="c3" />
      <div className="l14-axes">
        {AXES.map((a, m) =>
          m === 0 ? (
            <div key={a.k} className="l14-axis">
              <p className="l14-axis-name">
                Around the <Tex tex={a.name} />
                -axis
              </p>
              <AxisRotation
                k={a.k}
                theta={THETA}
                width={380}
                height={310}
                unit={104}
                el={EL}
                steps={[1, 3, 5]}
                turns={turns[a.k]}
                name={
                  <>
                    R<Sub>z</Sub>
                  </>
                }
              />
              <Fragment index={2}>
                <Tex tex={a.tex} />
              </Fragment>
            </div>
          ) : (
            <Fragment key={a.k} index={m + 6} className="l14-axis">
              <p className="l14-axis-name">
                Around the <Tex tex={a.name} />
                -axis
              </p>
              <AxisRotation k={a.k} theta={THETA} width={380} height={310} unit={104} el={EL} imageLabels={false} turns={turns[a.k]} />
              <Tex tex={a.tex} />
            </Fragment>
          ),
        )}
      </div>
    </section>
  );
}
