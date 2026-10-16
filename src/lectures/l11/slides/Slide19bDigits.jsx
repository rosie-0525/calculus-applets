import { useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import { PRINT } from '../components/print.js';
import { NUM, accuracy, centerInk, confidences, gradE } from '../components/digits.js';
import { getDigits } from '../components/digitsData.js';
import { inkColor, pngOf } from '../components/digitPics.js';

/** The AI at w, after n steps, with E(w), ∇E(w) (for the next step), its accuracy on the test digits, and E at each step so far. */
export function at(w, n, hist) {
  const { train, test } = getDigits();
  const { E, g } = gradE(w, train);
  return { w, E, g, acc: accuracy(w, test), n, hist: [...hist, E] };
}
export const start = () => at(new Float64Array(NUM), 0, []);
export function stepFrom(s, t) {
  const w = new Float64Array(NUM);
  for (let i = 0; i < NUM; i += 1) w[i] = s.w[i] - t * s.g[i];
  return at(w, s.n + 1, s.hist);
}

export const PAD = 184; // the drawing pad, in pixels
export const BARS_H = 224; // the bars: as tall as the pad and the Clear button under it
export const PRINT_STEPS = 30; // print mode: 30 steps with t = 0.5,
export const PRINT_TEST = 30; // and test digit 30 (a 3) on the pad
export const PAIRS = 3; // the training digits shown, with their labels

/**
 * The drawing (strokes of [x, y] points on the pad) made into an MNIST image: the strokes scaled
 * to fit 80 × 80 of a 112 × 112 canvas, drawn 10 pixels wide (2.5 pixels of the 28 × 28 image, as
 * in MNIST), then averaged down and centred by centerInk.
 */
export function imageOf(strokes) {
  const pts = strokes.flat();
  if (!pts.length) return null;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const LW = 10;
  const scale = (80 - LW) / Math.max(x1 - x0, y1 - y0, 40);
  const c = document.createElement('canvas');
  c.width = 112;
  c.height = 112;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 112, 112);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineWidth = LW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const map = ([x, y]) => [56 + (x - (x0 + x1) / 2) * scale, 56 + (y - (y0 + y1) / 2) * scale];
  for (const s of strokes) {
    const q = s.map(map);
    ctx.beginPath();
    if (q.length === 1) {
      ctx.arc(q[0][0], q[0][1], LW / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.moveTo(...q[0]);
      for (const p of q.slice(1)) ctx.lineTo(...p);
      ctx.stroke();
    }
  }
  const d = ctx.getImageData(0, 0, 112, 112).data;
  const ink = new Float32Array(112 * 112);
  for (let k = 0; k < ink.length; k += 1) ink[k] = 1 - d[4 * k] / 255;
  return centerInk(ink);
}

/** The pad: draw with the mouse; onImage gets the MNIST image of the drawing (null when cleared). */
export function DrawPad({ onImage, clearRef }) {
  const canvas = useRef(null);
  const strokes = useRef([]);
  const drawing = useRef(false);
  const frame = useRef(0);

  const pos = (e) => {
    const rect = canvas.current.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * PAD, ((e.clientY - rect.top) / rect.height) * PAD];
  };
  const update = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => onImage(imageOf(strokes.current)));
  };
  const segment = (a, b) => {
    const ctx = canvas.current.getContext('2d');
    ctx.strokeStyle = '#14213d';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.stroke();
  };
  clearRef.current = () => {
    strokes.current = [];
    canvas.current.getContext('2d').clearRect(0, 0, PAD, PAD);
    onImage(null);
  };

  return (
    <canvas
      ref={canvas}
      className="l10-dg-canvas"
      width={PAD}
      height={PAD}
      data-prevent-swipe
      aria-label="Draw a digit here"
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // a pointer the browser does not know (a synthetic event)
        }
        drawing.current = true;
        const p = pos(e);
        strokes.current.push([p]);
        segment(p, p);
        update();
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const s = strokes.current[strokes.current.length - 1];
        const p = pos(e);
        segment(s[s.length - 1], p);
        s.push(p);
        update();
      }}
      onPointerUp={() => {
        drawing.current = false;
      }}
    />
  );
}

/**
 * The error E against the step number: from ln 10 ≈ 2.30 at w = 0, down as the AI learns (up, if
 * the learning rate is too large). The steps run to 50, then on in fifties.
 */
