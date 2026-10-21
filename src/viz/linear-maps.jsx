import { useEffect, useState } from 'react';
import '../lectures/l13/styles/deck.css';
import { CAT, catReady, CAT_CREDIT } from '../lectures/l13/components/catWarp.js';
import { MAPS, FlyPanel } from '../lectures/l13/slides/Slide02cGrids.jsx';

export const lecture = 13;

/** True once the cat photo's pixels are in (the deck's main.jsx waits for them before it starts). */
function useCat() {
  const [ready, setReady] = useState(!!CAT.data);
  useEffect(() => {
    let live = true;
    catReady.then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

/*
 * Linear and affine functions with the cat photo, without the definition (the caption says it):
 * the three maps ℝ² → ℝ², each its formula over two xy-planes with the same window, and its
 * verdict. The cat photo flies from the first plane onto the second, turning into its image under f
 * on the way. On the slide the planes come one per key press, and each photo flies then; here the
 * three fly together the first time the applet is on screen (FlyPanel's clock runs only while it
 * is), and again on "Fly again". A panel mounted before the photo's pixels came is mounted afresh
 * then, so that it paints them.
 */
export default function LinearMaps() {
  const ready = useCat();
  const [run, setRun] = useState(0);
  return (
    <div className="viz-col">
      <div className="l13-pics">
        {MAPS.map((m, k) => (
          <FlyPanel key={`${m.key}-${ready}-${run}`} m={m} index={k + 1} />
        ))}
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setRun((n) => n + 1)}>
          Fly again
        </button>
      </div>
      <p className="l13-credit l13-maps-credit">{CAT_CREDIT}</p>
    </div>
  );
}
