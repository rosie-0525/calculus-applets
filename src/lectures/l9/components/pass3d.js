/**
 * The made-up mountains of the Donner Pass cartoon (PassTrain.jsx): x east, y north, z up, about a
 * unit to a kilometre, heights exaggerated. A crest runs north–south with a peak to the north and a
 * higher one to the south; the pass is the saddle between them, at the origin. To the west a high,
 * gentle upland; to the east a steep headwall down to a lake (Donner Lake). The railroad climbs the
 * upland, goes through a tunnel under the pass and follows the north wall of the lake's valley,
 * descending.
 */

export const smoothstep = (a, b, t) => {
  const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
const bump = (t, w) => Math.exp(-((t / w) ** 2));

// ---------- noise ----------
function hash(i, j) {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
/** Value noise in [0, 1]. */
function vnoise(x, y) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const u = fade(x - i);
  const v = fade(y - j);
  const a = hash(i, j);
  const b = hash(i + 1, j);
  const c = hash(i, j + 1);
  const d = hash(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** Fractal noise, about −1 to 1. */
export function fbm(x, y, oct = 5) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let k = 0; k < oct; k += 1) {
    s += amp * (2 * vnoise(x * f + 7.3 * k, y * f - 3.1 * k) - 1);
    f *= 2.03;
    amp *= 0.5;
  }
  return s;
}
/** Ridged fractal noise, 0 to about 0.9: sharp crests, like eroded granite. */
function ridged(x, y, oct = 4) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let k = 0; k < oct; k += 1) {
    const n = 1 - Math.abs(2 * vnoise(x * f + 31.7 * k, y * f - 12.3 * k) - 1);
    s += amp * n * n;
    f *= 2.1;
    amp *= 0.5;
  }
  return s;
}

// ---------- the terrain ----------
export const X_R = [-3.6, 3.8];
export const Y_R = [-2.8, 3.2];
export const LAKE_Z = -0.15;

const crestX = (y) => -0.16 * y;
// the height of the crest: the pass at y = 0, the peaks to the north and south
const crestZ = (y) => 0.57 - 0.12 * Math.exp(-(y * y) / 1.5) + 0.42 * bump(y - 1.75, 0.6) + 0.55 * bump(y + 1.6, 0.6);

const VALLEY_Y = -0.7; // the axis of the lake's valley

/** The smooth shape of the terrain (no noise): the track is laid out on it. */
export function baseZ(x, y) {
  const d = x - crestX(y);
  const wr = 0.5 + 0.25 * (1 - bump(y, 1));
  const ridge = (crestZ(y) - 0.34) * bump(d, wr);
  const west = 0.025 * Math.min(d, 0);
  // the lake's valley: a steep headwall east of the pass, between a north and a south wall
  const drop = -0.52 * (1 - Math.exp(-Math.max(0, d - 0.25) / 0.4));
  // the walls wander: spurs and gullies
  const v = y - VALLEY_Y + 0.22 * fbm(1.3 * x + 5, 0.4 * y, 3);
  const open = (1 - smoothstep(0.35, 1.0, v)) * (1 - smoothstep(0.35, 1.2, -v));
  const rise = 0.35 * smoothstep(1.0, 2.2, v) * smoothstep(0.2, 0.8, d);
  return 0.34 + west + ridge + drop * open + rise;
}

/** The terrain with its roughness (before the railroad is cut into it). */
export function groundZ(x, y) {
  const b = baseZ(x, y);
  const r = Math.hypot(x, y);
  const amp = (0.025 + 0.16 * smoothstep(0.4, 1.0, b)) * (0.3 + 0.7 * smoothstep(0.15, 0.7, r));
  // gullies down the high slopes, and crags
  const crags = 0.5 * (ridged(3.2 * x + 1.3, 3.2 * y - 2.1, 4) - 0.3) + 0.3 * (ridged(9 * x - 3, 9 * y + 4, 2) - 0.3);
  return b + amp * (0.7 * fbm(2.3 * x + 3.1, 2.3 * y - 1.7) + 1.1 * (ridged(1.6 * x - 4.2, 1.6 * y + 2.8) - 0.3) + crags);
}

/** How far (x, y) is inside the terrain's rectangle (negative outside). */
export const inside = (x, y) => Math.min(x - X_R[0], X_R[1] - x, y - Y_R[0], Y_R[1] - y);

/** The land around the rectangle, out to the horizon: the same terrain, with ranges rising beyond. */
export function farZ(x, y) {
  const out = smoothstep(0.5, 5, -inside(x, y));
  return groundZ(x, y) + out * (0.4 * ridged(0.45 * x + 3, 0.45 * y - 7, 4) - 0.12);
}

