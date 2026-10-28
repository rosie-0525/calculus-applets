import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import { matvec, clamp, rng, useOnScreen } from '../lectures/l16/components/markov.js';
import { PAGES, G, U, SW, SH, TICK, MOVE, Web, Status, Ticks, Surfers, allOn, click, toU } from '../lectures/l16/slides/Slide13PageRank.jsx';

export const lecture = 16;

const f3 = (x) => x.toFixed(3).replace(/^0/, '');
const G_TEX = G.map((row) => row.map(f3).join('&')).join('\\\\ ');
const U_TEX = U.map(f3).join('\\\\ ');
const NAMES = PAGES.map((p) => `\\textsf{${p.name}}`).join('\\\\ ');

/*
 * PageRank, its 300 surfers: the small web, each page a browser window, and the surfers, all on
 * Math 51 at first, clicking at once (85% a random link, 15% a random page), each window's status
 * bar showing its entry of p_k = M^k p_0, which settles at u. A click on a page puts all the
 * surfers there. Show u adds M^k → [u ⋯ u] with u's entries and the pages' names, and a tick for u
 * on each status bar, and the surfers move to where u puts them and stop; pressed again, they all
 * start on Math 51 again. On the slide one surfer goes first (random-surfer.jsx), and the rest
 * come on key presses; the clicks run only while the applet is on screen.
 */
export default function PageRankSurfers() {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const [settled, setSettled] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [crowd, setCrowd] = useState(() => allOn(0, 0));
  const [now, setNow] = useState(0);
  const rand = useMemo(() => rng(51), []);

  // the surfers' clicks, TICK ms each, until u is shown (then their last move, to u, and the
  // clock stops)
  useEffect(() => {
    if (!onScreen || frozen) return undefined;
    let frame;
    const step = (time) => {
      setNow(time);
      if (!settled) setCrowd((s) => (time - s.t0 >= TICK ? { from: s.to, to: click(s.to, rand), p: s.q, q: matvec(G, s.q), t0: time } : s));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [onScreen, settled, frozen, rand]);
  useEffect(() => {
    setFrozen(false);
    if (!settled) return undefined;
    setCrowd((s) => toU(s, performance.now()));
    const id = setTimeout(() => {
      setNow(performance.now());
      setFrozen(true);
    }, TICK);
    return () => clearTimeout(id);
  }, [settled]);
  const onPage = useCallback((i) => setCrowd(allOn(i, performance.now())), []);
  const toggle = () => {
    if (settled) setCrowd(allOn(0, performance.now()));
    setSettled(!settled);
  };

  const t = clamp((now - crowd.t0) / TICK);
  return (
    <div className="viz-col" ref={ref}>
      <div className="l16-pr">
        <svg className="l16-pr-web" viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH} role="img" aria-label="Six web pages and their links, with the surfers on them">
          <Web onPage={settled ? undefined : onPage} />
          <Status shares={t > MOVE ? crowd.q : crowd.p} />
          {settled && <Ticks />}
          <Surfers from={crowd.from} to={crowd.to} t={t} />
        </svg>
        <div className="l16-pr-text">
          <p className="l16-pr-credit">Google, 1998: Larry Page and Sergey Brin</p>
          <p>A random surfer:</p>
          <ul className="bullets l16-pr-bullets">
            <li>clicks a random link (85%)</li>
            <li>jumps to a random page (15%)</li>
          </ul>
          <p>This is modeled by a Markov chain</p>
          <Tex display tex={r`M=\begin{bmatrix}${G_TEX}\end{bmatrix}`} className="l16-pr-m" />
          {/* hidden, not left out, until u is shown: the applet keeps its height */}
          <div style={{ visibility: settled ? 'visible' : 'hidden' }}>
            <Tex
              display
              className="l16-pr-m"
              tex={r`M^k\to\begin{bmatrix}\mathbf u&\cdots&\mathbf u\end{bmatrix},\qquad\mathbf u\approx\begin{bmatrix}${U_TEX}\end{bmatrix}\color{#6b7280}\begin{array}{l}${NAMES}\end{array}`}
            />
          </div>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={settled} onClick={toggle}>
          Show u
        </button>
      </div>
    </div>
  );
}
