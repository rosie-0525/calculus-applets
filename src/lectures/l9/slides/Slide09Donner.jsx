import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import TerrainMap from '../components/TerrainMap.jsx';
import { useTerrain, profile, levelGrid, maskUrl } from '../components/terrain.js';
import { levelSegments, segmentsPath } from '../components/levels.js';
import PassTrain from '../components/PassTrain.jsx';

export const RED = '#8c1515';
export const INK = '#14213d';
export const ROUTE = '#0e7490';
export const CREST = '#b45309';
export const GRAY = '#6b7280';

export const MAP_W = 470;

// Pixels of pass.bin (14.8 m; i east, j south). The pass: the bottleneck from the west edge to the
// east edge, 2,158.1 m (in the Sierra map, 2,158.3 m on 29.6 m pixels).
export const PASS = [111, 109];
export const PASS_E = 2158.1;
export const M = 14.784; // metres per pixel
export const HALF = 350 / M; // the lines run 350 m each way from the pass
// the map shows 45 pixels (665 m) each way from the pass
export const CROP = [PASS[0] - 45, PASS[1] - 45, PASS[0] + 46, PASS[1] + 46];
// along the route, 20° north of east (the pass is the highest point of this line within 350 m;
// 500 m to the west-south-west a knob comes within 2 m of it); along the crest, due north (the
// lowest point of this line)
export const dir = (deg) => [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)];
export const line = ([u, v]) => [
  [PASS[0] - u * HALF, PASS[1] - v * HALF],
  [PASS[0] + u * HALF, PASS[1] + v * HALF],
];
export const ROUTE_LINE = line(dir(20));
export const CREST_LINE = line(dir(-90)); // from the north to the south

// the profile charts
export const PW = 350;
export const PH = 168;
export const PAD = { l: 58, r: 12, t: 12, b: 30 };
export const E_LO = 2120;
export const E_HI = 2240;
export const BELOW = '#5b9bd5';

/** The level curve E = c on the map, in red. */
export function LevelCurve({ t, p, c }) {
  const d = segmentsPath(levelSegments(levelGrid(t), c), ([x, y]) => [p.px(x), p.py(y)]);
  return <path d={d} fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
}

export const fmt = (e) => Math.round(e).toLocaleString('en-US');

