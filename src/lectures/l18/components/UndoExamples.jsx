import Plane from './Plane.jsx';
import { lerpM, I2, rot } from './inv.js';

/**
 * The six linear transformations of ℝ² on Linear transformation: Invertible or not? and Invertible linear
 * transformations, in their order: four invertible ones (`undo`: what undoes it) and two that are
 * not (`points`: two points that land on the same point).
 */
export const EXAMPLES = [
  { name: 'Rotation by 90°', A: rot(90), path: (t) => rot(90 * t), undo: 'rotation by −90°' },
  {
    name: 'Projection onto the x-axis',
    A: [
      [1, 0],
      [0, 0],
    ],
    points: [
      [1.5, 1.2],
      [1.5, -0.45],
    ],
  },
  {
    name: 'Shear',
    A: [
      [1, 1],
      [0, 1],
    ],
    undo: 'the shear back',
  },
  {
    name: 'Reflection across the y-axis',
    A: [
      [-1, 0],
      [0, 1],
    ],
    undo: 'itself',
  },
  {
    name: 'Zero map',
    A: [
      [0, 0],
      [0, 0],
    ],
    points: [
      [1.5, 1.2],
      [-0.9, -0.4],
    ],
  },
  {
    name: 'Scaling by 2 and ½',
    A: [
      [2, 0],
      [0, 0.5],
    ],
    undo: 'scaling by ½ and 2',
  },
];

/** The matrix t of the way from I to the example's A (rotations turn; the others glide straight). */
export const along = (ex, t) => (ex.path ? ex.path(t) : lerpM(I2, ex.A, t));

export const XR = [-1.5, 2.3];
export const YR = [-0.7, 1.6];

/** A card's plane, with no grid or axes of its own: children(p) draws on it. */
export function UndoPlane({ unit, title, children }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={unit} pad={6} grid={false} axes={false} title={title}>
      {(p) => (
        // the svg's own viewport clips what runs off the picture (no clipPath: in print, reveal copies each slide once per key press, and a url(#id) then names a hidden copy on an earlier page)
        <g>{children(p)}</g>
      )}
    </Plane>
  );
}
