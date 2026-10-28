import { useEffect, useMemo, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { bird } from './BirdIslands.jsx';
import { PRINT } from './print.js';
import { ISLES, M_BIRDS, clamp, ease, head, rng, useClock } from './markov.js';

// The three islands as in the textbook's Figure 16.1.1 (C at the top, A and B below), as the
// students can draw it: each island a circle in its colour with its letter
const VW = 620;
const VH = 590;
const AT = [
  [70, 476],
  [550, 476],
  [310, 176],
];
const R = 40;

// each flight's side of the line between its two islands: A and B's flights to each other above
// and below, the flights out of C on the outside, those into C inside (as in the textbook's
// figure). The flights inside the triangle bend little, so that the two leaving an island part at
// once; those outside bend more.
const SIDE = [
  [0, 1, -1],
  [1, 0, 1],
  [-1, 1, 0],
];
const BEND_IN = 36;
const BEND_OUT = 84;

// a share's label beside its arrow, on the side away from the arrow back: its size (about), and
// its gap from the arrow
const LABEL = 32;
const LW = 30;
const LH = 58;
const GAP = 8;

/** The centre of a label beside the point p of an arrow, in the direction n (a unit vector). */
const beside = (p, n) => {
  const d = GAP + (Math.abs(n[0]) * LW + Math.abs(n[1]) * LH) / 2;
  return [p[0] + d * n[0], p[1] + d * n[1]];
};

/** A rate as TeX: 1/2 as a fraction, 1 as 1. */
function frac(x) {
  for (let q = 1; q <= 12; q += 1) {
    const p = Math.round(x * q);
    if (Math.abs(p / q - x) < 1e-9) return q === 1 ? String(p) : `\\dfrac{${p}}{${q}}`;
  }
  return x.toFixed(2);
}

/** Inside island i's circle, of radius rad (with a margin)? */
const inside = (i, [x, y], m, rad = R) => Math.hypot(x - AT[i][0], y - AT[i][1]) < rad + m;

/**
 * The flight from island i to island j: its curve's points outside both circles, and its middle.
 * `alone`: no flight back from j to i, so a flight that would bend inside the triangle is straight,
 * its share outside the triangle (Example 2's flights into C). `rad`: the islands' radius.
 */
function flight(i, j, alone = false, rad = R) {
  const [a, b] = [AT[i], AT[j]];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy);
  let n = [(SIDE[i][j] * dy) / len, (-SIDE[i][j] * dx) / len];
  // inside the triangle: n points towards the third island
  const third = AT[3 - i - j];
  const inward = n[0] * (third[0] - a[0]) + n[1] * (third[1] - a[1]) > 0;
  if (inward && alone) n = [-n[0], -n[1]];
  const bend = inward ? (alone ? 0 : BEND_IN) : BEND_OUT;
  const c = [(a[0] + b[0]) / 2 + bend * n[0], (a[1] + b[1]) / 2 + bend * n[1]];
  const at = (e) => {
    const s = 1 - e;
    return [s * s * a[0] + 2 * s * e * c[0] + e * e * b[0], s * s * a[1] + 2 * s * e * c[1] + e * e * b[1]];
  };
  const pts = [];
  for (let q = 0; q <= 80; q += 1) {
    const p = at(q / 80);
    if (!inside(i, p, 6, rad) && !inside(j, p, 10, rad)) pts.push(p);
  }
  // beside its middle, on the outside of its bend; the shares of the flights into C a little nearer
  // C, out of the row with A to B's
  return { pts, label: beside(at(j === 2 ? 0.62 : 0.5), n) };
}

/** Staying on island i (of radius rad): a loop over it, its share above. */
function loop(i, rad = R) {
  const [x, y] = [AT[i][0], AT[i][1]];
  const at = (deg, r = rad + 4) => [x + r * Math.cos((deg * Math.PI) / 180), y + r * Math.sin((deg * Math.PI) / 180)];
  const P = [at(-124), [x - 70, y - rad - 84], [x + 70, y - rad - 84], at(-56)];
  const pts = Array.from({ length: 41 }, (_, q) => {
    const e = q / 40;
    const s = 1 - e;
    return [0, 1].map((k) => s * s * s * P[0][k] + 3 * s * s * e * P[1][k] + 3 * s * e * e * P[2][k] + e * e * e * P[3][k]);
  });
  return { pts, label: beside(pts[20], [0, -1]) };
}

const line = (pts) => pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');

