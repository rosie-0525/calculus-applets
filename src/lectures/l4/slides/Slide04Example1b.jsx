import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Space, {
  Arrow3,
  Dot3,
  Label3,
  PlanePatch,
  PlaneGrid,
  at,
  isShowing,
  reducedMotion,
} from '../components/Space.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import { O, times } from './Slide04Example1.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

// The u and v of the question
export const U = [1, -1, 0];
export const V = [6, -1, 2];

// v is several times as long as u, so the patch runs further along u than along v
export const T_RANGE = [-2, 2];
export const T2_RANGE = [-1, 1];

// Seen from behind the textbook's usual direction (x and y run away from the viewer), where u
// lies across the picture and the plane is seen nearly face on. From the usual direction u
// and v look almost parallel.
export const VIEW = {
  width: 450,
  height: 330,
  unit: 25,
  center: [0.5, 0.52],
  axisLen: [4, 4, 3],
  az: 135,
  el: 28,
  swing: 10,
};

// t and t′ wander on their own: two sine waves whose periods (about 11 s and 8 s) never line
// up, so t u + t′ v sweeps over the whole patch. They start at 1 and 0.5, rising.
export const START = [1, 0.5];
export const AMP = [1.8, 0.9];
export const OMEGA = [0.55, 0.78];
export const PHASE = START.map((x, i) => Math.asin(x / AMP[i]));

/**
 * u, v and t u + t′ v in ℝ³, on the plane they span. While the picture is
 * showing, t and t′ move by themselves; touching a slider hands them over to
 * the presenter for good.
 */
export function SpanTwo() {
  const hostRef = useRef(null);
  const [t, setT] = useState(START[0]);
  const [t2, setT2] = useState(START[1]);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reducedMotion()) return undefined;
    let id;
    let last = null;
    let clock = 0;
    const tick = (now) => {
      const el = hostRef.current;
      const fragment = el?.closest('.fragment');
      if (isShowing(el) && (!fragment || fragment.classList.contains('visible'))) {
        if (last !== null) clock += (now - last) / 1000;
        setT(AMP[0] * Math.sin(OMEGA[0] * clock + PHASE[0]));
        setT2(AMP[1] * Math.sin(OMEGA[1] * clock + PHASE[1]));
      }
      last = now;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [auto]);

  const byHand = (set) => (value) => {
    setAuto(false);
    set(value);
  };
  const x = at(O, U, V, t, t2);
  const corner = times(t, U);

  return (
    <div className="angle-explorer" ref={hostRef}>
      <Space {...VIEW} title="u, v and the linear combination t u + t′ v, on the plane through the origin that they span">
        {(s) => (
          <g>
            <PlanePatch s={s} P={O} e={U} e2={V} range={T_RANGE} range2={T2_RANGE} />
            <PlaneGrid s={s} P={O} e={U} e2={V} range={T_RANGE} range2={T2_RANGE} color="#b6d5dc" width={0.7} />
            <Arrow3 s={s} to={corner} color={CARDINAL} width={2.2} dashed head={10} opacity={0.75} />
            <Arrow3 s={s} from={corner} to={x} color={TEAL} width={2.2} dashed head={10} opacity={0.75} />
            <Arrow3 s={s} to={U} color={CARDINAL} width={3.2} head={10} />
            <Label3 s={s} at={U} dx={-4} dy={22} color={CARDINAL}>
              u
            </Label3>
            <Arrow3 s={s} to={V} color={TEAL} width={3.2} />
            <Label3 s={s} at={V} dx={8} dy={6} color={TEAL}>
              v
            </Label3>
            <Arrow3 s={s} to={x} color={INK} width={4} />
            <Dot3 s={s} at={x} color={INK} r={4} />
            <Label3 s={s} at={x} dx={8} dy={-8} color={INK} size={16}>
              tu + t′v
            </Label3>
            <Dot3 s={s} at={O} color={INK} r={3.5} />
          </g>
        )}
      </Space>
      <div className="lc-sliders slider-pair">
        <Slider name="t" label={<Tex tex="t" />} value={t} onChange={byHand(setT)} color={CARDINAL} min={T_RANGE[0]} max={T_RANGE[1]} step={0.01} />
        <Slider name="t2" label={<Tex tex="t'" />} value={t2} onChange={byHand(setT2)} color={TEAL} min={T2_RANGE[0]} max={T2_RANGE[1]} step={0.01} />
      </div>
    </div>
  );
}

export default function Slide04Example1b() {
  return (
    <section>
      <h2>Example 1</h2>

      <div className="stage">
        <div className="stage-text">
          <ol className="parts compact" start="2">
            <li>
              If <Tex tex={r`\vv{u}=\begin{bmatrix}1\\-1\\0\end{bmatrix}`} /> and{' '}
              <Tex tex={r`\vv{v}=\begin{bmatrix}6\\-1\\2\end{bmatrix}`} />,{' '}
              <Tex tex={r`\operatorname{span}(\vv{u},\vv{v})`} /> is a plane through the origin.
              {/* The braces keep KaTeX from breaking the line inside the equation */}
              <Fragment index={1} as="p">
                Its parametric equation is given by <Tex tex={r`{t\vv{u}+t'\vv{v},\ t,t'\in\mathbb{R}}`} />.
              </Fragment>
              {/*
              <Tex
                display
                tex={r`t\vv{u}+t'\vv{v}=\begin{bmatrix}t+6t'\\-t-t'\\2t'\end{bmatrix},\qquad t,t'\in\mathbb{R}.`}
              />
              */}
            </li>
          </ol>
        </div>

        <div className="stage-fig">
          <SpanTwo />
        </div>
      </div>

      <Notes time="2:00 · running total 10:00">
        <p>
          The u and v of (ii). t and t′ move by themselves (grab a slider to take over). Walk t times
          along u, then t′ times along v. u and v are not multiples of each other (look at the third
          entries), so the combinations fill a plane, and it passes through 0 (t = t′ = 0).
        </p>
        <p>
          <em>[Key press]</em> That is exactly the parametric form of a plane from Monday, with the
          point P = 0. <em>[(ii) on the board]</em> t u + t′ v = (t + 6t′, −t − t′, 2t′).
        </p>
      </Notes>
    </section>
  );
}
