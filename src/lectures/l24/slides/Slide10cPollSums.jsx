import Fragment, { FxMarker } from '../components/Fragment.jsx';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { Scene } from '../components/SumScene.jsx';

export const PLAY = { ms: 2400, delay: 900 };
// the second play of an applet: T(v) and T(w) scale back to v and w, then v + w fades in, then T
// plays again
export const BACK = { ms: 1600, delay: 400 };
export const FADE = { ms: 500, delay: 2200 };
export const AGAIN = { ms: 2400, delay: 3000 };
export const UNIT = 86;

// an applet's two plays: T on v and w only once `first` is on; once `again` is on, back to v and w,
// v + w fading in, and T again
export function useTwice(first, again) {
  const t1 = useTween(first, PLAY);
  const back = useTween(again, BACK);
  const fade = useTween(again, FADE);
  const t2 = useTween(again, AGAIN);
  return again ? { t: fade > 0 ? t2 : 1 - back, sum: fade } : { t: t1, sum: false };
}

// the applet of the T that multiplies v by kv and w by kw, its first play on key press `at`, the
// second on the next. Print: the end of each play
export function Applet({ kv, kw, at, play }) {
  if (PRINT) {
    return (
      <Stills
        stills={[
          { node: <Scene kv={kv} kw={kw} t={1} arrows sum={false} unit={UNIT} /> },
          { at: at + 1, node: <Scene kv={kv} kw={kw} t={1} arrows unit={UNIT} /> },
        ]}
      />
    );
  }
  return <Scene kv={kv} kw={kw} t={play.t} arrows sum={play.sum} unit={UNIT} />;
}

/**
 * Poll (the user's request: Eigenspace's remark, a sum of eigenvectors with different eigenvalues is
 * not an eigenvector, turned into a poll; after Eigenspace): true or false, a sum
 * of two eigenvectors is an eigenvector, by show of hands. Key press 1: False is outlined; 2 to 5:
 * why, Eigenspace's two applets side by side (SumScene.jsx), each with its sentence under it (the
 * user's request: moved here from Eigenspace; the formulas for T over them dropped), each played
 * twice (the user's requests): first on v and w only, then T(v) and T(w) scale back to v and w (not
 * a jump back to the start), v + w fades in, and T plays again. 2 and 3: T = 2I, with the sentence, a
 * sum of eigenvectors with the same eigenvalue is an eigenvector: v and w double, then v + w doubles
 * along its line; 4 and 5: the T that keeps v and doubles w, with the sentence, with different
 * eigenvalues it is not: then v + w, now v + 2w, leaves its line. Print: the end of each play.
 */
export default function Slide10cPollSums() {
  const [markers, on] = useMarkers([2, 3, 4, 5]);
  const same = useTwice(on[0], on[1]);
  const different = useTwice(on[2], on[3]);
  return (
    <section>
      <h2>Poll</h2>
      {markers}

      <FxMarker index={1} id="poll-answer" />
      <div className="block poll fx-host">
        <p>
          <strong>True or false?</strong> Sum of two eigenvectors is an eigenvector.
        </p>
        <ul className="poll-options two">
          <li>
            <span className="opt">a)</span> True
          </li>
          <li className="correct">
            <span className="opt">b)</span> False
          </li>
        </ul>
      </div>

      <div className="l24-psum">
        <Fragment index={2} className="l24-psum-card">
          <Applet kv={2} kw={2} at={2} play={same} />
          <p className="l24-psum-remark">Sum of eigenvectors with the same eigenvalue is an eigenvector.</p>
        </Fragment>
        <Fragment index={4} className="l24-psum-card">
          <Applet kv={1} kw={2} at={4} play={different} />
          <p className="l24-psum-remark">Sum of eigenvectors with different eigenvalues is not an eigenvector.</p>
        </Fragment>
      </div>
    </section>
  );
}
