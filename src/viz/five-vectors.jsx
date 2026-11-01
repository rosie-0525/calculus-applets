import { useRef, useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import { FiveVectors, Conclusion } from '../lectures/l20/slides/Slide13Detects.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 20;

// the slide's key presses 3–8, here 1–6, each a button
const STEPS = [
  'Run Gram–Schmidt',
  'Which are redundant?',
  'Remove them',
  <>
    With the <Tex tex={r`\vv w`} />’s
  </>,
  'A basis',
  'An orthogonal basis',
];

/*
 * Gram–Schmidt detects linear dependence, its example with five vectors, without the rest of the
 * slide (detects-dependence.jsx): V = span{v₁, …, v₅}; Gram–Schmidt draws itself under it and each
 * v_i peels off, slides down and turns into w_i, w₂ and w₄ landing amber with "= 0" under them;
 * v₂, v₄ turn amber, joined to their zero w's, and are redundant, so V = span{v₁, v₃, v₅} =
 * span{w₁, w₃, w₅}; then v₁, v₃, v₅ as a basis and w₁, w₃, w₅ as an orthogonal one. On the slide
 * these come one key press at a time; here a button picks how far it goes, and Gram–Schmidt runs
 * afresh each time it is reached from before it (its moves are deck.css's animations, which play
 * when the run is drawn).
 */
export default function FiveVectorsApplet() {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);
  useFragmentSteps(ref, n);
  const pick = (k) => {
    if (n === 0 && k > 0) setRun((m) => m + 1);
    setN(n === k ? 0 : k);
  };
  return (
    <div className="viz-col" ref={ref}>
      <div className="viz-toggle" role="group" aria-label="How far it goes">
        {STEPS.map((label, k) => (
          <button key={k} type="button" className="viz-button" aria-pressed={n === k + 1} onClick={() => pick(k + 1)}>
            {label}
          </button>
        ))}
      </div>
      <div className="five-col">
        <FiveVectors key={run} run={1} redundant={2} />
        <Conclusion redundant={2} so={3} same={4} bases={5} obases={6} />
      </div>
    </div>
  );
}
