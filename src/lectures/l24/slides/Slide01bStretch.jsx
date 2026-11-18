import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane from '../components/Plane.jsx';
import StretchHunt, { FLayer, XR, YR } from '../components/StretchHunt.jsx';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { A0 as A, BLUE, col, texMh } from '../components/eig.js';

export const UNIT = 130;

/**
 * Stretch and shrink: the motivation for eigenvectors and eigenvalues, on A = [1 1/2; 1/2 1] (the
 * picture: StretchHunt.jsx, shared with the next two slides). Key press
 * 1: T_A moves the unit square and F (the picture the students know): it stretches along y = x and
 * shrinks along y = −x. 2: the owl asks how much it is stretching/shrinking, and in what
 * directions (the user's words, one question). 3: the x and Ax picture (x to drag, Ax, the line of x) on top of the
 * moved square and F, which fade back; the line lights up, and Ax reads Ax = (3/2)x or Ax = (1/2)x, when x
 * is on a diagonal.
 * Print: the square and F, then the moved square and F with x and Ax. The picture glides onto the next
 * slide, Eigenvectors and eigenvalues (auto-animate, data-id stretch-applet; the user's request).
 */
export default function Slide01bStretch() {
  const [markers, on] = useMarkers([1]);
  const t = useTween(on[0], { ms: 2400, delay: 300 });
  const [x, setX] = useState([1.5, -0.5]);
  const hunt = (s) => <StretchHunt x={x} onDrag={setX} t={s} fade={3} index={{ x: 3, ax: 3, line: 3 }} unit={UNIT} />;
  return (
    <section data-auto-animate="">
      <h2>Stretch and shrink</h2>

      <div className="l24-hunt">
        <div className="l24-hunt-text">
          <p>
            <Tex tex={`${col(BLUE, 'A')}=${texMh(A)}`} />
          </p>
          <Fragment index={2} as="p" className="question l24-hunt-q">
            How much is <Tex tex={r`T_A`} /> stretching/shrinking,
            <br />
            and in what directions?
          </Fragment>
        </div>
        <div className="l24-hunt-pic" data-id="stretch-applet">
          {markers}
          {PRINT ? (
            <Stills
              stills={[
                {
                  node: (
                    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={8} grid={false} axes={false} title="The unit square and F">
                      {(p) => <FLayer p={p} t={0} />}
                    </Plane>
                  ),
                },
                { at: 1, node: hunt(1) },
              ]}
            />
          ) : (
            hunt(t)
          )}
        </div>
      </div>
    </section>
  );
}
