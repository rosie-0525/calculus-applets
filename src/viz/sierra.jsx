import { useMemo, useRef, useState } from 'react';
import '../lectures/l9/styles/deck.css';
import TerrainMap from '../lectures/l9/components/TerrainMap.jsx';
import { useTerrain, profile } from '../lectures/l9/components/terrain.js';
import {
  ProfileLine,
  ProfileAxes,
  svgPoint,
  MAP_W,
  RELIEF,
  PASS,
  BEST_ROUTE,
  START_ROUTE,
  PEAKS,
  LAKE,
  PW,
  PH,
  KM,
  RED,
  INK,
  ROUTE,
  BEST,
} from '../lectures/l9/slides/Slide02Sierra.jsx';

export const lecture = 9;

/*
 * Crossing the Sierra, without its title and the speaker's story (the caption tells it): the map
 * around Donner Pass (real elevation data, level curves every 50 m), where a route is drawn with the
 * pointer (press, drag, release; at first, due east across the map), and beside it the elevation
 * along the route, its highest point in red, on the map too. On the slide the profile and then
 * Donner Pass come on key presses; here the profile is always there, and the button shows (or
 * hides) Donner Pass, the route through it and its profile, the drawn route faint (drawing a new
 * one hides them again).
 */
export default function Sierra() {
  const t = useTerrain('sierra');
  const [route, setRoute] = useState(START_ROUTE);
  const [pass, setPass] = useState(false);
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
      setPass(false);
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

  if (!t) return <div style={{ width: MAP_W + 34 + PW, height: PH }} />;
  return (
    <div className="sierra-stage">
      <div className="sierra-map">
        <TerrainMap t={t} width={MAP_W} step={50} index={5} relief={RELIEF} className="sierra-draw" svgProps={svgProps} title="Map of the Sierra Nevada around Donner Pass, with level curves every 50 m: draw a route across it">
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

              {pass && (
                <g>
                  <path d={path(BEST_ROUTE)} fill="none" stroke={BEST} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={p.px(PASS[0])} cy={p.py(PASS[1])} r="7" fill={RED} stroke="#fff" strokeWidth="2" />
                  <text x={p.px(PASS[0]) - 12} y={p.py(PASS[1]) - 12} textAnchor="end" fill={RED} fontSize="19" fontWeight="700" className="map-label">
                    Donner Pass
                  </text>
                </g>
              )}
              <g opacity={pass ? 0.3 : 1}>
                {route.length > 1 && <path d={path(route)} fill="none" stroke={ROUTE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                {top && !pass && <circle cx={p.px(top.x)} cy={p.py(top.y)} r="7" fill={RED} stroke="#fff" strokeWidth="2" />}
              </g>
            </g>
          )}
        </TerrainMap>
      </div>

      <div className="sierra-side">
        <p className="sierra-chart-title">Elevation along the route</p>
        <svg className="figure-svg sierra-profile" viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} role="img" aria-label="The elevation along the route">
          <ProfileAxes kmMax={kmMax} />
          {pass ? best && <ProfileLine prof={best} color={BEST} kmMax={kmMax} /> : prof && <ProfileLine prof={prof} color={ROUTE} kmMax={kmMax} />}
        </svg>
        <div className="viz-toggle">
          <button type="button" className="viz-button" aria-pressed={pass} onClick={() => setPass((v) => !v)}>
            {pass ? 'Hide Donner Pass' : 'Show Donner Pass'}
          </button>
        </div>
      </div>
    </div>
  );
}
