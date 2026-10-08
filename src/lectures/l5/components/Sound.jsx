/* The notes, chords and recordings of the motivation (slide 2) and of its callback (slide 23):
   one second of each wave, playable through the speakers and drawn as its first 25 ms. */

export const INK = '#14213d';
export const GRAY = '#9ca3af';

/* ---------- Pure notes and the chords they make ---------- */

// C, E, G and the tuning A, frequencies rounded to whole hertz: sine waves with different
// whole-number frequencies are exactly orthogonal over one second.
export const NOTES = [
  { name: 'C', f: 262 },
  { name: 'E', f: 330 },
  { name: 'G', f: 392 },
  { name: 'A', f: 440 },
];
// four voices, three notes: the root is doubled
export const C_MAJOR = [2, 1, 1, 0];
export const A_MINOR = [1, 1, 0, 2];

export const note = (f) => (t) => Math.sin(2 * Math.PI * f * t);
export const mix = (amps) => (t) => amps.reduce((s, a, i) => s + a * Math.sin(2 * Math.PI * NOTES[i].f * t), 0);

// Behind the scenes, one second of each wave is kept as N values, to play it and to compute
// dot products. The students only see the waves.
export const N = 8000;
export const sample = (fn) => Float64Array.from({ length: N }, (_, k) => fn(k / N));
export const BASIS = NOTES.map(({ f }) => sample(note(f)));

export const dotN = (a, b) => {
  let s = 0;
  for (let k = 0; k < N; k += 1) s += a[k] * b[k];
  return s;
};
/** The coefficients c_i = u·v_i / v_i·v_i. */
export const decode = (u) => BASIS.map((v) => dotN(u, v) / dotN(v, v));

// Hiss: the same pseudo-random noise every time (so the printed slides match the lecture)
export const NOISE = (() => {
  let seed = 51;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Float64Array.from({ length: N }, () => 1.3 * Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand()));
})();

/* ---------- Playing a sound through the speakers ---------- */

const LOUDNESS = 0.17;
let audio = null;
let playing = null;

/** Plays one second of sound, with short fades so there is no click. */
function play(samples) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audio ??= new AC();
  audio.resume?.();
  playing?.stop();
  const buf = audio.createBuffer(1, N, N);
  const data = buf.getChannelData(0);
  for (let k = 0; k < N; k += 1) {
    const env = Math.min(1, k / 160, (N - k) / 2400);
    data[k] = Math.max(-1, Math.min(1, samples[k] * LOUDNESS * env));
  }
  const src = audio.createBufferSource();
  src.buffer = buf;
  src.connect(audio.destination);
  src.start();
  playing = src;
}

export function PlayButton({ samples, label }) {
  return (
    <button
      type="button"
      className="play-button"
      aria-label={label}
      data-prevent-swipe
      onClick={(e) => {
        play(samples);
        e.currentTarget.blur();
      }}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 1.6 L10.4 6 L3 10.4 Z" />
      </svg>
    </button>
  );
}

/** Every sound on a slide looks the same: a play button, its wave, a caption under the wave. */
export function Track({ samples, label, caption, captionClassName = '', children }) {
  return (
    <div className="track">
      <PlayButton samples={samples} label={`Play ${label}`} />
      {children}
      <p className={`wave-caption ${captionClassName}`.trim()}>{caption}</p>
    </div>
  );
}

/* ---------- Pictures ---------- */

export const WINDOW = 0.025; // the first 25 ms
export const LOUDEST = 4.6; // the vertical scale for chords and recordings

/** The first 25 ms of a wave: a smooth curve for a function, the raw values for a recording. */
export function Wave({ fn, samples, width, height = 72, scale = LOUDEST, color = INK, stroke = 2, label }) {
  const mid = height / 2;
  const n = fn ? 400 : Math.round(WINDOW * N);
  const value = fn ? (k) => fn((k * WINDOW) / n) : (k) => samples[k];
  const pts = [];
  for (let k = 0; k <= n; k += 1) {
    const y = Math.max(-1, Math.min(1, value(k) / scale));
    pts.push(`${(6 + (k * (width - 12)) / n).toFixed(1)},${(mid - y * (mid - 4)).toFixed(1)}`);
  }
  return (
    <svg className="figure-svg wave" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={label}>
      <line x1="6" y1={mid} x2={width - 6} y2={mid} stroke="#e5e7eb" strokeWidth="1" />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    </svg>
  );
}

/** c₁C + c₂E + c₃G + c₄A in TeX, each coefficient written by `show`. */
export const combo = (coeffs, show = (c) => c) =>
  coeffs.map((c, i) => `${show(c)}\\,\\vv{${NOTES[i].name}}`).join('+');

/** A chord in TeX as a musician would write it: no zero terms, no coefficient 1. */
export const chord = (coeffs) =>
  coeffs
    .map((c, i) => (c === 0 ? null : `${c === 1 ? '' : `${c}\\,`}\\vv{${NOTES[i].name}}`))
    .filter(Boolean)
    .join('+');

/* ---------- The recording of the C major chord, and its projection onto the chords ---------- */

const C_MAJOR_SAMPLES = sample(mix(C_MAJOR));
/** The noisy recording x: the C major chord plus hiss. */
export const NOISY = C_MAJOR_SAMPLES.map((v, k) => v + NOISE[k]);
/** The coefficients of Proj_V(x) in the basis C, E, G, A: x·N / N·N for each note N. */
export const CLEAN_AMPS = decode(NOISY);
/** Proj_V(x), the denoised chord. */
export const CLEANED = sample(mix(CLEAN_AMPS));
/** x − Proj_V(x), the hiss that was removed. */
export const HISS = NOISY.map((v, k) => v - CLEANED[k]);
