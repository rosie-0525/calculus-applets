import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { PRINT } from '../components/print.js';

export const RED = '#8c1515';
export const LEVELS = [1, 4, 9];
export const COLORS = ['#0a4352', '#0f6278', '#3f97ab']; // the levels c = 1, 4, 9 (the radii 1, 2, 3)
export const FILLS = ['#2f8ba1', '#79bccb', '#c4e3ea']; // inside g = 1, between 1 and 4, between 4 and 9
export const colorOf = (c) => COLORS[LEVELS.indexOf(c)] ?? COLORS[2];
export const bowl = (x, y) => x * x + y * y;
export const polar = (rr, t) => [rr * Math.cos(t), rr * Math.sin(t)];

/** A tag in the corner of a picture: the space it lives in. */
export function Where({ children }) {
  return <span className="l10-ls-where">{children}</span>;
}

/** The graph of x² + y² over a disk of radius a little over 3, with its level curves c = 1, 4, 9 on it. */
export function Bowl() {
  return (
    <Space width={330} height={205} unit={36} center={[0.5, 0.8]} axes={false} az={-40} el={32} swing={10} title="The graph of f(x, y) = x² + y², a bowl, with its level curves at heights 1, 4, 9">
      {(s) => (
        <Surface
          s={s}
          f={bowl}
          param={polar}
          x={[0, 3.15]}
          y={[0, 2 * Math.PI]}
          n={[12, 40]}
          zScale={0.17}
          color="#a9d6e0"
          mesh="rgba(15, 40, 50, 0.12)"
          curve={LEVELS}
          curveColor={colorOf}
          curveWidth={2.5}
        />
      )}
    </Space>
  );
}

/**
 * The level surfaces g = 1, 4, 9 of g(x, y, z) = x² + y² + z², the spheres of radius 1, 2, 3, nested
 * like the layers of an onion, with the octant facing the viewer cut away: the outer sphere, then
 * the three cut faces, each showing the three circles where it meets the spheres.
 */
export function Onion() {
  return (
    <Space width={330} height={205} unit={30} center={[0.5, 0.52]} axes={false} az={-40} el={24} swing={10} title="The level surfaces of g(x, y, z) = x² + y² + z²: nested spheres of radius 1, 2, 3, with the front octant cut away">
      {(s) => {
        const D = [s.depth([1, 0, 0]), s.depth([0, 1, 0]), s.depth([0, 0, 1])];
        const pts = (poly) => poly.map((q) => s.P(q).map((v) => v.toFixed(1)).join(',')).join(' ');
        const R = 3;
        const polys = [];
        // the outer sphere, without the octant x, y, z > 0, the parts facing the viewer
        const NT = 12;
        const NP = 36;
        const at = (th, ph) => [R * Math.cos(th) * Math.cos(ph), R * Math.cos(th) * Math.sin(ph), R * Math.sin(th)];
        for (let i = 0; i < NT; i += 1) {
          for (let j = 0; j < NP; j += 1) {
            const t0 = -Math.PI / 2 + (Math.PI * i) / NT;
            const t1 = -Math.PI / 2 + (Math.PI * (i + 1)) / NT;
            const p0 = (2 * Math.PI * j) / NP;
            const p1 = (2 * Math.PI * (j + 1)) / NP;
            if (t0 >= 0 && p1 <= Math.PI / 2 + 1e-9) continue; // the octant cut away
            const mid = at((t0 + t1) / 2, (p0 + p1) / 2);
            const facing = (mid[0] * D[0] + mid[1] * D[1] + mid[2] * D[2]) / R;
            if (facing <= 0) continue;
            const light = Math.max(0, (mid[0] * 0.3 - mid[1] * 0.35 + mid[2] * 0.85) / R);
            polys.push({
              depth: s.depth(mid),
              el: (
                <polygon
                  key={`s${i},${j}`}
                  points={pts([at(t0, p0), at(t0, p1), at(t1, p1), at(t1, p0)])}
                  fill={FILLS[2]}
                  fillOpacity={0.75 + 0.25 * light}
                  stroke="rgba(15, 60, 75, 0.18)"
                  strokeWidth="0.6"
                />
              ),
            });
          }
        }
        polys.sort((a, b) => a.depth - b.depth);
        // the three cut faces: quarter disks in the planes x = 0, y = 0, z = 0, in rings
        const faces = [
          (rr, t) => [0, rr * Math.cos(t), rr * Math.sin(t)],
          (rr, t) => [rr * Math.cos(t), 0, rr * Math.sin(t)],
          (rr, t) => [rr * Math.cos(t), rr * Math.sin(t), 0],
        ];
        const arc = (face, rr) => Array.from({ length: 25 }, (_, k) => face(rr, (Math.PI / 2) * (k / 24)));
        const label = (rr) => s.P([rr * Math.cos(1.1), 0, rr * Math.sin(1.1)]); // on the circles of the face y = 0
        return (
          <g>
            {polys.map((q) => q.el)}
            {faces.map((face, n) => (
              <g key={n}>
                {[3, 2, 1].map((rr, k) => (
                  <polygon key={rr} points={pts([[0, 0, 0], ...arc(face, rr)])} fill={FILLS[2 - k]} stroke="none" />
                ))}
                {[1, 2, 3].map((rr) => (
                  <polyline key={rr} points={pts(arc(face, rr))} fill="none" stroke={COLORS[rr - 1]} strokeWidth="2.2" />
                ))}
              </g>
            ))}
            {[1, 2, 3].map((rr) => (
              <text key={rr} x={label(rr)[0]} y={label(rr)[1] + 4} textAnchor="middle" fontSize="13" fill={COLORS[rr - 1]} className="map-label">
                {rr * rr}
              </text>
            ))}
          </g>
        );
      }}
    </Space>
  );
}

