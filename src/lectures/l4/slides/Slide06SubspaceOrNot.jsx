import Tex, { r } from '../components/Tex.jsx';
import Space, { Arrow3, Dot3, Label3, Patch3, PlanePatch, PlaneGrid, Seg3 } from '../components/Space.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GRID = '#8fc0cb';

export const MINI = {
  width: 250,
  height: 190,
  unit: 46,
  center: [0.5, 0.6],
  axisLen: 1.7,
  rock: false,
  drag: false,
  az: -38,
  el: 24,
};

/** A polyline through points of space. */
export function Curve3({ s, pts, color = TEAL, width = 1, ...rest }) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${s.P(p).map((v) => v.toFixed(1)).join(' ')}`).join(' ');
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" {...rest} />;
}

// Horizontal planes: seen from above, the plane lifted off 0 is drawn clear of 0, with a gap
export const E1 = [1, 0, 0];
export const E2 = [0, 1, 0];
export const AXIS = '#6b7280';
export const plus = (a, b) => a.map((c, i) => c + b[i]);
export const times = (k, a) => a.map((c) => k * c);

/** The plane through 0 spanned by E1, E2, and u, v in it; u + v appears at `at`. */
export function PlaneThrough0({ at }) {
  const u = plus(times(-1.2, E1), times(-0.3, E2));
  const v = plus(times(0.3, E1), times(1.2, E2));
  return (
    <Space {...MINI} title="A plane through the origin">
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, 0]} e={E1} e2={E2} range={[-1.4, 1.4]} />
          <PlaneGrid s={s} P={[0, 0, 0]} e={E1} e2={E2} range={[-1.4, 1.4]} color={GRID} width={0.6} />
          <Arrow3 s={s} to={u} color={INK} width={2.2} head={9} />
          <Arrow3 s={s} to={v} color={INK} width={2.2} head={9} />
          <Label3 s={s} at={u} dx={-4} dy={-6} color={INK} size={13}>
            u
          </Label3>
          <Label3 s={s} at={v} dx={2} dy={16} color={INK} size={13}>
            v
          </Label3>
          <Fragment as="g" index={at}>
            <Arrow3 s={s} to={plus(u, v)} color={TEAL} width={2.4} head={10} />
            <Label3 s={s} at={plus(u, v)} dx={6} dy={-2} color={TEAL} size={13}>
              u + v
            </Label3>
          </Fragment>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Space>
  );
}

/**
 * The same plane moved up: it misses 0. The z-axis runs up through it, and the
 * part above the plane is drawn again on top so it pokes out of it. The missed 0
 * is circled at `at`.
 */
export function PlaneNotThrough0({ at }) {
  const P = [0, 0, 1.25];
  const TOP = [0, 0, 2.1];
  return (
    <Space {...MINI} axisLen={[1.7, 1.7, TOP[2]]} title="A plane that does not pass through the origin">
      {(s) => (
        <g>
          <PlanePatch s={s} P={P} e={E1} e2={E2} range={[-1, 1]} />
          <PlaneGrid s={s} P={P} e={E1} e2={E2} range={[-1, 1]} color={GRID} width={0.6} />
          <Seg3 s={s} from={P} to={TOP} color={AXIS} width={1.5} />
          <Dot3 s={s} at={P} color={AXIS} r={2.5} />
          <Fragment as="g" index={at}>
            <Seg3 s={s} from={[0, 0, 0]} to={P} color={CARDINAL} width={1.6} dashed />
            <circle cx={s.P([0, 0, 0])[0]} cy={s.P([0, 0, 0])[1]} r="9" fill="none" stroke={CARDINAL} strokeWidth="2.2" />
            <Label3 s={s} at={[0, 0, 0]} dx={12} dy={20} color={CARDINAL} size={14} italic={false}>
              0
            </Label3>
          </Fragment>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Space>
  );
}

export const K = 0.45; // the paraboloid z = K (x² + y²)
export const onBowl = (x, y) => [x, y, K * (x * x + y * y)];

/** A paraboloid through 0, with v on it and, at `at`, 2v off it. */
export function Paraboloid({ at }) {
  const rings = [0.5, 1, 1.5].map((rad) =>
    Array.from({ length: 49 }, (_, i) => {
      const t = (2 * Math.PI * i) / 48;
      return onBowl(rad * Math.cos(t), rad * Math.sin(t));
    }),
  );
  const spokes = Array.from({ length: 8 }, (_, k) => {
    const t = (2 * Math.PI * k) / 8;
    return Array.from({ length: 16 }, (_, i) => onBowl(0.1 * i * Math.cos(t), 0.1 * i * Math.sin(t)));
  });
  const v = onBowl(0, 1);
  return (
    <Space {...MINI} title="A paraboloid through the origin; v is on it but 2 v is not">
      {(s) => (
        <g>
          {spokes.map((pts, k) => (
            <Curve3 key={`s${k}`} s={s} pts={pts} color={GRID} width={0.8} />
          ))}
          {rings.map((pts, k) => (
            <Curve3 key={`r${k}`} s={s} pts={pts} color={TEAL} width={1.2} opacity="0.8" />
          ))}
          <Fragment as="g" index={at}>
            <Arrow3 s={s} to={times(2, v)} color={CARDINAL} width={2.2} dashed head={10} />
            <Label3 s={s} at={times(2, v)} dx={4} dy={-8} color={CARDINAL} size={14}>
              2v
            </Label3>
          </Fragment>
          <Arrow3 s={s} to={v} color={INK} width={2.4} head={10} />
          <Label3 s={s} at={v} dx={-6} dy={18} color={INK} size={14}>
            v
          </Label3>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Space>
  );
}

/**
 * A plane folded along the y-axis: the floor x ≥ 0 and a wall rising over x ≤ 0.
 * v is on the floor; −v, under the wall, appears at `at`.
 */
export function BentPlane({ at }) {
  const WALL = [-0.55, 0, 1];
  const Y = 1.4;
  const v = [0.8, 1, 0];
  return (
    <Space {...MINI} title="A plane bent along a line through the origin; v is on it but −v is not">
      {(s) => (
        <g>
          <Patch3
            s={s}
            corners={[
              [0, -Y, 0],
              plus(times(1.3, WALL), [0, -Y, 0]),
              plus(times(1.3, WALL), [0, Y, 0]),
              [0, Y, 0],
            ]}
          />
          <Patch3
            s={s}
            corners={[
              [0, -Y, 0],
              [1.5, -Y, 0],
              [1.5, Y, 0],
              [0, Y, 0],
            ]}
          />
          <Seg3 s={s} from={[0, -Y, 0]} to={[0, Y, 0]} color={TEAL} width={2} />
          <Fragment as="g" index={at}>
            <Arrow3 s={s} to={times(-1, v)} color={CARDINAL} width={2.2} dashed head={10} />
            <Label3 s={s} at={times(-1, v)} dx={-4} dy={-8} color={CARDINAL} size={14}>
              −v
            </Label3>
          </Fragment>
          <Arrow3 s={s} to={v} color={INK} width={2.4} head={10} />
          <Label3 s={s} at={v} dx={-4} dy={20} color={INK} size={14}>
            v
          </Label3>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Space>
  );
}

export const PANELS = [
  { Fig: PlaneThrough0, name: 'plane through 0', ok: true, why: 'a span' },
  { Fig: PlaneNotThrough0, name: 'plane not through 0', ok: false, why: 'misses 0' },
  { Fig: Paraboloid, name: 'paraboloid through 0', ok: false, why: '2v is not on it' },
  { Fig: BentPlane, name: 'bent plane through 0', ok: false, why: '−v is not on it' },
];

export default function Slide06SubspaceOrNot() {
  return (
    <section className="dense">
      <h2>Subspace or not?</h2>

      <div className="block theorem">
        <p className="block-title">Remark</p>
        <ol className="parts compact">
          <li>
            A linear subspace always contains <Tex tex={r`\mathbf{0}`} />.
          </li>
          <li>
            <span className="book-ref">
              (<Tex tex={r`\to`} /> Proposition 4.1.11)
            </span>{' '}
            If a linear subspace contains some vectors{' '}
            <Tex tex={r`\vv{u}`} /> and <Tex tex={r`\vv{v}`} />, then it contains{' '}
            <Tex tex={r`\vv{u}+\vv{v}`} /> and <Tex tex={r`c\vv{u}`} /> for all scalars{' '}
            <Tex tex="c" />, and in particular any linear combination of those vectors.
          </li>
        </ol>
      </div>

      {/* one example per key press, and its verdict on the next */}
      <div className="subspace-panels">
        {PANELS.map(({ Fig, name, ok, why }, i) => (
          <Fragment key={name} as="figure" index={2 * i + 1} className="subspace-panel">
            <Fig at={2 * i + 2} />
            <figcaption>
              {name}
              <Fragment as="span" index={2 * i + 2} className={`verdict ${ok ? 'yes' : 'no'}`}>
                {ok ? '✓ subspace' : '✗ not a subspace'}: {why}
              </Fragment>
            </figcaption>
          </Fragment>
        ))}
      </div>

      <Notes time="2:30 · running total 13:30">
        <p>
          Two facts about every linear subspace. One: it contains 0, because 0 = 0v₁ + ⋯ + 0v_k.
          Two: it is closed under the vector operations. If u and v are in it, so are u + v and every
          multiple cu, and so every linear combination of them. The reason is the same computation
          as always: a combination of combinations of v₁, …, v_k is again a combination of v₁, …, v_k.
          This holds for any vectors in the subspace, whether or not they span the whole subspace.
        </p>
        <p>
          So here is a quick test: four surfaces in ℝ³, one at a time. For each, is it a linear
          subspace?
        </p>
        <p>
          <em>[Key press]</em> A plane through 0. <em>[let them think for a few seconds]</em>
        </p>
        <p>
          <em>[Key press]</em> Yes: it is the span of two vectors, and u + v stays in it.
        </p>
        <p>
          <em>[Key press]</em> The same plane shifted up. <em>[let them think]</em>
        </p>
        <p>
          <em>[Key press]</em> No. It does not contain 0. A line or plane that misses the origin is
          never a linear subspace.
        </p>
        <p>
          <em>[Key press]</em> A paraboloid, a bowl, through 0. <em>[let them think]</em>
        </p>
        <p>
          <em>[Key press]</em> It contains 0, but that is not enough. v is on the bowl, but 2v is
          not: the bowl curves up and the arrow goes straight. Not closed under scaling, so no.
        </p>
        <p>
          <em>[Key press]</em> A plane bent along a line through 0. <em>[let them think]</em>
        </p>
        <p>
          <em>[Key press]</em> v is on the floor, but −v goes under the wall. No. The moral: to show
          something is not a subspace, find one combination that escapes. Missing 0 is the quickest
          one to check.
        </p>
      </Notes>
    </section>
  );
}
