import '../lectures/l25/styles/deck.css';
import Tex from '../lectures/l25/components/Tex.jsx';
import Space from '../lectures/l25/components/Space.jsx';
import Surface from '../lectures/l25/components/Surface.jsx';
import { CARDS, R } from '../lectures/l25/slides/Slide19Poll.jsx';
import { TrueFalse } from './orthogonal-products.jsx';

export const lecture = 25;

/*
 * Poll, without its title and the owl's question (the caption has it): true or false, if all entries
 * of a symmetric matrix are positive, then it is positive-definite. Then why, two examples, each its
 * matrix and verdict beside the graph of its quadratic form: [1 2; 2 1], q_A(1, −1) = −2, indefinite
 * (a saddle), and the other way round, [13 −3; −3 5], with negative entries, positive-definite (a
 * bowl). On the slide False is outlined on a key press and the examples come on the next two; here a
 * click on True or False (orthogonal-products.jsx's TrueFalse) outlines False and shows them both.
 * Each graph turns when dragged. In a narrow box the examples are one under the other, and the poll
 * narrower.
 */
export default function PositiveEntries() {
  return (
    <div className="pe-poll">
      <TrueFalse
        answer="False"
        statement={
          <>
            <strong>True or false?</strong> If all entries of a symmetric matrix are positive, then it is positive-definite.
          </>
        }
      >
        {() => (
          <div className="l25-signs pe-signs">
            {CARDS.map((c) => (
              <div key={c.verdict} className="l25-sign">
                <div className="l25-sign-text">
                  <p>
                    <Tex tex={c.m} />
                  </p>
                  {c.why.map((tex) => (
                    <p key={tex}>
                      <Tex tex={tex} />
                    </p>
                  ))}
                  <p className="l25-sign-verdict">{c.verdict}</p>
                </div>
                <Space width={300} height={190} unit={50} center={[0.5, c.c]} el={22} axes={false} rock={false} title={c.title}>
                  {(s) => <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={c.z} mesh="rgba(15, 40, 50, 0.16)" />}
                </Space>
              </div>
            ))}
          </div>
        )}
      </TrueFalse>
    </div>
  );
}
