# Applets

Interactive pictures for linear algebra and multivariable calculus, for
<https://rosie-0525.github.io/calculus-applets/>. Each concept (vectors, linear combinations, dot
products, lines and planes, span, bases, projections, least squares, linear functions and matrices,
linear transformations, matrix multiplication, matrix algebra, diagonal and triangular matrices,
Markov chains, equilibrium vectors, matrix inverses, linear independence, the Gram–Schmidt process,
matrix transpose, orthogonal matrices, symmetric matrices and quadratic forms, linear systems and
the column space, null space and the rank–nullity theorem, all solutions of a linear system;
scalar and vector-valued functions, graphs and contour plots, partial derivatives, critical points
and local extrema, global extrema on a region, gradients and linear approximation, gradients and
level sets, gradient descent, constrained optimization, Lagrange multipliers, the derivative matrix,
the multivariable chain rule, Newton’s method) has a page of its own: its applets, each with a title
and a question to think about, and at the bottom, under "Motivation – just for fun!", the
applications that students do not need to know (PageRank, denoising a chord, a 3-D game, a 3-D
printer, a robot arm, where a raindrop goes, an AI learning to read digits, why rainbows are arcs,
the price of electricity, photo filters, neural networks and video games, a night at the casino,
shuffling a deck of cards, training an AI model, which zero Newton’s method finds, a CT scan, the
forces in a bridge, …). Each topic is at `/calculus-applets/<topic>/`, and the
first, Vectors, is also the front page, `/calculus-applets/`.

The pictures are the figures from the lecture slides, run as they are: the page imports a slide's
figure component (its `WindExplorer`, `SpanTwo`, …) without the words around it, and renders it in
the lecture's own stylesheet.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/calculus-applets/
npm run build      # the site in dist/
npm run preview    # serve dist/
npm run export -- bike-wind   # exported/bike-wind.html, the file the Download button gives
```

`?only=<id>` shows one applet on its own, e.g. to project it in class:
`…/calculus-applets/?only=bike-wind`; an applet's title on its page links there. `…/projections/#bike-wind` links to it on its page.

Under each applet, **Download** saves it as one HTML file (`bike-wind.html`) that runs in a browser
without an internet connection, and holds the applet's source to change (see below).

## Layout

```
src/applets.js            the list: areas → topics → applets (id, title, caption, fun, source slides)
src/viz/<id>.jsx          one module per applet: the figure(s), plus any glue (state, sliders, layout)
src/main.jsx              the pages: the list of topics, and a topic (picked from the address)
src/site/Applet.jsx       loads a module when it scrolls near, renders and scales it
src/site/Masthead.jsx     the top of every page
src/site/site.css         the look of the site (the figures' colours, Source Sans and KaTeX)
src/site/caption.js       a caption's HTML, with its math typeset by KaTeX
src/site/Download.jsx     the Download button: gathers an applet's pieces and saves the file
src/site/export-html.js   the downloaded file, put together from the pieces
src/site/export-runtime.js  the script in it that runs the source
src/site/ExportPage.jsx   the page in it around the applet
src/lectures/l<N>/        files copied from the lecture decks by `npm run sync` (do not edit here)
scripts/sync-slides.mjs   copy the slides named in src/applets.js, and what they import
scripts/export-applets.mjs  the pieces of the downloaded files (a Vite plugin: export/ in the build)
scripts/export.mjs        write downloaded files without the site (npm run export)
scripts/shots.mjs         screenshot the applets with headless Chrome, and report console errors
```

### How a figure ends up on the page

- There is one HTML page, `index.html`; `src/main.jsx` shows the topic named in the address (the
  first topic for any other address). The dev server serves it for any address, and the build
  copies it to `dist/<topic>/index.html` for the other topics (`topicPages` in `vite.config.js`), so
  that GitHub Pages finds every topic.
- `npm run sync` copies each listed slide, everything it imports and the deck's `deck.css` into
  `src/lectures/l<N>/`. In the slide files every top-level function and constant is exported, so
  that a module can import just the figure. A few strings a figure shows are reworded on the way
  (`RENAME` in the script).
- The decks' stylesheets have drifted apart, so `vite.config.js` scopes each one to its lecture:
  every rule in `src/lectures/l<N>/styles/deck.css` gets the prefix `.lec-N`, and its keyframes are
  renamed. Rules for `html`, `body` and `#root` are dropped.
