import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3, Patch3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';

export const RED = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';
export const MATH = 'KaTeX_Math, Georgia, serif';
export const SANS = 'Source Sans Pro, Helvetica, sans-serif';

export const polar = (rr, t) => [rr * Math.cos(t), rr * Math.sin(t)];
export const ring = (z, n = 96) => Array.from({ length: n + 1 }, (_, k) => [...polar(1, (2 * Math.PI * k) / n), z]);
export const SQ = [-1, 1];
export const VIEW = { width: 360, height: 290, unit: 92, center: [0.5, 0.55], axes: false, az: -50, el: 26, swing: 8 };

// the three functions: heights drawn at Z · f, each seen from its own side (the plane from the
// corner (−1, −1), so that it rises away; the saddle as on Saddle points, its four rim points apart)
export const EX = {
  plane: { f: (x, y) => x + y, Z: 0.28, floor: -0.75, view: { az: 135, el: 30 } },
  bowl: { f: (x, y) => x * x + y * y, Z: 0.55, floor: -0.35, view: { az: -50, el: 30 } },
  saddle: { f: (x, y) => x * x - y * y, Z: 0.8, floor: -1.1, view: { az: -40, el: 22 } },
};

/** A point (x, y, Z f(x, y)) of a graph with its label above it (`dy` moves it, `anchor` and `dx` aside). */
export function Mark({ s, ex, at: [x, y], color, label, dy = -16, dx = 0, anchor = 'middle' }) {
  const q = [x, y, ex.Z * ex.f(x, y)];
  const [px, py] = s.P(q);
  return (
    <g>
      <Dot3 s={s} at={q} color={color} r={6.5} stroke="#fff" strokeWidth="1.5" />
      {label && (
        <text x={px + dx} y={py + dy} textAnchor={anchor} fill={color} fontSize="17" fontWeight="700" fontFamily={SANS} className="map-label">
          {label}
        </text>
      )}
    </g>
  );
}

/** The region D shaded on the floor under a graph (a square or the unit disk), and its name. */
export function Floor({ s, z, disk = false, at }) {
  const corners = disk
    ? ring(z, 64).slice(0, -1)
    : [
        [SQ[0], SQ[0], z],
        [SQ[1], SQ[0], z],
        [SQ[1], SQ[1], z],
        [SQ[0], SQ[1], z],
      ];
  const [px, py] = s.P([...at, z]);
  return (
    <g>
      <Patch3 s={s} corners={corners} fill={TEAL} opacity={0.18} />
      <text x={px} y={py + 6} fill={TEAL} fontSize="20" fontStyle="italic" fontFamily={MATH}>
        D
      </text>
    </g>
  );
}

/** One example: f and D above, the graph over D (seen from `view`) with `children(s)` on it, and its critical points below. */
export function Example({ fn, region, crit, view, title, children }) {
  return (
    <div className="thm-ex">
      <p className="thm-ex-fn">
        <Tex tex={fn} />
      </p>
      <p className="thm-ex-d">
        on <Tex tex={region} />
      </p>
      <Space {...VIEW} {...view} title={title}>
        {children}
      </Space>
      <p className="thm-ex-d thm-ex-crit">{crit}</p>
    </div>
  );
}

/**
 * Critical point or boundary point (right after Interior and boundary points): three examples of
 * Theorem 10.4.6, each a function, its region D, its graph over D (D shaded on the floor) and its
 * critical points under it. On arrival, x + y on the square [−1, 1]²: no critical points, the local
 * extrema at two corners; key press 1: x² + y² on the unit disk: the critical point (0, 0) a local
 * minimum, every boundary point a local maximum (the rim in red); 2: x² − y² on the unit disk: the
 * critical point is a saddle point, not an extremum, and the local maxima (±1, 0) and minima
 * (0, ±1) are on the boundary.
 */
export default function Slide15bTheoremExamples() {
  const { plane, bowl, saddle } = EX;
  return (
    <section className="dense">
      <h2>Critical point or boundary point</h2>

      <div className="thm-exs">
        <Example
          fn={r`f(x,y)=x+y`}
          region={r`[-1,1]^2`}
          crit="No critical points"
          view={plane.view}
          title="The graph of x + y over the square: a tilted plane, lowest and highest at two opposite corners"
        >
          {(s) => (
            <g>
              <Floor s={s} z={plane.floor} at={[0.55, -0.95]} />
              <Surface s={s} f={plane.f} x={SQ} y={SQ} n={12} zScale={plane.Z} mesh="rgba(15, 40, 50, 0.16)" />
              <Mark s={s} ex={plane} at={[1, 1]} color={RED} label="local max" />
              <Mark s={s} ex={plane} at={[-1, -1]} color={TEAL} label="local min" anchor="start" dx={12} dy={6} />
            </g>
          )}
        </Example>

        <Fragment index={1}>
          <Example
            fn={r`f(x,y)=x^2+y^2`}
            region={r`x^2+y^2\le 1`}
            crit={
              <>
                Critical point: <Tex tex="(0,0)" />
              </>
            }
            view={bowl.view}
            title="The graph of x² + y² over the unit disk: a bowl, lowest at the center, highest all along the rim"
          >
            {(s) => (
              <g>
                <Floor s={s} z={bowl.floor} disk at={[0.35, -1.05]} />
                <Surface
                  s={s}
                  f={bowl.f}
                  x={[0, 1]}
                  y={[0, 2 * Math.PI]}
                  n={[12, 48]}
                  param={polar}
                  zScale={bowl.Z}
                  mesh="rgba(15, 40, 50, 0.16)"
                  lines={[{ pts: ring(bowl.Z), color: RED, width: 4 }]}
                />
                <Mark s={s} ex={bowl} at={[0, 0]} color={TEAL} label="local min" dy={28} />
                <Mark s={s} ex={bowl} at={polar(1, 2.1)} label="local max" color={RED} dy={5} dx={12} anchor="start" />
              </g>
            )}
          </Example>
        </Fragment>

        <Fragment index={2}>
          <Example
            fn={r`f(x,y)=x^2-y^2`}
            region={r`x^2+y^2\le 1`}
            crit={
              <>
                Critical point: <Tex tex="(0,0)" />
              </>
            }
            view={saddle.view}
            title="The graph of x² − y² over the unit disk: a saddle, highest at (±1, 0) and lowest at (0, ±1) on the rim"
          >
            {(s) => (
              <g>
                <Floor s={s} z={saddle.floor} disk at={[1.2, -0.25]} />
                <Surface s={s} f={saddle.f} x={[0, 1]} y={[0, 2 * Math.PI]} n={[12, 48]} param={polar} zScale={saddle.Z} mesh="rgba(15, 40, 50, 0.16)" />
                <Mark s={s} ex={saddle} at={[0, 0]} color={GRAY} label="saddle point" dy={28} />
                <Mark s={s} ex={saddle} at={[1, 0]} color={RED} label="local max" />
                <Mark s={s} ex={saddle} at={[-1, 0]} color={RED} />
                <Mark s={s} ex={saddle} at={[0, 1]} color={TEAL} label="local min" dy={28} />
                <Mark s={s} ex={saddle} at={[0, -1]} color={TEAL} />
              </g>
            )}
          </Example>
        </Fragment>
      </div>
    </section>
  );
}
