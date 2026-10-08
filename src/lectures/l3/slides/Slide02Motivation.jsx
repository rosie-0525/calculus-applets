import { useEffect, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GRAY = '#6b7280';
export const ENEMY = '#b45309';
export const SPARK = '#f59e0b';

/* ---------- A shooter game: can the bullet reach the enemy? ---------- */

// Side view, in the units of the svg. You stand on the left; the enemy hides
// behind a concrete block whose top slopes up from a low lip at the front (B)
// to the back edge (C). Extended, that top is the "roof plane"; seen edge-on
// it is the dashed line through B and C. The block is drawn with a little
// depth (DEPTH) so the roof reads as a flat slab, but the game itself happens
// in the front face, where a bullet flies along a line p + t v.
export const GW = 480;
export const GH = 270;
export const VIEW = [20, 92, 460, 162]; // the part of the scene that is shown
export const GROUND = 238;
export const B = [182, 230]; // front top corner of the block
export const C = [300, 190]; // back top corner
export const DEPTH = [18, -12];
export const ROOF = [C[0] - B[0], C[1] - B[1]];

// Which side of the roof plane a point is on: positive on your side (above
// it), negative on the enemy's side (below it), 0 on the plane itself.
export const side = ([x, y]) => ROOF[1] * (x - B[0]) - ROOF[0] * (y - B[1]);
export const roofY = (x) => B[1] + (ROOF[1] / ROOF[0]) * (x - B[0]);

export const SHOULDER = [60, 181]; // the gun turns about this point
export const BARREL = 36; // from the shoulder to the muzzle
export const AIM = [-0.95, 0.5]; // allowed angles, in radians (negative is up)
export const SPEED = 720; // of a bullet, in svg units per second
export const ENEMY_X = 318;
export const IDLE_AFTER = 2.5; // seconds after the mouse leaves, the game plays itself

export const clampAim = (a) => Math.max(AIM[0], Math.min(AIM[1], a));
export const muzzle = (a) => [SHOULDER[0] + BARREL * Math.cos(a), SHOULDER[1] + BARREL * Math.sin(a)];
export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const isShowing = (el) => el?.closest('section')?.classList.contains('present');
export const isPrint = () => /print-pdf/.test(window.location.search);

/** Mouse/touch position in the coordinates of the svg's viewBox. */
export function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}

/** A stick figure standing at x, facing ±1, crouched by the fraction c (0 = upright). */
export function pose(x, c, facing) {
  const head = [x, GROUND - 68 + 32 * c];
  const neck = [x, head[1] + 9];
  const hip = [x - facing * 3 * c, GROUND - 32 + 17 * c];
  const knee = [x + facing * (1 + 10 * c), (hip[1] + GROUND) / 2 - 2 * c];
  return { head, neck, hip, knee };
}

/** The first parameter t in [0, 1] where t ↦ p + t d hits something (in the plane of the picture). */
export function discHit(p, d, c, r) {
  const f = [p[0] - c[0], p[1] - c[1]];
  const a = d[0] * d[0] + d[1] * d[1];
  const b = 2 * (d[0] * f[0] + d[1] * f[1]);
  const k = f[0] * f[0] + f[1] * f[1] - r * r;
  if (k <= 0) return 0;
  const disc = b * b - 4 * a * k;
  return disc < 0 ? null : (-b - Math.sqrt(disc)) / (2 * a);
}

/**
 * What the segment from p to q runs into first: the roof, the low front wall
 * of the block, the ground or the enemy. Returns { t, kind, at } or null.
 */
export function firstHit(p, q, enemy) {
  const d = [q[0] - p[0], q[1] - p[1]];
  let best = null;
  const offer = (t, kind) => {
    if (t === null || t < 0 || t > 1 || (best && t >= best.t)) return;
    best = { t, kind, at: [p[0] + t * d[0], p[1] + t * d[1]] };
  };

  // The roof: the segment goes from your side of the roof plane to the other
  // side, and it crosses the plane on the roof itself (between B and C).
  const s0 = side(p);
  const s1 = side(q);
  if (s0 > 0 && s1 <= 0) {
    const t = s0 / (s0 - s1);
    const x = p[0] + t * d[0];
    if (x >= B[0] && x <= C[0]) offer(t, 'roof');
  }
  if (p[0] < B[0] && q[0] >= B[0]) {
    const t = (B[0] - p[0]) / d[0];
    const y = p[1] + t * d[1];
    if (y >= B[1] && y <= GROUND) offer(t, 'wall');
  }
  if (p[1] < GROUND && q[1] >= GROUND) offer((GROUND - p[1]) / d[1], 'ground');

  if (enemy.phase !== 'hit') {
    const { head, neck, hip } = pose(ENEMY_X, enemy.c, -1);
    offer(discHit(p, d, head, 9.5), 'enemy');
    const front = ENEMY_X - 6; // the front of the body
    if (p[0] < front && q[0] >= front) {
      const t = (front - p[0]) / d[0];
      const y = p[1] + t * d[1];
      if (y >= neck[1] && y <= hip[1]) offer(t, 'enemy');
    }
  }
  return best;
}

