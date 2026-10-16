import { useMemo, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import TerrainMap from '../components/TerrainMap.jsx';
import { useTerrain } from '../components/terrain.js';
import { I, B, MAIN } from '../components/svgmath.jsx';
import streets from '../data/lombard-streets.json';
import photo from '../assets/lombard.jpg';

export const RED = '#8c1515';
export const GRAY = '#374151';
export const ROAD = '#b45309';
export const CROP = [70, 56, 150, 114]; // the part of the grid on the map: the crooked block and the streets around it
export const MAP_W = 560;
export const STREET_M = 20.96; // San Francisco's streets here are 68 ft 9 in wide
export const CROOKED = streets.crooked;
// P: halfway between the two ends of the crooked block, in grid pixels
export const P = [(CROOKED[0][0] + CROOKED[CROOKED.length - 1][0]) / 2, (CROOKED[0][1] + CROOKED[CROOKED.length - 1][1]) / 2];
export const ARROW = 78; // the arrows' length on the map, pixels
export const NAMES = [
  { name: 'Hyde St', at: [87, 67], rot: 79 },
  { name: 'Leavenworth St', at: [133, 104], rot: 79 },
  { name: 'Lombard St', at: [80, 92.5], rot: -9.8 },
];

/**
 * The gradient of the elevation at (x, y) (grid pixels), in metres per metre, east and north: the
 * slope of the plane fitted (least squares) to the pixels within `R` pixels.
 */
export function gradAt(t, [x, y], R = 6) {
  const pts = [];
  for (let j = Math.floor(y - R) - 1; j <= Math.ceil(y + R) + 1; j += 1) {
    for (let i = Math.floor(x - R) - 1; i <= Math.ceil(x + R) + 1; i += 1) {
      const dx = i - x;
      const dy = j - y;
      if (dx * dx + dy * dy <= R * R) pts.push([dx, dy, t.E[j * t.W + i]]);
    }
  }
  const n = pts.length;
  const mean = (k) => pts.reduce((s, q) => s + q[k], 0) / n;
  const [mx, my, mz] = [mean(0), mean(1), mean(2)];
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  let sxz = 0;
  let syz = 0;
  for (const [dx, dy, z] of pts) {
    sxx += (dx - mx) ** 2;
    syy += (dy - my) ** 2;
    sxy += (dx - mx) * (dy - my);
    sxz += (dx - mx) * (z - mz);
    syz += (dy - my) * (z - mz);
  }
  const det = sxx * syy - sxy * sxy;
  const gx = (sxz * syy - syz * sxy) / det;
  const gy = (syz * sxx - sxz * sxy) / det; // per pixel southward
  return [gx / t.m, -gy / t.m];
}

/** The length of a polyline of grid pixels, in metres, and the drop in height along it. */
export function along(t, pts) {
  let L = 0;
  for (let k = 1; k < pts.length; k += 1) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  return L * t.m;
}

/** The photo of the crooked block of Lombard Street, San Francisco (CC0). */
export function LombardPhoto({ className = '' }) {
  return (
    <figure className={`l10-lombard-photo ${className}`.trim()}>
      <img src={photo} alt="The crooked block of Lombard Street, San Francisco, seen from below: a red brick road winding down between flower beds and houses" />
      <figcaption>Photo: Pedro Lastra, CC0 (Wikimedia Commons)</figcaption>
    </figure>
  );
}

/**
 * Lombard Street: the crooked block of Lombard Street, San Francisco (a photo, CC0), and a map of
 * Russian Hill around it (real elevation, level curves every 2 m; the streets from OpenStreetMap).
 * Key press 1: at P, halfway along the block, ∇E (E the elevation), and the grade going in the
 * direction of ∇E, its length, 27%; 2: an arrow u that the mouse turns, and the grade going that
 * way, ∇E(P) · u = 27% · cos θ, live; 3: the zigzag route, and its average grade, 17%: the drop
 * over the length of the road. Under the map, one line each: E(x, y) = elevation, and the three
 * grades.
 * (Commented out: the map is the example on Why does the gradient point in the direction of fastest
 * increase?, Slide13bSteepestWhy.jsx.)
 */
export default function Slide14Lombard() {
  return (
    <section className="dense l10-lombard">
      <h2>Lombard Street</h2>

      <div className="l10-lombard-stage">
        <LombardPhoto />
        <LombardMap at={1} />
      </div>
    </section>
  );
}

/**
 * The map of Russian Hill and the grades under it, from key press `at`: ∇E at P and the hill's
 * grade; at + 1: the arrow u, turned by the mouse, and the grade that way; at + 2: the zigzag route.
 * `width`: the map's; `rotate`: the map a quarter turn clockwise (∇E up, as in the photo);
 * `children(map, read)`, if given, lays out the map and the grades (shown from key press `at`),
 * which otherwise go one under the other.
 */
export function LombardMap({ at = 1, width = MAP_W, rotate = false, children }) {
  const t = useTerrain('lombard');
  const grad = useMemo(() => gradAt(t, P), [t]);
  const G = Math.hypot(...grad);
  const up = Math.atan2(grad[1], grad[0]) - (rotate ? Math.PI / 2 : 0); // the direction of ∇E on the screen, counterclockwise from right
  const [theta, setTheta] = useState((52 * Math.PI) / 180); // u's angle from ∇E (about the switchbacks')
  const road = useMemo(() => {
    const L = along(t, CROOKED);
    const ends = [CROOKED[0], CROOKED[CROOKED.length - 1]].map(([x, y]) => t.E[Math.round(y) * t.W + Math.round(x)]);
    return { L, drop: ends[0] - ends[1] };
  }, [t]);

  const k = width / (rotate ? CROP[3] - CROP[1] : CROP[2] - CROP[0]);
  const pt = ([i, j]) => {
    const [x, y] = [(i + 0.5 - CROP[0]) * k, (j + 0.5 - CROP[1]) * k];
    return rotate ? [(CROP[3] - CROP[1]) * k - y, x] : [x, y];
  };
  const [Px, Py] = pt(P);
  const dir = (a) => [Math.cos(a), -Math.sin(a)]; // an angle (counterclockwise from east) on the screen
  const ua = up + theta;
  const gTip = [Px + ARROW * dir(up)[0], Py + ARROW * dir(up)[1]];
  const uTip = [Px + ARROW * dir(ua)[0], Py + ARROW * dir(ua)[1]];
  const turn = (e) => {
    if (!(e.buttons & 1) && e.type !== 'pointerdown') return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const X = ((e.clientX - rect.left) / rect.width) * vb.width;
    const Y = ((e.clientY - rect.top) / rect.height) * vb.height;
    if (Math.hypot(X - Px, Y - Py) < 8) return;
    let th = Math.atan2(-(Y - Py), X - Px) - up;
    while (th > Math.PI) th -= 2 * Math.PI;
    while (th < -Math.PI) th += 2 * Math.PI;
    setTheta(th);
  };
  const pct = (v) => {
    const n = Math.round(v * 100);
    return n < 0 ? `−${-n}%` : `${n}%`;
  };
  const line = (pts) =>
    pts
      .map((q, n) => {
        const [x, y] = pt(q);
        return `${n ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join('');
  const arcR = 30;
  const a0 = -up;
  const a1 = -(up + theta);

  const map = (
    <TerrainMap
      t={t}
      width={width}
      rotate={rotate}
      step={2}
      index={5}
      crop={CROP}
      relief={{ lo: 25, hi: 100, relief: 0.6 }}
      className="l10-lombard-map"
      title="A map of Russian Hill around the crooked block of Lombard Street, with level curves every 2 metres and the streets"
      svgProps={{ onPointerDown: turn, onPointerMove: turn, 'data-prevent-swipe': true }}
    >
      {() => (
        <g>
          <g fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeLinecap="round" strokeLinejoin="round" strokeWidth={(STREET_M / t.m) * k}>
            {streets.streets.map((s, n) => (
              <path key={n} d={line(s.pts)} />
            ))}
          </g>
          {NAMES.map(({ name, at, rot }) => {
            const [x, y] = pt(at);
            let a = rot + (rotate ? 90 : 0); // kept between −90° and 90°, to read left to right
            if (a > 90) a -= 180;
            return (
              <text key={name} x={x} y={y} transform={`rotate(${a} ${x} ${y})`} textAnchor="middle" fontSize="14" fill={GRAY} className="map-label">
                {name}
              </text>
            );
          })}
          <Fragment as="g" index={at + 2}>
            <path d={line(CROOKED)} fill="none" stroke={ROAD} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </Fragment>
          <Fragment as="g" index={at + 1}>
            <path
              d={`M ${Px + arcR * Math.cos(a0)} ${Py + arcR * Math.sin(a0)} A ${arcR} ${arcR} 0 0 ${theta > 0 ? 0 : 1} ${Px + arcR * Math.cos(a1)} ${Py + arcR * Math.sin(a1)}`}
              fill="none"
              stroke={GRAY}
              strokeWidth="2"
            />
            <ScreenArrow from={[Px, Py]} to={uTip} color={GRAY} />
            <text x={uTip[0] + 10 * dir(ua)[0]} y={uTip[1] + 10 * dir(ua)[1] + 6} textAnchor="middle" fontSize="20" fontFamily={MAIN} fill={GRAY} className="map-label">
              <B>u</B>
            </text>
          </Fragment>
          <ScreenArrow from={[Px, Py]} to={gTip} color={RED} />
          <text x={gTip[0]} y={gTip[1] - 12} textAnchor="middle" fontSize="19" fontFamily={MAIN} fill={RED} className="map-label">
            ∇<I>E</I>
          </text>
          <circle cx={Px} cy={Py} r="5.5" fill="#14213d" stroke="#fff" strokeWidth="1.5" />
          <text x={Px + 4} y={Py + 24} fontSize="18" fontFamily={MAIN} fill="#14213d" className="map-label">
            <I>P</I>
          </text>
        </g>
      )}
    </TerrainMap>
  );
  const read = (
    <div className="l10-lombard-read">
      <p>
        <Tex tex={r`E(x,y)=`} /> elevation
      </p>
      <p>
        Going in direction <Tex tex={r`\nabla E`} />: <strong>{pct(G)} grade</strong>
      </p>
      <Fragment index={at + 1} as="p">
        Going in direction <Tex tex={r`\vv u`} />: <strong>{pct(G * Math.cos(theta))} grade</strong>
      </Fragment>
      <Fragment index={at + 2} as="p" className="l10-lombard-road">
        The zigzag route: average <strong>{pct(road.drop / road.L)} grade</strong>
      </Fragment>
    </div>
  );
  if (children) return children(map, read);
  return (
    <Fragment index={at} as="div" className="l10-lombard-right">
      {map}
      {read}
    </Fragment>
  );
}

/** An arrow between two points of the picture (pixels). */
export function ScreenArrow({ from, to, color, width = 3.5, head = 13 }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const hw = head * 0.42;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - ux * head * 0.9} y2={y2 - uy * head * 0.9} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${x2 - ux * head - uy * hw},${y2 - uy * head + ux * hw} ${x2 - ux * head + uy * hw},${y2 - uy * head - ux * hw}`} fill={color} />
    </g>
  );
}
