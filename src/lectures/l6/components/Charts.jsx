import DataPlot from './DataPlot.jsx';
import { PENGUINS } from '../data/penguins.js';
import { GALTON, PARENT_CLASSES } from '../data/galton.js';

export const INK = '#14213d';
export const TEAL = '#0e7490';
export const CARDINAL = '#8c1515';
export const GRAY = '#9ca3af';

/** The line y = m x + b across the plot's window (clipped to it). */
export function FitLine({ p, m, b = 0, color, width = 3, dashed = false, ...rest }) {
  const { xMin, xMax } = p;
  return (
    <line
      x1={p.px(xMin)}
      y1={p.py(m * xMin + b)}
      x2={p.px(xMax)}
      y2={p.py(m * xMax + b)}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? '9 7' : undefined}
      clipPath={p.clip}
      {...rest}
    />
  );
}

/** The penguins as [flipper length (mm), body mass (kg)]. */
export const PENGUIN_POINTS = PENGUINS.map(([f, g]) => [f, g / 1000]);

/**
 * The body mass of 342 Palmer penguins against their flipper length. `children(p)` draws lines under
 * the points; `overlay(p)` is drawn on top (drag handles).
 */
export function PenguinChart({ width = 700, height = 500, compact = false, children, overlay }) {
  return (
    <DataPlot
      width={width}
      height={height}
      xRange={[168, 236]}
      yRange={[2.4, 6.6]}
      xTicks={compact ? [170, 190, 210, 230] : [170, 180, 190, 200, 210, 220, 230]}
      yTicks={[3, 4, 5, 6]}
      xLabel="flipper length (mm)"
      yLabel="body mass (kg)"
      title="The body mass of 342 penguins against their flipper length: longer flippers, heavier penguins"
    >
      {(p) => (
        <g>
          {children?.(p)}
          <g fill={INK} fillOpacity="0.55" stroke="#fff" strokeWidth="0.6">
            {PENGUIN_POINTS.map(([x, y], i) => (
              <circle key={i} cx={p.px(x)} cy={p.py(y)} r={compact ? 2.8 : 3.8} />
            ))}
          </g>
          {overlay?.(p)}
        </g>
      )}
    </DataPlot>
  );
}

/** A deterministic pseudo-random number in [0, 1) for each integer seed (the same every time). */
function hash01(seed) {
  let t = (seed * 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Galton's 928 children, one dot each. His heights are grouped in classes 1 inch wide, so each
 * dot is spread at random (the same way every time) inside its class, to show how many there are.
 */
export const GALTON_DOTS = GALTON.flatMap(([x, y, k], c) =>
  Array.from({ length: k }, (_, j) => ({
    x,
    y,
    jx: x + 0.84 * (hash01(1000 * c + 2 * j + 1) - 0.5),
    jy: y + 0.84 * (hash01(1000 * c + 2 * j + 2) - 0.5),
  })),
);

/** For each parents' class: the number of children and their average height. */
export const CLASS_MEANS = PARENT_CLASSES.map((x) => {
  const kids = GALTON.filter(([px]) => px === x);
  const n = kids.reduce((s, [, , k]) => s + k, 0);
  const sum = kids.reduce((s, [, y, k]) => s + y * k, 0);
  return { x, n, mean: sum / n };
});

/**
 * Galton's family heights: each child's height against the parents' (average) height, with the
 * line y = x (children exactly as tall as their parents) dashed. `selected` (a parents' class)
 * lights up that column; `children(p)` draws on top.
 */
export function GaltonChart({ width = 640, height = 500, selected, compact = false, children }) {
  const xs = compact ? [64, 66, 68, 70, 72] : [64, 65, 66, 67, 68, 69, 70, 71, 72, 73];
  return (
    <DataPlot
      width={width}
      height={height}
      xRange={[63, 74]}
      yRange={[61, 75]}
      xTicks={xs}
      yTicks={[62, 64, 66, 68, 70, 72, 74]}
      xLabel="parents’ height (average, inches)"
      yLabel="child’s height (inches)"
      title="Galton's data: the heights of 928 adult children against the average height of their parents"
    >
      {(p) => (
        <g>
          <FitLine p={p} m={1} b={0} color={GRAY} width={2} dashed />
          <text x={p.px(73.85)} y={p.py(74.4)} fill="#6b7280" fontSize="15" textAnchor="end" fontStyle="italic">
            y = x
          </text>
          <g fill={INK}>
            {GALTON_DOTS.map((d, i) => (
              <circle
                key={i}
                cx={p.px(d.jx)}
                cy={p.py(d.jy)}
                r={compact ? 2 : 2.6}
                fillOpacity={selected === undefined ? 0.4 : d.x === selected ? 0.9 : 0.14}
                fill={d.x === selected ? CARDINAL : INK}
              />
            ))}
          </g>
          {children?.(p)}
        </g>
      )}
    </DataPlot>
  );
}
