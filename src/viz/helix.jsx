import { useState } from 'react';
import '../lectures/l7/styles/deck.css';
import Tex, { r } from '../lectures/l7/components/Tex.jsx';
import Slider from '../lectures/l7/components/Slider.jsx';
import { HelixFigure, Component, helix, T_MAX, INK, TEAL, CARDINAL, AMBER } from '../lectures/l7/slides/Slide17Functions.jsx';

export const lecture = 7;

const two = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

/* The slide's example with everything showing, without the definition: the formula and the slider
   for t above (on the slide they are on the left, which is too wide for the page), then the helix
   with the point p(t), and the three components as graphs. */
export default function Helix() {
  const [t, setT] = useState(7);
  const [x, y, z] = helix(t);

  return (
    <div className="helix-applet">
      <div className="vex-side helix-side helix-intro">
        <p>
          <Tex tex={r`\vv{p}(t)=(\cos t,\sin t,t/4)`} />
        </p>
        <div className="vex-slider">
          <Slider name="t" label={<Tex tex="t" />} value={t} onChange={setT} color={INK} min={0} max={Number(T_MAX.toFixed(2))} step={0.01} format={(v) => v.toFixed(2)} />
        </div>
      </div>
      <div className="vex-row helix-row">
        <figure className="helix-fig">
          <div className="helix-plot">
            <HelixFigure t={t} />
            <p className="helix-readout">
              <Tex tex={r`\vv{p}(${t.toFixed(2)})=(${two(x)},\ ${two(y)},\ ${two(z)})`} />
            </p>
          </div>
          <figcaption>
            <strong>A helix</strong>
          </figcaption>
        </figure>
        <div className="vex-side helix-side">
          <p>Each component is a scalar-valued function:</p>
          <div className="vex-comps">
            <Component name={r`\cos t`} at={Math.cos} lo={-1.1} hi={1.1} t={t} color={TEAL} />
            <Component name={r`\sin t`} at={Math.sin} lo={-1.1} hi={1.1} t={t} color={CARDINAL} />
            <Component name="t/4" at={(u) => u / 4} lo={0} hi={Math.PI} t={t} color={AMBER} />
          </div>
        </div>
      </div>
    </div>
  );
}
