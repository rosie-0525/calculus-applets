import Space from './Space.jsx';
import { INK, cross, unit, plus, minus, times, dot, lerp } from './ls.js';

/** The polygon `poly` cut by the plane f = 0: its part where f ≥ 0, its part where f ≤ 0, the cut. */
function cut(poly, f) {
  const pos = [];
  const neg = [];
  const edge = [];
  poly.forEach((p, k) => {
    const q = poly[(k + 1) % poly.length];
    const [fp, fq] = [f(p), f(q)];
    if (fp >= 0) pos.push(p);
    if (fp <= 0) neg.push(p);
    if (fp * fq < 0) {
      const x = lerp(p, q, fp / (fp - fq));
      pos.push(x);
      neg.push(x);
      edge.push(x);
    }
  });
  return { pos, neg, edge };
}

/**
 * Two planes of ℝ³ given by their equations, n · x = d, both parallel to the direction `axis` (so
 * the line where they meet, when they meet, is parallel to it): `planes` = [{ n, d, at, half, fill, edge },
 * the same]. Each is a patch around its point `at`, 2 · `half` wide along the axis (its own `half`, if it
 * has one: a wider second plane shows behind the first when they are parallel) and 2 · `length`
 * long across it; when the planes meet beyond a patch, the patch is made longer, to reach `margin`
 * past the line where they meet, out of the frame if need be: two almost parallel planes are seen to
 * meet far away, two parallel ones never. The second plane is cut along the first, its part behind
 * the first drawn before it and its part in front after it, so that each plane hides what is behind
 * it; the line where they meet is in ink. `at` is the point of space in the middle of the picture.
 * The view rocks; drag to turn it.
 */
export default function TwoPlanes({ planes, axis, at = [0, 0, 0], half = 1.3, length = 2.2, margin = 0.6, width = 380, height = 240, unit: u = 44, az = 0, el = 13, swing = 10, title }) {
  const a = unit(axis);
  const [first, second] = planes.map((pl, k) => {
    const other = planes[1 - k];
    const c = plus(pl.at, times((pl.d - dot(pl.n, pl.at)) / dot(pl.n, pl.n), pl.n)); // `at`, on the plane
    const w = unit(cross(pl.n, a));
    // how far along w the other plane is met (nowhere when the planes are parallel)
    const slope = dot(other.n, w);
    const r = Math.abs(slope) > 1e-6 ? Math.max(-60, Math.min(60, (other.d - dot(other.n, c)) / slope)) : 0;
    const [lo, hi] = [Math.min(-length, r - margin), Math.max(length, r + margin)];
    const h = pl.half ?? half;
    const pt = (t, x) => plus(c, plus(times(t, a), times(x, w)));
    return { ...pl, h, patch: [pt(-h, lo), pt(h, lo), pt(h, hi), pt(-h, hi)] };
  });
  const { pos, neg, edge } = cut(second.patch, (x) => dot(first.n, x) - first.d);
  return (
    <Space width={width} height={height} unit={u} center={[0.5, 0.5]} az={az} el={el} swing={swing} axes={false} title={title}>
      {(s) => {
        const pts = (poly) => poly.map((x) => s.P(minus(x, at)).map((v) => v.toFixed(1)).join(',')).join(' ');
        const sheet = (poly, pl, key) => poly.length > 2 && <polygon key={key} points={pts(poly)} fill={pl.fill} stroke={pl.edge} strokeWidth="1.6" strokeLinejoin="round" />;
        const facing = s.depth(first.n) > 0; // the first plane's normal points towards the viewer
        const mid = edge.length === 2 ? lerp(edge[0], edge[1], 0.5) : null;
        return (
          <g>
            {sheet(facing ? neg : pos, second, 'behind')}
            {sheet(first.patch, first, 'first')}
            {sheet(facing ? pos : neg, second, 'front')}
            {mid && <polyline points={pts([plus(mid, times(-second.h - 0.12, a)), plus(mid, times(second.h + 0.12, a))])} fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />}
          </g>
        );
      }}
    </Space>
  );
}
