/*
 * A downloaded applet: one HTML file that runs it in a browser, offline, from its source (see
 * Download.jsx, which gathers the pieces, and scripts/export-applets.mjs, which makes them).
 *
 *   a comment that says what the file is and how to change it
 *   <div id="app">
 *   the source, one <script type="text/jsx" data-file="…"> per file: the applet (src/viz/<id>.jsx)
 *     and what it imports, then src/main.jsx, written here, and the rest of the page (src/site/)
 *   the photos and data: <script type="application/json"> or base64 <script type="text/plain">
 *   the stylesheets: the site's, then the lecture's
 *   the libraries (React, KaTeX, …, Sucrase), then the script that runs the source
 *
 * Text that would end a block early (</script, or <!--) is put in base64, or escaped in JSON.
 */

const LIBRARIES = { react: 'React', katex: 'KaTeX', three: 'three.js' }; // what to call them in the comment
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const UNSAFE = /<\/script|<!--/i;

const wrap = (base64) => base64.replace(/.{120}/g, '$&\n');
function utf8Base64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function block(file) {
  const { path, kind, text } = file;
  const name = `data-file="${attr(path)}"`;
  if (kind === 'binary')
    return `<script type="text/plain" ${name} data-type="${attr(file.type)}" data-encoding="base64">\n${wrap(file.base64)}\n</script>`;
  if (kind === 'json') {
    const json = UNSAFE.test(text) ? text.replace(/</g, '\\u003c') : text;
    return `<script type="application/json" ${name}>\n${json.trimEnd()}\n</script>`;
  }
  if (UNSAFE.test(text))
    return `<script type="text/jsx" ${name} data-encoding="base64">\n${wrap(utf8Base64(text))}\n</script>`;
  return `<script type="text/jsx" ${name}>\n${text.trimEnd()}\n</script>`;
}

/** A string in JavaScript: String.raw`…`, so that TeX keeps single backslashes, when it can be. */
const literal = (s) => (/[`]|\$\{|\\$/.test(s) ? JSON.stringify(s) : `String.raw\`${s}\``);

/** src/main.jsx: put the applet on the page. */
const mainSource = ({ applet, topic, home }) => `// The page: the applet (src/viz/${applet.id}.jsx), with its title and question, as on the site.
import { createRoot } from 'react-dom/client';
import ExportPage from './site/ExportPage.jsx';
import * as viz from './viz/${applet.id}.jsx';

const applet = {
  id: ${JSON.stringify(applet.id)},
  title: ${JSON.stringify(applet.title)},
  // HTML, with the math in TeX between dollar signs (see src/site/caption.js)
  caption: ${literal(applet.caption ?? '')},
};

const topic = ${JSON.stringify(topic, null, 2)};

createRoot(document.getElementById('app')).render(
  <ExportPage applet={applet} topic={topic} home={${JSON.stringify(home)}} viz={viz} />,
);
`;

/**
 * The HTML file.
 *   applet   { id, title, caption }
 *   topic    { title, href }: the applet on its topic's page, an absolute URL
 *   home     the site's address
 *   files    [{ path, kind, type?, text | base64 }], the applet's module first (from applets/<id>.json)
 *   libs     [{ name, code }], React first, Sucrase last
 *   base     the site's stylesheets
 *   runtime  export-runtime.js
 *   favicon  the site's icon (SVG), optional
 */
export function exportHtml({ applet, topic, home, files, libs, base, runtime, favicon }) {
  const plain = (s) => String(s).replace(/--+/g, '–'); // in a comment
  const main = { path: 'src/main.jsx', kind: 'source', text: mainSource({ applet, topic, home }) };
  const page = files.filter((f) => f.path.startsWith('src/site/'));
  const applets = files.filter((f) => !f.path.startsWith('src/site/'));
  const sources = [...applets.filter((f) => f.kind === 'source'), main, ...page.filter((f) => f.kind === 'source')];
  const data = files.filter((f) => f.kind === 'json' || f.kind === 'binary');
  const styles = files.filter((f) => f.kind === 'css');
  const names = libs.map((l) => LIBRARIES[l.name] ?? l.name).filter((n) => n !== 'sucrase');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(applet.title)} – Applets</title>
${favicon ? `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${utf8Base64(favicon)}">\n` : ''}</head>
<body>
<!--
  ${plain(applet.title)}
  An applet from “Applets for linear algebra and multivariable calculus”:
  ${plain(topic.href)}

  To use it, open this file in a web browser. It needs no internet connection.

  To change it, edit its source below, save the file, and reload the page. The source is in
  JavaScript with React (JSX), one <script type="text/jsx" data-file="…"> block per file:
  src/viz/${applet.id}.jsx is the applet, the files under src/lectures/ are the parts of the
  lecture slides it is made of, and src/main.jsx and src/site/ are the page around it.
  If the applet does not start, the page says why, and the browser's console (in its
  developer tools) says more; a line number there counts from the top of its block.

  After the source come the photos and data the applet reads, its stylesheets, and the
  libraries it runs on: ${names.join(', ')}, and Sucrase, which turns the JSX into plain
  JavaScript when the page opens.
-->
<div id="app"></div>
<noscript><p style="padding: 2rem">The applet needs JavaScript.</p></noscript>

${sources.map(block).join('\n\n')}

${data.map(block).join('\n\n')}${data.length ? '\n\n' : ''}<style data-file="base.css">
${base.trimEnd()}
</style>

${styles.map((f) => `<style data-file="${attr(f.path)}">\n${f.text.trimEnd()}\n</style>`).join('\n\n')}

${libs.map((l) => `<script data-lib="${attr(l.name)}">\n${l.code.trimEnd()}\n</script>`).join('\n\n')}

<script data-main="src/main.jsx">
${runtime.trimEnd()}
</script>
</body>
</html>
`;
}
