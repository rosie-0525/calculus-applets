import { useEffect, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import StretchHunt from '../components/StretchHunt.jsx';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { PRINT } from '../components/print.js';
import { A0, EIGS0, texMh, texVh } from '../components/eig.js';

export const [U, V] = EIGS0.map((e) => e.v);
export const E1 = [1, 0];
// x's start (the user's request: placed so that (1, 1) is found first): x = (1.2, 0.6), 18° below the
// diagonal, and Ax = (1.5, 1.2) between it and the diagonal, so that x turned towards Ax lands on (1, 1)
export const X0 = [1.2, 0.6];
export const SPOTS = [U, V, E1]; // x on the line of one of them pops up its check (the drag snaps onto them)
export const UNIT = 108;
// x a nonzero multiple of q (on its line: the applet lights the eigenlines up; (1, −1) itself is out of
// x's reach, its label would leave the picture)
export const at = (x, q) => Math.hypot(...x) > 1e-9 && Math.abs(x[0] * q[1] - x[1] * q[0]) < 1e-6;

/**
 * Eigenvectors and eigenvalues: Mark's definition, its second sentence (the eigenvalue) on key press 1;
 * 2: "E.g. A = [1 1/2; 1/2 1]", Stretch and shrink's A, in ink like the definition's (the user's
 * requests). Then the three checks, bullets (the user's request), each popping up when the presenter
 * drags x onto its vector's line in the applet (the user's request: not on a key press): (1, 1) is an
 * eigenvector because A(1, 1) = (3/2)(1, 1) (the user's words, no u, v); (1, −1), the same with 1/2;
 * e₁ = (1, 0) is not an eigenvector because Ae₁ is not a multiple of e₁. A check stays once found; they
 * all hide again before key press 2. Key press 3: the eigenvalue is 3/2 (the stretch), beside the first
 * check; 4: the eigenvalue is 1/2 (the shrink), beside the second; 5: a footnote under the picture:
 * eigen (German) = "own", "characteristic" (the user). The picture: Stretch and shrink's applet, which
 * glides in from Stretch and shrink (auto-animate, data-id stretch-applet).
 * Print (no dragging): the checks on key presses 2, 4 and 5, x on each vector.
 */
export default function Slide03Definition() {
  const [markers, on] = useMarkers([2]);
  const [x, setX] = useState(X0);
  const [found, setFound] = useState([false, false, false]);
  useEffect(() => {
    if (!on[0]) setFound([false, false, false]);
  }, [on[0]]);
  const drag = (q) => {
    setX(q);
    if (on[0]) setFound((f) => (f.some((b, i) => !b && at(q, SPOTS[i])) ? f.map((b, i) => b || at(q, SPOTS[i])) : f));
  };
  // a check: in print, a fragment on its key press; live, there once x has landed on its vector
  const check = (i, printAt, children) =>
    PRINT ? (
      <Fragment index={printAt} as="li" className="l24-def-row">
        {children}
      </Fragment>
    ) : (
      <li className={`l24-def-row l24-pop${found[i] ? ' on' : ''}`}>{children}</li>
    );
  return (
    <section data-auto-animate="">
      <h2>Eigenvectors and eigenvalues</h2>
      {markers}

      <div className="l24-def">
        <div className="l24-def-text">
          <div className="block definition">
            <p className="block-title">Definition</p>
            <p>
              An <strong>eigenvector</strong> <Tex tex={r`\vv v\in\mathbb R^n`} /> of the <Tex tex={r`n\times n`} /> matrix <Tex tex="A" /> is a nonzero vector which satisfies{' '}
              <Tex tex={r`A\vv v=\lambda\vv v`} /> for some scalar <Tex tex={r`\lambda`} />.
            </p>
            <Fragment index={1} as="p">
              The scalar <Tex tex={r`\lambda`} /> is the <strong>eigenvalue</strong> of <Tex tex="A" /> associated to <Tex tex={r`\vv v`} />.
            </Fragment>
          </div>

          <div className="l24-def-checks">
            <Fragment index={2} className="l24-def-a">
              E.g. <Tex tex={`A=${texMh(A0)}`} />
            </Fragment>
            <ul className="bullets l24-def-list">
              {check(
                0,
                2,
                <>
                  <span>
                    <Tex tex={texVh(U)} /> is an eigenvector because <Tex tex={`A${texVh(U)}=\\tfrac32${texVh(U)}`} />
                  </span>
                  <Fragment index={3} as="span" className="l24-amber">
                    the eigenvalue is <Tex tex={r`\tfrac32`} />
                  </Fragment>
                </>,
              )}
              {check(
                1,
                4,
                <>
                  <span>
                    <Tex tex={texVh(V)} /> is an eigenvector because <Tex tex={`A${texVh(V)}=\\tfrac12${texVh(V)}`} />
                  </span>
                  <Fragment index={4} as="span" className="l24-purple">
                    the eigenvalue is <Tex tex={r`\tfrac12`} />
                  </Fragment>
                </>,
              )}
              {check(
                2,
                5,
                <span>
                  <Tex tex={`\\vv e_1=${texVh(E1)}`} /> is not an eigenvector because <Tex tex={r`A\vv e_1`} /> is not a multiple of <Tex tex={r`\vv e_1`} />
                </span>,
              )}
            </ul>
          </div>
        </div>
        <div className="l24-def-pic" data-id="stretch-applet">
          {PRINT ? (
            <Stills stills={[{ node: <StretchHunt x={X0} unit={UNIT} /> }, ...SPOTS.map((q, i) => ({ at: [2, 4, 5][i], node: <StretchHunt x={q} unit={UNIT} /> }))]} />
          ) : (
            <StretchHunt x={x} onDrag={drag} unit={UNIT} />
          )}
          <Fragment index={5} as="p" className="footnote l24-def-eigen">
            <em>eigen</em> (German) = “own”, “characteristic”
          </Fragment>
        </div>
      </div>
    </section>
  );
}
