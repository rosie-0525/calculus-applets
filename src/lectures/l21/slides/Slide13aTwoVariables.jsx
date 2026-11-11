import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';

export const R = [-1.4, 1.4];
export const Z = 0.42;
export const GRAPHS = [
  { tag: 'local minimum', c: 0.82, f: (x, y) => x * x + y * y, q: r`x^2+y^2`, M: r`\begin{bmatrix}1&0\\0&1\end{bmatrix}` },
  { tag: 'local maximum', c: 0.18, f: (x, y) => -x * x - y * y, q: r`-x^2-y^2`, M: r`\begin{bmatrix}-1&0\\0&-1\end{bmatrix}` },
  { tag: 'saddle', c: 0.5, f: (x, y) => x * x - y * y, q: r`x^2-y^2`, M: r`\begin{bmatrix}1&0\\0&-1\end{bmatrix}` },
];

/**
 * Quadratic forms in two variables (the user's request: the examples of Quadratic forms moved to a
 * slide of their own, after it). The three examples of Graphs of quadratic forms (that slide commented
 * out; a preview of the second derivative test, Chapter 26; Section 20.3), each on one key press, all of
 * it at once (the user's request): its matrix M, q_M(x, y) = its form, its graph and, under it, its
 * tag: I₂, x² + y² (a bowl, local minimum at 0); −I₂, −x² − y² (local maximum); diag(1, −1), x² − y²
 * (saddle); no "e.g." (the user's request); 4: the forward reference. Quadratic forms in more
 * variables comes next (More examples of quadratic forms, with the 2 × 2 dictionary and the applet,
 * was dropped at the user's request).
 */
export default function Slide13aTwoVariables() {
  return (
    <section>
      <h2>Quadratic forms in two variables</h2>

      <div className="l21-qf-examples">
        <div className="l21-graphs">
          {GRAPHS.map((g, k) => (
            <Fragment key={g.tag} index={k + 1} className="l21-graph">
              <p className="l21-graph-m">
                <Tex tex={r`M=${g.M}`} />
              </p>
              <p className="l21-graph-q">
                <Tex tex={r`q_M(x,y)=${g.q}`} />
              </p>
              <div className="l21-graph-pic">
                <Space width={330} height={165} unit={52} center={[0.5, g.c]} el={22} axes={false} rock={false} title={`The graph of ${g.q}`}>
                  {(s) => <Surface s={s} f={g.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />}
                </Space>
                <p className="l21-graph-tag">{g.tag}</p>
              </div>
            </Fragment>
          ))}
        </div>

        <Fragment index={4} as="p" className="pointer right l21-tv-pointer">
          → Chapter 26: the second derivative test
        </Fragment>
      </div>
    </section>
  );
}
