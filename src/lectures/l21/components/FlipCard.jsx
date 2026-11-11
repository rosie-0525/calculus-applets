import { useEffect, useRef, useState } from 'react';
import Tex from './Tex.jsx';
import { MAIN } from './svgmath.jsx';
import { INK, ease, clamp01 } from './tr.js';
import { PRINT } from './print.js';

const transpose = (rows) => rows[0].map((_, j) => rows.map((row) => row[j]));

/** The card of a matrix with entries in square `cell`s and a margin `pad`: [width, height]. */
const cardSize = (rows, cell, pad) => [2 * pad + rows[0].length * cell, 2 * pad + rows.length * cell];

/** A face of the card: the matrix in brackets, its entries in square cells. */
function Face({ rows, cell, pad, font }) {
  const [W, H] = cardSize(rows, cell, pad);
  const [x0, x1] = [pad * 0.5, W - pad * 0.5];
  const [y0, y1] = [pad * 0.5, H - pad * 0.5];
  const tk = pad * 0.5;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={`M${x0 + tk} ${y0}H${x0}V${y1}H${x0 + tk}M${x1 - tk} ${y0}H${x1}V${y1}H${x1 - tk}`} fill="none" stroke={INK} strokeWidth="1.8" />
      {rows.map((row, i) =>
        row.map((v, j) => (
          <text key={`${i}-${j}`} x={pad + (j + 0.5) * cell} y={pad + (i + 0.5) * cell} dy="0.35em" textAnchor="middle" fontFamily={MAIN} fontSize={font} fill={INK}>
            {v}
          </text>
        )),
      )}
    </svg>
  );
}

/**
 * A matrix on a card, turned over like a card about the line through its diagonal entries: `u` = 0
 * shows A, 1 the card turned over, Aᵀ (printed on its back, so that it reads upright), 2 turned over
 * again, A. Its centre stays put. `labels` = [name of A, name of Aᵀ, name of A after two flips
 * (default the first)], under the card, each while its face shows. In print, Aᵀ.
 */
export default function FlipCard({ rows, u = 0, cell = 34, pad = 14, font, labels }) {
  const [W, H] = cardSize(rows, cell, pad);
  const S = Math.max(W, H);
  const fs = font ?? Math.round(cell * 0.55);
  const face = (r) => <Face rows={r} cell={cell} pad={pad} font={fs} />;
  // the centre of the card turned by φ about the diagonal (1, 1) through its corner, seen from the front
  const c = Math.cos(Math.PI * u);
  const cx = (W + H) / 4 + ((W - H) / 4) * c;
  const cy = (W + H) / 4 - ((W - H) / 4) * c;
  // the labels: the front's fades out as the card turns edge-on, the back's fades in after (no overlap)
  const d = Math.abs(u - 1);
  const back = PRINT ? 1 : clamp01((0.5 - d) / 0.1);
  const front = PRINT ? 0 : clamp01((d - 0.5) / 0.1);
  const [l0, l1, l2 = l0] = labels || [];
  return (
    <div className="l21-fc-wrap">
      <div className="l21-fc-box" style={{ width: S, height: S }}>
        {PRINT ? (
          <div className="l21-fc-face" style={{ width: H, height: W, left: (S - H) / 2, top: (S - W) / 2 }}>
            {face(transpose(rows))}
          </div>
        ) : (
          <div className="l21-fc" style={{ width: W, height: H, transform: `translate(${S / 2 - cx}px, ${S / 2 - cy}px) rotate3d(1, 1, 0, ${180 * u}deg)` }}>
            <div className="l21-fc-face" style={{ width: W, height: H }}>
              {face(rows)}
            </div>
            <div className="l21-fc-face l21-fc-back" style={{ width: H, height: W }}>
              {face(transpose(rows))}
            </div>
          </div>
        )}
      </div>
      {labels && (
        <span className="l21-fc-label l21-stack">
          <span style={{ opacity: u <= 1 ? front : 0 }}>
            <Tex tex={l0} />
          </span>
          <span style={{ opacity: back }}>
            <Tex tex={l1} />
          </span>
          <span style={{ opacity: u > 1 ? front : 0 }}>
            <Tex tex={l2} />
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * The turns of a FlipCard while `on`: u eases from 0 to 1 over `ms` (the card turned over), holds
 * `hold` ms, eases on to 2 (turned back to the front), holds, drops to 0 (the same picture), holds
 * `rest` ms, and so on. A new round waits while `live()` is false (the slide not on screen).
 */
export function useFlips(on, { ms = 1500, hold = 1500, rest = 0, delay = 600, live = () => true } = {}) {
  const [u, setU] = useState(0);
  const liveRef = useRef(live);
  liveRef.current = live;
  useEffect(() => {
    if (!on) {
      setU(0);
      return undefined;
    }
    let frame;
    let timer;
    const run = (from, next) => {
      let t0;
      const step = (now) => {
        if (t0 === undefined) t0 = now;
        const k = Math.min(1, (now - t0) / ms);
        setU(from + ease(k));
        if (k < 1) frame = requestAnimationFrame(step);
        else timer = setTimeout(next, hold);
      };
      frame = requestAnimationFrame(step);
    };
    const round = () => {
      if (!liveRef.current()) {
        timer = setTimeout(round, hold);
        return;
      }
      run(0, () =>
        run(1, () => {
          setU(0);
          timer = setTimeout(round, rest);
        }),
      );
    };
    timer = setTimeout(round, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, ms, hold, rest, delay]);
  return u;
}
