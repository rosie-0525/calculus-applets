import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SECTIONS } from './src/applets.js';

/*
 * The lecture decks' stylesheets (src/lectures/l<N>/styles/deck.css) were written for a whole
 * window each, and they disagree with one another. This PostCSS plugin scopes each one to its
 * lecture, so that visualizations from different lectures can share the page:
 *   - every rule is prefixed with .lec-<N> (the page wraps each visualization in that class);
 *   - :root becomes .lec-<N>, and the html/body rules for a full-window deck are dropped;
 *   - @keyframes are renamed l<N>-<name>, and so are the animations that use them.
 */
function scopeLectureDecks() {
  return {
    postcssPlugin: 'scope-lecture-decks',
    Once(root) {
      const m = (root.source?.input?.file || '').match(/[\\/]src[\\/]lectures[\\/]l(\d+)[\\/]styles[\\/]deck\.css$/);
      if (!m) return;
      const scope = `.lec-${m[1]}`;
      const prefix = `l${m[1]}-`;

      const names = [];
      root.walkAtRules(/keyframes$/, (at) => {
        names.push(at.params.trim());
        at.params = prefix + at.params.trim();
      });

      root.walkRules((rule) => {
        if (/keyframes$/.test(rule.parent?.name || '')) return;
        const selectors = rule.selectors.flatMap((sel) => {
          const s = sel.trim();
          if (/^(html|body|#root)$/.test(s)) return [];
          if (s === ':root') return [scope];
          return [`${scope} ${s}`];
        });
        if (selectors.length) rule.selectors = selectors;
        else rule.remove();
      });

      if (names.length) {
        const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const re = new RegExp(`(?<![\\w-])(${escaped.join('|')})(?![\\w-])`, 'g');
        root.walkDecls(/^(-webkit-)?animation(-name)?$/, (d) => {
          d.value = d.value.replace(re, (n) => prefix + n);
        });
      }
    },
  };
}
scopeLectureDecks.postcss = true;

/*
 * Every topic is a page: the first one /calculus-applets/, the others /calculus-applets/<topic>/.
 * They are all the same page (src/main.jsx picks the topic from the address); the dev server
 * serves index.html for any of them, and the build gives index.html the first topic's title and
 * writes a copy with each other topic's title to <topic>/index.html, for GitHub Pages.
 */
function topicPages() {
  return {
    name: 'topic-pages',
    apply: 'build',
    writeBundle({ dir }, bundle) {
      const html = bundle['index.html'].source;
      const titled = (s) => html.replace(/<title>[^<]*<\/title>/, `<title>${s.title} – Applets</title>`);
      const [first, ...rest] = SECTIONS;
      writeFileSync(join(dir, 'index.html'), titled(first));
      for (const s of rest) {
        mkdirSync(join(dir, s.id), { recursive: true });
        writeFileSync(join(dir, s.id, 'index.html'), titled(s));
      }
    },
  };
}

/*
 * Google Analytics (the same property as rosie-0525.github.io), in the built pages only, so that
 * visits to the dev server are not counted. Every topic page gets it, since topicPages copies the
 * built index.html.
 */
function analytics(id) {
  return {
    name: 'analytics',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'script', attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${id}` }, injectTo: 'head' },
      {
        tag: 'script',
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`,
        injectTo: 'head',
      },
    ],
  };
}

export default defineConfig({
  plugins: [react(), topicPages(), analytics('G-39WKKSKNVW')],
  base: '/calculus-applets/',
  css: { postcss: { plugins: [scopeLectureDecks()] } },
  build: { chunkSizeWarningLimit: 1500 },
});
