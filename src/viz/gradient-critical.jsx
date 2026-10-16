import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import { CriticalGraph, FieldPlot, CRITICAL } from '../lectures/l11/slides/Slide13cCritical.jsx';

export const lecture = 11;

/*
 * At a critical point with every step showing, without the question (the caption asks it): the
 * graphs of a minimum, a maximum and a saddle, each with its critical point in red and what f does
 * there; beside them the contour plot of f = x³ − 3x − y³ + 3y, with its maximum, minimum and two
 * saddles named, and its gradient field.
 */
export default function GradientCritical() {
  return (
    <div className="l10-crit-row">
      <div className="l10-crit-graphs">
        {CRITICAL.map((c) => (
          <figure key={c.name}>
            <CriticalGraph c={c} />
            <figcaption>
              <strong>{c.name}</strong>
              <br />
              {c.what}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="l10-crit-plot">
        <p>
          <Tex tex={r`f(x,y)=x^3-3x-y^3+3y`} />
        </p>
        <FieldPlot field={1} />
        <p className="l10-crit-field">Gradient vector field</p>
      </div>
    </div>
  );
}