// the birds: the ring of an island they circle over (as fractions of its radius: clear of its
// letter, to its edge); how fast they circle (rad/s); a year's flights (each bird's flight, and the
// most a bird waits before it leaves, in s; how high it rises off its arrow, midway); the view's
// slant, as in BirdIslands
const RING = [0.36, 0.98];
const CIRCLE = 0.3;
const FLY = 1.5;
const STAGGER = 1.2;
const LIFT = 22;
const SLANT = 0.42;

/**
 * Slot s of island i (of radius rad), of n, at t seconds: the slots fill a ring round the island's
 * letter from the inside out, as a sunflower's seeds (so a flock covers the more of its island the
 * more birds it has), turning slowly.
 */
const slotAt = (i, s, n, rad, t) => {
  const [r0, r1] = RING.map((f) => f * rad);
  const rr = Math.sqrt(r0 * r0 + ((r1 * r1 - r0 * r0) * (s + 0.5)) / n);
  const a = s * 2.39996 + CIRCLE * t;
  return [AT[i][0] + rr * Math.cos(a), AT[i][1] + rr * Math.sin(a)];
};

// the birds as dots: scattered about their island, over its circle and out of it to SPREAD times
// its radius, the fewer the further out; clear of its letter (within LETTER times its radius), the
// arrows and the labels, and APART from each other, if they can be
const SPREAD = 1.5;
const LETTER = 0.38;
const APART = 7;

/**
 * n spots for the dots (of radius dot) of island i (of radius rad), each at random, seeded (the same
 * each time), and clear of the arrows and of `boxes`, the labels: of a few tries, the first one APART
 * from the spots before it, else the one furthest from them (so that the first spots, as the later,
 * are spread over the whole cloud).
 */
