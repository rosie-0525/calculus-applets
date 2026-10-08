import { useRef } from 'react';
import Tex from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import ShastaPrint, { PrintFromAbove } from '../components/ShastaPrint.jsx';
import { useFragmentShown, useGlide } from '../components/useFragmentTween.js';
import { LEVELS, STEP } from '../components/shasta.js';
import { PRINT } from '../components/bay.js';
import { still, PRINTER } from '../components/stills.js';

export const { c: START, ...VIEW } = PRINTER; // the layer the nozzle is on at first, and the view
export const TOP = LEVELS[LEVELS.length - 1];
export const ABOVE = 214; // the print seen from above, px

export const fmtM = (v) => `${Math.round(v).toLocaleString('en-US')} m`;

export function LayerSlider({ value, onChange = () => {} }) {
  return (
    <Slider
      name="c"
      label={<Tex tex="c" />}
      value={value}
      onChange={onChange}
      color="#8c1515"
      min={LEVELS[0]}
      max={TOP}
      step={STEP}
      format={fmtM}
    />
  );
}

/**
 * How does a 3-D printer print a mountain? (after the contour plots) Mount Shasta, printed one
 * layer at a time; at first the nozzle goes around the layer at 3,000 m. Key press 1: "Contour
 * plot:", the print seen from above with the outline of the layer at height c, the level set
 * h(x, y) = c, in red, and a slider for c. 2: the print glides to the top; from above, the edges of the layers are the
 * mountain's contour plot (shown, not written).
 */
export default function Slide10bPrint() {
  const refs = [useRef(null), useRef(null)];
  const shown = refs.map((x) => useFragmentShown(x)); // eslint-disable-line react-hooks/rules-of-hooks
  const step = shown.filter(Boolean).length;
  const [glide, setC] = useGlide(step < 2 ? START : TOP, 3200);
  const c = Math.round(glide / STEP) * STEP; // the print goes up a whole layer at a time

  return (
    <section className="dense">
      <h2>3D printer</h2>
      {refs.map((x, n) => (
        <span key={n} ref={x} className="fragment fx-marker" data-fragment-index={n + 1} aria-hidden="true" />
      ))}

      <div className="print-slide">
        <figure className="print-3d">
          {PRINT ? (
            <div className="stack">
              <Fragment index={1} effect="fade-out">
                <img src={still('print')} alt="" width={VIEW.width} height={VIEW.height} />
              </Fragment>
              <Fragment index={1} effect="current-visible">
                <img src={still('print-red')} alt="" width={VIEW.width} height={VIEW.height} />
              </Fragment>
              <Fragment index={2}>
                <img src={still('print-done')} alt="" width={VIEW.width} height={VIEW.height} />
              </Fragment>
            </div>
          ) : (
            <ShastaPrint c={c} red={step >= 1 && c < TOP} done={c >= TOP} {...VIEW} />
          )}
          <figcaption>
            Mount Shasta, California, from 2,500 m up (USGS elevation data): a layer for every 100 m, heights × 2
          </figcaption>
        </figure>

        <div className="print-side">
          <p className="motiv-question">
            A 3D printer builds an object one thin layer at a time, from the bottom up.
          </p>

          <Fragment index={1}>
            <p>Contour plot:</p>
            <div className="print-row">
              {PRINT ? (
                <div className="stack">
                  <Fragment index={2} effect="fade-out">
                    <PrintFromAbove c={START} size={ABOVE} />
                  </Fragment>
                  <Fragment index={2}>
                    <PrintFromAbove c={TOP} red={false} size={ABOVE} />
                  </Fragment>
                </div>
              ) : (
                <PrintFromAbove c={c} red={c < TOP} size={ABOVE} />
              )}
              <div className="print-controls">
                <div className="graph-slider">
                  {PRINT ? (
                    <div className="stack">
                      <Fragment index={2} effect="fade-out">
                        <LayerSlider value={START} />
                      </Fragment>
                      <Fragment index={2}>
                        <LayerSlider value={TOP} />
                      </Fragment>
                    </div>
                  ) : (
                    <LayerSlider value={c} onChange={setC} />
                  )}
                </div>
              </div>
            </div>
          </Fragment>

        </div>
      </div>
    </section>
  );
}
