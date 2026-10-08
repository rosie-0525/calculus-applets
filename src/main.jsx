import { createRoot } from 'react-dom/client';
import 'reveal.js/dist/theme/white.css';
import 'katex/dist/katex.min.css';
import './site/site.css';
import { AREAS, SECTIONS, APPLETS } from './applets.js';
import Applet from './site/Applet.jsx';

const HOME = 'https://rosie-0525.github.io/';
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

function AppletEntry({ applet, as: H = 'h2' }) {
  return (
    <article className="applet" id={applet.id}>
      <H className="applet-title">
        <a href={`#${applet.id}`}>{applet.title}</a>
      </H>
      {applet.caption && <p className="caption" dangerouslySetInnerHTML={{ __html: applet.caption }} />}
      <Applet applet={applet} load={loader(applet.id)} />
    </article>
  );
}

function Header() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Site">
        <a href={HOME}>Home</a>
        <a href={BASE} aria-current="true">
          Applets
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <p>
        <a href={HOME}>Wanchun Shen</a>
      </p>
    </footer>
  );
}

/** The topics, with the applets of the current one under it. */
function Contents({ topic }) {
  return (
    <nav className="toc" aria-label="Topics">
      {AREAS.map((area) => (
        <div key={area.title}>
          <p className="toc-area">{area.title}</p>
          <ul>
            {area.sections.map((s) => {
              const here = s.id === topic.id;
              const fun = s.applets.some((a) => a.fun);
              return (
                <li key={s.id} className={here ? 'here' : undefined}>
                  <a href={topicUrl(s)} aria-current={here ? 'page' : undefined}>
                    {s.title}
                  </a>
                  {here && (
                    <ul className="toc-sub">
                      {byGroup(s.applets.filter((a) => !a.fun)).map(({ group, applets: [a] }) => (
                        <li key={a.id}>
                          <a href={`#${group ? groupId(group) : a.id}`}>{group ?? a.title}</a>
                        </li>
                      ))}
                      {fun && (
                        <li>
                          <a href="#motivation">{FUN}</a>
                        </li>
                      )}
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

/** One topic: its applets, then the ones just for fun. */
function TopicPage({ topic }) {
  const concepts = topic.applets.filter((a) => !a.fun);
  const fun = topic.applets.filter((a) => a.fun);
  const i = SECTIONS.indexOf(topic);
  const prev = SECTIONS[i - 1];
  const next = SECTIONS[i + 1];
  return (
    <div className="site">
      <Header />
      <div className="layout">
        <aside className="sidebar">
          <Contents topic={topic} />
        </aside>

        <main>
          <p className="area-title">{topic.area}</p>
          <h1>{topic.title}</h1>

          {byGroup(concepts).map(({ group, applets }) =>
            group ? (
              <section className="group" id={groupId(group)} key={applets[0].id}>
                <h2 className="applet-title group-title">
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
              <h2 id="motivation-title">{FUN}</h2>
              {fun.map((a) => (
                <AppletEntry applet={a} as="h3" key={a.id} />
              ))}
            </section>
          )}

          <nav className="pager" aria-label="Topics">
            {prev ? (
              <a href={topicUrl(prev)} rel="prev">
                ← {prev.title}
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a href={topicUrl(next)} rel="next">
                {next.title} →
              </a>
            )}
          </nav>
        </main>
      </div>
      <Footer />
    </div>
  );
}

/** ?only=<id>: just that applet, e.g. to project it in class. */
function Only({ applet }) {
  return (
    <div className="site site-only">
      <header className="site-header">
        <nav className="site-nav" aria-label="Site">
          <a href={HOME}>Home</a>
          <a href={BASE}>Applets</a>
          <a href={`${topicUrl(topicOf(applet))}#${applet.id}`}>{topicOf(applet).title}</a>
        </nav>
      </header>
      <main>
        <AppletEntry applet={applet} />
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
