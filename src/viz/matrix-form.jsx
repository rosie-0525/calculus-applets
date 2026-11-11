import { useCallback, useState } from 'react';
import '../lectures/l22/styles/deck.css';
import Tex, { r } from '../lectures/l22/components/Tex.jsx';
import { LoopPic, SYSTEM_MAPS } from '../lectures/l22/components/ImageCards.jsx';
import { EXAMPLES, SystemCol, axbTex, m, n } from '../lectures/l22/slides/Slide02dSystems.jsx';
import { from } from './redundancies.jsx';

export const lecture = 22;

const STEPS = [
  ['Write each system as ', r`A\vv x=\vv b`],
  ['Draw each ', r`T_A`, ' and ', r`\vv b`],
];

/*
 * Linear system in matrix form, without its title, the two questions and its box (the caption has
 * them): four systems, of 2 equations in 1 unknown up to 3 in 3, each under its numbers of equations
 * (m, teal) and unknowns (n, green); their right-hand sides can be edited (click one, type a number).
 * On the slide, key presses write each system as Ax = b with A's size m × n under A, then preview
 * each T_A: its picture, played once (the arrows e₁, e₂, … become Ae₁, Ae₂, …, the image lights up),
 * ℝⁿ → ℝᵐ under it, and b, a green arrow (dotted down to the plane when off it). Here two buttons,
 * the second after the first; each card keeps its column, so b follows the edits in Ax = b and in
 * the picture. The pictures are drawn afresh when they come in, so that they play.
 */
export default function MatrixForm() {
  const [bs, setBs] = useState(() => EXAMPLES.map(({ b }) => b));
  const onRhs = useCallback((k, i, v) => setBs((old) => old.map((b, j) => (j === k ? b.map((c, l) => (l === i ? v : c)) : b))), []);
  const [step, setStep] = useState(0);
  return (
    <div className="viz-col mf">
      <div className="mf-row">
        {EXAMPLES.map(({ M, b }, k) => (
          <div key={k} className="mf-card">
            <SystemCol M={M} b={b} k={k} onRhs={onRhs} />
            <div className="l22-sys-col l22-sys-axb" style={from(step, 1)}>
              <Tex tex={axbTex(M, bs[k])} />
            </div>
            <div className="mf-pic" style={from(step, 2)}>
              <LoopPic key={step >= 2 ? 'on' : 'off'} index={0} ex={{ ...SYSTEM_MAPS[k], b: bs[k] }} once />
              <div className="l22-sys-rn">
                <Tex tex={r`\mathbb R^{${n(M[0].length)}}\to\mathbb R^{${m(M.length)}}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="viz-toggle">
        {STEPS.map((parts, k) => (
          <button key={k} type="button" className="viz-button" aria-pressed={step === k + 1} disabled={step < k} onClick={() => setStep(k + 1)}>
            {parts.map((p, i) => (i % 2 ? <Tex key={i} tex={p} /> : p))}
          </button>
        ))}
        <button type="button" className="viz-button" disabled={step === 0} onClick={() => setStep(0)}>
          Start again
        </button>
      </div>
    </div>
  );
}
