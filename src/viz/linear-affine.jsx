import { useEffect, useRef, useState } from 'react';
import '../lectures/l13/styles/deck.css';
import Tex from '../lectures/l13/components/Tex.jsx';
import RisingGraph, { GRAPHS } from '../lectures/l13/components/RisingGraph.jsx';

export const lecture = 13;

// the slide's verdicts, each on two lines, in the order of GRAPHS
const VERDICTS = [
  ['affine', '(but not linear)'],
  ['linear', '(hence also affine)'],
  ['neither affine', 'nor linear'],
];

/** True from the first time the applet is on screen (its section `present`, see Applet.jsx). */
function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section || seen) return undefined;
    const check = () => section.classList.contains('present') && setSeen(true);
    check();
    const mo = new MutationObserver(check);
    mo.observe(section, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [ref, seen]);
  return seen;
}

/*
 * The examples of Linear and affine functions with every step showing, without the definition (the
 * caption says it): the three functions, each with its verdict and its graph. On the slide each
 * graph rises out of the floor on its key press, the affine one as 2x − 3y, then up by 5; here they
 * rise the first time the applet is on screen (a graph mounted before then has risen unseen, so it
 * starts afresh), and again on Replay.
 */
export default function LinearAffine() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [run, setRun] = useState(0);
  return (
    <div className="viz-col" ref={ref}>
      <ul className="l13-verdicts">
        {GRAPHS.map((g, k) => (
          <li key={g.key}>
            <Tex tex={g.tex} />
            <span className="l13-verdict">
              {VERDICTS[k][0]}
              <br />
              {VERDICTS[k][1]}
            </span>
            <div className="l13-eg-graph">
              <RisingGraph key={`${seen}-${run}`} g={g} index={0} width={300} height={250} unit={56} center={[0.5, 0.6]} />
            </div>
          </li>
        ))}
      </ul>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setRun((n) => n + 1)}>
          Replay
        </button>
      </div>
    </div>
  );
}
