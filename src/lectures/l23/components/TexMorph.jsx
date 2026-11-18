import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Tex from './Tex.jsx';
import Fragment from './Fragment.jsx';
import { PRINT } from './print.js';

/**
 * `\htmlData{mk=id}{tex}`: a piece of a formula that TexMorph follows from step to step. Key every
 * visible piece of every step (a piece with no key appears at once), and never nest keys.
 */
export const mk = (id, tex) => String.raw`\htmlData{mk=${id}}{${tex}}`;

/**
 * A keyed piece that changes size from step to step (a label under a brace that becomes a coefficient
 * of the row): it glides and grows, or shrinks, from its old size to its new one. Key it so in both
 * steps.
 */
export const mkGrow = (id, tex) => String.raw`\htmlData{mk=${id},grow=1}{${tex}}`;

/** Timing of a change of step, in ms: the pieces that go fade out, those that stay glide, new ones fade in. */
const OUT = 350;
const MOVE = 1300;
const IN_DELAY = 850;
const IN = 500;
/** How far, in em, a piece that arcs over its row stays clear of the pieces it passes. */
const GAP = 0.2;
/** The empty band, in em, at the top and bottom of a glyph's box (the font's line box). */
const INSET = 0.3;

/** The box round a piece's text (a fraction's numerator rises above the piece's own box). */
function inked(el) {
  const boxes = [el, ...el.querySelectorAll('*')]
    .filter((x) => [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((x) => x.getBoundingClientRect());
  if (!boxes.length) return el.getBoundingClientRect();
  return { top: Math.min(...boxes.map((b) => b.top)), bottom: Math.max(...boxes.map((b) => b.bottom)) };
}

/**
 * A formula that turns into the next one on each key press `at[k]` (steps[k] → steps[k + 1]): a
 * piece keyed with `mk` in both glides from its old place to its new one (arcing over the pieces it
 * passes that travel less far, so that it does not run through them), a piece only in the old
 * step fades out, and one only in the new step fades in once the others have nearly arrived. All the
 * steps are laid out in one grid cell, so the block keeps the size of the largest. Going back a key
 * press plays the change backwards. In print, a still per step (stacked fragments).
 */
export default function TexMorph({ steps, at, className = '' }) {
  const grid = useRef(null);
  const markers = useRef(null);
  const [step, setStep] = useState(0);
  const shown = useRef(null);
  const timer = useRef(0);

  useEffect(() => {
    if (PRINT) return undefined;
    const els = [...markers.current.children];
    const update = () => setStep(els.filter((m) => m.classList.contains('visible')).length);
    update();
    const observer = new MutationObserver(update);
    els.forEach((m) => observer.observe(m, { attributes: true, attributeFilter: ['class'] }));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (PRINT) return;
    const box = grid.current;
    const layers = [...box.children];
    const from = shown.current;
    shown.current = step;

    clearTimeout(timer.current);
    box.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    box.querySelectorAll('.tm-out').forEach((el) => el.classList.remove('tm-out'));
    layers.forEach((layer, k) => {
      layer.classList.toggle('now', k === step);
      layer.classList.remove('ghost');
    });

    if (from === null || from === step || !box.offsetWidth) return;
    const scale = box.getBoundingClientRect().width / box.offsetWidth;
    if (!scale) return;

    const pieces = (layer) => new Map([...layer.querySelectorAll('[data-mk]')].map((el) => [el.dataset.mk, el]));
    const old = pieces(layers[from]);
    const now = pieces(layers[step]);
    layers[from].classList.add('ghost');
    const em = parseFloat(getComputedStyle(box).fontSize) || 0;

    const moves = [];
    now.forEach((el, id) => {
      const was = old.get(id);
      if (was) moves.push({ el, a: was.getBoundingClientRect(), b: el.getBoundingClientRect(), ia: inked(was), ib: inked(el) });
      else el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN, delay: IN_DELAY, fill: 'backwards' });
    });
    // Of two pieces in a row that pass each other, the one that travels farther (on a tie, the one
    // going right) arcs over the other, and over the tallest it passes (a fraction, say), so that the
    // change backwards is the same motion played backwards.
    moves.forEach((p) => {
      p.dx = (p.a.left - p.b.left) / scale;
    });
    const sameRow = (p, q) => p.a.top < q.a.bottom && q.a.top < p.a.bottom;
    const cross = (p, q) => (p.a.left - q.a.left) * (p.b.left - q.b.left) < 0;
    const over = (p, q) => Math.abs(p.dx) > Math.abs(q.dx) + 1 || (Math.abs(Math.abs(p.dx) - Math.abs(q.dx)) <= 1 && p.dx < 0);
    const clearance = (p) =>
      moves
        .filter((q) => q !== p && sameRow(p, q) && cross(p, q) && over(p, q))
        .reduce((h, q) => Math.max(h, (p.ia.bottom - Math.min(q.ia.top, q.ib.top)) / scale + (GAP - 2 * INSET) * em), 0);
    moves.forEach((p) => {
      const { dx } = p;
      const dy = (p.a.top - p.b.top) / scale;
      const lift = clearance(p);
      // a piece keyed with mkGrow starts at its old size, from its top left corner
      const k = p.el.dataset.grow && p.b.width ? p.a.width / p.b.width : 1;
      // up quickly, flat over the row, down quickly: lift · (1 − (2s − 1)⁴)
      const frames = Array.from({ length: 17 }, (_, n) => {
        const s = n / 16;
        const move = `translate(${dx * (1 - s)}px, ${dy * (1 - s) - lift * (1 - (2 * s - 1) ** 4)}px)`;
        return k === 1 ? { transform: move } : { transform: `${move} scale(${k + (1 - k) * s})`, transformOrigin: '0 0' };
      });
      p.el.animate(frames, { duration: MOVE, easing: 'ease-in-out' });
    });
    old.forEach((el, id) => {
      if (now.has(id)) return;
      el.classList.add('tm-out');
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT, fill: 'forwards' });
    });

    timer.current = setTimeout(() => {
      layers[from].classList.remove('ghost');
      box.querySelectorAll('.tm-out').forEach((el) => el.classList.remove('tm-out'));
    }, Math.max(MOVE, IN_DELAY + IN));
  }, [step]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (PRINT) {
    return (
      <div className={`tex-morph ${className}`.trim()}>
        <div className="tex-morph-grid">
          {steps.map((tex, k) => {
            let el = <Tex tex={tex} />;
            if (k < steps.length - 1) el = <Fragment index={at[k]} effect="fade-out">{el}</Fragment>;
            if (k > 0) el = <Fragment index={at[k - 1]}>{el}</Fragment>;
            return (
              <div key={k} className="tex-morph-layer now">
                {el}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`tex-morph ${className}`.trim()}>
      <span ref={markers}>
        {at.map((n) => (
          <span key={n} className="fragment fx-marker" data-fragment-index={n} aria-hidden="true" />
        ))}
      </span>
      <div className="tex-morph-grid" ref={grid}>
        {steps.map((tex, k) => (
          <div key={k} className="tex-morph-layer">
            <Tex tex={tex} />
          </div>
        ))}
      </div>
    </div>
  );
}
