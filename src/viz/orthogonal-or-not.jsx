import { useRef, useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex from '../lectures/l21/components/Tex.jsx';
import Plane, { Dot } from '../lectures/l21/components/Plane.jsx';
import { FImage, GridImage } from '../lectures/l21/components/FShape.jsx';
import useSwing from '../lectures/l21/components/useSwing.js';
import { INK, GRAY, GREEN, RED } from '../lectures/l21/components/tr.js';
import { EXAMPLES, XR, YR, UNIT, Cube3 } from '../lectures/l21/slides/Slide18bOrthOrNot.jsx';

export const lecture = 21;

/**
 * One example on its card: its matrix, and its picture, F (or, for the 3 × 3 ones, e₁, e₂, e₃ and the
 * unit cube) at home. Clicked, its verdict, Orthogonal (green) or Not orthogonal (red), and the
 * picture moving to the image and back on a loop, in the verdict's colour, as the slide replays them
 * all at the end; the next click hides them.
 */
function OrthCard({ ex, live }) {
  const [on, setOn] = useState(false);
  const t = useSwing(on, { ms: 1500, hold: 1100, delay: 300, live });
  const color = on ? (ex.ok ? GREEN : RED) : GRAY;
  const title = on ? `What ${ex.opt} does: ${ex.what}` : `${ex.opt}: orthogonal or not?`;
  return (
    <div className="l21-oq-card">
      <button type="button" className="inv-pick oq-pick" aria-pressed={on} aria-label={`${ex.opt} orthogonal or not?`} onClick={() => setOn((v) => !v)}>
        <div className="l21-oq-top">
          <p className="l21-oq-mat">
            <span className="l21-oq-opt">{ex.opt}</span> <Tex tex={ex.tex} />
          </p>
          <p className={`l21-oq-answer ${!on ? 'oq-ask' : ex.ok ? 'l21-oq-yes' : 'l21-oq-no'}`}>{!on ? 'Orthogonal?' : ex.ok ? 'Orthogonal' : 'Not orthogonal'}</p>
        </div>
        <div className="l21-oq-fig">
          {ex.space ? (
            <Cube3 tips={ex.space(t)} color={color} center={ex.center} title={title} />
          ) : (
            <Plane xRange={XR} yRange={YR} unit={UNIT} pad={4} grid={false} axes={false} title={title}>
              {(p) => (
                <g>
                  <GridImage p={p} n={4} />
                  <FImage p={p} home />
                  {on && <FImage p={p} M={ex.at(t)} color={color} opacity={0.9} />}
                  <Dot p={p} at={[0, 0]} color={INK} r={3} />
                </g>
              )}
            </Plane>
          )}
        </div>
      </button>
    </div>
  );
}

/*
 * Orthogonal or not?, without its title: eight cards, 2 × 4, each its matrix and its picture: a) a
 * shear; b) orthogonal columns of length √2; c) b) divided by √2, the rotation by 45°; d) the
 * reflection across the y-axis; e) the projection onto the line through (2, 1); f) a reflection;
 * g) a permutation matrix, the unit cube turning onto itself; h) a 3 × 3 whose columns have length √2
 * at 60° to each other, the cube stretched. On the slide each card's verdict and picture come on its
 * key press, and a last one replays them all on a loop; here a card shows its verdict when it is
 * clicked, and its picture loops (while the applet is on screen).
 */
export default function OrthogonalOrNot() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  return (
    <div className="l21-oq-grid" ref={ref}>
      {EXAMPLES.map((ex) => (
        <OrthCard key={ex.opt} ex={ex} live={live} />
      ))}
    </div>
  );
}
