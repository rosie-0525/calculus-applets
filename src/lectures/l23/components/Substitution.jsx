import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';

/** A row's height in the system, in em (the flying values travel whole rows). */
export const ROW = 1.9;

/**
 * One term c·v of an equation: its sign and coefficient, then the variable. Once the variable is
 * solved (key press `at`), on the next key press (`sub`) its value, in the deck's green (the user's
 * request, in place of red, then teal), flies along the column from the row where it was solved (`dy` rows away,
 * in em) and takes the variable's place, in parentheses only where it must be (after a coefficient, as
 * in 6(−1), or a negative value after a sign; the user's request: z = 1 without them). On the diagonal
 * (`diag`), the term is where its variable is solved: a yellow band comes behind it at `at` (we divide
 * by its coefficient).
 */
function Term({ c, v, lead, value, diag, at, sub, dy }) {
  const a = Math.abs(c);
  const bare = a === 1 && (!value.startsWith('-') || (lead && c > 0));
  const sign = lead ? (c < 0 ? '-' : '') : c < 0 ? '{}-' : '{}+';
  // a coefficient 1 is left out; then {} after the sign, or KaTeX drops the spaces round it ("6(−1)+(1)")
  const coef = sign + (a === 1 ? (lead ? '' : '{}') : String(a));
  return (
    <span className="l23-term">
      {diag && <Fragment as="span" index={at} className="l23-diag" />}
      {coef && <Tex tex={coef} />}
      <span className="l23-slot">
        {diag ? (
          <Tex tex={v} />
        ) : (
          <>
            <Fragment as="span" index={sub} effect="fade-out" className="l23-old">
              <Tex tex={v} />
            </Fragment>
            <Fragment as="span" index={sub} className="l23-new" style={{ '--dy': `${dy}em` }}>
              <Tex tex={bare ? value : r`\left(${value}\right)`} />
            </Fragment>
          </>
        )}
      </span>
    </span>
  );
}

/** The key presses a system of n equations takes: two per equation (solve, substitute), the last one solve only. */
export const keyPresses = (sys) => 2 * sys.vars.length - 1;

/**
 * A square triangular system, solved by back substitution two key presses per equation (the user's
 * request), from key press `start`, in the order `sys.order` (the rows: from the bottom up for an upper
 * triangular system, from the top down for a lower one). At each step's first key press the equation's
 * diagonal term gets its band and the solved value appears at the right of the row (z = 1, alone); at
 * its second, the value flies along its column into the other equations (none after the last step).
 *
 * `sys`: { vars: ['x', 'y', 'z'], A: coefficients (rows), b: right sides, sol: the values (TeX),
 * order: the rows in the order they are solved }. A vertical arrow on the left shows the direction.
 */
export default function Substitution({ sys, start }) {
  const n = sys.vars.length;
  const step = (i) => start + 2 * sys.order.indexOf(i); // its value solved; substituted at step(i) + 1
  const up = sys.order[0] > sys.order[n - 1];
  const cells = [];
  sys.A.forEach((row, i) => {
    const lead = row.findIndex((c) => c !== 0);
    row.forEach((c, j) => {
      cells.push(
        c === 0 ? (
          <span key={`${i}-${j}`} />
        ) : (
          <Term key={`${i}-${j}`} c={c} v={sys.vars[j]} lead={j === lead} value={sys.sol[j]} diag={i === j} at={step(j)} sub={step(j) + 1} dy={(j - i) * ROW} />
        ),
      );
    });
    cells.push(
      <span key={`${i}-eq`} className="l23-eq">
        <Tex tex="=" />
      </span>,
      <span key={`${i}-b`} className="l23-rhs">
        <Tex tex={String(sys.b[i])} />
      </span>,
      <Fragment key={`${i}-res`} as="span" index={step(i)} className="l23-res">
        <Tex tex={`${sys.vars[i]}=${sys.sol[i]}`} />
      </Fragment>,
    );
  });
  return (
    <div className="l23-subst">
      <span className={`l23-dir ${up ? 'up' : 'down'}`} aria-hidden="true" />
      <div className="l23-sys" style={{ gridTemplateColumns: `repeat(${n}, auto) auto auto auto`, gridAutoRows: `${ROW}em` }}>
        {cells}
      </div>
    </div>
  );
}
