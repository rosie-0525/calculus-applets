import { useEffect, useMemo, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { usePhoto, photoUrl, PW, PH, floodLayers, paintDeleted, maskUrl } from '../components/photo.js';
import { PRINT } from '../components/print.js';

export const SCALE = 0.66; // the photo on screen: 66% of its pixels
export const VW = Math.round(PW * SCALE);
export const VH = Math.round(PH * SCALE);
export const TOL = 10; // the tolerance at first: a click on the sky selects the sky and nothing else
export const PRINT_CLICK = [60, 60]; // where the PDF clicks: in the sky
export const ANTS = 10; // the period of the marching ants, in pixels of the photo

/** The pixels a click at pixel k selects: the flood from k within the tolerance. */
export function select(photo, tol, k) {
  const { layer } = floodLayers(photo, tol, [k]);
  const mask = new Uint8Array(PW * PH);
  for (let j = 0; j < PW * PH; j += 1) mask[j] = layer[j] >= 0 ? 1 : 0;
  return mask;
}

/**
 * The outline of a selection (mask[k] = 1: selected), along the sides of its pixels, as an SVG
 * path in pixels of the photo: the horizontal runs, then the vertical ones.
 */
export function outline(mask) {
  const at = (x, y) => (x >= 0 && x < PW && y >= 0 && y < PH ? mask[y * PW + x] : 0);
  const parts = [];
  for (let y = 0; y <= PH; y += 1) {
    let start = -1;
    for (let x = 0; x <= PW; x += 1) {
      const side = x < PW && at(x, y - 1) !== at(x, y);
      if (side && start < 0) start = x;
      if (!side && start >= 0) {
        parts.push(`M${start} ${y}H${x}`);
        start = -1;
      }
    }
  }
  for (let x = 0; x <= PW; x += 1) {
    let start = -1;
    for (let y = 0; y <= PH; y += 1) {
      const side = y < PH && at(x - 1, y) !== at(x, y);
      if (side && start < 0) start = y;
      if (!side && start >= 0) {
        parts.push(`M${x} ${start}V${y}`);
        start = -1;
      }
    }
  }
  return parts.join('');
}

/**
 * The paint of the marching ants: diagonal black and white stripes that slide sideways, so that
 * along any outline they march. Defined once, outside every fragment: in the PDF, the slide is
 * copied once per page, and `url(#ps-ants)` finds the first copy, which must not be hidden.
 */
export function AntsPaint() {
  const h = ANTS / 2;
  return (
    <svg className="ps-defs" width="0" height="0" aria-hidden="true">
      <defs>
        <pattern id="ps-ants" patternUnits="userSpaceOnUse" width={ANTS} height={ANTS}>
          <rect width={ANTS} height={ANTS} fill="#fff" />
          <path d={`M0 0H${h}L0 ${h}Z M${ANTS} 0V${h}L${h} ${ANTS}H0Z`} fill="#000" />
          {!PRINT && (
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from="0 0"
              to={`${ANTS} 0`}
              dur="0.7s"
              repeatCount="indefinite"
            />
          )}
        </pattern>
      </defs>
    </svg>
  );
}

/** Marching ants along the outline `d`. */
export function Ants({ d }) {
  return (
    <svg className="ps-ants" viewBox={`0 0 ${PW} ${PH}`} width={VW} height={VH}>
      <path d={d} fill="none" stroke="url(#ps-ants)" strokeWidth={1.6 / SCALE} />
    </svg>
  );
}

/* the toolbar's icons, 20 × 20 */
export const ICONS = {
  move: <path d="M6 3v13l3.4-3.3 2.6 5.6 2-.9-2.6-5.5H16z" fill="currentColor" stroke="none" />,
  marquee: <rect x="3" y="4.5" width="14" height="11" strokeDasharray="2.2 1.8" />,
  lasso: (
    <>
      <ellipse cx="10.5" cy="8" rx="6.5" ry="4.5" />
      <path d="M6.5 11.5c-2 1.5-2 4 .5 5" />
    </>
  ),
  wand: (
    <>
      <path d="M3.5 16.5l8.5-8.5" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M15 2.5v4M13 4.5h4M17.5 8.5l1.5 1.5M10.5 2l1 1" strokeLinecap="round" />
    </>
  ),
  crop: <path d="M6 2v12h12M2 6h12v12" />,
  brush: <path d="M15.5 3l2 2-7 7.5-2-2zM8.5 10.5c-2.5 0-3.5 1.5-3.5 3.5 0 1-.8 2-2 2.5 3 1 7 .5 7.5-4z" />,
  eraser: <path d="M3 13l7-7 6 6-5 5H7zM6.5 9.5l6 6M7 17h10" />,
};

export function Icon({ name }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4">
      {ICONS[name]}
    </svg>
  );
}

export const WAND_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
    '<path d="M3 21L14 10" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M3 21L14 10" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M18 2v8M14 6h8" stroke="#fff" stroke-width="3.5"/>' +
    '<path d="M18 2v8M14 6h8" stroke="#000" stroke-width="1.5"/></svg>',
)}") 18 6, crosshair`;

