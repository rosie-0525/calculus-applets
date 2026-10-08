import { useState } from 'react';
import '../lectures/l1/styles/deck.css';
import Tex, { r } from '../lectures/l1/components/Tex.jsx';
import Plane, { Arrow, Dot, PlaneLabel } from '../lectures/l1/components/Plane.jsx';
import { CARDINAL, TEAL, INK, TRACE } from '../lectures/l1/slides/Slide16LinearCombinations.jsx';

export const lecture = 1;

/*
 * The lecture's Examples 2 and 3 (slides "Convex linear combinations" and after), made to move.
 * This page: two vectors, (1 − t)u + tv for a slider t in [0, 1]. ThreeVectors (convex-three.jsx):
 * c1 u + c2 v + c3 w, where moving one weight rescales the other two, so the weights stay ≥ 0 and
 * add up to 1. Like the multiples on the linear-combinations page, every point reached leaves a
 * pink trail, so sweeping the sliders draws the segment and fills in the triangle.
 */

const GREEN = '#175e54';
const U = [1, 5];
const V = [5, 1];
const W = [1, 1];

const hundredths = (x) => Math.round(x * 100) / 100;
const fix2 = (x) => hundredths(x).toFixed(2);
const coord = (x) => String(hundredths(x));
const combine = (cs, vs) => [0, 1].map((i) => hundredths(cs.reduce((s, c, k) => s + c * vs[k][i], 0)));

const PLANE = { xRange: [-0.4, 5.9], yRange: [-0.4, 5.9], unit: 50 };

/** The deck's slider (lc-slider), for a weight from 0 to 1 shown to two decimals. */
function Weight({ name, label, value, onChange, color }) {
  return (
    <label className="lc-slider">
      <span className="lc-name" style={{ color }}>
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(hundredths(Number(e.target.value)))}
        style={{ accentColor: color }}
        aria-label={name}
      />
      <span className="lc-value">{fix2(value)}</span>
    </label>
  );
}

/** (1 − t)u + tv, and the stretch of the segment that t has swept so far. */
export default function TwoVectors() {
  const [t, setT] = useState(0.3);
  const [seen, setSeen] = useState([0.3, 0.3]);
  const onT = (x) => {
    setT(x);
    setSeen(([lo, hi]) => [Math.min(lo, x), Math.max(hi, x)]);
  };
  const point = combine([1 - t, t], [U, V]);
  const [a, b] = seen.map((s) => combine([1 - s, s], [U, V]));

  return (
    <div className="lc-explorer">
      <Plane {...PLANE} title="u, v and the convex combination (1 − t) u + t v; moving t traces out the segment from u to v">
        {(p) => (
          <g>
            <line x1={p.px(a[0])} y1={p.py(a[1])} x2={p.px(b[0])} y2={p.py(b[1])} stroke={TRACE} strokeWidth="12" strokeLinecap="round" />

            <Arrow p={p} to={point} color={INK} width={4.5} />
            <Arrow p={p} to={U} color={CARDINAL} width={3.5} />
            <PlaneLabel p={p} at={U} dx={-24} dy={-10} color={CARDINAL}>
              u
            </PlaneLabel>
            <Arrow p={p} to={V} color={TEAL} width={3.5} />
            <PlaneLabel p={p} at={V} dx={10} dy={16} color={TEAL}>
              v
            </PlaneLabel>
            <Dot p={p} at={point} color={INK} r={5.5} stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </Plane>

      <div className="lc-sliders">
        <Weight name="t" label={<Tex tex="t" />} value={t} onChange={onT} color={INK} />
        <p className="cvx-readout">
          <Tex tex={r`(1-t)\vv{u}+t\vv{v}=${fix2(1 - t)}\,\vv{u}+${fix2(t)}\,\vv{v}=(${coord(point[0])},\ ${coord(point[1])})`} />
        </p>
      </div>
    </div>
  );
}

/*
 * Weights to two decimals that still add up to 1.00: round down, then give the hundredths left
 * over to the weights that lost the most (largest remainders).
 */
function shown(cs) {
  const raw = cs.map((c) => c * 100);
  const out = raw.map((x) => Math.floor(x + 1e-9));
  let left = 100 - out.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - out[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return out.map((n) => n / 100);
}

/** c1 u + c2 v + c3 w with weights ≥ 0 adding up to 1, and the path the point has taken. */
export function ThreeVectors() {
  const [cs, setCs] = useState([0.2, 0.5, 0.3]);
  const [trail, setTrail] = useState(() => [combine([0.2, 0.5, 0.3], [U, V, W])]);

  // c_i becomes x; the rest, 1 − x, is shared by the other two in their old proportion. The
  // weights are kept exact (rounding them would bend the proportion, and the point's path, near
  // a corner) and rounded only to be shown.
  const setWeight = (i) => (x) => {
    const [j, k] = [0, 1, 2].filter((n) => n !== i);
    const rest = 1 - x;
    const others = cs[j] + cs[k];
    const next = [];
    next[i] = x;
    next[j] = others > 1e-9 ? (rest * cs[j]) / others : rest / 2;
    next[k] = rest - next[j];
    setCs(next);
    setTrail((path) => [...path.slice(-4000), combine(next, [U, V, W])]);
  };
  const point = combine(cs, [U, V, W]);
  const ws = shown(cs);
  const at = combine(ws, [U, V, W]);

  return (
    <div className="lc-explorer">
      <Plane {...PLANE} title="u, v, w and the convex combination c1 u + c2 v + c3 w; moving the weights fills in the triangle">
        {(p) => (
          <g>
            <polyline
              points={trail.map(([x, y]) => `${p.px(x)},${p.py(y)}`).join(' ')}
              fill="none"
              stroke={TRACE}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <Arrow p={p} to={point} color={INK} width={4.5} />
            <Arrow p={p} to={U} color={CARDINAL} width={3.5} />
            <PlaneLabel p={p} at={U} dx={-24} dy={-10} color={CARDINAL}>
              u
            </PlaneLabel>
            <Arrow p={p} to={V} color={TEAL} width={3.5} />
            <PlaneLabel p={p} at={V} dx={10} dy={16} color={TEAL}>
              v
            </PlaneLabel>
            <Arrow p={p} to={W} color={GREEN} width={3.5} />
            <PlaneLabel p={p} at={W} dx={-22} dy={-6} color={GREEN}>
              w
            </PlaneLabel>
            <Dot p={p} at={point} color={INK} r={5.5} stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </Plane>

      <div className="lc-sliders">
        <Weight name="c1" label={<Tex tex="c_1" />} value={ws[0]} onChange={setWeight(0)} color={CARDINAL} />
        <Weight name="c2" label={<Tex tex="c_2" />} value={ws[1]} onChange={setWeight(1)} color={TEAL} />
        <Weight name="c3" label={<Tex tex="c_3" />} value={ws[2]} onChange={setWeight(2)} color={GREEN} />
        <p className="cvx-readout">
          <Tex tex={r`${fix2(ws[0])}\,\vv{u}+${fix2(ws[1])}\,\vv{v}+${fix2(ws[2])}\,\vv{w}=(${coord(at[0])},\ ${coord(at[1])})`} />
        </p>
      </div>
    </div>
  );
}
