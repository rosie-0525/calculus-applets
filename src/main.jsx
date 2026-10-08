import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'reveal.js/dist/theme/white.css';
import 'katex/dist/katex.min.css';
import './site/site.css';
import { AREAS, SECTIONS, APPLETS } from './applets.js';
import Applet from './site/Applet.jsx';

const BASE = import.meta.env.BASE_URL; // '/calculus-applets/'
const FUN = 'Motivation – just for fun!';

// One module per applet, loaded when the reader scrolls near it.
const MODULES = import.meta.glob('./viz/*.jsx');
const loader = (id) => MODULES[`./viz/${id}.jsx`] ?? (() => Promise.reject(new Error(`no module for ${id}`)));

// the first topic is the front page
const topicUrl = (s) => (s === SECTIONS[0] ? BASE : `${BASE}${s.id}/`);
const topicOf = (applet) => SECTIONS.find((s) => s.applets.includes(applet));

// Applets in a row with the same `group` share a heading: [{ group, applets }, …], `group`
// undefined for an applet on its own. The heading's anchor is the group, lower case and hyphenated.
const byGroup = (applets) =>
  applets.reduce((runs, a) => {
    const last = runs[runs.length - 1];
    if (a.group && last?.group === a.group) last.applets.push(a);
    else runs.push({ group: a.group, applets: [a] });
    return runs;
  }, []);
const groupId = (group) => group.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The entries of a topic's contents: its applets (a group once), then the ones for fun. */
function headings(topic) {
  const list = byGroup(topic.applets.filter((a) => !a.fun)).map(({ group, applets: [a] }) =>
    group ? { id: groupId(group), title: group } : { id: a.id, title: a.title },
  );
  if (topic.applets.some((a) => a.fun)) list.push({ id: 'motivation', title: FUN });
  return list;
}

