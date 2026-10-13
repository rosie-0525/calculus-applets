import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../lectures/l9/styles/deck.css';
import Tex, { r } from '../lectures/l9/components/Tex.jsx';
import Slider from '../lectures/l9/components/Slider.jsx';
import ContourPlot from '../lectures/l9/components/ContourPlot.jsx';
import { lineColor } from '../lectures/l9/components/levels.js';
import {
  SpringsPicture,
  PlotMarks,
  energyOf,
  restOf,
  step,
  stretches,
  settled,
  M0,
  DT,
  XR,
  YR,
  PW,
  PH,
  DV,
  NLEV,
  SW,
  SH,
  INK,
} from '../lectures/l9/slides/Slide06bSprings.jsx';

export const lecture = 9;

/*
 * Let go! (the textbook's Example 10.1.3) with every step showing, without its title and its first
 * sentence (the caption says what happens): V, its formula, its contour plot and the critical-point
 * equations, with what each says about the forces; the sliders for the masses and Let go under
 * them; the springs and weights beside it all, with their lengths and the forces on the weights
 * (those on the bottom weight, and what the second equation says, in a colour of their own; on the
 * slide all the forces are violet).
 * On the slide the weights drop on a key press; here they are held until Let go (or a click on the
 * contour plot, which lets them go from there), and the dot runs on the contour plot as they
 * bounce and settle at the minimum.
 */
export default function Springs() {
  const [m1, setM1] = useState(M0);
  const [m2, setM2] = useState(M0);
  const sim = useRef({ s: [0, 0, 0, 0], trail: [], held: true, m: [M0, M0] });
  const [, setTick] = useState(0);
  const frame = useRef(0);

  // the slide's simulation: Runge–Kutta steps of at most DT, until the weights settle
  const run = useCallback(() => {
    cancelAnimationFrame(frame.current);
    let last;
    const go = (now) => {
      const q = sim.current;
      let dt = last === undefined ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      const [a, b] = q.m;
      while (dt > 1e-9) {
        const h = Math.min(DT, dt);
        q.s = step(q.s, a, b, h);
        dt -= h;
      }
      if (q.trail.length < 3000) q.trail.push(stretches(q.s));
      setTick((t) => t + 1);
      if (!settled(q.s, a, b)) frame.current = requestAnimationFrame(go);
    };
    frame.current = requestAnimationFrame(go);
  }, []);

  const letGo = useCallback(
    (from = [0, 0]) => {
      const q = sim.current;
      q.s = [from[0], from[0] + from[1], 0, 0];
      q.trail = [from];
      q.held = false;
      run();
    },
    [run],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // a new mass: the weights move to the new rest position
  useEffect(() => {
    const q = sim.current;
    q.m = [m1, m2];
    if (!q.held && !settled(q.s, m1, m2)) run();
  }, [m1, m2, run]);

  const V = useMemo(() => energyOf(m1, m2), [m1, m2]);
  const rest = restOf(m1, m2);
  const q = sim.current;
  const x = stretches(q.s);

  const onPlotDown = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * PW;
    const py = ((e.clientY - box.top) / box.height) * PH;
    const u = XR[0] + ((px - 1) / (PW - 2)) * (XR[1] - XR[0]);
    const v = YR[0] + ((PH - 1 - py) / (PH - 2)) * (YR[1] - YR[0]);
    letGo([Math.min(XR[1], Math.max(XR[0], u)), Math.min(YR[1], Math.max(YR[0], v))]);
  };

  return (
    <div className="spr-stage">
      <div className="spr-page">
        <div className="spr-derive">
          <p>
            <Tex tex="V(x_1,x_2)=" /> <span className="spr-spring">spring potential energy</span> +{' '}
            <span className="spr-gravity">gravitational potential energy</span>
          </p>
          <p>
            <Tex tex={r`\phantom{V(x_1,x_2)}=\textcolor{#0e7490}{\tfrac12\left(k_1x_1^2+k_2x_2^2\right)}\textcolor{#b45309}{-m_1g\,x_1-m_2g\,(x_1+x_2)}`} />
          </p>
        </div>

        <div className="spr-row">
          <div className="spr-left" style={{ width: PW }}>
            <div className="spr-plot" onPointerDown={onPlotDown}>
              <ContourPlot f={V.f} x={XR} y={YR} size={[PW, PH]} levels={V.levels} color={(c) => lineColor((c - V.min) / (DV * NLEV))} width={1.4} axes title="Contour plot of the potential energy V, with the path of the point (x1, x2): click to let the weights go from there">
                {(p) => <PlotMarks p={p} trail={q.held ? [] : q.trail} x={x} rest={rest} />}
              </ContourPlot>
            </div>
            <p className="spr-caption">
              Contour plot for <Tex tex="V(x_1,x_2)" />
            </p>
          </div>

          <div className="spr-side" style={{ height: PH }}>
            <p>
              <Tex tex="V" /> is minimized at critical points:
            </p>
            <div className="spr-eq tex-left">
              <Tex display tex={r`\frac{\partial V}{\partial x_1}=k_1x_1-(m_1+m_2)g=0`} />
              <p className="spr-says">→ spring 1 holds up both weights</p>
              <Tex display tex={r`\frac{\partial V}{\partial x_2}=k_2x_2-m_2g=0`} />
              <p className="spr-says spr-bottom">→ spring 2 holds up the bottom weight</p>
            </div>
          </div>
        </div>

        <div className="spr-page-controls">
          <div className="lc-sliders">
            <Slider name="m1" label={<Tex tex="m_1" />} value={m1} onChange={setM1} min={0.1} max={0.8} step={0.05} color={INK} format={(v) => `${v.toFixed(2)} kg`} />
            <Slider name="m2" label={<Tex tex="m_2" />} value={m2} onChange={setM2} min={0.1} max={0.8} step={0.05} color={INK} format={(v) => `${v.toFixed(2)} kg`} />
          </div>
          <button type="button" className="viz-button" onClick={() => letGo()}>
            Let go
          </button>
        </div>
      </div>

      <svg className={`spr-hang${q.held ? ' held' : ''}`} viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH} role="img" aria-label="Two springs and two weights hanging from the ceiling">
        <SpringsPicture x={x} m={q.m} />
      </svg>
    </div>
  );
}
