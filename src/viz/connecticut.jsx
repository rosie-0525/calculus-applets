import { useState } from 'react';
import '../lectures/l9/styles/deck.css';
import Tex from '../lectures/l9/components/Tex.jsx';
import TerrainMap from '../lectures/l9/components/TerrainMap.jsx';
import { useTerrain, maskUrl } from '../lectures/l9/components/terrain.js';
import { Peak, inside, MAP_W, CROP, FRISSELL, BEAR, CT_TOP, CT_LINE, MA_LINE, CT_POLY, RED, INK, LINE } from '../lectures/l9/slides/Slide14Connecticut.jsx';

export const lecture = 9;

/*
 * Highest point in Connecticut, without its title, the definition of E (the caption gives it) and
 * the speaker's notes: the corner where Connecticut, Massachusetts and New York meet (real
 * elevation data, level curves every 10 m; outside Connecticut veiled), with the state lines, Bear
 * Mountain and Mount Frissell. On the slide the highest point comes on a key press; here, on the
 * button, with the slide's sentence under the map.
 */
export default function Connecticut() {
  const t = useTerrain('frissell');
  const [shown, setShown] = useState(false);
  if (!t) return <div style={{ width: MAP_W, height: (MAP_W * (CROP[3] - CROP[1])) / (CROP[2] - CROP[0]) }} />;
  const line = (pts, p) => pts.map(([i, j], n) => `${n ? 'L' : 'M'}${p.px(i).toFixed(1)},${p.py(j).toFixed(1)}`).join('');
  const veil = maskUrl(t, 'outside CT', (e, i, j) => !inside([i, j], CT_POLY), '#ffffff', 0.5);
  return (
    <div>
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

            <Peak p={p} at={BEAR} name="Bear Mountain, 708 m" />
            <Peak p={p} at={FRISSELL} name="Mount Frissell, 747 m" />
            {shown && (
              <g>
                <circle cx={p.px(CT_TOP[0])} cy={p.py(CT_TOP[1])} r="7.5" fill={RED} stroke="#fff" strokeWidth="2" />
                <text x={p.px(CT_TOP[0]) + 14} y={p.py(CT_TOP[1]) + 26} fill={RED} fontSize="19" fontWeight="700" className="map-label">
                  725 m
                </text>
              </g>
            )}
          </g>
        )}
      </TerrainMap>

      <div className="ct-answer">
        {shown ? (
          <p className="ct-top">
            The highest point of Connecticut is on the state line: a <strong>boundary point</strong>, not a critical point of <Tex tex="E" />.
          </p>
        ) : (
          <button type="button" className="viz-button" onClick={() => setShown(true)}>
            Show the highest point
          </button>
        )}
      </div>
    </div>
  );
}
