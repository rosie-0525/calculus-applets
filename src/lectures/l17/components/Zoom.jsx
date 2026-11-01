import { useEffect, useRef, useState } from 'react';
import { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { F as F_SHAPE, S as SQUARE } from './FPanel.jsx';
import { Head, Stage, Shortcut, G_COLOR, F_COLOR, FG_COLOR, SOFT } from './ChainPicture.jsx';
import { INK, BLUE, svgPoint } from './la.js';
import { dragTowards } from './SumPicture.jsx';
import { useFragmentShown } from './useFragmentTween.js';
import { PRINT } from './print.js';

// two smooth, visibly nonlinear maps ℝ² → ℝ², each one-to-one: g waves the plane, f swirls it
// round the point C
const g = ([x, y]) => [x + 0.25 * Math.sin(2 * y), y - 0.2 * Math.sin(2 * x)];
const C = [0.6, 0.2];
const f = ([u, v]) => {
  const [dx, dy] = [u - C[0], v - C[1]];
  const th = 0.9 * Math.exp(-(dx * dx + dy * dy) / 3);
  return [C[0] + Math.cos(th) * dx - Math.sin(th) * dy, C[1] + Math.sin(th) * dx + Math.cos(th) * dy];
};
const A = [0.8, 0.2];
const ID = (p) => p;
const GA = g(A);
const TINTS = {
  a: { fill: '#eef0f3', stroke: SOFT },
  g: { fill: 'rgba(194, 112, 42, 0.2)', stroke: G_COLOR },
  fg: { fill: 'rgba(140, 21, 21, 0.14)', stroke: FG_COLOR },
};

// the half-side of the patch round a, before and after zooming in (×1 to ×100); the panels zoom in as
// the patch shrinks, so that it keeps its size on screen
const EPS = [0.9, 0.009];
const SCALE = 64; // px per unit at ×1
const epsAt = (z) => EPS[0] * (EPS[1] / EPS[0]) ** z;
const clamp01 = (t) => Math.max(0, Math.min(1, t));

/** The polygon `poly` with each side cut into `n` pieces, so that a map bends it. */
const dense = (poly, n = 14, closed = true) => {
  const out = [];
  const m = closed ? poly.length : poly.length - 1;
  for (let i = 0; i < m; i += 1) {
    const [p, q] = [poly[i], poly[(i + 1) % poly.length]];
    for (let k = 0; k < n; k += 1) out.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
  }
  if (!closed) out.push(poly[poly.length - 1]);
  return out;
};
const toPatch = (e) => (q) => [A[0] + e * (2 * q[0] - 1), A[1] + e * (2 * q[1] - 1)];
const SUB = [0.25, 0.5, 0.75];
const PATCH_LINES = [...SUB.map((s) => [[s, 0], [s, 1]]), ...SUB.map((s) => [[0, s], [1, s]])];
const SQ = dense(SQUARE);
const FF = dense(F_SHAPE, 8);
const LINES = PATCH_LINES.map((l) => dense(l, 14, false));

/**
 * The faint grid of the panels at half-side `e`: the lines round a, multiples of 0.5 / 2ᵐ apart, each
 * level fading in as its lines get 16 to 34 px apart (as on Why add?): zooming in, they spread apart
 * and the finer ones come in.
 */
function gridLines(e) {
  const zoom = EPS[0] / e;
  const R = 5 / zoom; // enough to cover a panel, through g and f ∘ g
  const n = 48;
  const along = Array.from({ length: n + 1 }, (_, i) => -R + (2 * R * i) / n);
  const out = [];
  for (let m = 0; m < 10; m += 1) {
    const h = 0.5 / 2 ** m;
    const alpha = m === 0 ? 1 : clamp01((h * SCALE * zoom - 16) / 18);
    if (alpha === 0) break;
    const J = Math.floor(R / h);
    for (let j = -J; j <= J; j += 1) {
      if (m > 0 && j % 2 === 0) continue; // a line of the level above
      out.push({ alpha, pts: along.map((t) => [A[0] + j * h, A[1] + t]) });
      out.push({ alpha, pts: along.map((t) => [A[0] + t, A[1] + j * h]) });
    }
  }
  return out;
}

/** 0 → 1 over `ms` ms (eased), from `delay` ms after `on` turns true or `run` changes; 0 while off. */
function useZoomTween(on, run, { ms = 4200, delay = 500 } = {}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    setT(0);
    if (!on) return undefined;
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      setT(k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, run, ms, delay]);
  return t;
}