/** The id of the last of `ids` whose top has scrolled above the upper third of the window. */
function useScrollSpy(ids) {
  const [current, setCurrent] = useState(null);
  const key = ids.join(' ');
  useEffect(() => {
    const els = key.split(' ').map((id) => document.getElementById(id)).filter(Boolean);
    const update = () => {
      const line = window.innerHeight / 3;
      setCurrent(els.filter((el) => el.getBoundingClientRect().top <= line).pop()?.id ?? null);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [key]);
  return current;
}

/** The site's mark, the picture in the favicon: a vector, and its projection onto a line. */
function Mark() {
  return (
    <svg className="mark" viewBox="3 6 26 23" aria-hidden="true">
      <path d="M5 26 L27 26" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 9 L19 26" stroke="#9ca3af" strokeWidth="1.6" strokeDasharray="2.5 2" />
      <path d="M5 26 L19 9" stroke="#8c1515" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5 26 L19 26" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Masthead({ children }) {
  return (
    <header className="masthead">
      <a className="wordmark" href={BASE}>
        <Mark />
        <span className="wordmark-name">Applets</span>
        <span className="wordmark-tagline">for linear algebra and multivariable calculus</span>
      </a>
      {children}
    </header>
  );
}

function AppletEntry({ applet, as: H = 'h2', solo = false }) {
  return (
    <article className="applet" id={applet.id}>
      {/* the title opens the applet on its own (?only=), e.g. to project it in class */}
      <H className="applet-title">{solo ? applet.title : <a href={`${BASE}?only=${applet.id}`}>{applet.title}</a>}</H>
      {applet.caption && <p className="caption" dangerouslySetInnerHTML={{ __html: applet.caption }} />}
      <Applet applet={applet} load={loader(applet.id)} />
    </article>
  );
}

/** The topics, with the headings of the current one under it. */
function Contents({ topic, current }) {
  return (
    <nav className="toc" aria-label="Topics">
      {AREAS.map((area) => (
        <div className="toc-area" key={area.title}>
          <p className="toc-area-title">{area.title}</p>
          <ul>
            {area.sections.map((s) => {
              const here = s.id === topic.id;
              return (
                <li key={s.id} className={here ? 'here' : undefined}>
                  <a href={topicUrl(s)} aria-current={here ? 'page' : undefined}>
                    {s.title}
                  </a>
                  {here && (
                    <ul className="toc-sub">
                      {headings(s).map((h) => (
                        <li key={h.id}>
                          <a href={`#${h.id}`} aria-current={h.id === current ? 'location' : undefined}>
                            {h.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** On a narrow screen, the topics in a menu under the masthead (the sidebar is hidden). */
function TopicsMenu({ topic, current }) {
  // close the menu once a link in it is followed
  const close = (e) => {
    if (e.target.closest('a')) e.currentTarget.open = false;
  };
  return (
    <details className="topics-menu" onClick={close}>
      <summary>Topics</summary>
      <div className="topics-menu-panel">
        <Contents topic={topic} current={current} />
      </div>
    </details>
  );
}

function Pager({ topic }) {
  const i = SECTIONS.indexOf(topic);
  const prev = SECTIONS[i - 1];
  const next = SECTIONS[i + 1];
  return (
    <nav className="pager" aria-label="Previous and next topic">
      {prev && (
        <a href={topicUrl(prev)} rel="prev">
          <span className="pager-label">Previous</span>
          <span className="pager-title">{prev.title}</span>
        </a>
      )}
      {next && (
        <a href={topicUrl(next)} rel="next">
          <span className="pager-label">Next</span>
          <span className="pager-title">{next.title}</span>
        </a>
      )}
    </nav>
  );
}

/** One topic: its applets, then the ones just for fun. */
function TopicPage({ topic }) {
  const concepts = topic.applets.filter((a) => !a.fun);
  const fun = topic.applets.filter((a) => a.fun);
  const current = useScrollSpy(headings(topic).map((h) => h.id));
  return (
    <div className="site">
      <Masthead>
        <TopicsMenu topic={topic} current={current} />
      </Masthead>
      <div className="layout">
        <aside className="sidebar">
          <Contents topic={topic} current={current} />
        </aside>

        <main>
          <h1 className="topic-title">{topic.title}</h1>

          {byGroup(concepts).map(({ group, applets }) =>
            group ? (
              <section className="group" id={groupId(group)} key={applets[0].id}>
                <h2 className="group-title">
                  <a href={`#${groupId(group)}`}>{group}</a>
                </h2>
                {applets.map((a) => (
                  <AppletEntry applet={a} as="h3" key={a.id} />
                ))}
              </section>
            ) : (
              <AppletEntry applet={applets[0]} key={applets[0].id} />
            ),
          )}

          {fun.length > 0 && (
            <section className="motivation" id="motivation" aria-labelledby="motivation-title">
              <h2 className="motivation-title" id="motivation-title">
                {FUN}
              </h2>
              {fun.map((a) => (
                <AppletEntry applet={a} as="h3" key={a.id} />
              ))}
            </section>
          )}

          <Pager topic={topic} />
        </main>
      </div>
    </div>
  );
}

/** ?only=<id>: just that applet, e.g. to project it in class. */
function Only({ applet }) {
  const topic = topicOf(applet);
  return (
    <div className="site site-only">
      <Masthead>
        <a className="back" href={`${topicUrl(topic)}#${applet.id}`}>
          {topic.title}
        </a>
      </Masthead>
      <main>
        <AppletEntry applet={applet} solo />
      </main>
    </div>
  );
}

// The page: /calculus-applets/<topic>/ is that topic, and anything else the first one.
const only = APPLETS.find((a) => a.id === new URLSearchParams(window.location.search).get('only'));
const slug = window.location.pathname.slice(BASE.length).split('/')[0];
const topic = SECTIONS.find((s) => s.id === slug) ?? SECTIONS[0];
document.title = `${(only ?? topic).title} – Applets`;

createRoot(document.getElementById('app')).render(only ? <Only applet={only} /> : <TopicPage topic={topic} />);

// The page is built by script, so jump to the #anchor once it exists.
if (window.location.hash) {
  requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
}
