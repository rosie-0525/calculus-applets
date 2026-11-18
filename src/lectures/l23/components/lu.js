// Lecture 23's colours: a lower triangular matrix (L) blue, an upper triangular one (U, R) amber, an
// orthogonal one (Q) green, as A and B in Lecture 15 and "orthogonal" in Lecture 21.
export const INK = '#14213d';
export const RED = '#8c1515';
export const BLUE = '#3b6ea8';
export const AMBER = '#c2702a';
export const GREEN = '#175e54';
export const TEAL = '#0e7490';
export const GRAY = '#9ca3af';

// their tints, for the cells of a matrix's shape (Grid.jsx)
export const TINT = {
  [INK]: '#c9d1dd',
  [BLUE]: '#c3d6ec',
  [AMBER]: '#f3d2ab',
  [GREEN]: '#bcdcd2',
  [RED]: '#f3d6d6',
};

/** TeX in a colour: `col(BLUE, 'L')`. */
export const col = (c, tex) => String.raw`\textcolor{${c}}{${tex}}`;
export const L = col(BLUE, 'L');
export const U = col(AMBER, 'U');
export const Q = col(GREEN, 'Q');
export const R = col(AMBER, 'R');
