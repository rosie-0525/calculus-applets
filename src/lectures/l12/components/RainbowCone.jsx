import { useState } from 'react';
import Space from './Space.jsx';
import { PRINT } from './print.js';
import { dot, plus, minus, times, norm } from './vec.js';
import { MAIN } from './svgmath.jsx';

const W = 380;
const H = 320;
const deg = Math.PI / 180;
const unitv = (a) => times(1 / norm(a), a);

// the eye at the origin, the ground below it; the sunlight comes from behind the person (−y),
// 12° down (a low sun, so that the bow stands tall): u is the direction it travels, and the axis of
// the rainbow's cone (the line from the sun through the eye on to the antisolar point C)
const E = [0, 0, 0];
const GROUND = -0.62;
const SUN_DOWN = 12 * deg;
const u = [0, Math.cos(SUN_DOWN), -Math.sin(SUN_DOWN)];
// the rain: a vertical curtain, the plane y = D. The rainbow is where the cone of half-angle 42°
// round the axis meets it (an upright arc; a circle as seen from the eye), one arc per colour, from
// red (42.4°) outside to violet (40.8°) inside; C, the antisolar point, is where the axis meets it
const D = 2.9;
const C = times(D / u[1], u);
const w = [1, 0, 0];
const v = [0, Math.sin(SUN_DOWN), Math.cos(SUN_DOWN)];
const onBow = (psi, angle = 42) => {
  const a = angle * deg;
  const d = plus(times(Math.cos(a), u), times(Math.sin(a), plus(times(Math.cos(psi), w), times(Math.sin(psi), v))));
  return times(D / d[1], d);
};
const COLORS = [
  [42.4, '#ff3b30'],
  [42.2, '#ff9500'],
  [42.08, '#ffd60a'],
  [41.8, '#34c759'],
  [41.5, '#0a84ff'],
  [41.15, '#5856d6'],
  [40.8, '#af52de'],
];
// the part above the ground: from psi0, where the red arc meets it (its height rises with sin psi),
// round to π − psi0
const PSI = (() => {
  let [lo, hi] = [-Math.PI / 2, Math.PI / 2];
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2;
    if (onBow(mid, 42.4)[2] < GROUND) lo = mid;
    else hi = mid;
  }
  return [hi, Math.PI - hi];
})();
const arcPts = (angle, n = 90) => Array.from({ length: n + 1 }, (_, k) => onBow(PSI[0] + ((PSI[1] - PSI[0]) * k) / n, angle));
// the drop on the bow, lit by its ray of sunlight and sending light to the eye: dragged along the
// bow (between its feet), from the top; in print mode it stays there
const PSI0 = 90 * deg;
const DRAG = [PSI[0] + 5 * deg, PSI[1] - 5 * deg];

// rain: short streaks scattered over the curtain (deterministic)
const RAIN = (() => {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 60 }, () => {
    const p = [-2.4 + rnd() * 6, D, GROUND + 0.4 + rnd() * 2.2];
    return [p, plus(p, [0, 0, -0.32])];
  }).filter(([p, q]) => q[2] > GROUND);
})();

// a farmhouse under the bow, a tree beside it, a tree in front, and a dirt path to the house (on the
// ground; placed for the view, az 64°, el 12°)
const HOUSE = { at: [1.0, 2.55], a: 0.5, b: 0.42, h: 0.28, r: 0.2 };
const TREE_BY_HOUSE = [1.65, 2.62, GROUND];
const TREE_IN_FRONT = [0.68, -4.4, GROUND];
const PATH = (() => {
  const P0 = [4.84, -4.3];
  const P1 = [2.9, 0];
  const P2 = [1.0, 2.33];
  const n = 24;
  const left = [];
  const right = [];
  for (let k = 0; k <= n; k += 1) {
    const t = k / n;
    const p = [0, 1].map((i) => (1 - t) ** 2 * P0[i] + 2 * t * (1 - t) * P1[i] + t * t * P2[i]);
    const d = unitv([0, 1].map((i) => 2 * (1 - t) * (P1[i] - P0[i]) + 2 * t * (P2[i] - P1[i])));
    const half = (0.42 * (1 - t) + 0.1 * t) / 2; // narrower far away
    left.push([p[0] - half * d[1], p[1] + half * d[0], GROUND]);
    right.push([p[0] + half * d[1], p[1] - half * d[0], GROUND]);
  }
  return [...left, ...right.reverse()];
})();

