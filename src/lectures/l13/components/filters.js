// The photo filters of Photo filters and Back to Photo filters: each sends a pixel's color
// x = (red, green, blue), each from 0 to 1, to Ax + b (then cut to [0, 1]). The matrices are those
// of the W3C's Filter Effects spec (CSS's grayscale(1), sepia(1) and invert(1)), applied to the
// pixel values themselves (sRGB). Mono's three rows are the same: the gray level, a scalar.
export const FILTERS = [
  { id: 'original', name: 'Original', A: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  {
    id: 'mono',
    name: 'Mono',
    A: [
      [0.2126, 0.7152, 0.0722],
      [0.2126, 0.7152, 0.0722],
      [0.2126, 0.7152, 0.0722],
    ],
  },
  {
    id: 'sepia',
    name: 'Sepia',
    A: [
      [0.393, 0.769, 0.189],
      [0.349, 0.686, 0.168],
      [0.272, 0.534, 0.131],
    ],
  },
  { id: 'invert', name: 'Invert', A: [[-1, 0, 0], [0, -1, 0], [0, 0, -1]], b: [1, 1, 1] },
];

export const byId = Object.fromEntries(FILTERS.map((f) => [f.id, f]));
export const SEPIA = byId.sepia.A;

/** The `values` of an SVG feColorMatrix, the 4 × 5 matrix [A b; 0 0 0 1 0] (alpha kept). */
export function colorMatrix(A, b = [0, 0, 0]) {
  return [...A.map((row, i) => [...row, 0, b[i]]), [0, 0, 0, 1, 0]].flat().join(' ');
}

/** Ax + b, for x and b in ℝ³. */
export const apply = (A, x, b = [0, 0, 0]) => A.map((row, i) => row[0] * x[0] + row[1] * x[1] + row[2] * x[2] + b[i]);
