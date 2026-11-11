import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { transform } from 'sucrase';
import { build } from 'vite';

/*
 * The pieces of a downloaded applet. The Download button (src/site/Download.jsx) puts them together
 * into one HTML file that runs the applet in a browser, offline, from its source; see
 * src/site/export-html.js for the file and src/site/export-runtime.js for how it runs. Under
 * <base>export/:
 *
 *   applets/<id>.json   what the applet is made of: { files: [{ path, kind, type? }], libs: [name] },
 *                       kind source | json | css | binary, in the order they are imported
 *   files/<path>        those files, as they are in the repository, except the stylesheets:
 *                       those are scoped as on the site (the config's PostCSS plugins), with fonts
 *                       and images inlined
 *   lib/<name>.js       each library, bundled and minified, to put in a <script>: react (with
 *                       react-dom), katex, three, …, and sucrase, which compiles the JSX
 *   base.css            the site's stylesheets (reveal's theme, with Source Sans; KaTeX; site.css)
 *   runtime.js          the script that runs the source
 *
 * The build writes them all (after the bundle); the dev server makes each when it is asked for.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(ROOT, 'package.json'));

// what an import without an extension can be, as Vite resolves it
const EXTENSIONS = ['', '.js', '.jsx', '.mjs', '.json', '/index.js', '/index.jsx'];
const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

// The page around the applet, in every file; src/main.jsx, which imports it, is written for each.
const PAGE = 'src/site/ExportPage.jsx';
const RUNTIME = 'src/site/export-runtime.js';

// React is one library; the others get it from there, and are bundled one per package.
const REACT = ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'];
const packageOf = (spec) => spec.split('/').slice(0, spec.startsWith('@') ? 2 : 1).join('/');
const libOf = (spec) => (REACT.includes(spec) ? 'react' : packageOf(spec));

const rel = (abs) => relative(ROOT, abs).split(sep).join('/');
const kindOf = (path) => {
  const ext = extname(path);
  if (['.js', '.jsx', '.mjs'].includes(ext)) return 'source';
  if (ext === '.json') return 'json';
  if (ext === '.css') return 'css';
  return 'binary';
};

/** The specifiers a module imports, in order, read the way the runtime will read them. */
const scanned = new Map(); // abs → { mtime, specs }
function importsOf(abs) {
  const mtime = statSync(abs).mtimeMs;
  const hit = scanned.get(abs);
  if (hit?.mtime === mtime) return hit.specs;
  const { code } = transform(readFileSync(abs, 'utf8'), {
    transforms: ['jsx', 'imports'],
    jsxRuntime: 'automatic',
    production: true,
    filePath: abs,
  });
  const specs = [...code.matchAll(/\brequire\((['"])(.*?)\1\)/g)].map((m) => m[2]);
  scanned.set(abs, { mtime, specs });
  return specs;
}

/** The file `spec` names, imported by `from`: relative to it, or to the root ('/src/…'), as Vite does. */
function resolveImport(from, spec) {
  const path = spec.split('?')[0];
  const base = path.startsWith('/') ? join(ROOT, path) : resolve(dirname(from), path);
  const hit = EXTENSIONS.map((e) => base + e).find((p) => existsSync(p) && statSync(p).isFile());
  if (!hit) throw new Error(`${rel(from)}: cannot find ${spec}`);
  return hit;
}

/** Everything `entries` import, the entries first: { files: [{ path, kind, type? }], specs: [library import] }. */
function graph(entries) {
  const seen = new Set();
  const files = [];
  const specs = new Set();
  const visit = (abs) => {
    if (seen.has(abs)) return;
    seen.add(abs);
    const path = rel(abs);
    const kind = kindOf(path);
    files.push(kind === 'binary' ? { path, kind, type: MIME[extname(path)] ?? 'application/octet-stream' } : { path, kind });
    if (kind !== 'source') return;
    for (const spec of importsOf(abs)) {
      if (spec.startsWith('.') || spec.startsWith('/')) visit(resolveImport(abs, spec));
      else if (!/\.css(\?|$)/.test(spec)) specs.add(spec); // a library's stylesheet: KaTeX's is in base.css
    }
  };
  entries.forEach((e) => visit(resolve(ROOT, e)));
  return { files, specs: [...specs] };
}

const vizIds = () =>
  readdirSync(join(ROOT, 'src/viz'))
    .filter((f) => f.endsWith('.jsx'))
    .map((f) => f.slice(0, -4));

/** What applet `id` is made of; the library list always starts with React. */
function manifest(id) {
  const { files, specs } = graph([`src/viz/${id}.jsx`, PAGE]);
  const libs = ['react', ...new Set(specs.map(libOf).filter((l) => l !== 'react'))];
  return { files, libs };
}

/* ---- Stylesheets ----------------------------------------------------------------------------- */

const dataUrl = (abs) => `data:${MIME[extname(abs)] ?? 'application/octet-stream'};base64,${readFileSync(abs).toString('base64')}`;
const URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const isLocal = (u) => !/^(data:|https?:|#|\/\/)/.test(u);

/** Splits a declaration's value at the commas outside parentheses. */
const splitList = (value) => value.match(/(?:[^,(]|\([^)]*\))+/g).map((s) => s.trim());

/**
 * Inline the stylesheet's @imports, and its url()s as data: URLs, so it needs no other file. Of a
 * font's sources only the best is kept (woff2, else woff, …), so that each font is in once.
 */
const inlineUrls = () => ({
  postcssPlugin: 'inline-urls',
  Once(root, { result }) {
    root.walkAtRules('import', (at) => {
      const u = at.params.match(/^(?:url\()?\s*['"]?([^'")]+)/)[1];
      if (!isLocal(u)) return;
      const abs = resolve(dirname(at.source.input.file), u);
      at.replaceWith(postcss.parse(readFileSync(abs, 'utf8'), { from: abs }).nodes);
    });
    const inline = (value, from) =>
      value.replace(URL_RE, (all, q, u) => (isLocal(u) ? `url("${dataUrl(resolve(dirname(from), u.replace(/[?#].*$/, '')))}")` : all));
    const fileOf = (node) => node.source?.input?.file ?? result.opts.from;
    root.walkAtRules('font-face', (face) => {
      const sources = [];
      face.walkDecls('src', (d) => {
        sources.push(...splitList(d.value).map((s) => ({ s, from: fileOf(d) })));
        d.remove();
      });
      const rank = ({ s }) => {
        const format = s.match(/format\(\s*['"]?([a-z0-9]+)/i)?.[1];
        const ext = s.match(/url\(\s*['"]?[^'")?#]*\.(\w+)/)?.[1];
        return FONT_RANK[format] ?? FONT_RANK[ext] ?? 9;
      };
      const best = sources.sort((a, b) => rank(a) - rank(b))[0];
      if (best) face.append({ prop: 'src', value: inline(best.s, best.from) });
    });
    root.walkDecls((d) => {
      if (d.value.includes('url(')) d.value = inline(d.value, fileOf(d));
    });
  },
});
const FONT_RANK = { woff2: 0, woff: 1, truetype: 2, ttf: 2, opentype: 3, otf: 3 };
inlineUrls.postcss = true;

async function css(abs, plugins = []) {
  const out = await postcss([...plugins, inlineUrls()]).process(readFileSync(abs, 'utf8'), { from: abs });
  return inStyle(out.css, rel(abs));
}

/* The pieces go into <style> and <script> elements, which text like this would end early. */
function inStyle(text, what) {
  if (/<\/style/i.test(text)) throw new Error(`${what} has </style in it`);
  return text;
}
function inScript(code, what) {
  if (/<!--/.test(code)) throw new Error(`${what} has <!-- in it`);
  return code.replace(/<\/script/gi, '<\\/script'); // only ever in a string or a regular expression
}

/** The site's own stylesheets, in the order main.jsx imports them. */
async function baseCss() {
  const parts = [
    ['reveal.js theme “white”, with Source Sans Pro (SIL Open Font License)', await css(require.resolve('reveal.js/dist/theme/white.css'))],
    ['KaTeX (MIT License), with its fonts', await css(require.resolve('katex/dist/katex.min.css'))],
    ['The site', await css(join(ROOT, 'src/site/site.css'))],
  ];
  return inStyle(parts.map(([what, text]) => `/* ${what} */\n${text.trim()}\n`).join('\n'), 'base.css');
}

/* ---- Libraries ------------------------------------------------------------------------------- */

/** The libraries' imports that some applet uses, by library. */
function libraryImports(ids) {
  const page = graph([PAGE]).specs;
  const byLib = new Map([['react', new Set(REACT)]]);
  for (const id of ids)
    for (const spec of [...graph([`src/viz/${id}.jsx`]).specs, ...page]) {
      const lib = libOf(spec);
      if (!byLib.has(lib)) byLib.set(lib, new Set());
      byLib.get(lib).add(spec);
    }
  return byLib;
}

function licenseLine(pkg) {
  const json = JSON.parse(readFileSync(join(ROOT, 'node_modules', pkg, 'package.json'), 'utf8'));
  const home = json.homepage ?? (typeof json.repository === 'string' ? json.repository : json.repository?.url) ?? '';
  return `${json.name} ${json.version}, ${json.license} License${home ? `, ${home.replace(/^git\+|\.git$/g, '')}` : ''}`;
}

/**
 * One library as a classic script: it puts each of `specs` in window.__appletModules, under the name
 * the source imports it by. React's imports in another library are taken from there, so that there
 * is one React.
 */
async function buildLib(name, specs) {
  const entry =
    name === 'sucrase'
      ? `import { transform } from 'sucrase'; (globalThis.__appletModules ??= {}).sucrase = { transform };`
      : [
          ...specs.map((s, i) => `import * as m${i} from ${JSON.stringify(s)};`),
          `const modules = (globalThis.__appletModules ??= {});`,
          `const add = (name, ns) => { modules[name] = { __esModule: true, ...ns, default: 'default' in ns ? ns.default : ns }; };`,
          ...specs.map((s, i) => `add(${JSON.stringify(s)}, m${i});`),
        ].join('\n');
  const shim = (spec) =>
    `const m = globalThis.__appletModules[${JSON.stringify(spec)}];\nexport default m.default;\n` +
    `export const { ${Object.keys(require(spec)).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default').join(', ')} } = m;`;
  const out = await build({
    configFile: false,
    root: ROOT,
    logLevel: 'silent',
    mode: 'production',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      {
        name: 'applet-lib',
        enforce: 'pre',
        resolveId(id) {
          if (id.endsWith('virtual:applet-lib')) return '\0applet-lib';
          if (name !== 'react' && REACT.includes(id)) return `\0shim:${id}`;
          return null;
        },
        load(id) {
          if (id === '\0applet-lib') return entry;
          if (id.startsWith('\0shim:')) return shim(id.slice(6));
          return null;
        },
      },
    ],
    build: {
      write: false,
      minify: true,
      copyPublicDir: false,
      reportCompressedSize: false,
      lib: { entry: 'virtual:applet-lib', formats: ['iife'], name: '__appletLib' },
    },
  });
  const code = (Array.isArray(out) ? out[0] : out).output[0].code;
  const pkgs = name === 'react' ? ['react', 'react-dom'] : [packageOf(specs[0] ?? name)];
  return inScript(`/* ${pkgs.map(licenseLine).join('; ')} */\n${code.trim()}\n`, `lib/${name}.js`);
}

/* ---- The pieces, for the build, the dev server and scripts/export.mjs ----------------------- */

/** A file of the applets' source (under src/), the stylesheets scoped; null if there is none. */
export async function readFile(path, cssPlugins) {
  const abs = resolve(ROOT, path);
  if (!abs.startsWith(join(ROOT, 'src') + sep) || !existsSync(abs)) return null;
  return kindOf(path) === 'css' ? css(abs, cssPlugins) : readFileSync(abs);
}

/** A library, with every import of it that some applet uses; null if none uses it. */
const libs = new Map(); // name and imports → Promise<code>
export function libCode(name) {
  const specs = name === 'sucrase' ? [] : [...(libraryImports(vizIds()).get(name) ?? [])].sort();
  if (name !== 'sucrase' && !specs.length) return Promise.resolve(null);
  const key = `${name}:${specs.join(',')}`;
  if (!libs.has(key)) libs.set(key, buildLib(name, specs).catch((e) => (libs.delete(key), Promise.reject(e))));
  return libs.get(key);
}

export const runtimeCode = () => readFileSync(join(ROOT, RUNTIME), 'utf8');
export { baseCss, manifest, vizIds };

/** The PostCSS plugins of a Vite config (the lecture decks' scoping), for the stylesheets. */
export const cssPluginsOf = (config) => (typeof config.css?.postcss === 'object' ? config.css.postcss.plugins ?? [] : []);

/**
 * The Vite plugin. The stylesheets go through the config's PostCSS plugins, as on the site, so that a
 * downloaded applet looks as it does there.
 */
export default function exportApplets() {
  let base = '/';
  let cssPlugins = [];
  return {
    name: 'export-applets',
    configResolved(config) {
      base = config.base;
      cssPlugins = cssPluginsOf(config);
    },

    configureServer(server) {
      const prefix = `${base}export/`;
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        if (!url.startsWith(prefix)) return next();
        const path = url.slice(prefix.length);
        const id = path.match(/^applets\/([\w-]+)\.json$/)?.[1];
        const lib = path.match(/^lib\/([\w.@-]+)\.js$/)?.[1];
        try {
          const [body, type] =
            id && existsSync(join(ROOT, `src/viz/${id}.jsx`)) ? [JSON.stringify(manifest(id)), 'application/json']
            : lib ? [await libCode(lib), 'text/javascript']
            : path === 'base.css' ? [await baseCss(), 'text/css']
            : path === 'runtime.js' ? [runtimeCode(), 'text/javascript']
            : path.startsWith('files/') ? [await readFile(path.slice(6), cssPlugins), 'application/octet-stream']
            : [null];
          if (body == null) return next();
          res.setHeader('Content-Type', type);
          res.setHeader('Cache-Control', 'no-store');
          res.end(body);
        } catch (e) {
          server.config.logger.error(`[export-applets] ${url}: ${e.message}`);
          res.statusCode = 500;
          res.end(String(e.message));
        }
      });
    },

    // written here rather than emitted, so that the build does not list each of them
    async writeBundle({ dir }) {
      let bytes = 0;
      const write = (fileName, source) => {
        const abs = join(dir, 'export', fileName);
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, source);
        bytes += Buffer.byteLength(source);
      };
      const ids = vizIds();
      const files = new Set();
      const names = new Set(['sucrase']);
      for (const id of ids) {
        const m = manifest(id);
        write(`applets/${id}.json`, JSON.stringify(m));
        m.files.forEach((f) => files.add(f.path));
        m.libs.forEach((l) => names.add(l));
      }
      for (const path of files) write(`files/${path}`, await readFile(path, cssPlugins));
      for (const name of names) write(`lib/${name}.js`, await libCode(name));
      write('base.css', await baseCss());
      write('runtime.js', runtimeCode());
      this.info(`export/: the pieces of ${ids.length} downloaded applets, ${files.size} files, ${(bytes / 1048576).toFixed(1)} MB`);
    },
  };
}
