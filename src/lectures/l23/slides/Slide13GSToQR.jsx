import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import TexMorph, { mk, mkGrow } from '../components/TexMorph.jsx';
import { GREEN, AMBER, RED, col } from '../components/lu.js';

export const w = (i) => col(GREEN, r`\vv w_${i}'`);
// the orthogonal vectors wᵢ green too, like the wᵢ′, but not the wᵢ in the coefficients (the fractions,
// the norms), which stay ink (the user's requests)
export const g = (i) => col(GREEN, r`\vv w_${i}`);
export const rr = (ij) => col(AMBER, `r_{${ij}}`);

/*
 * The derivation, one TeX per step, every piece keyed (mk) so that it glides to its new place:
 * wᵢ, then wᵢ′ (key wi); the norms (ni in front of wᵢ′, nij in front of wⱼ′ in vᵢ's row); vᵢ (vi); the
 * signs (sij: minus, pij: plus); the coefficients (cij: fractions); the vectors they multiply (uij);
 * the braces (bij); the r's (rij: the label under each brace, then the coefficient in its place).
 */
export const N = (i) => r`\norm{\vv w_${i}}`;
// the norm in red when it first comes in, all of it (its wᵢ too)
export const Nred = (i) => col(RED, r`\norm{\vv w_${i}}`);
export const v = (i) => mk(`v${i}`, r`\vv v_${i}`);
export const wv = (i) => mk(`w${i}`, g(i));
// The = signs fade out and in again when the sides swap (they would glide under vᵢ): keys ei, then fi.
export const eq = (i, swapped) => mk(`${swapped ? 'f' : 'e'}${i}`, '=');
export const FR = (i, j) => r`\frac{\vv v_${i}\cdot\vv w_${j}}{\vv w_${j}\cdot\vv w_${j}}`;
export const coefF = (i, j) => mk(`c${i}${j}`, FR(i, j));
export const frac = (i, j) => coefF(i, j) + r`\,` + mk(`u${i}${j}`, g(j));
// Normalizing: each wⱼ becomes ‖wⱼ‖ wⱼ′, the norm inserted in front of the vector, red as it comes in;
// the fraction stays (the user's request: insert ‖wⱼ‖ everywhere rather than swap pieces out)
export const scaled = (i, j, c) =>
  coefF(i, j) + r`\,` + mk(`n${i}${j}`, c ? Nred(j) : N(j)) + r`\,` + mk(`u${i}${j}`, w(j));
// the brace under a coefficient of vᵢ's row, the fraction times ‖wⱼ‖: r_ji
export const rBrace = (i, j) => brace(`b${j}${i}`, FR(i, j) + r`\,` + N(j), `${j}${i}`);
export const minus = (i, j) => mk(`s${i}${j}`, '-');
export const plus = (i, j, c) => mk(`p${i}${j}`, c ? col(RED, '+') : '+');
export const diag = (i, c) => mk(`n${i}`, c ? Nred(i) : N(i)) + r`\,` + mk(`w${i}`, w(i));
// The brace and its label r_ij keyed apart, so that on the next key press the label glides up into the
// coefficient's place while the brace fades: the brace, with room for the label, and over it the label
// under a transparent copy of the brace.
export const rc = (ij) => mkGrow(`r${ij}`, rr(ij));
export const brace = (id, tex, ij) =>
  r`\mathrlap{${mk(id, r`\underbrace{\phantom{${tex}}}_{\phantom{${rr(ij)}}}`)}}` +
  r`\mathrlap{\textcolor{transparent}{\underbrace{\phantom{${tex}}}_{${rc(ij)}}}}`;
// Rows further apart while the fractions are there, so that wᵢ can arc over them to the right end.
export const aligned = (rows, gap = 6) => r`\begin{aligned}${rows.join(r`\\[${gap}pt]`)}\end{aligned}`;

