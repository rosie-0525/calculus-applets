import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import ContourPlot from '../lectures/l11/components/ContourPlot.jsx';
import { Where, Bowl, Onion, FourD, bowl, LEVELS, colorOf } from '../lectures/l11/slides/Slide09cLevelSurfaces.jsx';

export const lecture = 11;

/*
 * Level surfaces with every step showing, without its title: for f(x, y) = x² + y², the graph (a
 * bowl) in ℝ³ and the contour plot (circles) in ℝ²; for g(x, y, z) = x² + y² + z², the graph would
 * be in ℝ⁴ (a question mark over a turning 4-D cube, which turns while on screen), and the level
 * surfaces, nested spheres with the front octant cut away, are in ℝ³.
 */
export default function LevelSurfaces() {
  return (
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
      <div className="l10-ls-cell">
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
      </div>

      <div className="l10-ls-name">
        <Tex tex={r`g(x,y,z)=x^2+y^2+z^2`} />
      </div>
      <div className="l10-ls-cell">
        <div className="l10-ls-pic">
          <Where>
            in <Tex tex={r`\mathbb R^4`} />
          </Where>
          <FourD />
        </div>
      </div>
      <div className="l10-ls-cell">
        <div className="l10-ls-pic">
          <Where>
            in <Tex tex={r`\mathbb R^3`} />
          </Where>
          <Onion />
        </div>
        <p className="l10-ls-what">
          <strong>level surfaces</strong> <Tex tex={r`g(x,y,z)=c`} />
        </p>
      </div>
    </div>
  );
}
