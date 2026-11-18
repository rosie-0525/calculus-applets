import { useLayoutEffect, useRef, useState } from 'react';
import Tex from './Tex.jsx';
import { BLUE, col } from './lu.js';
import { PRINT } from './print.js';
import { useFragmentShown } from './useFragmentTween.js';

/**
 * Row operations, animated (LU decomposition by elimination, Slide08cElimLU; the user's requests: "make
 * it really really awesome", then: highlight the row, ×(c) beside it without a background, and just change
 * the numbers, without circles or boxed numbers on top). All CSS (`.l23-em…`, `.l23-oa…`, `.l23-el…` in
 * deck.css), started when the fragment around the matrix is shown; an operation at a time (--k, --T =
 * 2.7 s each), its columns a beat apart (--j). For each operation { from, to, c } (row `to` += c · row
 * `from`):
 *   1. the pivot row lights up blue, the row it changes amber;
 *   2. ×(c) appears beside the pivot row (blue, no background);
 *   3. the entries of the changed row turn, in place, into the sums (4−4, the multiple blue), then into
 *      the new entries; a new zero bursts into confetti (little upper triangles, the deck's colours).
 * With `upper`, once the operations are done, the upper triangle lights up amber with a shimmer (U is
 * upper triangular). Print shows `after`, still.
 */
const blue = (t) => col(BLUE, t);
const CONFETTI = ['#c2702a', '#3b6ea8', '#f6c445', '#3f8f5a', '#c2702a', '#3b6ea8', '#f6c445', '#3f8f5a'];

/** What a changed entry shows on the way: t plus the multiple (blue, as ×(c) is), "4−4" or "3+2". */
// (the sign an ordinary symbol, {-}: no spaces round it, so that it fits in its cell)
const sumTex = (t, add) => (add <= 0 ? `${t}{-}${blue(`${-add}`)}` : `${t}{+}${blue(`${add}`)}`);

/** The upper triangle (with the diagonal) of an n × n grid, as a clip-path polygon. */
function staircase(n) {
  const p = (x, y) => `${(100 * x) / n}% ${(100 * y) / n}%`;
  const pts = [p(0, 0), p(n, 0), p(n, n)];
  for (let k = n - 1; k >= 1; k--) pts.push(p(k, k + 1), p(k, k));
  pts.push(p(0, 1));
  return `polygon(${pts.join(', ')})`;
}

export function ElimMatrix({ before, after = before, ops = [], upper = false }) {
  const n = before.length;
  const m = before[0].length;
  const target = new Map(ops.map((op, k) => [op.to, k])); // a changed row → its operation
  const span = { gridColumn: `1 / ${m + 1}` };
  return (
    <span className={`l23-em${ops.length ? ' l23-em-live' : ''}`} style={{ '--rows': n, '--cols': m, '--ops': ops.length }}>
      <span className="l23-em-brk left" />
      <span className="l23-em-cells">
        {/* behind the entries: the rows of each operation, U's upper triangle */}
        {ops.map(({ from, to }, k) => [
          <span key={`bp${k}`} className="l23-em-band pivot" style={{ ...span, gridRow: from + 1, '--k': k }} />,
          <span key={`bt${k}`} className="l23-em-band target" style={{ ...span, gridRow: to + 1, '--k': k }} />,
        ])}
        {upper && <span className="l23-em-upper" style={{ gridRow: `1 / ${n + 1}`, gridColumn: `1 / ${m + 1}`, clipPath: staircase(n) }} />}

        {before.map((row, i) =>
          row.map((e, j) => {
            const k = target.get(i);
            const style = { gridRow: i + 1, gridColumn: j + 1 };
            if (k === undefined) {
              return (
                <span key={`${i}-${j}`} className="l23-em-cell" style={style}>
                  <Tex tex={`${e}`} />
                </span>
              );
            }
            const { from, c } = ops[k];
            const zero = after[i][j] === 0 && e !== 0; // a zero made by this operation
            return (
              <span key={`${i}-${j}`} className="l23-em-cell" style={{ ...style, '--k': k, '--j': j }}>
                <span className="l23-em-before">
                  <Tex tex={`${e}`} />
                </span>
                <span className="l23-em-sum">
                  <Tex tex={sumTex(e, c * before[from][j])} />
                </span>
                <span className={`l23-em-after${zero ? ' l23-em-zero' : ''}`}>
                  <Tex tex={`${after[i][j]}`} />
                </span>
                {zero && (
                  <span className="l23-em-burst">
                    {CONFETTI.map((fill, q) => (
                      <span key={q} style={{ '--a': `${q * 45 + 20}deg`, '--q': q, background: fill }} />
                    ))}
                  </span>
                )}
              </span>
            );
          }),
        )}
      </span>
      <span className="l23-em-brk right" />
      {/* ×(c), at the right of the pivot row */}
      {ops.map(({ from, c }, k) => (
        <span key={`tag${k}`} className="l23-em-tag" style={{ top: `calc(${from} * var(--ch))`, '--k': k }}>
          <Tex tex={blue(`\\times(${c})`)} />
        </span>
      ))}
    </span>
  );
}

