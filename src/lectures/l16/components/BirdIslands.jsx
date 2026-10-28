import { memo, useEffect, useId, useState } from 'react';
import Fragment from './Fragment.jsx';
import { INK, ISLES, matvec, ease, clamp, rng, useOnScreen, whole, head } from './markov.js';

export const W = 1180;
export const H = 540;
const HORIZON = 188;
export const SPRITES = 300; // each bird drawn stands for 100 birds

/**
 * The islands as in the textbook's figure (C at the back, A and B in front): where each is drawn
 * (`at`, its size `s`), the ellipse its birds circle in (`cloud`, `rx`, `ry`, at most `max` times
 * wider for a crowd) and its label.
 */
export const ISLANDS = [
  { name: 'A', at: [235, 420], s: 1, cloud: [235, 258], rx: 168, ry: 58, max: 1.4, label: [235, 455] },
  { name: 'B', at: [945, 420], s: 1, flip: true, cloud: [945, 258], rx: 168, ry: 58, max: 1.4, label: [945, 455] },
  { name: 'C', at: [590, 248], s: 0.68, cloud: [590, 110], rx: 126, ry: 44, max: 1.2, label: [590, 272] },
];

// the middle of each flight's curve, from island j (the first index) to island i: A and B fly to
// each other in front of C, on two lanes; between C and A or B, a lane on each side
const CTRL = [
  [null, [590, 428], [405, 172]],
  [[590, 560], null, [800, 150]],
  [[445, 262], [735, 262], null],
];

/** The point at e (0 to 1) on the curve from p0 to p1 through c (quadratic). */
const quad = (p0, c, p1, e) => {
  const s = 1 - e;
  return [0, 1].map((q) => s * s * p0[q] + 2 * s * e * c[q] + e * e * p1[q]);
};

/** The point at e on the lane from island i to island j. */
const lane = (i, j, e) => quad(ISLANDS[i].cloud, CTRL[i][j], ISLANDS[j].cloud, e);

// where the number of birds on a flight is written: on its lane's arrow, in the middle (birds that
// stay: beside their island)
const flowAt = (i, j) => (i === j ? [ISLANDS[i].cloud[0] + 205, ISLANDS[i].cloud[1] - 28] : lane(i, j, 0.5).map((v, q) => v + 8 * q));

// the sprites' own numbers: where each circles in its island's ellipse, how fast, its wings' phase,
// when it leaves in a year (a share of the year) and how far its flight strays from the lane
const BIRDS = Array.from({ length: SPRITES }, (_, b) => {
  const g = rng(7919 * b + 13);
  return {
    r: 0.15 + 0.85 * Math.sqrt(g()),
    th: 2 * Math.PI * g(),
    w: (0.12 + 0.24 * g()) * (g() < 0.5 ? -1 : 1),
    ph: 2 * Math.PI * g(),
    del: 0.28 * g(),
    jx: 80 * (g() - 0.5),
    jy: 70 * (g() - 0.5),
  };
});

// the year: the flights of years 1 to 3 slowly, to year 20 fast, then at an easy pace (a state
// with `steady`: every year slowly, as years 1 to 3)
const yearMs = (k) => (k < 3 ? 2600 : k < 20 ? 1150 : 2000);
const STEP = 2800; // one island's birds flying (the setup, one island per key press)
const GATHER = 2600; // all the birds flying to one island
const HOLD = 900; // before the first flight
const FLY = 0.7; // the share of a year a bird spends in the air

/** n_0, n_1, …, n_60 for the migration M (the numbers have long settled by then). */
export function history(M, n0, years = 60) {
  const out = [n0];
  for (let k = 0; k < years; k += 1) out.push(matvec(M, out[k]));
  return out;
}
const at = (hist, k) => hist[Math.min(k, hist.length - 1)];

/**
 * The sprites' islands a year later: each island's sprites, shuffled, split as its column of M
 * says; what rounding leaves over goes at random, with the chances of the remainders (so a lone
 * bird goes either way). The sprites follow the numbers, and each sprite moves at random.
 */
