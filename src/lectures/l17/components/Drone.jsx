import { useRef } from 'react';
import ContourPlot from './ContourPlot.jsx';
import { INK, RED } from './la.js';
import { PRINT } from './print.js';
import { useClock } from './clock.js';
import { h, p } from './Climb.jsx'; // the same hill and path as Janja's climb (Example 4)

// the stretch of the track drawn: p(15) = (−5, −15) to p(25) = (5, 15), the summit at t = 20
export const T0 = 15;
export const T1 = 25;
const FLIGHT = 10; // seconds for it
const PERIOD = 13; // then a pause before it flies again
const STILL = 18; // the time shown in print
const X = [-26, 26];
const Y = [-15.5, 15.5];
const LEVELS = [150, 100, 50, 0, -300, -800, -1500];
const GROUND = '#a3b18a'; // the hill in the side view
const GAP = 55; // the drone's height above the ground in the side view (units of h)
export const SIDE = { w: 400, h: 170, z: [-200, 280] };
const fmt = (v) => Math.round(v).toLocaleString('en-US').replace(/-/g, '−');

// the side view: t across, the height up; the ground h(p(t)) under the track
export const sideX = (u) => 14 + ((u - T0) / (T1 - T0)) * (SIDE.w - 28);
export const sideY = (z) => 8 + ((SIDE.z[1] - z) / (SIDE.z[1] - SIDE.z[0])) * (SIDE.h - 16);
export const GROUND_PTS = Array.from({ length: 81 }, (_, k) => T0 + ((T1 - T0) * k) / 80).map((u) => [sideX(u), sideY(h(...p(u)))]);
export const pts = (qs) => qs.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

/**
 * The map of the hill h(x, y) (grey level curves, those of the hill labelled, the summit at the
 * origin) with the track p(t), dashed, in `track`, for T0 ≤ t ≤ T1, and the `caption` (if any) in the
 * top left corner; `children(at, q)` draws the traveller at p(t), `at` in px.
 */
export function HillMap({ t, width, height, title, track: trackColor = RED, caption, children }) {
  const [x, y] = p(t);
  const track = [p(T0), p(T1)];
  return (
    <ContourPlot
      f={h}
      x={X}
      y={Y}
      size={[width, height]}
      n={110}
      levels={LEVELS}
      color={(c) => (c >= 0 ? '#7c8b6f' : '#a7b0bb')}
      width={1.1}
      labels={(c) => (c >= 0 ? fmt(c) : null)}
      labelSize={11}
      labelColor={() => '#6b7280'}
      labelMin={60}
      labelAvoid={(q) => [[q.px(0) - 8, q.py(0) - 12, q.px(0) + 56, q.py(0) + 8], ...(caption ? [[0, 0, 150, 30]] : [])]}
      axes
      pad={1}
      title={title}
    >
      {(q) => (
        <g>
          <line x1={q.px(track[0][0])} y1={q.py(track[0][1])} x2={q.px(track[1][0])} y2={q.py(track[1][1])} stroke={trackColor} strokeWidth="2" strokeDasharray="6 5" opacity="0.8" />
          <path d={`M ${q.px(0)} ${q.py(0) - 6} l 5 8 l -10 0 z`} fill="#4d5b40" />
          <text x={q.px(0) + 8} y={q.py(0) + 1} fontSize="12" fontWeight="600" fill="#4d5b40" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>
            summit
          </text>
          {caption && (
            <g>
              <rect x="4" y="5" width="139" height="23" rx="4" fill="#fff" opacity="0.92" />
              <text x="10" y="22" fontSize="14" fill="#4b5563">
                {caption}
              </text>
            </g>
          )}
          {children([q.px(x), q.py(y)], q)}
        </g>
      )}
    </ContourPlot>
  );
}

