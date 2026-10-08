/** Small vector helpers shared by the pictures (vectors are plain arrays). */

export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const plus = (a, b) => a.map((x, i) => x + b[i]);
export const minus = (a, b) => a.map((x, i) => x - b[i]);
export const times = (c, a) => a.map((x) => c * x);
export const norm = (a) => Math.sqrt(dot(a, a));

/** The projection of x onto the line span(v): (x·v / v·v) v. */
export const proj = (x, v) => times(dot(x, v) / dot(v, v), v);
