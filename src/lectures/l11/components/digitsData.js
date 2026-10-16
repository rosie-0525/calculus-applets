import digitsUrl from '../data/digits.bin?url';
import { parseDigits } from './digits.js';

let digits = null;
let promise = null;

/** Fetches the handwritten digits of How does an AI learn? (once); main.jsx waits for them. */
export function loadDigits() {
  if (!promise) {
    promise = fetch(digitsUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        digits = parseDigits(buf);
        return digits;
      });
  }
  return promise;
}

/** { train, test } (see digits.js), once loadDigits has resolved. */
export const getDigits = () => digits;
