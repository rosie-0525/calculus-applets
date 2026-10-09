import { useEffect, useMemo, useRef, useState } from 'react';
import '../lectures/l8/styles/deck.css';
import { usePhoto, PW, PH, paintDeleted } from '../lectures/l8/components/photo.js';
import { AntsPaint, Ants, Icon, ICONS, select, outline, WAND_CURSOR, SCALE, VW, VH, TOL } from '../lectures/l8/slides/Slide01dPhotoshop.jsx';

export const lecture = 8;

/*
 * The slide's tiny Photoshop, without the slide's title and its sentence: click with the Magic Wand
 * and the region within the Tolerance is selected, in marching ants (shift-click adds to the
 * selection); Delete (the button, or the Delete or Backspace key while the applet is on screen)
 * deletes it, Undo (the button, or ⌘Z / Ctrl+Z) takes a step back. The slide's component, less its
 * print mode.
 */
export default function MagicWand() {
  const photo = usePhoto();
  const [tol, setTol] = useState(TOL);
  const [sel, setSel] = useState(null);
  const [deleted, setDeleted] = useState(() => new Uint8Array(PW * PH));
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
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

  // the keys, while the applet is on screen: Delete or Backspace, and ⌘Z / Ctrl+Z
  const keys = useRef(null);
  keys.current = { del, undo };
  useEffect(() => {
    const onKey = (e) => {
      if (!rootRef.current?.closest('section')?.classList.contains('present')) return;
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

  return (
    <div ref={rootRef} className="ps-slide">
      <AntsPaint />
      <div className="ps-window">
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
              <div className="ps-canvas" style={{ width: VW, height: VH, cursor: WAND_CURSOR }} onPointerDown={click}>
                <canvas ref={canvasRef} width={PW} height={PH} aria-label="The photo of Hoover Tower" />
                {ants && <Ants d={ants} />}
              </div>
            </div>
          </div>
        </div>
        <div className="ps-status">Photo: King of Hearts, Wikimedia Commons, CC BY-SA 3.0 (cropped)</div>
      </div>
    </div>
  );
}
