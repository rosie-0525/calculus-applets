import DefCards from '../components/DefCards.jsx';

/**
 * Classifying critical points (the user's request, before Example 3: the goal, to tell a local
 * min/max from a saddle point): the three graphs of Recall: definiteness of quadratic forms, next (the
 * user's request, in place of Lecture 9's Example 1, g, and its question), x² + y², −x² − y², x² − y²
 * (DefCards.jsx, `run="goal"`), a column per key press (1–3), each with its critical point, a dot, and
 * over it the kind of critical point: local minimum, local maximum, saddle point, its formula under it.
 * 4–6 (the user's request): in each column in turn, its quadratic form in blue (not a yellow highlight,
 * and one colour for all: the user's requests), and under it, in that blue, the kind of quadratic form:
 * positive-definite, negative-definite, indefinite. The graphs 1.5 times as large as on the next slide,
 * the slide having nothing else. (The neither columns, x³ ± y², were added and then removed: the user's
 * request, only the three main cases, to avoid confusion.)
 */
export default function Slide06cGoal() {
  return (
    <section>
      <h2>Classifying critical points</h2>

      <DefCards run="goal" semi={false} />
    </section>
  );
}
