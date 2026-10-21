import { useMemo, useRef } from 'react';
import Fragment from './Fragment.jsx';
import Space, { Dot3, Label3 } from './Space.jsx';
import Surface from './Surface.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';

const R = [-1.5, 1.5]; // the graphs over the square |x|, |y| ≤ 1.5
const Z = 0.2; // drawn at height Z · f (xy, flatter, at height 2Z · f)
const RED = '#8c1515';
const lin = (x, y) => 2 * x - 3 * y;

// the three examples of Linear and affine functions, in its order; `lift`: the constant term
export const GRAPHS = [
  {
    key: 'affine',
    tex: 'f(x,y)=2x-3y+5',
    f: lin,
    lift: 5,
    n: 6,
    z: Z,
    zRange: [-8, 13],
    label: '(0, 0, 5)',
    verdict: 'affine (not linear)',
    why: 'a plane, not through the origin',
  },
  { key: 'linear', tex: 'f(x,y)=2x-3y', f: lin, lift: 0, n: 6, z: Z, zRange: [-8, 13], label: '(0, 0, 0)', verdict: 'linear', why: 'a plane through the origin' },
  { key: 'neither', tex: 'f(x,y)=xy', f: (x, y) => x * y, lift: 0, n: 18, z: 2 * Z, zRange: [-2.6, 2.6], label: '(0, 0, 0)', verdict: 'neither', why: 'not a plane' },
];

/**
 * The graph of one of GRAPHS: on key press `index` it rises out of the floor (drawn at height
 * t · f, t from 0 to 1); then the affine one rises by its constant term 5, the plane z = 2x − 3y
 * lifted to z = 2x − 3y + 5, f(0, 0) climbing the z-axis. The axes are there before. In print
 * mode, the graph as it ends up.
 */
export default function RisingGraph({ g, index, width = 385, height = 390, unit = 74, center = [0.5, 0.63] }) {
  const marker = useRef(null);
  const on = useFragmentShown(marker);
  const riseT = useTween(on, { ms: 1600, delay: 300 });
  const liftT = useTween(on && g.lift !== 0, { ms: 1500, delay: 2200 });
  const [rise, lift] = PRINT ? [1, 1] : [riseT, g.lift ? liftT : 1];
  const f = useMemo(() => (x, y) => rise * g.f(x, y) + lift * g.lift, [g, rise, lift]);
  const top = [0, 0, g.z * lift * g.lift]; // (0, 0, f(0, 0))
  return (
    <>
      <span ref={marker} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <Space
        width={width}
        height={height}
        unit={unit}
        center={center}
        axisLen={[2.2, 2.2, 2.4]}
        swing={10}
        title={`The graph of ${g.tex}: ${g.why}`}
      >
        {(s) => (
          <Fragment as="g" index={index}>
            {/* a little see-through, so that the axes show behind the graph */}
            <g opacity="0.88">
              <Surface s={s} f={f} x={R} y={R} n={g.n} zScale={g.z} zRange={g.zRange} mesh="rgba(255, 255, 255, 0.6)" meshWidth={1} />
            </g>
            <Dot3 s={s} at={top} color={RED} r={6} stroke="#fff" strokeWidth={1.5} />
            <Label3
              s={s}
              at={top}
              dx={-12}
              dy={-10}
              color={RED}
              size={19}
              italic={false}
              textAnchor="end"
              opacity={lift}
              stroke="#fff"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {g.label}
            </Label3>
          </Fragment>
        )}
      </Space>
    </>
  );
}
