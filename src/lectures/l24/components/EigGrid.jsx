import Plane, { Arrow } from './Plane.jsx';
import { Backdrop } from './SumPicture.jsx';
import TexSvg from './TexSvg.jsx';
import { INK, BLUE, coords, plus, times, len, pts, clamp01 } from './eig.js';

const GRID = '#d3d8df';

/**
 * What a 2 × 2 matrix with two eigenvectors v₁, v₂ (eigenvalues λ₁, λ₂) does to the plane, as in the
 * textbook's Figures 23.1.1 and 23.1.2: a grid (gray where it starts, blue where it is now) and its
 * shaded cell, the two eigenlines in their colours, dots at multiples of the eigenvectors, and the
 * eigenvectors themselves. A point a v₁ + b v₂ sits at a k₁ v₁ + b k₂ v₂ with kᵢ = 1 + sᵢ(λᵢ − 1): `s`
 * = [s₁, s₂] says how far each eigen-direction has gone, so s = [t, t] is the point p on its way to
 * Ap ((1 − t)p + tAp), and s = [1, 0] has only stretched along v₁.
 *
 * `eigs`: [{ v, lam, color, name, end, label, labelEnd }] (name: the TeX of the eigenvector, shown at
 * its tip; end: the TeX that replaces it once it has landed, e.g. Av = 3v; label, labelEnd: { gap, dx,
 * dy } px). `basis`: the grid's two directions (the standard basis, or the eigenvectors); `K`: its
 * lines are at −K, …, K. `lines`, `dots`, `arrows`: opacities (0 hides). `backdrop`: a faint grid and
 * the axes over the whole picture.
 */
export default function EigGrid({
  eigs,
  s = [0, 0],
  basis = [
    [1, 0],
    [0, 1],
  ],
  K = 1,
  xRange = [-3.6, 3.6],
  yRange = [-3.6, 3.6],
  unit = 56,
  pad = 10,
  lines = 0,
  dots = 0,
  multiples = [-1, 1],
  arrows = 1,
  cell = true,
  backdrop = true,
  labelSize = 21,
  title = 'A grid and its image under a matrix, with the two eigenlines',
}) {
  const vs = eigs.map((e) => e.v);
  const ks = eigs.map((e, i) => 1 + s[i] * (e.lam - 1));
  const go = (p) => {
    const [a, b] = coords(vs, p);
    return plus(times(a * ks[0], vs[0]), times(b * ks[1], vs[1]));
  };
  const at = (i, j) => plus(times(i, basis[0]), times(j, basis[1]));
  const idx = [];
  for (let k = -K; k <= K; k += 1) idx.push(k);
  const far = xRange[1] - xRange[0] + yRange[1] - yRange[0];
  const grid = (p, f, color, width) => (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      {idx.map((k) => (
        <g key={k}>
          <polyline points={pts(p, [f(at(k, -K)), f(at(k, K))])} />
          <polyline points={pts(p, [f(at(-K, k)), f(at(K, k))])} />
        </g>
      ))}
    </g>
  );
  const moved = s[0] !== 0 || s[1] !== 0;
  return (
    <Plane xRange={xRange} yRange={yRange} unit={unit} pad={pad} grid={false} axes={false} title={title}>
      {(p) => (
        <g>
          {backdrop && <Backdrop p={p} xRange={xRange} yRange={yRange} />}
          {grid(p, (q) => q, GRID, 1.4)}
          {cell && <polygon points={pts(p, [[0, 0], at(1, 0), at(1, 1), at(0, 1)])} fill="rgba(107, 114, 128, 0.14)" />}
          {lines > 0 &&
            eigs.map((e, i) => {
              const d = times(far / len(e.v), e.v);
              return <polyline key={i} points={pts(p, [times(-1, d), d])} stroke={e.color} strokeWidth="2.4" opacity={0.5 * lines} fill="none" />;
            })}
          {moved && (
            <g>
              {cell && <polygon points={pts(p, [[0, 0], at(1, 0), at(1, 1), at(0, 1)].map(go))} fill="rgba(59, 110, 168, 0.2)" />}
              {grid(p, go, BLUE, 1.8)}
            </g>
          )}
          {dots > 0 &&
            eigs.map((e, i) =>
              multiples.map((m) => {
                const q = times(m * ks[i], e.v);
                return <circle key={`${i}${m}`} cx={p.px(q[0])} cy={p.py(q[1])} r="5.5" fill={e.color} stroke="#fff" strokeWidth="1.5" opacity={dots} />;
              }),
            )}
          {arrows > 0 && eigs.map((e, i) => <Arrow key={i} p={p} to={times(ks[i], e.v)} color={e.color} width={3.8} opacity={arrows} />)}
          <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
          {arrows > 0 && (
            <g className="l15-sum-labels" opacity={arrows}>
              {eigs.map((e, i) => {
                const tip = times(ks[i], e.v);
                // the label sits beyond the tip, along the arrow (the way v points, the other way once flipped)
                const sign = ks[i] < 0 ? -1 : 1;
                const dx = (sign * e.v[0]) / len(e.v);
                const dy = (-sign * e.v[1]) / len(e.v);
                const out = e.end ? 1 - clamp01(s[i] / 0.25) : 1;
                const inn = e.end ? clamp01((s[i] - 0.75) / 0.25) : 0;
                const a = { gap: 20, dx: 0, dy: 0, ...e.label };
                const b = { gap: 24, dx: 0, dy: 0, ...e.labelEnd };
                return (
                  <g key={i}>
                    <TexSvg x={p.px(tip[0]) + dx * a.gap + a.dx} y={p.py(tip[1]) + dy * a.gap + a.dy} tex={e.name} size={labelSize} color={e.color} opacity={out} w={60} h={34} />
                    {e.end && (
                      <TexSvg x={p.px(tip[0]) + dx * b.gap + b.dx} y={p.py(tip[1]) + dy * b.gap + b.dy} tex={e.end} size={labelSize} color={e.color} opacity={inn} w={150} h={34} />
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </g>
      )}
    </Plane>
  );
}
