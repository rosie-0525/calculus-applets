import { useEffect, useRef } from 'react';
import { PRINT } from './print.js';

/** `\htmlData{from=id}`: a piece of a formula that pieces of another formula fly from (it stays). */
export const from = (id, tex) => String.raw`\htmlData{from=${id}}{${tex}}`;

/**
 * `\htmlData{to=id,at=k}`: a piece that, on key press k, flies in from the piece keyed `from` id,
 * turning into itself on the way (a copy of the old piece flies along and fades out as it fades in).
 * Several pieces may fly from one (h² becomes hᵀ and h).
 */
export const to = (id, at, tex) => String.raw`\htmlData{to=${id},at=${at}}{${tex}}`;

/** `\htmlData{late=k}`: a piece with nothing to fly from, which fades in as the others land. */
export const late = (at, tex) => String.raw`\htmlData{late=${at}}{${tex}}`;

/** The flight, in ms; the old piece turns into the new one between these fractions of it. */
const MOVE = 1400;
const TURN = [0.3, 0.75];

/**
 * The key presses `at` on which pieces of a formula fly in from another formula on the slide, keyed
 * with `to` and `from` (Quadratic approximation: the terms of f(a + h) ≈ f(a) + f'(a)h + ½f''(a)h² fly
 * into the definition's formula, f''(a) becoming (Hf)(a)). The new formula is a fragment, or hidden,
 * until then; going back a key press just hides it again. In print, the formulas are as they are.
 */
export default function Flights({ at }) {
  const markers = useRef(null);

  useEffect(() => {
    if (PRINT) return undefined;
    const host = markers.current;
    const section = host.closest('section');
    const els = [...host.children];
    const count = () => els.filter((m) => m.classList.contains('visible')).length;
    let step = count();
    let copies = [];

    const stop = () => {
      section.querySelectorAll('[data-to], [data-late]').forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
      copies.forEach((c) => c.remove());
      copies = [];
    };

    const fly = (k) => {
      const sec = section.getBoundingClientRect();
      const scale = sec.width / section.offsetWidth;
      if (!scale) return;
      section.querySelectorAll(`[data-to][data-at="${k}"]`).forEach((el) => {
        const src = section.querySelector(`[data-from="${el.dataset.to}"]`);
        if (!src) return;
        const a = src.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        // centre to centre, in the slide's own pixels
        const dx = (a.left + a.width / 2 - (b.left + b.width / 2)) / scale;
        const dy = (a.top + a.height / 2 - (b.top + b.height / 2)) / scale;
        el.animate({ transform: [`translate(${dx}px, ${dy}px)`, 'translate(0px, 0px)'] }, { duration: MOVE, easing: 'ease-in-out' });
        el.animate({ opacity: [0, 0, 1, 1], offset: [0, ...TURN, 1] }, { duration: MOVE });

        // a copy of the old piece, laid over it, flies along and fades out
        const copy = document.createElement('span');
        copy.className = 'katex flight';
        const cs = getComputedStyle(src);
        copy.style.fontSize = cs.fontSize;
        copy.style.color = cs.color;
        copy.appendChild(src.cloneNode(true));
        section.appendChild(copy);
        const c = copy.firstChild.getBoundingClientRect();
        copy.style.left = `${(a.left - c.left) / scale}px`;
        copy.style.top = `${(a.top - c.top) / scale}px`;
        copies.push(copy);
        const trip = copy.animate({ transform: ['translate(0px, 0px)', `translate(${-dx}px, ${-dy}px)`] }, { duration: MOVE, easing: 'ease-in-out' });
        copy.animate({ opacity: [1, 1, 0, 0], offset: [0, ...TURN, 1] }, { duration: MOVE, fill: 'forwards' });
        trip.onfinish = () => {
          copy.remove();
          copies = copies.filter((x) => x !== copy);
        };
      });
      section.querySelectorAll(`[data-late="${k}"]`).forEach((el) => {
        el.animate({ opacity: [0, 0, 1], offset: [0, TURN[1], 1] }, { duration: MOVE });
      });
    };

    const update = () => {
      const now = count();
      if (now === step) return;
      stop();
      if (now === step + 1 && section.classList.contains('present')) fly(at[now - 1]);
      step = now;
    };
    const observer = new MutationObserver(update);
    els.forEach((m) => observer.observe(m, { attributes: true, attributeFilter: ['class'] }));
    return () => {
      observer.disconnect();
      stop();
    };
  }, [at.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={markers} aria-hidden="true">
      {at.map((n) => (
        <span key={n} className="fragment fx-marker" data-fragment-index={n} />
      ))}
    </span>
  );
}
