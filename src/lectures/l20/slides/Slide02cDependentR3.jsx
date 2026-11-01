import Tex, { r } from '../components/Tex.jsx';
import { DependentCards, DEPENDENT_R3 } from '../components/Dependent.jsx';

/**
 * Examples of linear dependence in ℝ³, after those in ℝ²: three vectors in a plane; two on a line and
 * one off it (its coefficient is 0: v₃ is not in the span of the others, and stays); three edges of a
 * box and its diagonal. Each card as on Examples of linear dependence in ℝ² (Dependent.jsx).
 */
export default function Slide02cDependentR3() {
  return (
    <section>
      <h2>
        Examples of linear dependence in <Tex tex={r`\mathbb R^3`} />
      </h2>
      <DependentCards examples={DEPENDENT_R3} />
    </section>
  );
}
