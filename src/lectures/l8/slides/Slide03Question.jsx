import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import HoldFigure from '../components/HoldFigure.jsx';

export const GREEN = '#175e54';

/**
 * Multivariable functions: does f′(x, y) make sense? The graph of a function of two variables (the
 * two hills of Lecture 7), with the axes and a point (a, b, f(a, b)) on it. Key press 1: hold
 * y = b constant: the vertical plane y = b cuts the graph along the curve z = f(x, b), and the point
 * moves back and forth along it, in the x direction. 2: hold x = a constant: the plane x = a, the
 * curve z = f(a, y), the point moving along it in the y direction. 3: both curves through the point,
 * no planes, the point still: the partial derivatives will measure the two rates of change.
 */
export default function Slide03Question() {
  return (
    <section className="dense">
      <h2>Multivariable functions</h2>

      <div className="pd-stage">
        <figure className="pd-3d">
          <HoldFigure steps={[1, 2, 3]} width={620} height={420} unit={66} />
          <span className="scalar-formula">
            <Tex tex="z=f(x,y)" />
          </span>
        </figure>

        <div className="pd-side">
          <div className="motiv-question">
            <p className="pd-ask">
              Does <Tex tex="f'(x,y)" /> make sense?
            </p>
          </div>
          <p>
            The derivative of <Tex tex="f" /> at <Tex tex="(a,b)" /> should measure{' '}
            <strong>
              how much <Tex tex="f(a,b)" /> changes
            </strong>{' '}
            as we move <Tex tex="(a,b)" /> “a little bit”.
          </p>

          <ul className="bullets pd-holds">
            <Fragment index={1} as="li">
              <span className="red">Hold <Tex tex="y=b" /> constant</span>, and move along the <Tex tex="x" /> direction.
            </Fragment>
            <Fragment index={2} as="li">
              <span style={{ color: GREEN }}>Hold <Tex tex="x=a" /> constant</span>, and move along the <Tex tex="y" />{' '}
              direction.
            </Fragment>
          </ul>

          <Fragment index={3} className="block theorem">
            <p>
              We will use the <strong>partial derivatives</strong> to measure the two rates of change.
            </p>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
