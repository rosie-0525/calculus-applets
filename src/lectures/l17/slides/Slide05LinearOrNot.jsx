import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { LinearOrNot, T_COLOR } from '../components/Zoom.jsx';
import { G_COLOR } from '../components/ChainPicture.jsx';

/**
 * Linearity principle (right before Zooming in, on the same patch and the same g): a linear T takes the
 * square to a parallelogram, the grid to a grid of parallelograms; g bends them (the presenter says it:
 * on the slide, only "linear" and "nonlinear" under the arrows). Key press 1: the patch flies over and T
 * squeezes it; 2: the nonlinear example; 3: the patch flies over and g bends it.
 */
export default function Slide05LinearOrNot() {
  return (
    <section>
      <h2>Recall: Linearity principle</h2>
      <div className="l17-lin-row">
        <Tex tex={r`\textcolor{${T_COLOR}}{T}\begin{bmatrix}x\\y\end{bmatrix}=\begin{bmatrix}1&1\\-\tfrac12&1\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix}`} />
        <LinearOrNot which="T" play={1} />
      </div>
      <Fragment index={2} className="l17-lin-row">
        <Tex tex={r`\textcolor{${G_COLOR}}{g}\begin{bmatrix}x\\y\end{bmatrix}=\begin{bmatrix}x+\tfrac14\sin 2y\\y-\tfrac15\sin 2x\end{bmatrix}`} />
        <LinearOrNot which="g" play={3} />
      </Fragment>
    </section>
  );
}
