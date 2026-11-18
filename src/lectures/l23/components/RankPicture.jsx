import { useRef } from 'react';
import Space, { Arrow3, Seg3, Dot3, Patch3 } from './Space.jsx';
import CubeMap from './CubeMap.jsx';
import TexSvg from './TexSvg.jsx';
import Fragment from './Fragment.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { INK, TEAL, GREEN, PURPLE, mul, lerp, plus, times } from './ls22.js';

/**
 * Rank–nullity theorem's picture: T_A for A = [1 −1 0; 0 1 0; −1 0 0] (N(A) = span{e₃}; C(A) the plane
 * x + y + z = 0, spanned by Ae₁ = (1, 0, −1) and Ae₂ = (−1, 1, 0): seen face on at the deck's view,
 * the parallelogram on them wide), in Lecture 22's style (Image's pictures: the unit cube on e₁, e₂,
 * e₃, each point p at (1 − t)p + tAp; the image lit in teal; N(A) green, shrinking into 0, a dashed
 * copy staying), the one animation played three times, a layer more each time (the user's request):
 *  - key press `at.play1`: the cube alone, gray, plays T_A once (no colour, no arrows);
 *  - `at.axes`: back to the inputs (they fade in), the arrows e₁, e₂, e₃ (ink) and their labels;
 *  - `at.nul`: N(A), the e₃-axis, green, and its label;
 *  - `at.play2`: T_A again: N(A) shrinks into 0 (its dashed copy stays), e₃ with it, e₁, e₂ go to
 *    Ae₁, Ae₂ (the labels too);
 *  - `at.play3`: back to the inputs, the square on e₁, e₂ and their arrows purple (the rest, n − k = 2
 *    dimensions); T_A again: they land on the parallelogram on Ae₁, Ae₂, no collapse, and C(A) lights
 *    up.
 * Going back a key press shows that step's end. Print: a still per key press, the end of each.
 * (Before: two steps, A = A·P, the e₃ direction collapsing first, then the square tilting onto C(A).)
 */

export const A = [
  [1, -1, 0],
  [0, 1, 0],
  [-1, 0, 0],
];
const E = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const AE = E.map((e) => mul(A, e));
const LINE = '#7d8ea3'; // the cube, as in Lecture 22
const CUBE_FILL = '#b9c7dc';
const NUL = 1.3; // N(A)'s segment: ±NUL e₃
const quad = (a, b, l, h) => [[l, l], [h, l], [h, h], [l, h]].map(([i, j]) => plus(times(i, a), times(j, b)));
const PATCH = quad(AE[0], AE[1], -0.3, 1.3); // C(A) round the parallelogram
const SQUARE = quad(E[0], E[1], 0, 1); // the square on e₁, e₂
const C_LABEL = lerp(PATCH[1], PATCH[2], 0.62); // inside the patch, under the parallelogram
const clamp01 = (k) => Math.max(0, Math.min(1, k));

/** A label beside the tip of an arrow from the origin, pushed out along it by `gap` px. */
function TipLabel({ s, tip, tex, opacity, gap = 20, dx = 0, dy = 0 }) {
  const o = s.P([0, 0, 0]);
  const q = s.P(tip);
  const d = [q[0] - o[0], q[1] - o[1]];
  const len = Math.hypot(...d) || 1;
  return <TexSvg x={q[0] + (gap * d[0]) / len + dx} y={q[1] + (gap * d[1]) / len + dy} tex={tex} size={20} w={70} h={34} opacity={opacity} />;
}

const eTex = (j) => String.raw`\vv e_${j}`;
const aeTex = (j) => String.raw`A\vv e_${j}`;

/**
 * The picture at a moment: `t` (0 → 1) the play, `op` the moving parts' opacity (fading in when a
 * play starts again), `arrows` e₁, e₂, e₃, `nul` N(A), `rest` the purple, `glow` C(A).
 */