export const AIM_START = Math.atan2(pose(ENEMY_X, 1, -1).head[1] - SHOULDER[1], ENEMY_X - SHOULDER[0]);

export function newWorld() {
  return {
    t: 0,
    aim: AIM_START, // where the gun points now
    goal: AIM_START, // where the mouse wants it
    mode: 'idle', // 'idle' (plays itself) or 'user'
    inside: false,
    leftAt: -Infinity,
    holding: false,
    nextShot: 0.9,
    flash: -Infinity,
    roofFlash: -Infinity,
    bullets: [],
    fx: [],
    nextId: 0,
    enemy: { phase: 'down', c: 1, until: 1.5, hitAt: 0 },
  };
}

export function fire(w) {
  const [x, y] = muzzle(w.aim);
  w.bullets.push({ id: w.nextId++, x, y, vx: SPEED * Math.cos(w.aim), vy: SPEED * Math.sin(w.aim) });
  w.flash = w.t;
}

export function land(w, hit) {
  const id = w.nextId++;
  if (hit.kind === 'enemy') {
    const e = w.enemy;
    w.fx.push({ id, kind: 'hit', at: [ENEMY_X, pose(ENEMY_X, e.c, -1).head[1] - 16], t0: w.t });
    Object.assign(e, { phase: 'hit', hitAt: w.t, until: w.t + 1.1 });
  } else if (hit.kind === 'ground') {
    w.fx.push({ id, kind: 'puff', at: hit.at, t0: w.t });
  } else {
    w.fx.push({ id, kind: 'spark', at: hit.at, t0: w.t });
    w.roofFlash = w.t;
  }
}

/** Advances the game by dt seconds. */
export function step(w, dt) {
  w.t += dt;

  // The enemy peeks up over the block, ducks again, and gets up after a hit.
  const e = w.enemy;
  if (w.t >= e.until) {
    if (e.phase === 'down') Object.assign(e, { phase: 'up', until: w.t + 1.3 + 0.7 * Math.random() });
    else if (e.phase === 'up') Object.assign(e, { phase: 'down', until: w.t + 1.5 + 1.3 * Math.random() });
    else Object.assign(e, { phase: 'down', c: 1, until: w.t + 1.2 + Math.random() });
  }
  if (e.phase !== 'hit') {
    const goal = e.phase === 'up' ? 0 : 1;
    e.c += Math.max(-6 * dt, Math.min(6 * dt, goal - e.c));
  }

  // The gun follows the mouse; left alone, it tracks the enemy's head and fires now and then.
  if (w.mode === 'user' && !w.inside && w.t - w.leftAt > IDLE_AFTER) w.mode = 'idle';
  if (w.mode === 'user') {
    w.aim += (w.goal - w.aim) * (1 - Math.exp(-30 * dt));
    if (w.holding && w.t >= w.nextShot) {
      fire(w);
      w.nextShot = w.t + 0.3;
    }
  } else if (!reducedMotion()) {
    const [hx, hy] = pose(ENEMY_X, e.c, -1).head;
    const goal = clampAim(Math.atan2(hy - SHOULDER[1], hx - SHOULDER[0]) + 0.03 * Math.sin(1.7 * w.t));
    w.aim += (goal - w.aim) * (1 - Math.exp(-4 * dt));
    if (w.t >= w.nextShot) {
      fire(w);
      w.nextShot = w.t + 1.3;
    }
  }

  w.bullets = w.bullets.filter((b) => {
    const q = [b.x + b.vx * dt, b.y + b.vy * dt];
    const hit = firstHit([b.x, b.y], q, e);
    if (hit) {
      land(w, hit);
      return false;
    }
    [b.x, b.y] = q;
    return b.x < GW + 20 && b.x > -20 && b.y > -20;
  });
  w.fx = w.fx.filter((f) => w.t - f.t0 < 1);
}

