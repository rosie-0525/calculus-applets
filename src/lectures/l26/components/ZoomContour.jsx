import { useRef } from 'react';
import ContourPlot from './ContourPlot.jsx';
import Fragment from './Fragment.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { fEx } from './hessian.js';

const CURVE = '#5f6b7a';
const INK = '#14213d';
const RED = '#8c1515';
// the levels, as offsets from f(a) in units of w² (w the half-width of the window): evenly spaced in
// √|K|, so that the curves of a quadratic form look evenly spaced; 0 is the level through a saddle
const K = [0, ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap((k) => [0.1 * k * k, -0.1 * k * k])];
const START = { c: [1.5, 1.5], w: 2.5 }; // Example 3's window, [−1, 4]²
const TARGETS = [
  { a: [1, 1], fa: -1 }, // the local minimum
  { a: [3, 0], fa: 0 }, // a saddle point
];
const W_END = 0.1;

/**
 * The view at time t: 0, Example 3's window; 1, zoomed into a = (1, 1) (half-width 0.1); 2, zoomed
 * into a = (3, 0), by way of a wider view between them. The levels are f(a) + K w², so that they
 * follow the zoom; f(a) slides from −1 to 0 between the two critical points.
 */
function view(t) {
  if (t <= 1) {
    const w = Math.exp((1 - t) * Math.log(START.w) + t * Math.log(W_END));
    const a = TARGETS[0].a;
    // the centre glides to a while the window shrinks, a staying put on screen at first
    const k = (w - W_END) / (START.w - W_END);
    return { c: [a[0] + (START.c[0] - a[0]) * k, a[1] + (START.c[1] - a[1]) * k], w, fa: TARGETS[0].fa };
  }
  const u = t - 1;
  const [P0, P1] = TARGETS;
  const w = W_END * Math.exp(Math.log(12) * Math.sin(Math.PI * u));
  return { c: [0, 1].map((i) => P0.a[i] + u * (P1.a[i] - P0.a[i])), w, fa: P0.fa + u * (P1.fa - P0.fa) };
}

function FPlot({ t, size }) {
  const { c, w, fa } = view(t);
  return (
    <ContourPlot
      f={fEx}
      x={[c[0] - w, c[0] + w]}
      y={[c[1] - w, c[1] + w]}
      size={size}
      n={110}
      levels={K.map((k) => fa + k * w * w)}
      color={() => CURVE}
      width={1.5}
      title="The contour plot of f(x, y) = x²y + xy² − 3xy, zooming in on a critical point"
    >
      {(p) => (
        <g>
          {TARGETS.map(({ a }) =>
            Math.abs(a[0] - c[0]) < w * 0.97 && Math.abs(a[1] - c[1]) < w * 0.97 ? (
              <circle key={a.join()} cx={p.px(a[0])} cy={p.py(a[1])} r="4.5" fill={INK} stroke="#fff" strokeWidth="1.5" />
            ) : null,
          )}
        </g>
      )}
    </ContourPlot>
  );
}

/** The contour plot of ½ q_M(h) over [−1, 1]², M = [[a, b], [b, c]], with the same levels K. */
function QPlot2({ M, size }) {
  const [[a, b], [, c]] = M;
  return (
    <ContourPlot
      f={(x, y) => 0.5 * (a * x * x + 2 * b * x * y + c * y * y)}
      x={[-1, 1]}
      y={[-1, 1]}
      size={size}
      n={110}
      levels={K}
      color={() => RED}
      width={1.5}
      axes
      title={`The contour plot of the quadratic form with matrix [${a} ${b}; ${b} ${c}]`}
    >
      {(p) => <circle cx={p.px(0)} cy={p.py(0)} r="4.5" fill={INK} stroke="#fff" strokeWidth="1.5" />}
    </ContourPlot>
  );
}

const STILLS = [0, 1, 2];

/**
 * Contour plots near a critical point (Example 3's f, x²y + xy² − 3xy): on the left f's contour plot
 * in Example 3's window; key press `at`, it zooms into the local minimum (1, 1), and the contour plot
 * of q_{Hf(1,1)} comes on the right (red: the quadratic term's colour); key press `at` + 1, it zooms
 * out and into the saddle point (3, 0), and on the right q_{Hf(3,0)}.
 * The zoomed plots and the quadratic forms' are the same pictures. Print: a still per key press.
 */
export default function ZoomContour({ at = 1, size = 300, labels }) {
  const m1 = useRef(null);
  const m2 = useRef(null);
  const t1 = useTween(useFragmentShown(m1), { ms: 2600, delay: 300 });
  const t2 = useTween(useFragmentShown(m2), { ms: 3400, delay: 300 });
  const t = t2 > 0 ? 1 + t2 : t1;
  return (
    <div className="l26-zoom">
      <span ref={m1} className="fragment fx-marker" data-fragment-index={at} aria-hidden="true" />
      <span ref={m2} className="fragment fx-marker" data-fragment-index={at + 1} aria-hidden="true" />
      <figure className="l26-zoom-fig">
        <div className="l9-stack">
          {PRINT ? (
            STILLS.map((s) =>
              s === 0 ? (
                <Fragment key={s} index={at} effect="fade-out">
                  <FPlot t={0} size={size} />
                </Fragment>
              ) : (
                <Fragment key={s} index={at + s - 1}>
                  {s === 1 ? (
                    <Fragment index={at + 1} effect="fade-out">
                      <FPlot t={1} size={size} />
                    </Fragment>
                  ) : (
                    <FPlot t={2} size={size} />
                  )}
                </Fragment>
              ),
            )
          ) : (
            <FPlot t={t} size={size} />
          )}
        </div>
        <figcaption>{labels?.[0]}</figcaption>
      </figure>
      <Fragment index={at} as="figure" className="l26-zoom-fig">
        <div className="l9-stack">
          <Fragment index={at + 1} effect="fade-out">
            <QPlot2 M={[[2, 1], [1, 2]]} size={size} />
          </Fragment>
          <Fragment index={at + 1}>
            <QPlot2 M={[[0, 3], [3, 6]]} size={size} />
          </Fragment>
        </div>
        <figcaption className="l9-stack">
          <Fragment index={at + 1} effect="fade-out" as="span">
            {labels?.[1]}
          </Fragment>
          <Fragment index={at + 1} as="span">
            {labels?.[2]}
          </Fragment>
        </figcaption>
      </Fragment>
    </div>
  );
}
