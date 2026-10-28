import { useEffect, useMemo, useRef } from 'react';

// the island's columns: the number of blocks above the ground (0: grass at ground level), row by
// row from the back (z = −3) to the front; '.' has no column
const HEIGHT = ['..000..', '.01110.', '0122100', '0111000', '0010000', '.00000.', '..000..'];
const TREE = [1, 1]; // x, z of the tree's trunk
const POND = ['-1,2', '0,2']; // x, z of the water at the top of its column

const COLORS = {
  grass: [106, 170, 64],
  dirt: [134, 96, 67],
  stone: [128, 128, 128],
  wood: [104, 82, 52],
  woodTop: [152, 122, 78],
  leaves: [58, 128, 50],
  water: [62, 118, 222],
};

/** The island's blocks: [x, y, z, type], the block filling [x, x + 1] × [y, y + 1] × [z, z + 1]. */
function blocks() {
  const out = [];
  HEIGHT.forEach((line, row) =>
    [...line].forEach((ch, col) => {
      if (ch === '.') return;
      const [x, z] = [col - 3, row - 3];
      const top = Number(ch);
      const r = Math.hypot(x, z);
      const depth = r < 1.5 ? 3 : r < 2.5 ? 2 : 1;
      const surface = POND.includes(`${x},${z}`) ? 'water' : 'grass';
      for (let y = -depth; y <= top; y += 1) out.push([x, y, z, y === top ? surface : y >= top - 1 ? 'dirt' : 'stone']);
    }),
  );
  const [tx, tz] = TREE;
  const ground = Number(HEIGHT[tz + 3][tx + 3]) + 1;
  for (let y = ground; y < ground + 4; y += 1) out.push([tx, y, tz, 'wood']);
  for (let dx = -1; dx <= 1; dx += 1)
    for (let dz = -1; dz <= 1; dz += 1) {
      if (dx || dz) out.push([tx + dx, ground + 3, tz + dz, 'leaves']);
      if (!(dx && dz)) out.push([tx + dx, ground + 4, tz + dz, 'leaves']);
    }
  return out;
}

// the six faces of a unit cube: the normal, then the corners (a side face's top two first)
const FACES = [
  [[0, 1, 0], [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]]],
  [[0, -1, 0], [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]]],
  [[1, 0, 0], [[1, 1, 0], [1, 1, 1], [1, 0, 1], [1, 0, 0]]],
  [[-1, 0, 0], [[0, 1, 1], [0, 1, 0], [0, 0, 0], [0, 0, 1]]],
  [[0, 0, 1], [[1, 1, 1], [0, 1, 1], [0, 0, 1], [1, 0, 1]]],
  [[0, 0, -1], [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]]],
];

let scene;
/** Each block with its faces that no other block covers. */
function island() {
  if (!scene) {
    const list = blocks();
    const filled = new Set(list.map(([x, y, z]) => `${x},${y},${z}`));
    scene = list.map(([x, y, z, type]) => ({
      at: [x, y, z],
      type,
      faces: FACES.filter(([[a, b, c]]) => !filled.has(`${x + a},${y + b},${z + c}`)),
    }));
  }
  return scene;
}

const LIGHT = (() => {
  const l = [-0.5, 0.85, 0.6];
  const n = Math.hypot(...l);
  return l.map((t) => t / n);
})();
const TILT = 0.45; // radians: the camera looks down on the island
const CENTER = [0.5, 1.5, 0.5];

/** The island turned by `angle` (about the vertical axis), on a w × h canvas (`ratio` pixels per px). */
export function drawIsland(ctx, angle, w, h, ratio = 1) {
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  const [ct, st] = [Math.cos(TILT), Math.sin(TILT)];
  // R = (tilt about the x-axis)(turn about the y-axis): the same matrix for every corner
  const R = [
    [c, 0, s],
    [st * s, ct, -st * c],
    [-ct * s, st, ct * c],
  ];
  const apply = (p) => [0, 1, 2].map((i) => R[i][0] * p[0] + R[i][1] * p[1] + R[i][2] * p[2]);
  const k = (h / 11) * ratio;
  const [cx, cy] = [(w / 2) * ratio, (h / 2) * ratio];
  const screen = (q) => [cx + k * q[0], cy - k * q[1]];

  ctx.clearRect(0, 0, w * ratio, h * ratio);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 0.7 * ratio;
  const order = island()
    .map((b) => ({ b, depth: apply(b.at.map((t, i) => t + 0.5 - CENTER[i]))[2] }))
    .sort((p, q) => p.depth - q.depth);
  const quad = (pts, rgb, lit) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = `rgb(${rgb.map((v) => Math.round(v * lit)).join(',')})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,0.18)`;
    ctx.stroke();
  };
  for (const { b } of order) {
    for (const [n, corners] of b.faces) {
      if (apply(n)[2] <= 0) continue; // it faces away
      const lit = 0.58 + 0.42 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      const pts = corners.map((p) => screen(apply(p.map((t, i) => t + b.at[i] - CENTER[i]))));
      const top = n[1] === 1;
      let rgb = COLORS[b.type];
      if (b.type === 'grass' && !top) rgb = COLORS.dirt;
      if (b.type === 'wood' && top) rgb = COLORS.woodTop;
      quad(pts, rgb, lit);
      if (b.type === 'grass' && n[1] === 0) {
        // a grass block's side: dirt, with a band of grass along its top
        const mix = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
        quad([pts[0], pts[1], mix(pts[1], pts[2], 0.3), mix(pts[0], pts[3], 0.3)], COLORS.grass, lit);
      }
    }
  }
}

/** The island as an image (a data URL), for print mode, where canvases come out blank. */
export function islandStill(angle, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = 2 * w;
  canvas.height = 2 * h;
  drawIsland(canvas.getContext('2d'), angle, w, h, 2);
  return canvas.toDataURL('image/png');
}

/**
 * A video game's screen: a floating island of blocks turning in the sky, blocky clouds drifting
 * behind it (CSS), redrawn every frame while `on` and its slide is shown; a still in print mode.
 */
export default function VoxelIsland({ on, width, height, print = false, start = 0.6 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    drawIsland(ctx, start, width, height, 2);
    if (!on) return undefined;
    const slide = canvas.closest('section');
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      if (slide.classList.contains('present')) drawIsland(ctx, start + ((now - t0) / 1000) * 0.5, width, height, 2);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [on, width, height, start]);
  const still = useMemo(() => (print ? islandStill(start, width, height) : null), [print, start, width, height]);
  return (
    <div className="l15-game" style={{ height }}>
      <span className="l15-cloud" style={{ '--y': '18%', '--w': '62px', '--d': '0s', '--x': '40px' }} />
      <span className="l15-cloud" style={{ '--y': '42%', '--w': '44px', '--d': '-21s', '--x': '150px' }} />
      <span className="l15-cloud" style={{ '--y': '10%', '--w': '36px', '--d': '-38s', '--x': '420px' }} />
      {print ? (
        <img src={still} width={width} height={height} alt="A floating island of blocks" draggable="false" />
      ) : (
        <canvas ref={ref} width={2 * width} height={2 * height} style={{ width, height }} />
      )}
    </div>
  );
}