/**
 * Remove the background, the motivation: a tiny Photoshop: click with the Magic Wand on the sky, and
 * the sky is selected, its outline in marching ants (shift-click adds to the selection); Delete (the
 * button, or the Delete or Backspace key) deletes it, leaving Photoshop's transparent checkerboard;
 * Undo (the button, or ⌘Z / Ctrl+Z) takes a step back. The Tolerance field sets how far a click
 * spreads: 10 selects the sky, 14 or more leaks into the tower. The implementation, explained, is
 * the slide "Remove the background" at the end of the lecture. Key press 1: "Detecting edges uses
 * partial derivatives", to the right of the title. The PDF shows the photo, the sky selected, and the sky deleted, one page
 * each, then that sentence. The photo's credit is in the status bar.
 */
export default function Slide01dPhotoshop() {
  const photo = usePhoto();
  const [tol, setTol] = useState(TOL);
  const [sel, setSel] = useState(null);
  const [deleted, setDeleted] = useState(() => new Uint8Array(PW * PH));
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const ants = useMemo(() => (sel ? outline(sel) : ''), [sel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photo) return;
    const ctx = canvas.getContext('2d');
    const out = ctx.createImageData(PW, PH);
    paintDeleted(photo, deleted, out.data);
    ctx.putImageData(out, 0, 0);
  }, [photo, deleted]);

  const remember = () => setHistory((h) => [...h, { sel, deleted }]);
  const click = (e) => {
    if (!photo || e.button !== 0) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - box.left) / box.width) * PW);
    const y = Math.floor(((e.clientY - box.top) / box.height) * PH);
    if (x < 0 || x >= PW || y < 0 || y >= PH) return;
    let mask = select(photo, tol, y * PW + x);
    if (e.shiftKey && sel) mask = mask.map((v, j) => v | sel[j]);
    remember();
    setSel(mask);
  };
  const del = () => {
    if (!sel) return;
    remember();
    setDeleted(deleted.map((v, j) => v | sel[j]));
  };
  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setSel(last.sel);
    setDeleted(last.deleted);
  };

  // the keys, while this slide is shown: Delete or Backspace, and ⌘Z / Ctrl+Z
  const keys = useRef(null);
  keys.current = { del, undo };
  useEffect(() => {
    if (PRINT) return undefined;
    const onKey = (e) => {
      if (!sectionRef.current?.classList.contains('present')) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        keys.current.del();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        keys.current.undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // the PDF: the photo; the sky selected; the sky deleted
  const still = useMemo(() => {
    if (!PRINT || !photo) return null;
    const mask = select(photo, TOL, PRINT_CLICK[1] * PW + PRINT_CLICK[0]);
    return { ants: outline(mask), deleted: maskUrl(photo, mask) };
  }, [photo]);

  return (
    <section ref={sectionRef} className="dense ps-slide">
      <AntsPaint />
      <div className="ps-head">
        <h2>Remove the background</h2>
        <Fragment index={PRINT ? 3 : 1} as="p" className="ps-says">
          Detecting edges uses <strong>partial derivatives</strong>.
        </Fragment>
      </div>

      <div className="ps-window" data-prevent-swipe>
        <div className="ps-options">
          <span className="ps-tool">
            <Icon name="wand" />
          </span>
          <label className="ps-field">
            Tolerance:
            <input
              type="number"
              min="1"
              max="99"
              value={tol}
              onChange={(e) => setTol(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </label>
          <label className="ps-field">
            <input type="checkbox" checked readOnly disabled /> Contiguous
          </label>
          <span className="ps-spacer" />
          <button type="button" className="ps-button" onClick={del} disabled={!sel}>
            Delete
          </button>
          <button type="button" className="ps-button" onClick={undo} disabled={!history.length}>
            Undo
          </button>
        </div>

        <div className="ps-body">
          <div className="ps-tools">
            {Object.keys(ICONS).map((name) => (
              <span key={name} className={name === 'wand' ? 'ps-icon on' : 'ps-icon'}>
                <Icon name={name} />
              </span>
            ))}
          </div>
          <div className="ps-doc">
            <div className="ps-tab">hoover.jpg @ {Math.round(SCALE * 100)}% (RGB/8)</div>
            <div className="ps-board">
              <div
                className="ps-canvas"
                style={{ width: VW, height: VH, cursor: PRINT ? undefined : WAND_CURSOR }}
                onPointerDown={PRINT ? undefined : click}
              >
                {PRINT ? (
                  <>
                    <img src={photoUrl} alt="Hoover Tower and the arcade of the Main Quad against a blue sky" width={VW} height={VH} />
                    {still && (
                      <>
                        <Fragment index={2} as="img" src={still.deleted} alt="The photo, its sky deleted" width={VW} height={VH} />
                        <Fragment index={1} as="div" className="ps-layer">
                          <Ants d={still.ants} />
                        </Fragment>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <canvas ref={canvasRef} width={PW} height={PH} aria-label="The photo of Hoover Tower" />
                    {ants && <Ants d={ants} />}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="ps-status">Photo: King of Hearts, Wikimedia Commons, CC BY-SA 3.0 (cropped)</div>
      </div>
    </section>
  );
}
