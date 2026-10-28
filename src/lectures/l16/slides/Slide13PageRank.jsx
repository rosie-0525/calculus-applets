import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Emoji from '../components/Emoji.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, matvec, ease, clamp, rng, useOnScreen, head } from '../components/markov.js';

// A small, realistic web (the user's request): Math 51's page links to Wikipedia's Markov chain
// and PageRank, which link to each other and to Andrey Markov; a pizza shop's home page and menu
// link to each other. No link joins the math pages and the pizza pages, and none leads to Math 51:
// by links alone the web is not connected; the random jumps connect it. Each page: its favicon
// (W: Wikipedia), its address as the browser shows it, what a jump types in (`go`), its links
// (anchor text and page).
export const PAGES = [
  { id: 'math', icon: '📐', name: 'Math 51', url: 'math51.stanford.edu', go: 'math51.stanford.edu', at: [107, 391], links: [['Markov chain', 'chain'], ['PageRank', 'pr']] },
  { id: 'chain', icon: 'W', name: 'Markov chain', url: 'en.wikipedia.org', go: 'markov chain', at: [370, 391], links: [['Andrey Markov', 'markov'], ['PageRank', 'pr']] },
  { id: 'markov', icon: 'W', name: 'Andrey Markov', url: 'en.wikipedia.org', go: 'andrey markov', at: [370, 85], links: [['Markov chain', 'chain']] },
  { id: 'pr', icon: 'W', name: 'PageRank', url: 'en.wikipedia.org', go: 'pagerank', at: [107, 85], links: [['Markov chain', 'chain']] },
  { id: 'pizza', icon: '🍕', name: 'Pizza', url: 'pizza.com', go: 'pizza.com', at: [633, 85], links: [['Menu', 'menu']] },
  { id: 'menu', icon: '🍕', name: 'Menu', url: 'pizza.com', go: 'pizza.com/menu', at: [633, 391], links: [['Home', 'pizza']] },
];
export const LINKED = (p) => p.links.map(([, id]) => id);
export const N = PAGES.length;
export const IDX = Object.fromEntries(PAGES.map((p, i) => [p.id, i]));
export const D = 0.85; // the share of clicks (Brin and Page's damping factor)
// Google's matrix: from page j, each of its links with chance 0.85/(its number of links), and every
// page with chance 0.15/5
export const G = PAGES.map((to) => PAGES.map((from) => (LINKED(from).includes(to.id) ? D / from.links.length : 0) + (1 - D) / N));
export const U = (() => {
  let u = Array(N).fill(1 / N);
  for (let k = 0; k < 400; k += 1) u = matvec(G, u);
  return u;
})();

// the picture, and each page drawn as a browser window (title bar, address bar, the page)
export const SW = 740;
export const SH = 476;
export const WW = 214;
export const WH = 150;
export const BAR = WW - 74; // the share's bar, in the window's status bar
export const SURFERS = 300;
export const TICK = 1100; // ms per click of the 300 surfers
export const MOVE = 0.6; // the share of a tick spent on the move
export const SOLO = 2600; // ms per click of the one surfer
export const SOLO_SEED = 24; // its walk: Wikipedia's pages, then a jump to the pizza pages, stuck there for a while, and back
export const BLUE = '#2563eb';

export const corner = (i) => [PAGES[i].at[0] - WW / 2, PAGES[i].at[1] - WH / 2];
export const lerp = (a, b, e) => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
export const quad = (a, c, b, e) => lerp(lerp(a, c, e), lerp(c, b, e), e);

/** Along a link's arrow, e from 0 to 1: from the clicked link out to the arrow, along it, and in to the page. */
export function alongLink(target, { p0, c, p1 }, end, e) {
  if (e < 0.2) return lerp(target, p0, e / 0.2);
  if (e < 0.8) return quad(p0, c, p1, (e - 0.2) / 0.6);
  return lerp(p1, end, (e - 0.8) / 0.2);
}

