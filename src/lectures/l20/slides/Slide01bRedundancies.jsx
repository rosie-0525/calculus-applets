import Tex from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { REDUNDANCIES } from '../components/Redund.jsx';

/**
 * Examples of redundancies (the Exam 1 review's cards, and Lecture 4's Removing redundancy): two
 * vectors, one a multiple of the other; three, one a combination of the other two; and the zero
 * vector (the pictures and equations are in Redund.jsx, shared with Linear independence). Each card
 * takes three key presses: the card (0, 3, 6); its redundant vector turning amber, with the relation
 * that makes it redundant (1, 4, 7); the span that stays the same (2, 5, 8). The redundant vector is
 * amber in the equations too.
 */
export default function Slide01bRedundancies() {
  return (
    <section>
      <h2>Examples of redundancies</h2>

      <div className="l20-pair l20-redund">
        {REDUNDANCIES.map(({ name, Pic, relation, span }, i) => {
          const k = 3 * i;
          const body = (
            <>
              <p className="l20-redund-title">{name}</p>
              <Pic at={k + 1} width={360} height={214} />
              <figcaption>
                <Fragment index={k + 1} as="span">
                  <Tex tex={relation} />
                </Fragment>
                <Fragment index={k + 2} as="span" className="l20-cap2">
                  <Tex tex={span} />
                </Fragment>
              </figcaption>
            </>
          );
          return i === 0 ? (
            <figure key={name}>{body}</figure>
          ) : (
            <Fragment key={name} index={k} as="figure">
              {body}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