/** The angle at the drop p between the line back to the sun and the ray to the eye: an arc, its label. */
function angleAt(p) {
  const a = times(-1, u);
  const b = unitv(minus(E, p));
  const bp = unitv(minus(b, times(dot(b, a), a))); // b's part across a
  const dir = (t) => plus(times(Math.cos(t), a), times(Math.sin(t), bp));
  const theta = Math.acos(dot(a, b));
  return {
    arc: Array.from({ length: 13 }, (_, k) => plus(p, times(0.36, dir((theta * k) / 12)))),
    label: plus(p, times(0.82, dir(theta / 2))),
  };
}

/** The farmhouse: its walls and gable roof (the faces turned to the viewer, back to front), a door and windows. */
function House({ s, pts }) {
  const { at: [hx, hy], a, b, h, r } = HOUSE;
  const [x0, x1, y0, y1] = [hx - a / 2, hx + a / 2, hy - b / 2, hy + b / 2];
  const [g, top, ridge] = [GROUND, GROUND + h, GROUND + h + r];
  const o = 0.04; // the roof's overhang
  const view = [Math.cos(s.az * deg) * Math.cos(s.el * deg), -Math.sin(s.az * deg) * Math.cos(s.el * deg), Math.sin(s.el * deg)];
  const light = times(-1, u);
  const shade = (n, lit, dark) => (dot(unitv(n), light) > 0.45 ? lit : dark);
  const faces = [
    { n: [0, -1, 0], c: [[x0, y0, g], [x1, y0, g], [x1, y0, top], [hx, y0, ridge], [x0, y0, top]], wall: true },
    { n: [0, 1, 0], c: [[x0, y1, g], [x1, y1, g], [x1, y1, top], [hx, y1, ridge], [x0, y1, top]], wall: true },
    { n: [1, 0, 0], c: [[x1, y0, g], [x1, y1, g], [x1, y1, top], [x1, y0, top]], wall: true },
    { n: [-1, 0, 0], c: [[x0, y0, g], [x0, y1, g], [x0, y1, top], [x0, y0, top]], wall: true },
    { n: [r, 0, a / 2], c: [[x1 + o, y0 - o, top - o * 0.8], [x1 + o, y1 + o, top - o * 0.8], [hx, y1 + o, ridge], [hx, y0 - o, ridge]] },
    { n: [-r, 0, a / 2], c: [[x0 - o, y0 - o, top - o * 0.8], [x0 - o, y1 + o, top - o * 0.8], [hx, y1 + o, ridge], [hx, y0 - o, ridge]] },
  ]
    .filter((f) => dot(f.n, view) > 0)
    .map((f) => ({ ...f, depth: f.c.reduce((sum, q) => sum + s.depth(q), 0) / f.c.length }))
    .sort((p, q) => p.depth - q.depth);
  // the door and a window on the front (−y), two windows on the side (+x), slightly out from the walls
  const front = (u0, u1, z0, z1) => [[u0, y0 - 0.002, z0], [u1, y0 - 0.002, z0], [u1, y0 - 0.002, z1], [u0, y0 - 0.002, z1]];
  const side = (v0, v1, z0, z1) => [[x1 + 0.002, v0, z0], [x1 + 0.002, v1, z0], [x1 + 0.002, v1, z1], [x1 + 0.002, v0, z1]];
  const shows = (n) => dot(n, view) > 0;
  return (
    <g strokeLinejoin="round">
      {faces.map((f, k) => (
        <polygon
          key={k}
          points={pts(f.c)}
          fill={f.wall ? shade(f.n, '#f7ecd8', '#d8c6a6') : shade(f.n, '#b84a33', '#93392a')}
          stroke="#5b4636"
          strokeWidth="0.6"
        />
      ))}
      {shows([0, -1, 0]) && (
        <g>
          <polygon points={pts(front(hx - 0.05, hx + 0.05, g, g + 0.17))} fill="#6b4a32" />
          <polygon points={pts(front(x0 + 0.05, x0 + 0.13, g + 0.12, g + 0.2))} fill="#ffd98a" stroke="#fff" strokeWidth="0.6" />
        </g>
      )}
      {shows([1, 0, 0]) && (
        <g fill="#ffd98a" stroke="#fff" strokeWidth="0.6">
          <polygon points={pts(side(y0 + 0.07, y0 + 0.15, g + 0.11, g + 0.2))} />
          <polygon points={pts(side(y1 - 0.15, y1 - 0.07, g + 0.11, g + 0.2))} />
        </g>
      )}
    </g>
  );
}

