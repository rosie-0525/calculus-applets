import Plane, { Arrow, RightAngle } from './Plane.jsx';
import { TipLabel } from './SumPicture.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { INK, BLUE, apply, len, pts, times } from './eig.js';

const I2 = [
  [1, 0],
  [0, 1],
];

/**
 * What a 2 × 2 matrix does to the plane, Lecture 24's look: the grid, the unit square and F moved by M
 * (gray: where they start), and, on top, the eigenvectors `eigs` ([{ v, color }]) moved by M, each on
 * its line (the line of M v, so that the lines turn with the plane when M is a rotation).
 * `lines`, `arrows`: the eigenlines and the eigenvectors (false: none). `right`: the right-angle mark
 * between the two eigenvectors. `labels`: [{ at, tex, color, gap, dx, dy, size }], TipLabels drawn last.
 * `shape`: the unit square and F (false: the grid alone). `fade`: the opacity of the grid, square and F.
 */
export default function SpecScene({
  M = I2,
  eigs = [],
  lines = true,
  arrows = true,
  right = false,
  labels = [],
  shape = true,
  fade = eigs.length ? 0.5 : 1,
  n = 5,
  xRange = [-1.25, 2.25],
  yRange = [-1.25, 2.25],
  unit = 100,
  pad = 8,
  title = 'The grid, the unit square and F moved by a matrix, with its eigenvectors',
}) {
  const far = xRange[1] - xRange[0] + yRange[1] - yRange[0];
  return (
    <Plane xRange={xRange} yRange={yRange} unit={unit} pad={pad} grid={false} axes={false} title={title}>
      {(p) => {
        const moved = eigs.map((e) => apply(M, e.v));
        return (
          <g>
            <g opacity={fade}>
              <GridImage p={p} M={M} n={n} />
              {shape && <FImage p={p} home />}
              {shape && <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />}
            </g>
            {lines &&
              eigs.map((e, i) => {
                const d = len(moved[i]) > 1e-6 ? moved[i] : e.v;
                const f = times(far / len(d), d);
                return <polyline key={i} points={pts(p, [times(-1, f), f])} stroke={e.color} strokeWidth="2.6" opacity="0.6" fill="none" />;
              })}
            {right && eigs.length === 2 && <RightAngle p={p} at={[0, 0]} a={moved[0]} b={moved[1]} size={15} color={INK} />}
            {arrows &&
              eigs.map((e, i) => (
                <Arrow key={i} p={p} to={moved[i]} color={e.color} width={3.4} head={Math.min(13, 0.6 * len(moved[i]) * unit)} />
              ))}
            <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
            <g className="l15-sum-labels">
              {labels.map((l, i) => (
                <TipLabel key={i} p={p} v={l.at} tex={l.tex} color={l.color} size={l.size ?? 20} gap={l.gap ?? 16} dx={l.dx ?? 0} dy={l.dy ?? 0} />
              ))}
            </g>
          </g>
        );
      }}
    </Plane>
  );
}
