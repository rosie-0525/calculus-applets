import { useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import StretchHunt from '../lectures/l24/components/StretchHunt.jsx';
import { A0, texMh, texVh } from '../lectures/l24/components/eig.js';
import { U, V, E1, X0, SPOTS, UNIT, at } from '../lectures/l24/slides/Slide03Definition.jsx';

export const lecture = 24;

const NONE = [false, false, false];

/*
 * Eigenvectors and eigenvalues, without its title, its definition and the footnote on "eigen" (the
 * caption has them): "E.g. A = [1 1/2; 1/2 1]" and the three checks, bullets, beside Stretch and
 * shrink's applet (StretchHunt.jsx: x, dragged from anywhere on the picture, and Ax; the line of x
 * lights up when Ax is on it). Each check pops up, and stays, once x has been dragged onto its
 * vector's line: (1, 1) is an eigenvector because A(1, 1) = (3/2)(1, 1), the eigenvalue is 3/2; the
 * same for (1, −1), 1/2; e₁ is not an eigenvector. On the slide the checks pop up the same way once
 * key press 2 is reached (hidden until then), and each eigenvalue comes on a key press of its own;
 * here each check's place asks its question in gray until it is found, the eigenvalue comes with the
 * check, and Start again puts the questions back.
 */
export default function EigenvectorDefinition() {
  const [x, setX] = useState(X0);
  const [found, setFound] = useState(NONE);
  const drag = (q) => {
    setX(q);
    setFound((f) => (f.some((b, i) => !b && at(q, SPOTS[i])) ? f.map((b, i) => b || at(q, SPOTS[i])) : f));
  };
  // a check, there (keeping its place) once x has landed on its vector's line; until then, over it, the
  // question it answers, in gray
  const check = (i, vec, children) => (
    <li className="l24-def-row">
      <span className={`evd-check${found[i] ? '' : ' evd-hide'}`}>{children}</span>
      {!found[i] && (
        <span className="inv-ask">
          <Tex tex={vec} /> an eigenvector?
        </span>
      )}
    </li>
  );
  return (
    <div className="viz-col evd">
      <div className="l24-def evd-row">
        <div className="l24-def-checks evd-checks">
          <p className="l24-def-a">
            E.g. <Tex tex={`A=${texMh(A0)}`} />
          </p>
          <ul className="bullets l24-def-list">
            {check(
              0,
              texVh(U),
              <>
                <span>
                  <Tex tex={texVh(U)} /> is an eigenvector because <Tex tex={`A${texVh(U)}=\\tfrac32${texVh(U)}`} />
                </span>
                <span className="l24-amber">
                  the eigenvalue is <Tex tex={r`\tfrac32`} />
                </span>
              </>,
            )}
            {check(
              1,
              texVh(V),
              <>
                <span>
                  <Tex tex={texVh(V)} /> is an eigenvector because <Tex tex={`A${texVh(V)}=\\tfrac12${texVh(V)}`} />
                </span>
                <span className="l24-purple">
                  the eigenvalue is <Tex tex={r`\tfrac12`} />
                </span>
              </>,
            )}
            {check(
              2,
              `\\vv e_1=${texVh(E1)}`,
              <span>
                <Tex tex={`\\vv e_1=${texVh(E1)}`} /> is not an eigenvector because <Tex tex={r`A\vv e_1`} /> is not a multiple of <Tex tex={r`\vv e_1`} />
              </span>,
            )}
          </ul>
        </div>
        <div className="l24-def-pic">
          <StretchHunt x={x} onDrag={drag} unit={UNIT} />
        </div>
      </div>
      <div className="viz-toggle">
        <button
          type="button"
          className="viz-button"
          disabled={!found.some(Boolean)}
          onClick={() => {
            setFound(NONE);
            setX(X0);
          }}
        >
          Start again
        </button>
      </div>
    </div>
  );
}