/** The elevation along a line through the pass, the pass marked, from −0.7 to 0.7 km. */
export function Profile({ t, pts, color, ends }) {
  const prof = profile(t, pts, 0.5);
  const L = prof[prof.length - 1].d;
  const x = (d) => PAD.l + (d / L) * (PW - PAD.l - PAD.r);
  const y = (e) => PH - PAD.b - ((e - E_LO) / (E_HI - E_LO)) * (PH - PAD.t - PAD.b);
  const d = prof.map((q, k) => `${k ? 'L' : 'M'}${x(q.d).toFixed(1)},${y(q.e).toFixed(1)}`).join('');
  return (
    <svg className="figure-svg pass-profile" viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} role="img" aria-label="The elevation along a line through the pass">
      <g fontSize="14" fill={GRAY}>
        {[2150, 2200].map((e) => (
          <g key={e}>
            <line x1={PAD.l} x2={PW - PAD.r} y1={y(e)} y2={y(e)} stroke="#e5e7eb" />
            <text x={PAD.l - 7} y={y(e) + 5} textAnchor="end">
              {fmt(e)}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={PH - PAD.b} stroke={GRAY} />
        <line x1={PAD.l} x2={PW - PAD.r} y1={PH - PAD.b} y2={PH - PAD.b} stroke={GRAY} />
        <text x={PAD.l} y={PH - 8} textAnchor="start">
          {ends[0]}
        </text>
        <text x={PW - PAD.r} y={PH - 8} textAnchor="end">
          {ends[1]}
        </text>
        <text x={PAD.l - 7} y={PAD.t + 12} textAnchor="end" fontStyle="italic">
          m
        </text>
      </g>
      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
      <circle cx={x(L / 2)} cy={y(PASS_E)} r="6" fill={RED} stroke="#fff" strokeWidth="1.5" />
      <text x={x(L / 2)} y={y(PASS_E) + (color === ROUTE ? -12 : 26)} textAnchor="middle" fill={RED} fontSize="15" fontWeight="700">
        {fmt(PASS_E)} m
      </text>
    </svg>
  );
}

/**
 * Donner Pass (the saddle point of the opener, close up): the map 665 m each way around the pass
 * (level curves every 5 m), the pass in red. Key press 1: the line through the pass along the
 * route (20° north of east, 350 m each way) and its profile, a local maximum at the pass; 2: the
 * line along the crest (due north to south) and its profile, a local minimum; 3: the points lower
 * than the pass tinted blue (west and east), the level curve E = 2,158 m through the pass in red,
 * which crosses itself there in an X; 4: the cartoon (PassTrain.jsx), a train through the tunnel under the
 * pass, animated.
 */
export default function Slide09Donner() {
  const t = useTerrain('pass');
  const seg = ([[a, b], [c, d]], p) => `M${p.px(a)},${p.py(b)}L${p.px(c)},${p.py(d)}`;
  return (
    <section className="dense donner">
      <h2>Donner Pass</h2>

      <div className="donner-stage">
        <TerrainMap
          t={t}
          width={MAP_W}
          step={5}
          index={4}
          crop={CROP}
          relief={{ lo: 2080, hi: 2300, relief: 1 }}
          title="Map of Donner Pass, with level curves every 10 m"
        >
          {(p) => (
            <g>
              <Fragment as="g" index={3}>
                <image href={maskUrl(t, `below ${PASS_E}`, (e) => e < PASS_E, BELOW, 0.45)} x={p.px(-0.5)} y={p.py(-0.5)} width={t.W * p.k} height={t.H * p.k} preserveAspectRatio="none" />
                <LevelCurve t={t} p={p} c={PASS_E} />
              </Fragment>
              <g fontSize="15" fill={INK}>
                <text x={8} y={22} className="map-label">
                  ← Sacramento
                </text>
                <text x={p.W - 8} y={22} textAnchor="end" className="map-label">
                  Donner Lake →
                </text>
              </g>
              <Fragment as="g" index={1}>
                <path d={seg(ROUTE_LINE, p)} stroke={ROUTE} strokeWidth="4" strokeLinecap="round" />
              </Fragment>
              <Fragment as="g" index={2}>
                <path d={seg(CREST_LINE, p)} stroke={CREST} strokeWidth="4" strokeLinecap="round" />
              </Fragment>
              <circle cx={p.px(PASS[0])} cy={p.py(PASS[1])} r="7" fill={RED} stroke="#fff" strokeWidth="2" />
              <text x={p.px(PASS[0]) - 12} y={p.py(PASS[1]) + 26} textAnchor="end" fill={RED} fontSize="18" fontWeight="700" className="map-label">
                Donner Pass
              </text>
            </g>
          )}
        </TerrainMap>

        <div className="donner-side">
          <div className="donner-profs">
            <Fragment index={1} className="donner-prof">
              <p className="donner-label" style={{ color: ROUTE }}>
                Along the route: a local maximum
              </p>
              <Profile t={t} pts={ROUTE_LINE} color={ROUTE} ends={['WSW', 'ENE']} />
            </Fragment>
            <Fragment index={2} className="donner-prof">
              <p className="donner-label" style={{ color: CREST }}>
                Along the crest: a local minimum
              </p>
              <Profile t={t} pts={CREST_LINE} color={CREST} ends={['N', 'S']} />
            </Fragment>
          </div>
          <Fragment index={4} className="donner-cartoon">
            <PassTrain title="Cartoon: a train climbs to the pass, the lowest point of the crest between two peaks, goes through a tunnel under it and comes out above Donner Lake" />
          </Fragment>
        </div>
      </div>

      <Notes>
        <p>
          Back to Donner Pass from the opening, close up: 665 m each way around the pass, with level
          curves every 5 m, Sacramento to the west and Donner Lake to the east.
        </p>
        <p>
          <em>[Key press]</em> Along the route, the line through the pass going east-north-east: the pass
          is its highest point, a local maximum along this line.
        </p>
        <p>
          <em>[Key press]</em> Along the crest, from north to south: the pass is its lowest point, a local
          minimum along this line. So the pass is neither a local maximum nor a local minimum of the
          elevation, and yet the ground is level there: it is a saddle point, like the origin for
          x² − y². Hikers call such a place a saddle, too.
        </p>
        <p>
          <em>[Key press]</em> In blue, the ground lower than the pass: two pieces, one to the west and
          one to the east, which touch only at the pass. To get from one to the other, a train must go
          through the pass or climb higher. The level curve through the pass, E = 2,158 m in red,
          crosses itself there in an X, like the level curve x² − y² = 0, the two lines y = x and
          y = −x. That is how a saddle point looks on a contour plot; next, we find some on one.
        </p>
      </Notes>
    </section>
  );
}
