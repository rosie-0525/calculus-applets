import { useState } from 'react';
import '../lectures/l25/styles/deck.css';
import Tex, { r } from '../lectures/l25/components/Tex.jsx';
import Space from '../lectures/l25/components/Space.jsx';
import Surface from '../lectures/l25/components/Surface.jsx';
import QPlot, { Q_RANGE, Q_LEVELS } from '../lectures/l25/components/QPlot.jsx';
import { qA } from '../lectures/l25/components/spec.js';
import { CURVE } from '../lectures/l25/slides/Slide14Example3.jsx';
import { from } from './redundancies.jsx';

export const lecture = 25;

/*
 * Example 1 (board), without its title and its parts (the caption has them): the contour plot of
 * q_A(x, y) = 13x² − 6xy + 5y² (QPlot.jsx, with its axes and ticks), its caption under it, beside the
 * graph of q_A, a bowl, with the same level curves. On the slide the eigenvectors w₁ = (3, −1)
 * (eigenvalue 14, amber) and w₂ = (1, 3) (eigenvalue 4, purple) come onto the contour plot on a key
 * press, with the right-angle mark, then the observation in a blue box under (ii), and the graph on
 * the last key press; here the graph is there from the start (it turns when dragged), and a button
 * draws the eigenvectors and shows the observation under the pictures. (The answer to (i), in a blue
 * box on the slide, is left to the caption's question.) In a narrow box the graph is under the
 * contour plot.
 */
export default function ContourEigenvectors() {
  const [on, setOn] = useState(false);
  return (
    <div className="viz-col ce">
      <div className="ce-pics">
        <figure className="l25-ex3-fig">
          <QPlot size={300} arrows={on} names={on} />
          <figcaption>
            The contour plot of
            <br />
            <Tex tex="q_A(x,y)=13x^2-6xy+5y^2" />
          </figcaption>
        </figure>
        <Space width={300} height={187} unit={21.8} center={[0.5, 0.86]} el={22} axes={false} rock={false} title="The graph of q_A, a bowl">
          {(s) => <Surface s={s} f={qA} x={Q_RANGE} y={Q_RANGE} n={26} zScale={0.021} mesh="rgba(15, 40, 50, 0.14)" curve={Q_LEVELS} curveColor={CURVE} curveWidth={1.3} />}
        </Space>
      </div>
      <div className="block l25-ex3-box ce-box" style={from(on ? 1 : 0, 1)}>
        <p>
          <Tex tex={r`\vv w_1`} /> and <Tex tex={r`\vv w_2`} /> lie along the lines of symmetry of the ellipses.
        </p>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={on} onClick={() => setOn((v) => !v)}>
          {on ? 'Hide the eigenvectors' : 'Draw the eigenvectors'}
        </button>
      </div>
    </div>
  );
}
