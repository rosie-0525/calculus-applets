import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { REDUNDANCIES } from '../components/Redund.jsx';

/** The definition (a blue box). */
export function LinIndepDefinition({ className = '' }) {
  return (
    <div className={`block definition ${className}`.trim()}>
      <p>
        A collection of vectors <Tex tex={r`\vv v_1,\dots,\vv v_k`} /> is <strong>linearly dependent</strong> precisely when there are scalars <Tex tex={r`c_1,\dots,c_k`} />{' '}
        that are <strong>not all zero</strong> for which
      </p>
      <Tex display tex={r`c_1\vv v_1+c_2\vv v_2+\dots+c_k\vv v_k=\vv 0.`} />
      <p>
        Otherwise it is <strong>linearly independent</strong>.
      </p>
    </div>
  );
}

/**
 * Linear independence: the definition by a vanishing combination (the user's choice: Mark states it
 * as a theorem, the textbook as Theorem 19.1.5; the slide Testing for linear dependence that stated it
 * is commented out). Under it, the three examples of Examples of redundancies again, each with its
 * relation, all on key press 1; key presses 2, 3, 4: a vertical ⟺ and the relation rewritten as a vanishing combination
 * (the redundant vector amber throughout). The remark that the definition implies some v_i in the span
 * of the others is on the next slide, From a spanning set to a basis.
 */
export default function Slide02Independence() {
  return (
    <section>
      <h2>Linear independence</h2>

      <LinIndepDefinition />

      <Fragment index={1} className="l20-li-examples">
        {REDUNDANCIES.map(({ name, Pic, relation, zero }, i) => (
          <figure key={name}>
            <p className="l20-redund-title">{name}</p>
            <Pic width={340} height={170} />
            <figcaption>
              <Tex tex={relation} />
              <Fragment index={2 + i} as="span" className="l20-li-iff">
                <Tex tex={r`\Updownarrow`} />
                <Tex tex={zero} />
              </Fragment>
            </figcaption>
          </figure>
        ))}
      </Fragment>
    </section>
  );
}