export function migrate(M, where, seed) {
  const rand = rng(seed);
  const to = where.slice();
  for (let i = 0; i < 3; i += 1) {
    const S = [];
    where.forEach((w, b) => w === i && S.push(b));
    for (let a = S.length - 1; a > 0; a -= 1) {
      const j = Math.floor(rand() * (a + 1));
      [S[a], S[j]] = [S[j], S[a]];
    }
    const want = M.map((row) => row[i] * S.length);
    const n = want.map((x) => Math.floor(x + 1e-9));
    const rest = want.map((x, j) => Math.max(0, x - n[j]));
    for (let left = S.length - n.reduce((s, x) => s + x, 0); left > 0; left -= 1) {
      let pick = rand() * rest.reduce((s, x) => s + x, 0);
      let j = 0;
      while (j < 2 && pick >= rest[j]) {
        pick -= rest[j];
        j += 1;
      }
      n[j] += 1;
      rest[j] = 0;
    }
    let next = 0;
    n.forEach((c, j) => {
      for (let q = 0; q < c; q += 1) {
        to[S[next]] = j;
        next += 1;
      }
    });
  }
  return to;
}

export const EQUAL = [10000, 10000, 10000];
export const START = Array.from({ length: SPRITES }, (_, b) => b % 3);
export const allOn = (i) => Array(SPRITES).fill(i);
export const allBirds = (i) => [0, 1, 2].map((j) => (j === i ? 30000 : 0));

/**
 * The state of the islands, for the migration M: a phase (`hover`: the birds circling their
 * islands; `step`: the birds of `island` flying, the setup; `year`: a year's flights; `gather`:
 * all the birds flying to the islands `target`; `hold`: a pause before the years run), from `t0`
 * for `dur` ms of the clock (ms, running only while the slide is on screen). `from` and `to`: the
 * sprites' islands at the start and the end of year k; `moved`: whose birds have flown this year
 * (the setup); the numbers `hist`, and those on the islands from `cFrom` to `cTo` in the phase; the
 * numbers on the flights of the setup (`flows`); the seed of the shuffles; the island all the birds started on (`start`, null: 10,000 on each).
 */
function base(M, from, n0, seed) {
  return {
    M,
    clock: 0,
    phase: 'hover',
    island: null,
    t0: 0,
    dur: Infinity,
    from,
    to: migrate(M, from, seed * 1000),
    moved: [false, false, false],
    pts: null,
    k: 0,
    hist: history(M, n0),
    cFrom: n0,
    cTo: n0,
    flows: [],
    seed,
    start: null,
    run: false,
    home: false,
  };
}

/** 10,000 birds on each island, circling. */
export const idle = (M) => ({ ...base(M, START, EQUAL, 1), home: true });

/** The next year: the sprites where they landed, their flights for the year after. */
function nextYear(st) {
  const k = st.k + 1;
  const n = at(st.hist, k);
  return { ...st, k, from: st.to, to: migrate(st.M, st.to, st.seed * 1000 + k), moved: [false, false, false], cFrom: n, cTo: n };
}

/** Island i's birds fly (the setup), the numbers on their flights written on the lanes. */
export function startStep(st, i) {
  const n = at(st.hist, st.k)[i];
  const cTo = st.cTo.map((x, j) => x + st.M[j][i] * n - (j === i ? n : 0));
  const flows = [0, 1, 2].filter((j) => st.M[j][i] > 0).map((j) => ({ from: i, to: j, n: st.M[j][i] * n, t: st.clock }));
  return { ...st, phase: 'step', island: i, t0: st.clock, dur: STEP, cFrom: st.cTo, cTo, flows: [...st.flows, ...flows], home: false };
}

/** Island i's birds landed; after the third island, the year is done. */
function endStep(st) {
  const moved = st.moved.map((m, j) => m || j === st.island);
  const done = { ...st, phase: 'hover', island: null, dur: Infinity, moved, cFrom: st.cTo, flows: st.flows.map((f) => ({ ...f, t: -Infinity })) };
  return moved.every(Boolean) ? nextYear(done) : done;
}

/** The setup after `steps` islands' birds have flown (0 to 3), still. */
export function setup(M, steps) {
  let st = idle(M);
  for (let i = 0; i < steps; i += 1) st = endStep(startStep(st, i));
  return { ...st, home: steps === 0 };
}

