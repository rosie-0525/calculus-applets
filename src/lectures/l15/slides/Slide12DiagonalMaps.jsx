import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import Slider, { fmt } from '../components/Slider.jsx';
import { F, S } from '../components/FPanel.jsx';
import { useFragmentShown, useGlide } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, AMBER, pts } from '../components/la.js';

export const XR = [-2.3, 2.3];
export const YR = [-2.3, 2.3];
export const GRID = [-3, -2, -1, 0, 1, 2, 3];
// the key presses' diagonal matrices diag(d₁, d₂)
export const PRESETS = [
  { d: [2, 1], name: 'stretch' },
  { d: [1, -1], name: 'reflection' },
  { d: [1, 0], name: 'projection' },
  { d: [-1, 2], name: 'reflection and stretch' },
];
export const texD = ([a, b]) => r`\begin{bmatrix}\textcolor{${BLUE}}{${fmt(a)}}&0\\ 0&\textcolor{${AMBER}}{${fmt(b)}}\end{bmatrix}`;

/**
 * diag(d₁, d₂) on the plane: the grid (its vertical lines moved by d₁, its horizontal ones by d₂),
 * S and F in gray, their images in orange and red (as on Linear transformations of ℝ², last
 * lecture).
 */
export function DPanel({ d }) {
  const f = ([x, y]) => [d[0] * x, d[1] * y];
  return (
    <Plane xRange={XR} yRange={YR} unit={74} pad={8} grid={false} axes={false} title="The unit square and the letter F under a diagonal matrix">
      {(p) => (
        <g>
          <defs>
            <clipPath id="l15-dpanel-clip">
              <rect x={0} y={0} width={p.W} height={p.H} rx={10} />
            </clipPath>
          </defs>
          <g clipPath="url(#l15-dpanel-clip)">
            <g strokeWidth="1.2">
              {GRID.map((k) => (
                <g key={k}>
                  <line x1={p.px(d[0] * k)} y1={p.py(YR[0])} x2={p.px(d[0] * k)} y2={p.py(YR[1])} stroke="#dbe6f3" />
                  <line x1={p.px(XR[0])} y1={p.py(d[1] * k)} x2={p.px(XR[1])} y2={p.py(d[1] * k)} stroke="#f6e1cc" />
                </g>
              ))}
            </g>
            <g strokeWidth="1.8">
              <line x1={p.px(XR[0])} y1={p.py(0)} x2={p.px(XR[1])} y2={p.py(0)} stroke={BLUE} opacity="0.55" />
              <line x1={p.px(0)} y1={p.py(YR[0])} x2={p.px(0)} y2={p.py(YR[1])} stroke={AMBER} opacity="0.55" />
            </g>
          </g>
          <polygon points={pts(p, S)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points={pts(p, F)} fill="#d1d5db" />
          <polygon points={pts(p, S.map(f))} fill="rgba(242, 179, 122, 0.55)" stroke="#c2702a" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={pts(p, F.map(f))} fill={RED} stroke={RED} strokeWidth="1.5" strokeLinejoin="round" />
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Plane>
  );
}

/**
 * What else do diagonal matrices do? (Mark's question): diag(d₁, d₂) is a stretch, reflection or
 * projection by coordinate. Key presses 1–4: a stretch, a reflection, a projection, a reflection and
 * stretch, each a tile with its matrix, large (the current one tinted), while the picture, first
 * reset to the unit square (the user's request), glides to it; sliders for d₁, d₂ (not in print
 * mode, which shows a still per key press). (The formula diag(d₁, d₂)x = (d₁x₁, d₂x₂) and, on key
 * press 5, composing two of them, removed by the user.)
 */
export default function Slide12DiagonalMaps() {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const shown = refs.map((ref) => useFragmentShown(ref)); // eslint-disable-line react-hooks/rules-of-hooks
  const step = shown.lastIndexOf(true) + 1;
  const [target, setTarget] = useState([1, 1]);
  const [d1, setD1] = useGlide(target[0], 1300);
  const [d2, setD2] = useGlide(target[1], 1300);
  // on each key press, back to the unit square at once, then a glide to the new matrix
  useEffect(() => {
    setD1(1);
    setD2(1);
    setTarget([1, 1]);
    const timer = setTimeout(() => setTarget(step === 0 ? [1, 1] : PRESETS[step - 1].d), 400);
    return () => clearTimeout(timer);
  }, [step, setD1, setD2]);
  return (
    <section className="dense">
      <h2>What else do diagonal matrices do?</h2>
      {refs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      <div className="l15-dmaps">
        <div className="l15-dmaps-pic">
          {PRINT ? (
            <div className="l15-stills">
              {[[1, 1], ...PRESETS.map((q) => q.d)].map((d, k) =>
                k === 0 ? (
                  <Fragment key={k} index={1} effect="fade-out">
                    <DPanel d={d} />
                  </Fragment>
                ) : (
                  <Fragment key={k} index={k}>
                    {k < PRESETS.length ? (
                      <Fragment index={k + 1} effect="fade-out">
                        <DPanel d={d} />
                      </Fragment>
                    ) : (
                      <DPanel d={d} />
                    )}
                  </Fragment>
                ),
              )}
            </div>
          ) : (
            <>
              <DPanel d={[d1, d2]} />
              <div className="lc-sliders l15-d-sliders">
                <Slider name="d1" label={<Tex tex="d_1" />} value={Math.round(d1 * 10) / 10} onChange={setD1} min={-2} max={2} step={0.1} color={BLUE} />
                <Slider name="d2" label={<Tex tex="d_2" />} value={Math.round(d2 * 10) / 10} onChange={setD2} min={-2} max={2} step={0.1} color={AMBER} />
              </div>
            </>
          )}
        </div>

        <div className="l15-dmaps-text">
          {/* (diag(d₁, d₂)x = (d₁x₁, d₂x₂), above the matrices, removed by the user) */}
          <ul className="l15-presets">
            {PRESETS.map((q, k) => (
              <Fragment key={q.name} index={k + 1} as="li" className="l15-preset">
                <Tex tex={texD(q.d)} />
                <span>{q.name}</span>
              </Fragment>
            ))}
          </ul>
          {/* (key press 5: diag(a, b) diag(a′, b′) = diag(aa′, bb′) = diag(a′, b′) diag(a, b), removed
              by the user) */}
        </div>
      </div>
    </section>
  );
}
