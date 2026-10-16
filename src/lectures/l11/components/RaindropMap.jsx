import { useEffect, useMemo, useRef, useState } from 'react';
import TerrainMap from './TerrainMap.jsx';
import { useTerrain } from './terrain.js';
import { dropPath, oceanAt, oceanIndex, OCEANS } from './raindrop.js';
import { PRINT } from './print.js';
import Fragment from './Fragment.jsx';

export const PEAK = [199.23, 185.12]; // Triple Divide Peak, 48.57306 N, 113.51667 W, in grid pixels
const RELIEF = { lo: 1270, hi: 2860, relief: 1.2 };
const SPEED = 240; // picture pixels per second
const KEEP = 6; // drops kept on the map
const DROP_BLUE = '#1d4ed8';

/** The three watersheds, tinted in their oceans' colours, as a PNG data URL (one pixel per grid pixel). */
const tintCache = new WeakMap();
function tintUrl(t) {
  if (tintCache.has(t)) return tintCache.get(t);
  const { W, H } = t;
  const idx = oceanIndex(t);
  const cols = [null, OCEANS[17].color, OCEANS[10].color, OCEANS['09'].color].map(
    (c) => c && [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)),
  );
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  for (let p = 0; p < W * H; p += 1) {
    const c = cols[idx[p]];
    if (!c) continue;
    [img.data[4 * p], img.data[4 * p + 1], img.data[4 * p + 2]] = c;
    img.data[4 * p + 3] = 92;
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL('image/png');
  tintCache.set(t, url);
  return url;
}

