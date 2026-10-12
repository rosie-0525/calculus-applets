import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import TerrainMap from '../components/TerrainMap.jsx';
import { useTerrain, maskUrl } from '../components/terrain.js';
import borders from '../data/borders.json';

export const RED = '#8c1515';
export const INK = '#14213d';
export const LINE = '#374151';

export const MAP_W = 880;
// Pixels of frissell.bin (14.2 m; i east, j south); the map shows i from 30 to 390, j from 70 to 250
export const CROP = [30, 70, 390, 250];
export const FRISSELL = [133, 132]; // the summit, 747.4 m, in Massachusetts
export const BEAR = [290, 181]; // Bear Mountain, 708.1 m, the highest summit in Connecticut
export const CT_TOP = [128.12, 144.01]; // the highest point of Connecticut, 725.3 m, on the state line
export const TRI = [102.84, 144.68]; // where Connecticut, Massachusetts and New York meet

// the state lines: Salisbury's outline (the Connecticut-New York line, then the
// Connecticut-Massachusetts line), and Mount Washington's outline west of the tri-state point (the
// Massachusetts-New York line); its east side is a town line, inside Massachusetts
export const CT_LINE = borders.ct[0];
export const MA_LINE = borders.ma[0].slice(borders.ma[0].findIndex(([i, j]) => i === TRI[0] && j === TRI[1]));
// Connecticut: south-east of its outline
export const CT_POLY = [...CT_LINE, [CT_LINE[CT_LINE.length - 1][0], 400], [CT_LINE[0][0], 400]];

export function inside([x, y], poly) {
  let c = false;
  for (let k = 0, m = poly.length - 1; k < poly.length; m = k, k += 1) {
    const [x1, y1] = poly[k];
    const [x2, y2] = poly[m];
    if (y1 > y !== y2 > y && x < x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)) c = !c;
  }
  return c;
}

/** A peak: a triangle and its name and height. */
export function Peak({ p, at, name, dx = 0, dy = -14, anchor = 'middle' }) {
  return (
    <g>
      <path d={`M${p.px(at[0])},${p.py(at[1]) - 7}l7,12h-14z`} fill={INK} />
      <text x={p.px(at[0]) + dx} y={p.py(at[1]) + dy} textAnchor={anchor} fill={INK} fontSize="18" fontWeight="700" className="map-label">
        {name}
      </text>
    </g>
  );
}

/**
 * Highest point in Connecticut (right after Critical point or boundary point): the corner where Connecticut,
 * Massachusetts and New York meet (real elevation data, level curves every 10 m; outside
 * Connecticut veiled), with the state lines. E: Connecticut → ℝ. Key press 1: Bear Mountain, the
 * highest summit in Connecticut (708 m), a local maximum; 2: Mount Frissell (747 m), whose summit is
 * in Massachusetts; 3: the highest point of Connecticut, 725 m, on the state line on Frissell's
 * slope: a boundary point of the region, not a critical point of E.
 */
export default function Slide14Connecticut() {
  const t = useTerrain('frissell');
  const line = (pts, p) => pts.map(([i, j], n) => `${n ? 'L' : 'M'}${p.px(i).toFixed(1)},${p.py(j).toFixed(1)}`).join('');
  const veil = maskUrl(t, 'outside CT', (e, i, j) => !inside([i, j], CT_POLY), '#ffffff', 0.5);
  return (
    <section className="dense ct">
      <h2>Highest point in Connecticut</h2>
      <p className="ct-fn">
        <Tex tex={r`E(x,y)=`} /> height above the sea level at location <Tex tex="(x,y)" />, <Tex tex={r`\quad E:\text{Connecticut}\to\mathbb{R}`} />
      </p>

      <TerrainMap t={t} width={MAP_W} step={10} index={5} crop={CROP} relief={{ lo: 300, hi: 750, relief: 1.2 }} title="Map of the corner where Connecticut, Massachusetts and New York meet, with level curves every 10 m">
        {(p) => (
          <g>
            <image href={veil} x={p.px(-0.5)} y={p.py(-0.5)} width={t.W * p.k} height={t.H * p.k} preserveAspectRatio="none" />
            <g fill="none" stroke={LINE} strokeWidth="2.5" strokeDasharray="12 5 3 5" strokeLinecap="round">
              <path d={line(CT_LINE, p)} />
              <path d={line(MA_LINE, p)} />
            </g>
            <g className="ct-states" fill={INK} fontSize="20" fontWeight="700" letterSpacing="0.18em">
              <text x={p.px(250)} y={p.py(95)} textAnchor="middle" className="map-label">
                MASSACHUSETTS
              </text>
              <text x={p.px(225)} y={p.py(236)} textAnchor="middle" className="map-label">
                CONNECTICUT
              </text>
              <text x={p.px(66)} y={p.py(210)} textAnchor="middle" className="map-label">
                NEW YORK
              </text>
            </g>

            <Fragment as="g" index={1}>
              <Peak p={p} at={BEAR} name="Bear Mountain, 708 m" />
            </Fragment>
            <Fragment as="g" index={2}>
              <Peak p={p} at={FRISSELL} name="Mount Frissell, 747 m" />
            </Fragment>
            <Fragment as="g" index={3}>
              <circle cx={p.px(CT_TOP[0])} cy={p.py(CT_TOP[1])} r="7.5" fill={RED} stroke="#fff" strokeWidth="2" />
              <text x={p.px(CT_TOP[0]) + 14} y={p.py(CT_TOP[1]) + 26} fill={RED} fontSize="19" fontWeight="700" className="map-label">
                725 m
              </text>
            </Fragment>
          </g>
        )}
      </TerrainMap>

      <Fragment index={3} as="p" className="ct-top">
        The highest point of Connecticut is on the state line: a <strong>boundary point</strong>, not a critical point
        of <Tex tex="E" />.
      </Fragment>

      <Notes>
        <p>
          Now the domain is a region, not all of ℝ². This is the north-west corner of Connecticut, where
          it meets Massachusetts and New York, with level curves every 10 m; the land outside
          Connecticut is veiled. E is the elevation on Connecticut only, E: Connecticut → ℝ. Where is
          its global maximum, the highest point in Connecticut? <em>[let them guess]</em>
        </p>
        <p>
          <em>[Key press]</em> Bear Mountain, 708 m (2,323 ft), the highest summit in Connecticut: a
          local maximum of E, so a critical point. A stone monument built on its top in 1885 calls it the
          highest ground in Connecticut.
        </p>
        <p>
          <em>[Key press]</em> But Mount Frissell is higher, 747 m (2,453 ft), and its summit is just
          across the line, in Massachusetts: it is not in the domain of E.
        </p>
        <p>
          <em>[Key press]</em> Its south slope comes down into Connecticut, and where it crosses the
          state line, 170 m south of the summit, it is still 725 m (2,380 ft), higher than Bear Mountain.
          In the 1940s the US Geological Survey found that this is the highest point of Connecticut. It
          is not a critical point: the ground there still climbs to the north, into Massachusetts. It is
          a boundary point of the domain. So to find a global maximum on a region, checking the critical
          points is not enough: we must check the boundary too. Next: interior and boundary points.
        </p>
      </Notes>
    </section>
  );
}
