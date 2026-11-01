import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import InverseStrip, { STRIPS } from '../components/InverseStrip.jsx';

/**
 * Inverse of a matrix (the user's request: B named on the slide after Invertible matrices), without
 * its title (the user's request): at the top, the rotation's strip of Invertible matrices, as it
 * ended, moving up from its place there (reveal.js auto-animate, data-id inv-rotation; the user's
 * request), each strip on a card of its own, named by a tag on its top-left corner, Rotation and
 * Reflection, in place of what T_A and T_B are (the user's requests: first on the left, cramped); key presses 1–4: the reflection across the y-axis, moved here from Invertible matrices
 * (the user's request), in the same strip, T_A, T_B, then their matrices, B = A, as the rotation's on
 * Invertible matrices (A on 3, B on 4: the user's request); 5: B is called the inverse of A and written A⁻¹, in a box without a title;
 * 6: in both strips, B becomes A⁻¹ (T_{A⁻¹}, A⁻¹ = …; cross-faded); 7: one side is enough,
 * for n × n matrices A and B (the user's request) (→ Theorem 18.1.8; from Invertible matrices). (First, the two
 * examples as A and A⁻¹ side by side, replaced by the strips.)
 */
export default function Slide04aInverseName() {
  return (
    <section data-auto-animate>
      <div className="l18-istrips l18-istrips-cards">
        <InverseStrip strip={STRIPS.rotation} renameAt={6} id="inv-rotation" label="Rotation" />
        <InverseStrip strip={STRIPS.reflection} forthAt={1} backAt={2} matricesAt={3} matrixBAt={4} renameAt={6} label="Reflection" />
      </div>

      <Fragment index={5} className="block definition l18-inv-name">
        <p>
          If <Tex tex="AB=BA=I_n" />, then <Tex tex="B" /> is called the <strong>inverse</strong> of <Tex tex="A" />, written <Tex tex="A^{-1}" />.
        </p>
      </Fragment>

      <Fragment index={7} className="block theorem l18-one-side">
        <p>
          One side is enough: if <Tex tex="A" /> and <Tex tex="B" /> are both <Tex tex={r`n\times n`} /> matrices and <Tex tex="AB=I_n" />, then <Tex tex="BA=I_n" /> too, so{' '}
          <Tex tex="B=A^{-1}" />.
        </p>
        <p className="pointer corner">(→ Theorem 18.1.8)</p>
      </Fragment>
    </section>
  );
}
