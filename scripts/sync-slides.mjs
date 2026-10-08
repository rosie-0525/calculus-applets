// Copy the slides named in src/applets.js from the lecture decks into src/lectures/l<N>/, together
// with everything they import (components, data, assets) and the deck's stylesheet. Only files
// reachable from those slides are copied.
//
// In the slide files, every top-level function and constant is exported, so that the page can
// import a slide's figure (its `WindExplorer`, `SpanTwo`, …) without the words around it. A few
// strings that a figure shows are reworded for the page (RENAME).
//
// usage: npm run sync            (decks in ~/math/math51)
//        MATH51=/path/to/math51 npm run sync
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APPLETS } from '../src/applets.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MATH51 = process.env.MATH51 || join(homedir(), 'math', 'math51');

const deckDir = (n) => {
  const name = readdirSync(MATH51).find((d) => d.startsWith(`lecture ${n} - `));
  if (!name) throw new Error(`no "lecture ${n} - …" folder in ${MATH51}`);
  return join(MATH51, name);
};

// Relative specifiers in JS (import/export/dynamic import/new URL) and CSS (@import, url()).
const SPECIFIERS = [
  /(?:import|export)\s[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]/g,
  /import\s*['"](\.{1,2}\/[^'"]+)['"]/g,
  /import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
  /new URL\(\s*['"](\.{1,2}\/[^'"]+)['"]/g,
  /@import\s+(?:url\()?['"]?(\.{1,2}\/[^'")]+)/g,
  /url\(\s*['"]?(\.{1,2}\/[^'")]+)['"]?\s*\)/g,
];
const EXTENSIONS = ['', '.jsx', '.js', '/index.jsx', '/index.js'];

// [what a slide file says, what the page says instead]
const RENAME = [];

function resolveImport(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec.replace(/[?#].*$/, ''));
  for (const ext of EXTENSIONS) {
    const file = base + ext;
    if (existsSync(file) && !file.endsWith('/')) {
      try {
        readFileSync(file);
        return file;
      } catch {
        /* a directory */
      }
    }
  }
  throw new Error(`cannot resolve ${spec} from ${fromFile}`);
}

const byLecture = new Map();
for (const a of APPLETS) {
  const { lecture, slides } = a.from;
  if (!byLecture.has(lecture)) byLecture.set(lecture, new Set());
  slides.forEach((s) => byLecture.get(lecture).add(s));
}

for (const [n, slides] of [...byLecture].sort((x, y) => x[0] - y[0])) {
  const src = join(deckDir(n), 'src');
  const out = join(ROOT, 'src', 'lectures', `l${n}`);
  rmSync(out, { recursive: true, force: true });

  const seen = new Set();
  const queue = [join(src, 'styles', 'deck.css'), ...[...slides].map((s) => resolveImport(join(src, 'slides', 'x'), `./${s}`))];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.(jsx?|css)$/.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const re of SPECIFIERS) {
      for (const m of text.matchAll(re)) queue.push(resolveImport(file, m[1]));
    }
  }

  for (const file of seen) {
    const rel = relative(src, file);
    const to = join(out, rel);
    mkdirSync(dirname(to), { recursive: true });
    if (rel.startsWith('slides/') && /\.jsx?$/.test(rel)) {
      let text = readFileSync(file, 'utf8').replace(/^(?=(?:async )?function |const |let |class )/gm, 'export ');
      for (const [from, into] of RENAME) text = text.replaceAll(from, into);
      writeFileSync(to, text);
    } else {
      cpSync(file, to);
    }
  }
  writeFileSync(
    join(out, 'README.md'),
    'Copied from the lecture deck by `npm run sync`. Do not edit here: change the deck and sync again.\n' +
      '(Top-level names in slides/ are exported.)\n',
  );
  console.log(`lecture ${n}: ${seen.size} files (${[...slides].join(', ')})`);
}
