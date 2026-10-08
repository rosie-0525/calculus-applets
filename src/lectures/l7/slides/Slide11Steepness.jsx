import { useRef } from 'react';
import Tex from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3, Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/bay.js';
import { HILLS_LEVELS as LEVELS, hillsTone as tone } from '../components/hills.js';

export const INK = '#14213d';
export const CARDINAL = '#8c1515';
export const AMBER = '#b45309';

/* ---------- a hill with a cliff on one side ---------- */

// the top, 2 high at (X0, 0); it falls off fast to the west (x < X0) and slowly to the east
export const TOP = 2;
export const X0 = -1;
export const STEEP_W = 0.55;
export const GENTLE_W = 1.8;
export const Y_W = 1.25;
export const u = (x) => (x - X0) / (x < X0 ? STEEP_W : GENTLE_W);
export const f = (x, y) => TOP * Math.exp(-(u(x) ** 2) - (y / Y_W) ** 2);
export const XR = [-3, 3];
export const YR = [-2.4, 2.4];
export const Z = 1.1; // heights drawn at 1.1 × f

/** Where the path down the west (−1) or east (+1) side, along y = 0, is at height c. */
export const downTo = (side, c) => X0 + side * (side < 0 ? STEEP_W : GENTLE_W) * Math.sqrt(Math.log(TOP / c));

// the two paths down from the top level curve to the lowest one, and their crossings with the levels
export const PATHS = [
  { side: -1, color: CARDINAL, note: 'close: steep', step: 2 },
  { side: 1, color: AMBER, note: 'far apart: less steep', step: 3 },
].map((p) => ({ ...p, from: downTo(p.side, LEVELS.at(-1)), to: downTo(p.side, LEVELS[0]), dots: LEVELS.map((c) => ({ c, x: downTo(p.side, c) })) }));

export const N = 60;
export const LINES = PATHS.map(({ from, to, color }) => ({
  pts: Array.from({ length: N + 1 }, (_, k) => {
    const x = from + ((to - from) * k) / N;
    return [x, 0, Z * f(x, 0)];
  }),
  color,
  width: 4,
}));

/** The graph of f with its level curves, and on it the first `paths` paths down (0, 1 or 2). */
export function Graph({ s, paths }) {
  return <Surface s={s} f={f} x={XR} y={YR} n={[40, 32]} zScale={Z} mesh="rgba(15, 40, 50, 0.12)" curve={LEVELS} curveColor={tone} curveWidth={2.4} lines={LINES.slice(0, paths)} />;
}

/**
 * Close level curves mean steep ground. A hill with a cliff on its west side and a long gentle
 * slope on its east side: its graph with the level curves 0.3, 0.6, …, 1.8 on it. Key press 1:
 * its contour plot, the same levels. 2: a path down the cliff, on both pictures, with its
 * crossings of the levels: they come close together (steep, red). 3: a path down the slope,
 * the same way: far apart (less steep, amber). 4: the rule.
 */
export default function Slide11Steepness() {
  const steepMarker = useRef(null);
  const gentleMarker = useRef(null);
  const paths = (useFragmentShown(steepMarker) ? 1 : 0) + (useFragmentShown(gentleMarker) ? 1 : 0);
  const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };

  return (
    <section className="dense">
      <h2>Steepness on a contour plot</h2>
      <span ref={steepMarker} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />
      <span ref={gentleMarker} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />

      <div className="steep">
        <figure className="steep-3d">
          <Space width={600} height={350} unit={76} center={[0.5, 0.7]} axes={false} az={114} el={22} swing={6} title="The graph of a hill with a cliff on its west side and a gentle slope on its east side, with its level curves">
            {(s) => (
              <g>
                {PRINT ? (
                  <>
                    <Graph s={s} paths={0} />
                    <Fragment as="g" index={2}>
                      <Graph s={s} paths={1} />
                    </Fragment>
                    <Fragment as="g" index={3}>
                      <Graph s={s} paths={2} />
                    </Fragment>
                  </>
                ) : (
                  <Graph s={s} paths={paths} />
                )}
                {PATHS.map(({ side, color, dots, step }) => (
                  <Fragment as="g" index={step} key={side}>
                    {dots.map(({ c, x }) => (
                      <Dot3 key={c} s={s} at={[x, 0, Z * c]} color={color} r={4} stroke="#fff" strokeWidth="1.2" />
                    ))}
                    {side < 0 ? (
                      <Label3 s={s} at={[downTo(-1, 0.9), 0, Z * 0.9]} dx={-16} dy={0} color={CARDINAL} size={17} italic={false} textAnchor="end" {...halo}>
                        steep
                      </Label3>
                    ) : (
                      <Label3 s={s} at={[downTo(1, 0.6), 0, Z * 0.6]} dx={6} dy={-14} color={AMBER} size={17} italic={false} {...halo}>
                        less steep
                      </Label3>
                    )}
                  </Fragment>
                ))}
              </g>
            )}
          </Space>
          <figcaption>
            Graph of <Tex tex="f" />
          </figcaption>
        </figure>

        <Fragment index={1} as="figure" className="steep-top">
          <ContourPlot f={f} x={XR} y={YR} size={[400, 320]} levels={LEVELS} color={tone} width={2} title="The contour plot of the hill, every 0.3, with the two paths down and their crossings with the level curves">
            {(p) => (
              <g>
                {PATHS.map(({ side, color, from, to, dots, note, step }) => (
                  <Fragment as="g" index={step} key={side}>
                    <line x1={p.px(from)} y1={p.py(0)} x2={p.px(to)} y2={p.py(0)} stroke={color} strokeWidth="3" strokeLinecap="round" />
                    {dots.map(({ c, x }) => (
                      <circle key={c} cx={p.px(x)} cy={p.py(0)} r="4" fill={color} stroke="#fff" strokeWidth="1.2" />
                    ))}
                    <text
                      x={(p.px(from) + p.px(to)) / 2}
                      y={p.py(0) + (side < 0 ? -80 : 88)}
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="700"
                      fill={color}
                      {...halo}
                    >
                      {note}
                    </text>
                  </Fragment>
                ))}
              </g>
            )}
          </ContourPlot>
          <figcaption>Contour plot</figcaption>
        </Fragment>
      </div>

      <Fragment index={4} className="block theorem steep-rule">
        <p>
          The steeper the graph of <Tex tex="f" />, the shorter the distance between the level sets.
        </p>
      </Fragment>
    </section>
  );
}
