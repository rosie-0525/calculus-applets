/** Math in SVG labels, in KaTeX's fonts: <text fontFamily={MAIN}>(<I>a</I>, <I>b</I>)</text>. */
export const MATH = 'KaTeX_Math, Georgia, serif';
export const MAIN = 'KaTeX_Main, Georgia, serif';

/** An italic letter (a variable). */
export function I({ children }) {
  return (
    <tspan fontFamily={MATH} fontStyle="italic">
      {children}
    </tspan>
  );
}

/** A subscript (the label fonts have no ₁₂₃). */
export function Sub({ children }) {
  return (
    <tspan baselineShift="sub" fontSize="0.7em">
      {children}
    </tspan>
  );
}

/** A bold letter (a vector). */
export function B({ children }) {
  return (
    <tspan fontFamily={MAIN} fontWeight="700">
      {children}
    </tspan>
  );
}
