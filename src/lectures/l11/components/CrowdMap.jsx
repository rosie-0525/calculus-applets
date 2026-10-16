import { useEffect, useMemo, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';
import { PRINT } from './print.js';
import { levelSegments, segmentsPath } from './levels.js';
import { WIDE, sendUnits, N_UNITS } from './crowd.js';

const BLUE = '#1d4ed8';
const ARROW = '#8c1515';
const LEVEL = '#0f6278';
const LEVEL_STEP = 50; // the level curves of D, every 50 map pixels

const f1 = (v) => v.toFixed(1);
const closed = (pts) => `M ${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L ')} Z`;

/** The scenery of a world: grass, the river and its bridges, the rocks and the trees (built once). */
const SCENERY = new Map();
function sceneryOf(world) {
  if (SCENERY.has(world)) return SCENERY.get(world);
  const { MAP, ROCKS, BRIDGES, BRIDGE_HW, RIVER_HW, riverX, blockedAt } = world;
  const { W, H } = MAP;
  const left = [];
  const right = [];
  for (let y = -8; y <= H + 8; y += 6) {
    left.push([riverX(y) - RIVER_HW, y]);
    right.push([riverX(y) + RIVER_HW, y]);
  }
  const river = closed([...left, ...right.reverse()]);
  const bridges = BRIDGES.map((b) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let y = b - BRIDGE_HW; y <= b + BRIDGE_HW; y += 2) {
      lo = Math.min(lo, riverX(y) - RIVER_HW);
      hi = Math.max(hi, riverX(y) + RIVER_HW);
    }
    return { x: lo - 8, w: hi - lo + 16, y: b - BRIDGE_HW, h: 2 * BRIDGE_HW };
  });
  let s = 11;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const tufts = [];
  while (tufts.length < (170 * W * H) / (1160 * 504)) {
    const x = rnd() * W;
    const y = rnd() * H;
    if (!blockedAt(x, y) && !blockedAt(x, y + 6)) tufts.push(`M ${f1(x - 3)} ${f1(y + 2)} l 2 -5 M ${f1(x)} ${f1(y + 2)} l 0 -6 M ${f1(x + 3)} ${f1(y + 2)} l -2 -5`);
  }
  const rocks = ROCKS.map((pts) => {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return { d: closed(pts), hl: closed(pts.map(([x, y]) => [cx - 5 + 0.55 * (x - cx), cy - 6 + 0.5 * (y - cy)])) };
  });
  const out = { river, bridges, tufts: tufts.join(' '), rocks };
  SCENERY.set(world, out);
  return out;
}

function Scenery({ world }) {
  const { river, bridges, tufts, rocks } = sceneryOf(world);
  const { MAP, TREES } = world;
  const { W, H } = MAP;
  return (
    <g>
      <rect width={W} height={H} fill="#d3e5b3" />
      <path d={tufts} fill="none" stroke="#a9c784" strokeWidth="1.2" strokeLinecap="round" />
      <path d={river} fill="#8ec3e6" stroke="#5f9fcd" strokeWidth="2" />
      {bridges.map((b) => (
        <g key={b.y}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#c49a64" stroke="#7c5a30" strokeWidth="2" />
          <path
            d={Array.from({ length: Math.floor(b.w / 7) }, (_, k) => `M ${f1(b.x + 7 * (k + 1))} ${b.y + 3} v ${b.h - 6}`).join(' ')}
            stroke="#9b7444"
            strokeWidth="1.2"
          />
          <path d={`M ${b.x} ${b.y + 2} h ${b.w} M ${b.x} ${b.y + b.h - 2} h ${b.w}`} stroke="#6b4a24" strokeWidth="3" />
        </g>
      ))}
      {rocks.map((r) => (
        <g key={r.d}>
          <path d={r.d} fill="#9aa0a8" stroke="#5f6670" strokeWidth="2" strokeLinejoin="round" />
          <path d={r.hl} fill="#b8bdc4" />
        </g>
      ))}
      {TREES.map(([x, y, r]) => (
        <g key={`${x},${y}`}>
          <circle cx={x} cy={y} r={r} fill="#3f7a3a" stroke="#2c5629" strokeWidth="1.5" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.45} fill="#5c9a50" />
        </g>
      ))}
    </g>
  );
}

/** A unit: a triangle at (x, y) pointing along its heading h. */
function triangle(x, y, h) {
  const c = Math.cos(h);
  const s = Math.sin(h);
  return [
    [x + 6.5 * c, y + 6.5 * s],
    [x - 4.5 * c - 4 * s, y - 4.5 * s + 4 * c],
    [x - 4.5 * c + 4 * s, y - 4.5 * s - 4 * c],
  ];
}

/** The goal: a ring and a dot, as a move order in a game (it pings when it is set). */
function Goal({ at, ping }) {
  return (
    <g className="crowd-goal">
      <circle key={ping} className="crowd-ping" cx={at[0]} cy={at[1]} r="15" fill="none" stroke="#15803d" strokeWidth="3" />
      <circle cx={at[0]} cy={at[1]} r="15" fill="none" stroke="#15803d" strokeWidth="3" />
      <circle cx={at[0]} cy={at[1]} r="4" fill="#15803d" />
    </g>
  );
}

