import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Flights, { from, to, late } from '../components/Flights.jsx';
import { QuadLineFigure, QuadSurfaceFigure, CURVE, LINE, QUAD } from '../components/QuadFigures.jsx';

export const blue = (t) => r`\textcolor{${CURVE}}{${t}}`;
export const gold = (t) => r`\textcolor{${LINE}}{${t}}`;
export const red = (t) => r`\textcolor{${QUAD}}{${t}}`;
// the definition's quadratic term, a piece at a time: each piece hidden until its key press k = 2, 3, 4
// (it keeps its space)
export const add = (k, t) => r`\htmlClass{l26-qa-add${k}}{${red(t)}}`;

// one variable, each piece keyed for the definition's pieces to fly from (Flights)
export const ONE =
  blue(from('fah', 'f(a+h)')) +
  from('ap', r`\approx`) +
  gold(from('fa', 'f(a)') + from('p1', '+') + from('fp', "f'(a)") + from('h', 'h')) +
  red(`{}` + from('p2', '+') + from('half', r`\tfrac12`) + from('fpp', "f''(a)") + from('h2', 'h^2'));

// the definition, by analogy: on key press 1, f(a + h) ≈ f(a) + f'(a)h flies in and becomes
// f(a + h) ≈ f(a) + (∇f)(a) · h (the dot and the brace fade in as they land); then the quadratic
// term, one piece per key press: 2, + and f''(a), becoming (Hf)(a); 3, h², becoming both hᵀ and h
// (the brackets fade in as they land); 4, ½
export const LIN = r`f(\vv a)+(\nabla f)(\vv a)\cdot\vv h`;
export const MANY =
  blue(to('fah', 1, r`f(\vv a+\vv h)`)) +
  to('ap', 1, r`\approx`) +
  r`\mathrlap{${late(1, gold(r`\underbrace{\phantom{${LIN}}}_{\text{linear approximation}}`))}}` +
  gold(to('fa', 1, r`f(\vv a)`) + to('p1', 1, '+') + to('fp', 1, r`(\nabla f)(\vv a)`) + late(1, r`\cdot`) + to('h', 1, r`\vv h`)) +
  add(2, `{}` + to('p2', 2, '+')) +
  add(4, to('half', 4, r`\tfrac12`) + r`\,`) +
  add(3, to('h2', 3, r`\vv h^{\top}`) + late(3, r`\big(`)) +
  add(2, to('fpp', 2, r`(Hf)(\vv a)`)) +
  add(3, late(3, r`\big)`) + to('h2', 3, r`\vv h`));
export const SECOND = r`\phantom{f(\vv a+\vv h)}=f(\vv a)+(\nabla f)(\vv a)\cdot\vv h+${red(r`\tfrac12\,q_{(Hf)(\vv a)}(\vv h)`)}\quad\text{for small }\vv h`;

/**
 * Quadratic approximation: one variable first, then Mark's box (the textbook's Definition 25.3.1)
 * by analogy. On arrival, f(a + h) ≈ f(a) + f'(a)h + ½ f''(a)h² (f blue, the linear approximation
 * gold, the quadratic term red: Lecture 11's colours) beside its graph, its tangent line and parabola.
 * Key press 1: the box, its sentence, and f(a + h) ≈ f(a) + f'(a)h flies down into it and becomes
 * f(a + h) ≈ f(a) + (∇f)(a) · h, with its brace, linear approximation (Flights); beside it a smooth
 * hill with its tangent plane. Then the quadratic term ½ f''(a)h² flies down one piece per key press
 * (the user's request): 2, + and f''(a), becoming (Hf)(a), and in the picture the quadratic
 * approximation (red) hugs the graph, the plane faint; 3, h², becoming both hᵀ and h; 4, ½. 5: the
 * box's second line, with the quadratic form of Hf(a), then for small h (the user's request: it was
 * in the sentence, "is (for small h):").
 */
export default function Slide05QuadApprox() {
  return (
    <section className="dense">
      <h2>Quadratic approximation</h2>

      <Flights at={[1, 2, 3, 4]} />
      <FxMarker index={2} id="l26-qa" />
      <FxMarker index={3} id="l26-qa3" />
      <FxMarker index={4} id="l26-qa4" />
      <div className="l26-qa fx-host">
        <div className="l26-qa-one">
          <p>
            For <Tex tex="f(x)" />, near <Tex tex="a" />:
          </p>
          <Tex display tex={ONE} />
        </div>
        <div className="l26-qa-pic">
          <QuadLineFigure quad unit={56} />
        </div>

        <Fragment index={1} className="block definition l26-qa-box">
          <p className="block-title">Definition</p>
          <p>
            The <strong>quadratic approximation</strong> of a scalar-valued function <Tex tex="f" /> near a point <Tex tex={r`\vv a`} /> is:
          </p>
          <div className="l26-qa-lines">
            <Tex display tex={MANY} />
            <Fragment index={5}>
              <Tex display tex={SECOND} />
            </Fragment>
          </div>
        </Fragment>
        <Fragment index={1} className="l26-qa-pic">
          <QuadSurfaceFigure steps={{ quad: 2 }} width={435} height={325} />
        </Fragment>
      </div>
    </section>
  );
}