/** The half-side of the patch: zooming in after key press `zoom` (a click zooms in again); in print, a still before and after. */
function useZoom(index) {
  const marker = useRef(null);
  const shown = useFragmentShown(marker);
  const [run, setRun] = useState(0);
  const u = useZoomTween(shown, run);
  return {
    e: epsAt(shown ? u : 0),
    replay: () => shown && setRun((n) => n + 1),
    marker: <g ref={marker} className="fragment fx-marker" data-fragment-index={index} />,
  };
}

/** `render(e)` live; in print, at ×1 until key press `zoom`, then zoomed in. */
function zoomed(render, e, zoom) {
  if (!PRINT) return render(e);
  return [
    [EPS[0], undefined, zoom],
    [EPS[1], zoom, undefined],
  ].map(([ee, from, until], i) => (
    <Stage key={i} index={from}>
      <Stage index={until} effect="fade-out">
        {render(ee)}
      </Stage>
    </Stage>
  ));
}

const path = (qs, closed) => `M ${qs.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ')}${closed ? ' Z' : ''}`;

/** The patch round a of half-side `e` (its grid and the letter F, in `ink`), through `map`, in px by `px`. */
function Patch({ e, map, px, tint, width = 1.6, ink = INK }) {
  const to = (qs) => qs.map((q) => px(map(toPatch(e)(q))));
  return (
    <g>
      <path d={path(to(SQ), true)} fill={tint.fill} stroke="none" />
      {LINES.map((l, k) => (
        <path key={k} d={path(to(l), false)} fill="none" stroke={tint.stroke} strokeOpacity="0.45" strokeWidth={width * 0.7} />
      ))}
      <path d={path(to(SQ), true)} fill="none" stroke={tint.stroke} strokeWidth={width} strokeLinejoin="round" />
      <path d={path(to(FF), true)} fill={ink} stroke={ink} strokeWidth="1" strokeLinejoin="round" />
    </g>
  );
}

/** A panel's frame and clip (the clips go in the SVG's defs, outside any fragment, for print). */
const frame = ({ x, top, w, h }) => ({ x: x - w / 2, y: top, width: w, height: h, rx: 10 });
const Clip = ({ id, p }) => (
  <clipPath id={id}>
    <rect {...frame(p)} />
  </clipPath>
);

/**
 * The plane round map(a), zoomed in EPS[0] / e times: the images under `map` of the grid `lines` and
 * of the patch of half-side `e`, in the panel `p` ({ x, top, w, h }).
 */
function Panel({ clip, p, map, e, lines, tint, ink }) {
  const c = map(A);
  const k = (SCALE * EPS[0]) / e;
  const cy = p.top + p.h / 2;
  const px = (q) => [p.x + (q[0] - c[0]) * k, cy - (q[1] - c[1]) * k];
  return (
    <g>
      <rect {...frame(p)} fill="#fff" stroke="#d1d5db" strokeWidth="1.5" />
      <g clipPath={`url(#${clip})`}>
        {lines.map((l, i) => (
          <path key={i} d={path(l.pts.map((q) => px(map(q))), false)} fill="none" stroke="#cdd3dc" strokeOpacity={l.alpha.toFixed(3)} strokeWidth="1.2" />
        ))}
        <Patch e={e} map={map} px={px} tint={tint} width={1.8} ink={ink} />
      </g>
    </g>
  );
}

/** An arrow from x1 to x2 at height y. */
const Arrow = ({ x1, x2, y }) => (
  <g>
    <line x1={x1} y1={y} x2={x2 - 10} y2={y} stroke={INK} strokeWidth="2.6" />
    <Head tip={[x2, y]} dir={[1, 0]} color={INK} />
  </g>
);