export function EGraph({ hist }) {
  const W = 520;
  const H = 240; // as tall as the pad beside it
  const [L, R, T, B] = [40, 14, 12, 30];
  const N = Math.max(50, Math.ceil((hist.length - 1) / 50) * 50);
  const finite = hist.filter(Number.isFinite);
  const top = Math.max(2.5, Math.ceil(Math.min(10, Math.max(...finite)) * 2) / 2);
  const px = (n) => L + (n / N) * (W - L - R);
  const py = (e) => H - B - (Math.min(e, top) / top) * (H - T - B);
  const d = hist
    .map((e, n) => (Number.isFinite(e) ? `${n && Number.isFinite(hist[n - 1]) ? 'L' : 'M'}${px(n).toFixed(1)},${py(e).toFixed(1)}` : ''))
    .join('');
  const last = hist.length - 1;
  const yTicks = Array.from({ length: Math.floor(top) + 1 }, (_, k) => k);
  const xTicks = Array.from({ length: 6 }, (_, k) => (k * N) / 5);
  return (
    <svg className="l10-dg-graph" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The error E against the step number">
      <g stroke="#d1d5db" strokeWidth="1">
        {yTicks.map((e) => (
          <line key={e} x1={L} x2={W - R} y1={py(e)} y2={py(e)} />
        ))}
      </g>
      <g fontSize="13" fill="#6b7280">
        {yTicks.map((e) => (
          <text key={e} x={L - 8} y={py(e) + 4} textAnchor="end">
            {e}
          </text>
        ))}
        {xTicks.map((n) => (
          <text key={n} x={px(n)} y={H - B + 16} textAnchor="middle">
            {n}
          </text>
        ))}
        <text x={W - R} y={H - 2} textAnchor="end">
          step
        </text>
      </g>
      <text x={L - 30} y={T + 10} fontSize="17" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif" fill="#14213d">
        E
      </text>
      <path d={d} fill="none" stroke="#8c1515" strokeWidth="2.5" strokeLinejoin="round" />
      {Number.isFinite(hist[last]) && <circle cx={px(last)} cy={py(hist[last])} r="4.5" fill="#8c1515" />}
    </svg>
  );
}

