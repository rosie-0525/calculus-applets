import katex from 'katex';

/*
 * An applet's caption (src/applets.js) is HTML, with its math in TeX between dollar signs, typeset
 * by KaTeX as on the slides: r`For nonzero vectors $\vv v_1$ and $\vv v_2$ in $\mathbb R^n$, …`.
 * \$ is a dollar sign. The macros are the decks' own (src/lectures/l<N>/components/Tex.jsx).
 */
const MACROS = {
  '\\vv': '\\mathbf{#1}',
  '\\norm': '\\lVert #1 \\rVert',
};

// \$, or $math$ with the punctuation that touches it: an opening bracket or quote before, and
// closing punctuation, ’s or a hyphenated ending (-axis, -th) after
const MATH = /\\\$|([(“‘]?)\$((?:\\.|[^$\\])+)\$((?:’s|-[A-Za-z]+|[.,:;?!)\]”’])*)/g;

// A browser may break a line after any of KaTeX's pieces, which would leave a comma or colon at the
// start of the next line, so the punctuation touching the math is typeset in it, as text in the
// caption's own face (.tex-punct, site.css), and spaced as an opening or closing bracket, with no
// space between it and the math.
const punct = (text, side) => (text ? `\\${side}{\\htmlClass{tex-punct}{\\text{${text}}}}` : '');
const OPTIONS = { strict: false, trust: ({ command }) => command === '\\htmlClass' };

/** The caption as HTML. `throwOnError`: throw on bad TeX (the build's check), else show it in red. */
export function captionHtml(caption, { throwOnError = false } = {}) {
  return caption.replace(MATH, (all, before, tex, after) => {
    if (tex === undefined) return '$';
    // a copy of the macros, which KaTeX may add to
    const html = katex.renderToString(`${punct(before, 'mathopen')}${tex}${punct(after, 'mathclose')}`, {
      ...OPTIONS,
      macros: { ...MACROS },
      throwOnError,
    });
    // KaTeX's MathML may put an element such as <mspace/> inside an <mi>, where the HTML parser
    // reads it as HTML and ignores the />: the element would stay open and hide the rest of the
    // caption in the (invisible) MathML. Closed explicitly, it parses the same either way.
    return html.replace(/<(m[a-z]+)([^<>]*?)\/>/g, '<$1$2></$1>');
  });
}
