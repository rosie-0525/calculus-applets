import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/*
 * One picture on the page, drawn the way the lecture deck draws it, so that the deck's styles
 * apply: an applet (Applet.jsx), or one of the figures of a story (Story.jsx).
 *
 *   <div class="viz">                      the grey stage
 *     <div class="viz-scale lec-N">        the lecture's scoped stylesheet (see vite.config.js)
 *       <div class="reveal"><div class="slides">
 *         <section class="present">        `present` only while on screen: the 3-D pictures rock
 *           {children}                     and the games run only then
 *
 * Every build step ("fragment") of the slide is shown. The text is set smaller than on a slide,
 * and the whole thing is scaled down to fit a narrow window. In a box narrower than NARROW, the
 * figures that sit side by side are stacked instead (the `narrow` class, see site.css).
 *
 *   lecture   the lecture whose stylesheet it uses (required)
 *   zoom      optional, a scale for the whole picture (default 1)
 *   width     optional, a fixed width in px for its box (default: as wide as its content)
 *   label     what a screen reader calls it
 *   align     'center' (the default), or 'left': at the left of its box, as a story's pictures are
 */

/** Keep every fragment of the slide visible, including ones React adds or re-renders later. */
function useAllFragments(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const show = () =>
      root.querySelectorAll('.fragment:not(.visible)').forEach((f) => f.classList.add('visible'));
    show();
    const mo = new MutationObserver(show);
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [ref]);
}

const NARROW = 640;

export default function Figure({ lecture, zoom = 1, width, label, align = 'center', children }) {
  const outer = useRef(null);
  const box = useRef(null);
  const inner = useRef(null);
  const section = useRef(null);
  const [size, setSize] = useState(null); // { scale, height }
  const [narrow, setNarrow] = useState(false);

  // `present` while on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => section.current?.classList.toggle('present', e.isIntersecting), {
      rootMargin: '100px 0px',
    });
    io.observe(outer.current);
    return () => io.disconnect();
  }, []);

  useAllFragments(section);

  // Scale to fit: the natural size is measured before the transform.
  useLayoutEffect(() => {
    const fit = () => {
      const w = inner.current.offsetWidth;
      const h = inner.current.offsetHeight;
      const avail = box.current.clientWidth;
      // A box with no width (the window shrunk to nothing for a moment, as headless Chrome does
      // while it takes a screenshot): keep the last fit, or the picture is drawn at scale 0 and
      // stacked, and is caught half-way on its way back.
      if (!avail) return;
      setNarrow(avail < NARROW);
      const scale = Math.min(zoom, avail / w);
      setSize((s) => (s && s.scale === scale && s.height === h * scale ? s : { scale, height: h * scale }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(inner.current);
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [zoom]);

  return (
    <div className={`viz${align === 'left' ? ' viz-left' : ''}`} ref={outer} data-ready={size ? '' : undefined}>
      <div className="viz-box" ref={box} style={{ height: size ? size.height : undefined }}>
        <div
          className={`viz-scale lec-${lecture}${narrow ? ' narrow' : ''}`}
          ref={inner}
          style={{
            width,
            transform: `${align === 'left' ? '' : 'translateX(-50%) '}scale(${size ? size.scale : 1})`,
            visibility: size ? 'visible' : 'hidden',
          }}
        >
          <div className="reveal">
            <div className="slides">
              <section ref={section} aria-label={label}>
                {children}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