function scatter(i, n, rad, dot, arrows, boxes) {
  const [cx, cy] = AT[i];
  const out = SPREAD * rad;
  const near = arrows.flatMap((a) => a.pts).filter(([x, y]) => Math.hypot(x - cx, y - cy) < out + 20);
  const clear = ([x, y]) =>
    Math.hypot(x - cx, y - cy) > LETTER * rad &&
    x > dot &&
    x < VW - dot &&
    y > dot &&
    y < VH - dot &&
    near.every(([px, py]) => Math.hypot(x - px, y - py) > dot + 6) &&
    boxes.every(([x0, y0, x1, y1]) => x < x0 - dot || x > x1 + dot || y < y0 - dot || y > y1 + dot);
  const g = rng(31 * i + 5);
  const spots = [];
  for (let s = 0; s < n; s += 1) {
    let best = null;
    let far = -1;
    for (let q = 0; q < 60 && far < APART; q += 1) {
      const rr = out * Math.sqrt(g());
      const a = 2 * Math.PI * g();
      // out of the circle, the further out, the likelier to be thrown away
      if (rr > rad && g() < (rr - rad) / (out - rad)) continue;
      const p = [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
      if (!clear(p)) continue;
      const d = Math.min(Infinity, ...spots.map(([x, y]) => Math.hypot(p[0] - x, p[1] - y)));
      if (d > far) [best, far] = [p, d];
    }
    spots.push(best ?? [cx, cy + 0.7 * rad]);
  }
  return spots;
}

/**
 * The birds a year later: island j's birds split as M's column j says, rounded (a share left over
 * goes to the island further on, C before B before A); those that stay keep their slots, the others
 * take the free slots of their new island.
 */
function step(M, birds) {
  const next = birds.map((d) => ({ ...d }));
  [0, 1, 2].forEach((j) => {
    const mine = birds.filter((d) => d.isle === j).sort((a, b) => a.slot - b.slot);
    const exact = [0, 1, 2].map((i) => mine.length * M[i][j]);
    const count = exact.map((x) => Math.floor(x + 1e-9));
    const order = [0, 1, 2].filter((i) => M[i][j] > 0).sort((a, b) => exact[b] - count[b] - (exact[a] - count[a]) || b - a);
    for (let left = mine.length - count[0] - count[1] - count[2], q = 0; left > 0; left -= 1, q += 1) count[order[q % order.length]] += 1;
    const to = [...Array(count[j]).fill(j), ...[0, 1, 2].filter((i) => i !== j).flatMap((i) => Array(count[i]).fill(i))];
    mine.forEach((d, q) => {
      if (to[q] !== j) next[d.id] = { id: d.id, isle: to[q], slot: -1 };
    });
  });
  [0, 1, 2].forEach((i) => {
    const used = new Set(next.filter((d) => d.isle === i && d.slot >= 0).map((d) => d.slot));
    let s = 0;
    next
      .filter((d) => d.isle === i && d.slot < 0)
      .forEach((d) => {
        while (used.has(s)) s += 1;
        d.slot = s;
        used.add(s);
      });
  });
  return next;
}

/** A point at fraction t of the way along a path (by length). */
function along(path, t) {
  const lens = path.slice(1).map((p, q) => Math.hypot(p[0] - path[q][0], p[1] - path[q][1]));
  let d = t * lens.reduce((a, b) => a + b, 0);
  for (let q = 0; q < lens.length; q += 1) {
    if (d <= lens[q] || q === lens.length - 1) {
      const e = lens[q] ? Math.min(1, d / lens[q]) : 1;
      return [path[q][0] + e * (path[q + 1][0] - path[q][0]), path[q][1] + e * (path[q + 1][1] - path[q][1])];
    }
    d -= lens[q];
  }
  return path[path.length - 1];
}

/** The wings' angles at t seconds: beating in flight; while circling, gliding, with a few beats now and then. */
function wings(ph, t, flying) {
  const f = 2 * Math.PI * (flying ? 3.2 : 2.6) * t + ph;
  if (flying) return [0.12 + 0.62 * Math.sin(f), 0.38 * Math.sin(f - 0.8)];
  const beat = clamp((Math.sin(0.5 * t + ph) - 0.55) / 0.45);
  return [0.22 + 0.5 * beat * Math.sin(f), -0.28 * (1 - beat) + 0.3 * beat * Math.sin(f - 0.8)];
}

/**
 * The birds, `start[i]` of them on island i at year 0, `size` times the opener's, each in its home
 * island's colour (as in the opener) or all in `color`, circling slowly over its island; when `year`
 * goes up by one, each bird that changes islands flies along its arrow, beating its wings (one after
 * another, over about 3 s); any other change of year puts them in place at once. With `dot` (a
 * radius), each bird is a dot, as PageRank's surfers, still at a spot of its own about its island
 * (scatter, clear of `boxes`, the labels) but for its flight. In print mode: still, in place.
 */
function Birds({ M, arrows, boxes, start, year, rad, size = 1.4, color, dot }) {
  const ref = useRef(null);
  const t = useClock(ref, { print: PRINT });
  const n = start[0] + start[1] + start[2];
  const key = start.join(',');
  const years = useMemo(() => {
    let id = 0;
    const first = [];
    start.forEach((c, i) => {
      for (let s = 0; s < c; s += 1) first.push({ id: id++, isle: i, slot: s });
    });
    return [first];
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  for (let k = years.length; k <= year; k += 1) years.push(step(M, years[k - 1]));
  const home = years[0].map((d) => d.isle);
  const spots = useMemo(() => dot && [0, 1, 2].map((i) => scatter(i, n, rad, dot, arrows, boxes)), [M, n, rad, dot, boxes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // the year's flights: from which year, when (on the clock), and each flying bird's turn
  const [flight, setFlight] = useState(null);
  const now = useRef(t);
  now.current = t;
  const last = useRef(year);
  useEffect(() => {
    const before = last.current;
    last.current = year;
    if (PRINT || year !== before + 1) {
      setFlight(null);
      return;
    }
    const turn = {};
    years[year].forEach((d) => {
      if (years[before][d.id].isle !== d.isle) turn[d.id] = Object.keys(turn).length;
    });
    setFlight({ from: before, to: year, t0: now.current, turn, movers: Object.keys(turn).length });
  }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Bird d's place at time tt, and how far into its flight it is (0 on an island): in the air, it
   * rises off its arrow, so as not to hide in it.
   */
  const place = (d, tt) => {
    const at = (b) => (dot ? spots[b.isle][b.slot] : slotAt(b.isle, b.slot, n, rad, tt));
    // (the flight of the year shown only: on the render before the effect, it may be another's)
    const b = flight?.to === year && years[flight.from][d.id];
    const arrow = b && b.isle !== d.isle && arrows.find((a) => a.i === b.isle && a.j === d.isle);
    if (!arrow) return [...at(d), 0];
    const e = clamp((tt - flight.t0 - (flight.turn[d.id] * STAGGER) / flight.movers) / FLY);
    const [x, y] = along([at(b), ...arrow.pts, at(d)], ease(e));
    return [x, y - LIFT * Math.sin(Math.PI * e), e];
  };
  if (dot)
    return (
      <g ref={ref} className="l16-isles-birds">
        {years[year].map((d) => {
          const [x, y] = place(d, t);
          return <circle key={d.id} cx={x.toFixed(1)} cy={y.toFixed(1)} r={dot} fill={color ?? ISLES[home[d.id]].color} className="l16-isles-dot" />;
        })}
      </g>
    );
  const flocks = ['', '', ''];
  years[year].forEach((d) => {
    const [x, y, e] = place(d, t);
    const [x0, y0] = place(d, t - 0.05);
    const h = Math.atan2((y - y0) / SLANT, x - x0);
    const up = Math.sin(Math.PI * e);
    flocks[color ? 0 : home[d.id]] += bird(x, y, size * (1 + 0.25 * up), h, wings(d.id * 1.7, t, e > 0 && e < 1));
  });
  return (
    <g ref={ref} className="l16-isles-birds">
      {flocks.map((dd, i) => dd && <path key={i} d={dd} fill={color ?? ISLES[i].color} />)}
    </g>
  );
}

/**
 * Island i's part of the picture: shown at once, or on key press steps[i] when steps is given; with
 * redrawAt, shown at once and drawn again on key press redrawAt[i].
 */
function Step({ steps, redrawAt, i, children }) {
  if (redrawAt)
    return (
      <Fragment as="g" index={redrawAt[i]} effect="custom" className="l16-isles-redraw">
        {children}
      </Fragment>
    );
  return steps ? (
    <Fragment as="g" index={steps[i]}>
      {children}
    </Fragment>
  ) : (
    <g>{children}</g>
  );
}

/**
 * The migration M (the textbook's by default) as the textbook's figure draws it: the islands as
 * circles, each flight an arrow in the colour of the island it leaves, its share of the birds beside it.
 * `steps`: the key press on which each island's flights appear (all at once if not given);
 * `redrawAt`: instead, all shown at once, each island's flights drawn again on its key press;
 * `shares`: a probability vector, each island's share written by it (by `format`; under A and B, right
 * of C), its circle the deeper in colour the bigger its share (without birds); `birds`: { start, year,
 * size, color, dot }, the birds (Birds), start[i] of them on island i at year 0, flying along the arrows
 * as the year goes up, the letters outlined in white over them; `r`: the islands' radius (bigger, to
 * hold the birds).
 */
export default function IslandMap({ M = M_BIRDS, width = VW, steps, redrawAt, shares, format = (x) => x.toFixed(3), birds, r = R }) {
  const arrows = [];
  [0, 1, 2].forEach((i) =>
    [0, 1, 2].forEach((j) => {
      if (M[j][i] > 0) arrows.push({ i, j, rate: M[j][i], ...(i === j ? loop(i, r) : flight(i, j, M[i][j] === 0, r)) });
    }),
  );
  // the labels' boxes (left, top, right, bottom), for the dots to keep clear of: the arrows' shares,
  // and the islands' (under A and B, right of C)
  const boxes = [
    ...arrows.map(({ label: [x, y] }) => [x - LW / 2, y - LH / 2, x + LW / 2, y + LH / 2]),
    ...(shares ? AT.map(([x, y], i) => (i === 2 ? [x + r + 10, y - 20, x + r + 110, y + 18] : [x - 50, y + r + 12, x + 50, y + r + 48])) : []),
  ];
  return (
    <svg className="l16-isles" viewBox={`0 0 ${VW} ${VH}`} width={width} height={(width * VH) / VW} aria-hidden="true">
      {arrows.map((a) => {
        const color = ISLES[a.i].color;
        const n = a.pts.length;
        return (
          <Step key={`${a.i}${a.j}`} steps={steps} redrawAt={redrawAt} i={a.i}>
            <polyline points={line(a.pts)} pathLength="1" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <polygon points={head(a.pts[n - 2], a.pts[n - 1], 18, 16)} fill={color} />
            <TexSvg x={a.label[0]} y={a.label[1]} tex={frac(a.rate)} size={LABEL} color={color} w={LW + 20} h={LH + 10} />
          </Step>
        );
      })}
      {AT.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill={ISLES[i].color}
          fillOpacity={shares && !birds ? 0.08 + 0.6 * shares[i] : 0.12}
          stroke={ISLES[i].color}
          strokeWidth="3.5"
          className="l16-isles-isle"
        />
      ))}
      {birds && <Birds M={M} arrows={arrows} boxes={boxes} start={birds.start} year={birds.year} rad={r} size={birds.size} color={birds.color} dot={birds.dot} />}
      {AT.map(([x, y], i) => (
        <g key={i}>
          <text x={x} y={y + 14} textAnchor="middle" className={`l16-isles-name${birds ? ' l16-isles-name-over' : ''}`} fill={shares && !birds && shares[i] > 0.7 ? '#fff' : ISLES[i].color}>
            {ISLES[i].name}
          </text>
          {/* C's share to its right, clear of the flights into it */}
          {shares && (
            <text
              x={i === 2 ? x + r + 14 : x}
              y={i === 2 ? y + 14 : y + r + 44}
              textAnchor={i === 2 ? 'start' : 'middle'}
              className="l16-isles-share"
              fill={ISLES[i].color}
            >
              {format(shares[i])}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
