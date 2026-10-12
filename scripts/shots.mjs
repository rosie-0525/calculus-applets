// Screenshot each applet on its own (?only=<id>) through headless Chrome, to check it, and report
// console errors. Needs Google Chrome, and the site running (npm run dev, or build + preview).
//
//   npm run shots -- [--base http://localhost:5173/calculus-applets/] [--only id,id] [--out dir]
//                    [--width 1400] [--page]
//
// --page takes whole pages instead, one per topic (<topic>.png). --only then picks topics.
//
// The window is made as tall as what is captured, so that the screenshot never reaches beyond it:
// with captureBeyondViewport, Chrome shrinks the window to 1 × 1 for a moment, the applets refit,
// and the screenshot could catch one half-way. Before each capture the script waits until the page
// settles: no requests in flight, the fonts loaded, and every applet's size and scale unchanged
// for SETTLE ms. It warns NOT SETTLED if that does not happen within TIMEOUT ms, and UNSTABLE if an
// applet still changed during the capture (after one retry).
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { APPLETS, SECTIONS } from '../src/applets.js';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const BASE = opt('--base', 'http://localhost:5173/calculus-applets/');
const OUT = opt('--out', join(tmpdir(), 'applet-shots'));
const ONLY = opt('--only')?.split(',');
const WIDTH = Number(opt('--width', 1400));
const PAGE = args.includes('--page');
const PORT = 9400 + Math.floor(Math.random() * 100);
const HEIGHT = 1000; // the window's height, at least
const SETTLE = 500;
const TIMEOUT = 15000;

// What must not change while the page settles and while it is captured: the fonts, the page's
// height, and for each applet whether it is ready, its scale and its size (the 3-D figures rock and
// the games run, but inside a box of a fixed size).
const SIGNATURE = `[document.fonts.status, document.documentElement.scrollHeight,
  ...[...document.querySelectorAll('.viz')].map((v) => { const s = v.querySelector('.viz-scale');
    return ('ready' in v.dataset ? 'r' : '-') + (s ? s.style.transform + s.offsetWidth + 'x' + s.offsetHeight + s.className : ''); })].join('|')`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'applet-shots-'))}`,
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let ws;
try {
  let info;
  for (let i = 0; i < 50 && !info; i++) {
    await sleep(200);
    info = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => null);
  }
  ws = new WebSocket(info.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  const inflight = new Set(); // the page's http(s) requests not finished yet
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method === 'Runtime.exceptionThrown') {
      errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').split('\n')[0]);
    } else if (m.method === 'Network.requestWillBeSent' && /^https?:/.test(m.params.request.url)) {
      inflight.add(m.params.requestId);
    } else if (m.method === 'Network.loadingFinished' || m.method === 'Network.loadingFailed') {
      inflight.delete(m.params.requestId);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
  const resize = (height) => send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height, deviceScaleFactor: 1, mobile: WIDTH < 600 });

  /** Navigates to `url`, forgetting the requests of the page before. */
  const go = async (url) => {
    inflight.clear();
    await send('Page.navigate', { url });
  };
  // the page at `url` is the one in the window (not the one before, while the navigation is on its way)
  const at = (url) => async () => (await evaluate('location.href').catch(() => null)) === url;

  /** Waits until no request is in flight and SIGNATURE (and `ready()`) has held for SETTLE ms; false on TIMEOUT. */
  const settle = async (ready = async () => true) => {
    const start = Date.now();
    let last = null;
    let since = Date.now();
    while (Date.now() - start < TIMEOUT) {
      const sig = (await evaluate(SIGNATURE).catch(() => null)) + (inflight.size ? ` ${inflight.size} requests` : '');
      if (sig !== last || !(await ready())) {
        last = sig;
        since = Date.now();
      } else if (!inflight.size && Date.now() - since >= SETTLE) return true;
      await sleep(100);
    }
    return false;
  };

  /**
   * Captures `box` (page coordinates, inside the window) to `file`, without reaching beyond the
   * window. If an applet changed or the window was resized during the capture, settles and tries
   * once more; returns false if it changed again.
   */
  const capture = async (file, box) => {
    for (let attempt = 0; attempt < 2; attempt++) {
      await evaluate(`window.__shotsResizes = 0;
        if (!window.__shotsCounting) { window.__shotsCounting = true; addEventListener('resize', () => window.__shotsResizes++); }`);
      const before = await evaluate(SIGNATURE);
      const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { ...box, scale: 1 } });
      const after = await evaluate(SIGNATURE);
      const resized = await evaluate('window.__shotsResizes');
      writeFileSync(file, Buffer.from(data, 'base64'));
      if (before === after && !resized) return true;
      await settle();
    }
    return false;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  mkdirSync(OUT, { recursive: true });

  if (PAGE) {
    for (const [i, { id: page }] of SECTIONS.entries()) {
      if (ONLY && !ONLY.includes(page)) continue;
      errors.length = 0;
      const url = i === 0 ? BASE : `${BASE}${page}/`;
      await resize(HEIGHT);
      await go(url);
      // make the window as tall as the page, which grows as the applets in it load (all of them,
      // once they are all in the window), until it stops growing
      let settled = false;
      let height = 0;
      for (let k = 0; k < 10; k++) {
        settled = await settle(at(url));
        const h = await evaluate('document.documentElement.scrollHeight');
        if (h === height) break;
        height = h;
        await resize(Math.max(HEIGHT, height));
      }
      const name = `${page}.png`;
      const stable = await capture(join(OUT, name), { x: 0, y: 0, width: WIDTH, height });
      console.log(
        `${name} (${WIDTH} × ${height})${settled ? '' : '  NOT SETTLED'}${stable ? '' : '  UNSTABLE'}` +
          `${errors.length ? `  ERRORS: ${errors.join(' | ')}` : ''}`,
      );
    }
  } else {
    for (const a of APPLETS.filter((x) => !ONLY || ONLY.includes(x.id))) {
      errors.length = 0;
      const url = `${BASE}?only=${a.id}`;
      await resize(HEIGHT);
      await go(url);
      const here = at(url);
      const ready = async () => (await here()) && !!(await evaluate(`!!document.querySelector('.viz[data-ready]')`).catch(() => false));
      let settled = await settle(ready);
      const where = `(() => { const r = document.querySelector('.viz').getBoundingClientRect();
        return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`;
      let box = await evaluate(where);
      // the whole applet in the window
      if (box.y + box.height > HEIGHT) {
        await resize(Math.ceil(box.y + box.height) + 40);
        settled = (await settle(ready)) && settled;
        box = await evaluate(where);
      }
      const stable = await capture(join(OUT, `${a.id}.png`), box);
      const scale = await evaluate(`document.querySelector('.viz-scale')?.style.transform || ''`);
      console.log(
        `${a.id}: ${Math.round(box.width)} × ${Math.round(box.height)} ${scale}` +
          `${(await ready()) ? '' : '  NOT READY'}${settled ? '' : '  NOT SETTLED'}${stable ? '' : '  UNSTABLE'}` +
          `${errors.length ? `  ERRORS: ${errors.join(' | ')}` : ''}`,
      );
    }
  }
  console.log(`-> ${OUT}`);
} finally {
  ws?.close();
  chrome.kill();
}
