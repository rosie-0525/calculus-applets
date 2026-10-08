import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Space, { Arrow3, Seg3, Dot3, Label3 } from '../components/Space.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const INK = '#14213d';
export const TRACE = '#f2c4c4';

// Shared with the Span slide and Example 1 (ii)
export const O = [0, 0, 0];
export const V = [-1.23, -0.19, 0.436];
export const times = (c, u) => u.map((x) => c * x);

export const VIEW = {
  width: 450,
  height: 330,
  unit: 58,
  center: [0.48, 0.55],
  axisLen: [2.4, 2.8, 2.2],
  az: -36,
  el: 22,
  swing: 10,
};

/**
 * v and c v in ℝ³, with c set by a slider. Every value of c the slider has
 * passed through leaves a pink trail; the whole line appears on key press 1.
 */
export function SpanOne() {
  const [c, setC] = useState(1.5);
  const [seen, setSeen] = useState([1.5, 1.5]);
  const onC = (x) => {
    setC(x);
    setSeen(([lo, hi]) => [Math.min(lo, x), Math.max(hi, x)]);
  };
  const cv = times(c, V);

  return (
    <div className="angle-explorer">
      <Space {...VIEW} title="v and its multiple c v; as c varies, c v traces out a line through the origin">
        {(s) => (
          <g>
            <Fragment as="g" index={1}>
              <Seg3 s={s} from={times(-2.1, V)} to={times(2.1, V)} color={CARDINAL} width={1.6} dashed opacity="0.7" />
            </Fragment>
            <Seg3 s={s} from={times(seen[0], V)} to={times(seen[1], V)} color={TRACE} width={10} />
            <Arrow3 s={s} to={cv} color={INK} width={4.5} />
            <Dot3 s={s} at={cv} color={INK} r={4} />
            <Label3 s={s} at={cv} dx={8} dy={-8} color={INK} size={17}>
              cv
            </Label3>
            <Arrow3 s={s} to={V} color={CARDINAL} width={2.6} head={11} />
            <Label3 s={s} at={V} dx={10} dy={6} color={CARDINAL}>
              v
            </Label3>
            <Dot3 s={s} at={O} color={INK} r={3.5} />
          </g>
        )}
      </Space>
      <div className="lc-sliders">
        <Slider name="c" label={<Tex tex="c" />} value={c} onChange={onC} color={CARDINAL} min={-2} max={2} />
      </div>
    </div>
  );
}

export default function Slide04Example1() {
  return (
    <section>
      <h2>Example 1</h2>

      <div className="stage">
        <div className="stage-text">
          <ol className="parts compact">
            <li>
              If <Tex tex={r`\vv{u}=\begin{bmatrix}1\\3\end{bmatrix}`} />,{' '}
              <Tex tex={r`\operatorname{span}(\vv{u})`} /> is a line through the origin.
              <Fragment index={2} as="p">
                Its parametric equation is given by <Tex tex={r`t\vv{u},\ t\in\mathbb{R}`} />.
              </Fragment>
              {/*
              <Tex
                display
                tex={r`t\vv{u}=\begin{bmatrix}t\\3t\end{bmatrix},\qquad t\in\mathbb{R}.`}
              />
              */}
            </li>
          </ol>
        </div>

        <div className="stage-fig">
          <SpanOne />
        </div>
      </div>

      <Notes time="2:30 · running total 8:00">
        <p>
          First, span(v) for one vector v in ℝ³: its linear combinations are just the multiples c v.{' '}
          <em>[drag c]</em> The pink trail marks every multiple visited so far; negative c flips to
          the other side, c = 0 is the origin.
        </p>
        <p>
          <em>[Key press]</em> All values of c together fill the whole line through the origin in the
          direction of v. So span(v) is a line through 0.
        </p>
        <p>
          Now in ℝ². <em>[(i) on the board]</em> span(u) is all multiples t u = (t, 3t). Sketch: the
          line through the origin and (1, 3). <em>[Key press]</em> Its parametric equation is t u,
          t ∈ ℝ: the parametric form of a line, with the point P = 0.
        </p>
      </Notes>
    </section>
  );
}
