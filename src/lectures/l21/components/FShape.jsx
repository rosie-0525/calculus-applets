import { F, S } from './FPanel.jsx';
import { apply, pts, I2, rot } from './inv.js';

/**
 * The image under M of the unit square (its outline) and of the letter F in it (filled), Lecture
 * 15's way of showing a linear transformation of ℝ². `home`: the square and F themselves, in gray
 * (dashed outline), as a reference.
 */
export function FImage({ p, M = I2, color, opacity = 1, home = false, squareFill }) {
  if (home) {
    return (
      <g opacity={opacity}>
        <polygon points={pts(p, S)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points={pts(p, F)} fill="#d1d5db" />
      </g>
    );
  }
  return (
    <g opacity={opacity}>
      <polygon
        points={pts(p, S.map((q) => apply(M, q)))}
        fill={squareFill ?? 'none'}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />
      <polygon points={pts(p, F.map((q) => apply(M, q)))} fill={color} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  );
}

/** The faint grid (lines a unit apart, |k| ≤ n) and the axes, both moved by M. */
export function GridImage({ p, M = I2, n = 5, color = '#e3e6eb', axis = '#b9bfc9' }) {
  const ks = Array.from({ length: 2 * n + 1 }, (_, i) => i - n);
  return (
    <g>
      <g stroke={color} strokeWidth="1.2">
        {ks.map((k) => (
          <g key={k}>
            <polyline points={pts(p, [apply(M, [k, -n]), apply(M, [k, n])])} />
            <polyline points={pts(p, [apply(M, [-n, k]), apply(M, [n, k])])} />
          </g>
        ))}
      </g>
      <g stroke={axis} strokeWidth="1.6">
        <polyline points={pts(p, [apply(M, [-n, 0]), apply(M, [n, 0])])} />
        <polyline points={pts(p, [apply(M, [0, -n]), apply(M, [0, n])])} />
      </g>
    </g>
  );
}

/**
 * A matrix on its way from I (t = 0) to A (t = 1) without flattening on the way, for a matrix A
 * with det(A) > 0: A = R(φ) P with R(φ) a rotation and P symmetric (the polar decomposition), and
 * the path R(tφ)((1 − t)I + tP): F turns and stretches at once.
 */
export function towards(A, t) {
  const phi = (Math.atan2(A[1][0] - A[0][1], A[0][0] + A[1][1]) * 180) / Math.PI;
  const back = rot(-phi);
  const P = [
    [back[0][0] * A[0][0] + back[0][1] * A[1][0], back[0][0] * A[0][1] + back[0][1] * A[1][1]],
    [back[1][0] * A[0][0] + back[1][1] * A[1][0], back[1][0] * A[0][1] + back[1][1] * A[1][1]],
  ];
  const R = rot(t * phi);
  const L = P.map((row, i) => row.map((m, j) => (1 - t) * (i === j ? 1 : 0) + t * m));
  return [
    [R[0][0] * L[0][0] + R[0][1] * L[1][0], R[0][0] * L[0][1] + R[0][1] * L[1][1]],
    [R[1][0] * L[0][0] + R[1][1] * L[1][0], R[1][0] * L[0][1] + R[1][1] * L[1][1]],
  ];
}