/** Its confidence in each digit, 0 to 9, as bars; the guess in red. */
export function Bars({ P }) {
  const W = 220;
  const rowH = BARS_H / 10;
  const top = P ? P.indexOf(Math.max(...P)) : -1;
  const tie = P && Math.max(...P) - Math.min(...P) < 1e-9;
  return (
    <svg className="l10-dg-bars" viewBox={`0 0 ${W} ${BARS_H}`} width={W} height={BARS_H} role="img" aria-label="Its confidence in each digit">
      {Array.from({ length: 10 }, (_, d) => {
        const y = d * rowH;
        const len = P ? P[d] * (W - 70) : 0;
        const best = d === top && !tie;
        return (
          <g key={d}>
            <text x={10} y={y + rowH / 2 + 6} textAnchor="middle" fontSize="17" fill={best ? '#8c1515' : '#6b7280'} fontWeight={best ? 700 : 400}>
              {d}
            </text>
            <rect x={24} y={y + 4} width={W - 70} height={rowH - 8} fill="#f3f4f6" />
            <rect x={24} y={y + 4} width={len} height={rowH - 8} fill={best ? '#8c1515' : '#9ca3af'} />
            {P && (best || tie) && (
              <text x={28 + len} y={y + rowH / 2 + 5} fontSize="14" fill={best ? '#8c1515' : '#6b7280'}>
                {Math.round(P[d] * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * An AI learns to read digits (right after How does an AI learn?, Slide19cAIIdea.jsx, which says
 * what the AI, its data and its error E are; with Gradient descent before it, this slide replaces
 * the penguins of Slide19AI.jsx): a tiny AI learns to read handwritten digits (MNIST), its parts in
 * the order of the rows of How does an AI learn?, each with its tag. On arrival, the goal: let a
 * model learn to read handwritten digits. Key press 1: the function f(x) with a lot of parameters
 * (7,850: see digits.js; they start at 0): the input x = a digit drawn on the pad, an arrow f, and the output, the probability of each digit, as bars, live
 * (also while it learns). 2: the data, 5,000 images with their correct labels, (x₁, y₁) = (a 5, 5),
 * … 3: the error E = total error of the prediction f(xᵢ) versus the truth yᵢ, and its graph
 * against the step number, with the step number and E in its corner. 4: minimize E by gradient
 * descent: Step takes a step, Run takes them until Stop, Reset goes back to the start, and the
 * learning rate t is a slider (above about 1 the first steps overshoot: E goes up); the correct
 * rate, its score on 1,000 test digits it never trains on, climbs from 10% to about 85% in 30
 * steps. The PDF shows 30 steps with t = 0.5, and a test digit on the pad.
 */
export default function Slide19bDigits() {
  const [rate, setRate] = useState(0.5);
  const [st, setSt] = useState(() => {
    let s = start();
    if (PRINT) for (let n = 0; n < PRINT_STEPS; n += 1) s = stepFrom(s, 0.5);
    return s;
  });
  const [running, setRunning] = useState(false);
  const [x, setX] = useState(() => (PRINT ? Float64Array.from(getDigits().test.img(PRINT_TEST), (v) => v / 255) : null));
  const clearRef = useRef(() => {});

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setSt((s) => {
        const next = stepFrom(s, rate);
        if (next.n >= 500 || !Number.isFinite(next.E)) setRunning(false);
        return next;
      });
    }, 90);
    return () => clearInterval(id);
  }, [running, rate]);

  const pairs = useMemo(() => {
    const { train } = getDigits();
    return Array.from({ length: PAIRS }, (_, k) => ({ src: pngOf(train.img(k), (v) => inkColor(v / 255)), label: train.y[k] }));
  }, []);
  const P = useMemo(() => (x ? confidences(st.w, x) : null), [x, st.w]);
  const printPad = useMemo(() => (PRINT ? pngOf(getDigits().test.img(PRINT_TEST), (v) => inkColor(v / 255)) : null), []);
  const blur = (e) => e.currentTarget.blur();

  return (
    <section className="dense l10-dg">
      <h2>An AI learns to read digits</h2>

      <p className="l10-dg-goal">
        <strong>Goal:</strong> let a model learn to read handwritten digits.
      </p>

      <div className="l10-dg-row">
        <div className="l10-dg-left">
          <Fragment index={1} className="l10-dg-fn">
            <p>
              <span className="l10-dg-tag">Function</span>
              <Tex tex={r`f(\vv x)`} /> with a lot of parameters
            </p>
            <div className="l10-dg-io">
              <div>
                <p className="l10-dg-head">
                  input <Tex tex={r`\vv x`} />: your drawing
                </p>
                <div className="l10-dg-inrow">
                  <Tex tex={r`\vv x=`} />
                  <div>
                    <div className="l10-dg-padbox">
                      {PRINT ? <img className="l10-dg-canvas" src={printPad} alt="A test digit" /> : <DrawPad onImage={setX} clearRef={clearRef} />}
                      {!PRINT && !x && <span className="l10-dg-hint">draw a digit</span>}
                    </div>
                    <div className="l10-dg-padbar">
                      <button type="button" onPointerUp={blur} onClick={() => clearRef.current()}>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="l10-dg-arrow">
                <Tex tex="f" />
                <svg width="60" height="16" viewBox="0 0 60 16" aria-hidden="true">
                  <line x1="2" y1="8" x2="46" y2="8" stroke="#14213d" strokeWidth="2.5" />
                  <polygon points="58,8 44,2 44,14" fill="#14213d" />
                </svg>
              </div>
              <div>
                <p className="l10-dg-head">output: probabilities</p>
                <Bars P={P} />
              </div>
            </div>
          </Fragment>

          <Fragment index={2} className="l10-dg-data">
            <p>
              <span className="l10-dg-tag">Data</span>5,000 images with their correct labels:
            </p>
            <p className="l10-dg-pairs">
              {pairs.map(({ src, label }, k) => (
                <span key={k}>
                  <Tex tex={`(\\vv x_${k + 1},y_${k + 1})=\\big(`} />
                  <img src={src} alt={`A handwritten ${label}`} />
                  <Tex tex={`,\\,${label}\\big)${k < PAIRS - 1 ? ',' : ',\\ \\dots'}`} />
                </span>
              ))}
            </p>
          </Fragment>
        </div>

        <div className="l10-dg-right">
          <Fragment index={3}>
            <p>
              <span className="l10-dg-tag">Error</span>
              <Tex tex="E" /> = total error of the prediction <Tex tex={r`f(\vv x_i)`} />{' '}
              <span className="l10-dg-nowrap">
                versus the truth <Tex tex="y_i" />
              </span>
            </p>
            <div className="l10-dg-graphbox">
              <EGraph hist={st.hist} />
              <p className="l10-dg-read l10-dg-now">
                step {st.n}: <Tex tex={`E=${st.E.toFixed(3)}`} />
              </p>
            </div>
          </Fragment>

          <Fragment index={4}>
            <p className="l10-dg-min">
              <span className="l10-dg-tag">Minimize</span>
              <Tex tex="E" /> by gradient descent
            </p>
            <div className="l10-ai-controls l10-dg-controls">
              <button type="button" onPointerUp={blur} onClick={() => setSt((s) => stepFrom(s, rate))} disabled={!Number.isFinite(st.E)}>
                Step
              </button>
              <button type="button" onPointerUp={blur} onClick={() => setRunning((v) => !v)} disabled={!Number.isFinite(st.E)}>
                {running ? 'Stop' : 'Run'}
              </button>
              <button
                type="button"
                onPointerUp={blur}
                onClick={() => {
                  setRunning(false);
                  setSt(start());
                }}
              >
                Reset
              </button>
              <span className="l10-dg-break" />
              <Slider name="learning rate t" label={<span>learning rate <Tex tex="t" /></span>} value={rate} onChange={setRate} min={0.05} max={3} step={0.05} format={(v) => v.toFixed(2)} />
              <span className="l10-dg-rate">Correct rate: {Math.round(st.acc * 100)}%</span>
            </div>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