function Picture({ t, op = 1, arrows, nul, rest, glow, width, height, unit, center }) {
  const go = (p) => lerp(p, mul(A, p), t);
  const tips = E.map(go);
  const e3 = 1 - clamp01((t - 0.8) / 0.2); // e₃'s arrow, fading as it reaches 0
  const swapOut = 1 - clamp01(t / 0.25); // eⱼ gone before Aeⱼ comes: never on top of each other
  const swapIn = clamp01((t - 0.75) / 0.25);
  const ink12 = rest ? PURPLE : INK;
  return (
    <Space width={width} height={height} unit={unit} center={center} el={24} swing={10} axisLen={[2, 2.1, 1.45]} axisLabels={['', '', '']} title="The cube on e1, e2, e3 moving onto its image under T_A">
      {(s) => (
        <g>
          <Patch3 s={s} corners={PATCH} fill={TEAL} opacity={0.16 * glow} stroke={TEAL} strokeOpacity={0.7 * glow} strokeWidth={1.6} />
          {nul && <Seg3 s={s} from={[0, 0, -NUL]} to={[0, 0, NUL]} color={GREEN} width={1.8} strokeDasharray="5 5" opacity={0.7} />}
          <g opacity={op}>
            <CubeMap s={s} M={A} t={t} corner={1} color={LINE} fill={CUBE_FILL} opacity={0.3} />
            {rest && <Patch3 s={s} corners={SQUARE.map(go)} fill={PURPLE} opacity={0.35} stroke={PURPLE} strokeOpacity={0.9} strokeWidth={2} />}
            {nul && <Seg3 s={s} from={go([0, 0, -NUL])} to={go([0, 0, NUL])} color={GREEN} width={4} />}
            {arrows && (
              <>
                <Arrow3 s={s} to={tips[0]} color={ink12} width={3} head={11} />
                <Arrow3 s={s} to={tips[1]} color={ink12} width={3} head={11} />
                {e3 > 0 && t < 0.995 && <Arrow3 s={s} to={tips[2]} color={INK} width={3} head={11} opacity={e3} />}
              </>
            )}
          </g>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3} />

          {arrows && (
            <g opacity={op}>
              <TipLabel s={s} tip={tips[0]} tex={eTex(1)} opacity={swapOut} />
              <TipLabel s={s} tip={tips[0]} tex={aeTex(1)} opacity={swapIn} />
              <TipLabel s={s} tip={tips[1]} tex={eTex(2)} opacity={swapOut} />
              <TipLabel s={s} tip={tips[1]} tex={aeTex(2)} opacity={swapIn} />
              <TipLabel s={s} tip={E[2]} tex={eTex(3)} opacity={e3} dx={16} gap={4} />
            </g>
          )}
          {nul && <TexSvg x={s.P([0, 0, NUL])[0] + 10} y={s.P([0, 0, NUL])[1] + 4} tex={String.raw`\textcolor{${GREEN}}{N(A)}`} size={20} w={70} h={34} anchor="start" />}
          <TexSvg x={s.P(C_LABEL)[0] + 8} y={s.P(C_LABEL)[1] - 16} tex={String.raw`\textcolor{${TEAL}}{C(A)}`} size={20} w={70} h={34} anchor="start" opacity={glow} />
        </g>
      )}
    </Space>
  );
}

// a play: wait, then the inputs move onto their outputs (ms)
const PLAY = { ms: 2400, delay: 900 };
const FADE = { ms: 350, delay: 0 };

/** The picture, on key presses `at` = { play1, axes, nul, play2, play3 } (see above); `size`: the Space's. */
export default function RankPicture({ at, width = 460, height = 345, unit = 106, center = [0.39, 0.45] }) {
  const refs = { play1: useRef(null), axes: useRef(null), nul: useRef(null), play2: useRef(null), play3: useRef(null) };
  const on = {
    play1: useFragmentShown(refs.play1),
    axes: useFragmentShown(refs.axes),
    nul: useFragmentShown(refs.nul),
    play2: useFragmentShown(refs.play2),
    play3: useFragmentShown(refs.play3),
  };
  const t1 = useTween(on.play1, PLAY);
  const fadeAxes = useTween(on.axes, FADE);
  const t2 = useTween(on.play2, PLAY);
  const fade3 = useTween(on.play3, FADE);
  const t3 = useTween(on.play3, PLAY);
  const glow = useTween(on.play3, { ms: 600, delay: PLAY.delay + PLAY.ms });
  const size = { width, height, unit, center };
  const markers = Object.keys(refs).map((k) => <span key={k} ref={refs[k]} className="fragment fx-marker" data-fragment-index={at[k]} aria-hidden="true" />);

  if (PRINT) {
    // the end of each key press, stacked, each shown from its key press until the next one's
    const stills = [
      { at: at.play1, p: { t: 1 } },
      { at: at.axes, p: { t: 0, arrows: true } },
      { at: at.nul, p: { t: 0, arrows: true, nul: true } },
      { at: at.play2, p: { t: 1, arrows: true, nul: true } },
      { at: at.play3, p: { t: 1, arrows: true, nul: true, rest: true, glow: 1 } },
    ];
    return (
      <>
        {markers}
        <div className="l23-rp-stack">
          {stills.map(({ at: k, p }, i) => (
            <Fragment key={k} index={k}>
              {i < stills.length - 1 ? (
                <Fragment index={stills[i + 1].at} effect="fade-out">
                  <Picture glow={0} {...p} {...size} />
                </Fragment>
              ) : (
                <Picture glow={0} {...p} {...size} />
              )}
            </Fragment>
          ))}
        </div>
      </>
    );
  }

  // the latest key press shown decides the picture
  const p = on.play3
    ? { t: t3, op: fade3, arrows: true, nul: true, rest: true, glow }
    : on.play2
      ? { t: t2, arrows: true, nul: true }
      : on.nul
        ? { t: 0, arrows: true, nul: true }
        : on.axes
          ? { t: 0, op: fadeAxes, arrows: true }
          : { t: t1 };
  return (
    <>
      {markers}
      <Picture glow={0} {...p} {...size} />
    </>
  );
}
