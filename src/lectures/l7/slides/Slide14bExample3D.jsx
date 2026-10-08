import { useRef } from 'react';
import Fragment from '../components/Fragment.jsx';
import Space, { Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { lineColor } from '../components/levels.js';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/bay.js';

export const CARDINAL = '#8c1515';
export const MESH = 'rgba(20, 33, 61, 0.3)';
export const FILL = '#e9eef3';
export const AXIS = '#6b7280';

// graph (D) and contour plot III of Example 3, with the same levels
export const f = (x, y) => (x * y) / 4.5;
export const R = [-3, 3];
export const POS = [0.3, 0.6, 0.9, 1.2, 1.5, 1.8];
export const NEG = POS.map((c) => -c);
export const LEVELS = [0, ...POS, ...NEG];
export const Z = 0.8; // heights drawn at 0.8 × f
export const VIEW = { az: 55, el: 26 };
export const ramp = (c) => lineColor((c + 1.8) / 3.6); // the colours of contour plot III
export const tone = (c) => (c === 0 ? CARDINAL : ramp(c));

// the level set f = c, as polylines in the plane: the two axes for c = 0, else the hyperbola
// xy = 4.5c in the square (in quadrants I and III for c > 0, II and IV for c < 0)
export const N = 60;
export function levelSet(c) {
  if (c === 0) {
    // in short pieces, so that each is painted in depth order with the cells of the graph
    const t = Array.from({ length: N + 1 }, (_, i) => R[0] + ((R[1] - R[0]) * i) / N);
    return [t.map((u) => [u, 0]), t.map((u) => [0, u])];
  }
  const k = 4.5 * c;
  const a = Math.abs(k) / R[1]; // |x| runs from a to 3
  const branch = (sx) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const x = sx * a * (R[1] / a) ** (i / N); // spaced evenly along the curve's length, roughly
      return [x, k / x];
    });
  return [branch(1), branch(-1)];
}

// the curves on the graph, at height c
export const onGraph = (levels, width) =>
  levels.flatMap((c) => levelSet(c).map((pl) => ({ pts: pl.map(([x, y]) => [x, y, Z * c]), color: tone(c), width })));

// one stage per key press: 1 the level 0, 2 the levels c > 0, 3 the levels c < 0
export const STAGES = [[0], POS, NEG];

export const HALO = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };

/** "x" and "y" at the ends of the level curve c = 0 on the graph, which is the x- and y-axes. */
export function AxisNames({ s }) {
  return (
    <g>
      <Label3 s={s} at={[R[1] + 0.3, 0, 0]} dx={-5} dy={6} color={AXIS} size={19} fontWeight="400" {...HALO}>
        x
      </Label3>
      <Label3 s={s} at={[0, R[1] + 0.3, 0]} dx={-5} dy={6} color={AXIS} size={19} fontWeight="400" {...HALO}>
        y
      </Label3>
    </g>
  );
}

/**
 * Example 3 (D): the saddle z = xy/4.5 of Example 3, large, beside its contour plot III. Key press
 * 1: the level curve c = 0 on the graph, the x- and y-axes (red, also on the contour plot); 2: the
 * levels c > 0, up in quadrants I and III; 3: the levels c < 0, down in quadrants II and IV. The
 * levels are those of contour plot III, in its colours.
 */
export default function Slide14bExample3D() {
  const markers = [useRef(null), useRef(null), useRef(null)];
  const shown = [useFragmentShown(markers[0]), useFragmentShown(markers[1]), useFragmentShown(markers[2])];
  const graph = { f, x: R, y: R, n: 30, zScale: Z, color: FILL, mesh: MESH };
  // the curves on the graph up to stage k (from 1)
  const upTo = (k) => onGraph(STAGES.slice(0, k).flat(), 3);
  const stage = shown.filter(Boolean).length;

  return (
    <section className="dense">
      <h2>Example 3 (D)</h2>

      {markers.map((m, k) => (
        <span key={k} ref={m} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      <div className="ex3d">
        <figure className="ex3d-graph">
          <Space width={720} height={460} unit={80} center={[0.5, 0.38]} axes={false} {...VIEW} swing={8} title="Graph (D), a saddle, with its level curves on it">
            {(s) => (
              <g>
                {PRINT ? (
                  <>
                    <Surface s={s} {...graph} />
                    {STAGES.map((_, k) => (
                      <Fragment key={k} as="g" index={k + 1}>
                        <Surface s={s} {...graph} lines={upTo(k + 1)} />
                      </Fragment>
                    ))}
                  </>
                ) : (
                  <Surface s={s} {...graph} lines={upTo(stage)} />
                )}
                <Fragment as="g" index={1}>
                  <AxisNames s={s} />
                </Fragment>
              </g>
            )}
          </Space>
          <figcaption>(D)</figcaption>
        </figure>

        <figure className="ex3d-plot">
          <ContourPlot f={f} x={R} y={R} size={340} levels={LEVELS} color={ramp} width={1.8} axes title="Contour plot III, the level sets of graph (D)">
            {(p) => (
              <g>
                <Fragment as="g" index={1}>
                  <g stroke={CARDINAL} strokeWidth="3" strokeLinecap="round">
                    <line x1={p.px(R[0])} y1={p.py(0)} x2={p.px(R[1])} y2={p.py(0)} />
                    <line x1={p.px(0)} y1={p.py(R[0])} x2={p.px(0)} y2={p.py(R[1])} />
                  </g>
                </Fragment>
                <g fill={AXIS} fontSize="17" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif" paintOrder="stroke" stroke="#fff" strokeWidth="4">
                  <text x={p.px(R[1]) - 14} y={p.py(0) + 20}>
                    x
                  </text>
                  <text x={p.px(0) + 8} y={p.py(R[1]) + 18}>
                    y
                  </text>
                </g>
              </g>
            )}
          </ContourPlot>
          <figcaption>III</figcaption>
        </figure>
      </div>
    </section>
  );
}
