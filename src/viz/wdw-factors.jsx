import { useState } from 'react';
import '../lectures/l25/styles/deck.css';
import Tex, { r } from '../lectures/l25/components/Tex.jsx';
import { useTween } from '../lectures/l25/components/useFragmentTween.js';
import { Scene, view, compS, useProgress, TOTAL, START } from '../lectures/l25/slides/Slide09bWDWExample.jsx';

export const lecture = 25;

/**
 * The picture playing `mode`: 'A', T_A from I (w₁ and w₂ stretched along their lines to λ₁w₁ and
 * λ₂w₂); 'WDW', the composition from I, a factor at a time, each factor's word under the formula
 * coming as it acts; null, the plane at rest with w₁ and w₂. Drawn afresh for each click.
 */
function Play({ mode }) {
  const a = useTween(mode === 'A', { ms: 1900, delay: 400 });
  const p = useProgress(mode === 'WDW', { ms: TOTAL, delay: 400 });
  const scene = mode === 'WDW' ? view(0, compS(p), true) : view(a, 0, false);
  const word = (i, children) => <small style={{ opacity: mode === 'WDW' && p > 0 && p * TOTAL > START[i] - 1e-6 ? 1 : 0 }}>{children}</small>;
  return (
    <div className="l25-pic">
      <Scene {...scene} />
      <div className="l25-wdw-formula l25-wex-formula">
        <Tex tex="A=" />
        <span className="l25-wdw-f">
          <Tex tex="W" />
          {word(
            2,
            <>
              rotate
              <br />
              back
            </>,
          )}
        </span>
        <span className="l25-wdw-f">
          <Tex tex="D" />
          {word(
            1,
            <>
              stretch along
              <br />
              the axes
            </>,
          )}
        </span>
        <span className="l25-wdw-f">
          <Tex tex={r`W^{-1}`} />
          {word(0, 'rotate')}
        </span>
      </div>
    </div>
  );
}

const MODES = [
  { id: 'A', tex: 'A', name: 'A' },
  { id: 'WDW', tex: r`WDW^{-1}`, name: 'W D W inverse' },
];

/*
 * Example (A = WDWᵀ), without its title and its steps (the caption has them): A = [1 1/2; 1/2 1]'s
 * picture (SpecScene.jsx: the grid, the unit square and F, the unit eigenvectors w₁ = (1, 1)/√2,
 * amber, and w₂ = (−1, 1)/√2, purple, on their lines), and under it A = W D W⁻¹. On the slide T_A
 * plays on a key press, the steps come one per key press, T_A plays again, then the composition, a
 * factor at a time: W⁻¹ rotates w₁, w₂ onto e₁, e₂, D stretches along the axes (λ₁e₁, λ₂e₂), W rotates
 * back (λ₁w₁, λ₂w₂), each factor's word (rotate, stretch along the axes, rotate back) coming under it
 * as it acts. Here the picture starts at rest, and two buttons play T_A and the composition, each
 * from I: they end in the same place.
 */
export default function WdwFactors() {
  const [play, setPlay] = useState({ mode: null, run: 0 });
  return (
    <div className="viz-col wdw">
      <Play key={play.run} mode={play.mode} />
      <div className="viz-toggle" role="group" aria-label="What to play">
        {MODES.map((m) => (
          <button key={m.id} type="button" className="viz-button" aria-label={m.name} aria-pressed={play.mode === m.id} onClick={() => setPlay((s) => ({ mode: m.id, run: s.run + 1 }))}>
            <Tex tex={m.tex} />
          </button>
        ))}
      </div>
    </div>
  );
}
