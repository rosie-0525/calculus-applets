import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import RisingGraph, { GRAPHS } from '../components/RisingGraph.jsx';
import Notes from '../components/Notes.jsx';

/**
 * Linear and affine functions: Mark's definition (scalar-valued; its vector-valued clause is on
 * the next slide, with the cat photo, Slide02cGrids.jsx, at the user's request). Key press 1:
 * "e.g.", three scalar functions; 2–4: their verdicts, one per key press, each on two lines (affine
 * but not linear, linear and hence also affine, neither affine nor linear), each with its graph
 * under it, rising out of the floor (RisingGraph.jsx; the affine one rises as 2x − 3y, then by 5);
 * 5: under the graphs, linear functions are affine, affine ones need not be linear (at the user's
 * request). (The textbook's warning, ax + b with b ≠ 0 is affine,
 * not linear, was removed at the user's request.)
 */
export default function Slide02Linear() {
  return (
    <section className="dense">
      <h2>Linear and affine functions</h2>

      <div className="block definition l13-nobreak">
        <p className="block-title">Definition</p>
        <p>
          A scalar-valued function <Tex tex={r`f(x_1,\ldots,x_n)`} /> is <strong>affine</strong> if{' '}
          <Tex tex={r`f(\vv x)=a_1x_1+\cdots+a_nx_n+b`} /> for some scalars <Tex tex={r`a_1,\ldots,a_n,b`} />. It is{' '}
          <strong>linear</strong> if <Tex tex={r`f(\vv x)=a_1x_1+\cdots+a_nx_n`} />.
        </p>
      </div>

      <Fragment index={1} className="l13-examples">
        <span className="l13-eg-label">e.g.</span>
        <ul className="l13-verdicts">
          <li>
            <Tex tex="f(x,y)=2x-3y+5" />
            <Fragment index={2} as="span" className="l13-verdict">
              affine
              <br />
              (but not linear)
            </Fragment>
            <Fragment index={2} className="l13-eg-graph">
              <RisingGraph g={GRAPHS[0]} index={2} width={300} height={250} unit={56} center={[0.5, 0.6]} />
            </Fragment>
          </li>
          <li>
            <Tex tex="f(x,y)=2x-3y" />
            <Fragment index={3} as="span" className="l13-verdict">
              linear
              <br />
              (hence also affine)
            </Fragment>
            <Fragment index={3} className="l13-eg-graph">
              <RisingGraph g={GRAPHS[1]} index={3} width={300} height={250} unit={56} center={[0.5, 0.6]} />
            </Fragment>
          </li>
          <li>
            <Tex tex="f(x,y)=xy" />
            <Fragment index={4} as="span" className="l13-verdict">
              neither affine
              <br />
              nor linear
            </Fragment>
            <Fragment index={4} className="l13-eg-graph">
              <RisingGraph g={GRAPHS[2]} index={4} width={300} height={250} unit={56} center={[0.5, 0.6]} />
            </Fragment>
          </li>
        </ul>
      </Fragment>

      <Fragment index={5} as="p" className="l13-linear-affine">
        Linear functions are affine; affine functions need not be linear.
      </Fragment>

      <Notes time="2:30 · running total 6:00">
        <p>
          First for a function whose output is one number. Affine: a₁x₁ + ⋯ + aₙxₙ + b, a constant times each variable,
          plus a constant. Linear: the same without the constant. No products of variables, no powers, no sin or eˣ.
        </p>
        <p>
          <em>[Key press]</em> Three examples: which are linear, which affine? <em>[take answers]</em>
        </p>
        <p>
          <em>[Key press]</em> 2x − 3y + 5 is affine, and the + 5 keeps it from being linear. Its graph is a plane:
          watch it rise, first as 2x − 3y, then up by 5. It misses the origin: f(0, 0) = 5.
        </p>
        <p>
          <em>[Key press]</em> 2x − 3y is linear, hence also affine. Its graph is a plane through the origin.
        </p>
        <p>
          <em>[Key press]</em> xy is neither: it multiplies two variables. Its graph is a saddle, not a plane. In two
          variables, affine means the graph is a plane, and linear means a plane through the origin.
        </p>
        <p>
          <em>[Key press]</em> A linear function is affine, with b = 0. An affine function is linear only when b = 0.
        </p>
      </Notes>
    </section>
  );
}