/** "zoom ×n", with a white halo. */
const ZoomLabel = ({ x, y, e, anchor = 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="19" fill={SOFT} stroke="#fff" strokeWidth="4" paintOrder="stroke">
    {`zoom ×${Math.round(EPS[0] / (PRINT ? EPS[1] : e))}`}
  </text>
);

// Zooming in: two panels in a row, and the vectors x − a and g(x) − g(a)
const W1 = 1180;
const XS1 = [300, 880];
const P1 = { top: 34, w: 400, h: 300 };
const CY1 = P1.top + P1.h / 2;
const F_LIGHT = '#bcc2cc'; // the letter F, light, under the vectors
const D0 = [20, -88]; // x − a at first, in px on screen: above a, where g bends most
const PW = [10, 24]; // the half widths of the labels a, x and g(a), g(x), px

/** g(x) − g(a) in px on screen, for x − a = `d` px on screen, at half-side `e` (y down). */
const imageOf = (d, e) => {
  const k = (SCALE * EPS[0]) / e;
  const gx = g([A[0] + d[0] / k, A[1] - d[1] / k]);
  return [(gx[0] - GA[0]) * k, -(gx[1] - GA[1]) * k];
};
/**
 * The centre of a point's label (half width `hw`) at an end of the arrow from 0 to `v` (px): past its
 * tip (`side` 1), or behind its tail (`side` −1).
 */
const past = (v, hw, side = 1) => {
  const len = Math.hypot(v[0], v[1]) || 1;
  const u = [v[0] / len, v[1] / len];
  const off = Math.abs(u[0]) * hw + Math.abs(u[1]) * 13 + (side > 0 ? 18 : 10); // clear of x's ring
  return side > 0 ? [v[0] + u[0] * off, v[1] + u[1] * off] : [-u[0] * off, -u[1] * off];
};
/** Whether a box of half sizes `half` round `q` (px from a panel's centre) lies in the panel. */
const inPanel = (q, half, m = 6) => Math.abs(q[0]) + half[0] < P1.w / 2 - m && Math.abs(q[1]) + half[1] < P1.h / 2 - m;

/** The arrow from `from` by `d` (px), with a white halo. */
function Vec({ from, d, color }) {
  const len = Math.hypot(d[0], d[1]);
  if (len < 1) return null;
  const tip = [from[0] + d[0], from[1] + d[1]];
  const end = [tip[0] - (d[0] / len) * 10, tip[1] - (d[1] / len) * 10];
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={end[0]} y2={end[1]} stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <line x1={from[0]} y1={from[1]} x2={end[0]} y2={end[1]} stroke={color} strokeWidth="3.5" />
      <Head tip={tip} dir={d} color={color} size={16} />
      <circle cx={from[0]} cy={from[1]} r={4} fill={color} stroke="#fff" strokeWidth="1.5" />
    </g>
  );
}

/**
 * Zooming in (before Why does the chain rule hold?), on key press `show`: g: ℝ² → ℝ², the patch
 * round a (a small square grid with the letter F) and its image round g(a), bent like the faint grid.
 * Key press `vectors`: x − a and g(x) − g(a), their ends labelled (a fixed, x moving); x can be dragged, from anywhere on the left picture
 * (a ring round its tip), and stops where an arrow or its label would leave a picture. Key press
 * `zoom`: both pictures zoom in, ×1 to ×100, the patch and x − a keeping their size on screen: the
 * image straightens out into a parallelogram, and g(x) − g(a) turns into (Dg)(a)(x − a). Key press
 * `matrix`: under the arrow, multiply by (Dg)(a). Print shows the pictures at ×1, then zoomed in.
 */
