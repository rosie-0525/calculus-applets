import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';

// DefCards' graphs (Lecture 21's: x, y in [−1.4, 1.4], el 22, Classifying critical points' size), each
// with its critical point 0; a lower zScale than DefCards' 0.42, as y⁴ reaches 3.8 at the corners
export const R = [-1.4, 1.4];
export const Z = 0.3;

// three functions whose Hessian at 0 has the eigenvalue 0 (the test is inconclusive), and 0 is a local
// minimum, a local maximum, a saddle point: the first and the last have the same Hessian there
export const CASES = [
  { kind: 'local minimum', name: 'x² + y⁴', f: (x, y) => x * x + y ** 4, q: r`x^2+y^4`, h: r`\begin{bmatrix}2&0\\0&0\end{bmatrix}`, c: 0.78 },
  { kind: 'local maximum', name: '−x² − y⁴', f: (x, y) => -x * x - y ** 4, q: r`-x^2-y^4`, h: r`\begin{bmatrix}-2&0\\0&0\end{bmatrix}`, c: 0.22 },
  { kind: 'saddle point', name: 'x² − y⁴', f: (x, y) => x * x - y ** 4, q: r`x^2-y^4`, h: r`\begin{bmatrix}2&0\\0&0\end{bmatrix}`, c: 0.5 },
];

/**
 * When the test is inconclusive (the user's request: the remark of Second derivative test's last key
 * press, with plots): Classifying critical points' columns (DefCards.jsx's classes), three graphs with
 * their critical point 0, a dot, each with its formula and its Hessian at 0 under it, on arrival:
 * x² + y⁴, −x² − y⁴, x² − y⁴, with (Hf)(0) = [2 0; 0 0], [−2 0; 0 0], [2 0; 0 0], each with the
 * eigenvalue 0. Key presses 1–3: over each graph, what 0 is, a local minimum, a local maximum, a saddle
 * point (along the y-axis, y⁴ or −y⁴ decides, which the quadratic approximation cannot see).
 */
export default function Slide06gInconclusive() {
  return (
    <section>
      <h2>When the test is inconclusive</h2>

      <div className="l25-defs l26-defs-goal l26-inc">
        {CASES.map((c, k) => (
          <div key={c.name} className="l25-def">
            <Fragment index={k + 1} as="p" className="l25-def-clause">
              <strong>{c.kind}</strong>
            </Fragment>
            <div className="l25-def-pic">
              <Space width={390} height={248} unit={78} center={[0.5, c.c]} el={22} axes={false} rock={false} title={`The graph of ${c.name}`}>
                {(s) => (
                  <g>
                    <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
                    <Dot3 s={s} at={[0, 0, 0]} color="#14213d" r={5.5} stroke="#fff" strokeWidth="1.5" />
                  </g>
                )}
              </Space>
              <p className="l25-def-q">
                <Tex tex={`f(x,y)=${c.q}`} />
              </p>
              <p className="l25-def-q">
                <Tex tex={r`(Hf)(\vv 0)=${c.h}`} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
