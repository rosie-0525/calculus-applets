import { Component, useMemo } from 'react';
import Applet from './Applet.jsx';
import { captionHtml } from './caption.js';
import Masthead from './Masthead.jsx';

/*
 * The page of a downloaded applet (see Download.jsx): its title, its question and the applet, as on
 * the site's ?only= page, with links to the site.
 *   applet  { id, title, caption }, the caption's math in TeX (see caption.js)
 *   topic   { title, href }: the applet on its topic's page
 *   home    the site's address
 *   viz     the applet's module (src/viz/<id>.jsx)
 */
export default function ExportPage({ applet, topic, home, viz }) {
  const load = useMemo(() => () => Promise.resolve(viz), [viz]);
  return (
    <div className="site site-only">
      <Masthead home={home}>
        <a className="back" href={topic.href}>
          {topic.title}
        </a>
      </Masthead>
      <main>
        <article className="applet" id={applet.id}>
          <h1 className="applet-title">{applet.title}</h1>
          {applet.caption && <p className="caption" dangerouslySetInnerHTML={{ __html: captionHtml(applet.caption) }} />}
          <ShowError>
            <Applet applet={applet} load={load} />
          </ShowError>
        </article>
      </main>
    </div>
  );
}

/** An error while the applet draws, e.g. after an edit to its source: on the page, not a blank one. */
class ShowError extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const message = window.__appletError?.(error) ?? String(error);
    return <pre className="export-error">{`The applet stopped.\n\n${message}`}</pre>;
  }
}