/** The years run, from where the birds are. */
export const startRun = (st) => ({ ...st, phase: 'hold', t0: st.clock, dur: HOLD, run: true, flows: [], home: false });

/** The same islands, `years` years in, still. */
export function skipTo(st, years) {
  let s = { ...st, flows: [] };
  while (s.k < years) s = nextYear(s);
  return { ...s, phase: 'hover', dur: Infinity, home: false };
}

/** All the birds on island i, still (print mode). */
export const fromAll = (M, i, seed) => base(M, allOn(i), allBirds(i), seed);

const yearPhase = (st, t0) => ({ ...st, phase: 'year', t0, dur: yearMs(st.steady ? 0 : st.k), cFrom: at(st.hist, st.k), cTo: at(st.hist, st.k + 1) });

/** The state `dt` ms later. */
export function advance(s, dt) {
  let st = { ...s, clock: s.clock + dt };
  while (st.clock - st.t0 >= st.dur) {
    const t0 = st.t0 + st.dur;
    if (st.phase === 'step') st = { ...endStep(st), t0 };
    else if (st.phase === 'gather') {
      const fresh = { ...base(st.M, st.target, st.cTo, st.nextSeed), clock: st.clock, t0, start: st.start, run: st.run, steady: st.steady };
      st = st.run ? { ...fresh, phase: 'hold', dur: HOLD } : { ...fresh, home: st.start === null };
    } else if (st.phase === 'hold') st = yearPhase(st, t0);
    else st = yearPhase(nextYear(st), t0);
  }
  return st;
}

/** The share of the phase gone by at `clock`. */
const phaseShare = (st, clock) => (st.dur === Infinity ? 0 : clamp((clock - st.t0) / st.dur));

/** The numbers on the islands at `clock`: they glide to the next ones as the birds land. */
export function counts(st, clock) {
  const e = ease(clamp((phaseShare(st, clock) - 0.2) / 0.78));
  return st.cFrom.map((x, i) => x + (st.cTo[i] - x) * e);
}

/** The island ellipses' sizes: a crowd circles wider. */
const spread = (c) => c.map((n, i) => clamp((n / 10000) ** 0.3, 0.8, ISLANDS[i].max));

/** Sprite b circling island i at t seconds (on the sea: its rise and fall come when it is drawn). */
function circling(b, i, t, g) {
  const I = ISLANDS[i];
  const B = BIRDS[b];
  const a = B.th + B.w * t;
  const r = B.r * (1 + 0.07 * Math.sin(0.9 * t + B.ph));
  return [I.cloud[0] + g[i] * I.rx * r * Math.cos(a), I.cloud[1] + g[i] * I.ry * r * Math.sin(a)];
}

/** Each sprite at `clock`: [x, y, flying?, its hop's height]. */
export function birds(st, clock) {
  const t = clock / 1000;
  const g = spread(counts(st, clock));
  const share = phaseShare(st, clock);
  return BIRDS.map((B, b) => {
    if (st.phase === 'gather') {
      const u = clamp((share - 0.4 * B.del) / FLY);
      const [p0, p1] = [st.pts[b], circling(b, st.target[b], t, g)];
      return [...quad(p0, [(p0[0] + p1[0]) / 2 + B.jx, Math.min(p0[1], p1[1]) - 70 + B.jy], p1, ease(u)), u > 0 && u < 1, 0];
    }
    const [from, to] = [st.from[b], st.to[b]];
    const flies = st.phase === 'year' || (st.phase === 'step' && st.island === from);
    if (!flies) return [...circling(b, st.moved[from] ? to : from, t, g), false, 0];
    const u = clamp((share - B.del) / FLY);
    if (from === to) {
      // staying: in the setup, a hop up and back, so that the key press shows them too
      const p = circling(b, to, t, g);
      return st.phase === 'step' ? [...p, u > 0 && u < 1, 46 * Math.sin(Math.PI * ease(u))] : [...p, false, 0];
    }
    const c = [CTRL[from][to][0] + B.jx, CTRL[from][to][1] + B.jy];
    return [...quad(circling(b, from, t, g), c, circling(b, to, t, g), ease(u)), u > 0 && u < 1, 0];
  });
}

