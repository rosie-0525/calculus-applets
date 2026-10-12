import { useMemo, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import TerrainMap from '../components/TerrainMap.jsx';
import { useTerrain, profile } from '../components/terrain.js';

export const RED = '#8c1515';
export const INK = '#14213d';
export const ROUTE = '#1f2937';
export const BEST = '#0e7490';
export const GRAY = '#6b7280';

export const MAP_W = 700;
export const RELIEF = { lo: 1750, hi: 2770 };

// Pixels of sierra.bin (29.6 m; i east, j south). The pass: the lowest point a route from the west
// edge to the east edge must climb to (the bottleneck), 2,158.3 m at 39.3144 N, 120.3256 W.
export const PASS = [274, 208];
// a route through the pass that stays below it everywhere else: the shortest one in the pixels
// lower than the pass (climbing costs a little), from the west edge to the east edge, simplified
export const BEST_ROUTE = [[0, 219], [259, 219], [271, 208], PASS, [276, 206], [290, 205], [294, 201], [321, 200], [336, 190], [581, 189]];
// the route shown before one is drawn: due east across the map, over the shoulder of Mount Judah
export const START_ROUTE = [[0, 230], [581, 230]];
export const PEAKS = [
  { at: [199, 14], name: 'Castle Peak', dy: 22 },
  { at: [304, 269], name: 'Mount Judah', dy: -12 },
  { at: [266, 309], name: 'Mount Lincoln', dy: 24 },
];
export const LAKE = [452, 176];

// the profile chart: the width of the column beside the map, the height of the map
export const PW = 540;
export const PH = 414;
export const PAD = { l: 62, r: 14, t: 30, b: 40 };
export const E_LO = 1700;
export const E_HI = 2800;
export const KM = 25;

export const fmt = (e) => Math.round(e).toLocaleString('en-US');

/** The pointer's position in the SVG's own coordinates (reveal scales the slides). */
export function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}

/** The elevation along a route against the distance, with its highest point in red. */
export function ProfileLine({ prof, color, kmMax }) {
  const x = (d) => PAD.l + (d / kmMax) * (PW - PAD.l - PAD.r);
  const y = (e) => PH - PAD.b - ((e - E_LO) / (E_HI - E_LO)) * (PH - PAD.t - PAD.b);
  const top = prof.reduce((a, b) => (b.e > a.e ? b : a), prof[0]);
  const d = prof.map((q, k) => `${k ? 'L' : 'M'}${x(q.d).toFixed(1)},${y(q.e).toFixed(1)}`).join('');
  const right = x(top.d) > PW - 120;
  return (
    <g>
      <path d={`${d}L${x(prof[prof.length - 1].d).toFixed(1)},${y(E_LO)}L${x(0)},${y(E_LO)}Z`} fill={color} fillOpacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={PAD.l} x2={PW - PAD.r} y1={y(top.e)} y2={y(top.e)} stroke={RED} strokeWidth="1.2" strokeDasharray="4 4" />
      <circle cx={x(top.d)} cy={y(top.e)} r="6" fill={RED} stroke="#fff" strokeWidth="1.5" />
      <text x={x(top.d) + (right ? -10 : 10)} y={y(top.e) - 10} textAnchor={right ? 'end' : 'start'} fill={RED} fontSize="20" fontWeight="700">
        {fmt(top.e)} m
      </text>
    </g>
  );
}

