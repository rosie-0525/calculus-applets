import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import useOrbit from './useOrbit.js';
import { useShasta, slicePrint, footprint, layerAt, alongOutline, LEVELS, STEP, BASE, SW, SPIXEL_M, S_SUMMIT } from './shasta.js';
import { PRINT } from './bay.js';

const CARDINAL = '#b3261e';
export const PLASTIC = '#cfdde4';
const PLASTIC_EDGE = '#7f9aa8';
const GHOST = '#8eaab8';
const BED = '#2f353c';

const UNIT_KM = 5; // km of mountain to a unit of the scene
export const EXAGGERATION = 2; // heights × 2

/** The pixel (i, j) at height m (metres), in the scene: x east, y north, z up from the bed. */
const toWorld = (i, j, m) => [
  ((i - S_SUMMIT[0]) * SPIXEL_M) / 1000 / UNIT_KM,
  ((S_SUMMIT[1] - j) * SPIXEL_M) / 1000 / UNIT_KM,
  ((m - BASE) * EXAGGERATION) / 1000 / UNIT_KM,
];
const zOf = (m) => toWorld(0, 0, m)[2];

/** The nozzle of the printer, its tip at the origin. */
function makeNozzle() {
  const g = new THREE.Group();
  const tip = new THREE.ConeGeometry(0.034, 0.08, 28);
  tip.rotateX(-Math.PI / 2);
  tip.translate(0, 0, 0.04);
  g.add(new THREE.Mesh(tip, new THREE.MeshLambertMaterial({ color: '#c99a3c' })));
  const block = new THREE.BoxGeometry(0.11, 0.08, 0.06);
  block.translate(0, 0, 0.11);
  g.add(new THREE.Mesh(block, new THREE.MeshLambertMaterial({ color: '#b8bec5' })));
  const tube = new THREE.CylinderGeometry(0.014, 0.014, 0.2, 16);
  tube.rotateX(Math.PI / 2);
  tube.translate(0, 0, 0.24);
  g.add(new THREE.Mesh(tube, new THREE.MeshLambertMaterial({ color: '#7d848c' })));
  g.scale.setScalar(1.35);
  g.renderOrder = 2;
  return g;
}

/**
 * Mount Shasta printed layer by layer, drawn with three.js: `setPrint(k)` shows layers 0 to k
 * (k = −1: an empty bed) and, faintly, the mountain still to print above them; `setRed(on)` draws
 * the outline of layer k (the level set h = c) in red, `setNozzle([i, j] | null)` puts the
 * nozzle's tip there on top of layer k, `setView(az, el)`, then `render()`.
 */
