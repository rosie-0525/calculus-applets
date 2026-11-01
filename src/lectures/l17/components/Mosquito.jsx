import { useRef } from 'react';
import Space, { Seg3, Dot3, Label3, PlanePatch, Patch3 } from './Space.jsx';
import { INK } from './la.js';
import { PRINT } from './print.js';
import { useClock } from './clock.js';
import { spiral } from './Ladybug.jsx'; // the same spiral as the ladybug's (Example 5)

const T_END = 2 * Math.PI; // one turn of the spiral
const FLIGHT = 8; // seconds for the turn
const PERIOD = 11; // then a rest on the floor
const ROOM = [4.8, 5.4]; // the floor, 0 ≤ x ≤ 4.8, 0 ≤ y ≤ 5.4
// the loft bed against the wall x = 0, at the warm end of the room (large y)
const BED = { x: [0.15, 1.5], y: [3.3, 5.2], z: [4.3, 4.7], post: 5.1 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * A mosquito seen from the side, at `at`, facing along the screen direction `dir` (flipped to face
 * left or right, tilted by at most 35°); `flap` (0 to 1) beats its wings.
 */
function Bug({ at, dir, flap }) {
  const left = dir[0] < 0;
  const tilt = clamp((Math.atan2(dir[1], Math.abs(dir[0])) * 180) / Math.PI, -35, 35);
  const beat = 0.35 + 0.65 * Math.abs(Math.sin(flap * Math.PI));
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) scale(${left ? -1.6 : 1.6} 1.6) rotate(${tilt.toFixed(1)})`}>
      {/* the legs, long and thin, hanging down */}
      <g fill="none" stroke="#374151" strokeWidth="0.7" strokeLinecap="round">
        <path d="M 1 2 L -4 8 L -11 12" />
        <path d="M 2 2.4 L 1 9 L -2 15" />
        <path d="M 3 2 L 8 8 L 11 14" />
      </g>
      {/* the abdomen, striped, the thorax, the head and its proboscis */}
      <ellipse cx="-7" cy="1.2" rx="8" ry="2.3" fill="#4b5563" transform="rotate(8 -7 1.2)" />
      {[-11, -8, -5].map((x) => (
        <line key={x} x1={x} y1="-0.6" x2={x + 0.4} y2="3" stroke="#d1d5db" strokeWidth="0.8" />
      ))}
      <ellipse cx="1.8" cy="0" rx="3.6" ry="2.9" fill="#374151" />
      <circle cx="6.3" cy="0.6" r="2.1" fill="#1f2937" />
      <line x1="8.2" y1="1.2" x2="15" y2="3.4" stroke="#1f2937" strokeWidth="0.9" strokeLinecap="round" />
      {/* the wings, beating */}
      <g transform={`translate(0 -1.5) scale(1 ${beat.toFixed(2)})`}>
        <ellipse cx="-5" cy="-4" rx="8.5" ry="2.6" fill="rgba(203, 213, 225, 0.6)" stroke="#94a3b8" strokeWidth="0.6" transform="rotate(-18 -5 -4)" />
        <ellipse cx="-4" cy="-3" rx="7.5" ry="2.2" fill="rgba(226, 232, 240, 0.6)" stroke="#94a3b8" strokeWidth="0.5" transform="rotate(-32 -4 -3)" />
      </g>
    </g>
  );
}

/** The loft bed (its posts, frame and mattress) with a sleeper under a blanket, and the warmth round them. */
function Bed({ s }) {
  const { x, y, z, post } = BED;
  const posts = [
    [x[0], y[0]],
    [x[1], y[0]],
    [x[0], y[1]],
    [x[1], y[1]],
  ];
  const box = (x0, x1, y0, y1, z0, z1, fills) => {
    const top = [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    const front = [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]; // facing +x, toward the viewer
    const side = [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]; // facing +y
    return [side, front, top].map((c, k) => <Patch3 key={k} s={s} corners={c} fill={fills[k]} opacity={1} stroke="#6b4f3a" strokeWidth={0.8} strokeOpacity={0.7} />);
  };
  const head = s.P([0.8, 4.85, z[1] + 0.22]);
  const glow = s.P([0.8, 4.3, z[1]]);
  return (
    <g>
      <circle cx={glow[0]} cy={glow[1]} r={88} fill="url(#l17-warm)" />
      {posts.map(([px, py], k) => (
        <Seg3 key={k} s={s} from={[px, py, 0]} to={[px, py, post]} color="#8b6b4a" width={3} />
      ))}
      {box(x[0], x[1], y[0], y[1], z[0] - 0.12, z[0], ['#8b6b4a', '#9c7b59', '#a98763'])}
      {box(x[0] + 0.05, x[1] - 0.05, y[0] + 0.05, y[1] - 0.05, z[0], z[1], ['#e5e7eb', '#f3f4f6', '#ffffff'])}
      {/* the blanket over the sleeper, and the head on the pillow */}
      {box(x[0] + 0.12, x[1] - 0.1, y[0] + 0.15, 4.45, z[1], z[1] + 0.18, ['#2b6cb0', '#3b82c4', '#5b9bd5'])}
      <Patch3 s={s} corners={[[x[0] + 0.2, 4.55, z[1]], [x[1] - 0.2, 4.55, z[1]], [x[1] - 0.2, 5.1, z[1]], [x[0] + 0.2, 5.1, z[1]]]} fill="#f8fafc" opacity={1} stroke="#cbd5e1" />
      <circle cx={head[0]} cy={head[1]} r={8.5} fill="#e0b48f" stroke="#a87b5a" strokeWidth="0.8" />
      <path d={`M ${head[0] - 8} ${head[1] - 2} q 8 -11 16 0`} fill="#4b3621" />
      {['z', 'z', 'z'].map((c, k) => (
        <text key={k} x={head[0] + 12 + 9 * k} y={head[1] - 12 - 10 * k} fontSize={11 + 3 * k} fontWeight="700" fill="#64748b" fontStyle="italic">
          {c}
        </text>
      ))}
    </g>
  );
}

/**
 * Example 5, the mosquito: the bedroom's floor and a loft bed with a sleeper at the warm end
 * (large y, where T = xy + yz is large), the spiral p(t) for 0 ≤ t ≤ 2π from (4, 2, 0), and the
 * mosquito flying along it on a loop (at t = π in print, the time asked), with the dotted drop to
 * its shadow on the floor.
 */
export default function Mosquito({ width = 410, height = 430 }) {
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
        unit={43}
        center={[0.36, 0.8]}
        axisLen={[5.1, 5.7, 7]}
        az={-32}
        el={20}
        swing={6}
        title="A bedroom with a sleeper in a loft bed at its warm end, and a mosquito flying up a spiral from (4, 2, 0)"
      >
        {(s) => {
          const Q = s.P(P);
          const Q2 = s.P(spiral(t + 0.05));
          return (
            <g>
              <defs>
                <radialGradient id="l17-warm">
                  <stop offset="0" stopColor="#fb923c" stopOpacity="0.32" />
                  <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={[0, ROOM[0]]} range2={[0, ROOM[1]]} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
              <Bed s={s} />
              <polyline
                points={Array.from({ length: N + 1 }, (_, k) => s.P(spiral((T_END * k) / N)).map((v) => v.toFixed(1)).join(',')).join(' ')}
                fill="none"
                stroke={INK}
                strokeWidth="2"
              />
              <Dot3 s={s} at={[4, 2, 0]} color={INK} r={4} />
              <Label3 s={s} at={[4, 2, 0]} dx={10} dy={16} size={15} italic={false} color={INK}>
                (4, 2, 0)
              </Label3>
              <Seg3 s={s} from={P} to={[P[0], P[1], 0]} color="#6b7280" width={1.5} strokeDasharray="0.1 5" strokeLinecap="round" />
              <Dot3 s={s} at={[P[0], P[1], 0]} color="#9ca3af" r={3.5} />
              <Bug at={Q} dir={[Q2[0] - Q[0], Q2[1] - Q[1]]} flap={PRINT ? 0.5 : clock * 14} />
              <Label3 s={s} at={P} dx={16} dy={-12} size={17} color={INK} style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 }}>
                p(t)
              </Label3>
            </g>
          );
        }}
      </Space>
    </div>
  );
}
