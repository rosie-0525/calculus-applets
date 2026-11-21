import { useEffect, useRef, useState } from 'react';
import Figure from './Figure.jsx';

/*
 * One applet on the page. Its module (src/viz/<id>.jsx) is loaded when the reader scrolls near it.
 * A module exports the visualization as its default, and:
 *   lecture   the lecture whose stylesheet it uses (required)
 *   zoom      optional, a scale for the whole visualization (default 1)
 *   width     optional, a fixed width in px for its box (default: as wide as its content)
 *   story     optional, true for a story: text with pictures in it (see Story.jsx). Its default
 *             is then drawn as it is, in the page's column, and puts each of its pictures in a
 *             Figure itself; otherwise the default is drawn in one Figure (Figure.jsx).
 */
export default function Applet({ applet, load }) {
  const outer = useRef(null);
  const [mod, setMod] = useState(null);
  const [error, setError] = useState(null);
  const [near, setNear] = useState(false);

  // Load the module once the applet is within a screen or two of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: '1200px 0px',
    });
    io.observe(outer.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (near && !mod) load().then(setMod, setError);
  }, [near, mod, load]);

  const Viz = mod?.default;
  if (Viz && mod.story) {
    return (
      <div className={`story story-${applet.id}`} ref={outer}>
        <Viz />
      </div>
    );
  }
  if (Viz) {
    return (
      <div ref={outer}>
        <Figure lecture={mod.lecture} zoom={mod.zoom} width={mod.width} label={applet.title}>
          <Viz />
        </Figure>
      </div>
    );
  }
  return (
    <div className="viz" ref={outer}>
      <div className="viz-box">
        {error ? <p className="viz-error">This applet did not load. Reload the page to try again.</p> : <div className="viz-placeholder" />}
      </div>
    </div>
  );
}
