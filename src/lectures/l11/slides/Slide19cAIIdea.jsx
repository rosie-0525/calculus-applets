import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';

export const RED = '#8c1515'; // the errors, as in Lecture 6
export const TEAL = '#0e7490';
export const INK = '#14213d';
// Lecture 6's five data points (The line of best fit) and their line of best fit, y = 3x + 9
export const POINTS = [
  [-5, -6],
  [-4, -4],
  [-3, 1],
  [-2, 4],
  [-1, 5],
];
export const best = (x) => 3 * x + 9;

/** The five data points, a line and their errors (red), small. */
export function Scatter() {
  const [W, H] = [150, 100];
  const [X, Y] = [
    [-5.7, -0.3],
    [-9, 8.5],
  ];
  const px = (x) => ((x - X[0]) / (X[1] - X[0])) * W;
  const py = (y) => H - ((y - Y[0]) / (Y[1] - Y[0])) * H;
  return (
    <svg className="figure-svg l10-ai2-scatter" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Five data points, a line, and the errors: the vertical gaps from the points to the line">
      <line x1={px(X[0])} y1={py(best(X[0]))} x2={px(X[1])} y2={py(best(X[1]))} stroke={TEAL} strokeWidth="2.5" />
      {POINTS.map(([x, y]) => (
        <line key={x} x1={px(x)} x2={px(x)} y1={py(y)} y2={py(best(x))} stroke={RED} strokeWidth="2.5" />
      ))}
      {POINTS.map(([x, y]) => (
        <circle key={x} cx={px(x)} cy={py(y)} r="4.5" fill={INK} />
      ))}
    </svg>
  );
}

/**
 * How does an AI learn? (right after Gradient descent, before the demo, An AI learns to read
 * digits, Slide19bDigits.jsx): an AI model side by side with linear regression (Lecture 6, and
 * S(m, b) of Lecture 7), row by row, in as few words as can be; the AI column is general (the
 * digits, their images as vectors, are on the demo). On arrival, linear regression: y = mx + b with
 * 2 parameters m and b; the data points (a small scatter plot, with their errors in red); S(m, b) = e₁² +
 * ⋯ + eₙ², S: ℝ² → ℝ; the smallest S gives the line of best fit. Then the AI model, one row per
 * key press: 1, a function with billions of parameters; 2, lots of examples (xᵢ, yᵢ), inputs and their right
 * outputs; 3, E = the average error on the examples, E: ℝ^billions → ℝ; 4, the smallest E gives
 * the best parameters, found by gradient descent.
 */
export default function Slide19cAIIdea() {
  return (
    <section className="dense l10-ai2">
      <h2>How does an AI learn?</h2>

      <div className="l10-ai2-grid">
        <span />
        <p className="l10-ai2-head">
          Linear regression <span className="from-lecture">Lecture 6</span>
        </p>
        <Fragment index={1} as="p" className="l10-ai2-head">
          AI model
        </Fragment>

        <p className="l10-ai2-label">Function</p>
        <div className="l10-ai2-cell">
          <p>
            <Tex tex="y=mx+b" /> with 2 parameters <Tex tex="m" /> and <Tex tex="b" />
          </p>
        </div>
        <Fragment index={1} className="l10-ai2-cell">
          <p>A function with billions of parameters</p>
        </Fragment>

        <p className="l10-ai2-label">Data</p>
        <div className="l10-ai2-cell l10-ai2-data">
          <div>
            <p>
              points <Tex tex="(x_1,y_1),\dots,(x_n,y_n)" />
            </p>
          </div>
          <Scatter />
        </div>
        <Fragment index={2} className="l10-ai2-cell">
          <p>
            lots of examples <Tex tex={r`(\vv x_i,y_i)`} />, inputs and their right outputs
          </p>
        </Fragment>

        <p className="l10-ai2-label">Error</p>
        <div className="l10-ai2-cell">
          <p>
            <Tex tex={r`S(m,b)=e_1^2+\cdots+e_n^2`} />
          </p>
          <p>
            <Tex tex={r`S:\mathbb R^2\to\mathbb R`} />
          </p>
        </div>
        <Fragment index={3} className="l10-ai2-cell">
          <p>
            <Tex tex="E" /> = average error on the examples
          </p>
          <p>
            <Tex tex={r`E:\mathbb R^{\text{billions}}\to\mathbb R`} />
          </p>
        </Fragment>

        <p className="l10-ai2-label">Minimize</p>
        <div className="l10-ai2-cell">
          <p>
            smallest <Tex tex="S" /> gives the line of best fit
          </p>
        </div>
        <Fragment index={4} className="l10-ai2-cell">
          <p>
            smallest <Tex tex="E" /> gives the best parameters, found by <strong>gradient descent</strong>
          </p>
        </Fragment>
      </div>
    </section>
  );
}
