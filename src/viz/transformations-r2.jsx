import { useEffect, useRef, useState } from 'react';
import '../lectures/l14/styles/deck.css';
import { MAPS, Item } from '../lectures/l14/slides/Slide08Gallery.jsx';

export const lecture = 14;

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
 * Linear transformations of ℝ² without the sentence under them (the caption says it): the six maps,
 * each its name over the unit square S with the letter F in it and its matrix beside it. On the
 * slide each comes on a key press, S and F gliding to their images (a reflection flips over, the
 * rotation turns); here they glide together the first time the applet is on screen (an Item mounted
 * before then has glided unseen, so it starts afresh), and again on Replay.
 */
export default function TransformationsR2() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [run, setRun] = useState(0);
  return (
    <div className="viz-col" ref={ref}>
      <div className="l14-gallery">
        {MAPS.map((m, k) => (
          <Item key={`${m.name}-${seen}-${run}`} m={m} index={k + 1} />
        ))}
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setRun((n) => n + 1)}>
          Replay
        </button>
      </div>
    </div>
  );
}
