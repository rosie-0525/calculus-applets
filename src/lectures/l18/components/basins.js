// The regions of Newton's method for Example 5's f: the starting points from which a₁, a₂, …
// converge to each of its three zeros, named and coloured as in the user's picture of the basins
// (newton_basins_zoom.png): r₁ = (∛3, 0) orange, r₂ (the zero Example 5 finds) blue, r₃ green.
// scripts/basins.mjs computes them, at twice the slide's pixels, into src/assets/: basin-{0,1,2}.png
// for Which zero does Newton's method find? (one image per zero), and basin-path.png for More steps
// (NewtonPicture's window, all three in one image). Run `node scripts/basins.mjs` again after
// changing anything here.
import { ZERO, ZERO2, ZERO3 } from './inv.js';

export const BASINS = [
  { zero: ZERO2, tint: '#e68f57', at: r`r_1=(\sqrt[3]{3},\,0)` },
  { zero: ZERO, tint: '#498cbf', at: r`r_2\approx(0.61,\,1.02)` },
  { zero: ZERO3, tint: '#61ab83', at: r`r_3\approx(-3.01,\,2.67)` },
];

// Which zero does Newton's method find?: its window and px per unit
export const BX = [-6.0, 3.0];
export const BY = [-2.4, 3.65];
export const BUNIT = 92;

// NewtonPicture (More steps): its window and px per unit
export const XR = [-0.25, 1.65];
export const YR = [-0.18, 1.5];
export const NUNIT = 255;

function r(strings) {
  return String.raw(strings);
}
