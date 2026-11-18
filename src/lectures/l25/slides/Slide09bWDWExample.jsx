import { useEffect, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import SpecScene from '../components/SpecScene.jsx';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { AMBER, PURPLE, apply } from '../components/eig.js';
import { mul, rot } from '../components/spec.js';

// A = [1 1/2; 1/2 1] (Lecture 24's): eigenvectors (1, 1) (λ₁ = 3/2, amber) and (−1, 1) (λ₂ = 1/2,
// purple), normalized w₁ = (1, 1)/√2 and w₂ = (−1, 1)/√2, so W is the rotation by 45° and
// D = diag(3/2, 1/2). The picture draws w₁ and w₂.
export const H = Math.SQRT1_2;
export const EIGS = [
  { v: [H, H], color: AMBER },
  { v: [-H, H], color: PURPLE },
];
// T_A on its way, (1 − t)I + tA, from I to A, the eigenvectors stretching along their lines
export const along = (t) => [
  [1, 0.5 * t],
  [0.5 * t, 1],
];
export const D = (k) => [
  [1 + 0.5 * k, 0],
  [0, 1 - 0.5 * k],
];
// WDWᵀ a factor at a time, from the right: s from 0 to 1, Wᵀ turns w₁, w₂ onto e₁, e₂; 1 to 2, D
// stretches along the axes; 2 to 3, W turns back
export const at = (s) => (s <= 1 ? rot(-45 * s) : s <= 2 ? mul(D(s - 1), rot(-45)) : mul(rot(45 * (s - 2)), mul(D(1), rot(-45))));
// the names of the two vectors after each step: [TeX, gap, dx, dy], each beside its arrow's tip, off
// the eigenline
export const NAMES = [
  [
    [r`\vv w_1`, 0, 24, 12],
    [r`\vv w_2`, 0, -24, 12],
  ],
  [
    [r`\vv e_1`, 0, 4, 22],
    [r`\vv e_2`, 0, -24, -4],
  ],
  [
    [r`\lambda_1\vv e_1`, 0, 0, 24],
    [r`\lambda_2\vv e_2`, 0, -38, -4],
  ],
  [
    [r`\lambda_1\vv w_1`, 0, 40, 14],
    [r`\lambda_2\vv w_2`, 0, -40, 14],
  ],
];

// the picture at a moment: T_A (`split` false), a from 0 to 1 (its end is WDWᵀ's, NAMES[3]); or
// WDWᵀ, s from 0 to 3, starting again from I; the names only at rest
export const rest = (x) => Math.abs(x - Math.round(x)) < 1e-3;
export const view = (a, s, split) =>
  split ? { M: at(s), names: rest(s) ? NAMES[Math.round(s)] : null } : { M: along(a), names: rest(a) ? NAMES[3 * Math.round(a)] : null };

export function Scene({ M, names }) {
  const labels = names ? names.map(([tex, gap, dx, dy], i) => ({ at: apply(M, EIGS[i].v), tex, color: EIGS[i].color, gap, dx, dy })) : [];
  return (
    <SpecScene
      M={M}
      eigs={EIGS}
      labels={labels}
      xRange={[-1.15, 2.45]}
      yRange={[-1.05, 1.95]}
      unit={112}
      title="A = [1 1/2; 1/2 1], then W D W⁻¹, a factor at a time: W⁻¹ turns the unit eigenvectors onto e₁ and e₂, D stretches along the axes, W turns back"
    />
  );
}

// the composition on one key press: the three moves (MOVE ms each) one after another, a pause
// (HOLD ms) between them; `p` the time since it started, from 0 to 1
export const MOVE = 1800;
export const HOLD = 700;
export const TOTAL = 3 * MOVE + 2 * HOLD;
export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
export const START = [0, MOVE + HOLD, 2 * (MOVE + HOLD)]; // when each move starts (ms)
export function compS(p) {
  const ms = p * TOTAL;
  for (let i = 2; i >= 0; i -= 1) {
    if (ms >= START[i]) return i + ease(Math.min(1, (ms - START[i]) / MOVE));
  }
  return 0;
}

/** The time since `on` turned true (after `delay` ms), from 0 to 1 over `ms`, linear; 0 when off. */
export function useProgress(on, { ms, delay }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!on) {
      setP(0);
      return undefined;
    }
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      setP(k);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, ms, delay]);
  return p;
}

