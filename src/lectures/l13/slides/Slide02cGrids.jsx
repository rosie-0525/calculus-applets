import { useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { I, B, MAIN, MATH } from '../components/svgmath.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { paintCat, catStill, CAT_CREDIT, CAT_URL } from '../components/catWarp.js';
import Notes from '../components/Notes.jsx';

export const U = 41; // pixels per unit, the same in both planes
export const PAD = 2;
export const RES = 2; // canvas pixels per pixel, sharp when the deck is scaled up
export const HALF = 1.25; // the photo lies on the square |x|, |y| ≤ 1.25
export const RED = '#8c1515';
export const INK = '#14213d';
export const FLY = [0.8, 2.4]; // seconds: the photo on the first plane, then flying (then it stays)
export const ARROW_W = 40;
export const GAP = 2;

export const clamp = (t) => Math.max(0, Math.min(1, t));
export const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// the linear part: A = [1 −1/2; 1/2 3/2]; s of the way there, (1 − s)I + sA, and its inverse
export const A = [
  [1, -0.5],
  [0.5, 1.5],
];
export const B0 = [0.5, 0]; // small enough for the photo and its image to share one window; the second
// component is linear (the user's request)
export function partway(s) {
  const [a, b, c, d] = [1 + s * (A[0][0] - 1), s * A[0][1], s * A[1][0], 1 + s * (A[1][1] - 1)];
  const det = a * d - b * c;
  return {
    at: ([x, y]) => [a * x + b * y, c * x + d * y],
    inv: ([x, y]) => [(d * x - b * y) / det, (-c * x + a * y) / det],
  };
}
// the twist turns (x, y) by the angle s(x² + y²)/2 about 0, which keeps its distance to 0
export const turn = ([x, y], th) => [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)];

// the three maps: linear, affine, neither (linear first, at the user's request); `morph(s)` is the map s ∈ [0, 1] of
// the way there, with its inverse (the identity at s = 0, f at s = 1); `box`: the window of both
// planes [x₀, x₁, y₀, y₁], 4 × 5.2, holding the photo and its image
export const MAPS = [
  {
    key: 'linear',
    tex: r`f(x,y)=\begin{bmatrix}x-\frac12y\\[2pt]\frac12x+\frac32y\end{bmatrix}`,
    box: [-2, 2, -2.6, 2.6], // the image: |x| ≤ 1.875, |y| ≤ 2.5
    morph: partway,
    verdict: 'linear',
    why: 'rotated and stretched',
    alt: 'a linear map: the photo is rotated and stretched',
  },
  {
    key: 'affine',
    tex: r`f(x,y)=\begin{bmatrix}x-\frac12y+\frac12\\[2pt]\frac12x+\frac32y\end{bmatrix}`,
    box: [-1.5, 2.5, -2.6, 2.6], // the image: x from −1.375 to 2.375, |y| ≤ 2.5
    morph: (s) => {
      const L = partway(s);
      return {
        at: (v) => {
          const w = L.at(v);
          return [w[0] + s * B0[0], w[1] + s * B0[1]];
        },
        inv: ([x, y]) => L.inv([x - s * B0[0], y - s * B0[1]]),
      };
    },
    verdict: 'affine (not linear)',
    why: 'rotated, stretched and shifted',
    alt: 'an affine map: the photo is rotated, stretched and shifted',
  },
  {
    key: 'neither',
    tex: r`f(x,y)=\begin{bmatrix}x\cos\frac{x^2+y^2}{2}-y\sin\frac{x^2+y^2}{2}\\[6pt]x\sin\frac{x^2+y^2}{2}+y\cos\frac{x^2+y^2}{2}\end{bmatrix}`,
    box: [-2, 2, -2.6, 2.6], // the image: within 1.77 of 0
    morph: (s) => ({
      at: (v) => turn(v, (s / 2) * (v[0] ** 2 + v[1] ** 2)),
      inv: (w) => turn(w, (-s / 2) * (w[0] ** 2 + w[1] ** 2)),
    }),
    verdict: 'neither',
    why: 'twisted',
    alt: 'a map that is neither linear nor affine: the photo is twisted',
  },
];

/**
 * Seconds since `on` turned true, counted only while the slide is showing (0 while `on` is false),
 * until `stop` seconds.
 */
export function useClock(on, ref, stop) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) {
      setT(0);
      return undefined;
    }
    let id;
    let last;
    let total = 0;
    const tick = (now) => {
      const showing = ref.current?.closest('section')?.classList.contains('present');
      if (showing && last !== undefined) total += (now - last) / 1000;
      last = now;
      if (showing) setT(total);
      if (total < stop) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on, ref, stop]);
  return t;
}

/** How far the flying photo has flown (eased), t seconds after the key press. */
export function flight(t) {
  const [a, b] = FLY;
  return t < a ? 0 : ease(clamp((t - a) / b));
}

/**
 * The gray grid lines (a unit apart) and axes of the plane `box`, with x and y (`labels`: false
 * leaves them out, 'only' draws only them, over the photo).
 */
