import { useRef } from 'react';
import Space, { Seg3, Dot3, Label3, PlanePatch } from './Space.jsx';
import { INK } from './la.js';
import { PRINT } from './print.js';
import { useClock } from './clock.js';

/** The ladybug's spiral p(t) = (3 + cos t, 2 + sin t, t) (Example 5). */
export const spiral = (t) => [3 + Math.cos(t), 2 + Math.sin(t), t];

const T_END = 2 * Math.PI; // one turn of the spiral
const FLIGHT = 8; // seconds for the turn
const PERIOD = 11; // then a rest on the floor

/** A ladybug seen from above, its head towards +x of its own frame, turned by `angle` degrees. */
function Bug({ at, angle }) {
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${angle.toFixed(1)})`}>
      <ellipse cx="0" cy="0" rx="9.5" ry="6.8" fill="#c8102e" stroke="#111827" strokeWidth="1" />
      <circle cx="8.5" cy="0" r="3.6" fill="#111827" />
      <line x1="-9" y1="0" x2="6" y2="0" stroke="#111827" strokeWidth="1" />
      <circle cx="-4.5" cy="-3.2" r="1.6" fill="#111827" />
      <circle cx="-4.5" cy="3.2" r="1.6" fill="#111827" />
      <circle cx="1" cy="-3.8" r="1.5" fill="#111827" />
      <circle cx="1" cy="3.8" r="1.5" fill="#111827" />
    </g>
  );
}

/**
 * The room's floor, the spiral p(t) for 0 ≤ t ≤ 2π, and the ladybug flying along it on a loop
 * (at t = π in print, the time asked), with the dotted drop to its shadow on the floor; its start
 * (4, 2, 0) labelled.
 */
export default function Ladybug({ width = 380, height = 410 }) {
  const ref = useRef(null);
  const clock = useClock(ref);
  const t = PRINT ? Math.PI : Math.min(T_END, ((clock % PERIOD) / FLIGHT) * T_END);
  const P = spiral(t);
  const N = 160;
  return (
    <div ref={ref} className="l17-bug">
      <Space
        width={width}
        height={height}
        unit={44}
        center={[0.37, 0.84]}
        axisLen={[4.9, 3.9, 6.9]}
        az={-32}
        el={20}
        swing={8}
        title="The floor of the room, the ladybug's spiral from (4, 2, 0), and the ladybug flying along it"
      >
        {(s) => {
          const Q = s.P(P);
          const Q2 = s.P(spiral(t + 0.05));
          const angle = (Math.atan2(Q2[1] - Q[1], Q2[0] - Q[0]) * 180) / Math.PI;
          return (
            <g>
              <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={[0, 4.6]} range2={[0, 3.6]} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
              <polyline
                points={Array.from({ length: N + 1 }, (_, k) => s.P(spiral((T_END * k) / N)).map((v) => v.toFixed(1)).join(',')).join(' ')}
                fill="none"
                stroke={INK}
                strokeWidth="2.2"
              />
              <Dot3 s={s} at={[4, 2, 0]} color={INK} r={4} />
              <Label3 s={s} at={[4, 2, 0]} dx={10} dy={16} size={15} italic={false} color={INK}>
                (4, 2, 0)
              </Label3>
              <Seg3 s={s} from={P} to={[P[0], P[1], 0]} color="#6b7280" width={1.5} strokeDasharray="0.1 5" strokeLinecap="round" />
              <Dot3 s={s} at={[P[0], P[1], 0]} color="#9ca3af" r={3.5} />
              <Bug at={Q} angle={angle} />
              <Label3 s={s} at={P} dx={14} dy={-10} size={17} color="#c8102e" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 }}>
                p(t)
              </Label3>
            </g>
          );
        }}
      </Space>
    </div>
  );
}
