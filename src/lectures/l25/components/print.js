/**
 * True in print mode (`?print-pdf`): reveal copies each slide once per key press as soon as the
 * deck starts, and the copies run no React state, so a part that moves shows a still per key press
 * instead (stacked, each in a fragment).
 */
export const PRINT = typeof window !== 'undefined' && /print-pdf/.test(window.location.search);
