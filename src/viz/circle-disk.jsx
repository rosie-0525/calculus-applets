import { useState } from 'react';
import '../lectures/l12/styles/deck.css';
import { DiskFigure } from '../lectures/l12/components/Disk.jsx';
import { Mark, Ring, ON_CIRCLE, S3, BLUE, RED } from '../lectures/l12/slides/Slide08bDisk.jsx';

export const lecture = 12;

const PARTS = [
  ['circle', 'Subject to x² + y² = 1'],
  ['disk', 'On D'],
];

/*
 * Example 2's picture, without its two parts (the caption asks them): the contour plot of
 * f(x, y) = x² + 2y² + x − 1 with the disk D and its circle. On the slide the answers come on key
 * presses; here the buttons pick the part: (i) the candidates on the circle (blue), the max 5/4 at
 * (1/2, ±√3/2) and the min −1 at (−1, 0) ringed; (ii) on D, the critical point inside (red) as
 * well, where the min −5/4 is, the max the same.
 */
export default function CircleDisk() {
  const [part, setPart] = useState('circle');
  return (
    <div className="viz-col">
      <div className="viz-toggle" role="group" aria-label="Which problem">
        {PARTS.map(([k, name]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={part === k} onClick={() => setPart(k)}>
            {name}
          </button>
        ))}
      </div>

      <DiskFigure>
        {(p) => (
          <g>
            {ON_CIRCLE.map((m) => (
              <Mark key={m.at.join()} p={p} color={BLUE} {...m} />
            ))}
            {[S3, -S3].map((y) => (
              <Ring key={y} p={p} at={[1 / 2, y]} name="max" dx={-22} dy={6} anchor="end" />
            ))}
            {part === 'circle' ? (
              <Ring p={p} at={[-1, 0]} name="min" dx={-20} dy={-16} anchor="end" />
            ) : (
              <g>
                <Mark p={p} at={[-1 / 2, 0]} color={RED} text="−5/4" dx={0} dy={36} anchor="middle" />
                <Ring p={p} at={[-1 / 2, 0]} name="min" dx={0} dy={-22} anchor="middle" />
              </g>
            )}
          </g>
        )}
      </DiskFigure>
    </div>
  );
}
