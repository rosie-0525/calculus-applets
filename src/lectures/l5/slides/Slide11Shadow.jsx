import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, PlaneLabel, AngleArc, RightAngle } from '../components/Plane.jsx';
import Slider from '../components/Slider.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GREEN = '#175e54';

// Lecture 2's bike ride (slide 14b), relabelled to today's notation: the rider
// heads along v (green, like the line span(v) on the next slide) and the wind is
// x (ink); the shadow is teal, like Proj_v(x) on the next slide.
// A map view: the road runs along the x-axis and the rider heads along
// v = (1.5, 0), shorter than the shadow at θ = 60° so the shadow shows past it.
// The wind x has speed 4 and blows at the angle θ to the heading, so
// x = 4 (cos θ, sin θ) and ℓ = x · v / ‖v‖ = 4 cos θ; at θ = 60°, ℓ = 2.
export const W = [1.5, 0];
export const V_LEN = 4;
export const ROAD = 0.45; // half the road's width

// The wind field is drawn in a frame where the wind blows along +x, then
// rotated to the direction of v. Its gusts and leaves are scattered with a
// seeded random generator, so the picture is the same on every run.
export const rand = (() => {
  let seed = 7;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
})();
export const between = (a, b) => a + (b - a) * rand();
export const FIELD = 340; // half the side of the square the wind covers, in px
// One gust per cell of a 9 × 8 grid, jittered within its cell, so they spread evenly
export const CELL = [(2 * FIELD) / 9, (2 * FIELD) / 8];
export const GUSTS = Array.from({ length: 72 }, (_, i) => ({
  x: -FIELD + ((i % 9) + rand()) * CELL[0] - 90,
  y: -FIELD + (Math.floor(i / 9) + rand()) * CELL[1],
  len: between(50, 130),
  amp: between(1.5, 4.5),
  width: between(1, 2.2),
  opacity: between(0.45, 0.9),
  dur: between(1.4, 2.4),
  delay: -between(0, 2.4),
}));
export const LEAVES = [
  { y: -110, dur: 7.5, delay: -1, color: '#d97706' },
  { y: -30, dur: 9, delay: -5.5, color: '#b45309' },
  { y: 50, dur: 8, delay: -3, color: '#ca8a04' },
  { y: 120, dur: 10, delay: -8, color: '#a16207' },
  { y: -170, dur: 8.5, delay: -6.8, color: '#65a30d' },
];
// Clouds drifting slowly downwind overhead: offset across the wind (px), size, timing.
// They stay upright and only move along the wind, unlike the gusts and leaves.
export const CLOUDS = [
  { off: -130, scale: 1, dur: 42, delay: -8 },
  { off: 40, scale: 0.8, dur: 50, delay: -33 },
  { off: 175, scale: 1.1, dur: 46, delay: -21 },
];
export const CLOUD_RUN = 900; // px a cloud travels, from one side of the field to the other

/** A cumulus cloud about 100 px wide, its flat base centred at (0, 0), with a soft shadow. */
export function Cloud() {
  const shape = (
    <>
      <rect x="-48" y="-14" width="96" height="22" rx="11" />
      <circle cx="-22" cy="-14" r="17" />
      <circle cx="4" cy="-22" r="23" />
      <circle cx="29" cy="-12" r="16" />
    </>
  );
  return (
    <>
      <g fill="#1f2937" opacity="0.1" filter="url(#cloud-shadow-blur)" transform="translate(12 16)">
        {shape}
      </g>
      <g fill="#fff" opacity="0.93">
        {shape}
      </g>
    </>
  );
}

export const polar = (len, deg) => [
  len * Math.cos((deg * Math.PI) / 180),
  len * Math.sin((deg * Math.PI) / 180),
];
export const fmt2 = (x) => {
  const t = x.toFixed(2);
  return t === '-0.00' ? '0.00' : t.replace('-', '−');
};