export function Soldier({ x, c = 0, facing = 1, helmet, children }) {
  const { head, neck, hip, knee } = pose(x, c, facing);
  const [hx, hy] = head;
  return (
    <g stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <polyline points={`${hip} ${knee} ${x + facing * 7},${GROUND}`} />
      <polyline points={`${hip} ${knee[0] - facing * 5},${knee[1] + 2} ${x - facing * 5},${GROUND}`} />
      <line x1={neck[0]} y1={neck[1] - 2} x2={hip[0]} y2={hip[1]} strokeWidth="2.5" />
      {children}
      <circle cx={hx} cy={hy} r="7.5" fill="#fff" />
      <path
        d={`M ${hx - 9} ${hy - 1} A 9 9 0 0 1 ${hx + 9} ${hy - 1} Z`}
        fill={helmet}
        stroke={INK}
        strokeWidth="1.5"
      />
      <line x1={hx + facing * 5} y1={hy - 1} x2={hx + facing * 12} y2={hy - 1} stroke={helmet} strokeWidth="2.5" />
    </g>
  );
}

/** A rifle along the positive x-axis, stock at the origin, muzzle at (BARREL, 0). */
export function Rifle({ flash }) {
  return (
    <g stroke="none" fill={INK}>
      <path d="M -5 -1 L 4 -3 L 4 3 L -4 5 Z" />
      <rect x="3" y="-3" width="17" height="5.5" rx="1.5" />
      <rect x="9" y="2" width="3.6" height="6.5" rx="1" transform="rotate(12 10 2)" />
      <rect x="12" y="-5.5" width="6" height="2.5" rx="0.8" />
      <rect x="19" y="-1.6" width={BARREL - 19} height="3" />
      {flash && (
        <polygon
          points={`${BARREL},0 ${BARREL + 5},-5 ${BARREL + 7},-1 ${BARREL + 13},0 ${BARREL + 7},1 ${BARREL + 5},5`}
          fill="#fbbf24"
        />
      )}
    </g>
  );
}

export function Effect({ f, t }) {
  const a = t - f.t0;
  const [x, y] = f.at;
  if (f.kind === 'spark' && a < 0.9) {
    return (
      <g>
        {a < 0.3 &&
          [0, 1, 2, 3, 4, 5].map((k) => {
            const ang = ((k * 60 + 15) * Math.PI) / 180;
            const r1 = 2 + 20 * a;
            const r2 = 6 + 40 * a;
            return (
              <line
                key={k}
                x1={x + r1 * Math.cos(ang)}
                y1={y + r1 * Math.sin(ang)}
                x2={x + r2 * Math.cos(ang)}
                y2={y + r2 * Math.sin(ang)}
                stroke={SPARK}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={1 - a / 0.3}
              />
            );
          })}
        <text
          x={x}
          y={y - 14 - 18 * a}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={CARDINAL}
          opacity={1 - a / 0.9}
        >
          blocked
        </text>
      </g>
    );
  }
  if (f.kind === 'hit' && a < 0.9) {
    return (
      <text x={x} y={y - 22 * a} textAnchor="middle" fontSize="15" fontWeight="700" fill={TEAL} opacity={1 - a / 0.9}>
        hit!
      </text>
    );
  }
  if (f.kind === 'puff' && a < 0.4) {
    return <circle cx={x} cy={y} r={2 + 14 * a} fill="none" stroke={GRAY} strokeWidth="1.5" opacity={1 - a / 0.4} />;
  }
  return null;
}

// Where the roof plane meets the ground, and where it leaves the picture on the right
export const PL = [B[0] + ((GROUND - B[1]) * ROOF[0]) / ROOF[1], GROUND];
export const PR = [GW + 40, roofY(GW + 40)];
export const back = (p, k = 2.6) => [p[0] + k * DEPTH[0], p[1] + k * DEPTH[1]];
export const pts = (...ps) => ps.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
export const SLOPE_DEG = (Math.atan2(ROOF[1], ROOF[0]) * 180) / Math.PI;

