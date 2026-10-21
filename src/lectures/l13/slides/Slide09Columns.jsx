import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import GridMap, { AMBER } from '../components/GridMap.jsx';
import Notes from '../components/Notes.jsx';

export const COL = '#0e7490';

/**
 * The columns of A: Mark's "Moreover" (the second sentence of his theorem, here on its own after
 * Example 3, which asks what one notices); key press 1: Why? Aeⱼ = 0c₁ + ⋯ + 1cⱼ + ⋯ + 0cₙ = cⱼ
 * (the columns of Matrix-vector product); 2: the textbook's Example 13.4.6, A = [3 3/2; 1 2], and
 * its Figure 13.4.1, the square grid with e₁ and e₂; 3: its image under f, with f(e₁) and f(e₂),
 * the columns of A, in amber (on a line of their own), the unit square stretching onto the
 * parallelogram (GridMap's `morph`), again and again, 5 s apart (`repeat`). (A = [f(e₁) ⋯ f(eₙ)] was removed at the user's request.) The theorem spans the slide; the why, A
 * and the example beside the picture.
 */
export default function Slide09Columns() {
  return (
    <section className="dense">
      <h2>
        The columns of <Tex tex="A" />
      </h2>

      <div className="block theorem">
        <p className="block-title">Theorem</p>
        <p>
          If <Tex tex={r`f(\vv x)=A\vv x`} />, then the columns of <Tex tex="A" /> are <Tex tex={r`f(\vv e_1),\ldots,f(\vv e_n)`} />,
          where <Tex tex={r`\vv e_i`} /> is the <Tex tex="i" />
          -th standard basis vector of <Tex tex={r`\mathbb R^n`} />.
        </p>
      </div>

      <div className="stage">
        <div className="stage-text">
          <Fragment index={1} className="block why">
            <p className="block-title">Why?</p>
            <Tex display tex={r`A\vv e_j=0\textcolor{${COL}}{\vv c_1}+\cdots+1\textcolor{${COL}}{\vv c_j}+\cdots+0\textcolor{${COL}}{\vv c_n}=\textcolor{${COL}}{\vv c_j}`} />
          </Fragment>

          <Fragment index={2} as="p" className="l13-eg">
            e.g. For the linear map <Tex tex={r`f(\vv x)=\begin{bmatrix}3&\frac32\\ 1&2\end{bmatrix}\vv x`} />,
            <Fragment index={3} as="span" className="l13-eg-next">
              <Tex tex={r`\textcolor{${AMBER}}{f(\vv e_1)=\begin{bmatrix}3\\ 1\end{bmatrix}},\ \textcolor{${AMBER}}{f(\vv e_2)=\begin{bmatrix}\frac32\\ 2\end{bmatrix}}`} />
            </Fragment>
          </Fragment>
        </div>

        <Fragment index={2} className="stage-fig">
          <GridMap imageIndex={3} unit={46} morph repeat={5000} tint={AMBER} />
        </Fragment>
      </div>

      <Notes time="2:00 · running total 27:00">
        <p>
          The columns of A are f(e₁), …, f(eₙ): the j-th column is what f does to eⱼ.
        </p>
        <p>
          <em>[Key press]</em> Why? By columns, Aeⱼ = 0·c₁ + ⋯ + 1·cⱼ + ⋯ + 0·cₙ = cⱼ. So a linear function is fixed by
          what it does to e₁, …, eₙ: f(x) = x₁f(e₁) + ⋯ + xₙf(eₙ).
        </p>
        <p>
          <em>[Key press]</em> The title's picture: the map with matrix [3 3/2; 1 2], and the square grid with e₁ and
          e₂.
        </p>
        <p>
          <em>[Key press]</em> f sends e₁ to (3, 1), the first column, and e₂ to (3/2, 2), the second. The unit square
          stretches onto the parallelogram of f(e₁) and f(e₂), and the whole grid with it: the two columns fix the
          picture. So you can read A off the picture of f, and draw f from A.
        </p>
      </Notes>
    </section>
  );
}
