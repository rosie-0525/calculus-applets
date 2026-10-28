import { useEffect, useMemo, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, ease, clamp, rng, useOnScreen } from '../components/markov.js';
import { PAGES, IDX, Favicon, pick, SOLO_SEED } from './Slide13PageRank.jsx';

// each page's full address in the address bar (PageRank's windows show only the site)
export const ADDRESS = {
  math: 'math51.stanford.edu',
  chain: 'en.wikipedia.org/wiki/Markov_chain',
  markov: 'en.wikipedia.org/wiki/Andrey_Markov',
  pr: 'en.wikipedia.org/wiki/PageRank',
  pizza: 'pizza.com',
  menu: 'pizza.com/menu',
};

// the one browser window (viewBox VW × VH, shown SHOW px wide): its frame, tab bar, toolbar with the address bar, and
// the page below; the links' first line and spacing; a move's length (ms)
export const VW = 620;
export const VH = 400;
export const SHOW = 680;
export const X0 = 10;
export const Y0 = 8;
export const W = 600;
export const H = 384;
export const TABS = 36;
export const TOOL = 40;
export const BODY = Y0 + TABS + TOOL;
export const LINK_Y = BODY + 168;
export const LINK_DY = 40;
export const MOVE = 3200;
export const BLUE = '#2563eb';
export const TRAIL = 4; // the pages listed under the window: the last few

export const lerp = (a, b, e) => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
// where the cursor points: link k of page i, the address bar, and its spot between clicks
export const linkPoint = (i, k) => [X0 + 44 + PAGES[i].links[k][0].length * 6.4, LINK_Y + LINK_DY * k - 8];
export const BAR_POINT = [X0 + W - 70, Y0 + TABS + 20];
export const REST = [X0 + 470, BODY + 250];

/** Page i in the window: its favicon and title, a few grey lines of text, and its links. */
export function Page({ i, k, opacity }) {
  const p = PAGES[i];
  return (
    <g opacity={opacity}>
      <g transform={`translate(${X0 + 46},${BODY + 46}) scale(1.5) translate(${-(X0 + 46)},${-(BODY + 46)})`}>
        <Favicon icon={p.icon} x={X0 + 46} y={BODY + 46} />
      </g>
      <text x={X0 + 80} y={BODY + 57} className="l16-rs-title" fill={INK}>
        {p.name}
      </text>
      {[420, 470, 330].map((w, q) => (
        <rect key={q} x={X0 + 32} y={BODY + 86 + 18 * q} width={w} height={8} rx={4} fill="#e5e7eb" />
      ))}
      {p.links.map(([text], q) => (
        <text key={text} x={X0 + 32} y={LINK_Y + LINK_DY * q} className={`l16-rs-link${q === k ? ' l16-rs-visited' : ''}`}>
          {text}
        </text>
      ))}
      {[380, 250].map((w, q) => (
        <rect key={q} x={X0 + 32} y={LINK_Y + LINK_DY * p.links.length + 4 + 18 * q} width={w} height={8} rx={4} fill="#f3f4f6" />
      ))}
    </g>
  );
}

// before key press 1: the surfer on Math 51, the cursor at rest (no move yet)
export const IDLE = { m: { from: 0, kind: 'idle', to: 0 }, t: 0.9 };

/**
 * The window at move m (from page m.from) at phase t (0 to 1): the cursor goes to a random link
 * (or to the address bar) and clicks, the link turning purple (or the next page's address typed
 * in); the page loads, a blue bar running under the address bar, and the next page takes its place.
 */