/** The length of a polyline at each of its points. */
function lengths(pts) {
  const s = [0];
  for (let k = 1; k < pts.length; k += 1) s.push(s[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  return s;
}

/** A drop's path in picture pixels, with its ocean and where it ended. */
function makeDrop(t, p, [x, y], id) {
  const path = dropPath(t, x, y);
  const pts = path.pts.map(([a, b]) => [p.px(a), p.py(b)]);
  const end = path.pts[path.pts.length - 1];
  return { id, start: [x, y], pts, s: lengths(pts), down: path.down, gridPts: path.pts, end: path.end, ocean: oceanAt(t, ...end) };
}

const ptsAttr = (pts) => pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

/** A raindrop at (x, y), its tip up. */
function DropShape({ x, y, r = 7 }) {
  return (
    <path
      d={`M ${x} ${y - 1.9 * r} C ${x + 0.4 * r} ${y - 1.1 * r} ${x + r} ${y - 0.55 * r} ${x + r} ${y} A ${r} ${r} 0 0 1 ${x - r} ${y} C ${x - r} ${y - 0.55 * r} ${x - 0.4 * r} ${y - 1.1 * r} ${x} ${y - 1.9 * r} Z`}
      fill={DROP_BLUE}
      stroke="#fff"
      strokeWidth="1.5"
    />
  );
}

/**
 * The map around Triple Divide Peak (real elevation, level curves every 50 m) on which a click drops
 * a raindrop: it runs downhill (raindrop.js), its trail drawn as it goes, and ends with the name of
 * its ocean. `tints`: the three watersheds tinted (true), or tinted on key press `tints` (a number). `onDrop(drop)` hears of each
 * drop when it has arrived. `stills`: the starting points of the drops shown in print mode (and
 * in live mode before any click, with `preset`). `crop`: [i0, j0, i1, j1], the part of the grid on
 * the map. `children(p, t, drops)` draws more, in grid pixels.
 */
export default function RaindropMap({ width = 600, crop, tints = false, stills = [], preset = false, onDrop, labels = true, children }) {
  const t = useTerrain('divide');
  const [drops, setDrops] = useState([]);
  const [now, setNow] = useState(null); // { id, d: length run so far }
  const frame = useRef(0);
  const count = useRef(0);
  const [i0, j0, i1, j1] = crop ?? [0, 0, t.W, t.H];
  const k = width / (i1 - i0);
  const p = { px: (i) => (i + 0.5 - i0) * k, py: (j) => (j + 0.5 - j0) * k, k };

  const fixed = useMemo(
    () => (PRINT || preset ? stills.map((xy, n) => makeDrop(t, p, xy, `s${n}`)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, width, PRINT, preset],
  );
  const shown = drops.length ? drops : fixed;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const onClick = (e) => {
    if (PRINT) return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const X = ((e.clientX - r.left) / r.width) * vb.width;
    const Y = ((e.clientY - r.top) / r.height) * vb.height;
    const xy = [X / k - 0.5 + i0, Y / k - 0.5 + j0];
    if (xy[0] < 1 || xy[1] < 1 || xy[0] > t.W - 2 || xy[1] > t.H - 2) return;
    count.current += 1;
    const drop = makeDrop(t, p, xy, `d${count.current}`);
    setDrops((ds) => [...ds.slice(-(KEEP - 1)), drop]);
    cancelAnimationFrame(frame.current);
    const total = drop.s[drop.s.length - 1];
    let t0;
    const step = (ms) => {
      if (t0 === undefined) t0 = ms;
      const d = Math.min(total, ((ms - t0) / 1000) * SPEED);
      setNow({ id: drop.id, d });
      if (d < total) frame.current = requestAnimationFrame(step);
      else onDrop?.(drop);
    };
    frame.current = requestAnimationFrame(step);
  };

  return (
    <TerrainMap
      t={t}
      width={width}
      step={50}
      index={5}
      relief={RELIEF}
      crop={crop}
      className="l10-drop-map"
      title="A shaded relief map around Triple Divide Peak, Glacier National Park, with level curves every 50 metres"
      svgProps={{ onClick, 'data-prevent-swipe': true }}
    >
      {(pp) => (
        <g className="drop-marks">
          {tints === true && <image href={tintUrl(t)} x={-i0 * k} y={-j0 * k} width={t.W * k} height={t.H * k} preserveAspectRatio="none" />}
          {typeof tints === 'number' && (
            <Fragment as="g" index={tints}>
              <image href={tintUrl(t)} x={-i0 * k} y={-j0 * k} width={t.W * k} height={t.H * k} preserveAspectRatio="none" />
            </Fragment>
          )}
          {shown.map((dr) => {
            const live = now && now.id === dr.id;
            const d = live ? now.d : dr.s[dr.s.length - 1];
            let n = dr.s.findIndex((v) => v > d);
            if (n < 0) n = dr.pts.length;
            const done = n >= dr.pts.length;
            const head = done ? dr.pts[dr.pts.length - 1] : dr.pts[n - 1];
            const last = dr.id === shown[shown.length - 1].id;
            return (
              <g key={dr.id} opacity={last || PRINT || preset ? 1 : 0.55}>
                <polyline points={ptsAttr(dr.pts.slice(0, n))} fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
                <polyline points={ptsAttr(dr.pts.slice(0, n))} fill="none" stroke={DROP_BLUE} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={dr.pts[0][0]} cy={dr.pts[0][1]} r="4" fill={DROP_BLUE} stroke="#fff" strokeWidth="1.5" />
                {!done && <DropShape x={head[0]} y={head[1]} />}
                {done && labels && dr.ocean && (
                  <EndLabel at={head} ocean={dr.ocean} lake={dr.end === 'lake'} W={width} H={(j1 - j0) * k} />
                )}
              </g>
            );
          })}
          <Peak p={p} />
          {typeof children === 'function' ? children(pp, t, shown) : children}
        </g>
      )}
    </TerrainMap>
  );
}

/** The peak: a triangle and its name. */
function Peak({ p }) {
  const x = p.px(PEAK[0]);
  const y = p.py(PEAK[1]);
  return (
    <g className="map-label">
      <path d={`M ${x} ${y - 9} L ${x + 8} ${y + 5} L ${x - 8} ${y + 5} Z`} fill="#14213d" stroke="#fff" strokeWidth="1.5" />
      <text x={x + 12} y={y - 6} fontSize="17" fill="#14213d" fontWeight="600" paintOrder="stroke" stroke="#fff" strokeWidth="4" strokeLinejoin="round">
        Triple Divide Peak
      </text>
    </g>
  );
}

/** Where a drop ended: its ocean (and "lake" if it stopped in one), placed inside the map. */
function EndLabel({ at, ocean, lake, W, H }) {
  const text = `${lake ? 'a lake → ' : ''}${ocean.name}`;
  const w = text.length * 9.2 + 16;
  const x = Math.max(4, Math.min(W - w - 4, at[0] - w / 2));
  const y = at[1] > H - 44 ? at[1] - 40 : at[1] + 12;
  return (
    <g>
      <rect x={x} y={y} width={w} height={28} rx="5" fill="#fff" stroke={ocean.color} strokeWidth="2" />
      <text x={x + w / 2} y={y + 19.5} textAnchor="middle" fontSize="16" fontWeight="700" fill={ocean.color} className="l10-end">
        {text}
      </text>
    </g>
  );
}

