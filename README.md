# Applets

Interactive pictures for linear algebra and multivariable calculus, for
<https://rosie-0525.github.io/calculus-applets/>. Each concept (vectors, linear combinations, dot
products, lines and planes, span, bases, projections, least squares; scalar and vector-valued
functions, graphs and contour plots, partial derivatives) has a page of its own: its applets, each with a title and a
question to think about, and at the bottom, under "Motivation – just for fun!", the applications
that students do not need to know (PageRank, denoising a chord, a 3-D game, a 3-D printer, a robot
arm, …). The first topic, Vectors, is the front page, `/calculus-applets/`; the others are at
`/calculus-applets/<topic>/`.

The pictures are the figures from the lecture slides, run as they are: the page imports a slide's
figure component (its `WindExplorer`, `SpanTwo`, …) without the words around it, and renders it in
the lecture's own stylesheet.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/calculus-applets/
npm run build      # the site in dist/
npm run preview    # serve dist/
```

`?only=<id>` shows one applet on its own, e.g. to project it in class:
`…/calculus-applets/?only=bike-wind`; an applet's title on its page links there. `…/projections/#bike-wind` links to it on its page.

## Layout

```
src/applets.js            the list: areas → topics → applets (id, title, caption, fun, source slides)
src/viz/<id>.jsx          one module per applet: the figure(s), plus any glue (state, sliders, layout)
src/main.jsx              the pages: the list of topics, and a topic (picked from the address)
src/site/Applet.jsx       loads a module when it scrolls near, renders and scales it
src/site/site.css         the look of the site (the figures' colours, Source Serif and Source Sans)
src/lectures/l<N>/        files copied from the lecture decks by `npm run sync` (do not edit here)
scripts/sync-slides.mjs   copy the slides named in src/applets.js, and what they import
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

## Add an applet

1. Add an entry to a topic in `src/applets.js`: `id`, `title`, `caption` (HTML: a question to think
   about, or what the picture cannot say by itself; optional), `fun: true` if it belongs under
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
   a phone.

The decks are read from `$MATH51` (see the top of `scripts/sync-slides.mjs` for the default).

## Deploy

The site is built for the path `/calculus-applets/` (`base` in `vite.config.js`), so it belongs
in a repository named `calculus-applets` under `rosie-0525`:

1. Create the repository on GitHub and push this folder to its `main` branch.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.

`.github/workflows/deploy.yml` then builds and publishes the site on every push to `main`.
