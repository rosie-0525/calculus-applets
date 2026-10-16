import { useEffect, useRef, useState } from 'react';
import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import ContourPlot from '../lectures/l11/components/ContourPlot.jsx';
import Ticks from '../lectures/l11/components/Ticks.jsx';
import Slider from '../lectures/l11/components/Slider.jsx';
import { lineColor } from '../lectures/l11/components/levels.js';
import { B, Sub, MAIN } from '../lectures/l11/components/svgmath.jsx';
import { f, step, T, N, FAR, START, MIN, BOX, LEVELS, RED, INK, blur } from '../lectures/l11/slides/Slide18Descent.jsx';

export const lecture = 11;

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
 * Gradient descent's example without the definition (the caption says it): the textbook's Example
 * 11.3.5, f(x, y) = x² − 3xy + 3y² + 5y + 2x, its contour plot, on which gradient descent runs from
 * (0, 0) for 100 steps (slowly at first) towards the minimum (−9, −16/3); under it, the learning
 * rate t (a change starts a new run), Replay, the step number and f(a). On the slide the run starts
 * on a key press; here, the first time the applet is on screen.
 */
export default function Descent() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [rate, setRate] = useState(T);
  const [run, setRun] = useState(0);
  const [pts, setPts] = useState([START]);

  // the slide's run: a step every 450 ms for the first four, then every 70 ms
  useEffect(() => {
    setPts([START]);
    if (!seen) return undefined;
    let cur = [START];
    let timer;
    const tick = () => {
      cur = [...cur, step(cur[cur.length - 1], rate)];
      setPts(cur);
      if (cur.length <= N && Math.hypot(...cur[cur.length - 1]) < FAR) timer = setTimeout(tick, cur.length < 5 ? 450 : 70);
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [seen, rate, run]);

  const a = pts[pts.length - 1];
  const path = (p) => pts.map(([u, v], n) => `${n ? 'L' : 'M'}${p.px(u).toFixed(1)},${p.py(v).toFixed(1)}`).join('');
  return (
    <div className="l10-gd-fig" ref={ref}>
      <p className="l10-gd-f">
        <Tex tex={r`f(x,y)=x^2-3xy+3y^2+5y+2x`} />
      </p>
      <ContourPlot
        f={f}
        x={BOX[0]}
        y={BOX[1]}
        size={[460, 300]}
        pad={[6, 8, 26, 30]}
        n={160}
        levels={LEVELS}
        color={(c) => lineColor(0.25 + (0.75 * (c + 22)) / 42)}
        labels={(c) => String(c).replace('-', '−')}
        labelSize={12}
        title="Contour plot of f(x, y) = x² − 3xy + 3y² + 5y + 2x, long thin ellipses around the minimum (−9, −16/3), with the steps of gradient descent from (0, 0)"
      >
        {(p) => {
          const clip = { x: p.px(BOX[0][0]), y: p.py(BOX[1][1]), w: p.px(BOX[0][1]) - p.px(BOX[0][0]), h: p.py(BOX[1][0]) - p.py(BOX[1][1]) };
          return (
            <g>
              <Ticks p={p} box={BOX} x={[-10, -8, -6, -4, -2, 0]} y={[-6, -4, -2, 0]} />
              <circle cx={p.px(MIN[0])} cy={p.py(MIN[1])} r={5} fill={INK} stroke="#fff" strokeWidth="1.5" />
              {/* clipped to the plot by a nested svg, as on the slide */}
              <svg x={clip.x} y={clip.y} width={clip.w} height={clip.h} viewBox={`${clip.x} ${clip.y} ${clip.w} ${clip.h}`} overflow="hidden">
                <path d={path(p)} fill="none" stroke={RED} strokeWidth="1.5" />
                {pts.slice(0, -1).map(([u, v], n) => (
                  <circle key={n} cx={p.px(u)} cy={p.py(v)} r={2.6} fill={RED} />
                ))}
                <circle cx={p.px(a[0])} cy={p.py(a[1])} r={5.5} fill={RED} stroke="#fff" strokeWidth="1.5" />
              </svg>
              <text x={p.px(START[0]) + 8} y={p.py(START[1]) + 5} fontSize="15" fontFamily={MAIN} fill={RED} className="map-label">
                <B>a</B>
                <Sub>0</Sub>
              </text>
            </g>
          );
        }}
      </ContourPlot>

      <div className="l10-ai-controls l10-gd-controls">
        <Slider name="learning rate t" label={<span>learning rate <Tex tex="t" /></span>} value={rate} onChange={setRate} min={0.01} max={0.3} step={0.01} format={(v) => v.toFixed(2)} />
        <button type="button" onPointerUp={blur} onClick={() => setRun((k) => k + 1)}>
          Replay
        </button>
      </div>
      <p className="l10-gd-read">
        <span>step {pts.length - 1}</span>
        <Tex tex={`f(\\vv a)=${f(...a).toFixed(3)}`} />
      </p>
    </div>
  );
}
