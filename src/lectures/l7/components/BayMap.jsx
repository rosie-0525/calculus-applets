import { useEffect, useMemo, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';
import { segmentsPath } from './levels.js';
import { W, H, PIXEL_M, PLACES, useElevation, flood, paint, mapDataUrl, shoreline, levelSet, PRINT } from './bay.js';

const CARDINAL = '#8c1515';
const INK = '#14213d';

/** Text with a white halo, so that it reads on any part of the map. */
function Halo({ children, ...rest }) {
  return (
    <text paintOrder="stroke" stroke="#fff" strokeWidth="4" strokeLinejoin="round" {...rest}>
      {children}
    </text>
  );
}

/**
 * The map of Stanford and the South Bay with the sea at level `c` (m above today's sea level):
 * the land shaded by height, the water the Bay reaches shaded by depth, and the shoreline E = c in
 * red (`shore`: 'shore' for the shoreline only, 'level' for the whole level set E = c, null for
 * none). Today's shoreline is dashed. Pointing at the map shows E there.
 *
 * The map is a canvas, which a PDF cannot show: in print mode it is a still image for each of
 * `steps` ([{ index, c }], the fragment index at which the sea reaches level c) on top of the
 * image for `c`.
 */
export default function BayMap({
  c = 0,
  scale = 1.15,
  shore = 'shore',
  today = true,
  places = PLACES,
  steps = [],
  contours = [],
  contourColor = () => INK,
  hover = true,
  children,
}) {
  const E = useElevation();
  const canvasRef = useRef(null);
  const [point, setPoint] = useState(null);
  const w = W * scale;
  const h = H * scale;
  const map = ([i, j]) => [i * scale, j * scale];

  const wet = useMemo(() => (E ? flood(E, c) : null), [E, c]);

  useEffect(() => {
    if (PRINT || !E || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const img = ctx.createImageData(W, H);
    paint(E, wet, c, img.data);
    ctx.putImageData(img, 0, 0);
  }, [E, wet, c]);

  const curve = (level, mask) => {
    if (!E || shore === null) return '';
    const segs = shore === 'level' ? levelSet(E, level) : shoreline(E, mask, level);
    return segmentsPath(segs, map);
  };

  const shorePath = useMemo(() => curve(c, wet), [E, wet, c, shore, scale]); // eslint-disable-line react-hooks/exhaustive-deps
  const todayPath = useMemo(() => {
    if (!E || !today) return '';
    return segmentsPath(shoreline(E, flood(E, 0), 0), map);
  }, [E, today, scale]); // eslint-disable-line react-hooks/exhaustive-deps
  const contourPaths = useMemo(
    () => (E ? contours.map((lv) => ({ lv, d: segmentsPath(levelSet(E, lv), map) })) : []),
    [E, contours, scale], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // the still images of the PDF
  const stills = useMemo(() => {
    if (!PRINT || !E) return [];
    return [{ index: null, c }, ...steps].map((st) => ({
      ...st,
      url: mapDataUrl(E, st.c),
      d: shore === null ? '' : curve(st.c, flood(E, st.c)),
    }));
  }, [E]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMove = (e) => {
    if (!E || !hover) return;
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (W - 1));
    const j = Math.round(((e.clientY - r.top) / r.height) * (H - 1));
    if (i < 0 || j < 0 || i >= W || j >= H) return setPoint(null);
    return setPoint({ i, j, e: E[j * W + i] });
  };

  const bar = (2000 / PIXEL_M) * scale; // 2 km

  return (
    <div className="bay-map" style={{ width: w, height: h }}>
      {!PRINT && <canvas ref={canvasRef} width={W} height={H} style={{ width: w, height: h }} />}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        role="img"
        aria-label="Map of Stanford and the South Bay, with the sea at the chosen level"
        onPointerMove={onMove}
        onPointerLeave={() => setPoint(null)}
      >
        {stills.map((st) => {
          const layer = (
            <g key={st.index ?? 'base'}>
              <image href={st.url} width={w} height={h} preserveAspectRatio="none" />
              <path d={st.d} fill="none" stroke={CARDINAL} strokeWidth="2.4" strokeLinecap="round" />
            </g>
          );
          return st.index === null ? (
            layer
          ) : (
            <Fragment key={st.index} as="g" index={st.index}>
              {layer}
            </Fragment>
          );
        })}

        {todayPath && (
          <path d={todayPath} fill="none" stroke={INK} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
        )}
        <g fill="none" strokeLinecap="round">
          {contourPaths.map(({ lv, d }) => (
            <path key={lv} d={d} stroke={contourColor(lv)} strokeWidth="1.3" />
          ))}
        </g>
        {!PRINT && shorePath && (
          <path d={shorePath} fill="none" stroke={CARDINAL} strokeWidth="2.4" strokeLinecap="round" />
        )}

        {places.map((pl) => {
          const [x, y] = map(pl.at);
          return (
            <g key={pl.name}>
              <circle cx={x} cy={y} r="4.5" fill={INK} stroke="#fff" strokeWidth="1.5" />
              <Halo x={x + pl.dx} y={y + pl.dy} textAnchor={pl.anchor} fontSize="15" fontWeight="700" fill={INK}>
                {pl.name}
              </Halo>
            </g>
          );
        })}

        {/* scale bar and north */}
        <g transform={`translate(${w - bar - 18}, ${h - 22})`} fontSize="12" fill={INK}>
          <rect x="-6" y="-17" width={bar + 12} height="28" rx="4" fill="#fff" opacity="0.8" />
          <line x1="0" y1="0" x2={bar} y2="0" stroke={INK} strokeWidth="2.5" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke={INK} strokeWidth="1.5" />
          <line x1={bar} y1="-4" x2={bar} y2="4" stroke={INK} strokeWidth="1.5" />
          <text x={bar / 2} y="-5" textAnchor="middle">
            2 km
          </text>
        </g>
        <g transform={`translate(${w - 22}, 24)`} fill={INK}>
          <polygon points="0,-14 6,4 0,0 -6,4" />
          <text y="18" textAnchor="middle" fontSize="12" fontWeight="700">
            N
          </text>
        </g>

        {typeof children === 'function' ? children(map) : children}

        {point && (
          <g pointerEvents="none">
            <circle cx={point.i * scale} cy={point.j * scale} r="4" fill="#fff" stroke={INK} strokeWidth="2" />
            <Halo
              x={point.i * scale + (point.i > W * 0.7 ? -10 : 10)}
              y={point.j * scale - 10}
              textAnchor={point.i > W * 0.7 ? 'end' : 'start'}
              fontSize="16"
              fontWeight="700"
              fill={INK}
            >
              {`E = ${point.e.toFixed(1)} m`}
            </Halo>
          </g>
        )}
      </svg>
    </div>
  );
}