/** All the birds fly to the islands `target` (the numbers `n0`); then, if `run`, the years start. */
export function gather(s, target, n0, { start, run, seed }) {
  const pts = birds(s, s.clock).map(([x, y]) => [x, y]);
  return { ...s, phase: 'gather', t0: s.clock, dur: GATHER, pts, target, cFrom: counts(s, s.clock), cTo: n0, flows: [], start, run, nextSeed: seed, home: false };
}

/** Back to 10,000 birds on each island (`run`: and the years start). */
export function toStart(s, run) {
  if (s.home && s.phase === 'hover') return run ? startRun(s) : s;
  return gather(s, START, EQUAL, { start: null, run, seed: 1 });
}

/** The year shown: it turns as the birds land. */
export function yearOf(st, clock) {
  return st.phase === 'year' && phaseShare(st, clock) >= 0.6 ? st.k + 1 : st.k;
}

/**
 * The state of the islands and its clock, running while the slide holding `ref` is on screen
 * (not in print mode).
 */
export function useBirds(ref, initial, print) {
  const [st, setSt] = useState(initial);
  const onScreen = useOnScreen(ref);
  useEffect(() => {
    if (print || !onScreen) return undefined;
    let frame;
    let last;
    const step = (now) => {
      const dt = last === undefined ? 0 : Math.min(50, now - last);
      last = now;
      setSt((s) => advance(s, dt));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [onScreen, print]);
  return [st, setSt];
}

// the view: the sea from above, at a slant (a circle on the sea looks squashed, like the flocks'
// ellipses): [how much of a length along the sea shows on the screen, how much of a height]
const SLANT = [0.42, Math.sqrt(1 - 0.42 ** 2)];

// a bird seen from above, flying along u, its right half (v > 0): its body, beak to tail; its
// wing, along the leading edge out to the tip and back along the trailing edge, bent at the wrist
// (v = WRIST)
const BODY = [
  [7.6, 0],
  [6.4, 1],
  [4.6, 1.3],
  [1.2, 2.1],
  [-3, 1.7],
  [-5, 1.2],
  [-8.6, 2.3],
  [-9.2, 0],
];
const WING = [
  [2.4, 1.4],
  [3.2, 6],
  [0.4, 10],
  [-3.8, 13.2],
  [-3.2, 10.8],
  [-2.3, 7],
  [-2.6, 4],
  [-2.2, 1.4],
];
const WRIST = 6;

/** A closed outline, wound the same way whatever the view, so that a bird's pieces fill as one. */
function outline(pts) {
  const area = pts.reduce((a, p, q) => {
    const r = pts[(q + 1) % pts.length];
    return a + p[0] * r[1] - r[0] * p[1];
  }, 0);
  return `M${(area < 0 ? pts.slice().reverse() : pts).map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z`;
}

/**
 * A bird at (x, y), `k` times its size, heading `h` (on the sea), its wings raised `a1` at the
 * shoulder and `a2` more past the wrist, as a piece of a path (also IslandMap's birds).
 */
export function bird(x, y, k, h, [a1, a2]) {
  const [c, s] = [Math.cos(h), Math.sin(h)];
  const put = (u, v, z) => [x + k * (u * c - v * s), y + k * ((u * s + v * c) * SLANT[0] - z * SLANT[1])];
  const body = BODY.concat(
    BODY.slice(1, -1)
      .reverse()
      .map(([u, v]) => [u, -v]),
  ).map(([u, v]) => put(u, v, 0));
  const wing = (side) =>
    WING.map(([u, v]) => {
      const [r, o] = [Math.min(v, WRIST), Math.max(v - WRIST, 0)];
      return put(u, side * (r * Math.cos(a1) + o * Math.cos(a1 + a2)), r * Math.sin(a1) + o * Math.sin(a1 + a2));
    });
  return outline(body) + outline(wing(1)) + outline(wing(-1));
}

/** Far birds (high up, by C) are drawn smaller. */
const depth = (y) => clamp(0.62 + (0.4 * (y - 110)) / (258 - 110), 0.62, 1.04);

/**
 * The wings' angles at t seconds: beating in flight; while circling, gliding, the wrists up and the
 * tips down, with a few beats now and then.
 */
function wings(B, t, flying) {
  if (flying) {
    const f = 2 * Math.PI * 3.2 * t + B.ph;
    return [0.12 + 0.62 * Math.sin(f), 0.38 * Math.sin(f - 0.8)];
  }
  const beat = clamp((Math.sin(0.5 * t + B.ph) - 0.55) / 0.45);
  const f = 2 * Math.PI * 2.6 * t + B.ph;
  return [0.22 + 0.5 * beat * Math.sin(f), -0.28 * (1 - beat) + 0.3 * beat * Math.sin(f - 0.8)];
}

/** An island: the shallows, the beach, a green hill and a small tree (also Careful's). */
export function Island({ at: [x, y], s, flip }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse rx="230" ry="54" fill="#c4f1ef" opacity="0.8" />
      <ellipse rx="196" ry="38" fill="#f3dfab" />
      <path d="M-150,-2 C-110,-50 -56,-74 0,-74 C56,-74 110,-50 150,-2 Q0,22 -150,-2 Z" fill="#6aa84f" />
      <path d="M-40,-66 L-40,-92" stroke="#8a5a32" strokeWidth="7" strokeLinecap="round" />
      <g fill="#3f8a3c">
        <circle cx="-40" cy="-104" r="19" />
        <circle cx="-55" cy="-94" r="14" />
        <circle cx="-25" cy="-94" r="14" />
      </g>
    </g>
  );
}

/** A cloud in the sky, drifting (CSS). */
function Cloud({ x, y, s, delay }) {
  return (
    <g className="l16-birds-cloud" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(${x},${y}) scale(${s})`} fill="#fff" opacity="0.9">
        <ellipse cx="0" cy="8" rx="64" ry="16" />
        <circle cx="-26" cy="0" r="20" />
        <circle cx="4" cy="-10" r="27" />
        <circle cx="32" cy="2" r="18" />
      </g>
    </g>
  );
}

/**
 * The sky, the sea, the clouds and the islands: drawn once. The gradients' ids are this picture's
 * own: with one id for all, a slide far from the title slide lost its sky and sea (the id named the
 * title slide's copy, hidden by reveal).
 */
const Backdrop = memo(function Backdrop({ plain }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  if (plain)
    return (
      <g>
        {[2, 0, 1].map((i) => (
          <Island key={i} {...ISLANDS[i]} />
        ))}
      </g>
    );
  return (
    <g>
      <defs>
        <linearGradient id={`l16-birds-sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcdcf3" />
          <stop offset="1" stopColor="#eef7fc" />
        </linearGradient>
        <linearGradient id={`l16-birds-sea${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd6e6" />
          <stop offset="1" stopColor="#3f8fc0" />
        </linearGradient>
      </defs>
      <rect width={W} height={HORIZON} fill={`url(#l16-birds-sky${uid})`} />
      <rect y={HORIZON} width={W} height={H - HORIZON} fill={`url(#l16-birds-sea${uid})`} />
      <rect y={HORIZON - 3} width={W} height={7} fill="#fff" opacity="0.45" />
      <Cloud x={500} y={46} s={0.9} delay={0} />
      <Cloud x={845} y={70} s={0.7} delay={-6} />
      <Cloud x={1080} y={150} s={0.6} delay={-11} />
      {[2, 0, 1].map((i) => (
        <Island key={i} {...ISLANDS[i]} />
      ))}
    </g>
  );
});

/** An island's label: its name (in its colour) and its number of birds. */
function Label({ i, n }) {
  const [x, y] = ISLANDS[i].label;
  const w = i === 2 ? 158 : 178;
  return (
    <g>
      <rect x={x - w / 2} y={y - 27} width={w} height={54} rx={12} fill="#fff" opacity="0.92" stroke={ISLES[i].color} strokeWidth="2" />
      <text x={x} y={y - 6} textAnchor="middle" className="l16-birds-name" fill={ISLES[i].color}>
        Island {ISLANDS[i].name}
      </text>
      <text x={x} y={y + 20} textAnchor="middle" className="l16-birds-count" fill={INK}>
        {whole(n)} birds
      </text>
    </g>
  );
}

/**
 * The islands at `clock`: the birds circling and flying (each stands for 100 birds, in the colour
 * of the island it was on at the start of the year), the numbers on the islands and on the setup's
 * flights, and the year. A click
 * on an island calls `onIsland(i)`. `bare`: only the picture, `width` px wide (the title slide).
 * `plain`: no sky, sea or clouds, and each island's letter in place of its label (Example 2's small
 * reminder).
 */
export default function BirdIslands({ st, clock = st.clock, onIsland, bare = false, plain = false, width = W }) {
  const t = clock / 1000;
  const pos = birds(st, clock);
  const was = birds(st, clock - 60);
  const n = counts(st, clock);
  const flocks = ['', '', ''];
  pos.forEach(([x, y, flying, hop], b) => {
    const B = BIRDS[b];
    // its heading on the sea, from where it was a moment ago (still: along its circle)
    const [dx, dy] = [x - was[b][0], (y - was[b][1]) / SLANT[0]];
    const h = Math.hypot(dx, dy) > 0.05 ? Math.atan2(dy, dx) : B.th + (Math.PI / 2) * Math.sign(B.w);
    const k = 0.92 * depth(y);
    flocks[st.from[b]] += bird(x, y - hop - 4 * Math.sin(1.7 * t + B.ph), k, h, wings(B, t, flying));
  });
  const svg = (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={(width * H) / W} aria-hidden="true">
      <Backdrop plain={plain} />
      {flocks.map((d, i) => (
        <path key={i} d={d} fill={ISLES[i].color} />
      ))}
      {!bare && (
        <>
          {st.flows.map((f) => {
            // the flight as a dashed arrow on its lane, from a little past one island to before the
            // other, and the number on it
            const [x, y] = flowAt(f.from, f.to);
            const color = ISLES[f.from].color;
            const pts = f.from === f.to ? [] : Array.from({ length: 21 }, (_, q) => lane(f.from, f.to, 0.2 + 0.03 * q));
            return (
              <g key={`${f.from}-${f.to}`} opacity={clamp((clock - f.t) / 500)}>
                {pts.length > 0 && (
                  <>
                    <polyline points={pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')} fill="none" stroke={color} strokeWidth="3" strokeDasharray="9 7" />
                    <polygon points={head(pts[19], pts[20], 16, 14)} fill={color} />
                  </>
                )}
                <text x={x} y={y} textAnchor="middle" className="l16-birds-flow" fill={color}>
                  {whole(f.n)}
                  {f.from === f.to ? ' stay' : ''}
                </text>
              </g>
            );
          })}
          {ISLANDS.map((I, i) =>
            plain ? (
              <text key={I.name} x={I.at[0]} y={I.at[1] + 100 * I.s} textAnchor="middle" className="l16-birds-letter" fill={ISLES[i].color}>
                {I.name}
              </text>
            ) : (
              <Label key={I.name} i={i} n={n[i]} />
            ),
          )}
          {onIsland &&
            ISLANDS.map((I, i) => (
              <ellipse
                key={I.name}
                className="clickable"
                cx={I.cloud[0]}
                cy={(I.cloud[1] + I.label[1]) / 2}
                rx={I.rx * 1.25}
                ry={(I.label[1] - I.cloud[1]) / 2 + 40}
                fill="transparent"
                onClick={() => onIsland(i)}
              />
            ))}
        </>
      )}
    </svg>
  );
  if (bare) return svg;
  return (
    <div className="l16-birds">
      {svg}
      <div className="l16-birds-year">Year {yearOf(st, clock)}</div>
    </div>
  );
}

/** Print mode: a still per key press, stacked, each shown from key press i to the next. */
export function Stills({ stills }) {
  return (
    <div className="l16-stack">
      {stills.map((st, i) => {
        const pic = <BirdIslands st={st} />;
        if (i === stills.length - 1) return i ? <Fragment key={i} index={i}>{pic}</Fragment> : pic;
        const out = (
          <Fragment index={i + 1} effect="fade-out">
            {pic}
          </Fragment>
        );
        return i ? (
          <Fragment key={i} index={i}>
            {out}
          </Fragment>
        ) : (
          <div key={i}>{out}</div>
        );
      })}
    </div>
  );
}
