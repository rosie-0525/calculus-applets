import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { QuadLineFigure, CURVE } from '../components/QuadFigures.jsx';

// the Taylor expansion of f at a: its first two terms (.l26-ta-l, with a brace, a line) inside its first
// three (.l26-ta-q, with a brace, a parabola), which light up on their markers' key presses (deck.css)
export const TAYLOR = r`\textcolor{${CURVE}}{f(x)}=\htmlClass{l26-ta-q}{\underbrace{\htmlClass{l26-ta-l}{\underbrace{f(a)+f'(a)(x-a)}_{\htmlClass{l26-ta-lab}{\text{a line}}}}+\frac{f''(a)}{2!}(x-a)^2}_{\htmlClass{l26-ta-lab}{\text{a parabola}}}}+\frac{f'''(a)}{3!}(x-a)^3+\cdots`;

/**
 * Recall: linear and quadratic approximation, in one variable (the textbook's Section 25.5), with
 * Quadratic approximation's graph of f (QuadLineFigure). On arrival, the function and its graph under
 * it; key press 1: a and (a, f(a)) in the picture, and under it the Taylor expansion of f at a, f(x) in
 * the graph's blue; 2: its first two terms light up gold, with a brace, a line, and the tangent line
 * comes (Lecture 11's colours); 3: the first three, the quadratic term red, with a brace, a parabola,
 * and the parabola (red) comes, the tangent line faint.
 */
export default function Slide02RecallLinear() {
  return (
    <section>
      <h2>Recall: linear and quadratic approximation</h2>

      <p className="l26-ta-lead">
        Here is the graph of the function <Tex tex={r`f(x)=1.5+\sin(x-1)`} />:
      </p>
      <div className="l26-ta-fig">
        <QuadLineFigure steps={{ a: 1, line: 2, quad: 3 }} unit={64} />
      </div>
      <Fragment index={1}>
        <p className="l26-ta-lead">
          We can approximate it near <Tex tex="a" /> using the <strong>Taylor expansion</strong>:
        </p>
        <span className="fragment fx-marker" data-fragment-index={2} data-fx="l26-ta-l" aria-hidden="true" />
        <span className="fragment fx-marker" data-fragment-index={3} data-fx="l26-ta-q" aria-hidden="true" />
        <Tex display className="l26-ta" tex={TAYLOR} />
      </Fragment>
    </section>
  );
}
