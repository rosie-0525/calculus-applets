import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import ProjPlane from '../components/ProjPlane.jsx';
import ObserveOwl from '../components/ObserveOwl.jsx';
import { AMBER, PURPLE, col } from '../components/eig.js';

export const a = col(AMBER, r`\begin{bmatrix}2\\-1\\0\end{bmatrix}`);
export const b = col(AMBER, r`\begin{bmatrix}3\\0\\-1\end{bmatrix}`);
export const n = col(PURPLE, r`\begin{bmatrix}1\\2\\3\end{bmatrix}`);

/**
 * The linear transformation T_B (the user's title; was What B does) (after Example 2; Mark's questions: what kind of linear transformation is B, and how do
 * the eigenvectors determine lines or planes which B preserves?). The plane P: x + 2y + 3z = 0 is
 * there on arrival. Key press 1: (1, 2, 3) is an eigenvector with eigenvalue 0, n shrinking into 0;
 * 2: (2, −1, 0) and (3, 0, −1) are eigenvectors with eigenvalue 1, the two vectors in P (first n, then
 * them, the user's request); 3: Observation (after an owl, the user's pick, that hops in, blinks
 * and sparkles): every linear combination of them is an eigenvector with eigenvalue 1 (P and the line of n
 * light up); 4: ⟹ T_B is the projection to the plane spanned by them, P, a
 * vector x dropping onto it (the user's words, all four, and the order). (Mark's remark, a gray Note
 * under the picture, 0 can be an eigenvalue but the zero vector can not be an eigenvector, removed by
 * the user.)
 */
export default function Slide09WhatBDoes() {
  return (
    <section>
      <h2>
        The linear transformation <Tex tex="T_B" />
      </h2>

      <div className="l24-proj">
        <div className="l24-proj-text">
          <Fragment index={1} as="p">
            <Tex tex={n} /> is an eigenvector with eigenvalue 0
          </Fragment>
          <Fragment index={2} as="p">
            <Tex tex={a} /> and <Tex tex={b} /> are eigenvectors with eigenvalue 1
          </Fragment>
          <Fragment index={3} as="p" className="l24-observe">
            <ObserveOwl />
            <span className="l24-observe-label">Observation:</span> Every linear combination of <Tex tex={a} /> and <Tex tex={b} /> is an eigenvector with eigenvalue 1
          </Fragment>
          <Fragment index={4} as="p">
            <Tex tex={r`\Longrightarrow`} /> <Tex tex="T_B" /> is the projection to the plane spanned by <Tex tex={a} /> and <Tex tex={b} />
          </Fragment>
        </div>
        <div className="l24-proj-pic">
          <ProjPlane at={{ n: 1, ab: 2, all: 3, x: 4 }} />
        </div>
      </div>
    </section>
  );
}
