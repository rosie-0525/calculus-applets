/**
 * The tiny AI of How does an AI learn?: it reads a handwritten digit, 28 × 28 pixels x (0 = paper,
 * 1 = ink), with 7,850 numbers w: for each digit d = 0, …, 9 a weight per pixel, W[d][p], and a
 * number b_d. Its score for d is
 *
 *   s_d(x) = Σ_p W[d][p] x_p + b_d,
 *
 * and its guess is the digit with the highest score; softmax turns the scores into its
 * confidences P_d = e^{s_d} / Σ_k e^{s_k}. Its error E(w) is the mean, over the training digits,
 * of −ln P_label (the cross-entropy: 0 if it is sure of the right digit, large if it is sure of a
 * wrong one), and it learns by gradient descent on E, from w = 0. The data: src/data/digits.bin
 * (see make-digits.py).
 */

export const SIDE = 28;
export const PIX = SIDE * SIDE;
export const NUM = 10 * (PIX + 1); // 7,850
const ROW = PIX + 1; // W[d] then b_d, in w[d ROW … d ROW + PIX]

/**
 * A set of digits, stored sparsely: the ink pixels of digit n are idx[off[n] … off[n + 1]), with
 * their ink val (0 to 1); y[n] is its label; img(n) its 784 bytes (0 = paper, 255 = ink).
 */
function digitSet(bytes, labels, start, n) {
  const off = new Int32Array(n + 1);
  const idx = [];
  const val = [];
  for (let k = 0; k < n; k += 1) {
    const base = (start + k) * PIX;
    for (let p = 0; p < PIX; p += 1) {
      const v = bytes[base + p];
      if (v) {
        idx.push(p);
        val.push(v / 255);
      }
    }
    off[k + 1] = idx.length;
  }
  return {
    n,
    off,
    idx: Uint16Array.from(idx),
    val: Float32Array.from(val),
    y: labels.subarray(start, start + n),
    img: (k) => bytes.subarray((start + k) * PIX, (start + k + 1) * PIX),
  };
}

/** digits.bin (an ArrayBuffer) → { train, test }: 5,000 training digits and 1,000 test digits. */
export function parseDigits(buf, nTrain = 5000, nTest = 1000) {
  const all = new Uint8Array(buf);
  const N = nTrain + nTest;
  const bytes = all.subarray(0, N * PIX);
  const labels = all.subarray(N * PIX, N * PIX + N);
  return { train: digitSet(bytes, labels, 0, nTrain), test: digitSet(bytes, labels, nTrain, nTest) };
}

/** The scores s_0, …, s_9 of digit k of a set. */
function scoresOf(w, set, k, s) {
  for (let d = 0; d < 10; d += 1) s[d] = w[d * ROW + PIX];
  for (let j = set.off[k]; j < set.off[k + 1]; j += 1) {
    const p = set.idx[j];
    const v = set.val[j];
    for (let d = 0; d < 10; d += 1) s[d] += w[d * ROW + p] * v;
  }
  return s;
}

/** Softmax of s, in place; returns ln Σ e^{s_k} − max s (for the error). */
function softmax(s) {
  let m = -Infinity;
  for (let d = 0; d < 10; d += 1) m = Math.max(m, s[d]);
  let z = 0;
  for (let d = 0; d < 10; d += 1) {
    s[d] = Math.exp(s[d] - m);
    z += s[d];
  }
  for (let d = 0; d < 10; d += 1) s[d] /= z;
  return Math.log(z);
}

/** E(w) and its gradient ∇E(w) (a new Float64Array of 7,850 numbers), over a set of digits. */
export function gradE(w, set) {
  const g = new Float64Array(NUM);
  const s = new Float64Array(10);
  let E = 0;
  for (let k = 0; k < set.n; k += 1) {
    scoresOf(w, set, k, s);
    const lab = set.y[k];
    const sl = s[lab];
    let m = -Infinity;
    for (let d = 0; d < 10; d += 1) m = Math.max(m, s[d]);
    E += softmax(s) + m - sl; // −ln P_label
    s[lab] -= 1; // P_d − [d = label]
    for (let d = 0; d < 10; d += 1) g[d * ROW + PIX] += s[d];
    for (let j = set.off[k]; j < set.off[k + 1]; j += 1) {
      const p = set.idx[j];
      const v = set.val[j];
      for (let d = 0; d < 10; d += 1) g[d * ROW + p] += s[d] * v;
    }
  }
  for (let i = 0; i < NUM; i += 1) g[i] /= set.n;
  return { E: E / set.n, g };
}