/** The point where the segment from the center of window a towards b leaves window a. */
export function exit(a, b) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const s = Math.min((WW / 2 + 6) / Math.abs(dx || 1e-9), (WH / 2 + 6) / Math.abs(dy || 1e-9));
  return [a[0] + dx * s, a[1] + dy * s];
}

/** The link from page i to page j: an arrow between the windows, bent when the link back exists. */
export function linkGeom(i, j) {
  const a = PAGES[i].at;
  const b = PAGES[j].at;
  const bend = LINKED(PAGES[j]).includes(PAGES[i].id) ? 26 : 0;
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy);
  const c = [(a[0] + b[0]) / 2 - (dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
  return { p0: exit(a, c), c, p1: exit(b, c) };
}
export const LINKS = PAGES.flatMap((p, i) => LINKED(p).map((id) => ({ i, j: IDX[id], ...linkGeom(i, IDX[id]) })));
export const arrowD = ({ p0, c, p1 }) => `M${p0.join(',')} Q${c.join(',')} ${p1.join(',')}`;

// where the one surfer points: the middle of link k on page i, the address bar, and its spot on
// the page between clicks
export const linkPoint = (i, k) => {
  const [x0, y0] = corner(i);
  return [x0 + 14 + PAGES[i].links[k][0].length * 4.2, y0 + 84 + 18 * k];
};
export const urlPoint = (i) => [corner(i)[0] + WW - 20, corner(i)[1] + 12]; // the address bar's right end: the typing shows
export const rest = (i) => [corner(i)[0] + 162, corner(i)[1] + 92];

/** A page's favicon: an emoji, or Wikipedia's W. */
export function Favicon({ icon, x, y }) {
  if (icon !== 'W') return <Emoji ch={icon} x={x} y={y} size={22} />;
  return (
    <g>
      <circle cx={x} cy={y} r={10.5} fill="#fff" stroke="#9ca3af" strokeWidth="1.2" />
      <text x={x} y={y + 5} textAnchor="middle" className="l16-pr-wiki">
        W
      </text>
    </g>
  );
}

/** Page i as a browser window: its title bar, address bar, title, text and links (blue, underlined). */
export function Window({ i, onPage }) {
  const p = PAGES[i];
  const [x0, y0] = corner(i);
  return (
    <g className={onPage ? 'clickable' : undefined} onClick={onPage ? () => onPage(i) : undefined}>
      <rect x={x0} y={y0} width={WW} height={WH} rx={10} fill="#fff" />
      <path d={`M${x0},${y0 + 24} V${y0 + 10} a10,10 0 0 1 10,-10 H${x0 + WW - 10} a10,10 0 0 1 10,10 V${y0 + 24} Z`} fill="#e5e7eb" />
      {['#ef4444', '#f59e0b', '#22c55e'].map((c, k) => (
        <circle key={c} cx={x0 + 13 + 12 * k} cy={y0 + 12} r={4.2} fill={c} />
      ))}
      <rect x={x0 + 50} y={y0 + 4} width={WW - 58} height={16} rx={8} fill="#fff" />
      <text x={x0 + 58} y={y0 + 16.5} className="l16-pr-url">
        {p.url}
      </text>
      <Favicon icon={p.icon} x={x0 + 24} y={y0 + 43} />
      <text x={x0 + 42} y={y0 + 49} className="l16-pr-name" fill={INK}>
        {p.name}
      </text>
      <rect x={x0 + 14} y={y0 + 60} width={96} height={4} rx={2} fill="#e5e7eb" />
      <rect x={x0 + 14} y={y0 + 67} width={74} height={4} rx={2} fill="#e5e7eb" />
      {p.links.map(([text, id], k) => (
        <text key={id} x={x0 + 14} y={y0 + 89 + 18 * k} className="l16-pr-link">
          {text}
        </text>
      ))}
      <rect x={x0} y={y0} width={WW} height={WH} rx={10} fill="none" stroke="#9ca3af" strokeWidth="1.5" />
    </g>
  );
}

/** The web, drawn once: the links as arrows, the pages as windows over them. */
export const Web = memo(function Web({ onPage }) {
  return (
    <g>
      {LINKS.map((l) => (
        <g key={`${l.i}-${l.j}`}>
          <path d={arrowD(l)} fill="none" stroke="#9ca3af" strokeWidth="2.4" />
          <polygon points={head(l.c, l.p1)} fill="#9ca3af" />
        </g>
      ))}
      {PAGES.map((p, i) => (
        <Window key={p.id} i={i} onPage={onPage} />
      ))}
    </g>
  );
});

/** The one surfer's next move from page i: a random link (85%), or a random page typed in (15%). */
export function pick(i, rand) {
  if (rand() < D) {
    const k = Math.floor(rand() * PAGES[i].links.length);
    return { kind: 'link', k, to: IDX[PAGES[i].links[k][1]] };
  }
  return { kind: 'jump', to: Math.floor(rand() * N) };
}

/**
 * The one surfer, its move m (from page m.from) at phase t (0 to 1): the cursor goes to the link
 * (or the address bar) and clicks, the link turning purple (or the next page's address typed in);
 * then it flies along the link's arrow (or a dashed jump) to the next page, which lights up.
 */
export function Solo({ m, t }) {
  const target = m.kind === 'link' ? linkPoint(m.from, m.k) : urlPoint(m.from);
  const end = rest(m.to);
  const link = m.kind === 'link' ? linkGeom(m.from, m.to) : null;
  const c = link ? link.c : m.to === m.from ? [end[0] + 60, end[1] - 120] : [(target[0] + end[0]) / 2, Math.min(target[1], end[1]) - 70];
  const fly = t >= 0.45 && t < 0.85 ? ease((t - 0.45) / 0.4) : null;
  let at = end;
  if (t < 0.28) at = lerp(rest(m.from), target, ease(t / 0.28));
  else if (t < 0.45) at = target;
  else if (fly !== null) at = link ? alongLink(target, link, end, fly) : quad(target, c, end, fly);
  const page = t < 0.85 ? m.from : m.to;
  const [x0, y0] = corner(page);
  const [fx, fy] = corner(m.from);
  const [tx, ty] = corner(m.to);
  const clicked = t >= 0.3 && t < 0.85;
  const ripple = t >= 0.3 && t < 0.6 ? (t - 0.3) / 0.3 : null;
  const arrive = t >= 0.85 ? (t - 0.85) / 0.15 : null;
  const url = PAGES[m.to].go;
  const press = t >= 0.3 && t < 0.38;
  return (
    <g>
      <rect x={x0 - 3} y={y0 - 3} width={WW + 6} height={WH + 6} rx={13} fill="none" stroke={BLUE} strokeWidth="3" />
      {arrive !== null && (
        <rect x={tx - 3} y={ty - 3} width={WW + 6} height={WH + 6} rx={13} fill="none" stroke={BLUE} strokeWidth={3 + 14 * (1 - arrive)} opacity={0.45 * (1 - arrive)} />
      )}
      {clicked && link && (
        <>
          <rect x={fx + 10} y={fy + 75 + 18 * m.k} width={PAGES[m.from].links[m.k][0].length * 8.4 + 8} height={19} rx={4} fill="#ede9fe" />
          <text x={fx + 14} y={fy + 89 + 18 * m.k} className="l16-pr-link l16-pr-visited">
            {PAGES[m.from].links[m.k][0]}
          </text>
        </>
      )}
      {clicked && !link && (
        <>
          <rect x={fx + 50} y={fy + 4} width={WW - 58} height={16} rx={8} fill="#fff" stroke={BLUE} strokeWidth="1.5" />
          <text x={fx + 58} y={fy + 16.5} className="l16-pr-url l16-pr-typed">
            {url.slice(0, Math.ceil(url.length * clamp((t - 0.3) / 0.15)))}
          </text>
        </>
      )}
      {fly !== null && link && <path d={arrowD(link)} fill="none" stroke={BLUE} strokeWidth="4" />}
      {fly !== null && !link && (
        <polyline
          points={Array.from({ length: 25 }, (_, q) => quad(target, c, end, (fly * q) / 24).map((v) => v.toFixed(1)).join(',')).join(' ')}
          fill="none"
          stroke={BLUE}
          strokeWidth="3"
          strokeDasharray="8 7"
        />
      )}
      {ripple !== null && <circle cx={target[0]} cy={target[1]} r={5 + 20 * ripple} fill="none" stroke={BLUE} strokeWidth="3" opacity={0.85 * (1 - ripple)} />}
      <path
        transform={`translate(${at[0].toFixed(1)},${at[1].toFixed(1)}) scale(${press ? 1.1 : 1.3})`}
        d="M0,0 L0,17 L4.6,13.2 L7.6,20 L10.4,18.8 L7.5,12.2 L13,12.2 Z"
        fill="#fff"
        stroke="#111827"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Where surfer s sits on page i: a spot of its own in the window's lower right part. */
export const spot = (i, s) => {
  const g = rng(1000 * i + s + 7);
  const [x0, y0] = corner(i);
  return [x0 + 122 + 82 * g(), y0 + 58 + 64 * g()];
};

/** The surfers' pages after one more click each (85%: a random link; 15%: a random page). */
export function click(pages, rand) {
  return pages.map((i) => {
    if (rand() < D) {
      const ls = LINKED(PAGES[i]);
      return IDX[ls[Math.floor(rand() * ls.length)]];
    }
    return Math.floor(rand() * N);
  });
}

/** The surfers at their pages: `from` → `to` at phase t (0 to 1). */
export function Surfers({ from, to, t }) {
  const e = ease(clamp(t / MOVE));
  return (
    <g>
      {to.map((j, s) => {
        const a = spot(from[s], s);
        const b = spot(j, s);
        const lift = from[s] === j ? 0 : -40 * Math.sin(Math.PI * e);
        return <circle key={s} cx={(a[0] + (b[0] - a[0]) * e).toFixed(1)} cy={(a[1] + (b[1] - a[1]) * e + lift).toFixed(1)} r="2.6" className="l16-surfer" />;
      })}
    </g>
  );
}

/** Each window's status bar: the share of the surfers on the page, and its PageRank as a tick. */
export function Status({ shares }) {
  return (
    <g>
      {PAGES.map((p, i) => {
        const [x0, y0] = corner(i);
        return (
          <g key={p.id}>
            <line x1={x0 + 1} x2={x0 + WW - 1} y1={y0 + 128} y2={y0 + 128} stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x={x0 + 14} y={y0 + 135} width={BAR} height={7} rx={3.5} fill="#e5e7eb" />
            <rect x={x0 + 14} y={y0 + 135} width={BAR * Math.min(1, shares[i] / 0.5)} height={7} rx={3.5} fill={RED} />
            <text x={x0 + WW - 12} y={y0 + 143.5} textAnchor="end" className="l16-pr-share" fill={RED}>
              {Math.round(100 * shares[i])}%
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function Ticks() {
  return (
    <g>
      {PAGES.map((p, i) => {
        const [x0, y0] = corner(i);
        const x = x0 + 14 + (BAR * U[i]) / 0.5;
        return <line key={p.id} x1={x} x2={x} y1={y0 + 131} y2={y0 + 146} stroke={INK} strokeWidth="3" />;
      })}
    </g>
  );
}

// the surfers' pages before and after the click, and the probabilities p_k = M^k p_0 and p_{k+1}:
// the status bars show these, which settle at u (300 surfers' own counts keep jiggling by a few
// percent: the user asked why the picture did not settle)
export const allOn = (i, t0) => {
  const e = PAGES.map((_, j) => (j === i ? 1 : 0));
  return { from: Array(SURFERS).fill(i), to: Array(SURFERS).fill(i), p: e, q: e, t0 };
};

// each page's number of surfers as u spreads the 300 (largest remainders, so that they add up to 300)
export const QUOTA = (() => {
  const c = U.map((u) => Math.floor(u * SURFERS));
  const left = SURFERS - c.reduce((a, b) => a + b, 0);
  [...U.keys()].sort((i, j) => ((U[j] * SURFERS) % 1) - ((U[i] * SURFERS) % 1)).slice(0, left).forEach((i) => (c[i] += 1));
  return c;
})();

/**
 * The surfers spread as u says, the fewest of them moving: as many as its quota stay on each page,
 * the others go where pages are short; from where they are, in one move (t0), and then no more.
 */
export function toU(s, t0) {
  const kept = Array(N).fill(0);
  const to = s.to.map((i) => (kept[i] < QUOTA[i] ? ((kept[i] += 1), i) : -1));
  let j = 0;
  to.forEach((i, k) => {
    if (i >= 0) return;
    while (kept[j] >= QUOTA[j]) j += 1;
    kept[j] += 1;
    to[k] = j;
  });
  return { from: s.to, to, p: U, q: U, t0 };
}

// print mode: the one surfer clicking Math 51's link to Markov chain; the 300 surfers as u spreads them
export const PRINT_SOLO = { from: 0, kind: 'link', k: 0, to: 1 };
export const PRINT_PAGES = QUOTA.flatMap((c, i) => Array(c).fill(i));

/**
 * PageRank (an application of the theorem, after it), its pages as browser windows (the user's
 * request). Key press 1: one random surfer, a mouse cursor: it clicks a random link (85%) or types
 * in a random page (15%), and jumps there, over and over, the move's bullet lit; 2: the Markov
 * chain that models this, Google's matrix M (the user's wording); 3: 300 surfers, all on Math 51 at
 * first, clicking at once: the windows' status bars show p_k = M^k p_0, which settles at u in about
 * 20 clicks; 4: M^k → [u ⋯ u] and u's entries, a tick for u on each status bar, the surfers
 * moving at once to where u puts them and stopping there (the user's request); 5: each entry's page
 * name beside it (the user's request: with the line in blue), and across the bottom, in blue, the stationary distribution u as the websites'
 * importance, which Google ranks them by (the user's wording, shortened; why M^k converges, every
 * entry of M positive, is left out at the user's request; the ranking in words removed: the bars
 * show it). Until key press 4, a click on a page puts all the surfers there. In print mode: the cursor clicking Math 51's link to Markov chain; the surfers
 * spread as u says.
 */
export default function Slide13PageRank() {
  const m1 = useRef(null);
  const m3 = useRef(null);
  const m4 = useRef(null);
  const run1 = useFragmentShown(m1);
  const run2 = useFragmentShown(m3);
  const settled = useFragmentShown(m4);
  const [frozen, setFrozen] = useState(false);
  const onScreen = useOnScreen(m1);
  const [crowd, setCrowd] = useState(() => allOn(0, 0));
  const [solo, setSolo] = useState(null);
  const [now, setNow] = useState(0);
  const rand = useMemo(() => rng(51), []);
  const soloRand = useMemo(() => rng(SOLO_SEED), []);

  // key press 1: the one surfer's moves, SOLO ms each; 3: the 300 surfers' clicks, TICK ms each,
  // until key press 4 (then their last move, to u, and the clock stops)
  useEffect(() => {
    if (PRINT || !(run1 || run2) || !onScreen || frozen) return undefined;
    let frame;
    const step = (time) => {
      setNow(time);
      if (!run2)
        setSolo((s) => {
          if (s === null) return { from: 0, ...pick(0, soloRand), t0: time };
          if (time - s.t0 < SOLO) return s;
          return { from: s.to, ...pick(s.to, soloRand), t0: time - s.t0 >= 2 * SOLO ? time : s.t0 + SOLO };
        });
      else if (!settled) setCrowd((s) => (time - s.t0 >= TICK ? { from: s.to, to: click(s.to, rand), p: s.q, q: matvec(G, s.q), t0: time } : s));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [run1, run2, settled, onScreen, frozen, rand, soloRand]);
  useEffect(() => {
    if (PRINT) return undefined;
    setFrozen(false);
    if (!settled) return undefined;
    setCrowd((s) => toU(s, performance.now()));
    const id = setTimeout(() => {
      setNow(performance.now());
      setFrozen(true);
    }, TICK);
    return () => clearTimeout(id);
  }, [settled]);
  // back before a key press: the one surfer on Math 51 again, or every surfer on Math 51
  useEffect(() => {
    if (!run1) setSolo(null);
  }, [run1]);
  useEffect(() => {
    if (!run2) setCrowd(allOn(0, 0));
  }, [run2]);
  const onPage = useCallback((i) => setCrowd(allOn(i, performance.now())), []);

  let surfers;
  let shares;
  let soloPic = null;
  let doing = null;
  if (PRINT) {
    surfers = <Surfers from={PRINT_PAGES} to={PRINT_PAGES} t={1} />;
    shares = U;
    soloPic = <Solo m={PRINT_SOLO} t={0.36} />;
  } else {
    const t = clamp((now - crowd.t0) / TICK);
    surfers = <Surfers from={crowd.from} to={crowd.to} t={t} />;
    shares = t > MOVE ? crowd.q : crowd.p;
    if (solo) {
      const ts = clamp((now - solo.t0) / SOLO);
      soloPic = <Solo m={solo} t={ts} />;
      if (!run2 && ts < 0.85) doing = solo.kind;
    }
  }

  const f3 = (x) => x.toFixed(3).replace(/^0/, '');
  const gTex = G.map((row) => row.map(f3).join('&')).join('\\\\ ');
  const uTex = U.map(f3).join('\\\\ ');
  const names = PAGES.map((p) => `\\textsf{${p.name}}`).join('\\\\ ');
  return (
    <section className="dense">
      <h2>PageRank</h2>
      <span ref={m1} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <span ref={m3} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <span ref={m4} className="fragment fx-marker" data-fragment-index={4} aria-hidden="true" />

      <div className="l16-pr">
        <svg className="l16-pr-web" viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH} aria-hidden="true">
          <Web onPage={PRINT || settled ? undefined : onPage} />
          <Fragment as="g" index={3}>
            <Status shares={shares} />
            <Fragment as="g" index={4}>
              <Ticks />
            </Fragment>
            {surfers}
          </Fragment>
          <Fragment as="g" index={1}>
            <Fragment as="g" index={3} effect="fade-out">
              {soloPic}
            </Fragment>
          </Fragment>
        </svg>
        <div className="l16-pr-text">
          <p className="l16-pr-credit">Google, 1998: Larry Page and Sergey Brin</p>
          <p>A random surfer:</p>
          <ul className="bullets l16-pr-bullets">
            <li className={doing === 'link' ? 'l16-pr-on' : undefined}>clicks a random link (85%)</li>
            <li className={doing === 'jump' ? 'l16-pr-on' : undefined}>jumps to a random page (15%)</li>
          </ul>
          <Fragment index={2}>
            <p>This is modeled by a Markov chain</p>
            <Tex display tex={r`M=\begin{bmatrix}${gTex}\end{bmatrix}`} className="l16-pr-m" />
          </Fragment>
          <Fragment index={4} className="l16-pr-u">
            <Tex
              display
              className="l16-pr-m"
              tex={r`M^k\to\begin{bmatrix}\mathbf u&\cdots&\mathbf u\end{bmatrix},\qquad\mathbf u\approx\begin{bmatrix}${uTex}\end{bmatrix}\color{transparent}\begin{array}{l}${names}\end{array}`}
            />
            {/* the pages' names, on key press 5 with the line in blue (the user's request): the same
                formula over it, only its names shown, so that each sits beside its entry of u */}
            <Fragment index={5} className="l16-pr-u-names">
              <Tex
                display
                className="l16-pr-m"
                tex={r`\color{transparent}M^k\to\begin{bmatrix}\mathbf u&\cdots&\mathbf u\end{bmatrix},\qquad\mathbf u\approx\begin{bmatrix}${uTex}\end{bmatrix}\color{#6b7280}\begin{array}{l}${names}\end{array}`}
              />
            </Fragment>
          </Fragment>
        </div>
      </div>
      <Fragment index={5} as="p" className="l16-pr-bottom">
        The stationary distribution <Tex tex={r`\mathbf u`} /> indicates each website’s “importance”, and Google uses it to rank the Internet.
      </Fragment>
    </section>
  );
}
