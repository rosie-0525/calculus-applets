import { useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import { REDUNDANCIES } from '../lectures/l20/components/Redund.jsx';
import { from } from './redundancies.jsx';

export const lecture = 20;

/** One example: its picture (the redundant vector amber), its relation, and on its button ⟺ the relation as a combination giving 0. */
function Example({ ex }) {
  const [on, setOn] = useState(false);
  const { name, Pic, relation, zero } = ex;
  return (
    <figure>
      <p className="l20-redund-title">{name}</p>
      <Pic width={340} height={170} />
      <figcaption>
        <Tex tex={relation} />
        <span className="l20-li-iff" style={from(Number(on), 1)}>
          <Tex tex={r`\Updownarrow`} />
          <Tex tex={zero} />
        </span>
      </figcaption>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={on} onClick={() => setOn((v) => !v)}>
          As a combination giving 0
        </button>
      </div>
    </figure>
  );
}

/*
 * Linear independence, without its title and its definition (the caption has it): the three
 * examples of Examples of redundancies again, the redundant vector amber, each with its relation,
 * and under it ⟺ the relation rewritten as a combination giving 0. The 3-D pictures rock while the
 * applet is on screen and turn when dragged. On the slide the examples come on a key press and each
 * rewriting on the next ones; here each example has its own button.
 */
export default function Independence() {
  return (
    <div className="l20-li-examples">
      {REDUNDANCIES.map((ex) => (
        <Example key={ex.name} ex={ex} />
      ))}
    </div>
  );
}
