import { MAIN } from './svgmath.jsx';

/**
 * Cartoons of processes from real life, for Which can be undone? (Slide02aLife). Each draws, in a
 * 300 × 170 box, its process `p` of the way through (0 ≤ p ≤ 1); the ones that can be undone run
 * backward as p goes back to 0. `time` (seconds) moves what goes on regardless (the rain).
 */
export const CW = 300;
export const CH = 170;

const clamp = (k) => Math.min(1, Math.max(0, k));
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};
const f = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/* ---- Breaking an egg: it falls into a pan, cracks, the shell flies apart, the egg spreads ---- */
const EGG = 'M 0 -23 C 13 -23 18 -4 18 5 C 18 16 10 23 0 23 C -10 23 -18 16 -18 5 C -18 -4 -13 -23 0 -23 Z';
const CRACK = 'M -18 5 L -12 1 L -6 7 L 0 1 L 6 7 L 12 1 L 18 5';
const TOP_HALF = `M -18 5 C -18 -4 -13 -23 0 -23 C 13 -23 18 -4 18 5 L 12 1 L 6 7 L 0 1 L -6 7 L -12 1 Z`;
const BOTTOM_HALF = `${CRACK} C 18 16 10 23 0 23 C -10 23 -18 16 -18 5 Z`;
const WHITE = Array.from({ length: 48 }, (_, k) => {
  const a = (2 * Math.PI * k) / 48;
  const r = 1 + 0.1 * Math.sin(3 * a + 0.5) + 0.06 * Math.cos(5 * a);
  return `${(52 * r * Math.cos(a)).toFixed(1)},${(15 * r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export function Egg({ p }) {
  const fall = seg(p, 0, 0.35);
  const y = 22 + 93 * fall * fall;
  const crack = seg(p, 0.33, 0.42);
  const split = ease(seg(p, 0.42, 0.75));
  const spread = ease(seg(p, 0.42, 0.9));
  const shell = { fill: '#fbf3e2', stroke: '#d9c7a3', strokeWidth: 1.5, strokeLinejoin: 'round' };
  return (
    <g>
      <rect x={228} y={131} width={64} height={11} rx={5} fill="#1f2937" />
      <ellipse cx={150} cy={140} rx={96} ry={24} fill="#374151" />
      <ellipse cx={150} cy={137} rx={86} ry={19} fill="#4b5563" />
      {spread > 0 && (
        <g transform={`translate(150 137) scale(${spread})`}>
          <polygon points={WHITE} fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
          <ellipse cx={-6} cy={-3} rx={14} ry={8.5} fill="#f6b21b" />
          <ellipse cx={-10} cy={-6} rx={4} ry={2.2} fill="#fff" opacity="0.6" />
        </g>
      )}
      {p < 0.42 ? (
        <g transform={`translate(150 ${y.toFixed(1)})`}>
          <path d={EGG} {...shell} />
          <path d={CRACK} fill="none" stroke="#8b7355" strokeWidth="1.6" opacity={crack} />
        </g>
      ) : (
        <g>
          <path d={TOP_HALF} {...shell} transform={`translate(${150 - 58 * split} ${115 - 40 * split + 30 * split * split}) rotate(${-80 * split})`} />
          <path d={BOTTOM_HALF} {...shell} transform={`translate(${150 + 58 * split} ${115 - 22 * split + 26 * split * split}) rotate(${70 * split})`} />
        </g>
      )}
    </g>
  );
}

/* ---- Opening an umbrella in the rain: the canopy (red and white panels) spreads; no rain under it ---- */
const DROPS = Array.from({ length: 13 }, (_, k) => ({ x: 14 + k * 23 + (k % 3) * 4, phase: (k * 53) % 180 }));
const TOP = 36;

export function Umbrella({ p, time }) {
  const o = ease(p);
  const w = 11 + 99 * o;
  const yb = 112 - 34 * o;
  const us = [-1, -0.5, 0, 0.5, 1];
  const end = (u) => [150 + w * u, yb + 8 * o * (1 - u * u)];
  const c1 = (u) => [150 + 0.5 * w * u, TOP];
  const c2 = (u) => [150 + w * u, end(u)[1] - 50 * o];
  const panel = (a, b) => {
    const [ea, eb] = [end(a), end(b)];
    const mid = [(ea[0] + eb[0]) / 2, (ea[1] + eb[1]) / 2 - 9 * o];
    return `M 150 ${TOP} C ${f(c1(a))} ${f(c2(a))} ${f(ea)} Q ${f(mid)} ${f(eb)} C ${f(c2(b))} ${f(c1(b))} 150 ${TOP} Z`;
  };
  return (
    <g>
      {DROPS.map((d, k) => {
        const y = ((d.phase + time * 140) % 180) - 10;
        if (o > 0.5 && Math.abs(d.x - 150) < w - 4 && y > yb - 8) return null;
        return <line key={k} x1={d.x} y1={y} x2={d.x - 2} y2={y + 9} stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />;
      })}
      <line x1={150} y1={TOP - 8} x2={150} y2={150} stroke="#4b5563" strokeWidth="3" />
      <path d="M 150 150 q 0 14 -10 14 q -9 0 -9 -8" fill="none" stroke="#7c2d12" strokeWidth="4.5" strokeLinecap="round" />
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={panel(us[k], us[k + 1])} fill={k % 2 ? '#f8fafc' : '#c0392b'} stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
      ))}
      <circle cx={150} cy={TOP - 8} r={3} fill="#4b5563" />
    </g>
  );
}

/* ---- Stirring milk into coffee, seen from above: a drop of milk, a white swirl, then latte ---- */
export function Coffee({ p }) {
  const [cx, cy] = [136, 88];
  const pour = seg(p, 0, 0.18);
  const turn = 4 * Math.PI * ease(seg(p, 0.15, 1));
  const arm = 5 * Math.PI * ease(seg(p, 0.15, 0.6));
  const milk = 1 - ease(seg(p, 0.5, 1));
  const latte = ease(seg(p, 0.35, 1));
  const blob = 16 * pour * (1 - ease(seg(p, 0.15, 0.5)));
  const spiral = Array.from({ length: 71 }, (_, k) => {
    const phi = (arm * k) / 70;
    const r = 4 + (44 * phi) / (5 * Math.PI);
    return `${(cx + r * Math.cos(phi - turn)).toFixed(1)},${(cy + r * Math.sin(phi - turn)).toFixed(1)}`;
  }).join(' ');
  const tip = [cx + 24 * Math.cos(-1.2 * turn - 0.6), cy + 24 * Math.sin(-1.2 * turn - 0.6)];
  const handle = [258, 18];
  const ang = (Math.atan2(handle[1] - tip[1], handle[0] - tip[0]) * 180) / Math.PI;
  return (
    <g>
      <circle cx={cx} cy={cy} r={75} fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" />
      <rect x={cx + 56} y={cy - 11} width={32} height={22} rx={10} fill="#fff" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={62} fill="#fff" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={53} fill={mix('#3b2314', '#b5845a', latte)} />
      {arm > 0.05 && <polyline points={spiral} fill="none" stroke="#fdfaf3" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={0.95 * milk} />}
      {blob > 0.2 && <circle cx={cx} cy={cy} r={blob} fill="#fdfaf3" />}
      <line x1={tip[0]} y1={tip[1]} x2={handle[0]} y2={handle[1]} stroke="#9ca3af" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx={tip[0]} cy={tip[1]} rx={9} ry={5.5} fill="#cbd5e1" stroke="#9ca3af" strokeWidth="1" transform={`rotate(${ang.toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)})`} />
    </g>
  );
}

/* ---- Encrypting a message: MATH, each letter shifted 3 down the alphabet, PDWK; a padlock closes ---- */
const PLAIN = 'MATH';

export function Message({ p }) {
  const e = ease(p);
  const lift = 8 * (1 - e);
  return (
    <g>
      <g transform={`translate(0 ${(-lift).toFixed(1)})`}>
        <path d="M 141 46 v -8 a 9 9 0 0 1 18 0 v 8" fill="none" stroke="#6b7280" strokeWidth="4" />
      </g>
      <rect x={134} y={44} width={32} height={24} rx={4} fill="#d4a017" stroke="#92400e" strokeWidth="1.5" />
      <circle cx={150} cy={54} r={3} fill="#78350f" />
      <rect x={149} y={55} width={2} height={6} fill="#78350f" />
      {[...PLAIN].map((ch, i) => {
        const x = 150 + (i - 1.5) * 54;
        const y = 116;
        const s = 3 * seg(p, 0.08 * i, 0.08 * i + 0.7);
        const flip = Math.abs(Math.cos(Math.PI * s));
        const letter = String.fromCharCode(ch.charCodeAt(0) + Math.round(s));
        return (
          <g key={i}>
            <rect x={x - 22} y={y - 30} width={44} height={60} rx={6} fill={mix('#ffffff', '#1f2937', e)} stroke="#9ca3af" strokeWidth="1.5" />
            <text
              x={x}
              y={y + 13}
              textAnchor="middle"
              fontFamily={MAIN}
              fontSize="38"
              fontWeight="700"
              fill={mix('#14213d', '#fde68a', e)}
              transform={`translate(${x} ${y}) scale(1 ${flip.toFixed(3)}) translate(${-x} ${-y})`}
            >
              {letter}
            </text>
            <line x1={x - 22} y1={y} x2={x + 22} y2={y} stroke="#000" strokeOpacity="0.15" strokeWidth="1" />
          </g>
        );
      })}
    </g>
  );
}

/* ---- Popping a balloon: a pin comes in, POP!, the pieces fall to the floor ---- */
const SHREDS = Array.from({ length: 10 }, (_, i) => ({
  a: (2 * Math.PI * i) / 10 + 0.4,
  v: 60 + 22 * (i % 3),
  spin: (i % 2 ? 1 : -1) * (200 + 40 * i),
  floor: 152 + (i % 4) * 4,
}));
const STAR = Array.from({ length: 24 }, (_, k) => {
  const r = k % 2 ? 17 : 32;
  const a = (Math.PI * k) / 12;
  return `${(r * Math.cos(a)).toFixed(1)},${(r * 0.8 * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export function Balloon({ p }) {
  const [bx, by] = [128, 70];
  const pinX = 290 - 122 * ease(seg(p, 0, 0.4));
  const popped = p >= 0.42;
  const burst = ease(seg(p, 0.42, 0.52));
  const boom = popped ? 1 - seg(p, 0.6, 0.8) : 0;
  const tau = seg(p, 0.42, 1);
  const squash = 3 * seg(p, 0.36, 0.42);
  return (
    <g>
      <line x1={10} y1={160} x2={290} y2={160} stroke="#d1d5db" strokeWidth="2" />
      {!popped && (
        <g>
          <path d={`M ${bx} ${by + 52} q -6 14 0 26 q 6 12 -2 28`} fill="none" stroke="#6b7280" strokeWidth="1.5" />
          <polygon points={`${bx - 5},${by + 55} ${bx + 5},${by + 55} ${bx},${by + 48}`} fill="#b91c1c" />
          <ellipse cx={bx - squash} cy={by} rx={40 - squash} ry={50} fill="#dc2626" />
          <ellipse cx={bx - 14} cy={by - 20} rx={8} ry={14} fill="#fff" opacity="0.35" transform={`rotate(25 ${bx - 14} ${by - 20})`} />
        </g>
      )}
      {popped &&
        SHREDS.map((s, k) => {
          const x = bx + Math.cos(s.a) * s.v * tau * 1.1;
          const y = Math.min(s.floor, by + Math.sin(s.a) * s.v * tau * 1.1 + 170 * tau * tau);
          return <polygon key={k} points="-7,-4 5,-7 8,3 -4,6" fill="#dc2626" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(s.spin * tau).toFixed(0)})`} />;
        })}
      {popped && (
        <path d={`M ${bx} 158 q 20 -3 40 0 q 14 2 30 -1`} fill="none" stroke="#6b7280" strokeWidth="1.5" opacity={seg(p, 0.5, 0.7)} />
      )}
      <line x1={pinX} y1={by} x2={pinX + 46} y2={by} stroke="#9ca3af" strokeWidth="2.5" />
      <circle cx={pinX + 50} cy={by} r={7} fill="#2563eb" />
      {boom > 0 && (
        <g opacity={boom} transform={`translate(${bx + 26} ${by - 8}) scale(${0.4 + 0.6 * burst})`}>
          <polygon points={STAR} fill="#fde047" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
          <text x={0} y={7} textAnchor="middle" fontFamily={MAIN} fontSize="19" fontWeight="700" fill="#b91c1c">
            POP!
          </text>
        </g>
      )}
    </g>
  );
}

/* ---- Zipping a jacket: the slider climbs, closing the zipper behind it ---- */
export function Zipper({ p }) {
  const e = ease(p);
  const ys = 156 - 128 * e;
  const g = 2 + 36 * (1 - e);
  // the inner edge of the left (s = −1) or right (s = 1) side at height y
  const xe = (y, s) => (y >= ys ? 150 + 2 * s : 150 + s * (2 + ((g - 2) * (ys - y)) / Math.max(1, ys - 14)));
  const side = (s) => {
    const m = (x) => 150 + s * (150 - x);
    return [
      [m(36), 166],
      [m(36), 48],
      [m(64), 22],
      [m(104), 14],
      [xe(14, s), 14],
      [xe(ys, s), ys],
      [150 + 2 * s, 166],
    ]
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');
  };
  const teeth = [];
  for (let j = 0, y = 162; y >= 16; j += 1, y -= 6) {
    if (y > ys + 8) teeth.push([150 - (j % 2 ? 0 : 6), y]);
    else teeth.push(j % 2 ? [xe(y, 1), y] : [xe(y, -1) - 6, y]);
  }
  return (
    <g>
      <rect x={96} y={10} width={108} height={156} fill="#e5e7eb" />
      <path d="M 120 14 q 30 22 60 0" fill="none" stroke="#cbd5e1" strokeWidth="3" />
      {[-1, 1].map((s) => (
        <polygon key={s} points={side(s)} fill="#2f5f96" stroke="#1e3a5f" strokeWidth="1.5" strokeLinejoin="round" />
      ))}
      {[-1, 1].map((s) => (
        <polygon key={`c${s}`} points={[[64, 22], [104, 14], [96, 40]].map(([x, y]) => `${150 + s * (150 - x)},${y}`).join(' ')} fill="#24507f" />
      ))}
      {teeth.map(([x, y], k) => (
        <rect key={k} x={x.toFixed(1)} y={y - 1.8} width={6} height={3.6} fill="#c0c6cf" />
      ))}
      <rect x={143} y={ys - 9} width={14} height={18} rx={3} fill="#d1d5db" stroke="#4b5563" strokeWidth="1.5" />
      <rect x={147} y={ys + 7} width={6} height={15} rx={2} fill="#6b7280" />
    </g>
  );
}
