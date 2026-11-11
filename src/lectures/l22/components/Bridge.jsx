import { useRef } from 'react';
import useClock from './useClock.js';
import { PRINT } from './print.js';

/**
 * A truss bridge with a truck crossing it (for Linear systems are everywhere): a Warren deck truss of
 * NP panels, pinned on the left abutment and on a roller on the right. Where the truck is, its axles
 * load the road's joints; the forces in the beams are the solution of the joints' balance equations
 * (2 per joint, 26 equations in the 23 beams' forces and the 3 forces of the supports), solved every
 * frame. A stretched beam is blue, a squeezed one red, thicker and darker the more force it carries;
 * gray with none. The truck crosses every 7 s while the slide is on screen; print: on the middle.
 */
const W = 360;
const H = 290;
const NP = 6;
const P = 50;
const X0 = 30;
const X1 = X0 + NP * P;
const YR = 158; // the road
const HT = 54; // the truss's depth

// the joints: the road's A₀ … A₆, then the lower ones under the middle of each panel
const JOINTS = [
  ...Array.from({ length: NP + 1 }, (_, i) => [X0 + i * P, YR]),
  ...Array.from({ length: NP }, (_, i) => [X0 + (i + 0.5) * P, YR + HT]),
];
const low = (i) => NP + 1 + i;
const BEAMS = [
  ...Array.from({ length: NP }, (_, i) => [i, i + 1]),
  ...Array.from({ length: NP - 1 }, (_, i) => [low(i), low(i + 1)]),
  ...Array.from({ length: NP }, (_, i) => [
    [i, low(i)],
    [low(i), i + 1],
  ]).flat(),
];

