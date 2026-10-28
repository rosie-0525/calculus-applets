import { useCallback, useEffect, useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import BirdIslands, { ISLANDS, Stills, idle, skipTo, fromAll, gather, toStart, allOn, allBirds, useBirds } from '../components/BirdIslands.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { ISLES, M_BIRDS } from '../components/markov.js';

// u's entries, each island's share of the 30,000 birds
export const U_TEX = [r`\dfrac27`, r`\dfrac27`, r`\dfrac37`];

/**
 * As on Bird distribution in the long run: the equilibrium vector u in the rules' corner, and under
 * each island's number its share of the 30,000 birds, u's entry.
 */
export function UOverlay() {
  return (
    <>
      <div className="l16-birds-rules l16-birds-u">
        <Tex tex={r`\mathbf u=\begin{bmatrix}\frac27\\[2pt] \frac27\\[2pt] \frac37\end{bmatrix}`} />
        <p>fractions of the birds on islands A, B, C</p>
      </div>
      {ISLANDS.map((I, i) => (
        <div key={I.name} className="l16-birds-share" style={{ left: I.label[0], top: I.label[1] + 34, color: ISLES[i].color }}>
          <Tex tex={`\\approx${U_TEX[i]}\\cdot30{,}000`} />
        </div>
      ))}
    </>
  );
}

/**
 * Independence of the initial distribution (the user's request, in place of Christine's true or
 * false poll), after the birds settle at u on the slide before: said first, u does not depend on
 * where the birds start; then Example 1's birds, as on the opener's second slide, at 60%: key press
 * 1, all 30,000 birds fly to island A and the years run from there; 2, u and the islands' shares,
 * as on Bird distribution in the long run, and the birds stop (the user's request); 3, the same
 * from island C (a click on an island starts them all there); 4, u and the shares again, the birds
 * stopped; 5-7, the statement, p_k = M^k p_0 → u for any initial probability vector p_0: its "Suppose"; its "Then", to "we have"; p_k = M^k p_0 → u, displayed (its reasoning
 * removed, the user's request). In print mode: year 0, then year 20 of each run.
 */
export default function Slide11PollLimit() {
  const m1 = useRef(null);
  const m2 = useRef(null);
  const m3 = useRef(null);
  const m4 = useRef(null);
  const s1 = useFragmentShown(m1);
  const s2 = useFragmentShown(m2);
  const s3 = useFragmentShown(m3);
  const s4 = useFragmentShown(m4);
  // the clock stops (as in print mode) while u is shown
  const [st, setSt] = useBirds(m1, () => idle(M_BIRDS), PRINT || (s2 && !s3) || s4);
  const clicks = useRef(0);

  // key press 1: all the birds to island A, then the years; 2: they stop; 3: all the birds to
  // island C, then the years; 4: they stop; else 10,000 on each, the years stopped. A stop with no
  // year of its run gone by (back from key press 3, or the slide entered from the next one) shows
  // that run in year 20.
  useEffect(() => {
    if (PRINT) return;
    const running = (s, i) => s.start === i && s.phase !== 'gather' && s.k > 0;
    const settled = (s, i, seed) => ({ ...skipTo(fromAll(M_BIRDS, i, seed), 20), clock: s.clock, start: i });
    if (s4) setSt((s) => (running(s, 2) ? s : settled(s, 2, 3)));
    else if (s3) setSt((s) => (s.start === 2 ? s : gather(s, allOn(2), allBirds(2), { start: 2, run: true, seed: 3 })));
    else if (s2) setSt((s) => (running(s, 0) ? s : settled(s, 0, 2)));
    else if (s1) setSt((s) => (s.start === 0 ? s : gather(s, allOn(0), allBirds(0), { start: 0, run: true, seed: 2 })));
    else setSt((s) => toStart(s, false));
  }, [s1, s2, s3, s4, setSt]);

  const onIsland = useCallback(
    (i) => {
      clicks.current += 1;
      setSt((s) => gather(s, allOn(i), allBirds(i), { start: i, run: true, seed: 10 + clicks.current }));
    },
    [setSt],
  );
  const start = PRINT || st.start == null ? 2 : st.start;
  const a20 = skipTo(fromAll(M_BIRDS, 0, 2), 20);
  const c20 = skipTo(fromAll(M_BIRDS, 2, 3), 20);

  return (
    <section className="dense">
      <h2>Independence of the initial distribution</h2>
      <span ref={m1} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <span ref={m2} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />
      <span ref={m3} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <span ref={m4} className="fragment fx-marker" data-fragment-index={4} aria-hidden="true" />

      <div className="l16-indep">
        <div className="l16-indep-birds">
          <div className="l16-birds-frame">
            {PRINT ? <Stills stills={[idle(M_BIRDS), a20, a20, c20]} /> : <BirdIslands st={st} onIsland={onIsland} />}
            <Fragment index={2}>
              <Fragment index={3} effect="fade-out">
                <UOverlay />
              </Fragment>
            </Fragment>
            <Fragment index={4}>
              <UOverlay />
            </Fragment>
          </div>
        </div>
        <div className="l16-indep-starts">
          <p className="l16-indep-says">
            <Tex tex={r`\mathbf u`} /> does not depend on the initial distribution of the birds.
          </p>
          <Fragment index={1} as="p">
            Start with all 30,000 birds on island A.
          </Fragment>
          <Fragment index={3} as="p">
            Start again, with all 30,000 birds on <span className="nowrap">island {ISLANDS[start].name}.</span>
          </Fragment>
        </div>
      </div>

      <Fragment index={5} className="block theorem l16-limit-box">
        <p>
          Suppose <Tex tex="M" /> is a Markov matrix with <Tex tex={r`\lim_{k\to\infty}M^k=\begin{bmatrix}\mathbf u&\mathbf u&\cdots&\mathbf u\end{bmatrix}`} />.
          <br />
          <Fragment index={6} as="span">
            Then for any initial probability vector <Tex tex={r`\mathbf p_0`} />, we have
          </Fragment>
        </p>
        <Fragment index={7}>
          <Tex display tex={r`\mathbf p_k=M^k\mathbf p_0\to\mathbf u\quad\text{as }k\to\infty.`} />
        </Fragment>
      </Fragment>
    </section>
  );
}
