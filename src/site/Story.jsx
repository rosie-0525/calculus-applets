import { createContext, useContext, useMemo } from 'react';
import katex from 'katex';
import { captionHtml } from './caption.js';

/*
 * The pieces of a story: an applet that is text with pictures in it (a module that exports
 * `story = true`, see Applet.jsx). The text is set in the page's own face and column, and each
 * picture is a Figure (Figure.jsx), scaled to fit on its own:
 *
 *   <Beat id="circles" title={r`Circles: $x^2 + y^2$`}>
 *     <P>{r`The graph of $x^2 + y^2$ is a bowl …`}</P>
 *     <Figure lecture={26} label="…"><Bowl /></Figure>
 *     <Think>{r`If $b$ grows, …`}</Think>
 *     <Answer shown={…} onShow={…}><P>…</P></Answer>
 *   </Beat>
 *
 * The text is written like a caption (caption.js): HTML, its math in TeX between dollar signs. A link
 * to another page of the site starts at its root, with ~/: <a href="~/definiteness/#…">.
 */

/** The site's address: the page's own, or (in a downloaded file) the one the file links to. */
export const Home = createContext(import.meta.env.BASE_URL);

/** The text as HTML: its math typeset, and a link to the site, href="~/<topic>/#<applet>", completed. */
function useHtml(text) {
  const home = useContext(Home);
  return useMemo(() => ({ __html: captionHtml(text).replace(/href="~\//g, `href="${home}`) }), [text, home]);
}

/** A part of the story, with its heading (a link to itself). */
export function Beat({ id, title, children }) {
  const heading = useHtml(title);
  return (
    <section className="story-beat" id={id}>
      <h3 className="story-heading">
        <a href={`#${id}`} dangerouslySetInnerHTML={heading} />
      </h3>
      {children}
    </section>
  );
}

/** A paragraph. */
export function P({ children, className = '' }) {
  const text = useHtml(children);
  return <p className={`story-p ${className}`.trim()} dangerouslySetInnerHTML={text} />;
}

/** A displayed equation (TeX). */
export function Eq({ tex }) {
  const out = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        macros: { '\\vv': '\\mathbf{#1}', '\\norm': '\\lVert #1 \\rVert' },
      }),
    [tex],
  );
  return <div className="story-eq" dangerouslySetInnerHTML={{ __html: out }} />;
}

/** A question to think about before the picture under it answers it; or, with another `label`, a
 * line set off the same way (a conclusion). */
export function Think({ label = 'Think first:', children }) {
  const text = useHtml(children);
  return (
    <p className="story-p story-think">
      <span className="story-think-label">{label}</span> <span dangerouslySetInnerHTML={text} />
    </p>
  );
}

/** The text that answers a question: a button until the reader answers it, or asks to see it; `note`
 * beside the button. */
export function Answer({ shown, onShow, note = 'or answer in the picture first.', children }) {
  if (shown) return <div className="story-answer">{children}</div>;
  return (
    <p className="story-p story-answer-wait">
      <button type="button" className="story-button" onClick={onShow}>
        Show the answer
      </button>
      {note ? <span>{note}</span> : null}
    </p>
  );
}

/**
 * A reason to open, under a Think (it joins its box): `label` (Why?) shows, and the rest opens under
 * it on a click. A <details>, so it opens with the keyboard, and in a downloaded file too.
 */
export function Why({ label = 'Why?', children }) {
  return (
    <details className="story-why">
      <summary>{label}</summary>
      <div className="story-why-body">{children}</div>
    </details>
  );
}

/** A box with the conclusion in it. */
export function Summary({ children }) {
  return <div className="story-summary">{children}</div>;
}