export class PrintScene {
  constructor(canvas, E, { width, height, dist = 6.2, pixelRatio = 2, preserve = false }) {
    this.dist = dist;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: preserve });
    this.renderer.localClippingEnabled = true;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 100);
    this.camera.up.set(0, 0, 1);
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.9));
    const sun = new THREE.DirectionalLight('#ffffff', 2.4);
    sun.position.set(-1.2, -1.8, 4); // high, from the south-southwest: the tops lit, the walls darker
    this.scene.add(sun);

    const layers = slicePrint(E);
    this.layers = layers;

    // the bed: a dark plate around the footprint, with a faint grid every kilometre
    const [i0, j0, i1, j1] = footprint(layers);
    const [xa, yb] = toWorld(i0, j0, BASE);
    const [xb, ya] = toWorld(i1, j1, BASE);
    const half = Math.max(xb - xa, yb - ya) / 2 + 0.07;
    const mid = [(xa + xb) / 2, (ya + yb) / 2];
    this.centre = new THREE.Vector3(mid[0], mid[1] + 0.1, 0.06);
    const plate = new THREE.BoxGeometry(2 * half, 2 * half, 0.05);
    plate.translate(mid[0], mid[1], -0.025);
    this.bed = new THREE.Mesh(plate, new THREE.MeshLambertMaterial({ color: BED }));
    this.scene.add(this.bed);
    const grid = [];
    const g = 1 / UNIT_KM;
    for (let t = g * Math.ceil(-half / g); t <= half; t += g) {
      grid.push(mid[0] + t, mid[1] - half, 0.001, mid[0] + t, mid[1] + half, 0.001);
      grid.push(mid[0] - half, mid[1] + t, 0.001, mid[0] + half, mid[1] + t, 0.001);
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(grid, 3));
    this.grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: '#454c55' }));
    this.scene.add(this.grid);

    // the layers: the top of each (where it shows from above) and its wall
    this.material = new THREE.MeshLambertMaterial({ color: PLASTIC });
    this.tops = [];
    this.walls = [];
    layers.forEach((layer, k) => {
      const pos = new Float32Array(layer.top.length * 3);
      layer.top.forEach(([i, j], m) => {
        const [x, y] = toWorld(i, j, BASE);
        pos.set([x, y, 0], 3 * m);
      });
      const top = new THREE.BufferGeometry();
      top.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      top.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pos.length).map((_, m) => (m % 3 === 2 ? 1 : 0)), 3));
      const topMesh = new THREE.Mesh(top, this.material);
      this.tops.push(topMesh);
      this.scene.add(topMesh);

      // the wall: a quad on each segment [p, q] of h = c, from the bottom of the layer to its top;
      // the inside is on the left of p → q, so the outward normal is (q − p) turned clockwise
      const z0 = zOf(LEVELS[k] - STEP);
      const z1 = zOf(LEVELS[k]);
      const wp = new Float32Array(layer.wall.length * 18);
      const wn = new Float32Array(layer.wall.length * 18);
      layer.wall.forEach(([p, q], m) => {
        const [px, py] = toWorld(p[0], p[1], BASE);
        const [qx, qy] = toWorld(q[0], q[1], BASE);
        const l = Math.hypot(qx - px, qy - py) || 1;
        const n = [(qy - py) / l, -(qx - px) / l, 0];
        wp.set([px, py, z0, qx, qy, z0, qx, qy, z1, px, py, z0, qx, qy, z1, px, py, z1], 18 * m);
        for (let v = 0; v < 6; v += 1) wn.set(n, 18 * m + 3 * v);
      });
      const wall = new THREE.BufferGeometry();
      wall.setAttribute('position', new THREE.BufferAttribute(wp, 3));
      wall.setAttribute('normal', new THREE.BufferAttribute(wn, 3));
      const wallMesh = new THREE.Mesh(wall, this.material);
      this.walls.push(wallMesh);
      this.scene.add(wallMesh);
    });

    // the mountain still to print: the graph of h, faint, above the plane z = c of the top layer
    const ga = Math.max(0, Math.floor(i0) - 1);
    const gb = Math.max(0, Math.floor(j0) - 1);
    const nx = Math.min(SW - 1, Math.ceil(i1) + 1) - ga;
    const ny = Math.min(SW - 1, Math.ceil(j1) + 1) - gb;
    const gpos = new Float32Array((nx + 1) * (ny + 1) * 3);
    for (let b = 0; b <= ny; b += 1) {
      for (let a = 0; a <= nx; a += 1) gpos.set(toWorld(ga + a, gb + b, E[(gb + b) * SW + ga + a]), 3 * (b * (nx + 1) + a));
    }
    const gidx = [];
    for (let b = 0; b < ny; b += 1) {
      for (let a = 0; a < nx; a += 1) {
        const p = b * (nx + 1) + a;
        const q = p + nx + 1;
        gidx.push(p, q + 1, p + 1, p, q, q + 1);
      }
    }
    const ghost = new THREE.BufferGeometry();
    ghost.setAttribute('position', new THREE.BufferAttribute(gpos, 3));
    ghost.setIndex(gidx);
    ghost.computeVertexNormals();
    this.cut = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.ghost = new THREE.Mesh(
      ghost,
      new THREE.MeshLambertMaterial({ color: GHOST, transparent: true, opacity: 0.4, depthWrite: false, clippingPlanes: [this.cut] }),
    );
    this.ghost.renderOrder = 1;
    this.scene.add(this.ghost);

    // the outline of the top layer, h = c
    this.lineMat = new LineMaterial({ color: CARDINAL, linewidth: 2.6, worldUnits: false });
    this.lineMat.resolution.set(width, height);
    this.outline = new LineSegments2(new LineSegmentsGeometry(), this.lineMat);
    this.scene.add(this.outline);

    this.nozzle = makeNozzle();
    this.scene.add(this.nozzle);

    this.k = null;
    this.red = false;
    this.setPrint(-1);
  }

  setPrint(k) {
    if (k === this.k) return;
    this.k = k;
    const zTop = k >= 0 ? zOf(LEVELS[k]) : 0;
    this.tops.forEach((m, n) => {
      m.visible = k >= 0;
      m.position.z = n < k ? zOf(LEVELS[n]) : zTop; // the layers above k are not printed yet: k's top covers them
    });
    this.walls.forEach((m, n) => {
      m.visible = n <= k;
    });
    this.cut.constant = -zTop; // keep z ≥ zTop
    this.ghost.visible = k < LEVELS.length - 1;
    const pts = [];
    if (k >= 0) {
      const z = zTop + 0.002;
      this.layers[k].wall.forEach(([p, q]) => pts.push(...toWorld(p[0], p[1], BASE).slice(0, 2), z, ...toWorld(q[0], q[1], BASE).slice(0, 2), z));
    }
    const g = new LineSegmentsGeometry();
    if (pts.length) g.setPositions(pts);
    this.outline.geometry.dispose();
    this.outline.geometry = g;
    this.outline.visible = this.red && pts.length > 0;
  }

  setRed(on) {
    this.red = on;
    this.outline.visible = on && this.k >= 0;
  }

  setNozzle(at) {
    this.nozzle.visible = !!at && this.k >= 0;
    if (!this.nozzle.visible) return;
    const [x, y] = toWorld(at[0], at[1], BASE);
    this.nozzle.position.set(x, y, zOf(LEVELS[this.k]) + 0.004);
  }

  setView(az, el) {
    const a = THREE.MathUtils.degToRad(az);
    const e = THREE.MathUtils.degToRad(el);
    const d = this.dist;
    const t = this.centre;
    this.camera.position.set(t.x + d * Math.cos(e) * Math.sin(a), t.y - d * Math.cos(e) * Math.cos(a), t.z + d * Math.sin(e));
    this.camera.lookAt(t);
    this.camera.updateMatrixWorld();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    [...this.tops, ...this.walls, this.ghost].forEach((m) => m.geometry.dispose());
    this.ghost.material.dispose();
    this.material.dispose();
    this.bed.geometry.dispose();
    this.bed.material.dispose();
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.outline.geometry.dispose();
    this.lineMat.dispose();
    this.nozzle.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose();
    });
    this.renderer.dispose();
  }
}

