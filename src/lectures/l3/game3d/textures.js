import * as THREE from 'three';

/* Textures for the 3-D game, drawn on canvases so the deck needs no image files. */

/** Resolves once the given CSS fonts have loaded (KaTeX's fonts load lazily). */
const fontsLoaded = (fonts) =>
  document.fonts ? Promise.all(fonts.map((f) => document.fonts.load(f))).catch(() => {}) : Promise.resolve();

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

/** One cell of the glowing floor grid (the texture repeats), with finer lines in between. */
export function gridTexture(renderer) {
  const S = 256;
  const [c, g] = canvas(S, S);
  g.fillStyle = '#000';
  g.fillRect(0, 0, S, S);
  const lines = (step, width, alpha) => {
    g.strokeStyle = `rgba(70, 215, 255, ${alpha})`;
    g.lineWidth = width;
    g.beginPath();
    for (let k = 0; k <= S; k += step) {
      g.moveTo(k, 0);
      g.lineTo(k, S);
      g.moveTo(0, k);
      g.lineTo(S, k);
    }
    g.stroke();
  };
  lines(64, 1.2, 0.18);
  lines(S, 18, 0.06);
  lines(S, 7, 0.22);
  lines(S, 2.6, 1);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

/** A soft round glow (sprites: muzzle flash, impact dots). */
export function glowTexture() {
  const S = 128;
  const [c, g] = canvas(S, S);
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A four-pointed star with a glow (the muzzle flash). */
export function flashTexture() {
  const S = 128;
  const [c, g] = canvas(S, S);
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.beginPath();
  for (let k = 0; k < 8; k += 1) {
    const a = (k * Math.PI) / 4;
    const r = k % 2 ? 14 : 62;
    g.lineTo(S / 2 + r * Math.cos(a), S / 2 + r * Math.sin(a));
  }
  g.closePath();
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Concrete: speckled grey with a panel seam. */
export function concreteTexture(renderer) {
  const S = 256;
  const [c, g] = canvas(S, S);
  g.fillStyle = '#8a8f99';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 5000; i += 1) {
    const v = 110 + Math.random() * 60;
    g.fillStyle = `rgba(${v},${v},${v + 6},${0.25 + Math.random() * 0.3})`;
    const r = Math.random() * 2.2;
    g.fillRect(Math.random() * S, Math.random() * S, r, r);
  }
  g.strokeStyle = 'rgba(40,44,52,0.55)';
  g.lineWidth = 2;
  g.strokeRect(1, 1, S - 2, S - 2);
  g.fillStyle = 'rgba(40,44,52,0.35)';
  [
    [30, 30],
    [S - 30, 30],
    [30, S - 30],
    [S - 30, S - 30],
  ].forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 4, 0, 2 * Math.PI);
    g.fill();
  });
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

/**
 * A neon sign: `parts` is a list of [text, font] pieces drawn one after the
 * other (so vectors can be bold and scalars italic, as on the slides).
 */
export function signTexture(parts, color) {
  const W = 1024;
  const H = 256;
  const [c, g] = canvas(W, H);
  const draw = () => {
    g.clearRect(0, 0, W, H);
    const widths = parts.map(([text, font]) => {
      g.font = font;
      return g.measureText(text).width;
    });
    let x = (W - widths.reduce((a, b) => a + b, 0)) / 2;
    g.textBaseline = 'middle';
    // three passes: a wide glow, a tight glow, and the white-hot core
    [
      [36, color, 0.9],
      [12, color, 1],
      [0, '#ffffff', 1],
    ].forEach(([blur, col, alpha], pass) => {
      let xx = x;
      parts.forEach(([text, font], i) => {
        g.font = font;
        g.shadowColor = color;
        g.shadowBlur = blur;
        g.globalAlpha = alpha;
        g.fillStyle = pass === 2 ? '#fff6f6' : col;
        g.fillText(text, xx, H / 2 + 6);
        xx += widths[i];
      });
    });
    g.globalAlpha = 1;
    g.shadowBlur = 0;
  };
  draw();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  // the math fonts come with KaTeX's stylesheet; redraw once they have loaded
  fontsLoaded(parts.map(([, font]) => font)).then(() => {
    draw();
    t.needsUpdate = true;
  });
  return t;
}

/** A single bold letter (the label of a vector) on a transparent background. */
export function letterTexture(letter, color) {
  const S = 128;
  const [c, g] = canvas(S, S);
  const draw = () => {
    g.clearRect(0, 0, S, S);
    g.font = 'bold 92px KaTeX_Main, Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = color;
    g.shadowBlur = 18;
    g.fillStyle = color;
    g.fillText(letter, S / 2, S / 2);
    g.shadowBlur = 0;
    g.fillStyle = '#ffffff';
    g.fillText(letter, S / 2, S / 2);
  };
  draw();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  fontsLoaded(['bold 92px KaTeX_Main']).then(() => {
    draw();
    t.needsUpdate = true;
  });
  return t;
}
