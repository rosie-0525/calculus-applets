import { useEffect, useMemo, useRef, useState } from 'react';
import '../lectures/l16/styles/deck.css';
import { clamp, rng, useOnScreen } from '../lectures/l16/components/markov.js';
import { PAGES, pick, SOLO_SEED } from '../lectures/l16/slides/Slide13PageRank.jsx';
import { Browser, MOVE, TRAIL } from '../lectures/l16/slides/Slide19bSurfer.jsx';

export const lecture = 16;

/*
 * Random surfer on the internet: one browser window, one page at a time; the surfer, a mouse
 * cursor, clicks a random link on the page (85%) or types in a random page (15%), and the window
 * goes there, over and over, the move's bullet lit, the last pages visited listed under the window.
 * On the slide the walk starts on a key press; here it runs while the applet is on screen. The
 * slide's question, the fraction of the time on each page, is the caption.
 */
export default function RandomSurfer() {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const rand = useMemo(() => rng(SOLO_SEED), []);
  const [walk, setWalk] = useState(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!onScreen) return undefined;
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
  }, [onScreen, rand]);

  // before the first move: on Math 51, the cursor at rest
  const t = walk ? clamp((now - walk.t0) / MOVE) : 0.9;
  const m = walk ? walk.m : { from: 0, kind: 'idle', to: 0 };
  const doing = walk && t < 0.6 ? m.kind : null;
  const seen = walk ? (t >= 0.6 ? [...walk.done, m.to] : walk.done) : [0];
  const shown = seen.slice(-TRAIL);

  return (
    <div className="l16-rs" ref={ref}>
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
      </div>
    </div>
  );
}