/**
 * The shadow of a four-dimensional cube (a tesseract) turning slowly, under a big question mark: the
 * graph of a function of three variables lives in ℝ⁴. A still in print and under
 * prefers-reduced-motion.
 */
export function FourD() {
  const ref = useRef(null);
  const [t, setT] = useState(0.7);
  useEffect(() => {
    if (PRINT || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let id;
    const start = performance.now();
    const tick = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) setT(0.7 + (now - start) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  const W = 330;
  const H = 205;
  const V = [];
  for (let k = 0; k < 16; k += 1) V.push([0, 1, 2, 3].map((b) => ((k >> b) & 1 ? 1 : -1)));
  const a = 0.45 * t; // turning in the xw-plane and the zw-plane
  const b = 0.3 * t;
  const P = V.map(([x, y, z, w]) => {
    [x, w] = [x * Math.cos(a) - w * Math.sin(a), x * Math.sin(a) + w * Math.cos(a)];
    [z, w] = [z * Math.cos(b) - w * Math.sin(b), z * Math.sin(b) + w * Math.cos(b)];
    const k4 = 2.6 / (3.2 - w); // into three dimensions, in perspective
    [x, y, z] = [x * k4, y * k4, z * k4];
    const c = Math.cos(0.5);
    const sn = Math.sin(0.5);
    [y, z] = [y * c - z * sn, y * sn + z * c]; // a view from a little above
    [x, z] = [x * Math.cos(0.4) - z * Math.sin(0.4), x * Math.sin(0.4) + z * Math.cos(0.4)];
    const k3 = 5 / (6 - z);
    return { X: W / 2 + 50 * x * k3, Y: H / 2 + 50 * y * k3, w };
  });
  const edges = [];
  for (let i = 0; i < 16; i += 1) for (let bit = 0; bit < 4; bit += 1) if (!(i & (1 << bit))) edges.push([i, i | (1 << bit)]);
  return (
    <svg ref={ref} className="figure-svg l10-ls-4d" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="A turning four-dimensional cube behind a big question mark: the graph of a function of three variables lives in four dimensions">
      {edges.map(([i, j]) => (
        <line
          key={`${i}-${j}`}
          x1={P[i].X}
          y1={P[i].Y}
          x2={P[j].X}
          y2={P[j].Y}
          stroke="#2f8ba1"
          strokeOpacity={0.35 + 0.12 * (P[i].w + P[j].w)}
          strokeWidth="1.6"
        />
      ))}
      {P.map((q, k) => (
        <circle key={k} cx={q.X} cy={q.Y} r="2.6" fill="#0f6278" />
      ))}
      <text x={W / 2} y={H / 2 + 46} textAnchor="middle" fontSize="140" fontWeight="700" fill={RED} fillOpacity="0.85" stroke="#fff" strokeWidth="5" paintOrder="stroke">
        ?
      </text>
    </svg>
  );
}

/**
 * Level surfaces (before Gradient and level surfaces): for f(x, y) = x² + y², the graph (a bowl) is
 * in ℝ³ and the contour plot (circles, the level curves) in ℝ²; for g(x, y, z) = x² + y² + z², the
 * graph would be in ℝ⁴ (a big question mark over a turning 4-D cube), but the "contour plot" is in
 * ℝ³: the level surfaces g = c, nested spheres (the octant in front cut away). Key press 1: the
 * contour plot of f; 2: g and its graph, ??; 3: its level surfaces.
 */
export default function Slide09cLevelSurfaces() {
  return (
    <section className="dense l10-ls">
      <h2>Level surfaces</h2>

      <div className="l10-ls-grid">
        <div />
        <p className="l10-ls-head">graph</p>
        <p className="l10-ls-head">contour plot</p>

        <div className="l10-ls-name">
          <Tex tex={r`f(x,y)=x^2+y^2`} />
        </div>
        <div className="l10-ls-cell">
          <div className="l10-ls-pic">
            <Where>
              in <Tex tex={r`\mathbb R^3`} />
            </Where>
            <Bowl />
          </div>
        </div>
        <Fragment index={1} className="l10-ls-cell">
          <div className="l10-ls-pic">
            <Where>
              in <Tex tex={r`\mathbb R^2`} />
            </Where>
            <ContourPlot
            f={bowl}
            x={[-3.4, 3.4]}
            y={[-3.4, 3.4]}
            size={190}
            levels={LEVELS}
            color={colorOf}
            width={2.5}
            labels={(c) => String(c)}
            labelSize={13}
            title="Contour plot of f(x, y) = x² + y²: the circles of radius 1, 2, 3, at levels 1, 4, 9"
            />
          </div>
          <p className="l10-ls-what">
            level curves <Tex tex={r`f(x,y)=c`} />
          </p>
        </Fragment>

        <Fragment index={2} className="l10-ls-name">
          <Tex tex={r`g(x,y,z)=x^2+y^2+z^2`} />
        </Fragment>
        <Fragment index={2} className="l10-ls-cell">
          <div className="l10-ls-pic">
            <Where>
              in <Tex tex={r`\mathbb R^4`} />
            </Where>
            <FourD />
          </div>
        </Fragment>
        <Fragment index={3} className="l10-ls-cell">
          <div className="l10-ls-pic">
            <Where>
              in <Tex tex={r`\mathbb R^3`} />
            </Where>
            <Onion />
          </div>
          <p className="l10-ls-what">
            <strong>level surfaces</strong> <Tex tex={r`g(x,y,z)=c`} />
          </p>
        </Fragment>
      </div>
    </section>
  );
}
