// Lecture 21's colours and small helpers, shared by its pictures.
export { INK, RED, BLUE, AMBER, GRAY, apply, pts, I2 } from './la.js';
export { ease, clamp01, rot } from './inv.js';

export const GREEN = '#175e54';
export const TEAL = '#0e7490';
export const PURPLE = '#5b3f99';
// the colours of the rows of a matrix, so that each row can be followed into a column of its transpose
export const ROWS = ['#8c1515', '#3b6ea8', '#c2702a', '#175e54'];

export const lerp = (a, b, t) => a + (b - a) * t;
