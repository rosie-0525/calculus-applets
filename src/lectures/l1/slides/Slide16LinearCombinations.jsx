import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, PlaneLabel, Dot } from '../components/Plane.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const TRACE = '#f2c4c4';

/** A subscript inside an SVG plane label. */
export const Sub = ({ children }) => (
  <tspan baselineShift="sub" fontSize="0.7em">
    {children}
  </tspan>
);

export const V = [2, 1];
export const W = [-1, 2];

/**
 * v and c v on a plane, with c set by a slider. Every value of c the slider
 * has passed through leaves a pink trail, so dragging back and forth draws the
 * line of multiples; the full line appears on key press 3.
 */
export function MultiplesExplorer({ c, setC, seen }) {
  const cv = [c * V[0], c * V[1]];

  return (
    <div className="lc-explorer">
      <Plane
        xRange={[-4.6, 4.6]}
        yRange={[-4.6, 4.6]}
        unit={36}
        xTicks={[-4, -2, 0, 2, 4]}
        yTicks={[-4, -2, 0, 2, 4]}
        title="v and the multiple c v; dragging c traces out the line through the origin in the direction of v"
      >
        {(p) => (
          <g>
            <Fragment as="g" index={3}>
              <line
                x1={p.px(-4.6)}
                y1={p.py(-2.3)}
                x2={p.px(4.6)}
                y2={p.py(2.3)}
                stroke={CARDINAL}
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.6"
              />
            </Fragment>

            {/* the trail: every multiple the slider has visited so far */}
            <line
              x1={p.px(seen[0] * V[0])}
              y1={p.py(seen[0] * V[1])}
              x2={p.px(seen[1] * V[0])}
              y2={p.py(seen[1] * V[1])}
              stroke={TRACE}
              strokeWidth="10"
              strokeLinecap="round"
            />

            <Arrow p={p} to={cv} color={INK} width={4.5} />
            <Dot p={p} at={cv} color={INK} r={4} />
            <PlaneLabel p={p} at={cv} dx={-6} dy={-12} color={INK} size={17}>
              cv
            </PlaneLabel>

            {/* v on top, so it stays visible when c v lies along it */}
            <Arrow p={p} to={V} color={CARDINAL} width={2.6} head={11} />
            <PlaneLabel p={p} at={V} dx={-2} dy={24} color={CARDINAL}>
              v
            </PlaneLabel>
          </g>
        )}
      </Plane>

      <div className="lc-sliders">
        <Slider name="c" label={<Tex tex="c" />} value={c} onChange={setC} color={CARDINAL} min={-2} max={2} />
      </div>
    </div>
  );
}

/** v1, v2 and c1 v1 + c2 v2 on a plane, with c1 and c2 set by sliders. */
export function CombinationExplorer({ c1, c2, setC1, setC2 }) {
  const cv1 = [c1 * V[0], c1 * V[1]];
  const cv2 = [c2 * W[0], c2 * W[1]];
  const sum = [cv1[0] + cv2[0], cv1[1] + cv2[1]];

  return (
    <div className="lc-explorer">
      <Plane
        xRange={[-4.6, 4.6]}
        yRange={[-4.6, 4.6]}
        unit={36}
        xTicks={[-4, -2, 0, 2, 4]}
        yTicks={[-4, -2, 0, 2, 4]}
        title="v1, v2 and the linear combination c1 v1 + c2 v2, set by the sliders"
      >
        {(p) => (
          <g>
            {/* the parallelogram spanned by c1 v1 and c2 v2 */}
            <Arrow p={p} from={cv1} to={sum} color={TEAL} width={2} dashed head={0} />
            <Arrow p={p} from={cv2} to={sum} color={CARDINAL} width={2} dashed head={0} />

            <Arrow p={p} to={cv1} color={CARDINAL} width={2.4} dashed head={11} opacity={0.75} />
            <Arrow p={p} to={cv2} color={TEAL} width={2.4} dashed head={11} opacity={0.75} />

            <Arrow p={p} to={V} color={CARDINAL} width={3.5} />
            <PlaneLabel p={p} at={V} dx={6} dy={18} color={CARDINAL}>
              v<Sub>1</Sub>
            </PlaneLabel>
            <Arrow p={p} to={W} color={TEAL} width={3.5} />
            <PlaneLabel p={p} at={W} dx={-26} dy={-4} color={TEAL}>
              v<Sub>2</Sub>
            </PlaneLabel>

            <Arrow p={p} to={sum} color={INK} width={4.5} />
            <Dot p={p} at={sum} color={INK} r={4} />
            <PlaneLabel p={p} at={sum} dx={8} dy={-8} color={INK} size={17}>
              c<Sub>1</Sub>v<Sub>1</Sub> + c<Sub>2</Sub>v<Sub>2</Sub>
            </PlaneLabel>
          </g>
        )}
      </Plane>

      <div className="lc-sliders">
        <Slider name="c1" label={<Tex tex="c_1" />} value={c1} onChange={setC1} color={CARDINAL} />
        <Slider name="c2" label={<Tex tex="c_2" />} value={c2} onChange={setC2} color={TEAL} />
      </div>
    </div>
  );
}

