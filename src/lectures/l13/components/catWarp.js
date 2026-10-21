import catUrl from '../assets/cat.jpg';

export const CAT_URL = catUrl;

export const CAT_CREDIT = 'Photo: Fir0002, Wikimedia Commons, GFDL 1.2 (cropped)';

/** The cat photo's pixels (RGBA, 400 × 400), filled in before the first render (main.jsx awaits catReady). */
export const CAT = { w: 400, h: 400, data: null };

export const catReady = new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = CAT.w;
    c.height = CAT.h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, CAT.w, CAT.h);
    CAT.data = g.getImageData(0, 0, CAT.w, CAT.h).data;
    resolve();
  };
  img.onerror = () => resolve();
  img.src = catUrl;
});

const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

/**
 * Paints the cat photo, lying on the square |x|, |y| ≤ half in the plane, moved by a map, on a 2-D
 * canvas context that shows the rectangle `box` = [x₀, x₁, y₀, y₁] at k pixels per unit (the
 * canvas is (x₁ − x₀)k × (y₁ − y₀)k pixels). `at(v)` is the map, `inv(w)`
 * its inverse: each pixel w of the canvas takes the colour of the photo at inv(w) (bilinear, with
 * the photo's edges smoothed over a pixel), so the photo is drawn exactly, curved or not. Then the
 * photo's edge, moved by the map, in a thin dark line.
 */
export function paintCat(ctx, k, box, half, at, inv) {
  const [bx0, bx1, by0, by1] = box;
  const [nw, nh] = [Math.round((bx1 - bx0) * k), Math.round((by1 - by0) * k)];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, nw, nh);
  if (!CAT.data) return;

  // the photo's edge, moved: it bounds the moved photo
  const edge = [];
  const M = 48;
  for (let j = 0; j < 4 * M; j += 1) {
    const s = -half + (2 * half * (j % M)) / M;
    const side = Math.floor(j / M);
    edge.push(at(side === 0 ? [s, -half] : side === 1 ? [half, s] : side === 2 ? [-s, half] : [-half, -s]));
  }
  const xs = edge.map((q) => q[0]);
  const ys = edge.map((q) => q[1]);
  const i0 = Math.max(0, Math.floor((Math.min(...xs) - bx0) * k) - 2);
  const i1 = Math.min(nw, Math.ceil((Math.max(...xs) - bx0) * k) + 2);
  const j0 = Math.max(0, Math.floor((by1 - Math.max(...ys)) * k) - 2);
  const j1 = Math.min(nh, Math.ceil((by1 - Math.min(...ys)) * k) + 2);
  if (i1 <= i0 || j1 <= j0) return;

  const { w, h, data } = CAT;
  const out = ctx.createImageData(i1 - i0, j1 - j0);
  const o = out.data;
  const sx = w / (2 * half); // photo pixels per unit
  const sy = h / (2 * half);
  let p = 0;
  for (let j = j0; j < j1; j += 1) {
    const y = by1 - (j + 0.5) / k;
    for (let i = i0; i < i1; i += 1, p += 4) {
      const [u, v] = inv([bx0 + (i + 0.5) / k, y]);
      const a = clamp01((half - Math.abs(u)) * k + 0.5) * clamp01((half - Math.abs(v)) * k + 0.5);
      if (a === 0) continue;
      // bilinear sampling of the photo at (u, v)
      const fx = Math.min(w - 1.001, Math.max(0, (u + half) * sx - 0.5));
      const fy = Math.min(h - 1.001, Math.max(0, (half - v) * sy - 0.5));
      const x0 = fx | 0;
      const y0 = fy | 0;
      const tx = fx - x0;
      const ty = fy - y0;
      const q00 = 4 * (y0 * w + x0);
      const q10 = q00 + 4;
      const q01 = q00 + 4 * w;
      const q11 = q01 + 4;
      for (let c = 0; c < 3; c += 1) {
        const top = data[q00 + c] + (data[q10 + c] - data[q00 + c]) * tx;
        const bot = data[q01 + c] + (data[q11 + c] - data[q01 + c]) * tx;
        o[p + c] = top + (bot - top) * ty;
      }
      o[p + 3] = 255 * a;
    }
  }
  ctx.putImageData(out, i0, j0);

  ctx.beginPath();
  edge.forEach(([x, y], j) => (j ? ctx.lineTo((x - bx0) * k, (by1 - y) * k) : ctx.moveTo((x - bx0) * k, (by1 - y) * k)));
  ctx.closePath();
  ctx.strokeStyle = 'rgba(20, 33, 61, 0.75)';
  ctx.lineWidth = k / 40;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** A still of paintCat as a data URL (print mode, where canvases come out blank). */
export function catStill(k, box, half, at, inv) {
  const c = document.createElement('canvas');
  c.width = Math.round((box[1] - box[0]) * k);
  c.height = Math.round((box[3] - box[2]) * k);
  paintCat(c.getContext('2d'), k, box, half, at, inv);
  return c.toDataURL('image/png');
}
