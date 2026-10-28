import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import VoxelIsland from '../components/VoxelIsland.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';


export const RATE = 1e9; // multiplications per second
export const NS = [3, 10, 100, 1000, 10000, 100000, 1000000]; // the slider's values of n
export const commas = (k) => k.toLocaleString('en-US');
// n × n times n × n takes n³ multiplications, n × n times n × 1 n²
export const slowCount = (n) => BigInt(n) ** 3n + BigInt(n) ** 2n;
export const fastCount = (n) => 2n * BigInt(n) ** 2n;

export const UNITS = [
  [1e-6, 'ns', 1e-9],
  [1e-3, 'µs', 1e-6],
  [1, 'ms', 1e-3],
  [60, 's', 1],
  [3600, 'min', 60],
  [86400, 'h', 3600],
  [86400 * 365.25, 'days', 86400],
  [Infinity, 'years', 86400 * 365.25],
];

/** A time in seconds, in the unit that reads best: 36 ns, 2 ms, 1 s, 33 min, 32 years. */
export function duration(s) {
  if (s <= 0) return '0 s';
  const [, unit, f] = UNITS.find(([lim]) => s < lim);
  const v = s / f;
  return `${v < 10 ? v.toFixed(1).replace(/\.0$/, '') : commas(Math.round(v))} ${unit}`;
}

/**
 * Method I, (AB)C, against Method II, A(BC), for A, B n × n and C n × 1, as a table: each one's
 * multiplications and the time they take at RATE per second, with a slider for n.
 */
export function Race({ n, setN }) {
  const rows = [
    { method: 'Method I', tex: r`(AB)C`, formula: r`n^3+n^2`, count: slowCount(n) },
    { method: 'Method II', tex: r`A(BC)`, formula: r`2n^2`, count: fastCount(n) },
  ];
  return (
    <div className="l15-race">
      <div className="l15-race-top">
        <p>
          <Tex tex="A,B" />: <Tex tex={r`n\times n`} /> matrices, <Tex tex="C" />: <Tex tex={r`n\times 1`} /> matrix
        </p>
        {PRINT ? (
          <p className="l15-race-n">
            <Tex tex={`n=${commas(n).replace(/,/g, '{,}')}`} />
          </p>
        ) : (
          <div className="lc-sliders l15-race-n">
            <Slider
              name="n"
              value={Math.max(0, NS.indexOf(n))}
              onChange={(i) => setN(NS[i])}
              min={0}
              max={NS.length - 1}
              step={1}
              color="var(--r-main-color)"
              format={(i) => commas(NS[i])}
            />
          </div>
        )}
      </div>
      <div className="l15-race-table">
        <div className="l15-race-row l15-race-head">
          <span />
          <span>multiplications</span>
          <span>time at 1 billion per second</span>
        </div>
        {rows.map((row) => (
          <div key={row.formula} className="l15-race-row">
            <span className="l15-race-label">
              <span className="l15-race-method">{row.method}</span>
              <Tex tex={row.tex} />
            </span>
            <p className="l15-race-count">
              <Tex tex={row.formula} /> = {commas(row.count)}
            </p>
            <span className="l15-race-time">{duration(Number(row.count) / RATE)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// the cartoon network: its layers (x, number of nodes), the nodes 30 apart
export const LAYERS = [
  [70, 3],
  [190, 4],
  [310, 4],
  [430, 2],
];
export const NODES = LAYERS.map(([x, k]) => Array.from({ length: k }, (_, j) => [x, 80 + (j - (k - 1) / 2) * 30]));
// the waves: forward, a layer every WAVE s; backward from BACK s on (one cycle: 5 s, in deck.css)
export const WAVE = 0.4;
export const BACK = 2.4;

/**
 * A neural network as a cartoon: the prediction runs forward through its layers (teal), then the
 * backpropagation runs back (cardinal), each layer's numbers a vector, each step a matrix. In print
 * mode, the backpropagation halfway.
 */
export function NeuralNet() {
  const edges = (g) =>
    NODES[g].flatMap(([x1, y1]) => NODES[g + 1].map(([x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`)).join('');
  const glow = (kind, delay, still) => ({
    className: `l15-nn-${kind}${still ? ' l15-nn-still' : ''}`,
    style: { animationDelay: `${delay}s` },
  });
  return (
    <svg className="l15-nn" viewBox="40 0 420 160" aria-label="A neural network">
      {NODES.slice(0, -1).map((_, g) => (
        <g key={g}>
          <path d={edges(g)} className="l15-nn-edge" />
          <path d={edges(g)} {...glow('fwd', (g + 0.5) * WAVE)} />
          <path d={edges(g)} {...glow('back', BACK + (LAYERS.length - 2 - g + 0.5) * WAVE, g === 2)} />
        </g>
      ))}
      {NODES.map((layer, i) =>
        layer.map(([x, y]) => (
          <g key={`${x},${y}`}>
            <circle cx={x} cy={y} r={10} className="l15-nn-node" />
            <circle cx={x} cy={y} r={10} {...glow('fwd', i * WAVE)} />
            <circle cx={x} cy={y} r={10} {...glow('back', BACK + (LAYERS.length - 1 - i) * WAVE, i >= 2)} />
          </g>
        )),
      )}
      <text x={250} y={16} className="l15-nn-label l15-nn-label-fwd">
        prediction →
      </text>
      <text x={250} y={154} className="l15-nn-label l15-nn-label-back">
        ← backpropagation
      </text>
    </svg>
  );
}

/** The method a use calls for, at the foot of its card: → Method II  A(BC). */
export function Then({ method, tex }) {
  return (
    <p className="l15-race-then">
      <span className="l15-race-tag">
        <span className="l15-race-tag-arrow">→</span>
        {method}
        <Tex tex={tex} />
      </span>
    </p>
  );
}

/**
 * How much faster? (after Which order is faster?): Method I, (AB)C, and Method II, A(BC), for A, B
 * n × n and C n × 1 (a line across the slide, with the slider), a table (narrower than the text) of
 * their multiplications and times, always shown, with a slider for n (3 to 1,000,000; in
 * print mode, n = 1,000,000). Key press 1: neural networks, Method II (a cartoon network, the
 * prediction running forward and the backpropagation back; the textbook's Section G.5); 2: video
 * games, the other way round: a million vectors, so Method I, ABC first (a floating island of blocks turning on a game
 * screen, in place of the Stanford Bunny, which the user found unrelated to games).
 */
export default function Slide08cRace() {
  const game = useRef(null);
  const playing = useFragmentShown(game);
  const [n, setN] = useState(1000);
  return (
    <section className="l15-race-slide">
      <h2>How much faster?</h2>
      <span ref={game} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />

      <Race n={PRINT ? 1000000 : n} setN={setN} />

      <div className="l15-race-uses">
        <Fragment index={1} className="l15-race-use">
          <NeuralNet />
          <p>
            <strong>Neural network</strong> training involves products like this for very large <Tex tex="n" />
          </p>
          <Then method="Method II" tex="A(BC)" />
          <p className="pointer corner">→ Section G.5</p>
        </Fragment>
        <Fragment index={2} className="l15-race-use">
          <VoxelIsland on={playing} width={520} height={160} print={PRINT} />
          <p>
            <strong>Video games</strong> apply the same <Tex tex={r`4\times 4`} /> matrices <Tex tex="A,B,C" /> to a million points{' '}
            <Tex tex={r`\vv x`} />
          </p>
          <Then method="Method I" tex="(AB)C" />
        </Fragment>
      </div>
    </section>
  );
}