export default function Slide16LinearCombinations() {
  // one vector: c v, and the smallest and largest c the slider has reached
  const [c, setC] = useState(1.5);
  const [seen, setSeen] = useState([1.5, 1.5]);
  const onC = (x) => {
    setC(x);
    setSeen(([lo, hi]) => [Math.min(lo, x), Math.max(hi, x)]);
  };

  // two vectors: c1 v1 + c2 v2
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);

  return (
    <section>
      <h2>Linear combinations</h2>

      <div className="stage">
        <div className="stage-text">
          <Fragment index={1} className="block definition">
            <p className="block-title">Definition</p>
            <p className="compact">
              A <strong>linear combination</strong> of the <Tex tex="n" />-vectors{' '}
              <Tex tex={r`\vv{v}_1,\dots,\vv{v}_k`} /> is
            </p>
            <Tex display tex={r`c_1\vv{v}_1+c_2\vv{v}_2+\cdots+c_k\vv{v}_k`} />
            <p className="compact">
              for scalars <Tex tex="c_1,c_2,\dots,c_k" />.
            </p>
          </Fragment>

          {/* key presses 2-3: one vector; from key press 4: two vectors, in the same place */}
          <div className="lc-stack">
            <Fragment index={4} effect="fade-out" as="div">
              <Fragment index={2} className="lc-readout">
                <p className="compact">
                  e.g. Linear combination of one vector <Tex tex={r`\vv{v}`} />
                </p>
                <Fragment index={3} as="p" className="compact">
                  As <Tex tex="c" /> runs over all real numbers, <Tex tex={r`c\vv{v}`} /> traces
                  out a <strong>line through the origin</strong>, a{' '}
                  <strong>one-dimensional</strong> set.
                </Fragment>
              </Fragment>
            </Fragment>

            <Fragment index={4} className="lc-readout">
              <p className="compact">
                e.g. Linear combination of two vectors:{' '}
                <Tex tex={r`c_1\vv{v}_1+c_2\vv{v}_2`} />
              </p>
            </Fragment>
          </div>
        </div>

        <div className="stage-fig lc-stack">
          <Fragment index={4} effect="fade-out" as="div">
            <Fragment index={2} as="div">
              <MultiplesExplorer c={c} setC={onC} seen={seen} />
            </Fragment>
          </Fragment>

          <Fragment index={4} as="div">
            <CombinationExplorer c1={c1} c2={c2} setC1={setC1} setC2={setC2} />
          </Fragment>
        </div>
      </div>

      <Notes time="1:30 · running total 18:15">
        <p>
          <em>[Key press]</em> Now we combine the two operations. Take some vectors, scale each one
          by a number, add the results. That is a <strong>linear combination</strong> — the single
          most important phrase in this course.
        </p>
        <p>
          <em>[Key press]</em> The simplest case first: just one vector. Then a linear combination
          is a single multiple c v. Drag c. Positive c points along v, negative c points the other
          way, c = 0 is the origin. The pink trail marks every multiple you have visited so far.
        </p>
        <p>
          <em>[Key press]</em> Let c range over all numbers, and the trail fills in a whole{' '}
          <strong>line through the origin</strong>. One number of freedom, one dimension.
        </p>
        <p>
          <em>[Key press]</em> Now two vectors. Here it is live, with v₁ = (2, 1) and v₂ = (−1, 2).
          Drag c₁ and c₂: the dashed arrows are c₁v₁ and c₂v₂, and c₁v₁ + c₂v₂ is the diagonal of
          the parallelogram they span. Worth trying c₁ = 0 (you get a multiple of v₂), a negative
          c₁ (v₁ flips), and c₁ = c₂ = 1 (plain v₁ + v₂). As c₁ and c₂ range over all numbers,
          c₁v₁ + c₂v₂ reaches every point of the plane.
        </p>
      </Notes>
    </section>
  );
}
