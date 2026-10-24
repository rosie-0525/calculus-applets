import { useEffect, useMemo, useRef } from 'react';

const rad = (d) => (d * Math.PI) / 180;

/**
 * The view (azimuth −20°, elevation 20°: turned from the textbook's −40°, 24° in Space.jsx so that the
 * face, along +x, looks at the students at the start): its rows send a point of space (z up) to the
 * screen's right, up and toward the viewer.
 */
export const VIEW = (() => {
  const [a, e] = [rad(-20), rad(20)];
  return [
    [Math.sin(a), Math.cos(a), 0],
    [-Math.sin(e) * Math.cos(a), Math.sin(e) * Math.sin(a), Math.cos(e)],
    [Math.cos(e) * Math.cos(a), -Math.cos(e) * Math.sin(a), Math.sin(e)],
  ];
})();

const mul = (P, Q) => P.map((row) => Q[0].map((_, j) => row.reduce((s, a, k) => s + a * Q[k][j], 0)));
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const norm = (v) => {
  const n = Math.hypot(...v);
  return v.map((t) => t / n);
};

// the light, from the upper left in front, and the half-way vector for the highlight (screen axes)
const LIGHT = norm([-0.5, 0.62, 0.6]);
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);
const ORANGE = [242, 132, 30];
const CARVED = [52, 24, 8];
const LOBES = 10;

/** Signed distance (negative inside) from (u, v) to the triangle p, q, r (counterclockwise). */
function triangle(u, v, p, q, r) {
  let d = -Infinity;
  for (const [a, b] of [
    [p, q],
    [q, r],
    [r, p],
  ]) {
    const [ex, ey] = [b[0] - a[0], b[1] - a[1]];
    const len = Math.hypot(ex, ey);
    d = Math.max(d, ((u - a[0]) * ey - (v - a[1]) * ex) / len);
  }
  return d;
}

/** Signed distance from (u, v) to the box with centre (cu, cv) and half sides hu, hv. */
function box(u, v, cu, cv, hu, hv) {
  const [qu, qv] = [Math.abs(u - cu) - hu, Math.abs(v - cv) - hv];
  return Math.hypot(Math.max(qu, 0), Math.max(qv, 0)) + Math.min(Math.max(qu, qv), 0);
}

// the grin: between the curves v = top(u) and v = bottom(u), which meet at its corners u = ±W
const W = 0.56;
const sag = (u) => 1 - (u / W) ** 2;
const top = (u) => -0.12 - 0.18 * sag(u);
const bottom = (u) => -0.12 - 0.44 * sag(u);

/**
 * The carved face, seen from the front (u to its right, v up, in units of the ball's radius): signed
 * distance to the eyes, the nose and the grin with three teeth.
 */
function face(u, v) {
  const eyes = Math.min(
    triangle(u, v, [-0.5, 0.12], [-0.16, 0.12], [-0.33, 0.4]),
    triangle(u, v, [0.16, 0.12], [0.5, 0.12], [0.33, 0.4]),
  );
  const nose = triangle(u, v, [-0.08, -0.05], [0.08, -0.05], [0, 0.08]);
  const slope = (2 * u) / (W * W);
  let grin = Math.max((v - top(u)) / Math.hypot(1, 0.18 * slope), (bottom(u) - v) / Math.hypot(1, 0.44 * slope));
  const teeth = Math.min(
    box(u, v, -0.22, top(-0.22) - 0.03, 0.06, 0.07),
    box(u, v, 0.22, top(0.22) - 0.03, 0.06, 0.07),
    box(u, v, 0, bottom(0) + 0.03, 0.065, 0.07),
  );
  grin = Math.max(grin, -teeth);
  return Math.min(eyes, nose, grin);
}

/**
 * The ball's colour at the point q of its surface (its own axes: the face looks along +x, the stem
 * sticks out along +z): a pumpkin's ribs from pole to pole, and the face; `aa` is the width (in the
 * face's units) over which an edge is blended.
 */
function paint(q, aa) {
  const phi = Math.atan2(q[1], q[0]);
  const rho = Math.hypot(q[0], q[1]);
  const s = (LOBES * phi) / (2 * Math.PI);
  const frac = s - Math.round(s); // 0 in the middle of a lobe, ±0.5 on a groove
  const groove = (0.5 - Math.abs(frac)) * ((2 * Math.PI) / LOBES) * rho;
  let f = (0.86 + 0.14 * Math.cos(Math.PI * frac)) * (1 - 0.32 * Math.exp(-((groove / 0.028) ** 2)));
  if (q[2] < -0.93) f *= 1 - 0.25 * Math.min(1, (-0.93 - q[2]) / 0.05); // the dimple at the bottom
  let rgb = ORANGE.map((c) => c * f);
  if (q[0] > 0.3) {
    const d = face(q[1], q[2]);
    const k = Math.min(1, Math.max(0, 0.5 - d / aa));
    if (k > 0) rgb = rgb.map((c, i) => c + (CARVED[i] - c) * k);
  }
  return rgb;
}