/** The frame of the profile chart: elevation (m) against the distance along the route (km). */
export function ProfileAxes({ kmMax }) {
  const x = (d) => PAD.l + (d / kmMax) * (PW - PAD.l - PAD.r);
  const y = (e) => PH - PAD.b - ((e - E_LO) / (E_HI - E_LO)) * (PH - PAD.t - PAD.b);
  const kms = [0, 5, 10, 15, 20, 25].filter((k) => k <= kmMax);
  return (
    <g fontSize="15" fill={GRAY}>
      {[1800, 2000, 2200, 2400, 2600, 2800].map((e) => (
        <g key={e}>
          <line x1={PAD.l} x2={PW - PAD.r} y1={y(e)} y2={y(e)} stroke="#e5e7eb" />
          <text x={PAD.l - 8} y={y(e) + 5} textAnchor="end">
            {fmt(e)}
          </text>
        </g>
      ))}
      {kms.map((k) => (
        <text key={k} x={x(k)} y={PH - PAD.b + 20} textAnchor="middle">
          {k}
        </text>
      ))}
      <line x1={PAD.l} x2={PW - PAD.r} y1={y(E_LO)} y2={y(E_LO)} stroke={GRAY} />
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={y(E_LO)} stroke={GRAY} />
      <text x={PW - PAD.r} y={PH - 4} textAnchor="end" fontStyle="italic">
        km
      </text>
      <text x={PAD.l - 8} y={14} textAnchor="end" fontStyle="italic">
        m
      </text>
    </g>
  );
}

/**
 * Crossing the Sierra (the motivation): the map of the Sierra Nevada around Donner Pass (real
 * elevation data, level curves every 50 m), where a route is drawn with the pointer (press, drag,
 * release); at first the route goes due east across the map. Key press 1: beside the map, the
 * elevation along the route, its highest point in red, on the map too; 2: Donner Pass (2,158 m),
 * and a route through it whose profile peaks there; the drawn route fades.
 */
