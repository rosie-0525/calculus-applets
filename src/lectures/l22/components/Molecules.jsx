/**
 * Ball-and-stick cartoons of the molecules of burning propane (Burning propane, Back to propane), in
 * the usual chemistry colours: carbon dark gray, hydrogen white, oxygen red. Each is drawn around
 * (0, 0) in a box about 110 × 70 (propane) or smaller; `scale` resizes it.
 */

export const ATOM = {
  C: { fill: '#3f4652', r: 11, name: 'carbon' },
  H: { fill: '#ffffff', r: 7.5, name: 'hydrogen' },
  O: { fill: '#d6402b', r: 10.5, name: 'oxygen' },
};

const BOND = '#8a919c';

// atoms [element, x, y] and bonds [i, j, order]
const PROPANE = {
  atoms: [
    ['C', -27, 7],
    ['C', 0, -7],
    ['C', 27, 7],
    ['H', -47, -5],
    ['H', -36, 28],
    ['H', -17, 27],
    ['H', -10, -28],
    ['H', 10, -28],
    ['H', 47, -5],
    ['H', 36, 28],
    ['H', 17, 27],
  ],
  bonds: [
    [0, 1, 1],
    [1, 2, 1],
    [0, 3, 1],
    [0, 4, 1],
    [0, 5, 1],
    [1, 6, 1],
    [1, 7, 1],
    [2, 8, 1],
    [2, 9, 1],
    [2, 10, 1],
  ],
};
const OXYGEN = {
  atoms: [
    ['O', -10, 0],
    ['O', 10, 0],
  ],
  bonds: [[0, 1, 2]],
};
const CO2 = {
  atoms: [
    ['O', -22, 0],
    ['C', 0, 0],
    ['O', 22, 0],
  ],
  bonds: [
    [0, 1, 2],
    [1, 2, 2],
  ],
};
const WATER = {
  atoms: [
    ['O', 0, -4],
    ['H', -15, 8],
    ['H', 15, 8],
  ],
  bonds: [
    [0, 1, 1],
    [0, 2, 1],
  ],
};

/**
 * The four species: their cartoon, formula (TeX), name, atoms per molecule, and the half-size of
 * their cartoon (for packing a pile of them).
 */
export const SPECIES = [
  { key: 'propane', mol: PROPANE, tex: String.raw`\mathrm{C_3H_8}`, name: 'propane', atoms: { C: 3, H: 8, O: 0 }, size: [52, 36] },
  { key: 'oxygen', mol: OXYGEN, tex: String.raw`\mathrm{O_2}`, name: 'oxygen', atoms: { C: 0, H: 0, O: 2 }, size: [24, 14] },
  { key: 'co2', mol: CO2, tex: String.raw`\mathrm{CO_2}`, name: 'carbon dioxide', atoms: { C: 1, H: 0, O: 2 }, size: [36, 14] },
  { key: 'water', mol: WATER, tex: String.raw`\mathrm{H_2O}`, name: 'water', atoms: { C: 0, H: 2, O: 1 }, size: [25, 18] },
];

/** One atom: a ball with a soft highlight. */
export function Atom({ el, x = 0, y = 0, scale = 1 }) {
  const { fill, r } = ATOM[el];
  const R = r * scale;
  return (
    <g>
      <circle cx={x} cy={y} r={R} fill={fill} stroke="#14213d" strokeWidth={1.3 * Math.min(1, scale + 0.2)} />
      <circle cx={x - R * 0.32} cy={y - R * 0.34} r={R * 0.3} fill="#fff" opacity={el === 'H' ? 0 : 0.35} />
    </g>
  );
}

/** A molecule's cartoon at (x, y), `scale` times its size. */
export function Molecule({ mol, x = 0, y = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {mol.bonds.map(([i, j, order], k) => {
        const [, x1, y1] = mol.atoms[i];
        const [, x2, y2] = mol.atoms[j];
        const len = Math.hypot(x2 - x1, y2 - y1);
        const [nx, ny] = [-(y2 - y1) / len, (x2 - x1) / len];
        const offs = order === 2 ? [-2.6, 2.6] : [0];
        return offs.map((o) => (
          <line key={`${k}${o}`} x1={x1 + o * nx} y1={y1 + o * ny} x2={x2 + o * nx} y2={y2 + o * ny} stroke={BOND} strokeWidth={order === 2 ? 2.4 : 3.4} strokeLinecap="round" />
        ));
      })}
      {mol.atoms.map(([el, ax, ay], k) => (
        <Atom key={k} el={el} x={ax} y={ay} />
      ))}
    </g>
  );
}

/**
 * `count` molecules of a species packed in a box `w` × `h` (px) centred at (cx, cy): in a grid of
 * as few rows and columns as fit, the molecules shrinking as there are more.
 */
export function Pile({ species, count, cx, cy, w, h }) {
  if (count <= 0) return null;
  const [hw, hh] = species.size;
  let best = { scale: 0 };
  for (let cols = 1; cols <= count; cols += 1) {
    const rows = Math.ceil(count / cols);
    const scale = Math.min(1.7, w / (cols * 2 * hw * 1.12), h / (rows * 2 * hh * 1.2));
    if (scale > best.scale) best = { scale, cols, rows };
  }
  const { scale, cols, rows } = best;
  const dx = 2 * hw * 1.12 * scale;
  const dy = 2 * hh * 1.2 * scale;
  const out = [];
  for (let k = 0; k < count; k += 1) {
    const i = Math.floor(k / cols);
    const inRow = i === rows - 1 ? count - cols * (rows - 1) : cols;
    const j = k % cols;
    const x = cx + (j - (inRow - 1) / 2) * dx;
    const y = cy + (i - (rows - 1) / 2) * dy;
    out.push(<Molecule key={k} mol={species.mol} x={x} y={y} scale={scale} />);
  }
  return <g>{out}</g>;
}