export function Browser({ m, t }) {
  const link = m.kind === 'link';
  const target = link ? linkPoint(m.from, m.k) : m.kind === 'jump' ? BAR_POINT : REST;
  const page = t < 0.6 ? m.from : m.to;
  const clicked = m.kind !== 'idle' && t >= 0.3 && t < 0.6;
  const ripple = clicked && t < 0.55 ? (t - 0.3) / 0.25 : null;
  const press = clicked && t < 0.38;
  const loading = m.kind !== 'idle' && t >= 0.45 && t < 0.62 ? clamp((t - 0.45) / 0.15) : null;
  const fade = t < 0.5 ? 1 : t < 0.6 ? 1 - (t - 0.5) / 0.1 : t < 0.7 ? (t - 0.6) / 0.1 : 1;
  let at = REST;
  if (t < 0.28) at = lerp(REST, target, ease(t / 0.28));
  else if (t < 0.6) at = target;
  else if (t < 0.85) at = lerp(target, REST, ease((t - 0.6) / 0.25));
  const typed = PAGES[m.to].go;
  const address = clicked && !link ? typed.slice(0, Math.ceil(typed.length * clamp((t - 0.3) / 0.15))) : ADDRESS[PAGES[page].id];
  return (
    <svg className="l16-rs-window" viewBox={`0 0 ${VW} ${VH}`} width={SHOW} height={(SHOW * VH) / VW} aria-hidden="true">
      <rect x={X0} y={Y0} width={W} height={H} rx={12} fill="#fff" />
      {/* the tab bar: the three buttons, and the page's tab */}
      <path d={`M${X0},${Y0 + TABS} V${Y0 + 12} a12,12 0 0 1 12,-12 H${X0 + W - 12} a12,12 0 0 1 12,12 V${Y0 + TABS} Z`} fill="#e5e7eb" />
      {['#ef4444', '#f59e0b', '#22c55e'].map((c, q) => (
        <circle key={c} cx={X0 + 20 + 16 * q} cy={Y0 + 18} r={5.5} fill={c} />
      ))}
      <path d={`M${X0 + 82},${Y0 + TABS} V${Y0 + 14} a8,8 0 0 1 8,-8 H${X0 + 292} a8,8 0 0 1 8,8 V${Y0 + TABS} Z`} fill="#fff" />
      <Favicon icon={PAGES[page].icon} x={X0 + 104} y={Y0 + 22} />
      <text x={X0 + 122} y={Y0 + 27} className="l16-rs-tab" fill={INK}>
        {PAGES[page].name}
      </text>
      {/* the toolbar: back and forward, and the address bar */}
      <text x={X0 + 22} y={Y0 + TABS + 28} className="l16-rs-nav">
        ‹ ›
      </text>
      <rect x={X0 + 72} y={Y0 + TABS + 7} width={W - 92} height={26} rx={13} fill={clicked && !link ? '#fff' : '#f3f4f6'} stroke={clicked && !link ? BLUE : 'none'} strokeWidth="2" />
      <text x={X0 + 92} y={Y0 + TABS + 25} className={`l16-rs-url${clicked && !link ? ' l16-rs-typed' : ''}`}>
        {address}
      </text>
      <line x1={X0} x2={X0 + W} y1={BODY} y2={BODY} stroke="#e5e7eb" strokeWidth="1.5" />
      {loading !== null && <rect x={X0} y={BODY - 2} width={W * loading} height={4} fill={BLUE} />}
      <Page i={page} k={clicked && link ? m.k : -1} opacity={fade} />
      <rect x={X0} y={Y0} width={W} height={H} rx={12} fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      {ripple !== null && <circle cx={target[0]} cy={target[1]} r={6 + 22 * ripple} fill="none" stroke={BLUE} strokeWidth="3" opacity={0.85 * (1 - ripple)} />}
      <path
        transform={`translate(${at[0].toFixed(1)},${at[1].toFixed(1)}) scale(${press ? 1.3 : 1.6})`}
        d="M0,0 L0,17 L4.6,13.2 L7.6,20 L10.4,18.8 L7.5,12.2 L13,12.2 Z"
        fill="#fff"
        stroke="#111827"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// print mode: the surfer clicking Math 51's link to Markov chain
export const PRINT_WALK = { m: { from: 0, kind: 'link', k: 0, to: IDX.chain }, done: [0], t0: 0 };

/**
 * Random surfer on the internet (the user's request: the background of PageRank on a page of its
 * own, before it): one browser window, one page at a time; key press 1, a random surfer, the mouse
 * cursor, clicks a random link on the page (85%) or types in a random page (15%), and the window
 * goes there, over and over, the move's bullet lit (PageRank's walk, SOLO_SEED, one window in
 * place of the six), the pages visited listed under the window; 2: the question PageRank answers;
 * 3: an arrow to what it means, a page's importance (the user's wording).
 * In print mode: the cursor clicking Math 51's link to Markov chain.
 */
export default function Slide19bSurfer() {
  const marker = useRef(null);
  const run = useFragmentShown(marker);
  const onScreen = useOnScreen(marker);
  const rand = useMemo(() => rng(SOLO_SEED), []);
  const [walk, setWalk] = useState(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (PRINT || !run || !onScreen) return undefined;
    let frame;
    const step = (time) => {
      setNow(time);
      setWalk((w) => {
        if (w === null) return { m: { from: 0, ...pick(0, rand) }, done: [0], t0: time };
        if (time - w.t0 < MOVE) return w;
        const from = w.m.to;
        return { m: { from, ...pick(from, rand) }, done: [...w.done, from].slice(-20), t0: time - w.t0 >= 2 * MOVE ? time : w.t0 + MOVE };
      });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [run, onScreen, rand]);
  // back before key press 1: on Math 51 again
  useEffect(() => {
    if (!run) setWalk(null);
  }, [run]);

  const w = PRINT ? PRINT_WALK : walk;
  const t = PRINT ? 0.36 : w ? clamp((now - w.t0) / MOVE) : IDLE.t;
  const m = w ? w.m : IDLE.m;
  const doing = w && t < 0.6 ? m.kind : null;
  const seen = w ? (t >= 0.6 ? [...w.done, m.to] : w.done) : [0];
  const shown = seen.slice(-TRAIL);

  return (
    <section>
      <h2>Random surfer on the internet</h2>
      <span ref={marker} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />

      <div className="l16-rs">
        <div>
          <Browser m={m} t={t} />
          <p className="l16-rs-trail">
            Visited: {seen.length > TRAIL && '… → '}
            {shown.map((i, q) => (
              <span key={q} className={q === shown.length - 1 ? 'l16-rs-here' : undefined}>
                {q > 0 && ' → '}
                {PAGES[i].name}
              </span>
            ))}
          </p>
        </div>
        <div className="l16-rs-text">
          <p>A random surfer, on each page:</p>
          <ul className="bullets l16-pr-bullets">
            <li className={doing === 'link' ? 'l16-pr-on' : undefined}>clicks a random link (85%)</li>
            <li className={doing === 'jump' ? 'l16-pr-on' : undefined}>jumps to a random page (15%)</li>
          </ul>
          <Fragment index={2} as="p" className="l16-rs-ask">
            In the long run, what fraction of the time does the surfer spend on each page?
          </Fragment>
          <Fragment index={3} as="p" className="l16-rs-so">
            <span className="l16-rs-arrow" aria-hidden="true">
              &rarr;
            </span>{' '}
            longer time indicates importance of a webpage
          </Fragment>
        </div>
      </div>
    </section>
  );
}