export function Axes({ p, box, labels = true }) {
  const [x0, x1, y0, y1] = box;
  const ints = (a, b) => Array.from({ length: Math.floor(b) - Math.ceil(a) + 1 }, (_, k) => Math.ceil(a) + k).filter((k) => k !== 0);
  const names = (
    <g fontFamily={MATH} fontStyle="italic" fontSize="19" fill="#8a919c" stroke="#fff" strokeWidth="3" paintOrder="stroke">
      <text x={p.px(x1) - 6} y={p.py(0) - 8} textAnchor="end">
        x
      </text>
      <text x={p.px(0) + 7} y={p.py(y1) + 18}>y</text>
    </g>
  );
  if (labels === 'only') return names;
  return (
    <g>
      <g stroke="#e1e4e8" strokeWidth="1.2">
        {ints(x0, x1).map((k) => (
          <line key={`v${k}`} x1={p.px(k)} y1={p.py(y0)} x2={p.px(k)} y2={p.py(y1)} />
        ))}
        {ints(y0, y1).map((k) => (
          <line key={`h${k}`} x1={p.px(x0)} y1={p.py(k)} x2={p.px(x1)} y2={p.py(k)} />
        ))}
      </g>
      <g stroke="#aab1bb" strokeWidth="1.8">
        <line x1={p.px(0)} y1={p.py(y0)} x2={p.px(0)} y2={p.py(y1)} />
        <line x1={p.px(x0)} y1={p.py(0)} x2={p.px(x1)} y2={p.py(0)} />
      </g>
      {labels && names}
    </g>
  );
}

/** A point with its label in red (0 in the first plane, f(0) in the second). */
export function Point({ p, at, children }) {
  return (
    <g>
      <circle cx={p.px(at[0])} cy={p.py(at[1])} r="5" fill={RED} stroke="#fff" strokeWidth="1.5" />
      <text x={p.px(at[0]) + 8} y={p.py(at[1]) + 21} fontSize="20" fontFamily={MAIN} fill={RED} stroke="#fff" strokeWidth="4" paintOrder="stroke">
        {children}
      </text>
    </g>
  );
}

/**
 * One map: its formula, there from the start, above two xy-planes with the same window (the
 * origin in the same place) and f's arrow between them, in one SVG, with a canvas over all of it,
 * which come on its key press (the user's request). The cat photo lies in the first plane; a copy
 * of it then leaves by itself, flies onto the second plane, turning into its image under f on the way (each point v at
 * its place on the first plane, moved s of the way to f(v) on the second, the map itself s of the
 * way to f, `morph`), and stays there; the verdict comes when it lands. In print mode, the image
 * on the second plane.
 */