/** The ball seen through the view, turned by M (its own axes → space), as an image of side n px. */
function ballImage(M, n) {
  const S = mul(VIEW, M); // the ball's own axes → the screen
  const img = new ImageData(n, n);
  const data = img.data;
  const R = n / 2;
  for (let py = 0; py < n; py += 1) {
    for (let px = 0; px < n; px += 1) {
      const a = (px + 0.5 - R) / R;
      const b = (R - py - 0.5) / R;
      const r2 = a * a + b * b;
      const alpha = Math.min(1, Math.max(0, (1 - Math.sqrt(r2)) * R + 0.5));
      if (alpha <= 0) continue;
      const c = Math.sqrt(Math.max(0, 1 - r2));
      // the point of the surface on the screen (a, b, c), in the ball's own axes (S is orthogonal)
      const q = [0, 1, 2].map((i) => S[0][i] * a + S[1][i] * b + S[2][i] * c);
      const rgb = paint(q, 1.4 / (R * Math.max(0.2, c)));
      const lit = Math.max(0, a * LIGHT[0] + b * LIGHT[1] + c * LIGHT[2]);
      const spec = 70 * Math.max(0, a * HALF[0] + b * HALF[1] + c * HALF[2]) ** 36;
      const at = 4 * (py * n + px);
      for (let i = 0; i < 3; i += 1) data[at + i] = Math.min(255, rgb[i] * (0.3 + 0.75 * lit) + spec);
      data[at + 3] = 255 * alpha;
    }
  }
  return img;
}

/**
 * The stem (along the ball's own +z) on a canvas context: a short green cylinder from inside the ball
 * out to 1.28 radii, its cut end lighter when it faces the viewer. `o` is the ball's centre, R its
 * radius (backing pixels).
 */
function drawStem(ctx, S, o, R) {
  const d = [S[0][2], S[1][2], S[2][2]]; // the stem's direction on the screen
  const at = (t) => [o[0] + t * R * d[0], o[1] - t * R * d[1]];
  const [p0, p1] = [at(0.85), at(1.28)];
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  const [ux, uy] = len > 1e-6 ? [(p1[0] - p0[0]) / len, (p1[1] - p0[1]) / len] : [1, 0];
  const [nx, ny] = [-uy, ux];
  const [w0, w1] = [0.13 * R, 0.1 * R];
  const angle = Math.atan2(uy, ux);
  const out = Math.abs(d[2]);
  const side = ctx.createLinearGradient(p1[0] + nx * w1, p1[1] + ny * w1, p1[0] - nx * w1, p1[1] - ny * w1);
  side.addColorStop(0, '#2f4a12');
  side.addColorStop(0.45, '#5b7f24');
  side.addColorStop(1, '#3b5a16');
  ctx.fillStyle = side;
  ctx.strokeStyle = '#24380d';
  ctx.lineWidth = 0.012 * R;
  ctx.beginPath();
  ctx.ellipse(p0[0], p0[1], Math.max(0.01, w0 * out), w0, angle, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(p0[0] + nx * w0, p0[1] + ny * w0);
  ctx.lineTo(p1[0] + nx * w1, p1[1] + ny * w1);
  ctx.lineTo(p1[0] - nx * w1, p1[1] - ny * w1);
  ctx.lineTo(p0[0] - nx * w0, p0[1] - ny * w0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(p1[0], p1[1], Math.max(0.01, w1 * out), w1, angle, 0, 2 * Math.PI);
  if (d[2] > 0) ctx.fillStyle = '#8aa84a';
  ctx.fill();
  ctx.stroke();
}

/**
 * Draws the ball turned by M (its own axes → space) on a canvas of `width` × `height` px (`ratio`
 * backing pixels per px), its centre at `center` (px) and of radius `radius` (px).
 */
export function drawBall(ctx, M, { width, height, center, radius, ratio = 2 }) {
  const S = mul(VIEW, M);
  const R = Math.round(radius * ratio);
  const o = [center[0] * ratio, center[1] * ratio];
  const sprite = document.createElement('canvas');
  sprite.width = 2 * R;
  sprite.height = 2 * R;
  sprite.getContext('2d').putImageData(ballImage(M, 2 * R), 0, 0);
  ctx.clearRect(0, 0, width * ratio, height * ratio);
  const front = S[2][2] > -0.1; // the stem comes toward the viewer: it is drawn over the ball
  if (!front) drawStem(ctx, S, o, R);
  ctx.drawImage(sprite, o[0] - R, o[1] - R);
  if (front) drawStem(ctx, S, o, R);
}

/** The ball turned by M on a canvas, redrawn whenever M changes. */
export default function BallCanvas({ M, width, height, center, radius, className = '' }) {
  const ref = useRef(null);
  const key = M.flat().join(',');
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const frame = requestAnimationFrame(() => drawBall(canvas.getContext('2d'), M, { width, height, center, radius }));
    return () => cancelAnimationFrame(frame);
  }, [key, width, height, radius]); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} className={className} width={2 * width} height={2 * height} style={{ width, height }} />;
}

/** The still for print mode, where canvases come out blank: an <img> of the ball turned by M. */
export function BallStill({ M, width, height, center, radius, className = '' }) {
  const src = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2 * width;
    canvas.height = 2 * height;
    drawBall(canvas.getContext('2d'), M, { width, height, center, radius });
    return canvas.toDataURL('image/png');
  }, [M, width, height, center, radius]);
  return <img src={src} className={className} width={width} height={height} alt="A pumpkin ball" draggable="false" />;
}