export function ZoomOne({ index = { show: 1, vectors: 2, zoom: 3, matrix: 4 } }) {
  const { e, marker } = useZoom(index.zoom);
  const [d, setD] = useState(D0);
  const panel = (k) => ({ x: XS1[k], ...P1 });
  const gap = [XS1[0] + P1.w / 2 + 14, XS1[1] - P1.w / 2 - 14];
  const mid = (gap[0] + gap[1]) / 2;
  const panels = (ee) => {
    const lines = gridLines(ee);
    return [ID, g].map((m, k) => <Panel key={k} clip={`l17-zoom1-${k}`} p={panel(k)} map={m} e={ee} lines={lines} tint={[TINTS.a, TINTS.g][k]} ink={F_LIGHT} />);
  };
  // x − a and g(x) − g(a), and the labels of their ends (drawn last, with a halo), at half-side ee
  const vectors = (ee) => {
    const v = imageOf(d, ee);
    const at = (k, q) => [XS1[k] + q[0], CY1 + q[1]];
    return (
      <Stage index={index.vectors}>
        <Vec from={[XS1[0], CY1]} d={d} color={INK} />
        <Vec from={[XS1[1], CY1]} d={v} color={G_COLOR} />
        {!PRINT && <circle cx={XS1[0] + d[0]} cy={CY1 + d[1]} r={15} className="l15-grab" />}
        <g className="l15-sum-labels">
          {/* the points: a fixed, x moving, and their images */}
          {[
            [0, past(d, PW[0], -1), r`\vv a`, INK],
            [0, past(d, PW[0]), r`\vv x`, INK],
            [1, past(v, PW[1], -1), r`g(\vv a)`, G_COLOR],
            [1, past(v, PW[1]), r`g(\vv x)`, G_COLOR],
          ].map(([k, q, tex, color]) => (
            <TexSvg key={tex} x={at(k, q)[0]} y={at(k, q)[1]} tex={tex} size={23} color={color} w={2 * PW[k] + 24} h={32} />
          ))}
        </g>
      </Stage>
    );
  };
  // the arrows and the labels of their tips stay in the pictures, now and at either end of the zoom
  const ok = (q) =>
    Math.hypot(q[0], q[1]) > 20 &&
    inPanel(q, [14, 14]) &&
    inPanel(past(q, PW[0]), [PW[0], 13]) &&
    [e, EPS[0], EPS[1]].every((ee) => {
      const v = imageOf(q, ee);
      return inPanel(v, [14, 14]) && inPanel(past(v, PW[1]), [PW[1], 13]);
    });
  const move = (ev) => {
    const [X, Y] = svgPoint(ev.currentTarget.ownerSVGElement, ev);
    setD((cur) => dragTowards(ok, cur, [X - XS1[0], Y - CY1]));
  };
  const H = P1.top + P1.h + 4;

  return (
    <div className="l17-zoom" data-prevent-swipe>
      {/* the clips outside the picture's fragment: in print, the copies of the slide on later pages
          use the first page's, which a hidden fragment would empty */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          {XS1.map((x, k) => (
            <Clip key={k} id={`l17-zoom1-${k}`} p={panel(k)} />
          ))}
        </defs>
      </svg>
      <Fragment index={index.show}>
        <svg viewBox={`0 0 ${W1} ${H}`} width={W1} height={H} role="img" aria-label="g from the plane to the plane: a patch with the letter F round a and its image round g(a), bent, the vectors x − a and g(x) − g(a); zoomed in, the image straightens into a parallelogram, the image under multiplication by the derivative matrix">
          {marker}

          {zoomed(panels, e, index.zoom)}
          {XS1.map((x, k) => (
            <TexSvg key={k} x={x} y={P1.top - 17} tex={[r`\text{near }\vv a`, r`\text{near }g(\vv a)`][k]} size={22} color={INK} w={P1.w} h={34} />
          ))}
          <Stage index={index.zoom}>
            <ZoomLabel x={XS1[0] - P1.w / 2 + 12} y={P1.top + 26} e={e} />
          </Stage>
          <Arrow x1={gap[0]} x2={gap[1]} y={CY1} />
          <TexSvg x={mid} y={CY1 - 26} tex={r`\textcolor{${G_COLOR}}{g}\colon\mathbb R^2\to\mathbb R^2`} size={24} color={INK} w={170} h={40} />

          <Stage index={index.matrix}>
            <text x={mid} y={CY1 + 32} textAnchor="middle" fontSize="19" fill={INK}>
              multiply by
            </text>
            <TexSvg x={mid} y={CY1 + 56} tex={r`(Dg)(\vv a)`} size={23} color={G_COLOR} w={160} h={40} />
          </Stage>

          {zoomed(vectors, e, index.zoom)}
          {!PRINT && (
            <Stage index={index.vectors}>
              <rect
                {...frame(panel(0))}
                fill="transparent"
                className="l17-drag"
                data-prevent-swipe
                onPointerDown={(ev) => {
                  ev.currentTarget.setPointerCapture(ev.pointerId);
                  move(ev);
                }}
                onPointerMove={(ev) => ev.buttons && move(ev)}
              />
            </Stage>
          )}
        </svg>
      </Fragment>
    </div>
  );
}

// Why does the chain rule hold?: three panels in a row
const W3 = 1180;
const XS3 = [155, 590, 1025];
const P3 = { top: 34, w: 306, h: 290 };
const CY3 = P3.top + P3.h / 2;

/**
 * Why the chain rule? Zoom in. A patch of the plane round a (a small square grid with the letter F),
 * its image round g(a) under g, and round f(g(a)) under f; the faint grids show how g and f bend the
 * plane. Key press `zoom`: the three panels zoom in, ×1 to ×100, the patch shrinking to keep its size on
 * screen: the curved images straighten out into the images of the square under the derivative
 * matrices. Key press `matrices`: (Dg)(a) and (Df)(g(a)) under the arrows; `shortcut`:
 * (D(f ∘ g))(a), their product. A click on the picture zooms in again. Print shows the panels at ×1,
 * then zoomed in.
 */
export default function Zoom({ index = { zoom: 1, matrices: 2, shortcut: 3 } }) {
  const { e, replay, marker } = useZoom(index.zoom);
  const panel = (k) => ({ x: XS3[k], ...P3 });
  const maps = [ID, g, (p) => f(g(p))];
  const tints = [TINTS.a, TINTS.g, TINTS.fg];
  const panels = (ee) => {
    const lines = gridLines(ee);
    return maps.map((m, k) => <Panel key={k} clip={`l17-zoom3-${k}`} p={panel(k)} map={m} e={ee} lines={lines} tint={tints[k]} />);
  };
  const gap = (k) => [XS3[k] + P3.w / 2 + 12, XS3[k + 1] - P3.w / 2 - 12];
  const bottom = P3.top + P3.h;
  const sc = { from: [XS3[0] + 40, bottom + 6], ctrl: [XS3[1], bottom + 132], to: [XS3[2] - 40, bottom + 6] };
  const apexY = (sc.from[1] + 2 * sc.ctrl[1] + sc.to[1]) / 4;
  const H = apexY + 54;

  return (
    <div className="l17-zoom" onClick={replay} data-prevent-swipe>
      <svg viewBox={`0 0 ${W3} ${H}`} width={W3} height={H} role="img" aria-label="A patch of the plane with the letter F round a, its images under g and under f after g; zoomed in, the images straighten into the images under the derivative matrices">
        <defs>
          {XS3.map((x, k) => (
            <Clip key={k} id={`l17-zoom3-${k}`} p={panel(k)} />
          ))}
        </defs>
        {marker}

        {zoomed(panels, e, index.zoom)}
        {XS3.map((x, k) => (
          <TexSvg key={k} x={x} y={P3.top - 17} tex={[r`\text{near }\vv a`, r`\text{near }g(\vv a)`, r`\text{near }f(g(\vv a))`][k]} size={22} color={INK} w={P3.w} h={34} />
        ))}
        <Stage index={index.zoom}>
          <ZoomLabel x={XS3[0] - P3.w / 2 + 12} y={P3.top + 26} e={e} />
        </Stage>
        {[0, 1].map((k) => (
          <g key={k}>
            <Arrow x1={gap(k)[0]} x2={gap(k)[1]} y={CY3} />
            <TexSvg x={(gap(k)[0] + gap(k)[1]) / 2} y={CY3 - 24} tex={['g', 'f'][k]} size={28} color={[G_COLOR, F_COLOR][k]} w={80} h={40} />
          </g>
        ))}

        <Stage index={index.matrices}>
          {[0, 1].map((k) => (
            <TexSvg key={k} x={(gap(k)[0] + gap(k)[1]) / 2} y={CY3 + 26} tex={[r`(Dg)(\vv a)`, r`(Df)(g(\vv a))`][k]} size={22} color={[G_COLOR, F_COLOR][k]} w={160} h={40} />
          ))}
        </Stage>

        <Stage index={index.shortcut}>
          <Shortcut c={sc} color={FG_COLOR} drawn />
          <TexSvg
            x={XS3[1]}
            y={apexY + 30}
            tex={r`(D(f\circ g))(\vv a)=\textcolor{${F_COLOR}}{(Df)(g(\vv a))}\,\textcolor{${G_COLOR}}{(Dg)(\vv a)}`}
            size={23}
            color={FG_COLOR}
            w={600}
            h={44}
          />
        </Stage>
      </svg>
    </div>
  );
}

// Linearity principle (before Zooming in): the same patch round a, at ×1, under a linear T and under
// g; the panels have no clipPath (for print): each one's own svg clips it
export const T_COLOR = BLUE;
const T = ([x, y]) => [x + y, -0.5 * x + y];
const LIN_P = { w: 290, h: 220 };
const LIN_GAP = 170;
const LIN_W = 2 * LIN_P.w + LIN_GAP;
const LIN_CY = LIN_P.h / 2;
const LIN_XS = [LIN_P.w / 2, LIN_P.w + LIN_GAP + LIN_P.w / 2]; // the panels' centres
const LIN_LINES = gridLines(EPS[0]);
// the tints as [r, g, b, a] and [r, g, b] (TINTS.a, and the colours of T and g), mixed as the patch turns
// into its image
const LIN_TINTS = {
  a: { fill: [238, 240, 243, 1], stroke: [107, 114, 128] },
  T: { fill: [59, 110, 168, 0.16], stroke: [59, 110, 168] },
  g: { fill: [194, 112, 42, 0.2], stroke: [194, 112, 42] },
};
const mixTint = (p, q, s) => {
  const m = (u, v) => u.map((x, i) => x + (v[i] - x) * s);
  const [f, k] = [m(p.fill, q.fill), m(p.stroke, q.stroke)];
  return { fill: `rgba(${f.slice(0, 3).map(Math.round).join(', ')}, ${f[3].toFixed(3)})`, stroke: `rgb(${k.map(Math.round).join(', ')})` };
};
/** Part way (s from 0 to 1) from moving the plane round a to map(a) to `map` itself. */
const morph = (map, s) => (p) => {
  const [c, q] = [map(A), map(p)];
  return [0, 1].map((i) => c[i] + (1 - s) * (p[i] - A[i]) + s * (q[i] - c[i]));
};

/**
 * The plane round map(a) at ×1, its faint grid through `map` and, given a `tint`, the patch, in a panel
 * of `size` at (`left`, `top`), `scale` px per unit.
 */
function OpenPanel({ left, top = 0, size = LIN_P, scale = SCALE, map, tint }) {
  const c = map(A);
  const px = (q) => [size.w / 2 + (q[0] - c[0]) * scale, size.h / 2 - (q[1] - c[1]) * scale];
  const box = { x: left + 1, y: top + 1, width: size.w - 2, height: size.h - 2, rx: 10 };
  return (
    <g>
      <rect {...box} fill="#fff" />
      <svg x={left + 3} y={top + 3} width={size.w - 6} height={size.h - 6} viewBox={`3 3 ${size.w - 6} ${size.h - 6}`} overflow="hidden">
        {LIN_LINES.map((l, i) => (
          <path key={i} d={path(l.pts.map((q) => px(map(q))), false)} fill="none" stroke="#cdd3dc" strokeOpacity={l.alpha.toFixed(3)} strokeWidth="1.2" />
        ))}
        {tint && <Patch e={EPS[0]} map={map} px={px} tint={tint} width={1.8} />}
      </svg>
      <rect {...box} fill="none" stroke="#d1d5db" strokeWidth="1.5" />
    </g>
  );
}

/**
 * The patch round a and the plane round `which`(a), `which` 'T' (linear) or 'g' (nonlinear), the arrow
 * between them named, "linear" or "nonlinear" under it. Key press `play`: a copy of the patch flies
 * over to the right, then it and the plane there are squeezed by T, or bent by g (a click plays it
 * again). Print shows the plane on the right unmoved, then the image.
 */
export function LinearOrNot({ which, play }) {
  const map = which === 'T' ? T : g;
  const color = which === 'T' ? T_COLOR : G_COLOR;
  const marker = useRef(null);
  const shown = useFragmentShown(marker);
  const [run, setRun] = useState(0);
  const fly = useZoomTween(shown, run, { ms: 1000, delay: 150 });
  const s = useZoomTween(shown, run, { ms: 1800, delay: 1400 });
  const [x1, x2] = [LIN_P.w + 16, LIN_P.w + LIN_GAP - 16];
  const mid = (x1 + x2) / 2;
  const right = LIN_P.w + LIN_GAP;
  const image = mixTint(LIN_TINTS.a, LIN_TINTS[which], 1);
  const m = morph(map, s);
  const X = LIN_XS[0] + (LIN_XS[1] - LIN_XS[0]) * fly;
  const c = map(A);
  const copyPx = (q) => [X + (q[0] - c[0]) * SCALE, LIN_CY - (q[1] - c[1]) * SCALE];
  return (
    <svg
      viewBox={`0 0 ${LIN_W} ${LIN_P.h}`}
      width={LIN_W}
      height={LIN_P.h}
      onClick={() => shown && setRun((n) => n + 1)}
      role="img"
      aria-label={`A patch of the plane with the letter F, moved over and ${which === 'T' ? 'squeezed by T into a parallelogram' : 'bent by g'}`}
    >
      <g ref={marker} className="fragment fx-marker" data-fragment-index={play} />
      <OpenPanel left={0} map={ID} tint={TINTS.a} />
      {PRINT ? (
        <>
          <Stage index={play} effect="fade-out">
            <OpenPanel left={right} map={morph(map, 0)} />
          </Stage>
          <Stage index={play}>
            <OpenPanel left={right} map={map} tint={image} />
          </Stage>
        </>
      ) : (
        <OpenPanel left={right} map={m} />
      )}
      <Arrow x1={x1} x2={x2} y={LIN_CY} />
      <TexSvg x={mid} y={LIN_CY - 26} tex={r`\textcolor{${color}}{${which}}\colon\mathbb R^2\to\mathbb R^2`} size={24} color={INK} w={LIN_GAP} h={40} />
      <text x={mid} y={LIN_CY + 34} textAnchor="middle" fontSize="21" fontWeight="600" fill={color}>
        {which === 'T' ? 'linear' : 'nonlinear'}
      </text>
      {!PRINT && shown && <Patch e={EPS[0]} map={m} px={copyPx} tint={mixTint(LIN_TINTS.a, LIN_TINTS[which], s)} width={1.8} />}
    </svg>
  );
}

// the title: the three panels of Why does the chain rule hold?, at ×1, at the corners of a triangle
const TRI_P = { w: 190, h: 180 };
const TRI_W = 540;
const TRI_H = 500;
const TRI_EDGE = 16;
const TRI_SCALE = 46;
// the panels' top-left corners: near a at the bottom left, near g(a) at the top, near f(g(a)) at the bottom right
const TRI_AT = [
  [TRI_EDGE, TRI_H - TRI_EDGE - TRI_P.h],
  [(TRI_W - TRI_P.w) / 2, TRI_EDGE],
  [TRI_W - TRI_EDGE - TRI_P.w, TRI_H - TRI_EDGE - TRI_P.h],
];

/**
 * The arrow from panel `i` to panel `j` of the triangle, along the line of their centres, 12 px short
 * of each; its label `tex` `side` px to the left of it (as it goes).
 */
function TriLink({ i, j, tex, color, ink = color, side }) {
  const [a, b] = [TRI_AT[i], TRI_AT[j]].map(([x, y]) => [x + TRI_P.w / 2, y + TRI_P.h / 2]);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [dx, dy] = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  const out = Math.min(TRI_P.w / 2 / Math.abs(dx || 1e-9), TRI_P.h / 2 / Math.abs(dy || 1e-9)) + 12;
  const [from, tip] = [[a[0] + dx * out, a[1] + dy * out], [b[0] - dx * out, b[1] - dy * out]];
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={tip[0] - dx * 10} y2={tip[1] - dy * 10} stroke={ink} strokeWidth="2.6" />
      <Head tip={tip} dir={[dx, dy]} color={ink} />
      <TexSvg x={(from[0] + tip[0]) / 2 + dy * side} y={(from[1] + tip[1]) / 2 - dx * side} tex={tex} size={28} color={color} w={90} h={40} />
    </g>
  );
}