/** A quadcopter seen from above, at `at`, its arms turned by `angle` degrees; `spin` turns the propellers. */
function DroneTop({ at, angle, spin }) {
  const arms = [45, 135, 225, 315].map((a) => [Math.cos((a * Math.PI) / 180) * 10, Math.sin((a * Math.PI) / 180) * 10]);
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${angle.toFixed(1)})`}>
      {arms.map(([x, y], k) => (
        <g key={k}>
          <line x1="0" y1="0" x2={x} y2={y} stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx={x} cy={y} r="5" fill="rgba(148, 163, 184, 0.35)" stroke="#475569" strokeWidth="1" />
          <line x1={x - 4.5} y1={y} x2={x + 4.5} y2={y} stroke="#334155" strokeWidth="1.3" transform={`rotate(${(spin + k * 45).toFixed(0)} ${x} ${y})`} />
        </g>
      ))}
      <rect x="-4.5" y="-3.5" width="9" height="7" rx="2" fill={RED} stroke="#fff" strokeWidth="1" />
    </g>
  );
}

/** The drone seen from the side, at `at`, with its parcel; `spin` (0 to 1) beats the propellers. */
function DroneSide({ at, spin }) {
  const w = 9 * (0.55 + 0.45 * Math.abs(Math.cos(spin * 2 * Math.PI)));
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`}>
      <line x1="-17" y1="0" x2="17" y2="0" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      {[-17, 17].map((x) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="-4" stroke={INK} strokeWidth="1.6" />
          <line x1={x - w} y1="-4.5" x2={x + w} y2="-4.5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ))}
      <rect x="-7" y="-4" width="14" height="7" rx="3" fill={RED} />
      <line x1="0" y1="3" x2="0" y2="7" stroke="#6b7280" strokeWidth="1" />
      <rect x="-5" y="7" width="10" height="8" rx="1" fill="#c4a484" stroke="#8b6b4a" strokeWidth="0.8" />
    </g>
  );
}

/**
 * Example 4, the drone: on top, the map of the hill h(x, y) (grey level curves, the summit at the
 * origin) with the drone's GPS track p(t), dashed, the drone flying along it on a loop; under it, the
 * side view along the track: the ground h(p(t)) and the drone keeping the same height above it, the
 * time t in the corner. Still at t = 18 in print.
 */
export default function Drone({ width = 400, mapHeight = 236 }) {
  const ref = useRef(null);
  const clock = useClock(ref);
  const t = PRINT ? STILL : Math.min(T1, T0 + ((clock % PERIOD) / FLIGHT) * (T1 - T0));
  const z = h(...p(t));
  const spin = PRINT ? 0 : clock * 2200;
  const air = [sideX(t), sideY(z + GAP)];
  const below = [sideX(t), sideY(z)];
  return (
    <div ref={ref} className="l17-drone">
      <HillMap t={t} width={width} height={mapHeight} title="The map of the hill, the drone's straight GPS track over the summit, and the drone on it">
        {(at, q) => {
          const heading = (Math.atan2(q.py(3) - q.py(0), q.px(1) - q.px(0)) * 180) / Math.PI;
          return (
            <g>
              <DroneTop at={at} angle={heading + 45} spin={spin} />
              <text x={at[0] - 14} y={at[1] + 5} fontSize="13" fontWeight="700" fontStyle="italic" fill={RED} textAnchor="end" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 }}>
                p(t)
              </text>
            </g>
          );
        }}
      </HillMap>
      <svg className="l17-drone-side" viewBox={`0 0 ${SIDE.w} ${SIDE.h}`} width={SIDE.w} height={SIDE.h} role="img" aria-label="The side view along the track: the hill, and the drone flying at the same height above it">
        <defs>
          <linearGradient id="l17-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dbeafe" />
            <stop offset="1" stopColor="#f8fafc" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={SIDE.w} height={SIDE.h} fill="url(#l17-sky)" />
        <polygon points={`${pts(GROUND_PTS)} ${SIDE.w - 14},${SIDE.h} 14,${SIDE.h}`} fill={GROUND} stroke="#6b7d55" strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points={pts(GROUND_PTS.map(([a, b]) => [a, b - ((GAP / (SIDE.z[1] - SIDE.z[0])) * (SIDE.h - 16))]))} fill="none" stroke={RED} strokeWidth="1.6" strokeDasharray="5 5" opacity="0.75" />
        <line x1={below[0]} y1={below[1]} x2={air[0]} y2={air[1] + 15} stroke="#6b7280" strokeWidth="1.2" strokeDasharray="2 3" />
        <DroneSide at={air} spin={PRINT ? 0 : clock * 6} />
        <text x="10" y="22" fontSize="14" fill="#374151" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>
          {`t = ${t.toFixed(1)}`}
        </text>
        <text x={SIDE.w - 10} y="22" fontSize="13" fill="#6b7280" textAnchor="end">
          side view
        </text>
      </svg>
    </div>
  );
}
