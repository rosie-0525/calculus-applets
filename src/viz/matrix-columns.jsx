import '../lectures/l13/styles/deck.css';
import Tex, { r } from '../lectures/l13/components/Tex.jsx';
import GridMap, { AMBER } from '../lectures/l13/components/GridMap.jsx';

export const lecture = 13;

/*
 * The columns of A's example with every step showing, without the theorem and its why (the caption
 * says them): the linear map with matrix [3 3/2; 1 2] and f(e₁), f(e₂), its columns, in amber,
 * beside the textbook's Figure 13.4.1, the unit square and the grid through it stretching onto the
 * parallelogram of f(e₁) and f(e₂), again 5 s after each landing while the applet is on screen.
 */
export default function MatrixColumns() {
  return (
    <div className="stage l13-cols-stage">
      <div className="stage-text">
        <p className="l13-eg">
          For the linear map <Tex tex={r`f(\vv x)=\begin{bmatrix}3&\frac32\\ 1&2\end{bmatrix}\vv x`} />,
          <span className="l13-eg-next">
            <Tex tex={r`\textcolor{${AMBER}}{f(\vv e_1)=\begin{bmatrix}3\\ 1\end{bmatrix}},\ \textcolor{${AMBER}}{f(\vv e_2)=\begin{bmatrix}\frac32\\ 2\end{bmatrix}}`} />
          </span>
        </p>
      </div>

      <div className="stage-fig">
        <GridMap imageIndex={0} unit={46} morph repeat={5000} tint={AMBER} />
      </div>
    </div>
  );
}