export const STEPS = [
  // Gram–Schmidt in full
  aligned([
    `${wv(1)}&${eq(1)}${v(1)}`,
    `${wv(2)}&${eq(2)}${v(2)}${minus(2, 1)}${frac(2, 1)}`,
    `${wv(3)}&${eq(3)}${v(3)}${minus(3, 1)}${frac(3, 1)}${minus(3, 2)}${frac(3, 2)}`,
  ], 16),
  // rearrange: vᵢ in terms of the wⱼ
  aligned([
    `${v(1)}&${eq(1, true)}${wv(1)}`,
    `${v(2)}&${eq(2, true)}${frac(2, 1)}${plus(2, 2, true)}${wv(2)}`,
    `${v(3)}&${eq(3, true)}${frac(3, 1)}${plus(3, 2, true)}${frac(3, 2)}${plus(3, 3, true)}${wv(3)}`,
  ], 16),
  // normalize: wⱼ = ‖wⱼ‖ wⱼ′ everywhere, so vᵢ in terms of the wⱼ′
  aligned([
    `${v(1)}&${eq(1, true)}${diag(1, true)}`,
    `${v(2)}&${eq(2, true)}${scaled(2, 1, true)}${plus(2, 2)}${diag(2, true)}`,
    `${v(3)}&${eq(3, true)}${scaled(3, 1, true)}${plus(3, 2)}${scaled(3, 2, true)}${plus(3, 3)}${diag(3, true)}`,
  ], 16),
  // the coefficients are the r's
  aligned([
    `${v(1)}&${eq(1, true)}${brace('b11', N(1), 11)}${diag(1)}`,
    `${v(2)}&${eq(2, true)}${rBrace(2, 1)}${scaled(2, 1)}${plus(2, 2)}${brace('b22', N(2), 22)}${diag(2)}`,
    `${v(3)}&${eq(3, true)}${rBrace(3, 1)}${scaled(3, 1)}${plus(3, 2)}${rBrace(3, 2)}${scaled(3, 2)}${plus(3, 3)}${brace('b33', N(3), 33)}${diag(3)}`,
  ], 12),
  // the r's in place of the coefficients (the user's request): the fractions, norms and braces fade
  aligned([
    `${v(1)}&${eq(1, true)}${rc(11)}\,${mk('w1', w(1))}`,
    `${v(2)}&${eq(2, true)}${rc(12)}\,${mk('u21', w(1))}${plus(2, 2)}${rc(22)}\,${mk('w2', w(2))}`,
    `${v(3)}&${eq(3, true)}${rc(13)}\,${mk('u31', w(1))}${plus(3, 2)}${rc(23)}\,${mk('u32', w(2))}${plus(3, 3)}${rc(33)}\,${mk('w3', w(3))}`,
  ], 12),
];
export const NORMALIZE = String.raw`${col(GREEN, r`\vv w_i'`)}=\dfrac{${g('i')}}{\norm{\vv w_i}}`;
export const BAR = r`\rule{0.4pt}{0.9em}`;
// A brace under m that comes on a key press (the user's request): drawn under a phantom copy of m, in a
// zero-width layer over m, its class shown by deck.css when its marker is reached; its space is kept.
export const laterBrace = (cls, m, label) => String.raw`\mathrlap{\htmlClass{${cls}}{\underbrace{\phantom{${m}}}_{${label}}}}${m}`;
export const MAT_W = String.raw`\begin{bmatrix}${BAR}&${BAR}&${BAR}\\${g(1)}&${g(2)}&${g(3)}\\${BAR}&${BAR}&${BAR}\end{bmatrix}`;
export const MAT_Q = String.raw`\begin{bmatrix}${BAR}&${BAR}&${BAR}\\${w(1)}&${w(2)}&${w(3)}\\${BAR}&${BAR}&${BAR}\end{bmatrix}`;
export const MAT_R = String.raw`\begin{bmatrix}${rr(11)}&${rr(12)}&${rr(13)}\\0&${rr(22)}&${rr(23)}\\0&0&${rr(33)}\end{bmatrix}`;
// Under Q's and R's braces, what kind of matrix each is, in its colour, on two lines ("orthogonal /
// matrix", "upper triangular / matrix"), and on a later key press its name at the end of the second line
// (its space kept), the user's request
export const kind = (c, what, name) =>
  String.raw`\mathclap{\textstyle\textcolor{${c}}{\htmlClass{l23-gsqr-lab}{\begin{array}{c}\text{${what}}\\\text{matrix}\ \htmlClass{l23-gsqr-name}{${name}}\end{array}}}}`;
export const MAT_A = String.raw`\underbrace{\begin{bmatrix}${BAR}&${BAR}&${BAR}\\\vv v_1&\vv v_2&\vv v_3\\${BAR}&${BAR}&${BAR}\end{bmatrix}}_{A}`;
// After the rearrangement: A = [w₁ w₂ w₃] times the coefficients, 1 on the diagonal; the w's are
// orthogonal but not unit vectors, so [w₁ w₂ w₃] is not quite an orthogonal matrix (the user's request)
export const coef = (i, j) => r`\dfrac{\vv v_${i}\cdot\vv w_${j}}{\vv w_${j}\cdot\vv w_${j}}`;
export const MATRIX_W = `{${[
  MAT_A,
  '=',
  laterBrace('l23-gsqr-bnot', MAT_W, String.raw`\mathclap{\textstyle\htmlClass{l23-gsqr-not}{\begin{array}{c}\text{not quite}\\\text{orthogonal}\end{array}}}`),
  String.raw`\begin{bmatrix}1&${coef(2, 1)}&${coef(3, 1)}\\[14pt]0&1&${coef(3, 2)}\\[10pt]0&0&1\end{bmatrix}`,
].join('')}}`;
export const MATRIX = [
  MAT_A,
  '=',
  laterBrace('l23-gsqr-bqr', MAT_Q, kind(GREEN, 'orthogonal', 'Q')),
  laterBrace('l23-gsqr-bqr', MAT_R, kind(AMBER, 'upper triangular', 'R')),
].join('');

