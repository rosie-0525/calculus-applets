import Fragment from '../components/Fragment.jsx';
import Substitution, { keyPresses } from '../components/Substitution.jsx';
import HappyFigure from '../components/HappyFigure.jsx';

// Example 2's system, solved from the bottom up
export const UPPER = {
  vars: ['x', 'y', 'z'],
  A: [
    [3, 6, 1],
    [0, 3, 1],
    [0, 0, 6],
  ],
  b: [1, -2, 6],
  sol: ['2', '-1', '1'],
  order: [2, 1, 0],
};

// the textbook's (22.1.1), solved from the top down
export const LOWER = {
  vars: ['x', 'y', 'z'],
  A: [
    [2, 0, 0],
    [-3, 1, 0],
    [1, 4, 3],
  ],
  b: [6, -7, 5],
  sol: ['3', '2', '-2'],
  order: [0, 1, 2],
};

// the key presses: the upper system's steps from 1, then the lower system, its steps, the figure
export const UP_AT = 1;
export const LOW_COL = UP_AT + keyPresses(UPPER);
export const LOW_AT = LOW_COL + 1;
export const HAPPY = LOW_AT + keyPresses(LOWER);

/**
 * Back substitution (the textbook's Example 22.1.1), a T-chart: on the left Example 2's upper
 * triangular system, solved from the bottom up, two key presses per equation (1–5; the user's
 * request): its diagonal term gets a yellow band and its value appears at the right, alone; then the
 * value flies up its column into the equations above, in green, in place of the variable (in
 * parentheses only where it must be). On the right (key press 6) the textbook's lower triangular
 * system (22.1.1), solved from the top down (7–11) likewise, the values flying down. Key press 12: the
 * owl, celebrating, up the stairs z, y, x (HappyFigure; the user's pick, in place of a very happy stick
 * figure, moved from Example 2), jumping for joy as it comes, "Triangular systems are easy to solve!". (The note, each step divides by a diagonal entry: it must be
 * nonzero, removed at the user's request.)
 */
export default function Slide03BackSub() {
  return (
    <section>
      <h2>Back substitution</h2>

      <div className="l22-tchart l23-bs">
        <div className="l22-tcol">
          <p className="l22-thead">Upper triangular: from the bottom up</p>
          <Substitution sys={UPPER} start={UP_AT} />
        </div>
        <Fragment index={LOW_COL} className="l22-tcol">
          <p className="l22-thead">Lower triangular: from the top down</p>
          <Substitution sys={LOWER} start={LOW_AT} />
        </Fragment>
      </div>

      <Fragment index={HAPPY} className="l23-happy-row l23-bs-happy">
        <HappyFigure />
        <p className="l23-happy-say">Triangular systems are easy to solve!</p>
      </Fragment>
    </section>
  );
}
