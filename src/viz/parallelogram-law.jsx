import { useEffect, useState } from 'react';
import '../lectures/l1/styles/deck.css';
import Tex, { r } from '../lectures/l1/components/Tex.jsx';
import { SameStartFigure, TipToTailFigure } from '../lectures/l1/slides/Slide13ParallelogramLaw.jsx';

export const lecture = 1;

/*
 * The slide's two pictures of v + w. On the slide two invisible fragments step the right one: w
 * slides up to start where v ends, then v + w redraws from tail to head (deck.css, "Slide 13").
 * The page shows every fragment at once, so here a timer steps it, over and over, through the
 * same markers without the class `fragment`.
 */

// how long each step shows, in ms: w slides home (1.2 s), w slides up (1.2 s), v + w redraws (1.4 s)
const HOLD = [2000, 2000, 3500];
// without motion, the last step stays: w starts where v ends
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ParallelogramLaw() {
  const [step, setStep] = useState(() => (still() ? 2 : 0));
  useEffect(() => {
    if (still()) return undefined;
    const timer = setTimeout(() => setStep((step + 1) % HOLD.length), HOLD[step]);
    return () => clearTimeout(timer);
  }, [step]);
  const marker = (id, on) => <span className={on ? 'fx-marker visible' : 'fx-marker'} data-fx={id} aria-hidden="true" />;

  return (
    <div>
      <div className="pictures-pair">
        <figure>
          <SameStartFigure />
        </figure>
        <figure className="tip-to-tail">
          {marker('tt-slide', step >= 1)}
          {marker('tt-redraw', step >= 2)}
          <div className="fx-host">
            <TipToTailFigure />
          </div>
        </figure>
      </div>

      <p className="compact parallelogram-statement">
        <Tex tex={r`\vv{v}+\vv{w}`} /> is the <strong>diagonal of the parallelogram</strong> spanned by{' '}
        <Tex tex={r`\vv{v}`} /> and <Tex tex={r`\vv{w}`} />.
      </p>
    </div>
  );
}
