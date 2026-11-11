import Fragment, { FxMarker } from './Fragment.jsx';

/**
 * The two questions about a linear system (Linear system in matrix form, Two questions before the null space, and
 * Two questions, commented out), in the user's words: the deck's wise owl and a numbered list in
 * plain ink (the user's pick over the numbered cards, a table under the systems, two columns and one
 * line). The question `focus` names stays, the other is dimmed. With `steps`, the owl and question 1
 * come on key press 1, question 2 on key press 2, and the dimming on key press 3 (the marker
 * q-focus); without, all at once. With no `focus` (Linear system in matrix form), nothing is dimmed.
 * `className` goes on the owl's block (l22-q-compact on Linear system in matrix form, which restyles
 * it: a larger owl beside the questions, no numbers, and the key words, l22-q-key, in the
 * questions' colours, 1 teal as C(A), 2 green as N(A); elsewhere l22-q-key is plain).
 */
const QUESTIONS = [
  <span>
    Does the system of linear equations <span className="l22-q-key">have a solution</span>?
  </span>,
  <span>
    If so, is the solution <span className="l22-q-key">unique</span>?
  </span>,
];

export default function TwoQuestions({ focus, steps = false, className = '' }) {
  const items = QUESTIONS.map((q, k) => {
    const cls = focus ? (focus === k + 1 ? 'l22-q-item on' : 'l22-q-item off') : 'l22-q-item';
    return steps && k > 0 ? (
      <Fragment key={k} as="li" index={k + 1} className={cls}>
        {q}
      </Fragment>
    ) : (
      <li key={k} className={cls}>
        {q}
      </li>
    );
  });
  const list = <ol className="l22-q-ol">{items}</ol>;
  const cls = `question l22-q-ask fx-host ${steps ? 'l22-q-steps' : 'l22-q-now'} ${className}`.trim();
  return (
    <>
      {steps && focus && <FxMarker index={3} id="q-focus" />}
      {steps ? (
        <Fragment index={1} className={cls}>
          {list}
        </Fragment>
      ) : (
        <div className={cls}>{list}</div>
      )}
    </>
  );
}