/** One step of gradient descent, w − t ∇E(w) (a new array), and E at w. */
export function step(w, set, t) {
  const { E, g } = gradE(w, set);
  const next = new Float64Array(NUM);
  for (let i = 0; i < NUM; i += 1) next[i] = w[i] - t * g[i];
  return { w: next, E };
}

/** The error E(w) alone. */
export function errorE(w, set) {
  const s = new Float64Array(10);
  let E = 0;
  for (let k = 0; k < set.n; k += 1) {
    scoresOf(w, set, k, s);
    const sl = s[set.y[k]];
    let m = -Infinity;
    for (let d = 0; d < 10; d += 1) m = Math.max(m, s[d]);
    E += softmax(s) + m - sl;
  }
  return E / set.n;
}

/**
 * The fraction of a set's digits that w reads right; a tie between k digits, the right one among
 * them, counts 1/k (a guess at random among them: at w = 0, 1/10).
 */
export function accuracy(w, set) {
  const s = new Float64Array(10);
  let right = 0;
  for (let k = 0; k < set.n; k += 1) {
    scoresOf(w, set, k, s);
    const lab = set.y[k];
    let above = 0;
    let tied = 0;
    for (let d = 0; d < 10; d += 1) {
      if (s[d] > s[lab]) above += 1;
      else if (s[d] === s[lab]) tied += 1;
    }
    if (!above) right += 1 / tied;
  }
  return right / set.n;
}

/** The confidences P_0, …, P_9 for an image x (784 numbers, 0 to 1). */
export function confidences(w, x) {
  const s = new Float64Array(10);
  for (let d = 0; d < 10; d += 1) {
    let v = w[d * ROW + PIX];
    for (let p = 0; p < PIX; p += 1) if (x[p]) v += w[d * ROW + p] * x[p];
    s[d] = v;
  }
  softmax(s);
  return s;
}

/** The weights of digit d, W[d] (784 numbers: its picture). */
export const weightsOf = (w, d) => w.subarray(d * ROW, d * ROW + PIX);

/** w after n steps with learning rate t, from 0 (for print mode). */
export function train(set, t, n) {
  let w = new Float64Array(NUM);
  for (let k = 0; k < n; k += 1) w = step(w, set, t).w;
  return w;
}

/**
 * A drawing made into an MNIST image, as MNIST's own digits were made: `ink` is the drawing
 * rasterized at 4 × 28 = 112 pixels a side (0 to 1), its strokes already scaled to fit the middle
 * 80 × 80 (MNIST's 20 × 20 box); this averages it down to 28 × 28 and moves it so that the centre of
 * mass of the ink is at the centre. Returns 784 numbers, 0 to 1, or null if there is no ink.
 */
export function centerInk(ink) {
  const small = new Float64Array(PIX);
  let mass = 0;
  let mx = 0;
  let my = 0;
  for (let j = 0; j < SIDE; j += 1) {
    for (let i = 0; i < SIDE; i += 1) {
      let v = 0;
      for (let b = 0; b < 4; b += 1) for (let a = 0; a < 4; a += 1) v += ink[(4 * j + b) * 4 * SIDE + 4 * i + a];
      v /= 16;
      small[j * SIDE + i] = v;
      mass += v;
      mx += v * (i + 0.5);
      my += v * (j + 0.5);
    }
  }
  if (mass < 1e-6) return null;
  const dx = Math.round(14 - mx / mass);
  const dy = Math.round(14 - my / mass);
  const x = new Float64Array(PIX);
  for (let j = 0; j < SIDE; j += 1) {
    for (let i = 0; i < SIDE; i += 1) {
      const si = i - dx;
      const sj = j - dy;
      if (si >= 0 && si < SIDE && sj >= 0 && sj < SIDE) x[j * SIDE + i] = Math.min(1, small[sj * SIDE + si]);
    }
  }
  return x;
}