/** A bicycle seen from the side, about 55 px long, centred at (cx, cy) and facing right. */
export function Bike({ cx, cy }) {
  const ink = '#374151';
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(1.25) translate(${-cx} ${-cy})`}
      stroke={ink}
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={cx - 13} cy={cy + 4} r="8.5" fill="#fff" />
      <circle cx={cx + 13} cy={cy + 4} r="8.5" fill="#fff" />
      <path d={`M ${cx - 13} ${cy + 4} L ${cx - 3} ${cy - 8} L ${cx + 9} ${cy - 8} L ${cx + 13} ${cy + 4}`} />
      <path d={`M ${cx - 3} ${cy - 8} L ${cx} ${cy + 4} L ${cx + 9} ${cy - 8}`} />
      <path d={`M ${cx + 9} ${cy - 8} L ${cx + 7} ${cy - 13} L ${cx + 11} ${cy - 13}`} />
      <path d={`M ${cx - 6} ${cy - 11} L ${cx - 1} ${cy - 11}`} />
    </g>
  );
}

/**
 * Gusts and leaves carried by the wind, which blows at `theta` degrees. Each
 * gust is a thin wavy stroke that fades in, drifts downwind and fades out.
 */
export function WindField({ p, theta }) {
  const cx = p.W / 2;
  const cy = p.H / 2;
  return (
    <g transform={`rotate(${-theta} ${cx} ${cy})`} aria-hidden="true">
      <defs>
        <linearGradient id="gust-fade">
          <stop offset="0" stopColor="#4f7fa6" stopOpacity="0" />
          <stop offset="0.35" stopColor="#4f7fa6" stopOpacity="1" />
          <stop offset="0.75" stopColor="#4f7fa6" stopOpacity="1" />
          <stop offset="1" stopColor="#4f7fa6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {GUSTS.map((g, i) => (
        <g key={i} transform={`translate(${cx + g.x} ${cy + g.y})`}>
          <path
            className="gust"
            d={`M 0 0 q ${g.len / 4} ${-g.amp} ${g.len / 2} 0 t ${g.len / 2} 0`}
            fill="none"
            stroke="url(#gust-fade)"
            strokeWidth={g.width}
            strokeLinecap="round"
            style={{
              '--op': g.opacity,
              animationDuration: `${g.dur}s`,
              animationDelay: `${g.delay}s`,
            }}
          />
        </g>
      ))}
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${cx - FIELD} ${cy + l.y})`}>
          <g
            className="leaf-drift"
            style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
          >
            <g className="leaf-wobble" style={{ animationDelay: `${l.delay / 3}s` }}>
              <path
                className="leaf-spin"
                d="M -6 0 Q 0 -5 6 0 Q 0 5 -6 0 Z M -6 0 L -9 1"
                fill={l.color}
                stroke={l.color}
                strokeWidth="1"
                style={{ animationDelay: `${l.delay / 2}s` }}
              />
            </g>
          </g>
        </g>
      ))}
    </g>
  );
}

