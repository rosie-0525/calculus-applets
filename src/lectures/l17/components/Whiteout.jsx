import { useRef } from 'react';
import { BLUE } from './la.js';
import Fragment from './Fragment.jsx';
import { PRINT } from './print.js';
import { useClock } from './clock.js';
import { h, p } from './Climb.jsx'; // the old climb's mountain and path (Example 4)
import { HillMap, SIDE, T0, sideX, sideY, GROUND_PTS, pts } from './Drone.jsx';

const T_END = 19.4; // he climbs from t = 15 to here, short of the summit (t = 20), hidden in the fog
const CLIMB = 7; // seconds for it
const PERIOD = 9.5; // then a pause before he starts again
const STILL = 17.5; // the time shown in print
const SNOW = 110; // the snow line, in units of h
const JACKET = '#dc2626';
const CLEAR = 80; // the radius (px) of the clear air round him
const CAP = 16; // the greatest depth (px) of the snow cap under the ridge
const STRATA = [20, 40, 64]; // the depths (px) of the lines in the rock under the ridge

// the snow cap: the ridge above the snow line, and back along a ragged edge under it
const SNOW_PTS = (() => {
  const top = GROUND_PTS.filter(([, b]) => b <= sideY(SNOW));
  const edge = top.map(([a, b]) => [a, b + Math.min(CAP, 0.7 * (sideY(SNOW) - b)) * (0.75 + 0.25 * Math.sin(a / 6.5))]);
  return [...top, ...edge.reverse()];
})();

/** The climber seen from the side, his feet at `at`, facing right, leaning into the slope; `step` (0 to 1) swings his legs. */
function Climber({ at, step }) {
  const swing = 4.5 * Math.sin(step * 2 * Math.PI);
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(14)`} strokeLinecap="round" strokeLinejoin="round">
      <line x1="0" y1="-11" x2={swing} y2="0" stroke="#1f2937" strokeWidth="2.6" />
      <line x1="0" y1="-11" x2={-swing} y2="0" stroke="#374151" strokeWidth="2.6" />
      <rect x="-7.5" y="-22" width="5.5" height="9" rx="1.5" fill="#1d4ed8" />
      <line x1="0" y1="-11" x2="0.5" y2="-21" stroke={JACKET} strokeWidth="5" />
      <line x1="0.5" y1="-19" x2="7" y2="-15" stroke={JACKET} strokeWidth="2.2" />
      <line x1="7" y1="-15" x2="11" y2="-3" stroke="#6b7280" strokeWidth="1.6" />
      <circle cx="1" cy="-25.5" r="3.6" fill="#e0b48f" />
      <path d="M -2.8 -26 a 3.9 3.9 0 0 1 7.6 0 z" fill={JACKET} />
    </g>
  );
}

/**
 * Example 4, the climb in a whiteout: on top, his watch's map of the mountain h(x, y) with his GPS
 * track p(t), dashed, and the climber on it; under it, the side view along the track, the mountain h(p(t))
 * with its snow cap, in a fog that is clear only round him, so that the summit stays hidden; he
 * climbs on a loop from t = 15 to t = 19.4, short of the summit, the time t in the corner from key
 * press `tAt` (always, without it). Still at t = 17.5 in print.
 */
export default function Whiteout({ width = 400, mapHeight = 236, tAt }) {
  const ref = useRef(null);
  const clock = useClock(ref);
  const t = PRINT ? STILL : Math.min(T_END, T0 + ((clock % PERIOD) / CLIMB) * (T_END - T0));
  const feet = [sideX(t), sideY(h(...p(t)))];
  const near = [feet[0], feet[1] - 16];
  const readout = (
    <text x="10" y="22" fontSize="14" fill="#374151">
      {`t = ${t.toFixed(1)}`}
    </text>
  );
  return (
    <div ref={ref} className="l17-drone">
      <HillMap
        t={t}
        width={width}
        height={mapHeight}
        track={BLUE}
        caption={
          <>
            contour plot of <tspan fontStyle="italic">h</tspan>(<tspan fontStyle="italic">x</tspan>, <tspan fontStyle="italic">y</tspan>)
          </>
        }
        title="His watch's map, the contour plot of h(x, y), his straight GPS track over the summit, and the climber on it"
      >
        {(at) => (
          <g>
            <circle cx={at[0]} cy={at[1]} r="6.5" fill={JACKET} stroke="#fff" strokeWidth="2" />
            <text x={at[0] - 11} y={at[1] + 5} fontSize="13" fontWeight="700" fontStyle="italic" fill={BLUE} textAnchor="end" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 }}>
              p(t)
            </text>
          </g>
        )}
      </HillMap>
      <svg className="l17-drone-side" viewBox={`0 0 ${SIDE.w} ${SIDE.h}`} width={SIDE.w} height={SIDE.h} role="img" aria-label="The side view along his track: the mountain in a whiteout, clear only round the climber as he climbs">
        <defs>
          <radialGradient id="l17-fog-clear" gradientUnits="userSpaceOnUse" cx={near[0]} cy={near[1]} r={CLEAR} gradientTransform={`translate(${near[0]} ${near[1]}) scale(1 0.62) translate(${-near[0]} ${-near[1]})`}>
            <stop offset="0" stopColor="#000" />
            <stop offset="0.35" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <mask id="l17-fog-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={SIDE.w} height={SIDE.h}>
            <rect x="0" y="0" width={SIDE.w} height={SIDE.h} fill="url(#l17-fog-clear)" />
          </mask>
        </defs>
        <rect x="0" y="0" width={SIDE.w} height={SIDE.h} fill="#e2e8f0" />
        <polygon points={`${pts(GROUND_PTS)} ${SIDE.w - 14},${SIDE.h} 14,${SIDE.h}`} fill="#a3adb9" stroke="#7b8794" strokeWidth="1.5" strokeLinejoin="round" />
        {STRATA.map((k) => (
          <polyline key={k} points={pts(GROUND_PTS.filter(([, b]) => b + k < SIDE.h - 3).map(([a, b]) => [a, b + k]))} fill="none" stroke="#7b8794" strokeWidth="1" strokeDasharray="16 7 5 10 24 8" opacity="0.6" />
        ))}
        <polygon points={pts(SNOW_PTS)} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" strokeLinejoin="round" />
        <Climber at={feet} step={PRINT ? 0.15 : clock * 1.6} />
        {/* the whiteout, clear only round him */}
        <rect x="0" y="0" width={SIDE.w} height={SIDE.h} fill="#eef1f5" opacity="0.93" mask="url(#l17-fog-mask)" />
        {tAt == null ? readout : (
          <Fragment as="g" index={tAt}>
            {readout}
          </Fragment>
        )}
      </svg>
    </div>
  );
}
