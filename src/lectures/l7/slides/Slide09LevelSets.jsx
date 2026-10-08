import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import Space, { Arrow3, Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/bay.js';
import { hills, HILLS_R } from '../components/hills.js';

export const CARDINAL = '#8c1515';
export const PLANE = 'rgba(96, 141, 196, 0.42)';
export const PLANE_INK = '#3b5f91'; // the plane's colour, dark enough for its label

// the two hills of the title slide; the view has x to the right and y going back, as the plot
// seen from above
export const f = hills;
export const R = HILLS_R;
export const START = 0.9; // the height shown first (and in the PDF): two curves, one around each hill
export const Z_SCALE = 1.1;
export const AXIS = '#6b7280';

export const TOP = Z_SCALE * 1.95; // above the graph's highest point

// the axes through the origin, longer than the square so that their ends stick out
export const AXES = [
  { from: [-3.4, 0, 0], to: [3.9, 0, 0], name: 'x', dx: 6, dy: 14 },
  { from: [0, -3.4, 0], to: [0, 3.9, 0], name: 'y', dx: 8, dy: 4 },
  { from: [0, 0, 0], to: [0, 0, 2.9], name: 'z', dx: 8, dy: 4 },
];

/**
 * Whether the graph hides the point q from the viewer of s: walk from q toward the viewer and see
 * whether the walk goes under the graph. Below the plane z = c (if any), 'under' for a point seen
 * through it.
 */
export function seen(q, s, c) {
  const A = (s.az * Math.PI) / 180;
  const E = (s.el * Math.PI) / 180;
  const d = [Math.cos(A) * Math.cos(E), -Math.sin(A) * Math.cos(E), Math.sin(E)];
  const inside = (x, y) => x >= R[0] && x <= R[1] && y >= R[0] && y <= R[1];
  let under = false;
  for (let t = 0.02; t < 12; t += 0.03) {
    const [x, y, z] = q.map((v, k) => v + t * d[k]);
    if (z > TOP) break;
    if (inside(x, y) && z < Z_SCALE * f(x, y) - 0.01) return 'hidden';
    if (c !== undefined && inside(x, y) && z < c * Z_SCALE) under = true;
  }
  return under ? 'under' : 'seen';
}

/** The axes: solid where they are seen, fainter through the plane z = c, dashed behind the graph. */
export function Axes({ s, c }) {
  return (
    <g>
      {AXES.map(({ from, to, name, dx, dy }) => {
        const N = 160;
        const pts = Array.from({ length: N + 1 }, (_, k) => from.map((v, i) => v + ((to[i] - v) * k) / N));
        const how = pts.map((q) => seen(q, s, c));
        const runs = [];
        how.forEach((h, k) => {
          const last = runs.at(-1);
          if (last && last.h === h) last.k1 = k;
          else runs.push({ h, k0: Math.max(0, k - 1), k1: k });
        });
        const end = how[N] === 'hidden' ? { strokeDasharray: '3 4', opacity: 0.7 } : { opacity: how[N] === 'under' ? 0.5 : 1 };
        return (
          <g key={name}>
            {runs.map(({ h, k0, k1 }) => {
              const [a, b] = [s.P(pts[k0]), s.P(pts[Math.min(k1, N - 6)])];
              const style = h === 'hidden' ? { strokeDasharray: '3 4', opacity: 0.7 } : { opacity: h === 'under' ? 0.5 : 1 };
              return <line key={k0} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={AXIS} strokeWidth="1.6" {...style} />;
            })}
            <Arrow3 s={s} from={pts[N - 8]} to={to} color={AXIS} width={1.6} head={10} opacity={end.opacity} />
            <Label3 s={s} at={to} dx={dx} dy={dy} color={AXIS} size={17} fontWeight="400" paintOrder="stroke" stroke="#fff" strokeWidth="4">
              {name}
            </Label3>
          </g>
        );
      })}
    </g>
  );
}

/**
 * "z = c" beside the plane's back right corner, (3, 3, c): it lies in the valley, where the ground
 * is about 0, so the graph never hides the plane there. For c high enough that the corner leaves
 * the picture (above about 1.7), the label slides down the plane's right edge x = 3 to stay in it.
 */
export function PlaneLabel({ s, c }) {
  const z = c * Z_SCALE;
  let y = R[1];
  while (y > 0 && s.P([R[1], y, z])[1] < 30) y -= 0.05;
  return (
    <Label3 s={s} at={[R[1], y, z]} dx={10} dy={7} color={PLANE_INK} size={21} fontWeight="400" paintOrder="stroke" stroke="#fff" strokeWidth="4">
      z
      <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
        {' = '}
      </tspan>
      c
    </Label3>
  );
}

/**
 * Level sets, found from the graph. The graph of a function of two variables (the two hills of
 * the title slide) and the question: what do we get when the height z = c? Key press 1: the
 * plane z = c, labelled at its back right corner, cuts the graph along curves (red), with a slider
 * for c (no text), centred. 2: the points
 * (x, y) below them, f(x, y) = c, curves in the plane, centred in the side column with "Projection
 * to the xy plane" under them. 3: Mark's definition.
 */
export default function Slide09LevelSets() {
  const [c, setC] = useState(START);
  const marker = useRef(null);
  const cut = useFragmentShown(marker);
  const graph = { f, x: R, y: R, n: 34, zScale: Z_SCALE, mesh: 'rgba(15, 40, 50, 0.16)' };
  const sliced = { ...graph, water: c, seeThrough: true, waterColor: PLANE, curve: c, curveColor: CARDINAL, curveWidth: 3.5 };

  return (
    <section className="dense">
      <h2>Level sets</h2>

      <span ref={marker} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />

      <div className="level-stage">
        <figure className="level-3d">
          <Space width={560} height={380} unit={68} center={[0.5, 0.62]} axes={false} az={102} el={28} swing={6} title="The graph of a function with two hills, cut by the horizontal plane at height c">
            {(s) =>
              PRINT ? (
                <g>
                  <Surface s={s} {...graph} />
                  <Fragment as="g" index={1}>
                    <Surface s={s} {...sliced} />
                    <PlaneLabel s={s} c={c} />
                  </Fragment>
                  <Axes s={s} />
                </g>
              ) : (
                <g>
                  <Surface s={s} {...(cut ? sliced : graph)} />
                  <Axes s={s} c={cut ? c : undefined} />
                  {cut && <PlaneLabel s={s} c={c} />}
                </g>
              )
            }
          </Space>
          <span className="scalar-formula">
            <Tex tex="z=f(x,y)" />
          </span>
        </figure>

        <div className="level-side">
          <p className="motiv-question">
            What do we get when the height <Tex tex="z=c" />?
          </p>

          <Fragment index={1}>
            <div className="level-slider centred">
              <Slider name="c" label={<Tex tex="c" />} value={c} onChange={setC} color={CARDINAL} min={0.1} max={2.1} step={0.05} format={(v) => v.toFixed(2)} />
            </div>
          </Fragment>

          <Fragment index={2} className="level-below level-proj">
            <ContourPlot f={f} x={R} y={R} size={250} levels={[]} highlight={c} axes title="Projection to the xy plane: the points (x, y) where f(x, y) = c" />
            <p>
              Projection to the <Tex tex="xy" /> plane
            </p>
          </Fragment>
        </div>
      </div>

      <Fragment index={3} className="block definition graph-def">
        <p>
          Let <Tex tex={r`f:\mathbb{R}^n\to\mathbb{R}`} /> be a scalar-valued function. For every{' '}
          <Tex tex={r`c\in\mathbb{R}`} />, the <strong>level set</strong> of <Tex tex="f" /> at{' '}
          <Tex tex="c" /> is the collection of points <Tex tex={r`\vv{x}`} /> of <Tex tex={r`\mathbb{R}^n`} />{' '}
          satisfying <Tex tex={r`f(\vv{x})=c`} />. In set notation:{' '}
          <Tex tex={r`\{\vv{x}\in\mathbb{R}^n:f(\vv{x})=c\}`} />.
        </p>
      </Fragment>
    </section>
  );
}