/**
 * Title: the patch round a (bottom left), its images under g round g(a) (top) and under f ∘ g round
 * f(g(a)) (bottom right), at ×1 as on Why does the chain rule hold?, at the corners of a triangle;
 * the arrows g and f along its sides, the shortcut f ∘ g (red) along its base. Static.
 */
export function ChainTriangle() {
  const maps = [ID, g, (p) => f(g(p))];
  const tints = [TINTS.a, TINTS.g, TINTS.fg];
  return (
    <svg
      className="figure-svg"
      viewBox={`0 0 ${TRI_W} ${TRI_H}`}
      width={TRI_W}
      height={TRI_H}
      role="img"
      aria-label="A patch of the plane with the letter F round a, its image under g round g(a) and under f after g round f(g(a)), at the corners of a triangle"
    >
      {maps.map((m, k) => (
        <OpenPanel key={k} left={TRI_AT[k][0]} top={TRI_AT[k][1]} size={TRI_P} scale={TRI_SCALE} map={m} tint={tints[k]} />
      ))}
      <TriLink i={0} j={1} tex="g" color={G_COLOR} ink={INK} side={24} />
      <TriLink i={1} j={2} tex="f" color={F_COLOR} ink={INK} side={24} />
      <TriLink i={0} j={2} tex={r`f\circ g`} color={FG_COLOR} side={-26} />
    </svg>
  );
}
