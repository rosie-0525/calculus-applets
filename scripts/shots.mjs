// Screenshot each applet on its own (?only=<id>) through headless Chrome, to check it, and report
// console errors. Needs Google Chrome, and the site running (npm run dev, or build + preview).
//
//   npm run shots -- [--base http://localhost:5173/calculus-applets/] [--only id,id] [--out dir]
//                    [--width 1400] [--page]
//
// --page takes whole pages instead, one per topic (<topic>.png), scrolled through so that every
// applet loads. --only then picks topics.
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
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method === 'Runtime.exceptionThrown') {
      errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').split('\n')[0]);
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
  const capture = async (file, box) => {
    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { ...box, scale: 1 },
    });
    writeFileSync(file, Buffer.from(data, 'base64'));
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 1000, deviceScaleFactor: 1, mobile: WIDTH < 600 });
  mkdirSync(OUT, { recursive: true });

  if (PAGE) {
    for (const [i, { id: page }] of SECTIONS.entries()) {
      if (ONLY && !ONLY.includes(page)) continue;
      errors.length = 0;
      await send('Page.navigate', { url: i === 0 ? BASE : `${BASE}${page}/` });
      await sleep(1500);
      await evaluate(`(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); }
        await new Promise((r) => setTimeout(r, 2500)); scrollTo(0, 0);
      })()`);
      const height = await evaluate('document.documentElement.scrollHeight');
      const name = `${page}.png`;
      await capture(join(OUT, name), { x: 0, y: 0, width: WIDTH, height });
      console.log(`${name} (${WIDTH} × ${height})${errors.length ? `  ERRORS: ${errors.join(' | ')}` : ''}`);
    }
  } else {
    for (const a of APPLETS.filter((x) => !ONLY || ONLY.includes(x.id))) {
      errors.length = 0;
      await send('Page.navigate', { url: `${BASE}?only=${a.id}` });
      let ready = false;
      for (let i = 0; i < 100 && !ready; i++) {
        await sleep(100);
        ready = await evaluate(`!!document.querySelector('.viz[data-ready]')`).catch(() => false);
      }
      await sleep(1500);
      const box = await evaluate(`(() => { const r = document.querySelector('.viz').getBoundingClientRect();
        return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
      const scale = await evaluate(`document.querySelector('.viz-scale')?.style.transform || ''`);
      await capture(join(OUT, `${a.id}.png`), box);
      console.log(
        `${a.id}: ${Math.round(box.width)} × ${Math.round(box.height)} ${scale}` +
          `${ready ? '' : '  NOT READY'}${errors.length ? `  ERRORS: ${errors.join(' | ')}` : ''}`,
      );
    }
  }
  console.log(`-> ${OUT}`);
} finally {
  ws?.close();
  chrome.kill();
}