const NOZZLE_PERIOD = 7; // seconds to go once around a layer
const isShowing = (el) => el?.closest('section')?.classList.contains('present');
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Where the nozzle is at the fraction s of its way around layer k (pixels), or null. */
const nozzleAt = (layers, k, s) => (k >= 0 ? alongOutline(layers[k], s) : null);

/** The scene, drawn once, as a PNG data URL (for the PDF): the print up to height c. */
export function printStill(E, { width, height, az, el, c, red = false, nozzle = 0.62 }) {
  const canvas = document.createElement('canvas');
  const s = new PrintScene(canvas, E, { width, height, preserve: true });
  const k = layerAt(c);
  s.setPrint(k);
  s.setRed(red);
  s.setNozzle(nozzle === null ? null : nozzleAt(s.layers, k, nozzle));
  s.setView(az, el);
  s.render();
  const url = canvas.toDataURL('image/png');
  s.renderer.forceContextLoss();
  s.dispose();
  return url;
}

/**
 * Mount Shasta, printed up to height c (m), in 3-D: it rocks slowly and turns when dragged.
 * `red` draws the outline of the top layer, the level set h = c; the nozzle goes around it
 * (no nozzle once the print is done, `done`).
 */
export default function ShastaPrint({ c, red = false, done = false, width = 560, height = 470, az = -24, el = 26 }) {
  const E = useShasta();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const view = useOrbit(canvasRef, { az, el, swing: 16, period: 16, elRange: [5, 85] });
  const viewRef = useRef(view);
  viewRef.current = view;
  const k = layerAt(c);
  const state = useRef({ k, done });
  state.current = { k, done };

  useEffect(() => {
    if (!E) return undefined;
    let s;
    try {
      s = new PrintScene(canvasRef.current, E, { width, height });
    } catch (err) {
      console.error('3-D view unavailable:', err);
      return undefined;
    }
    sceneRef.current = s;
    // the nozzle goes around the top layer while the slide is showing
    let id;
    const start = performance.now();
    const tick = (now) => {
      if (isShowing(canvasRef.current)) {
        const { k: kNow, done: d } = state.current;
        const t = reducedMotion() ? 0.62 : (now - start) / 1000 / NOZZLE_PERIOD;
        s.setNozzle(d ? null : nozzleAt(s.layers, kNow, t));
        s.setView(viewRef.current.az, viewRef.current.el);
        s.render();
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      s.dispose();
      sceneRef.current = null;
    };
  }, [E, width, height]);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.setPrint(k);
    s.setRed(red);
  });

  return (
    <canvas
      ref={canvasRef}
      className="gl-view"
      style={{ width, height }}
      role="img"
      aria-label="Mount Shasta, 3-D printed layer by layer on the bed of a printer"
      data-prevent-swipe
      {...view.handlers}
    />
  );
}

/** The SVG path of a layer's outline (its closed curves), in pixels. */
const loopsPath = (layer) =>
  layer.loops.map(({ loop }) => `M${loop.map(([i, j]) => `${i.toFixed(1)} ${j.toFixed(1)}`).join('L')}Z`).join('');

/**
 * The print up to height c seen from above: each layer in the plastic's colour with its edge, the
 * edge of the top layer (the level set h = c) in red if `red`.
 */
export function PrintFromAbove({ c, red = true, size = 230 }) {
  const E = useShasta();
  const { paths, box } = useMemo(() => {
    if (!E) return { paths: [], box: [0, 0, 1, 1] };
    const layers = slicePrint(E);
    const [i0, j0, i1, j1] = footprint(layers);
    const half = Math.max(i1 - i0, j1 - j0) / 2 + 5;
    const mid = [(i0 + i1) / 2, (j0 + j1) / 2];
    return { paths: layers.map(loopsPath), box: [mid[0] - half, mid[1] - half, 2 * half, 2 * half] };
  }, [E]);
  const k = layerAt(c);
  return (
    <svg className="print-above" viewBox={box.join(' ')} width={size} height={size} role="img" aria-label="The print seen from above">
      <rect x={box[0]} y={box[1]} width={box[2]} height={box[3]} fill={BED} />
      {paths.slice(0, k + 1).map((d, n) => (
        <path key={n} d={d} fill={PLASTIC} fillRule="evenodd" stroke={PLASTIC_EDGE} strokeWidth="0.9" strokeLinejoin="round" />
      ))}
      {red && k >= 0 && <path d={paths[k]} fill="none" stroke={CARDINAL} strokeWidth="2.4" strokeLinejoin="round" />}
    </svg>
  );
}