// ---------- the railroad ----------
export const Z_TUNNEL = 0.35; // 0.1 under the pass
const COVER = 0.065; // the ground over the track at a portal
const ACROSS = (() => {
  const v = [1, 0.16];
  const n = Math.hypot(...v);
  return [v[0] / n, v[1] / n];
})(); // across the crest at the pass, east-north-east

/** How far from the pass, along ±ACROSS, the ground comes down to COVER over the tunnel. */
function portalDistance(sign) {
  for (let t = 0; t < 1.5; t += 0.002) {
    if (baseZ(sign * ACROSS[0] * t, sign * ACROSS[1] * t) < Z_TUNNEL + COVER) return t;
  }
  return 1.5;
}

/**
 * A railroad from p0 on heading h0, at height z0 going down by `grade` a unit, that keeps to the
 * ground: at each step it turns (radius ≥ 0.4) toward the heading, within `dev` of `aim`, whose
 * point 0.3 ahead is at the right height. It stops when x passes xEnd.
 */
function trace(p0, h0, z0, grade, xEnd, aim, dev, straight = 0.06) {
  const ds = 0.01;
  const look = 0.3;
  const turn = ds / 0.4;
  const out = [];
  let p = p0.slice();
  let h = h0;
  let z = z0;
  for (let k = 0; k < 1200; k += 1) {
    out.push([p[0], p[1], z]);
    if ((xEnd - p0[0]) * (p[0] - xEnd) > 0) break;
    if (k * ds > straight) {
      let best = h;
      let err = Infinity;
      for (let m = -30; m <= 30; m += 1) {
        const hh = aim + (m / 30) * dev;
        const e =
          Math.abs(baseZ(p[0] + look * Math.cos(hh), p[1] + look * Math.sin(hh)) - (z - grade * look)) +
          0.01 * Math.abs(hh - h);
        if (e < err) {
          err = e;
          best = hh;
        }
      }
      h += Math.max(-turn, Math.min(turn, best - h));
    }
    p = [p[0] + ds * Math.cos(h), p[1] + ds * Math.sin(h)];
    z -= grade * ds;
  }
  return out;
}

/** Moving averages of the plan (x, y), the ends kept. */
function smoothPlan(pts, passes = 6, r = 4) {
  let cur = pts;
  for (let n = 0; n < passes; n += 1) {
    cur = cur.map((p, k) => {
      if (k < r || k >= cur.length - r) return p;
      let x = 0;
      let y = 0;
      for (let m = -r; m <= r; m += 1) {
        x += cur[k + m][0];
        y += cur[k + m][1];
      }
      return [x / (2 * r + 1), y / (2 * r + 1), p[2]];
    });
  }
  return cur;
}

/**
 * The railroad, west to east: `pts` [x, y, z] every 0.01 or so, `s` their arc length, the tunnel
 * between arc lengths `tunnel[0]` and `tunnel[1]` (the portals).
 */
export function railroad() {
  const tw = portalDistance(-1);
  const te = portalDistance(1);
  const W = [-ACROSS[0] * tw, -ACROSS[1] * tw];
  const E = [ACROSS[0] * te, ACROSS[1] * te];
  const h = Math.atan2(ACROSS[1], ACROSS[0]);
  const west = trace(W, h + Math.PI, Z_TUNNEL, 0.03, X_R[0] + 0.05, Math.PI, 0.5).reverse();
  const east = trace(E, h, Z_TUNNEL, 0.012, X_R[1] - 0.05, 0, 0.7);
  const n = Math.round((tw + te) / 0.01);
  const tunnel = Array.from({ length: n - 1 }, (_, k) => {
    const t = (k + 1) / n;
    return [W[0] + t * (E[0] - W[0]), W[1] + t * (E[1] - W[1]), Z_TUNNEL];
  });
  const raw = [...west, ...tunnel, ...east];
  const iW = west.length - 1;
  const iE = west.length + tunnel.length;
  // smooth the curves outside the tunnel, keeping the tunnel straight
  const pts = [...smoothPlan(raw.slice(0, iW + 1)), ...tunnel, ...smoothPlan(raw.slice(iE))];
  const s = [0];
  for (let k = 1; k < pts.length; k += 1) {
    s.push(s[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1], pts[k][2] - pts[k - 1][2]));
  }
  return { pts, s, tunnel: [s[iW], s[iE]], portals: [iW, iE] };
}

/** The point of the railroad at arc length t, and its unit tangent. */
export function along({ pts, s }, t) {
  let lo = 0;
  let hi = s.length - 1;
  const c = Math.max(s[0], Math.min(s[hi], t));
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (s[m] <= c) lo = m;
    else hi = m;
  }
  const u = (c - s[lo]) / (s[hi] - s[lo] || 1);
  const p = pts[lo].map((v, k) => v + u * (pts[hi][k] - v));
  const d = pts[hi].map((v, k) => v - pts[lo][k]);
  const n = Math.hypot(...d) || 1;
  return { p, dir: d.map((v) => v / n) };
}
