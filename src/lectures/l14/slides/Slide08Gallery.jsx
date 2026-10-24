import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import FPanel from '../components/FPanel.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const flip = Math.cos;
// each map's matrix M, and `at(t)`, the matrix on the way from the identity (t = 0) to M (t = 1):
// a stretch, shear or projection glides, a reflection flips over its mirror line, the rotation turns
export const MAPS = [
  { name: 'Stretch', at: (t) => [[1 + t, 0], [0, 1]], tex: r`\begin{bmatrix}2&0\\ 0&1\end{bmatrix}` },
  { name: 'Shear', at: (t) => [[1, t], [0, 1]], tex: r`\begin{bmatrix}1&1\\ 0&1\end{bmatrix}` },
  { name: 'Reflection across the x-axis', label: <>Reflection across the <Tex tex="x" />-axis</>, at: (t) => [[1, 0], [0, flip(Math.PI * t)]], tex: r`\begin{bmatrix}1&0\\ 0&-1\end{bmatrix}` },
  {
    name: 'Reflection across the line y = x',
    label: <>Reflection across <Tex tex="y=x" /></>,
    at: (t) => {
      const c = flip(Math.PI * t);
      return [[(1 + c) / 2, (1 - c) / 2], [(1 - c) / 2, (1 + c) / 2]];
    },
    tex: r`\begin{bmatrix}0&1\\ 1&0\end{bmatrix}`,
  },
  { name: 'Projection onto the x-axis', label: <>Projection onto the <Tex tex="x" />-axis</>, at: (t) => [[1, 0], [0, 1 - t]], tex: r`\begin{bmatrix}1&0\\ 0&0\end{bmatrix}` },
  {
    name: 'Rotation by 180 degrees',
    label: <>Rotation by <Tex tex={r`180^\circ`} /></>,
    at: (t) => [[Math.cos(Math.PI * t), -Math.sin(Math.PI * t)], [Math.sin(Math.PI * t), Math.cos(Math.PI * t)]],
    tex: r`\begin{bmatrix}-1&0\\ 0&-1\end{bmatrix}`,
  },
];

/** One map of the gallery, shown on key press `index`: its picture glides from S to f(S). */
export function Item({ m, index }) {
  const ref = useRef(null);
  const t = useTween(useFragmentShown(ref), { ms: 1500, delay: 300 });
  return (
    <Fragment index={index} className="l14-gallery-item">
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <p className="l14-gallery-name">{m.label ?? m.name}</p>
      <div className="l14-gallery-row">
        <FPanel M={m.at(PRINT ? 1 : t)} title={m.name} />
        <Tex tex={m.tex} />
      </div>
    </Fragment>
  );
}

/**
 * Linear transformations of ℝ² (Christine's Example 4 (iv)): six, one per key press, each as its
 * effect on the unit square S with the letter F in it (the textbook's Examples 14.1.3, the shear,
 * and 14.3.4–14.3.5), its name above and its matrix beside it; on its key press, S and F glide to
 * their images (a reflection flips over, the rotation turns). Key press 7, under them all: what
 * linear transformations do (and don't).
 */
export default function Slide08Gallery() {
  return (
    <section className="dense">
      <h2>
        Linear transformations of <Tex tex={r`\mathbb R^2`} />
      </h2>

      <div className="l14-gallery">
        {MAPS.map((m, k) => (
          <Item key={m.name} m={m} index={k + 1} />
        ))}
      </div>

      <Fragment index={MAPS.length + 1} as="p" className="l14-gallery-sum">
        Linear transformations preserve <Tex tex={r`\vv 0`} />, preserve parallelograms, might “collapse” or “flip” stuff.
      </Fragment>
    </section>
  );
}
