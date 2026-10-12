import '../lectures/l9/styles/deck.css';
import TerrainMap from '../lectures/l9/components/TerrainMap.jsx';
import PassTrain from '../lectures/l9/components/PassTrain.jsx';
import { useTerrain, maskUrl } from '../lectures/l9/components/terrain.js';
import { LevelCurve, Profile, MAP_W, PASS, PASS_E, CROP, ROUTE_LINE, CREST_LINE, BELOW, RED, INK, ROUTE, CREST } from '../lectures/l9/slides/Slide09Donner.jsx';

export const lecture = 9;

/*
 * Donner Pass with everything showing, without its title and the speaker's notes (the caption says
 * what it shows): the map 665 m each way around the pass (level curves every 5 m), the ground lower
 * than the pass in blue and the level curve through it in red; the line along the route and the
 * line along the crest, and beside the map their profiles, a local maximum and a local minimum at
 * the pass; under them the cartoon of a train through the tunnel under the pass, animated while it
 * is on screen.
 */
export default function DonnerPass() {
  const t = useTerrain('pass');
  const seg = ([[a, b], [c, d]], p) => `M${p.px(a)},${p.py(b)}L${p.px(c)},${p.py(d)}`;
  return (
    <div className="donner-stage">
      {t ? (
        <TerrainMap t={t} width={MAP_W} step={5} index={4} crop={CROP} relief={{ lo: 2080, hi: 2300, relief: 1 }} title="Map of Donner Pass, with level curves every 5 m">
          {(p) => (
            <g>
              <image href={maskUrl(t, `below ${PASS_E}`, (e) => e < PASS_E, BELOW, 0.45)} x={p.px(-0.5)} y={p.py(-0.5)} width={t.W * p.k} height={t.H * p.k} preserveAspectRatio="none" />
              <LevelCurve t={t} p={p} c={PASS_E} />
              <g fontSize="15" fill={INK}>
                <text x={8} y={22} className="map-label">
                  ← Sacramento
                </text>
                <text x={p.W - 8} y={22} textAnchor="end" className="map-label">
                  Donner Lake →
                </text>
              </g>
              <path d={seg(ROUTE_LINE, p)} stroke={ROUTE} strokeWidth="4" strokeLinecap="round" />
              <path d={seg(CREST_LINE, p)} stroke={CREST} strokeWidth="4" strokeLinecap="round" />
              <circle cx={p.px(PASS[0])} cy={p.py(PASS[1])} r="7" fill={RED} stroke="#fff" strokeWidth="2" />
              <text x={p.px(PASS[0]) - 12} y={p.py(PASS[1]) + 26} textAnchor="end" fill={RED} fontSize="18" fontWeight="700" className="map-label">
                Donner Pass
              </text>
            </g>
          )}
        </TerrainMap>
      ) : (
        <div style={{ width: MAP_W, height: MAP_W }} />
      )}

      <div className="donner-side">
        {t && (
          <div className="donner-profs">
            <div className="donner-prof">
              <p className="donner-label" style={{ color: ROUTE }}>
                Along the route: a local maximum
              </p>
              <Profile t={t} pts={ROUTE_LINE} color={ROUTE} ends={['WSW', 'ENE']} />
            </div>
            <div className="donner-prof">
              <p className="donner-label" style={{ color: CREST }}>
                Along the crest: a local minimum
              </p>
              <Profile t={t} pts={CREST_LINE} color={CREST} ends={['N', 'S']} />
            </div>
          </div>
        )}
        <div className="donner-cartoon">
          <PassTrain title="Cartoon: a train climbs to the pass, the lowest point of the crest between two peaks, goes through a tunnel under it and comes out above Donner Lake" />
        </div>
      </div>
    </div>
  );
}
