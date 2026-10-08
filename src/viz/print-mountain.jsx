import { useEffect, useRef, useState } from 'react';
import '../lectures/l7/styles/deck.css';
import ShastaPrint, { PrintFromAbove } from '../lectures/l7/components/ShastaPrint.jsx';
import { START, VIEW, TOP, ABOVE, LayerSlider } from '../lectures/l7/slides/Slide10bPrint.jsx';
import { STEP } from '../lectures/l7/components/shasta.js';

export const lecture = 7;

/* The c the print is at, which the slider sets; "Print" takes it up a layer at a time to the top,
   as the slide does at its last key press. */
function usePrint() {
  const [c, setC] = useState(START);
  const [printing, setPrinting] = useState(false);
  const now = useRef(c);
  now.current = c;
  useEffect(() => {
    if (!printing) return undefined;
    let frame;
    let t0;
    const from = now.current >= TOP ? START : now.current;
    const ms = ((TOP - from) / (TOP - START)) * 3200;
    const step = (t) => {
      if (t0 === undefined) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      setC(Math.round((from + (TOP - from) * k) / STEP) * STEP);
      if (k < 1) frame = requestAnimationFrame(step);
      else setPrinting(false);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [printing]);
  const set = (v) => {
    setPrinting(false);
    setC(v);
  };
  return { c, set, print: () => setPrinting(true) };
}

/* The slide with everything showing: the print in 3-D and seen from above, with the edge of its
   top layer, the level set h(x, y) = c, in red; the slider for c, and a button that prints the
   rest. */
export default function PrintMountain() {
  const { c, set, print } = usePrint();
  return (
    <div className="print-slide">
      <figure className="print-3d">
        <ShastaPrint c={c} red={c < TOP} done={c >= TOP} {...VIEW} />
        <figcaption>Mount Shasta, California, from 2,500 m up (USGS elevation data): a layer for every 100 m, heights × 2</figcaption>
      </figure>

      <div className="print-side">
        <p>Seen from above:</p>
        <div className="print-row">
          <PrintFromAbove c={c} red={c < TOP} size={ABOVE} />
          <div className="print-controls">
            <div className="graph-slider">
              <LayerSlider value={c} onChange={set} />
            </div>
          </div>
          <button type="button" className="viz-button" onClick={print}>
            {c >= TOP ? 'Print again' : 'Print the rest'}
          </button>
        </div>
      </div>
    </div>
  );
}