export function CoverGame() {
  const svgRef = useRef(null);
  const world = useRef(null);
  if (!world.current) world.current = newWorld();
  const [, redraw] = useState(0);

  useEffect(() => {
    if (isPrint()) return undefined;
    let id;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const svg = svgRef.current;
      const card = svg?.closest('.fragment');
      if (isShowing(svg) && (!card || card.classList.contains('visible'))) {
        step(world.current, dt);
        redraw((n) => n + 1);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const w = world.current;
  const aimAt = (e) => {
    const [x, y] = svgPoint(svgRef.current, e);
    Object.assign(w, {
      goal: clampAim(Math.atan2(y - SHOULDER[1], Math.max(x - SHOULDER[0], 5))),
      mode: 'user',
      inside: true,
    });
  };
  const handlers = {
    onPointerEnter: aimAt,
    onPointerMove: aimAt,
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      aimAt(e);
      w.aim = w.goal;
      w.holding = true;
      fire(w);
      w.nextShot = w.t + 0.3;
    },
    onPointerUp: () => {
      w.holding = false;
    },
    onPointerLeave: () => {
      Object.assign(w, { inside: false, holding: false, leftAt: w.t });
    },
  };

  const e = w.enemy;
  const ep = pose(ENEMY_X, e.c, -1);
  const exposed = side(ep.head) > 0;
  const hitAge = e.phase === 'hit' ? w.t - e.hitAt : null;
  const m = muzzle(w.aim);
  const far = [m[0] + 900 * Math.cos(w.aim), m[1] + 900 * Math.sin(w.aim)];
  const sight = firstHit(m, far, e);
  const [sx, sy] = sight ? sight.at : far;
  const flashing = w.t - w.roofFlash < 0.35;

  return (
    <svg
      ref={svgRef}
      className="figure-svg cover-game"
      viewBox={VIEW.join(' ')}
      width="770"
      height={Math.round((770 * VIEW[3]) / VIEW[2])}
      role="img"
      aria-label="A shooter game in side view: you aim a gun at an enemy hiding behind a concrete block whose sloping top lies in the roof plane. Move the mouse to aim, click to fire."
      data-prevent-swipe
      {...handlers}
    >
      <rect x="0" y="0" width={GW} height={GH} fill="#f4f8fb" />

      {/* the roof plane: the block's top, extended (from the ground up) */}
      <g>
        <polygon points={pts(PL, PR, back(PR), back(PL))} fill={CARDINAL} opacity={flashing ? 0.16 : 0.07} />
        <line
          x1={PL[0]}
          y1={PL[1]}
          x2={PR[0]}
          y2={PR[1]}
          stroke={CARDINAL}
          strokeWidth={flashing ? 3.5 : 2}
          strokeDasharray="7 6"
          opacity={flashing ? 1 : 0.75}
        />
      </g>
      <text
        x="432"
        y={roofY(432) + 15}
        fontSize="12"
        fontWeight="700"
        fill={CARDINAL}
        textAnchor="middle"
        transform={`rotate(${SLOPE_DEG} 432 ${roofY(432) + 15})`}
      >
        roof plane
      </text>

      {/* the ground */}
      <rect x="0" y={GROUND} width={GW} height={GH - GROUND} fill="#e8efe3" />
      <line x1="0" y1={GROUND} x2={GW} y2={GROUND} stroke="#9ca3af" strokeWidth="1.5" />

      {/* the concrete block: its back wall, its sloping top, its front */}
      <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <polygon points={pts(C, [C[0], GROUND], back([C[0], GROUND], 1), back(C, 1))} fill="#cfd4da" />
        <polygon points={pts(B, C, back(C, 1), back(B, 1))} fill="#f1dcdc" />
        <polygon points={pts([B[0], GROUND], B, C, [C[0], GROUND])} fill="#e5e7eb" />
      </g>
      <g stroke="#b8bec7" strokeWidth="1">
        <line x1={B[0] + 30} y1={roofY(B[0] + 30) + 4} x2={B[0] + 30} y2={GROUND} />
        <line x1={B[0] + 70} y1={roofY(B[0] + 70) + 4} x2={B[0] + 70} y2={GROUND} />
      </g>

      {/* the enemy, behind the block */}
      <g
        transform={hitAge === null ? undefined : `rotate(${28 * Math.min(1, hitAge / 0.25)} ${ENEMY_X} ${GROUND})`}
        opacity={hitAge === null ? 1 : Math.max(0.3, 1 - hitAge)}
      >
        <Soldier x={ENEMY_X} c={e.c} facing={-1} helmet={ENEMY}>
          <line x1={ENEMY_X} y1={ep.neck[1] + 2} x2={ENEMY_X - 9} y2={ep.neck[1] + 9} />
          <line x1={ENEMY_X - 4} y1={ep.neck[1] + 8} x2={ENEMY_X - 22} y2={ep.neck[1] + 6} strokeWidth="3.5" />
        </Soldier>
      </g>

      {/* you */}
      <Soldier x={SHOULDER[0] - 2} helmet={TEAL}>
        <g transform={`translate(${SHOULDER[0]} ${SHOULDER[1]}) rotate(${(w.aim * 180) / Math.PI})`}>
          <line x1="0" y1="0" x2="11" y2="5" />
          <line x1="0" y1="0" x2="23" y2="3" />
          <Rifle flash={w.t - w.flash < 0.07} />
        </g>
      </Soldier>

      {/* the line of sight, up to the first thing in the way */}
      <line x1={m[0]} y1={m[1]} x2={sx} y2={sy} stroke={TEAL} strokeWidth="1.4" strokeDasharray="3 4" opacity="0.8" />
      {sight?.kind === 'roof' || sight?.kind === 'wall' ? (
        <path d={`M ${sx - 4} ${sy - 4} L ${sx + 4} ${sy + 4} M ${sx - 4} ${sy + 4} L ${sx + 4} ${sy - 4}`} stroke={CARDINAL} strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        sight?.kind === 'enemy' && <circle cx={sx} cy={sy} r="5" fill="none" stroke={TEAL} strokeWidth="2" />
      )}

      {w.bullets.map((b) => {
        const u = [b.vx / SPEED, b.vy / SPEED];
        return (
          <g key={b.id}>
            <line x1={b.x - 12 * u[0]} y1={b.y - 12 * u[1]} x2={b.x} y2={b.y} stroke={SPARK} strokeWidth="2" opacity="0.7" />
            <circle cx={b.x} cy={b.y} r="2.2" fill={INK} />
          </g>
        );
      })}
      {w.fx.map((f) => (
        <Effect key={f.id} f={f} t={w.t} />
      ))}

      <text x={SHOULDER[0] - 30} y={SHOULDER[1] - 30} fontSize="12" fontWeight="700" fill={TEAL}>
        you
      </text>
      <text
        x={GW - 12}
        y={VIEW[1] + 20}
        textAnchor="end"
        fontSize="12.5"
        fontWeight="700"
        fill={exposed ? TEAL : CARDINAL}
      >
        {exposed ? 'enemy on your side of the roof plane: exposed' : 'enemy on the other side of the roof plane: covered'}
      </text>
    </svg>
  );
}

export default function Slide02Motivation() {
  return (
    <section>
      <h2>Motivation</h2>

      <Fragment index={1}>
        <p>
          <strong>Lines</strong> and <strong>planes</strong> are the simplest shapes in space, and
          they are everywhere in applications.
        </p>
      </Fragment>

      <div className="motivation-cards">
        <Fragment index={2} className="motivation-card">
          <p className="card-title">
            <strong>Video games</strong>: can you hit the enemy?
          </p>
          <div className="card-fig">
            <CoverGame />
          </div>
        </Fragment>
      </div>

      <Notes time="1:30 · running total 2:00">
        <p>
          <em>[Key press]</em> Lines and planes are the simplest shapes there are, and they show up
          everywhere. An example.
        </p>
        <p>
          <em>[Key press]</em> A shooter game. You have a gun; the enemy hides behind a concrete
          block, and the top of the block is a flat slab: a piece of a <strong>plane</strong>, the
          roof plane. Every bullet flies along a straight <strong>line</strong>: it leaves the
          muzzle p in the direction v the gun points, and after t units it is at p + tv. That is
          exactly how we will describe lines today.
        </p>
        <p>
          <em>[move the mouse over the picture to aim, click to fire; left alone, it plays itself]</em>{' '}
          Can the bullet reach the enemy? When he ducks, he is on the <strong>other side</strong> of
          the roof plane from you, so the line of sight has to cross the plane, and here it crosses
          it on the roof: blocked. When he stands up, his head is on <strong>your side</strong> of
          the plane, and nothing is in the way. (Strictly, opposite sides only tells you that the
          line crosses the plane; the game then checks whether the crossing point is on the roof
          itself.) A game answers this thousands of times per frame, so we want a formula, not a
          picture.
        </p>
        <p>
          So today: how to describe a line, how to describe a plane, and how to tell which side of a
          plane you are on.
        </p>
      </Notes>
    </section>
  );
}
