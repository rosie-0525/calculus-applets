/**
 * Speaker notes for a slide (shown in the reveal.js speaker view, key `S`).
 * `time` is a rough pacing hint for the 50-minute first lecture.
 *
 * The speaker window does not load KaTeX, so math in the notes is written
 * as plain Unicode text.
 */
export default function Notes({ time, children }) {
  return (
    <aside className="notes">
      {time && (
        <p>
          <em>⏱ {time}</em>
        </p>
      )}
      {children}
    </aside>
  );
}
