import { loadShasta, LEVELS } from './shasta.js';
import { printStill } from './ShastaPrint.jsx';

/**
 * The WebGL picture of the 3-D printing slide and the states it starts in. A PDF cannot run WebGL
 * in the copies reveal.js makes of each slide (one per key press), so in print mode
 * `prepareStills` draws each state once, before the first render, and the slide shows
 * `still(key)` instead.
 */
export const PRINTER = { width: 560, height: 470, az: -24, el: 26, c: 3000 };

const urls = {};

export async function prepareStills() {
  const shasta = await loadShasta();
  const { c: layer, ...printView } = PRINTER;
  urls.print = printStill(shasta, { ...printView, c: layer });
  urls['print-red'] = printStill(shasta, { ...printView, c: layer, red: true });
  urls['print-done'] = printStill(shasta, { ...printView, c: LEVELS[LEVELS.length - 1], nozzle: null });
}

/** The still `key` as a data URL (print mode). */
export const still = (key) => urls[key];