export function FlyPanel({ m, index }) {
  const marker = useRef(null);
  const canvas = useRef(null);
  const on = useFragmentShown(marker);
  const t = useClock(on && !PRINT, marker, FLY[0] + FLY[1]);
  const s = flight(t);
  const box = m.box;
  // the two planes and the arrow, side by side, in pixels
  const [PW, PH] = [(box[1] - box[0]) * U + 2 * PAD, (box[3] - box[2]) * U + 2 * PAD];
  const [W, H] = [2 * PW + 2 * GAP + ARROW_W, PH];
  const CX = PW + 2 * GAP + ARROW_W;
  const dom = { px: (x) => PAD + (x - box[0]) * U, py: (y) => PAD + (box[3] - y) * U };
  // the second plane's coordinates, stretched over the whole SVG: the canvas draws in them
  const all = [box[0] - (CX + PAD) / U, 0, 0, box[3] + PAD / U];
  all[1] = all[0] + W / U;
  all[2] = all[3] - H / U;
  const cod = { px: (x) => (x - all[0]) * U, py: (y) => (all[3] - y) * U };
  const OD = [all[0] + dom.px(0) / U, all[3] - dom.py(0) / U]; // the first plane's 0, in them
  const fly = useMemo(() => {
    const g = m.morph(s);
    const c = [(1 - s) * OD[0], (1 - s) * OD[1]];
    return {
      at: (v) => {
        const w = g.at(v);
        return [w[0] + c[0], w[1] + c[1]];
      },
      inv: ([x, y]) => g.inv([x - c[0], y - c[1]]),
    };
  }, [m, s, OD[0], OD[1]]);
  useEffect(() => {
    if (PRINT || !canvas.current) return;
    const ctx = canvas.current.getContext('2d');
    // drawn only once it leaves: on the first plane, it would hide the photo's 0
    if (!on || s === 0) ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    else paintCat(ctx, U * RES, all, HALF, fly.at, fly.inv);
  }, [on, s, fly]);
  const still = useMemo(() => {
    if (!PRINT) return null;
    const g = m.morph(1);
    return catStill(U * RES, box, HALF, g.at, g.inv);
  }, [m]);
  const frame = (x) => <rect x={x + 0.5} y={0.5} width={PW - 1} height={PH - 1} rx="10" fill="#fff" stroke="#e5e7eb" />;
  return (
    <figure>
      <span ref={marker} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <span className="l13-pic-formula">
        <Tex tex={m.tex} />
      </span>
      {/* the planes come on the key press; the photo flies FLY[0] s later */}
      <Fragment index={index}>
        <svg className="l13-cat-fly" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`The cat photo in an xy-plane flies onto a second xy-plane and lands as its image under ${m.alt}`}>
          {frame(0)}
          <Axes p={dom} box={box} labels={false} />
          <image href={CAT_URL} x={dom.px(-HALF)} y={dom.py(HALF)} width={2 * HALF * U} height={2 * HALF * U} preserveAspectRatio="none" />
          <rect x={dom.px(-HALF)} y={dom.py(HALF)} width={2 * HALF * U} height={2 * HALF * U} fill="none" stroke="rgba(20, 33, 61, 0.75)" strokeWidth="1.1" />
          <Axes p={dom} box={box} labels="only" />
          <Point p={dom} at={[0, 0]}>
            <B>0</B>
          </Point>
          <g transform={`translate(${PW + GAP}, ${H / 2 - 27})`}>
            <line x1="3" y1="27" x2="31" y2="27" stroke={INK} strokeWidth="2.4" />
            <polygon points="38,27 29,22 29,32" fill={INK} />
            <text x="19" y="17" textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize="22" fill={INK}>
              f
            </text>
          </g>
          {frame(CX)}
          <Axes p={cod} box={box} labels={false} />
          {PRINT ? (
            <image href={still} x={cod.px(box[0])} y={cod.py(box[3])} width={PW - 2 * PAD} height={PH - 2 * PAD} />
          ) : (
            <foreignObject x="0" y="0" width={W} height={H} style={{ pointerEvents: 'none' }}>
              <canvas ref={canvas} width={W * RES} height={H * RES} style={{ width: W, height: H, display: 'block' }} />
            </foreignObject>
          )}
          <Axes p={cod} box={box} labels="only" />
          {(PRINT || (on && s > 0)) && (
            <Point p={cod} at={(PRINT ? m.morph(1) : fly).at([0, 0])}>
              <I>f</I>(<B>0</B>)
            </Point>
          )}
        </svg>
      </Fragment>
      <figcaption>
        <Fragment index={index} className="l13-pic-verdict" style={{ '--verdict-delay': `${FLY[0] + FLY[1]}s` }}>
          {m.verdict}
          <span className="l13-pic-why">{m.why}</span>
        </Fragment>
      </figcaption>
    </figure>
  );
}

/**
 * Linear and affine functions (the second slide of that title; first "Linear and affine: a cat
 * photo"), with a cat photo. The definition's vector-valued clause (moved here from Linear and
 * affine functions, at the user's request); then three maps ℝ² → ℝ² (linear, affine, neither: the
 * linear one first, at the user's request), each its formula over two xy-planes with the same window: the
 * formulas from the start, the planes one per key press (the user's request), and then by itself
 * the cat photo in the first plane flies onto the second, turning into its image under f on the way, once, and the verdict comes
 * when it lands (linear: rotated and stretched; affine: rotated,
 * stretched and shifted, f(0) landing off 0; neither: twisted, each point turned by the angle
 * (x² + y²)/2). In print mode, the photos landed.
 */
export default function Slide02cGrids() {
  return (
    <section className="dense">
      <h2>Linear and affine functions</h2>
      <div className="block definition">
        <p className="block-title">Definition</p>
        <p>
          A vector-valued function is <strong>affine</strong> if all its component functions are affine, and{' '}
          <strong>linear</strong> if all its component functions are linear.
        </p>
      </div>
      <div className="l13-pics">
        {MAPS.map((m, k) => (
          <FlyPanel key={m.key} m={m} index={k + 1} />
        ))}
      </div>
      <p className="l13-credit l13-credit-corner">{CAT_CREDIT}</p>

      <Notes time="2:00 · running total 8:00">
        <p>
          For a vector-valued function: affine if every component is affine, linear if every component is linear. Three
          maps ℝ² → ℝ²: the first has components x − ½y and ½x + (3/2)y, both linear.
        </p>
        <p>
          <em>[Key press]</em> To see a map ℝ² → ℝ², put a photo in the plane and move each point x to f(x). The linear
          one rotates and stretches the cat. Straight lines stay straight, parallel lines stay parallel, and 0 stays at
          0.
        </p>
        <p>
          <em>[Key press]</em> The affine one adds ½ to the first component: the same rotation and stretch, then a
          shift. f(0) = (½, 0) is no longer 0, and that is why it is not linear: a linear function always sends 0 to 0.
        </p>
        <p>
          <em>[Key press]</em> The third turns each point about 0 by the angle (x² + y²)/2, which grows with its
          distance from 0. Its components have cos and sin of x² + y²: neither affine nor linear. The photo's straight
          edges come out curved. It does send 0 to 0, and still it is not linear: f(0) = 0 is not enough.
        </p>
      </Notes>
    </section>
  );
}
