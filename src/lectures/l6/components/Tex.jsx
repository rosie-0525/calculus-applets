import { useMemo } from 'react';
import katex from 'katex';

const KATEX_OPTIONS = {
  throwOnError: false,
  strict: false,
  // Needed for \htmlClass, which lets the CSS decorate part of an equation
  // without re-rendering it.
  trust: true,
  macros: {
    // Additions only -- never redefinitions. \\v, \\u and \\vec are all
    // real KaTeX accent commands, so the vector macro is spelled \\vv.
    '\\vv': '\\mathbf{#1}',
    '\\norm': '\\lVert #1 \\rVert',
    // Lecture 6: the n-vector of 1's and the centred data vectors
    '\\one': '\\mathbf{1}',
    '\\Xh': '\\widehat{\\mathbf{X}}',
    '\\Yh': '\\widehat{\\mathbf{Y}}',
  },
};

/** Tagged template helper so TeX can be written without doubled backslashes. */
export const r = String.raw;

/**
 * Renders a TeX string with KaTeX.
 * `display` renders it as a centered block; otherwise it is inline.
 */
export default function Tex({ tex, display = false, className = '', style }) {
  const html = useMemo(
    () => katex.renderToString(tex, { ...KATEX_OPTIONS, displayMode: display }),
    [tex, display],
  );
  const Tag = display ? 'div' : 'span';
  return (
    <Tag
      className={`tex ${display ? 'tex-display' : 'tex-inline'} ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
