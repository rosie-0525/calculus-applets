import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import { Approx, TangentLineFigure, TangentFigure } from '../lectures/l11/slides/Slide05LinearApprox.jsx';

export const lecture = 11;

// the slide's text column takes what the pictures leave (minmax(0, 1fr)), so the box needs a width
export const width = 1080;

/* Linear approximation with every step showing, without its title: for f(x), f(x) ≈ L(x), a line,
   whose graph is the tangent line; for f(x, y), L(x, y), a plane, whose graph is the tangent plane
   (the textbook's f(x, y) = x² + 2y² + xy at (1, 1)); f in the graph's blue, L in the tangent's
   gold, each beside its picture. */
export default function TangentPlane() {
  return (
    <div className="l10-la">
      <div className="stage-text">
        <p>
          For <Tex tex="f(x)" />, near <Tex tex="a" />:
        </p>
        <Approx tex={[r`f(x)`, r`f(a)+f'(a)(x-a)`]} brace="b1" label={r`L(x)\text{, a line}`} at={1} />
        <p>
          The graph of <Tex tex="L(x)" /> is the <strong>tangent line</strong> to the graph of <Tex tex="f" /> at <Tex tex="(a,f(a))" />.
        </p>
      </div>
      <div className="l10-la-fig">
        <TangentLineFigure />
      </div>

      <div className="stage-text">
        <p>
          For <Tex tex="f(x,y)" />, near <Tex tex="(a,b)" />:
        </p>
        <Approx tex={[r`f(x,y)`, r`f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)`]} brace="b2" label={r`L(x,y)\text{, a plane}`} at={2} />
        <p>
          The graph of <Tex tex="L(x,y)" /> is the <strong>tangent plane</strong> to the graph of <Tex tex="f" /> at <Tex tex="(a,b,f(a,b))" />.
        </p>
      </div>
      <div className="l10-la-fig">
        <TangentFigure />
      </div>
    </div>
  );
}
