import { useState } from 'react';
import '../lectures/l7/styles/deck.css';
import Tex from '../lectures/l7/components/Tex.jsx';
import Slider from '../lectures/l7/components/Slider.jsx';
import Space from '../lectures/l7/components/Space.jsx';
import Surface from '../lectures/l7/components/Surface.jsx';
import ContourPlot from '../lectures/l7/components/ContourPlot.jsx';
import { Axes, PlaneLabel, f, R, START, Z_SCALE, CARDINAL, PLANE } from '../lectures/l7/slides/Slide09LevelSets.jsx';

export const lecture = 7;

/* The slide with everything showing, without its definition: the graph cut by the plane z = c,
   the slider for c, and the level set below, in the xy plane. */
export default function LevelSet() {
  const [c, setC] = useState(START);
  const sliced = { f, x: R, y: R, n: 34, zScale: Z_SCALE, mesh: 'rgba(15, 40, 50, 0.16)', water: c, seeThrough: true, waterColor: PLANE, curve: c, curveColor: CARDINAL, curveWidth: 3.5 };

  return (
    <div className="level-stage">
      <figure className="level-3d">
        <Space width={560} height={380} unit={68} center={[0.5, 0.62]} axes={false} az={102} el={28} swing={6} title="The graph of a function with two hills, cut by the horizontal plane at height c">
          {(s) => (
            <g>
              <Surface s={s} {...sliced} />
              <Axes s={s} c={c} />
              <PlaneLabel s={s} c={c} />
            </g>
          )}
        </Space>
        <span className="scalar-formula">
          <Tex tex="z=f(x,y)" />
        </span>
      </figure>

      <div className="level-side">
        <div className="level-slider centred">
          <Slider name="c" label={<Tex tex="c" />} value={c} onChange={setC} color={CARDINAL} min={0.1} max={2.1} step={0.05} format={(v) => v.toFixed(2)} />
        </div>
        <div className="level-below level-proj">
          <ContourPlot f={f} x={R} y={R} size={250} levels={[]} highlight={c} axes title="Projection to the xy plane: the points (x, y) where f(x, y) = c" />
          <p>
            Projection to the <Tex tex="xy" /> plane
          </p>
        </div>
      </div>
    </div>
  );
}