/** Solve M x = v by Gaussian elimination with partial pivoting. */
function solve(M, v) {
  const n = v.length;
  const A = M.map((row, i) => [...row, v[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      if (f) for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = A[r][n];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  return x;
}

// the balance equations: at each joint, the beams' pulls (tension positive), the supports' forces
// (A₀: both components; A₆: vertical) and the loads add up to 0
const NU = BEAMS.length + 3;
const MATRIX = Array.from({ length: 2 * JOINTS.length }, () => new Array(NU).fill(0));
BEAMS.forEach(([a, b], m) => {
  const [dx, dy] = [JOINTS[b][0] - JOINTS[a][0], JOINTS[b][1] - JOINTS[a][1]];
  const L = Math.hypot(dx, dy);
  MATRIX[2 * a][m] += dx / L;
  MATRIX[2 * a + 1][m] += dy / L;
  MATRIX[2 * b][m] -= dx / L;
  MATRIX[2 * b + 1][m] -= dy / L;
});
MATRIX[0][BEAMS.length] = 1;
MATRIX[1][BEAMS.length + 1] = 1;
MATRIX[2 * NP + 1][BEAMS.length + 2] = 1;

// the truck's axles: offsets from its middle and the share of its weight on each
const AXLES = [
  [-18, 0.7],
  [19, 0.3],
];

/** The forces in the beams with the truck's middle at x. */
function forces(x) {
  const load = new Array(2 * JOINTS.length).fill(0);
  for (const [dx, w] of AXLES) {
    const ax = x + dx;
    if (ax < X0 || ax > X1) continue;
    const i = Math.min(NP - 1, Math.floor((ax - X0) / P));
    const f = (ax - X0 - i * P) / P;
    load[2 * i + 1] += (1 - f) * w;
    load[2 * (i + 1) + 1] += f * w;
  }
  return solve(
    MATRIX,
    load.map((v) => -v),
  ).slice(0, BEAMS.length);
}

const FMAX = Math.max(...Array.from({ length: 61 }, (_, k) => Math.max(...forces(X0 + (k / 60) * (X1 - X0)).map(Math.abs))));

const STRETCH = [59, 110, 168];
const SQUEEZE = [180, 35, 35];
const REST = [175, 182, 192];
const mix = (c, k) => `rgb(${REST.map((v, i) => Math.round(v + (c[i] - v) * k)).join(',')})`;

function Truck({ x }) {
  const y = YR - 3;
  return (
    <g>
      <rect x={x - 34} y={y - 33} width={42} height={25} rx={2} fill="#e8ecf2" stroke="#14213d" strokeWidth="1.5" />
      <path d={`M ${x + 10} ${y - 8} V ${y - 27} H ${x + 21} L ${x + 28} ${y - 18} V ${y - 8} Z`} fill="#c2702a" stroke="#14213d" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`M ${x + 13} ${y - 24} H ${x + 20} L ${x + 24.5} ${y - 18} H ${x + 13} Z`} fill="#dbeafe" />
      {[x - 25, x - 12, x + 19].map((wx) => (
        <circle key={wx} cx={wx} cy={y - 5} r={5} fill="#14213d" stroke="#6b7280" strokeWidth="1.5" />
      ))}
    </g>
  );
}

export default function Bridge() {
  const ref = useRef(null);
  const t = useClock(ref, 0);
  const span = W + 90;
  const x = PRINT ? (X0 + X1) / 2 + 10 : -45 + ((t / 7) % 1) * span;
  const F = forces(x);
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="figure-svg l22-bridge" role="img" aria-label="A truck crossing a truss bridge, its beams coloured by the forces in them">
      <rect x={0} y={0} width={W} height={YR + 6} fill="#eef4fa" rx={10} />
      <rect x={X0} y={YR + HT + 22} width={X1 - X0} height={H - YR - HT - 22} fill="#bcd5ec" />
      {[1, -1].map((side) => {
        const e = side === 1 ? X0 : X1;
        const o = side === 1 ? 0 : W;
        return (
          <path
            key={side}
            d={`M ${o} ${YR + 2} H ${e - 11 * side} V ${YR + 12} H ${e + 9 * side} L ${e - 4 * side} ${H} H ${o} Z`}
            fill="#d8cdb8"
            stroke="#8a7d66"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        );
      })}
      <line x1={0} y1={YR} x2={X0 - 11} y2={YR} stroke="#4b5563" strokeWidth="4" />
      <line x1={X1 + 11} y1={YR} x2={W} y2={YR} stroke="#4b5563" strokeWidth="4" />
      <path d={`M ${X0} ${YR + 2} L ${X0 - 8} ${YR + 12} H ${X0 + 8} Z`} fill="#6b7280" />
      <path d={`M ${X1} ${YR + 2} L ${X1 - 7} ${YR + 8} H ${X1 + 7} Z`} fill="#6b7280" />
      <circle cx={X1 - 3.5} cy={YR + 10} r={2} fill="#6b7280" />
      <circle cx={X1 + 3.5} cy={YR + 10} r={2} fill="#6b7280" />
      {BEAMS.map(([a, b], m) => {
        const k = Math.min(1, Math.abs(F[m]) / FMAX);
        const c = F[m] > 0 ? STRETCH : SQUEEZE;
        return <line key={m} x1={JOINTS[a][0]} y1={JOINTS[a][1]} x2={JOINTS[b][0]} y2={JOINTS[b][1]} stroke={mix(c, Math.min(1, 0.15 + 1.1 * k))} strokeWidth={2.2 + 4.6 * k} strokeLinecap="round" />;
      })}
      {JOINTS.map(([jx, jy], j) => (
        <circle key={j} cx={jx} cy={jy} r={2.6} fill="#14213d" />
      ))}
      <Truck x={x} />
      <g fontSize="15" fontFamily="Source Sans 3, Helvetica, sans-serif" fontWeight="600">
        <line x1={62} y1={26} x2={84} y2={26} stroke={mix(STRETCH, 1)} strokeWidth="5" strokeLinecap="round" />
        <text x={91} y={31} fill={mix(STRETCH, 1)}>
          stretched
        </text>
        <line x1={196} y1={26} x2={218} y2={26} stroke={mix(SQUEEZE, 1)} strokeWidth="5" strokeLinecap="round" />
        <text x={225} y={31} fill={mix(SQUEEZE, 1)}>
          squeezed
        </text>
      </g>
    </svg>
  );
}
