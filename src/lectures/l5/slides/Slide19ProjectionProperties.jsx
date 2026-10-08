import Tex, { r } from '../components/Tex.jsx';
import Space, { Arrow3, Dot3, Label3, PlanePatch, PlaneGrid, RightAngle3, Sub, ProjText } from '../components/Space.jsx';
import { plus, times } from '../components/vec.js';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import { CARDINAL, TEAL, INK, O, U1, U2, V1, V2, UP, P, X } from './Slide18ProjectionTheorem.jsx';

/** Slide 18's scene, finished: x, v1, v2, Proj_V(x), and x − Proj_V(x) perpendicular to V. */
export function DifferenceFigure() {
  return (
    <Space
      width={440}
      height={330}
      unit={76}
      center={[0.42, 0.5]}
      axes={false}
      az={-36}
      el={24}
      swing={8}
      title="x above a plane V, its projection onto V, and the difference x minus the projection, perpendicular to V"
    >
      {(s) => (
        <g>
          <PlanePatch s={s} P={O} e={U1} e2={U2} range={[-0.9, 2.1]} range2={[-1, 2.9]} />
          <PlaneGrid s={s} P={O} e={U1} e2={U2} range={[-0.9, 2.1]} range2={[-1, 2.9]} color="#b6d5dc" width={0.7} />
          <Label3 s={s} at={plus(times(-0.9, U1), times(-1, U2))} dx={-26} dy={6} color={TEAL} size={20}>
            V
          </Label3>

          <Arrow3 s={s} to={P} color={TEAL} width={4} />
          <Label3 s={s} at={P} dx={-20} dy={28} color={TEAL} size={16}>
            <ProjText sub="V" />
          </Label3>

          <Arrow3 s={s} to={V1} color={CARDINAL} width={3} head={12} />
          <Arrow3 s={s} to={V2} color={CARDINAL} width={3} head={12} />
          <RightAngle3 s={s} corner={O} a={V1} b={V2} size={0.16} />
          <Label3 s={s} at={V1} dx={-28} dy={2} color={CARDINAL}>
            v<Sub>1</Sub>
          </Label3>
          <Label3 s={s} at={V2} dx={-10} dy={-10} color={CARDINAL}>
            v<Sub>2</Sub>
          </Label3>

          {/* the right angle lies in the plane of x and Proj_V(x), drawn over the arrowhead */}
          <Arrow3 s={s} from={P} to={X} color={CARDINAL} width={3} head={12} dashed />
          <RightAngle3 s={s} corner={P} a={UP} b={times(-1, P)} size={0.3} color={CARDINAL} />
          <Label3
            s={s}
            at={plus(P, times(1.25, UP))}
            dx={9}
            dy={6}
            color={CARDINAL}
            size={15}
            stroke="#fff"
            strokeWidth={4}
            paintOrder="stroke"
          >
            x − <ProjText sub="V" />
          </Label3>

          <Arrow3 s={s} to={X} color={INK} width={3.5} />
          <Dot3 s={s} at={O} color={INK} r={4} />
          <Label3 s={s} at={X} dx={8} dy={-4} color={INK}>
            x
          </Label3>
        </g>
      )}
    </Space>
  );
}

export default function Slide19ProjectionProperties() {
  return (
    <section className="dense">
      <h2>Projection onto a subspace</h2>

      <div className="stage">
        <div className="stage-text">
          <ul className="bullets">
            <li>
              <Tex tex={r`\vv{x}-\operatorname{Proj}_V(\vv{x})`} /> is orthogonal to every vector in{' '}
              <Tex tex="V" />.
            </li>
            <Fragment index={1} as="li">
              Distance from <Tex tex={r`\vv{x}`} /> to <Tex tex="V" /> ={' '}
              <Tex tex={r`\lVert\vv{x}-\operatorname{Proj}_V(\vv{x})\rVert`} />.
            </Fragment>
            <Fragment index={2} as="li">
              <FxMarker index={3} id="split-perp" />
              <FxMarker index={4} id="split-in" />
              <Tex
                className="split-formula"
                tex={r`\vv{x}={\htmlClass{fx-split-perp}{\underbrace{\textcolor{#8c1515}{\big(\vv{x}-\operatorname{Proj}_V(\vv{x})\big)}}_{\htmlClass{fx-split-perp-label}{\textcolor{#8c1515}{\text{perpendicular to }V}}}}}
                       +{\htmlClass{fx-split-in}{\underbrace{\textcolor{#0e7490}{\operatorname{Proj}_V(\vv{x})}}_{\htmlClass{fx-split-in-label}{\textcolor{#0e7490}{\text{in }V}}}}},`}
              />{' '}
              <Fragment index={5} as="span">
                and this is the only such split. <span className="pointer nowrap">→ Theorem 6.2.4</span>
              </Fragment>
            </Fragment>
          </ul>
        </div>

        <div className="stage-fig">
          <DifferenceFigure />
        </div>
      </div>

      <Notes time="1:30 · running total 34:30">
        <p>
          What is left over: the red segment, x − Proj_V(x). It is perpendicular to the whole plane: to
          v₁, to v₂, and so to every vector in V.
        </p>
        <p>
          <em>[Key press]</em> Its length is the distance from x to V: the red segment is the shortest
          way from x to the plane.
        </p>
        <p>
          <em>[Key press]</em> So x splits into two pieces: <em>[key press]</em> the red one,
          perpendicular to V, <em>[key press]</em> and the teal one, in V. In the picture they are tip
          to tail: teal from 0 to Proj_V(x), then red up to x. <em>[Key press]</em> And that split is
          unique: if x = v + w with v in V and w perpendicular to V, then v has to be Proj_V(x).
        </p>
      </Notes>
    </section>
  );
}
