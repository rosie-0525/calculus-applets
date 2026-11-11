import { useState } from 'react';
import { exportHtml } from './export-html.js';

/*
 * Download an applet as one HTML file, which runs in a browser without an internet connection and
 * holds the applet's source, to play with and change. The file is put together here, from the
 * pieces the build makes under export/ (see scripts/export-applets.mjs), so that the site does not
 * carry a 2 MB file for each applet.
 */

const BASE = import.meta.env.BASE_URL;
const PIECES = `${BASE}export/`;

async function get(url, as = 'text') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return res[as]();
}

const base64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.slice(reader.result.indexOf(',') + 1));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** The HTML of applet `applet`, whose topic is `topic` ({ title, href }, href from the site's root). */
async function appletHtml(applet, topic) {
  const { files, libs } = await get(`${PIECES}applets/${applet.id}.json`, 'json');
  const [contents, code, base, runtime, favicon] = await Promise.all([
    Promise.all(
      files.map(async (f) =>
        f.kind === 'binary'
          ? { ...f, base64: await base64(await get(`${PIECES}files/${f.path}`, 'blob')) }
          : { ...f, text: await get(`${PIECES}files/${f.path}`) },
      ),
    ),
    Promise.all([...libs, 'sucrase'].map(async (name) => ({ name, code: await get(`${PIECES}lib/${name}.js`) }))),
    get(`${PIECES}base.css`),
    get(`${PIECES}runtime.js`),
    get(`${BASE}favicon.svg`).catch(() => null),
  ]);
  const home = new URL(BASE, window.location.href).href;
  return exportHtml({
    applet,
    topic: { title: topic.title, href: new URL(topic.href, window.location.href).href },
    home,
    files: contents,
    libs: code,
    base,
    runtime,
    favicon,
  });
}

function save(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function DownloadButton({ applet, topic }) {
  const [state, setState] = useState('ready'); // ready | busy | failed
  const download = async () => {
    setState('busy');
    try {
      save(await appletHtml(applet, topic), `${applet.id}.html`);
      setState('ready');
    } catch (e) {
      console.error(e);
      setState('failed');
    }
  };
  return (
    <p className="applet-tools">
      <button
        type="button"
        className="download"
        onClick={download}
        disabled={state === 'busy'}
        title="One HTML file that opens in a browser, even offline, with the applet’s source to change"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
        </svg>
        {state === 'busy' ? 'Preparing…' : state === 'failed' ? 'Download failed – try again' : 'Download'}
      </button>
    </p>
  );
}