- `Applet.jsx` renders a module inside `.viz-scale.lec-N > .reveal > .slides > section`, the markup
  the deck styles expect. The section gets the class `present` while it is on screen (the 3-D
  pictures rock and the games run only then), and every build step ("fragment") is shown. The
  figure is scaled down to fit a narrow window; below 640px, figures that sit side by side are
  stacked (`.narrow` in `site.css`).

### How an applet becomes a file

The Download button puts together one HTML file of about 2 MB (8 MB for the digits, with their
data): the applet's own source files as they are in `src/` (each JSX file in a
`<script type="text/jsx" data-file="…">`, to read and edit), its photos and data in base64, the
stylesheets (the lecture's scoped as on the site, the fonts inlined), and the libraries, minified:
React, with KaTeX, three.js and qrcode.react where an applet uses them, and Sucrase, which compiles the
JSX when the page opens. A short script (`export-runtime.js`) then runs the files as modules, each
getting what it imports. The file needs nothing else, and opens from the disk (`file://`).

- The pieces are made by the Vite plugin in `scripts/export-applets.mjs`: the build writes them to
  `dist/export/` (about 17 MB, shared by all the applets: `applets/<id>.json` lists an applet's
  files and libraries), and the dev server makes them when they are asked for. What an applet is
  made of is found by following its imports, from `src/viz/<id>.jsx` and the page around it
  (`ExportPage.jsx`).
- The site would need 400 MB for all the files, so the button puts each together in the browser.
  `npm run export -- <id> …` (or `--all`, `--out <dir>`) makes the same file from the command line.
- A file starts with a comment that says how to change it: edit a block, save, reload. An error
  while the source loads (a typo: Sucrase gives the line and column in the block) or while the
  applet draws is shown on the page, with where in the source it happened.

## Add an applet

1. Add an entry to a topic in `src/applets.js`: `id`, `title`, `caption` (HTML: a question to think
   about, or what the picture cannot say by itself; optional. Its math is TeX between dollar signs,
   typeset by KaTeX with the decks' `\vv` and `\norm`, and `\$` is a dollar sign: write a caption with
   math as a raw string, ``r`… $\vv v_1$ …` ``, so that its backslashes stay. The build fails on TeX
   that KaTeX cannot typeset), `fun: true` if it belongs under
   "Motivation – just for fun!", and `from: { lecture, slides }`: the slide files (in that deck's
   `src/slides/`) the figure comes from. `slides` is empty for a figure drawn for the page with the
   deck's components. A new topic is a new entry in `sections`; the first one is the front page.
2. `npm run sync`. Run it again whenever a deck changes.
3. Write `src/viz/<id>.jsx`. It imports the lecture's `deck.css` and the figure, and exports:
   - `default`: the component to show;
   - `lecture`: the lecture number, for its stylesheet (required);
   - `zoom`: optional, a scale for a small figure (default 1);
   - `width`: optional, a fixed width in px.

   ```jsx
   import '../lectures/l5/styles/deck.css';
   import { WindExplorer } from '../lectures/l5/slides/Slide11Shadow.jsx';

   export const lecture = 5;

   export default WindExplorer;
   ```

4. Check it: with `npm run dev` running, `npm run shots -- --only <id> --out /tmp/shots` saves a
   screenshot of it and prints any console errors (Google Chrome must be installed). `--page` takes
   whole pages instead (the list of topics and every topic; `--only` picks them), and `--width 390`
   a phone. It waits for the page to settle before each screenshot, and flags `NOT SETTLED` or
   `UNSTABLE` (the applet changed during the screenshot) when it does not. To check the downloaded
   file too: `npm run export -- <id> --out /tmp/files`, then
   `npm run shots -- --files /tmp/files --only <id>`, which opens it from the disk and flags
   `ONLINE` if it asked the network for anything.

The decks are read from `$MATH51` (see the top of `scripts/sync-slides.mjs` for the default).

## Deploy

The site is built for the path `/calculus-applets/` (`base` in `vite.config.js`), so it belongs
in a repository named `calculus-applets` under `rosie-0525`:

1. Create the repository on GitHub and push this folder to its `main` branch.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.

`.github/workflows/deploy.yml` then builds and publishes the site on every push to `main`.