export default function Slide02Sierra() {
  const t = useTerrain('sierra');
  const [route, setRoute] = useState(START_ROUTE);
  const drawing = useRef(false);
  const k = t ? MAP_W / t.W : 1;

  const prof = useMemo(() => (t && route.length > 1 ? profile(t, route) : null), [t, route]);
  const best = useMemo(() => (t ? profile(t, BEST_ROUTE) : null), [t]);
  const kmMax = Math.max(KM, prof ? prof[prof.length - 1].d : 0);

  const toGrid = (e) => {
    const [x, y] = svgPoint(e.currentTarget, e);
    return [x / k - 0.5, y / k - 0.5];
  };
  const svgProps = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = true;
      setRoute([toGrid(e)]);
    },
    onPointerMove: (e) => {
      if (!drawing.current) return;
      const q = toGrid(e);
      setRoute((r) => {
        const [x, y] = r[r.length - 1];
        return Math.hypot(q[0] - x, q[1] - y) * k < 4 ? r : [...r, q];
      });
    },
    onPointerUp: () => {
      drawing.current = false;
    },
    onPointerCancel: () => {
      drawing.current = false;
    },
  };

  const path = (pts) => pts.map(([i, j], n) => `${n ? 'L' : 'M'}${((i + 0.5) * k).toFixed(1)},${((j + 0.5) * k).toFixed(1)}`).join('');
  const top = prof ? prof.reduce((a, b) => (b.e > a.e ? b : a), prof[0]) : null;

  return (
    <section className="sierra">
      <h2>Crossing the Sierra</h2>
      <p className="sierra-sub">
        1863–69: Leland Stanford’s Central Pacific Railroad
      </p>

      <div className="sierra-stage">
        <div className="sierra-map">
          {t && (
            <TerrainMap t={t} width={MAP_W} step={50} index={5} relief={RELIEF} className="sierra-draw" svgProps={svgProps} title="Map of the Sierra Nevada around Donner Pass, with level curves every 50 m">
              {(p) => (
                <g>
                  <g fontSize="15" fill={INK}>
                    {PEAKS.map(({ at, name, dy }) => (
                      <g key={name}>
                        <path d={`M${p.px(at[0])},${p.py(at[1]) - 6}l6,10h-12z`} fill={INK} />
                        <text x={p.px(at[0])} y={p.py(at[1]) + dy} textAnchor="middle" className="map-label">
                          {name}
                        </text>
                      </g>
                    ))}
                    <text x={p.px(LAKE[0])} y={p.py(LAKE[1]) + 5} textAnchor="middle" fill="#1d4f7a" className="map-label" fontStyle="italic">
                      Donner Lake
                    </text>
                    <text x={8} y={p.H - 10} className="map-label">
                      ← Sacramento
                    </text>
                    <text x={p.W - 8} y={p.H - 10} textAnchor="end" className="map-label">
                      Reno →
                    </text>
                  </g>

                  <Fragment as="g" index={2} effect="fade-out">
                    {route.length > 1 && <path d={path(route)} fill="none" stroke={ROUTE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                    <Fragment as="g" index={1}>
                      {top && <circle cx={p.px(top.x)} cy={p.py(top.y)} r="7" fill={RED} stroke="#fff" strokeWidth="2" />}
                    </Fragment>
                  </Fragment>

                  <Fragment as="g" index={2}>
                    <path d={path(BEST_ROUTE)} fill="none" stroke={BEST} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx={p.px(PASS[0])} cy={p.py(PASS[1])} r="7" fill={RED} stroke="#fff" strokeWidth="2" />
                    <text x={p.px(PASS[0]) - 12} y={p.py(PASS[1]) - 12} textAnchor="end" fill={RED} fontSize="19" fontWeight="700" className="map-label">
                      Donner Pass
                    </text>
                  </Fragment>
                </g>
              )}
            </TerrainMap>
          )}
        </div>

        <Fragment index={1} className="sierra-side">
          <p className="sierra-chart-title">Elevation along the route</p>
          <svg className="figure-svg sierra-profile" viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} role="img" aria-label="The elevation along the route">
            <ProfileAxes kmMax={kmMax} />
            <Fragment as="g" index={2} effect="fade-out">
              {prof && <ProfileLine prof={prof} color={ROUTE} kmMax={kmMax} />}
            </Fragment>
            <Fragment as="g" index={2}>
              {best && <ProfileLine prof={best} color={BEST} kmMax={kmMax} />}
            </Fragment>
          </svg>
        </Fragment>
      </div>

      <Notes>
        <p>
          In the 1860s the United States built its first railroad across the continent. The Central
          Pacific built it eastward from Sacramento, starting in 1863. Its president, one of its four
          founders, was Leland Stanford, governor of California, who later founded this university.
          Right after Sacramento comes the Sierra Nevada. Here is the stretch around Donner Lake, about
          17 km across, with level curves every 50 m. A train cannot climb much: every metre up costs
          fuel, time and tunnelling. Where would you cross? <em>[invite a student to draw a route from
          the west edge to the east edge]</em>
        </p>
        <p>
          <em>[Key press]</em> The chart shows the elevation along the route, and the red dot its
          highest point, on the map too. The route due east, on the slide at first, climbs to 2,442 m over the shoulder of Mount
          Judah. We want the route whose highest point is as low as possible.{' '}
          <em>[let a few students try, and compare their red numbers]</em>
        </p>
        <p>
          <em>[Key press]</em> Donner Pass: 2,158 m in our data (its published height is 2,151 m). No
          route across can stay lower, and this one climbs no higher. The pass is named after the Donner
          Party, emigrants trapped by the snow at Donner Lake in the winter of 1846–47. The railroad goes
          under it through the Summit Tunnel, 1,659 ft through granite, dug mostly by Chinese workers
          and finished in 1867; the first train went through in June 1868, and the line was used until
          1993. In May 1869 the Central Pacific met the Union Pacific in Utah, where Stanford drove the
          golden spike; it is now in the Cantor Arts Center, on campus.
        </p>
        <p>
          Along the route, the pass is the top. But it is not a mountain top: from the pass, the ridge
          climbs on both sides. What kind of point is it? We come back to it after saddle points.
        </p>
      </Notes>
    </section>
  );
}
