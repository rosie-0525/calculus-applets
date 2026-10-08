import { useState } from 'react';
import '../lectures/l6/styles/deck.css';
import { PenguinChart, FitLine, INK, TEAL } from '../lectures/l6/components/Charts.jsx';
import { Says, F1, F2, KG_MIN, KG_MAX, ASK, BEST } from '../lectures/l6/slides/Slide03PenguinLine.jsx';

export const lecture = 6;

/* The slide without its title, everything showing: the penguins, the 200 mm question, a line to
   drag by its two handles, and the best fit line. */
export default function WeighPenguin() {
  const [h, setH] = useState([3.2, 4.6]); // the line's masses above F1 and F2
  const [grab, setGrab] = useState(null); // the handle being dragged

  const m = (h[1] - h[0]) / (F2 - F1);
  const b = h[0] - m * F1;

  const drag = (k) => ({
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setGrab(k);
    },
    onPointerUp: () => setGrab(null),
    onPointerCancel: () => setGrab(null),
  });

  return (
    <div className="motiv">
      <PenguinChart
        overlay={(p) => (
          <g
            onPointerMove={(e) => {
              if (grab === null) return;
              const t = Math.max(KG_MIN, Math.min(KG_MAX, p.toData(e)[1]));
              setH((old) => (grab === 0 ? [t, old[1]] : [old[0], t]));
            }}
          >
            <circle cx={p.px(ASK)} cy={p.py(BEST.m * ASK + BEST.b)} r={7} fill={TEAL} stroke="#fff" strokeWidth="1.5" />
            <circle cx={p.px(ASK)} cy={p.py(m * ASK + b)} r={6} fill={INK} />
            {[F1, F2].map((f, k) => (
              <circle key={f} className="drag-handle" cx={p.px(f)} cy={p.py(h[k])} r={11} fill="#fff" stroke={INK} strokeWidth="3" {...drag(k)} />
            ))}
          </g>
        )}
      >
        {(p) => (
          <g>
            <line x1={p.px(ASK)} y1={p.top} x2={p.px(ASK)} y2={p.bottom} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="6 5" />
            <text x={p.px(ASK) + 6} y={p.top + 16} fill="#6b7280" fontSize="14" fontWeight="700">
              {ASK} mm
            </text>
            <text x={p.left + 12} y={p.top + 18} fill="#8a919c" fontSize="13">
              <tspan x={p.left + 12}>342 Adélie, Chinstrap and Gentoo penguins,</tspan>
              <tspan x={p.left + 12} dy="17">Palmer Station, Antarctica, 2007–2009</tspan>
            </text>
            <FitLine p={p} m={BEST.m} b={BEST.b} color={TEAL} width={3.5} />
            <FitLine p={p} m={m} b={b} color={INK} width={2.5} />
          </g>
        )}
      </PenguinChart>

      <div className="motiv-side">
        <p>If the flipper length is {ASK} mm, how can we estimate the penguin’s weight?</p>
        <p>
          <strong>Find a best fit line:</strong> drag the two handles.
        </p>
        <Says who="Your line" m={m} b={b} color={INK} />
        <Says who={<span style={{ color: TEAL }}>The best fit line</span>} m={BEST.m} b={BEST.b} color={TEAL} />
      </div>
    </div>
  );
}
