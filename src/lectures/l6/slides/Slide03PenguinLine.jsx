import { useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { PenguinChart, PENGUIN_POINTS, FitLine, INK, TEAL } from '../components/Charts.jsx';
import { bestFit } from '../components/regression.js';

// The two handles of the class's line sit above these flipper lengths (mm)
export const F1 = 175;
export const F2 = 230;
export const KG_MIN = 2.45;
export const KG_MAX = 6.55;
// The flipper length the lines are asked about (mm)
export const ASK = 200;

export const BEST = bestFit(PENGUIN_POINTS);

/** What the line y = m x + b (`who`) says about a penguin with ASK mm flippers. */
export function Says({ who, m, b, color }) {
  return (
    <p className="penguin-says">
      {who} says{' '}
      <strong className="nowrap" style={{ color }}>
        {(m * ASK + b).toFixed(2)} kg
      </strong>
      .
    </p>
  );
}

/**
 * The body mass of the Palmer penguins against their flipper length. Key press 1: the dashed line
 * at 200 mm, and how heavy is a penguin with 200 mm flippers? 2: find a best fit line: the class
 * drags the two handles of a line, which says how heavy; 3: the best fit line (least squares) and
 * what it says.
 */
export default function Slide03PenguinLine() {
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
    <section className="dense">
      <h2>Weigh a penguin with a ruler</h2>

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
              <Fragment as="g" index={3}>
                <circle cx={p.px(ASK)} cy={p.py(BEST.m * ASK + BEST.b)} r={7} fill={TEAL} stroke="#fff" strokeWidth="1.5" />
              </Fragment>
              <Fragment as="g" index={2}>
                <circle cx={p.px(ASK)} cy={p.py(m * ASK + b)} r={6} fill={INK} />
                {[F1, F2].map((f, k) => (
                  <circle
                    key={f}
                    className="drag-handle"
                    cx={p.px(f)}
                    cy={p.py(h[k])}
                    r={11}
                    fill="#fff"
                    stroke={INK}
                    strokeWidth="3"
                    {...drag(k)}
                  />
                ))}
              </Fragment>
            </g>
          )}
        >
          {(p) => (
            <g>
              <Fragment as="g" index={1}>
                <line x1={p.px(ASK)} y1={p.top} x2={p.px(ASK)} y2={p.bottom} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="6 5" />
                <text x={p.px(ASK) + 6} y={p.top + 16} fill="#6b7280" fontSize="14" fontWeight="700">
                  {ASK} mm
                </text>
              </Fragment>
              <text x={p.left + 12} y={p.top + 18} fill="#8a919c" fontSize="13">
                <tspan x={p.left + 12}>342 Adélie, Chinstrap and Gentoo penguins,</tspan>
                <tspan x={p.left + 12} dy="17">Palmer Station, Antarctica, 2007–2009</tspan>
              </text>
              <Fragment as="g" index={3}>
                <FitLine p={p} m={BEST.m} b={BEST.b} color={TEAL} width={3.5} />
              </Fragment>
              <Fragment as="g" index={2}>
                <FitLine p={p} m={m} b={b} color={INK} width={2.5} />
              </Fragment>
            </g>
          )}
        </PenguinChart>

        <div className="motiv-side">
          <Fragment index={1} as="p">
            If the flipper length is {ASK} mm, how can we estimate the penguin’s weight?
          </Fragment>

          <Fragment index={2}>
            <p>
              <strong>Find a best fit line</strong>
            </p>
            <Says who="Your line" m={m} b={b} color={INK} />
          </Fragment>

          <Fragment index={3}>
            <Says who={<span style={{ color: TEAL }}>The best fit line</span>} m={BEST.m} b={BEST.b} color={TEAL} />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
