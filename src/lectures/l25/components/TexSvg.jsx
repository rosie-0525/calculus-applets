import Tex from './Tex.jsx';

/**
 * KaTeX inside an SVG picture (a foreignObject), for labels the SVG fonts can't set, such as a
 * column vector. It is centred vertically on (x, y) (px of the SVG); `anchor` puts its middle
 * ('middle'), its left edge ('start') or its right edge ('end') at x. `size`: the font size (px).
 */
export default function TexSvg({ x, y, tex, size = 19, color, anchor = 'middle', w = 170, h = 90, opacity, className }) {
  const justify = anchor === 'start' ? 'flex-start' : anchor === 'end' ? 'flex-end' : 'center';
  const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return (
    <foreignObject x={left} y={y - h / 2} width={w} height={h} opacity={opacity} className={className} style={{ overflow: 'visible', pointerEvents: 'none' }}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="l14-texsvg"
        style={{ width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: justify, fontSize: size, color }}
      >
        <Tex tex={tex} />
      </div>
    </foreignObject>
  );
}