/**
 * Gram–Schmidt in matrix form (the user's request, in place of From Gram–Schmidt to QR; the textbook's
 * Section 22.4): "Let v₁, v₂, v₃ be columns of a matrix A." (the user's words, in place of
 * A = [v₁ v₂ v₃]); no figure (the user's request).
 * Three numbered steps (the deck's red discs, the user's request) in a column left of the formulas (the user's words, in place of the chain {v₁, v₂, v₃} →
 * (Gram–Schmidt) {w₁, w₂, w₃} → (normalize) {w′₁, w′₂, w′₃}), each with its stage of a derivation that
 * morphs in place (TexMorph; the user's request); each step first, its formulas on the next key press
 * (the user's request). Key press 1: "1. Gram–Schmidt turns v₁, v₂ and v₃ into an orthogonal
 * collection {w₁, w₂, w₃}"; 2: Gram–Schmidt in full, wᵢ = vᵢ − the projections (v·w)/(w·w) w; 3: "2.
 * Rearrange to write v₁, v₂, v₃ in terms of w₁, w₂, w₃"; 4: the rearrangement: vᵢ glides to the left,
 * wᵢ to the right end, the minus signs turn into red plus signs; 5: under the formulas,
 * A = [v₁ v₂ v₃] = [w₁ w₂ w₃] times the coefficients (1 on the diagonal); 6: the brace under
 * [w₁ w₂ w₃], "not quite orthogonal" (red); 7: "3. Normalize: w′ᵢ = wᵢ/‖wᵢ‖" (green); 8: every wⱼ
 * becomes ‖wⱼ‖ wⱼ′, the norms inserted in red, the fractions kept (the user's request: nothing swapped
 * out); 9: amber braces name the coefficients r_ij (a fraction times ‖wⱼ‖; r_ii = ‖wᵢ‖); 10: the
 * coefficients replaced by the r_ij (the user's request: the fractions, norms and braces fade, each r_ij
 * glides up into its coefficient's place, growing to full size); 11: together, A = QR, R upper
 * triangular, in place of A = [w₁ w₂ w₃][…]; 12: the braces under Q and R, "orthogonal matrix" (green)
 * and "upper triangular matrix" (amber); 13: the names Q and R at their ends (the braces of 6 and 12,
 * and the names, on key presses of their own, the user's requests). The formulas
 * are in a card, which comes on key press 2; the matrices are under it, not in it (the user's
 * requests).
 */
export default function Slide13GSToQR() {
  return (
    <section>
      <h2>Gram–Schmidt in matrix form</h2>

      <div className="stage l23-gsqr">
        <div className="stage-text">
          <p>
            Let <Tex tex={r`\vv v_1,\vv v_2,\vv v_3`} /> be columns of a matrix <Tex tex={r`A`} />.
          </p>
          {/* two columns: the steps on the left, a list that grows downwards; on the right the formulas,
              and under them A = [w₁ w₂ w₃][…], then A = QR in its place */}
          <div className="l23-gsqr-cols">
            <ol className="steps l23-gsqr-steps">
              <Fragment index={1} as="li">
                Gram–Schmidt turns <Tex tex={r`\vv v_1`} />, <Tex tex={r`\vv v_2`} /> and <Tex tex={r`\vv v_3`} /> into an orthogonal collection <Tex tex={r`\{${g(1)},${g(2)},${g(3)}\}`} />
              </Fragment>
              <Fragment index={3} as="li">
                Rearrange to write <Tex tex={r`\vv v_1,\vv v_2,\vv v_3`} /> in terms of <Tex tex={r`${g(1)},${g(2)},${g(3)}`} />
              </Fragment>
              <Fragment index={7} as="li">
                <span className="l23-nowrap">
                  Normalize: <Tex tex={NORMALIZE} />
                </span>
              </Fragment>
            </ol>
            <div className="l23-gsqr-work">
              {/* the formulas in a card, which comes on the key press after step 1; the matrices under
                  it, not in it (the user's requests) */}
              <Fragment index={2} className="l23-gsqr-morph l23-gsqr-card">
                <TexMorph steps={STEPS} at={[4, 8, 9, 10]} />
              </Fragment>
              {/* the braces "not quite orthogonal" (6), then orthogonal / upper triangular matrix (12),
                  then the names Q, R (13), each on a key press */}
              <FxMarker index={6} id="gsqr-not" />
              <FxMarker index={12} id="gsqr-qr" />
              <FxMarker index={13} id="gsqr-names" />
              <div className="l23-gsqr-matrix fx-host">
                <Fragment index={5}>
                  <Fragment index={11} effect="fade-out">
                    <Tex tex={MATRIX_W} />
                  </Fragment>
                </Fragment>
                <Fragment index={11}>
                  <Tex tex={MATRIX} />
                </Fragment>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
