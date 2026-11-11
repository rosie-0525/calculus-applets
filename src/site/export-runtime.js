/*
 * Runs the source in this page. Each <script type="text/jsx" data-file="…"> is a module; the first
 * time one is imported, Sucrase turns its JSX and its import/export statements into plain
 * JavaScript, which then runs with `require` in place of `import`. The line numbers stay those of
 * the block, so an error's line is the line of the block it is in.
 *
 * A module can import:
 *   - the other blocks, by a relative path, as with files ('../components/Tex.jsx');
 *   - the photos and data: a JSON block gives its value, a base64 block (an image, a .bin) a URL
 *     to it ('?raw' gives the text instead);
 *   - the libraries in this page (React, KaTeX, …), which put themselves in window.__appletModules;
 *   - a stylesheet, which gives nothing: the stylesheets are in the page already (a library's, such
 *     as KaTeX's, with the site's).
 */
(() => {
  const libraries = window.__appletModules ?? {};
  const blocks = new Map([...document.querySelectorAll('script[data-file]')].map((el) => [el.dataset.file, el]));
  const modules = new Map(); // path → { exports }
  const EXTENSIONS = ['', '.js', '.jsx', '.mjs', '.json', '/index.js', '/index.jsx'];
  // what the source finds in import.meta (Vite's), for a page that is built and not in development
  const importMeta = { env: { DEV: false, PROD: true, MODE: 'production', SSR: false, BASE_URL: './' }, url: location.href };

  /** The text of a block, without the line break after its tag. */
  const textOf = (el) => {
    const text = el.textContent.replace(/^\r?\n/, '');
    return el.dataset.encoding === 'base64' ? new TextDecoder().decode(bytesOf(text)) : text;
  };
  const bytesOf = (base64) => {
    const bin = atob(base64.replace(/\s+/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  };

  /** The block that `spec`, imported by the module at `from`, names. */
  function find(from, spec) {
    const path = spec.split('?')[0];
    const parts = path.startsWith('/') ? [] : from.split('/').slice(0, -1); // '/src/…': from the root
    for (const p of path.split('/')) {
      if (p === '..') parts.pop();
      else if (p !== '.' && p !== '') parts.push(p);
    }
    const base = parts.join('/');
    return EXTENSIONS.map((e) => base + e).find((p) => blocks.has(p)) ?? base;
  }

  function load(path, query = '') {
    const key = query ? `${path}?${query}` : path;
    if (modules.has(key)) return modules.get(key).exports;
    const el = blocks.get(path);
    if (!el) throw new Error(`There is no ${path} in this page.`);
    const module = { exports: {} };
    modules.set(key, module);
    if (el.type === 'text/jsx') run(path, textOf(el), module);
    else if (el.type === 'application/json') {
      const value = JSON.parse(textOf(el));
      module.exports = { __esModule: true, ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}), default: value };
    } else if (query === 'raw') module.exports = { __esModule: true, default: textOf(el) };
    else {
      const blob = new Blob([bytesOf(el.textContent)], { type: el.dataset.type });
      module.exports = { __esModule: true, default: URL.createObjectURL(blob) };
    }
    return module.exports;
  }

  function run(path, source, module) {
    let code;
    try {
      ({ code } = libraries.sucrase.transform(source, {
        transforms: ['jsx', 'imports'],
        jsxRuntime: 'automatic',
        production: true,
        filePath: path,
      }));
    } catch (e) {
      // Sucrase says where: "Error transforming <path>: Unexpected token (12:5)", line 12 of the block
      const [, what, line, column] = e.message.match(/^(?:Error transforming .*?: )?(.*?)(?: \((\d+):(\d+)\))?$/s);
      throw new Error(line ? `${path}, line ${line}, column ${column}: ${what}` : `${path}: ${what}`);
    }
    const require = (spec) => {
      if (/\.css(\?|$)/.test(spec)) return {};
      if (spec.startsWith('.') || spec.startsWith('/')) return load(find(path, spec), spec.split('?')[1] ?? '');
      if (spec in libraries) return libraries[spec];
      throw new Error(`${path} imports ${spec}, which is not in this page (it has ${Object.keys(libraries).join(', ')}).`);
    };
    // on the first line, so that the lines are the block's; sourceURL names it in the console
    const body = code.replace(/\bimport\.meta\b/g, '__importMeta');
    const fn = (0, eval)(`(function (require, module, exports, __importMeta) {${body}\n})\n//# sourceURL=${encodeURI(path)}`);
    fn(require, module, module.exports, importMeta);
  }

  /** An error before the page is up: on the page, since it would otherwise stay blank. */
  function show(error) {
    console.error(error);
    const pre = document.createElement('pre');
    pre.className = 'export-error';
    pre.textContent = `The applet did not start.\n\n${window.__appletError(error)}`;
    document.getElementById('app').replaceChildren(pre);
  }

  /** An error's message, and where in the source it happened (not inside the libraries). */
  window.__appletError = (error) => {
    const where = String(error?.stack ?? '')
      .split('\n')
      .filter((l) => /^\s*at |@/.test(l) && l.includes('src/') && !l.includes('://'));
    return [error?.message ?? String(error), ...where.map((l) => `  ${l.trim()}`)].join('\n');
  };

  try {
    load(document.currentScript.dataset.main);
  } catch (e) {
    show(e);
  }
})();
