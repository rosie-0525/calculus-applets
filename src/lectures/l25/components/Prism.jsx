import { useEffect, useMemo, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';
import { W, H, K, RAYS, project, WALL_X, WALL_Z, WALL_R, WINDOW, PRISM_Z, BL, BR, APEX, P0, BEAM_Y, SHEET_Z } from './prismOptics.js';
import { PrismScene, RAMP } from './PrismScene.js';

// The Spectral Theorem's picture (the user's requests: why "spectral"; then no 2 × 2 matrix, white
// light; then no A; then no labels "white light" and "pure colours"; then realistic and artistically
// appealing; then no dark background, the prism point up on a table, white light shining from a
// window; then the light natural, and shining on the wall, not on the table): a room in daylight; a
// glass prism stands on a wooden table; a sheet of white light from the window crosses it, splits into
// the pure colours and lands on the wall facing the window as the light spectrum, a band of colours
// one above the other, red at the top. The light in the air is faint and soft, as in a room in
// daylight (it was a solid white bar and a painted rainbow); it is on the wall that the colours are
// bright.
// The picture is a three.js scene (PrismScene.js; the user's request: built like Lecture 9's train over
// Donner Pass; it was one fragment shader): the room, the window, the table and the glass prism are
// real things, lit and shaded by three.js; the light is drawn on top by materials of its own, from the
// K colours that prismOptics.js traces through the prism (Snell, Fresnel, the eye's colours). The
// light comes in at its own pace, n times slower in the glass. Without WebGL: the same rays, drawn
// plainly (Flat).

const RED = RAYS[0];
const VIOLET = RAYS[K - 1];
// the light's speed (optical path per second), its start after the key press (s), and where its head
// is once the whole picture is lit
const SPEED = 3.3;
const DELAY = 0.25;
const DONE = Math.max(...RAYS.map((ray) => ray.oplHit)) + RAMP + 0.6;
const FAR = 1e4;

/** The scene on a canvas (PrismScene.js); null without WebGL. */
function sceneOn(canvas, options) {
  try {
    return new PrismScene(canvas, options);
  } catch (err) {
    console.error('Prism: the 3-D view is unavailable:', err);
    return null;
  }
}

/** A still of the picture, before the light (lit = 0) or with it (1), as a data URL; null without WebGL. */
function stillOf(lit) {
  const canvas = document.createElement('canvas');
  const s = sceneOn(canvas, { pixelRatio: 2, preserve: true });
  if (!s) return null;
  s.paint(7.3, lit ? FAR : -FAR);
  // a JPEG: the picture's fine grain makes a PNG ten times heavier in the PDF
  const url = canvas.toDataURL('image/jpeg', 0.93);
  s.dispose(true);
  return url;
}

const css = (rgb) => {
  const top = Math.max(...rgb);
  return `rgb(${rgb.map((v) => Math.round(255 * Math.pow(v / top, 1 / 2.2))).join(',')})`;
};
const pts = (ps) => ps.map((p) => project(p).map((v) => v.toFixed(1)).join(',')).join(' ');
/** Without WebGL: the same room and the same rays, drawn plainly. */
function Flat({ lit }) {
  const floor = project([0, 0, WALL_Z])[1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#b3c2d2" />
      <rect y={floor} width={W} height={H - floor} fill="#d2b78f" />
      <polygon points={pts([[WALL_X, 0, WALL_Z], [WALL_X, 6, WALL_Z], [WALL_X, 6, 4], [WALL_X, 0, 4]])} fill="#9fb0c2" />
      <polygon points={pts([[WALL_X, WINDOW.y1, WINDOW.z1], [WALL_X, WINDOW.y2, WINDOW.z1], [WALL_X, WINDOW.y2, WINDOW.z2], [WALL_X, WINDOW.y1, WINDOW.z2]])} fill="#f4f9ff" stroke="#fff" strokeWidth={5} />
      <polygon points={pts([[WALL_R, 0, WALL_Z], [WALL_R, 6, WALL_Z], [WALL_R, 6, 6], [WALL_R, 0, 6]])} fill="#bccad9" />
      {lit && (
        <g>
          <polygon points={pts([[WALL_X, BEAM_Y, -SHEET_Z], [P0[0], BEAM_Y, -SHEET_Z], [P0[0], BEAM_Y, SHEET_Z], [WALL_X, BEAM_Y, SHEET_Z]])} fill="#fff" fillOpacity={0.6} />
          {RAYS.map((ray, k) => (
            <polyline key={k} points={pts([[...ray.q, 0], [...ray.hit, 0]])} fill="none" stroke={css(ray.rgb)} strokeWidth={5} strokeOpacity={0.3} />
          ))}
          <polygon points={pts([[...P0, 0], [...RED.q, 0], [...VIOLET.q, 0]])} fill="#fff" fillOpacity={0.6} stroke="#fff" strokeOpacity={0.6} strokeWidth={5} strokeLinejoin="round" />
          {RAYS.map((ray, k) => (
            <polygon key={k} points={pts([[WALL_R, ray.hit[1] - 0.02, -SHEET_Z], [WALL_R, ray.hit[1] + 0.02, -SHEET_Z], [WALL_R, ray.hit[1] + 0.02, SHEET_Z], [WALL_R, ray.hit[1] - 0.02, SHEET_Z]])} fill={css(ray.rgb)} />
          ))}
        </g>
      )}
      <polygon points={pts([[...BL, PRISM_Z], [...BR, PRISM_Z], [...APEX, PRISM_Z]])} fill="#e9f3fb" fillOpacity={0.35} stroke="#5f7388" strokeWidth={1.6} strokeLinejoin="round" />
      <polyline points={pts([[...BL, PRISM_Z], [...BL, -PRISM_Z], [...APEX, -PRISM_Z], [...APEX, PRISM_Z]])} fill="none" stroke="#5f7388" strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
}

// the spectrum on the wall, from red down to violet (its ends fade out), and a brace beside it, on
// the side of the band that is nearer the camera, its tip pointing right, at the name
const SIDE_Z = SHEET_Z + 0.06;
const TOP_RED = project([WALL_R, RAYS[0].hit[1] + 0.07, SIDE_Z]);
const TOP_VIOLET = project([WALL_R, RAYS[K - 1].hit[1], SIDE_Z]);
const Y_RED = TOP_RED[1];
const Y_VIOLET = TOP_VIOLET[1];
const X_BRACE = Math.max(TOP_RED[0], TOP_VIOLET[0]) + 9;
const BRACE_D = 9;
const brace = (x, y1, y2, d = BRACE_D) => {
  const m = (y1 + y2) / 2;
  return `M ${x} ${y1} Q ${x + d} ${y1} ${x + d} ${y1 + d} L ${x + d} ${m - d} Q ${x + d} ${m} ${x + 2 * d} ${m} Q ${x + d} ${m} ${x + d} ${m + d} L ${x + d} ${y2 - d} Q ${x + d} ${y2} ${x} ${y2}`;
};

/**
 * The prism. Live: the room is in daylight; at `lit` (the slide's key press) the white light comes in
 * from the window, splits in the prism, fans out and lands on the wall facing the window as the light
 * spectrum; the haze keeps drifting while the slide is on screen. `still` (print): the picture before
 * the light (0) or with it (1), as an image. On key press `spectrum`: a brace beside the spectrum,
 * light spectrum.
 */
export default function Prism({ lit = false, still, spectrum }) {
  const canvas = useRef(null);
  const since = useRef(null);
  const [flat, setFlat] = useState(false);
  const url = useMemo(() => (still == null ? null : stillOf(still)), [still]);

  // the light starts when `lit` turns on, and goes out at once when it turns off
  useEffect(() => {
    since.current = lit ? performance.now() : null;
  }, [lit]);

  useEffect(() => {
    if (still != null) return undefined;
    const el = canvas.current;
    let scene = null;
    let built = false;
    // the scene is built once the deck is up, before the slide is reached (or when it is reached)
    const build = () => {
      if (built) return;
      built = true;
      scene = sceneOn(el);
      if (!scene) setFlat(true);
    };
    const idle = setTimeout(build, 1200);
    const lost = () => setFlat(true);
    el.addEventListener('webglcontextlost', lost);
    const t0 = performance.now();
    let frame;
    let last = 0;
    let lastHead = null;
    let cap = 2; // the canvas's pixels per picture pixel, at most: lowered on a slow machine
    let timed = 0;
    const step = (now) => {
      frame = requestAnimationFrame(step);
      if (!el.closest('section')?.classList.contains('present')) return;
      build();
      if (!scene) return;
      const head = since.current == null ? -FAR : Math.min(FAR, SPEED * ((now - since.current) / 1000 - DELAY));
      const steady = head < 0 || head > DONE;
      const shown = steady ? (head < 0 ? -FAR : FAR) : head;
      // once the light stands still, only the haze moves: half the frames will do
      if (steady && lastHead === shown && now - last < 30) return;
      // as sharp as the screen shows it (reveal scales the slide), within reason
      const scale = Math.min(cap, Math.max(1, ((el.getBoundingClientRect().width || W) / W) * (window.devicePixelRatio || 1)));
      if (Math.abs(el.width - Math.round(W * scale)) > 8) scene.setScale(scale);
      const time = (now - t0) / 1000;
      // the third picture is timed (the first two compile the shaders): too slow, and it gets coarser
      if (timed === 2) {
        scene.paint(time, FAR);
        scene.wait();
        const start = performance.now();
        scene.paint(time, FAR);
        scene.wait();
        const ms = performance.now() - start;
        if (ms > 14) cap = Math.max(1, scale * Math.sqrt(14 / ms));
      }
      timed += 1;
      scene.paint(time, shown);
      last = now;
      lastHead = shown;
    };
    frame = requestAnimationFrame(step);
    return () => {
      clearTimeout(idle);
      cancelAnimationFrame(frame);
      el.removeEventListener('webglcontextlost', lost);
      scene?.dispose();
    };
  }, [still]);

  const drawn = still != null ? still > 0 : lit;
  return (
    <div
      className="l25-prism-scene"
      style={{ width: W, height: H }}
      role="img"
      aria-label="A room in daylight: a sheet of white light from the window crosses a glass prism standing on a wooden table and splits into the pure colours, which land on the wall facing the window one above the other, from red at the top down to violet: the light spectrum"
    >
      {still != null ? url ? <img src={url} alt="" /> : <Flat lit={drawn} /> : flat ? <Flat lit={drawn} /> : <canvas ref={canvas} width={W} height={H} />}
      {spectrum != null && (
        <svg viewBox={`0 0 ${W} ${H}`}>
          <Fragment as="g" index={spectrum}>
            <path d={brace(X_BRACE, Y_RED, Y_VIOLET)} fill="none" stroke="#14213d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <foreignObject x={X_BRACE + 2 * BRACE_D + 8} y={(Y_RED + Y_VIOLET) / 2 - 20} width={200} height={40} style={{ overflow: 'visible', pointerEvents: 'none' }}>
              <div xmlns="http://www.w3.org/1999/xhtml" className="l25-prism-name" style={{ justifyContent: 'flex-start' }}>
                <span>light spectrum</span>
              </div>
            </foreignObject>
          </Fragment>
        </svg>
      )}
    </div>
  );
}
