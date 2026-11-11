import { mul, lerp, INK } from './ls.js';

// the corners (±1, ±1, ±1) of a cube, corner k = (bit 2, bit 1, bit 0) of k
const CORNERS = Array.from({ length: 8 }, (_, k) => [(k >> 2) & 1, (k >> 1) & 1, k & 1].map((b) => 2 * b - 1));
const EDGES = [];
for (let i = 0; i < 8; i += 1) for (let b = 0; b < 3; b += 1) if (!(i & (1 << b))) EDGES.push([i, i | (1 << b)]);
// the faces: bit `b` fixed at 0 or 1, the other two bits round the square
const FACES = [];
for (let b = 0; b < 3; b += 1) {
  const [p, q] = [0, 1, 2].filter((c) => c !== b);
  for (const v of [0, 1]) {
    const base = v << b;
    FACES.push([0, 1 << p, (1 << p) | (1 << q), 1 << q].map((m) => base | m));
  }
}

/**
 * A cube (corners ±`half`) moved by the linear map M as t goes from 0 to 1, each point p to
 * (1 − t)p + t Mp, so that at t = 1 it is the cube's image M(cube); its faces pale, drawn far to
 * near, its edges in `color`. `move(p, t)`, if given, moves the points instead (a rotation through
 * an angle t · θ). `view` maps world points to the Space's (VIEW for Example 1's pictures, where C(A)
 * is the floor). With `corner`, the cube is [0, corner]³, a corner at the origin (its edges from there
 * are along e₁, e₂, e₃), not ±`half`.
 */
export default function CubeMap({ s, M, t, move, half = 0.6, corner, view = (p) => p, color = INK, fill = '#b9c7dc', opacity = 0.32 }) {
  const pts = CORNERS.map((c) => {
    const p = c.map((x) => (corner ? ((x + 1) / 2) * corner : x * half));
    return view(move ? move(p, t) : lerp(p, mul(M, p), t));
  });
  const scr = pts.map((p) => s.P(p));
  const faces = FACES.map((f) => ({ f, d: f.reduce((acc, k) => acc + s.depth(pts[k]), 0) })).sort((a, b) => a.d - b.d);
  return (
    <g>
      {faces.map(({ f }, k) => (
        <polygon key={k} points={f.map((i) => scr[i].map((v) => v.toFixed(1)).join(',')).join(' ')} fill={fill} fillOpacity={opacity} stroke="none" />
      ))}
      {EDGES.map(([i, j], k) => (
        <line key={k} x1={scr[i][0]} y1={scr[i][1]} x2={scr[j][0]} y2={scr[j][1]} stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
      ))}
      {scr.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={3} fill={color} />
      ))}
    </g>
  );
}

export { CORNERS };
