import { useLayoutEffect, useRef, useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex from '../lectures/l20/components/Tex.jsx';
import { REDUNDANCIES } from '../lectures/l20/components/Redund.jsx';

export const lecture = 20;

/**
 * Show the deck's fragments inside `ref` as on the slide at key press `n`. The page loads none of
 * reveal's fragment styles and marks every fragment `visible` (Applet.jsx), so each is faded here by
 * hand: a fragment not reached yet hidden, a fade-out reached hidden; a marker not reached yet has
 * its effect (its `data-fx`, which deck.css's `.fx-marker.visible ~ .fx-host` rules look for) set
 * aside in `data-fx-off`. Fragments React adds later are caught as they come.
 */
export function useFragmentSteps(ref, n) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const apply = () => {
      root.querySelectorAll('.fragment[data-fragment-index]').forEach((f) => {
        const reached = Number(f.dataset.fragmentIndex) <= n;
        const fx = f.dataset.fx ?? f.dataset.fxOff;
        if (fx !== undefined) {
          if (reached && f.dataset.fx === undefined) {
            f.dataset.fx = fx;
            delete f.dataset.fxOff;
          } else if (!reached && f.dataset.fxOff === undefined) {
            f.dataset.fxOff = fx;
            delete f.dataset.fx;
          }
        }
        // a fragment shows from its key press, a fade-out until it (half, a semi-fade-out)
        const semi = f.classList.contains('semi-fade-out');
        const out = semi || f.classList.contains('fade-out');
        f.style.opacity = reached === out ? (semi ? '0.5' : '0') : '';
      });
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(root, { subtree: true, childList: true });
    return () => mo.disconnect();
  }, [ref, n]);
}

/** What shows from step `k` on, fading in. */
export const from = (s, k) => ({ opacity: s >= k ? 1 : 0, transition: 'opacity 0.35s ease' });

const ASK = ['Which vector is redundant?', 'What is the span?', 'Start again'];

/** One example on its card: its picture, then on its button the redundant vector, then the span. */
function Card({ ex }) {
  const ref = useRef(null);
  const [s, setS] = useState(0);
  useFragmentSteps(ref, s);
  const { name, Pic, relation, span } = ex;
  return (
    <figure ref={ref}>
      <p className="l20-redund-title">{name}</p>
      <Pic at={1} width={360} height={214} />
      <figcaption>
        <span style={from(s, 1)}>
          <Tex tex={relation} />
        </span>
        <span className="l20-cap2" style={from(s, 2)}>
          <Tex tex={span} />
        </span>
      </figcaption>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setS((k) => (k + 1) % 3)}>
          {ASK[s]}
        </button>
      </div>
    </figure>
  );
}

/*
 * Examples of redundancies, without its title: two vectors, v₂ = −2v₁; three, v₃ = a v₁ + b v₂ in
 * their plane; v₁, v₂ and the zero vector. The 3-D pictures rock while the applet is on screen and
 * turn when dragged (not the two on a line). On the slide each card comes on a key press, then its
 * redundant vector turns amber with the relation, then the span that stays the same; here each card
 * has its own button for the two.
 */
export default function Redundancies() {
  return (
    <div className="l20-pair l20-redund">
      {REDUNDANCIES.map((ex) => (
        <Card key={ex.name} ex={ex} />
      ))}
    </div>
  );
}