/** The level curves of D, every LEVEL_STEP. */
function Levels({ world, field }) {
  const g = useMemo(() => world.levelGridOf(field), [world, field]);
  const curves = [];
  let max = 0;
  for (const d of field.D) if (Number.isFinite(d) && d > max) max = d;
  for (let c = LEVEL_STEP; c < max; c += LEVEL_STEP) {
    curves.push(
      <path key={c} d={segmentsPath(levelSegments(g, c), (p) => p)} fill="none" stroke={LEVEL} strokeWidth="1.5" strokeOpacity="0.8" />,
    );
  }
  return <g>{curves}</g>;
}

/** The arrows of −∇D (unit vectors) on a lattice. */
function Arrows({ world, field }) {
  const { MAP, blockedAt, dirAt } = world;
  const { W, H } = MAP;
  const out = [];
  for (let y = 24; y < H; y += 40) {
    for (let x = 24; x < W; x += 40) {
      if (blockedAt(x, y)) continue;
      const [ux, uy] = dirAt(field, x, y);
      if (!ux && !uy) continue;
      const [ax, ay] = [x - 10 * ux, y - 10 * uy];
      const [bx, by] = [x + 10 * ux, y + 10 * uy];
      const head = `M ${f1(bx)} ${f1(by)} L ${f1(bx - 6 * ux - 3.5 * uy)} ${f1(by - 6 * uy + 3.5 * ux)} L ${f1(bx - 6 * ux + 3.5 * uy)} ${f1(by - 6 * uy - 3.5 * ux)} Z`;
      out.push(
        <g key={`${x},${y}`}>
          <path d={`M ${f1(ax)} ${f1(ay)} L ${f1(bx - 4 * ux)} ${f1(by - 4 * uy)}`} stroke={ARROW} strokeWidth="2" strokeLinecap="round" />
          <path d={head} fill={ARROW} />
        </g>,
      );
    }
  }
  return <g>{out}</g>;
}

/**
 * The map of a strategy game with an army of 300 units: a click sets the goal, and each unit moves
 * in the direction of −∇D, D the walking distance to the goal (crowd.js). The units are drawn on a
 * canvas over the map. `world`: the map (crowd.js: WIDE or SQUARE). `preset`: the world's goal is
 * set before any click. `levels`, `arrows`: the key presses that show the level curves of D and the
 * arrows of −∇D. In print mode, the units are drawn as they are `still` seconds after setting off
 * toward the world's goal.
 */
export default function CrowdMap({ world = WIDE, width = world.MAP.W, preset = false, levels, arrows, still = 4.2 }) {
  const { MAP, GOAL, blockedAt, distanceField, makeUnits, step, simulate } = world;
  const { W, H } = MAP;
  const height = (width * H) / W;
  const [goal, setGoal] = useState(PRINT || preset ? GOAL : null);
  const [ping, setPing] = useState(0);
  const field = useMemo(() => goal && distanceField(goal), [goal, distanceField]);
  const units = useRef(null);
  if (!units.current) units.current = makeUnits();
  const fieldRef = useRef(field);
  const canvas = useRef(null);
  const frame = useRef(0);
  const printed = useMemo(() => (PRINT ? simulate(distanceField(GOAL), still) : null), [still, simulate, distanceField, GOAL]);

  const draw = () => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const k = cv.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const { x, y, h } = units.current;
    ctx.fillStyle = BLUE;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let n = 0; n < N_UNITS; n += 1) {
      const [a, b, c] = triangle(x[n], y[n], h[n]);
      ctx.moveTo(...a);
      ctx.lineTo(...b);
      ctx.lineTo(...c);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.fill();
  };

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = () => {
    cancelAnimationFrame(frame.current);
    let last;
    let acc = 0;
    let still_ = 0;
    const tick = (ms) => {
      const dt = last === undefined ? 0 : Math.min(0.05, (ms - last) / 1000);
      last = ms;
      acc += dt;
      let most = 0;
      while (acc >= 1 / 60) {
        most = Math.max(most, step(units.current, fieldRef.current, 1 / 60));
        acc -= 1 / 60;
      }
      draw();
      still_ = most < 0.02 ? still_ + 1 : 0;
      if (still_ < 30) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const onClick = (e) => {
    if (PRINT) return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const xy = [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
    if (blockedAt(...xy)) return;
    fieldRef.current = distanceField(xy);
    setGoal(xy);
    setPing((p) => p + 1);
    sendUnits(units.current);
    run();
  };

  return (
    <div className="crowd-map" style={{ width, height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={width}
        height={height}
        role="img"
        aria-label="The map of a strategy game: an army of 300 units, a river with two bridges, rocks and trees"
        onClick={onClick}
        data-prevent-swipe
      >
        <Scenery world={world} />
        {levels !== undefined && field && (
          <Fragment as="g" index={levels}>
            <Levels world={world} field={field} />
          </Fragment>
        )}
        {arrows !== undefined && field && (
          <Fragment as="g" index={arrows}>
            <Arrows world={world} field={field} />
          </Fragment>
        )}
        {goal && <Goal at={goal} ping={ping} />}
        {printed && (
          <g fill={BLUE} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" paintOrder="stroke">
            {Array.from({ length: N_UNITS }, (_, n) => (
              <path key={n} d={closed(triangle(printed.x[n], printed.y[n], printed.h[n]))} />
            ))}
          </g>
        )}
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="none" stroke="#9ca3af" strokeWidth="1" />
      </svg>
      {!PRINT && <canvas ref={canvas} width={2 * width} height={2 * height} style={{ width, height }} />}
    </div>
  );
}
