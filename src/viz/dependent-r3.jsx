import '../lectures/l20/styles/deck.css';
import { DEPENDENT_R3 } from '../lectures/l20/components/Dependent.jsx';
import { DependentCard } from './dependent-r2.jsx';

export const lecture = 20;

/*
 * Examples of linear dependence in ℝ³, without its title: three vectors in a plane; two on a line
 * and one off it (its coefficient 0: v₃ is not in the span of the others, and stays); three edges of
 * a box and its diagonal. Each card as in dependent-r2.jsx, its own button turning the redundant
 * vector amber and then removing it. The 3-D pictures rock while the applet is on screen and turn
 * when dragged.
 */
export default function DependentR3() {
  return (
    <div className="l20-pair l20-redund l20-dep">
      {DEPENDENT_R3.map((ex) => (
        <DependentCard key={ex.zero} ex={ex} />
      ))}
    </div>
  );
}
