import { VS, vec3 } from './BFrame.jsx';

// Basis of eigenvectors's two pictures (and Last time's B, which glides into the left one): one picture and
// its rotation. The plane P: x + 2y + 3z = 0 is the xy-plane turned about the line where they meet,
// span{(2, −1, 0)}: the rotation Q with (2, −1, 0)/√5 ↦ itself, (1, 2, 0)/√5 ↦ (3, 6, −5)/√70 and
// e₃ ↦ (1, 2, 3)/√14. A point is kept by its coordinates (s, t, h) along these, and drawn in the
// xy-plane's frame (D) or in P's (B).
const [S5, S14, S70] = [5, 14, 70].map(Math.sqrt);
const HINGE = [2 / S5, -1 / S5, 0];
const FLAT = [HINGE, [1 / S5, 2 / S5, 0], [0, 0, 1]];
const TILTED = [HINGE, [3 / S70, 6 / S70, -5 / S70], [1 / S14, 2 / S14, 3 / S14]];
export const put = (frame, c) => [0, 1, 2].map((k) => c[0] * frame[0][k] + c[1] * frame[1][k] + c[2] * frame[2][k]);
// the piece of the plane, a rectangle along the hinge, and x, up on the left of both pictures, where
// no eigenvector and no axis is
const RECT = [
  [-1, -2.2, 0],
  [2.9, -2.2, 0],
  [2.9, 2.2, 0],
  [-1, 2.2, 0],
];
const X = [0.9, -1.7, 1.3];
// D's picture is B's turned (the user's request: the two pictures exactly the same, one the other
// rotated): the same rectangle and x, but with e₁, e₂, e₃ (the user's request), drawn Z times longer
// (the pictures have no ticks), about as long as B's eigenvectors. B's eigenvectors are kept by their
// coordinates along P's frame (CB), to turn them with it.
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const CB = VS.map((v) => TILTED.map((f) => dot3(f, v.v)));
const Z = 2;
const E = [0, 1, 2].map((i) => [0, 1, 2].map((k) => (i === k ? Z : 0)));
// On Change of basis, u, v, w orthonormal (the user's request, not said on the slide): P's frame,
// u = (2, −1, 0)/√5, v = (3, 6, −5)/√70, w = (1, 2, 3)/√14 (Example 3's, the next slide), drawn Z long
// like e₁, e₂, e₃
export const CB_ON = [0, 1, 2].map((i) => [0, 1, 2].map((k) => (i === k ? Z : 0)));
const FRAMES = { B: TILTED, D: FLAT };
// the frame on its way from P's (m = 0) to the xy-plane's (m = 1): turned about the hinge
const TURN = Math.acos(dot3(TILTED[1], FLAT[1]));
const slerp = (a, b, m) => a.map((c, k) => (Math.sin((1 - m) * TURN) * c + Math.sin(m * TURN) * b[k]) / Math.sin(TURN));
const frameAt = (m) => [HINGE, slerp(TILTED[1], FLAT[1], m), slerp(TILTED[2], FLAT[2], m)];
const propsIn = (frame, F) => ({ F, corners: RECT.map((c) => put(frame, c)), x: put(frame, X), foot: put(frame, [X[0], X[1], 0]), view: SMALL });
// the view: nearly along the hinge, so that P is the xy-plane turned in the picture's own plane
export const SMALL = { width: 480, height: 400, unit: 58, center: [0.5, 0.56], az: 12, el: 24, swing: 4, axisLen: [3.4, 3.4, 2.8], negAxes: false };

/**
 * ProjFrame's props for side 'B' (the plane P) or 'D' (the xy-plane): F, corners, x, foot, view; `cb`:
 * B's eigenvectors by their coordinates along P's frame (CB_ON: orthonormal).
 */
export const sceneProps = (side, cb = CB) => (side === 'B' ? propsIn(TILTED, cb.map((c) => put(TILTED, c))) : propsIn(FLAT, E));

/**
 * B's picture on its way onto D's (m from 0 to 1): P's frame turned about the hinge, and B's
 * eigenvectors, turning with it, moving onto e₁, e₂, e₃ (the user's request: the two orange vectors
 * move to the standard basis vectors).
 */
export function turnedProps(m, cb = CB) {
  const frame = frameAt(m);
  return propsIn(
    frame,
    cb.map((c, i) => put(frame, c).map((a, k) => (1 - m) * a + m * E[i][k])),
  );
}

// B's eigenvectors' labels, [TeX, dx, dy, size, width] from their tips (ProjFrame's names.vs). On
// Last time, each named and its column vector (the user's request): u = (2, −1, 0), v = (3, 0, −1),
// w = (1, 2, 3); on Basis of eigenvectors, where B's picture glides from there,
// only u, v, w (the user's request), in the type size of D's e₁, e₂, e₃
const UVW = ['u', 'v', 'w'].map((c) => String.raw`\vv ${c}`);
export const B_VS_NAMED = VS.map((v, i) => [`${UVW[i]}=${vec3(v.v)}`, ...[[-24, 48], [66, 12], [46, 28]][i], 16, 110]);
export const B_VS = UVW.map((tex, i) => [tex, ...[[-14, 12], [16, 8], [16, 2]][i], 19]);

/** A point of P (side B) or of the xy-plane (side D), by its coordinates (s, t, h) along the frame. */
export const at = (side, c) => put(FRAMES[side], c);
