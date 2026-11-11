// Write applets as downloaded files, the ones the Download button makes, without the site:
//
//   npm run export -- <id> …       e.g. npm run export -- bike-wind sierra
//   npm run export -- --all        every applet
//     --out <dir>                  where to write <id>.html (default exported/)
//     --home <url>                 the site, for the links in the files
//                                  (default https://rosie-0525.github.io/calculus-applets/)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { APPLETS, SECTIONS } from '../src/applets.js';
import { exportHtml } from '../src/site/export-html.js';
import config from '../vite.config.js';
import { baseCss, cssPluginsOf, libCode, manifest, readFile, runtimeCode } from './export-applets.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args.splice(i, 2)[1];
};
const out = option('--out', 'exported');
const home = option('--home', 'https://rosie-0525.github.io/calculus-applets/');
const all = args.includes('--all');
const ids = all ? APPLETS.map((a) => a.id) : args;
if (!ids.length) {
  console.error('Which applets? npm run export -- <id> … or --all');
  process.exit(1);
}

const cssPlugins = cssPluginsOf(config);
const base = await baseCss();
const runtime = runtimeCode();
const favicon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
mkdirSync(out, { recursive: true });

let failed = 0;
for (const id of ids) {
  const applet = APPLETS.find((a) => a.id === id);
  if (!applet) {
    console.error(`${id}: no such applet`);
    failed++;
    continue;
  }
  try {
    const topic = SECTIONS.find((s) => s.applets.includes(applet));
    const { files, libs } = manifest(id);
    const html = exportHtml({
      applet,
      topic: { title: topic.title, href: `${home}${topic === SECTIONS[0] ? '' : `${topic.id}/`}#${id}` },
      home,
      files: await Promise.all(
        files.map(async (f) => {
          const body = await readFile(f.path, cssPlugins);
          return f.kind === 'binary' ? { ...f, base64: body.toString('base64') } : { ...f, text: String(body) };
        }),
      ),
      libs: await Promise.all([...libs, 'sucrase'].map(async (name) => ({ name, code: await libCode(name) }))),
      base,
      runtime,
      favicon,
    });
    writeFileSync(join(out, `${id}.html`), html);
    console.log(`${join(out, `${id}.html`)}  ${(html.length / 1024 / 1024).toFixed(1)} MB`);
  } catch (e) {
    console.error(`${id}: ${e.message}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
