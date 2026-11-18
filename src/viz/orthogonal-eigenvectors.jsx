import { useRef, useState } from 'react';
import '../lectures/l25/styles/deck.css';
import useSwing from '../lectures/l25/components/useSwing.js';
import { Card, NONSYM, SYM } from '../lectures/l25/slides/Slide06Perp.jsx';

export const lecture = 25;

/*
 * Orthogonal eigenvectors, without its title, its two lines and the owl's note (the caption has
 * them): four cards, each the matrix over its two eigenvectors on their eigenlines (amber and purple)
 * and "symmetric" or "not symmetric" under it; on the left the two that are not symmetric, [3 1; 2 2]
 * (its eigenvectors at 108.4°) and [1 1; 0 2], on the right the symmetric [1 1/2; 1/2 1] and
 * [1 2; 2 −2]. In each picture T_A plays there and back on a loop while the applet is on screen
 * (the plane's grid moved by (1 − t)I + tA, each eigenvector stretching or flipping along its own
 * line). On the slide the cards come one key press at a time and the right-angle marks (and, where
 * the eigenvectors are not perpendicular, the arcs of their angles, red) on the last one, in all
 * four; here each card shows its mark once it is clicked (site.css hides it until then). In a narrow
 * box the two pairs are one under the other.
 */
export default function OrthogonalEigenvectors() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const t = useSwing(true, { ms: 2200, hold: 1500, delay: 900, live });
  const cards = [...NONSYM, ...SYM];
  const [checked, setChecked] = useState(() => cards.map(() => false));
  const check = (k) => setChecked((c) => c.map((v, i) => v || i === k));
  const card = (c, k) => (
    <div
      key={c.m}
      role="button"
      tabIndex={0}
      className={`oe-card${checked[k] ? ' oe-checked' : ''}`}
      aria-label={checked[k] ? 'Checked' : 'Are its eigenvectors perpendicular? Click to check'}
      onClick={() => check(k)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          check(k);
        }
      }}
    >
      <Card card={c} t={t} index={1} />
    </div>
  );
  return (
    <div className="oe" ref={ref}>
      <div className="l25-perp-pair oe-pair">{NONSYM.map((c, k) => card(c, k))}</div>
      <div className="l25-perp-pair oe-pair">{SYM.map((c, k) => card(c, NONSYM.length + k))}</div>
    </div>
  );
}