/** A tree, its foot at the screen point `at`, `size` times its 44 px; lit from the upper left. */
function Tree({ at: [x, y], size }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${size})`}>
      <ellipse cx="9" cy="0.5" rx="15" ry="2.6" fill="#1f3d1f" opacity="0.28" />
      <path d="M-2.2,0 C-1.6,-6 -1.4,-12 -1.2,-17 L1.4,-17 C1.6,-12 1.8,-6 2.6,0 Z" fill="#6b4a32" />
      <path d="M-0.4,-15 L-5,-21 M0.6,-16 L4.6,-22" stroke="#6b4a32" strokeWidth="1.3" strokeLinecap="round" />
      <g fill="url(#l12-cone-leaves)">
        <circle cx="-7" cy="-24" r="8.5" />
        <circle cx="7" cy="-25" r="9" />
        <circle cx="0" cy="-33" r="10" />
        <circle cx="-1" cy="-23" r="8" />
      </g>
      <ellipse cx="2" cy="-20" rx="11" ry="4" fill="#24502a" opacity="0.35" />
    </g>
  );
}

/**
 * The person (a cartoon, seen from behind), pointing at the rainbow: feet on the ground, head at
 * the eye, `k` px per unit of their 36 from feet to eye.
 */
function Person({ feet: [x, y], k }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})`} strokeLinecap="round">
      <path d="M-4.8,-17 L-4.3,-1.6 L-1.2,-1.6 L-0.5,-17 Z" fill="#33507f" />
      <path d="M0.5,-17 L1.3,-1.6 L4.4,-1.6 L4.8,-17 Z" fill="#2a4470" />
      <ellipse cx="-2.9" cy="-0.9" rx="2.9" ry="1.4" fill="#3b2b21" />
      <ellipse cx="3.1" cy="-0.9" rx="2.9" ry="1.4" fill="#3b2b21" />
      <path d="M-5.2,-28.5 Q-8,-23.5 -7.4,-18.5" stroke="#b9443c" strokeWidth="3.3" fill="none" />
      <circle cx="-7.4" cy="-17.9" r="1.5" fill="#efc08a" />
      <path d="M-6.2,-29.8 Q-6.8,-22 -5.8,-15.6 L5.8,-15.6 Q6.8,-22 6.2,-29.8 Q0,-33 -6.2,-29.8 Z" fill="#d9534f" />
      <path d="M-1,-30.5 L-1,-16" stroke="#b9443c" strokeWidth="0.8" />
      <path d="M4.6,-28.6 L12.6,-37.4" stroke="#d9534f" strokeWidth="3.3" />
      <circle cx="13.2" cy="-38.1" r="1.6" fill="#efc08a" />
      <rect x="-1.4" y="-33.2" width="2.8" height="2.6" fill="#d9a46c" />
      <circle cx="0.3" cy="-36.6" r="4.7" fill="#efc08a" />
      <path d="M-4.4,-35 C-5.4,-39.4 -2,-42.2 1.6,-41.4 C4,-40.8 5.2,-39.2 4.9,-37.4 C3.4,-38.4 2.2,-37.4 1.6,-35.6 C1,-33.6 -0.8,-32.6 -2.6,-32.8 C-3.6,-33.2 -4.2,-34 -4.4,-35 Z" fill="#4a3426" />
    </g>
  );
}