/**
 * Example (the user's request: Spectral theorem – matrix form's words under the factors and its
 * picture, moved here; then the user's order of key presses). On arrival, A = [1 1/2; 1/2 1] (on the
 * left; it was over the picture) and the picture, the plane at rest with w₁ and w₂. Key press 1: T_A
 * plays, w₁ and w₂ stretched along their lines to λ₁w₁ and λ₂w₂; then four bullets (the user's
 * request: no numbers), each its words before its formula, on one line (the user's request:
 * streamlined, saying what each step does; no colours in them, the user's request): 2, v₁ = (1, 1)
 * is an eigenvector with eigenvalue 3/2, and under it, the words level, v₂ = (−1, 1) is an
 * eigenvector with eigenvalue 1/2 (the user's words); 3, to their right, ⇒ D = diag(3/2, 1/2); 4,
 * normalize, w₁ = v₁/‖v₁‖ = (1/√2)(1, 1), w₂ = v₂/‖v₂‖ = (1/√2)(−1, 1) (the user's request); 5,
 * ⇒ W = [w₁ w₂] = (1/√2)[1 −1; 1 1] (the user's words; it was "Unit eigenvectors as columns:
 * W = …"); 6, W orthogonal ⇒ W⁻¹ = Wᵀ = (1/√2)[1 1; −1 1] (the user's words; it was "W is
 * orthogonal: W⁻¹ = Wᵀ = …"); these two without bullets (the user's request); 7: T_A plays again, from I; 8: under the picture, A = W D W⁻¹; 9 (the user's
 * request: the next key press), the composition plays, from I, a factor at a time, each factor's
 * word coming under it as it acts: W⁻¹ rotates
 * (w₁, w₂ onto e₁, e₂), D stretches along the axes (λ₁e₁, λ₂e₂), W rotates back (λ₁w₁, λ₂w₂): the
 * same as A did. Print: the plane at rest, then after T_A (key press 1), then after the composition
 * with the three words (9).
 */
export default function Slide09bWDWExample() {
  const [markers, on] = useMarkers([1, 7, 9]);
  const a1 = useTween(on[0], { ms: 1900, delay: 500 });
  const a2 = useTween(on[1], { ms: 1900, delay: 500 });
  const p = useProgress(on[2], { ms: TOTAL, delay: 600 });
  const s = compS(p);
  // which picture: the composition (9), T_A again (7, still there on 8), T_A (1), at rest
  const scene = on[2] ? view(0, s, true) : on[1] ? view(a2, 0, false) : view(a1, 0, false);
  // each factor's word, once its move has started (in print, all of them on key press 9)
  const word = (i, children) =>
    PRINT ? (
      <Fragment index={9} as="small">
        {children}
      </Fragment>
    ) : (
      <small style={{ opacity: on[2] && p * TOTAL > START[i] - 1e-6 && p > 0 ? 1 : 0 }}>{children}</small>
    );
  return (
    <section>
      <h2>Example</h2>
      {markers}

      <div className="l25-two">
        <div className="l25-wex">
          <p>
            <Tex tex={r`A=\begin{bmatrix}1&\frac{1}{2}\\\frac{1}{2}&1\end{bmatrix}`} />
          </p>
          <ul className="bullets l25-wex-steps">
            {/* the eigenvectors v₁, v₂, one per line, the words level (the user's request), and ⇒ D to
                their right (key press 3; the user's request, to save space) */}
            <Fragment index={2} as="li" className="l25-wex-eig">
              <span className="l25-wex-eigs">
                <Tex tex={r`\vv v_1=\begin{bmatrix}1\\1\end{bmatrix}`} />
                <span>
                  is an eigenvector with eigenvalue <Tex tex={r`\tfrac32`} />
                </span>
                <Tex tex={r`\vv v_2=\begin{bmatrix}-1\\1\end{bmatrix}`} />
                <span>
                  is an eigenvector with eigenvalue <Tex tex={r`\tfrac12`} />
                </span>
                <Fragment index={3} as="span" className="l25-wex-d">
                  <Tex tex={r`\Rightarrow D=\begin{bmatrix}\frac32&0\\0&\frac12\end{bmatrix}`} />
                </Fragment>
              </span>
            </Fragment>
            <Fragment index={4} as="li">
              Normalize:{' '}
              <span>
                <Tex tex={r`\vv w_1=\frac{\vv v_1}{\norm{\vv v_1}}=\tfrac{1}{\sqrt2}\begin{bmatrix}1\\1\end{bmatrix}`} />,{' '}
                <Tex tex={r`\vv w_2=\frac{\vv v_2}{\norm{\vv v_2}}=\tfrac{1}{\sqrt2}\begin{bmatrix}-1\\1\end{bmatrix}`} />
              </span>
            </Fragment>
            <Fragment index={5} as="li" className="l25-wex-then">
              <Tex tex={r`\Rightarrow W=\begin{bmatrix}\vv w_1&\vv w_2\end{bmatrix}=\tfrac{1}{\sqrt2}\begin{bmatrix}1&-1\\1&1\end{bmatrix}`} />
            </Fragment>
            <Fragment index={6} as="li" className="l25-wex-then">
              <Tex tex="W" /> orthogonal <Tex tex={r`\Rightarrow W^{-1}=W^{\top}=\tfrac{1}{\sqrt2}\begin{bmatrix}1&1\\-1&1\end{bmatrix}`} />
            </Fragment>
          </ul>
        </div>
        <div className="l25-pic">
          {PRINT ? (
            <Stills
              stills={[
                { node: <Scene {...view(0, 0, false)} /> },
                { at: 1, node: <Scene {...view(1, 0, false)} /> },
                { at: 9, node: <Scene {...view(0, 3, true)} /> },
              ]}
            />
          ) : (
            <Scene {...scene} />
          )}
          {/* A = W D W⁻¹ under the picture (key press 8), then (9) each factor's word coming as it acts in it */}
          <Fragment index={8} className="l25-wdw-formula l25-wex-formula">
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
          </Fragment>
        </div>
      </div>
    </section>
  );
}
