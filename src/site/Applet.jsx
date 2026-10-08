import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/*
 * One visualization on the page. Its module (src/viz/<id>.jsx) is loaded when the reader scrolls
 * near it, and rendered the way the lecture deck renders it, so the deck's styles apply:
 *
 *   <div class="viz-scale lec-N">          the lecture's scoped stylesheet (see vite.config.js)
 *     <div class="reveal"><div class="slides">
 *       <section class="present">          `present` only while on screen: the 3-D pictures rock
 *         <Viz />                          and the games run only then
 *
 * Every build step ("fragment") of the slide is shown. The text is set smaller than on a slide,
 * and the whole thing is scaled down to fit a narrow window. In a box narrower than NARROW, the
 * figures that sit side by side are stacked instead (the `narrow` class, see site.css).
 *
 * A module exports the visualization as its default, and:
 *   lecture   the lecture whose stylesheet it uses (required)
 *   zoom      optional, a scale for the whole visualization (default 1)
 *   width     optional, a fixed width in px for its box (default: as wide as its content)
 */

/** Keep every fragment of the slide visible, including ones React adds or re-renders later. */
function useAllFragments(ref, ready) {
  useEffect(() => {
    const root = ref.current;
    if (!ready || !root) return undefined;
    const show = () =>
      root.querySelectorAll('.fragment:not(.visible)').forEach((f) => f.classList.add('visible'));
    show();
    const mo = new MutationObserver(show);
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [ref, ready]);
}

const NARROW = 640;

export default function Applet({ applet, load }) {
  const outer = useRef(null);
  const box = useRef(null);
  const inner = useRef(null);
  const section = useRef(null);
  const [mod, setMod] = useState(null);
  const [error, setError] = useState(null);
  const [near, setNear] = useState(false);
  const [size, setSize] = useState(null); // { scale, height }
  const [narrow, setNarrow] = useState(false);

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

  // `present` while on screen.
  useEffect(() => {
    if (!mod) return undefined;
    const io = new IntersectionObserver(([e]) => section.current?.classList.toggle('present', e.isIntersecting), {
      rootMargin: '100px 0px',
    });
    io.observe(outer.current);
    return () => io.disconnect();
  }, [mod]);

  useAllFragments(section, !!mod);

  // Scale to fit: the natural size is measured before the transform.
  useLayoutEffect(() => {
    if (!mod) return undefined;
    const fit = () => {
      const w = inner.current.offsetWidth;
      const h = inner.current.offsetHeight;
      const avail = box.current.clientWidth;
      setNarrow(avail < NARROW);
      const scale = Math.min(mod.zoom ?? 1, avail / w);
      setSize((s) => (s && s.scale === scale && s.height === h * scale ? s : { scale, height: h * scale }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(inner.current);
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [mod]);

  const Viz = mod?.default;
  return (
    <div className="viz" ref={outer} data-ready={size ? '' : undefined}>
      <div className="viz-box" ref={box} style={{ height: size ? size.height : undefined }}>
        {error && <p className="viz-error">This applet did not load.</p>}
        {!mod && !error && <div className="viz-placeholder" />}
        {Viz && (
          <div
            className={`viz-scale lec-${mod.lecture}${narrow ? ' narrow' : ''}`}
            ref={inner}
            style={{
              width: mod.width,
              transform: size ? `translateX(-50%) scale(${size.scale})` : 'translateX(-50%)',
              visibility: size ? 'visible' : 'hidden',
            }}
          >
            <div className="reveal">
              <div className="slides">
                <section ref={section} aria-label={applet.title}>
                  <Viz />
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
