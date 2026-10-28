import { useEffect, useRef, useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import { useTween } from '../lectures/l15/components/useFragmentTween.js';
import { RED, BLUE, AMBER, lerpM, I2 } from '../lectures/l15/components/la.js';
import { PARTS, MapPanel, mul } from '../lectures/l15/slides/Slide13cExample1Maps.jsx';

export const lecture = 15;

/** True from the first time the applet is on screen (its section `present`, see Applet.jsx). */
function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section || seen) return undefined;
    const check = () => section.classList.contains('present') && setSeen(true);
    check();
    const mo = new MutationObserver(check);
    mo.observe(section, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [ref, seen]);
  return seen;
}

// when T_B ∘ T_A starts, after T_A ∘ T_B is over (by 5.1 s)
const NEXT = 5600;

/**
 * One composite, from `on`: the first map, a pause, the second, then the product's matrix (as on
 * the slide's key press: Slide13cExample1Maps's Part, run by `on`).
 */
function Part({ part, on }) {
  const t1 = useTween(on, { ms: 1500, delay: 900 });
  const t2 = useTween(on, { ms: 1500, delay: 3600 });
  const M = mul(lerpM(I2, part.second, t2), lerpM(I2, part.first, t1));
  const rest = t2 >= 1 ? 2 : t2 > 0 ? null : t1 >= 1 ? 1 : t1 > 0 ? null : 0;
  // the map now moving (or last moved) in red: the first is on the right of ∘
  const stage = t2 > 0 ? 1 : t1 > 0 ? 0 : -1;
  const map = (k) => (stage === k ? r`\textcolor{${RED}}{${part.maps[k]}}` : part.maps[k]);
  const entries = part.product.map((row) => r`\textcolor{${BLUE}}{${row[0]}}&\textcolor{${AMBER}}{${row[1]}}`).join(r`\\ `);
  return (
    <div className="l15-ex1-part">
      <Tex tex={`${map(1)}\\circ ${map(0)}`} className="l15-ex1-head" />
      <MapPanel id={part.key} M={M} labels={part.labels} rest={rest} />
      <div className="l15-ex1-label" style={{ opacity: rest === 2 ? 1 : 0 }}>
        <Tex tex={r`${part.key}=\begin{bmatrix}${entries}\end{bmatrix}`} />
      </div>
    </div>
  );
}

/*
 * Example 2 (i) as linear transformations, A = diag(2, 1) and a B drawn with columns (a, c), (b, d):
 * T_A ∘ T_B, the unit square, F, e₁ and e₂ moved by T_B (to the columns of B), then by T_A, and AB;
 * T_B ∘ T_A, by T_A (e₁ to 2e₁), then by T_B, and BA. On the slide each composite runs on a key
 * press; here one after the other, the first time the applet is on screen, and again on Replay.
 */
export default function DiagonalProducts() {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    setStep(1);
    const timer = setTimeout(() => setStep(2), NEXT);
    return () => clearTimeout(timer);
  }, [seen, run]);
  const replay = () => {
    setStep(0);
    setRun((n) => n + 1);
  };
  return (
    <div className="viz-col" ref={ref}>
      <p className="l15-ex1-given">
        <Tex tex={r`A=\begin{bmatrix}2&0\\ 0&1\end{bmatrix}`} />, <Tex tex={r`B=\begin{bmatrix}a&b\\ c&d\end{bmatrix}`} />
      </p>
      <div className="l15-ex1-parts">
        {PARTS.map((part, k) => (
          <Part key={part.key} part={part} on={step > k} />
        ))}
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  );
}
