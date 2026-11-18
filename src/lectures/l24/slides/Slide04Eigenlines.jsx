import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import StretchHunt from '../components/StretchHunt.jsx';
import { useMarkers } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const UNIT = 120;

/** Stretch and shrink's applet (the user's request), the square and F faded back: x to drag; on key
 *  press `at` the two eigenlines, u's amber and v's purple; on `play`, T_A again (the user's request):
 *  x and Ax fade out, and the square and F go back where they start and are moved by A, with u and v
 *  (an amber and a purple arrow, in place of dots on the lines: the user) moving with them, u
 *  stretched by 3/2, v shrunk by 1/2. Print: where T_A puts them. */
export function Picture({ at, play }) {
  const [x, setX] = useState([1.5, -0.5]);
  const [markers, on] = useMarkers([play]);
  const tw = useTween(on[0], { ms: 2800, delay: 600 });
  const t = PRINT || !on[0] ? 1 : tw;
  return (
    <>
      {markers}
      <StretchHunt x={x} onDrag={setX} index={{ gone: play }} lines={at} arrows={play} t={t} unit={UNIT} title="x, to drag, and Ax, and the eigenlines of A = [1 1/2; 1/2 1], on top of the unit square and F moved by A" />
    </>
  );
}

/**
 * Eigenlines (the textbook's (23.1.1), Definition 23.1.3 and Figure 23.1.1), for Stretch and shrink's
 * A = [1 1/2; 1/2 1], on its applet (the user's requests).
 * Key press 1: every nonzero multiple of an eigenvector is an eigenvector with the same eigenvalue; 2: why, if Av = λv, then A(cv) = c(Av) = c(λv) = λ(cv) (the user's words), after a green Why?, no box (the
 * user's requests: the derivation after the box, in plain text); 3: the definition of an eigenline, and the two lines, amber
 * and purple; 4: on an eigenline, T_A multiplies by λ; 5: x and Ax fade out and T_A plays again, u and
 * v (amber and purple arrows) moving with it (the user's requests).
 */
export default function Slide04Eigenlines() {
  return (
    <section>
      <h2>Eigenlines</h2>

      <div className="l24-lines">
        <div className="l24-lines-text">
          <Fragment index={1} className="block theorem">
            <p>Every nonzero scalar multiple of an eigenvector is an eigenvector, with the same eigenvalue.</p>
          </Fragment>
          <Fragment index={2} as="p" className="l24-lines-why">
            <span className="l24-why">Why?</span> If <Tex tex={r`A\vv v=\lambda\vv v`} />, then <Tex tex={r`A(c\vv v)=c(A\vv v)=c(\lambda\vv v)=\lambda(c\vv v)`} />
          </Fragment>
          <Fragment index={3} className="block definition">
            <p className="block-title">Definition</p>
            <p>
              The line <Tex tex={r`\operatorname{span}\{\vv v\}`} /> of an eigenvector <Tex tex={r`\vv v`} /> of <Tex tex="A" /> is an <strong>eigenline</strong> of{' '}
              <Tex tex="A" />.
            </p>
          </Fragment>
          <Fragment index={4} as="p" className="l24-lines-last">
            On an eigenline, <Tex tex="T_A" /> multiplies by <Tex tex={r`\lambda`} />.
          </Fragment>
        </div>
        <div className="l24-lines-pic">
          <Picture at={3} play={5} />
        </div>
      </div>
    </section>
  );
}
