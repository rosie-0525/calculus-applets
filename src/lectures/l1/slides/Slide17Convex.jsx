import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export default function Slide17Convex() {
  return (
    <section>
      <h2>Convex linear combinations</h2>

      <Fragment index={1} className="block definition">
        <p className="block-title">Definition</p>
        <p className="compact">
          A linear combination is called <strong>convex</strong> if
        </p>
        <Tex
          display
          tex={r`c_1,c_2,\dots,c_k\ge 0
                 \qquad\text{and}\qquad
                 c_1+c_2+\cdots+c_k=1.`}
        />
      </Fragment>

      <Fragment index={2}>
        <p className="compact" style={{ marginTop: '1em' }}>
          For two vectors,
        </p>
        <Tex display tex={r`(1-t)\,\vv{u}+t\,\vv{v},\qquad 0\le t\le 1`} />
      </Fragment>

      <Fragment index={3} className="question">
        <strong>What do these look like?</strong>
      </Fragment>

      <Notes time="1:00 · running total 20:00">
        <p>
          One more definition, and then we look at what it means.
        </p>
        <p>
          <em>[Key press]</em> A linear combination is <strong>convex</strong> when the
          coefficients are all <strong>non-negative</strong> and they <strong>add up to 1</strong>.
          Two conditions — you need both.
        </p>
        <p>
          If you like: a convex combination is a <em>weighted average</em> of the vectors. That is
          the right intuition.
        </p>
        <p>
          <em>[Key press]</em> With just two vectors, the two conditions collapse into one
          parameter: the coefficients must be (1 − t) and t, with t between 0 and 1. Check it —
          they are non-negative, and they sum to 1.
        </p>
        <p>
          <em>[Key press]</em> So: what set of points do you get as t runs from 0 to 1? Let us find
          out by computing.
        </p>
      </Notes>
    </section>
  );
}
