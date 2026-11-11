/** The site's mark, the picture in the favicon: a vector, and its projection onto a line. */
export function Mark() {
  return (
    <svg className="mark" viewBox="3 6 26 23" aria-hidden="true">
      <path d="M5 26 L27 26" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 9 L19 26" stroke="#9ca3af" strokeWidth="1.6" strokeDasharray="2.5 2" />
      <path d="M5 26 L19 9" stroke="#8c1515" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5 26 L19 26" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** The top of every page: the mark and the name, a link to the front page; `children` at the right. */
export default function Masthead({ home, children }) {
  return (
    <header className="masthead">
      <a className="wordmark" href={home}>
        <Mark />
        <span className="wordmark-name">Applets</span>
        <span className="wordmark-tagline">for linear algebra and multivariable calculus</span>
      </a>
      {children}
    </header>
  );
}
