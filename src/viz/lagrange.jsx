import '../lectures/l12/styles/deck.css';
import { CurvePicture, AtPoint, useDragOnC } from '../lectures/l12/components/CurveMap.jsx';
import { S_MAX, LABEL_AT, LEVEL_MAX } from '../lectures/l12/slides/Slide05Lagrange.jsx';

export const lecture = 12;

/*
 * The picture of Lagrange multipliers, without the theorem (the caption says it, and the why of the
 * commented-out Finding constrained max/min): Example 1's picture with a at the maximum of f on C,
 * ∇f(a), ∇g(a) and the level curve of f through a, labelled with its value; the mouse drags a
 * around C, and the level curve with it.
 */
export default function Lagrange() {
  const [s, move] = useDragOnC(S_MAX);
  return (
    <div className="l12-drag" onPointerDown={move} onPointerMove={move}>
      <CurvePicture>{(p) => <AtPoint p={p} s={s} tangent={false} anchor={LABEL_AT} level={s === S_MAX ? LEVEL_MAX : undefined} />}</CurvePicture>
    </div>
  );
}