/** Clouds drifting across the field in the direction the wind blows, at `theta` degrees. */
export function Clouds({ p, theta }) {
  const [dx, dy] = polar(1, theta);
  // in screen coordinates y points down
  const dir = [dx, -dy];
  const perp = [dy, dx];
  const cx = p.W / 2;
  const cy = p.H / 2;
  return (
    <g aria-hidden="true">
      <defs>
        <filter id="cloud-shadow-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {CLOUDS.map((c, i) => {
        const x = cx - (dir[0] * CLOUD_RUN) / 2 + perp[0] * c.off;
        const y = cy - (dir[1] * CLOUD_RUN) / 2 + perp[1] * c.off;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g
              className="cloud-drift"
              style={{
                '--tx': `${dir[0] * CLOUD_RUN}px`,
                '--ty': `${dir[1] * CLOUD_RUN}px`,
                animationDuration: `${c.dur}s`,
                animationDelay: `${c.delay}s`,
              }}
            >
              <g transform={`scale(${c.scale})`}>
                <Cloud />
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** The road, the wind x at an angle θ set by a slider, the heading v and the shadow ℓ. */
export function WindExplorer() {
  const [theta, setTheta] = useState(60);
  const v = polar(V_LEN, theta);
  const ell = V_LEN * Math.cos((theta * Math.PI) / 180);
  const foot = [ell, 0];
  const kind = Math.abs(ell) < 0.005 ? 'zero' : ell > 0 ? 'pos' : 'neg';
  const bis = polar(1.05, theta / 2);
  const verdict = {
    pos: 'tailwind: it pushes you along',
    zero: 'crosswind: no help, no hindrance',
    neg: 'headwind: it holds you back',
  }[kind];

  return (
    <div className="angle-explorer">
      <Plane
        xRange={[-4.8, 4.8]}
        yRange={[-1.3, 4.6]}
        unit={50}
        grid={false}
        axes={false}
        title="A map of a road with a cyclist heading along v, the wind x, and the shadow of x on the road"
      >
        {(p) => (
          <g>
            {/* fields and the road */}
            <rect x="0" y="0" width={p.W} height={p.H} fill="#eef5e8" />
            <rect
              x="0"
              y={p.py(ROAD)}
              width={p.W}
              height={2 * ROAD * p.unit}
              fill="#d6d9de"
            />
            <line
              x1="0"
              y1={p.py(0)}
              x2={p.W}
              y2={p.py(0)}
              stroke="#fff"
              strokeWidth="2"
              strokeDasharray="14 12"
            />

            {/* the wind, blowing in the direction of v */}
            <WindField p={p} theta={theta} />
            <Clouds p={p} theta={theta} />

            {/* the rider, just behind the tails of the arrows */}
            <Bike cx={p.px(-0.7)} cy={p.py(0) - 2} />

            {/* the shadow of x on the road */}
            <Fragment as="g" index={1}>
              <line
                x1={p.px(0)}
                y1={p.py(0)}
                x2={p.px(foot[0])}
                y2={p.py(foot[1])}
                stroke={TEAL}
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1={p.px(v[0])}
                y1={p.py(v[1])}
                x2={p.px(foot[0])}
                y2={p.py(foot[1])}
                stroke="#6b7280"
                strokeWidth="2"
                strokeDasharray="7 6"
              />
              {Math.abs(ell) > 0.4 && theta > 3 && theta < 177 && (
                <RightAngle p={p} at={foot} a={v} b={[0, 0]} />
              )}
              <PlaneLabel
                p={p}
                at={[foot[0] / 2, 0]}
                dx={-5}
                dy={44}
                color={TEAL}
                size={19}
              >
                ℓ
              </PlaneLabel>
            </Fragment>

            {kind === 'zero' ? (
              <RightAngle p={p} at={[0, 0]} a={W} b={v} size={20} color={GREEN} />
            ) : (
              <AngleArc p={p} a={W} b={v} radius={34} />
            )}
            <PlaneLabel p={p} at={bis} dx={-4} dy={6} color="#6b7280" size={16}>
              θ
            </PlaneLabel>
            {/* the shadow as a vector (key press 3), under v so v stays readable */}
            {Math.abs(ell) > 0.15 && (
              <Fragment as="g" index={3}>
                <Arrow p={p} to={foot} color={TEAL} width={4} />
              </Fragment>
            )}
            <Arrow p={p} to={W} color={GREEN} />
            <PlaneLabel p={p} at={W} dx={-8} dy={19} color={GREEN}>
              v
            </PlaneLabel>
            <Arrow p={p} to={v} color={INK} />
            <PlaneLabel p={p} at={v} dx={v[0] < -0.5 ? -22 : 8} dy={-6} color={INK}>
              x
            </PlaneLabel>
          </g>
        )}
      </Plane>

      <div className="lc-sliders">
        <Slider
          name="theta"
          label={<Tex tex={r`\theta`} />}
          value={theta}
          onChange={setTheta}
          color={INK}
          min={0}
          max={180}
          step={1}
        />
      </div>

      <Fragment index={2} className="angle-readout">
        <div className="row">
          <span className="what" style={{ width: '1.2em' }}>
            <Tex tex={r`\ell`} />
          </span>
          <span className={`sign-${kind}`}>
            {fmt2(ell)} ({verdict})
          </span>
        </div>
      </Fragment>
    </div>
  );
}

export default function Slide11Shadow() {
  return (
    <section className="dense">
      <h2>Recall from Lecture 2: shadows</h2>

      <div className="stage">
        <div className="stage-text">
          <Fragment index={2}>
            <p className="compact">The length of the shadow:</p>
            <Tex
              display
              className="centered"
              tex={r`\ell=\frac{\vv{x}\cdot\vv{v}}{\norm{\vv{v}}}=\vv{x}\cdot\frac{\vv{v}}{\norm{\vv{v}}}`}
            />
          </Fragment>
          <Fragment index={3}>
            <p className="compact">The “shadow vector”:</p>
            <FxMarker index={4} id="more" />
            <Tex
              display
              className="centered fx-host"
              tex={r`\ell\,\frac{\vv{v}}{\norm{\vv{v}}}\htmlClass{fx-more}{{}=\frac{\vv{x}\cdot\vv{v}}{\vv{v}\cdot\vv{v}}\,\vv{v}}`}
            />
          </Fragment>
        </div>

        <div className="stage-fig">
          <WindExplorer />
        </div>
      </div>

      <Notes time="1:30 · running total 20:00">
        <p>
          A picture from Lecture 2, in today's letters. You ride in the direction v; the wind is x.
          How much does the wind help?
        </p>
        <p>
          <em>[Key press]</em> Only the shadow of x on the road, the part of the wind along your
          heading, pushes you forward or holds you back. The sideways part just pushes you toward the
          edge of the road.
        </p>
        <p>
          <em>[Key press]</em> Its length is x · v / ‖v‖: x dotted with the unit vector in the
          direction of v. <em>[drag θ]</em> At 60° it is 2, a tailwind; at 90° it is 0, a crosswind;
          past 90° it is negative, a headwind.
        </p>
        <p>
          <em>[Key press]</em> In Lecture 2 we only had the length. The shadow as a vector: its length
          times the unit vector v/‖v‖. <em>[Key press]</em> It multiplies out to (x · v / v · v) v. Next: this works in
          any ℝⁿ, and it is the point of the line closest to x.
        </p>
      </Notes>
    </section>
  );
}
