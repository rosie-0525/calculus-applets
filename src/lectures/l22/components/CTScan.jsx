import { useRef } from 'react';
import useClock from './useClock.js';

/**
 * A CT scanner, in cross-section (for Linear systems are everywhere): a head, as a grid of pixels in
 * gray (bone light, brain darker), inside the scanner's ring; an X-ray source on the ring sends a fan
 * of beams through the head to the detectors opposite, and each beam's reading, the total density
 * along it, is a bar outside the ring. The source and the detectors turn round the head (a turn
 * every 11 s) while the slide is on screen; print: a still at the angle `still`.
 */
const W = 360;
const H = 290;
const C = [W / 2, H / 2];
const R = 100; // the ring: the source and the detectors
const U = 74; // px per unit of the head
const N = 24; // pixels across
const BEAMS = 19;
const FAN = 0.78; // the fan's half-angle, in radians

// the head, a simplified Shepp–Logan phantom: ellipses [x, y, a, b, tilt (deg), density added]
const ELLIPSES = [
  [0, 0, 0.69, 0.92, 0, 1],
  [0, -0.02, 0.6, 0.82, 0, -0.72],
  [0.2, 0.02, 0.1, 0.28, -18, -0.16],
  [-0.21, 0.02, 0.14, 0.36, 18, -0.16],
  [0, 0.42, 0.18, 0.2, 0, 0.12],
  [0.12, -0.5, 0.08, 0.06, 0, 0.3],
];

function density(x, y) {
  let d = 0;
  for (const [x0, y0, a, b, deg, v] of ELLIPSES) {
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);
    const u = (x - x0) * c + (y - y0) * s;
    const w = -(x - x0) * s + (y - y0) * c;
    if ((u / a) ** 2 + (w / b) ** 2 <= 1) d += v;
  }
  return d;
}

// the pixels: each one's density, averaged over 4 × 4 points in it
const PX = 2 / N;
const PIXELS = [];
for (let i = 0; i < N; i++) {
  for (let j = 0; j < N; j++) {
    let d = 0;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) d += density(-1 + (j + (a + 0.5) / 4) * PX, 1 - (i + (b + 0.5) / 4) * PX);
    d /= 16;
    if (d > 0.01) PIXELS.push({ i, j, d });
  }
}
const gray = (d) => {
  const g = Math.round(55 + 200 * Math.min(1, d) ** 0.75);
  return `rgb(${g},${g},${g})`;
};

/** The fan of beams from the source at angle th, each from the source to the ring and its reading. */
function fan(th) {
  const S = [C[0] + R * Math.cos(th), C[1] + R * Math.sin(th)];
  return Array.from({ length: BEAMS }, (_, k) => {
    const al = -FAN + (2 * FAN * k) / (BEAMS - 1);
    const dir = [-Math.cos(th + al), -Math.sin(th + al)];
    const len = 2 * R * Math.cos(al);
    const E = [S[0] + len * dir[0], S[1] + len * dir[1]];
    let sum = 0;
    const steps = 90;
    for (let q = 0; q < steps; q++) {
      const t = ((q + 0.5) / steps) * len;
      sum += density((S[0] + t * dir[0] - C[0]) / U, -(S[1] + t * dir[1] - C[1]) / U);
    }
    return { S, E, reading: (sum * len) / steps / U };
  });
}

const MAXREAD = Math.max(...Array.from({ length: 24 }, (_, k) => Math.max(...fan((k * Math.PI) / 12).map((b) => b.reading))));

export default function CTScan({ still = 0.9 }) {
  const ref = useRef(null);
  const t = useClock(ref, 0);
  const th = still + 0.57 * t;
  const beams = fan(th);
  const out = (P) => [(P[0] - C[0]) / R, (P[1] - C[1]) / R];
  const deg = (th * 180) / Math.PI;
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="figure-svg l22-ct" role="img" aria-label="A CT scanner: X-ray beams through a head, each beam's reading at the detectors">
      <circle cx={C[0]} cy={C[1]} r={R} fill="#141a26" />
      <g transform={`translate(${C[0] - U} ${C[1] - U})`}>
        {PIXELS.map(({ i, j, d }) => (
          <rect key={`${i}-${j}`} x={j * PX * U} y={i * PX * U} width={PX * U + 0.3} height={PX * U + 0.3} fill={gray(d)} />
        ))}
      </g>
      <circle cx={C[0]} cy={C[1]} r={R + 5} fill="none" stroke="#d6dbe3" strokeWidth="10" />
      {beams.map(({ S, E }, k) => (
        <line key={k} x1={S[0]} y1={S[1]} x2={E[0]} y2={E[1]} stroke="#fbbf24" strokeOpacity="0.55" strokeWidth="1.3" />
      ))}
      {beams.map(({ E, reading }, k) => {
        const [ox, oy] = out(E);
        const L = 4 + 26 * (reading / MAXREAD);
        return <line key={k} x1={E[0] + 11 * ox} y1={E[1] + 11 * oy} x2={E[0] + (11 + L) * ox} y2={E[1] + (11 + L) * oy} stroke="#c2702a" strokeWidth="4.2" strokeLinecap="round" />;
      })}
      <path
        d={`M ${C[0] + (R + 5) * Math.cos(th + Math.PI - 2 * FAN - 0.04)} ${C[1] + (R + 5) * Math.sin(th + Math.PI - 2 * FAN - 0.04)} A ${R + 5} ${R + 5} 0 ${4 * FAN + 0.08 > Math.PI ? 1 : 0} 1 ${C[0] + (R + 5) * Math.cos(th + Math.PI + 2 * FAN + 0.04)} ${C[1] + (R + 5) * Math.sin(th + Math.PI + 2 * FAN + 0.04)}`}
        fill="none"
        stroke="#4b5563"
        strokeWidth="10"
      />
      <g transform={`translate(${C[0] + (R + 5) * Math.cos(th)} ${C[1] + (R + 5) * Math.sin(th)}) rotate(${deg})`}>
        <rect x={-9} y={-13} width={22} height={26} rx={4} fill="#14213d" />
        <circle cx={-6} cy={0} r={3} fill="#fbbf24" />
      </g>
    </svg>
  );
}
