import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';

// Lecture 15's cartoon network (How much faster?), redrawn as f₃ ∘ f₂ ∘ f₁: ℝ¹⁰⁰⁰ → ℝ, a photo in,
// "97% cat" out. Its layers (x, number of nodes), the nodes 30 apart round y = MID.
const MID = 120;
const LAYERS = [
  [200, 5],
  [370, 5],
  [540, 5],
  [710, 1],
];
const NODES = LAYERS.map(([x, k]) => Array.from({ length: k }, (_, j) => [x, MID + (j - (k - 1) / 2) * 30]));
const R1000 = String.raw`\mathbb R^{1000}`;
const SPACES = [R1000, R1000, R1000, String.raw`\mathbb R`];
// the waves (deck.css's l15-nn-pulse, a 5 s cycle): forward, a layer every WAVE s; backward from BACK s on.
// The factors of the chain rule light up with the backward wave (deck.css, Training an AI model).
const WAVE = 0.4;
const BACK = 2.4;

/** An arrow along y = MID from x1 to x2, its head a polygon (no markers in fragments: print). */
function Arrow({ x1, x2 }) {
  return (
    <g className="l17-nn-arrow">
      <line x1={x1} y1={MID} x2={x2 - 9} y2={MID} />
      <polygon points={`${x2},${MID} ${x2 - 11},${MID - 5.5} ${x2 - 11},${MID + 5.5}`} />
    </g>
  );
}

/** The photo: a cat's face in a frame. */
function CatPhoto() {
  return (
    <g className="l17-nn-photo">
      <rect x={14} y={78} width={92} height={84} rx={8} className="l17-nn-frame" />
      <polygon points="36,114 41,86 57,104" className="l17-nn-fur" />
      <polygon points="84,114 79,86 63,104" className="l17-nn-fur" />
      <polygon points="41,108 43,95 51,104" className="l17-nn-ear" />
      <polygon points="79,108 77,95 69,104" className="l17-nn-ear" />
      <ellipse cx={60} cy={126} rx={28} ry={23} className="l17-nn-fur" />
      <ellipse cx={50} cy={121} rx={3.2} ry={4.6} className="l17-nn-eye" />
      <ellipse cx={70} cy={121} rx={3.2} ry={4.6} className="l17-nn-eye" />
      <polygon points="56.5,130 63.5,130 60,134" className="l17-nn-nose" />
      <path d="M60 134q-3.5 5-8 2.5M60 134q3.5 5 8 2.5M47 131l-19-3M47 135l-19 2M73 131l19-3M73 135l19 2" className="l17-nn-whisker" />
    </g>
  );
}

/**
 * The network as a cartoon (Lecture 15's): the prediction runs forward through its layers (gray),
 * from a photo to "97% cat"; on key press `labels`, the spaces ℝ¹⁰⁰⁰, …, ℝ under the layers and
 * f₁, f₂, f₃ over the steps between them; on key press `back`, the backpropagation runs back (light
 * blue) after each prediction. In print, the backpropagation at f₃ (Lecture 15's still).
 */
export default function NeuralNet({ labels, back }) {
  const edges = (g) =>
    NODES[g].flatMap(([x1, y1]) => NODES[g + 1].map(([x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`)).join('');
  const glow = (kind, delay, still) => ({
    className: `l15-nn-${kind}${still ? ' l15-nn-still' : ''}`,
    style: { animationDelay: `${delay}s` },
  });
  const steps = NODES.slice(0, -1).map((_, g) => g);
  const mid = (g) => (LAYERS[g][0] + LAYERS[g + 1][0]) / 2;
  return (
    <svg className="l15-nn l17-nn" viewBox="0 0 860 250" aria-label="A neural network: a photo in, f1, f2, f3, 97% cat out">
      <CatPhoto />
      <Arrow x1={114} x2={180} />
      <Arrow x1={722} x2={756} />
      <text x={764} y={MID + 6} className="l17-nn-out">
        97% cat
      </text>

      {steps.map((g) => (
        <g key={g}>
          <path d={edges(g)} className="l15-nn-edge" />
          <path d={edges(g)} {...glow('fwd', (g + 0.5) * WAVE)} />
        </g>
      ))}
      <Fragment as="g" index={back}>
        {steps.map((g) => (
          <path key={g} d={edges(g)} {...glow('back', BACK + (LAYERS.length - 2 - g + 0.5) * WAVE, g === 2)} />
        ))}
      </Fragment>
      {NODES.map((layer, i) =>
        layer.map(([x, y]) => (
          <g key={`${x},${y}`}>
            <circle cx={x} cy={y} r={10} className="l15-nn-node" />
            <circle cx={x} cy={y} r={10} {...glow('fwd', i * WAVE)} />
          </g>
        )),
      )}
      <Fragment as="g" index={back}>
        {NODES.map((layer, i) =>
          layer.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={10} {...glow('back', BACK + (LAYERS.length - 1 - i) * WAVE, i >= 2)} />),
        )}
      </Fragment>

      <text x={455} y={14} className="l15-nn-label l15-nn-label-fwd">
        prediction →
      </text>
      <Fragment as="g" index={labels}>
        {steps.map((g) => (
          <TexSvg key={g} x={mid(g)} y={40} tex={`f_${g + 1}`} size={27} w={60} h={36} />
        ))}
        {LAYERS.map(([x], i) => (
          <TexSvg key={x} x={x} y={208} tex={SPACES[i]} size={23} w={100} h={32} />
        ))}
      </Fragment>
      <Fragment as="g" index={back}>
        <text x={455} y={246} className="l15-nn-label l15-nn-label-back">
          ← backpropagation
        </text>
      </Fragment>
    </svg>
  );
}
