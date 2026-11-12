import { SolveDuo, SOLVE } from '../components/SolutionSets.jsx';

/**
 * How many solutions?, the examples (after that slide, at the user's request; first right after Back
 * to linear systems, under its title; the user's request: a better class of examples than the three
 * of Slide16bSolutionExamples, commented out, to show all that can happen, with b varying;
 * SolutionSets.jsx). Four systems, one for each kind of matrix, on three slides, each with its
 * matrix, its rank and nullity, and a picture (the user's request: first two, the inputs beside the
 * outputs): N(A)
 * green, C(A) teal, and b on top, to drag: the right-hand sides follow (each equation's line, gray,
 * was in the picture too: removed at the user's request).
 * No key press moves b (the user's request: the user moves b to explore). Off C(A), "No
 * solution"; once b is in C(A), a small button, "All solutions": a click shows them, blue, and what
 * they are.
 * Each example is built up a key press at a time (the user's request: "let animation of T_A, C(A),
 * rank = ?, N(A), nullity = ?, then b appear one by one", then "show b after C(A) and rank 1"): the
 * picture, with T_A played once (the grid moves onto its outputs); C(A); rank = …; b, to drag;
 * N(A); nullity = ….
 * This slide: 2x + 4y = 6, x + 2y = 1 (A = [2 4; 1 2], rank 1, nullity 1; the two equations
 * different, the user's request), alone, with a second picture beside the first (the user's request,
 * for this example only: "the solution is a bit confusing here, maybe separate it to another applet
 * besides the current one; in that applet draw two lines labelled 2x+4y=* and x+2y=? that moves with
 * b"): the plane of the unknowns, each equation's line labelled with the equation.
 * On arrival, its matrix and, over the second picture's place, its system; key presses 1 to 4, the
 * first picture, up to b; key press 5, the second picture (the user's request: "let the two lines
 * applet show on key press, after b"; first with b); key presses 6 and 7, N(A) and the nullity. The
 * second picture's lines follow b; b off the line C(A), they
 * are parallel; on it, they are one line, blue, the solutions (they are not drawn in the first
 * picture), a line parallel to N(A) (said under them once N(A) has come). No button on this slide
 * (the user's request: "remove the "All solutions" button; put the No solution/solution! on the
 * left, it should appear when b appears"): under the first picture, with b, "No solution" or
 * "Solution!".
 * Key press 8 (the user's request: "add another key press, that displays x_0 + n on the right
 * applet, where n can be moved"): in the second picture, n, green, from x₀'s tip along the
 * solutions, and x₀ + n, blue; n is dragged.
 * No circle at b's arrowhead (the user's request), here and on the next two slides.
 * x + y = 1, y = 2, first this slide's right half, is on the next slide (Slide16eSolutionSets); the
 * two systems that are not square on the one after (Slide16dSolutionSets).
 */
export default function Slide16cSolutionSets() {
  return (
    <section>
      <h2>How many solutions?</h2>

      <div className="l22-duo l22-duo-one">
        <SolveDuo ex={SOLVE.rank1} />
      </div>
    </section>
  );
}
