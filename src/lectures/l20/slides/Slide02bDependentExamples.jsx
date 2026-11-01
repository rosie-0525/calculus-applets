import Tex, { r } from '../components/Tex.jsx';
import { DependentCards, DEPENDENT_R2 } from '../components/Dependent.jsx';

/**
 * Examples of linear dependence in ℝ² (the user's request: "a lot of linearly dependent examples in ℝ²
 * or ℝ³"; then: "explain how we remove the redundant vectors in each case to obtain a basis"): two
 * vectors on a line; three adding up to 0 (head to tail, a closed triangle); a collection with 0 in
 * it. Each card: the picture and its vanishing combination; the redundant vector in amber with the
 * relation; then it is removed and the basis left turns green (the pictures are in Dependent.jsx).
 * (The remarks on 0 and on a single vector, Remark 19.1.4, were removed at the user's request.)
 */
export default function Slide02bDependentExamples() {
  return (
    <section>
      <h2>
        Examples of linear dependence in <Tex tex={r`\mathbb R^2`} />
      </h2>
      <DependentCards examples={DEPENDENT_R2} />
    </section>
  );
}