/**
 * An arrow for one or two row operations, drawn on as its step appears, a label above (and below) it,
 * each lit up while its operation plays (--k). A label is [before, multiplier, after]: the multiplier
 * (blue) is a span of its own, data-mult = its place in L ("21": row 2, column 1), which
 * MultiplierFlight flies into L.
 */
export function OpArrow({ labels }) {
  const label = (lab, k, where) => (
    <span className={`l23-oa-label ${where}`} style={{ '--k': k }}>
      {lab && (
        <>
          <Tex tex={`${lab.pre}-{}`} />
          <span className="l23-oa-mult" data-mult={lab.slot}>
            <Tex tex={blue(lab.mult)} />
          </span>
          <Tex tex={lab.post} />
        </>
      )}
    </span>
  );
  return (
    <span className="l23-oa">
      {label(labels[0], 0, 'top')}
      <span className="l23-oa-line" />
      {label(labels[1], 1, 'bottom')}
    </span>
  );
}

/**
 * When the fragment marker `trigger` is shown, the multipliers fly from the arrows' labels into their
 * places in L (TeX \htmlClass{l23-el-slot-21}{…} in the A = LU formula), one after another, in an arc,
 * growing on the way; each place then pops in (CSS). Measured as it starts (the slide is on screen
 * then), in the slide's own units (reveal scales the slide). None in print.
 */
export function MultiplierFlight({ trigger, slots }) {
  const shown = useFragmentShown(trigger);
  const [flights, setFlights] = useState([]);
  const host = useRef(null);
  useLayoutEffect(() => {
    if (!shown || PRINT) {
      setFlights([]);
      return undefined;
    }
    let frame;
    let tries = 0;
    const measure = () => {
      const section = host.current?.closest('section');
      const sr = section?.getBoundingClientRect();
      if (!sr?.width || !section.offsetWidth) {
        if (tries++ < 30) frame = requestAnimationFrame(measure);
        return;
      }
      const s = sr.width / section.offsetWidth;
      const out = [];
      slots.forEach((slot, i) => {
        const src = section.querySelector(`.l23-oa-mult[data-mult="${slot}"]`);
        const tgt = section.querySelector(`.l23-el-slot-${slot}`);
        const a = src?.getBoundingClientRect();
        const b = tgt?.getBoundingClientRect();
        if (!a?.height || !b?.height) return;
        out.push({
          slot,
          i,
          tex: tgt.textContent,
          left: (a.left - sr.left) / s,
          top: (a.top - sr.top) / s,
          fx: (b.left - a.left) / s,
          fy: (b.top - a.top) / s,
          s0: a.height / b.height,
          size: getComputedStyle(tgt.closest('.katex')?.parentElement ?? tgt).fontSize,
        });
      });
      setFlights(out);
    };
    measure();
    return () => cancelAnimationFrame(frame);
  }, [shown, slots]);
  return (
    <div ref={host} className="l23-el-flyers" aria-hidden="true">
      {flights.map((f) => (
        <span
          key={f.slot}
          className="l23-el-fly"
          style={{ left: f.left, top: f.top, fontSize: f.size, '--fx': `${f.fx}px`, '--fy': `${f.fy}px`, '--s0': f.s0, '--i': f.i }}
        >
          <Tex tex={blue(f.tex)} />
        </span>
      ))}
    </div>
  );
}