/**
 * Why do rainbows form arcs? (Constrained optimization problems), in 3-D (Space.jsx, its view
 * fixed, at the user's request, so that nothing leaves the flat ground): a person on a meadow, pointing at a rainbow over a farmhouse, a
 * tree beside it and one in front, a dirt path to the house, rain clouds and rain on the right.
 * The sunlight comes from behind the person, from beyond the left edge (no sun in the picture), in
 * parallel shafts; the line of it through their eye goes on (dashed) to the antisolar point C. The
 * rainbow is where the cone of half-angle 42° round that line (a faint fan from the eye) meets a
 * vertical curtain of rain: an upright arc (a first version, a circle in the plane perpendicular to
 * the line, looked tilted back), seen nearly face-on. A drop on the bow, lit by its own ray of sunlight (parallel to the rest, golden), sends
 * its light (white) to the eye at 42° to the sunlight; press and drag to move it along the bow, and
 * the angle stays 42°, as the sunlight is parallel. Sky, hills and meadow are drawn flat (an orthographic view has
 * no horizon), at the height of the bow's far foot.
 */
export default function RainbowCone() {
  const [psi, setPsi] = useState(PSI0);
  const drop = onBow(psi);
  return (
    <Space
      width={W}
      height={H}
      unit={60}
      center={[0.3, 0.7]}
      az={64}
      el={12}
      rock={false}
      drag={false}
      axes={false}
      className="l12-landscape"
      title="A rainbow in 3-D over a farmhouse: sunlight in parallel shafts from behind a person who points at the rainbow, a circle round the line of the sunlight through their eye; three drops on the bow, each lit by a parallel ray of sunlight, send light to the eye at 42 degrees to the sunlight"
    >
      {(s) => {
        const pts = (list) => list.map((p) => s.P(p).map((c) => c.toFixed(1)).join(',')).join(' ');
        const line = (p, q, props, key) => {
          const [x1, y1] = s.P(p);
          const [x2, y2] = s.P(q);
          return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} {...props} />;
        };
        const bow = arcPts(42);
        // the sunlight's direction on the screen, and how far back up it a point's ray starts (at the
        // left edge, so that the light comes from beyond it)
        const o = s.P(E);
        const step = minus(s.P(u), o);
        const back = (p) => (step[0] > 4 ? Math.max(1, (s.P(p)[0] + 8) / step[0]) : 3.4);
        const dirScreen = unitv(step);
        const across = [-dirScreen[1], dirScreen[0]];
        // parallel shafts of light from the left edge, at these heights there, these wide
        const SHAFTS = [
          [28, 30],
          [74, 14],
          [122, 38],
          [176, 16],
          [236, 28],
        ];
        const shaft = (y0, wd) => {
          const p0 = [-10, y0];
          const p1 = plus(p0, times(460, dirScreen));
          const a0 = times(wd * 0.35, across);
          const a1 = times(wd, across);
          return [plus(p0, a0), plus(p1, a1), minus(p1, a1), minus(p0, a0)].map((q) => q.map((c) => c.toFixed(1)).join(',')).join(' ');
        };
        const feet = s.P([0, 0, GROUND]);
        const k = (feet[1] - o[1]) / 36;
        const move = (e) => {
          if (PRINT || (!(e.buttons & 1) && e.type !== 'pointerdown')) return;
          if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
          const box = e.currentTarget.ownerSVGElement.getBoundingClientRect();
          const x = ((e.clientX - box.left) / box.width) * W;
          const y = ((e.clientY - box.top) / box.height) * H;
          let best = psi;
          let near = Infinity;
          for (let i = 0; i <= 160; i += 1) {
            const t = DRAG[0] + ((DRAG[1] - DRAG[0]) * i) / 160;
            const [px, py] = s.P(onBow(t));
            const d = (px - x) ** 2 + (py - y) ** 2;
            if (d < near) [near, best] = [d, t];
          }
          setPsi(best);
        };
        return (
          <g>
            <defs>
              <clipPath id="l12-cone-clip">
                <rect width={W} height={H} rx="10" />
              </clipPath>
              <linearGradient id="l12-cone-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6c90bf" />
                <stop offset="0.5" stopColor="#b7cde0" />
                <stop offset="0.66" stopColor="#efdcb8" />
              </linearGradient>
              <linearGradient id="l12-cone-storm" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0.35" stopColor="#4b5a70" stopOpacity="0" />
                <stop offset="0.8" stopColor="#4b5a70" stopOpacity="0.45" />
                <stop offset="1" stopColor="#3b475a" stopOpacity="0.6" />
              </linearGradient>
              {/* warm light beyond the left edge */}
              <radialGradient id="l12-cone-source" cx="-0.12" cy="0.4" r="0.7">
                <stop offset="0" stopColor="#fff2c8" stopOpacity="0.85" />
                <stop offset="0.5" stopColor="#ffe3a0" stopOpacity="0.25" />
                <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="l12-cone-shaft" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={380 * dirScreen[0]} y2={380 * dirScreen[1]}>
                <stop offset="0" stopColor="#fff3cc" stopOpacity="0.42" />
                <stop offset="0.6" stopColor="#fff3cc" stopOpacity="0.12" />
                <stop offset="1" stopColor="#fff3cc" stopOpacity="0" />
              </linearGradient>
              <filter id="l12-cone-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter id="l12-cone-mist" x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <filter id="l12-cone-halo" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
              <linearGradient id="l12-cone-far" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#93b6ab" />
                <stop offset="1" stopColor="#7ea494" />
              </linearGradient>
              <linearGradient id="l12-cone-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#86b566" />
                <stop offset="0.5" stopColor="#6aa152" />
                <stop offset="1" stopColor="#467f3c" />
              </linearGradient>
              <radialGradient id="l12-cone-leaves" cx="0.35" cy="0.3" r="0.75">
                <stop offset="0" stopColor="#9acb6e" />
                <stop offset="0.55" stopColor="#4c8a3c" />
                <stop offset="1" stopColor="#2f6330" />
              </radialGradient>
              {/* the drop's ray of sunlight brightens on its way to it */}
              <linearGradient
                id="l12-cone-beam"
                gradientUnits="userSpaceOnUse"
                x1={s.P(minus(drop, times(back(drop), u)))[0]}
                y1={s.P(minus(drop, times(back(drop), u)))[1]}
                x2={s.P(drop)[0]}
                y2={s.P(drop)[1]}
              >
                <stop offset="0" stopColor="#fff4c8" stopOpacity="0" />
                <stop offset="0.45" stopColor="#fff4c8" stopOpacity="0.75" />
                <stop offset="1" stopColor="#fff8dc" />
              </linearGradient>
              <linearGradient id="l12-cone-beam-eye" gradientUnits="userSpaceOnUse" x1={s.P(minus(E, times(back(E), u)))[0]} y1={s.P(minus(E, times(back(E), u)))[1]} x2={o[0]} y2={o[1]}>
                <stop offset="0" stopColor="#ffd36b" stopOpacity="0" />
                <stop offset="1" stopColor="#ffd36b" />
              </linearGradient>
            </defs>
            <g clipPath="url(#l12-cone-clip)">
              {/* sky; the rain side darker under rain clouds; soft clouds on the left; light beyond the left edge */}
              <rect width={W} height={H} fill="url(#l12-cone-sky)" />
              <rect width={W} height={H} fill="url(#l12-cone-storm)" />
              <g filter="url(#l12-cone-blur)" fill="#56647a" opacity="0.8">
                <ellipse cx="300" cy="14" rx="130" ry="30" />
                <ellipse cx="372" cy="50" rx="60" ry="34" />
              </g>
              <g filter="url(#l12-cone-blur)" fill="#fdf3dc" opacity="0.7">
                <ellipse cx="40" cy="22" rx="60" ry="12" />
                <ellipse cx="128" cy="44" rx="40" ry="8" />
              </g>
              <rect width={W} height={H} fill="url(#l12-cone-source)" />

              {/* far hills, with trees on them, and the meadow */}
              <path d="M0,212 C60,204 120,210 180,205 C240,200 300,208 380,203 L380,320 L0,320 Z" fill="url(#l12-cone-far)" />
              <g opacity="0.75">
                {[
                  [12, 212, 0.34],
                  [23, 211, 0.28],
                  [318, 206, 0.32],
                  [332, 207, 0.26],
                ].map(([x, y, size]) => (
                  <Tree key={x} at={[x, y]} size={size} />
                ))}
              </g>
              <path d="M0,232 C70,225 150,227 220,231 C280,235 330,228 380,230 L380,320 L0,320 Z" fill="url(#l12-cone-ground)" />

              {/* rain, the bow (with a soft glow), and the cone from the eye */}
              <g stroke="#64748b" strokeOpacity="0.35" strokeWidth="1">
                {RAIN.map(([p, q], i) => line(p, q, {}, i))}
              </g>
              <g fill="none" strokeWidth="4" opacity="0.35" filter="url(#l12-cone-halo)">
                {COLORS.map(([a, c]) => (
                  <polyline key={c} points={pts(arcPts(a))} stroke={c} />
                ))}
              </g>
              <g fill="none" strokeWidth="2.4" opacity="0.9">
                {COLORS.map(([a, c]) => (
                  <polyline key={c} points={pts(arcPts(a))} stroke={c} />
                ))}
              </g>
              <polygon points={pts([E, ...bow])} fill="#fff" fillOpacity="0.1" />

              {/* the path, the farmhouse and the tree beside it */}
              <polygon points={pts(PATH)} fill="#d8c294" opacity="0.9" />
              <House s={s} pts={pts} />
              <Tree at={s.P(TREE_BY_HOUSE)} size={0.85} />

              {/* parallel shafts of sunlight from beyond the left edge */}
              <g fill="url(#l12-cone-shaft)" filter="url(#l12-cone-mist)">
                {SHAFTS.map(([y0, wd]) => (
                  <polygon key={y0} points={shaft(y0, wd)} />
                ))}
              </g>

              {/* the line of the sunlight through the eye, on to C */}
              {line(minus(E, times(back(E), u)), E, { stroke: 'url(#l12-cone-beam-eye)', strokeWidth: 2 })}
              {line(E, C, { stroke: '#fff', strokeWidth: 1.4, strokeDasharray: '4 4' })}

              {/* the drop: its ray of sunlight, its light to the eye, the angle 42° between them */}
              {[drop].map((p) => {
                const { arc, label } = angleAt(p);
                const [lx, ly] = s.P(label);
                const from = minus(p, times(back(p), u));
                return (
                  <g key="drop">
                    {line(from, p, { stroke: 'url(#l12-cone-beam)', strokeWidth: 6, opacity: 0.45, filter: 'url(#l12-cone-halo)' })}
                    {line(from, p, { stroke: 'url(#l12-cone-beam)', strokeWidth: 2.2, strokeLinecap: 'round' })}
                    {line(p, E, { stroke: '#fff', strokeWidth: 1.6 })}
                    <polyline points={pts(arc)} fill="none" stroke="#fff" strokeWidth="1.8" />
                    <circle cx={s.P(p)[0]} cy={s.P(p)[1]} r="4.6" fill="#dbeafe" stroke="#fff" strokeWidth="1.4" />
                    <text
                      x={lx}
                      y={ly + 5}
                      textAnchor="middle"
                      fontFamily={MAIN}
                      fontSize="15"
                      fontWeight="700"
                      fill="#fff"
                      stroke="#1f2937"
                      strokeWidth="3"
                      paintOrder="stroke"
                      strokeLinejoin="round"
                    >
                      42°
                    </text>
                  </g>
                );
              })}

              {/* the person, their shadow along the sunlight; the tree in front */}
              {line([0, 0, GROUND], [0, 0.6, GROUND], { stroke: '#1f2937', strokeOpacity: 0.22, strokeWidth: 5, strokeLinecap: 'round', filter: 'url(#l12-cone-halo)' })}
              <Person feet={feet} k={k} />
              <Tree at={s.P(TREE_IN_FRONT)} size={1.8} />

              {/* press and drag anywhere: the drop goes to the point of the bow nearest the pointer */}
              <rect width={W} height={H} fill="transparent" className="l12-cone-drag" data-prevent-swipe onPointerDown={move} onPointerMove={move} />
            </g>
          </g>
        );
      }}
    </Space>
  );
}
