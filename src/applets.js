/*
 * The applets, by subject and concept. Each section (concept) is a page of its own, at
 * /calculus-applets/<section id>/; the first one is the front page, /calculus-applets/. For each
 * applet:
 *   id       anchor on the page, and the name of its module, src/viz/<id>.jsx
 *   title    heading
 *   caption  under the heading (HTML): a question to think about, or what the picture cannot say
 *   fun      true for the motivation that students do not need to know; it goes at the bottom of
 *            the page, under "Motivation – just for fun!"
 *   group    a heading that applets next to each other share, e.g. two pictures of one idea; they go
 *            under it, and the contents list it once
 *   from     the lecture-deck slides the visualization is taken from; `npm run sync` copies them
 *            (and everything they import) into src/lectures/l<N>/. Not shown on the page. `slides`
 *            is empty for a figure drawn for the page with the deck's components.
 */

export const AREAS = [
  {
    title: 'Linear algebra',
    sections: [
      {
        id: 'vectors',
        title: 'Vectors',
        applets: [
          {
            id: 'arrows',
            title: 'A vector has a magnitude and a direction',
            from: { lecture: 1, slides: ['Slide09Pictures'] },
          },
          {
            id: 'parallelogram-law',
            title: 'The parallelogram law',
            from: { lecture: 1, slides: ['Slide13ParallelogramLaw'] },
          },
          {
            id: 'pagerank',
            fun: true,
            title: 'Google Search: the web as a vector',
            caption: 'A page is important if important pages link to it. The importance scores for all pages form one vector.',
            from: { lecture: 1, slides: ['Slide10HigherDimensions'] },
          },
          {
            id: 'language-models',
            fun: true,
            title: 'Language models: words as vectors',
            caption: 'ChatGPT and Claude store every token as a vector with thousands of entries.',
            from: { lecture: 1, slides: ['Slide10HigherDimensions'] },
          },
        ],
      },
      {
        id: 'linear-combinations',
        title: 'Linear combinations',
        applets: [
          {
            id: 'linear-combinations',
            title: 'What do we get by combining one or two vectors?',
            from: { lecture: 1, slides: ['Slide16LinearCombinations'] },
          },
          {
            id: 'convex-two',
            group: 'Convex linear combinations',
            title: 'What are convex linear combinations of u and v?',
            from: { lecture: 1, slides: ['Slide17Convex', 'Slide18Example2'] },
          },
          {
            id: 'convex-three',
            group: 'Convex linear combinations',
            title: 'What are convex linear combinations of u, v and w?',
            from: { lecture: 1, slides: ['Slide19Example3'] },
          },
          {
            id: 'chords',
            fun: true,
            title: 'Chords are linear combinations of notes',
            caption:
              'A pure note is a sine wave, and playing notes together adds their waves: a chord is a linear combination of notes, and each coefficient says how loud its note is.',
            from: { lecture: 5, slides: ['Slide02Motivation'] },
          },
          {
            id: 'color-combination',
            fun: true,
            title: 'Colors as linear combinations',
            caption:
              'Every color on a screen is a mix of red, green and blue light: a linear combination of the three vectors <b>R</b>, <b>G</b> and <b>B</b>.',
            from: { lecture: 4, slides: ['Slide02Motivation'] },
          },
        ],
      },
      {
        id: 'dot-product',
        title: 'Dot products and angles',
        applets: [
          {
            id: 'dot-product-angle',
            title: 'The dot product measures angles',
            caption: 'When is the dot product positive, zero, or negative?',
            from: { lecture: 2, slides: ['Slide09Angle'] },
          },
          {
            id: 'angle-scaling',
            title: 'Scaling v and w by positive scalars does not change the angle between them',
            from: { lecture: 2, slides: ['Slide11Poll1'] },
          },
          {
            id: 'similar-meaning',
            fun: true,
            title: 'Search engines and AI chatbots',
            from: { lecture: 2, slides: ['Slide03Motivation'] },
          },
          {
            id: 'similar-taste',
            fun: true,
            title: 'Netflix and Spotify',
            caption:
              'A recommender system stores the features of each user as a vector, and similar vectors correspond to users with similar tastes.',
            from: { lecture: 2, slides: ['Slide03Motivation'] },
          },
          {
            id: 'correlation',
            title: 'Correlation as the cosine similarity between vectors',
            caption:
              'Data points (x<sub>i</sub>, y<sub>i</sub>) give vectors <b>X</b> = (x<sub>1</sub>, …, x<sub>n</sub>) and <b>Y</b> = (y<sub>1</sub>, …, y<sub>n</sub>). The correlation is <span style="white-space: nowrap">r = <b>X</b> · <b>Y</b> / (‖<b>X</b>‖ ‖<b>Y</b>‖) = cos θ</span>, where the x<sub>i</sub> and the y<sub>i</sub> each average to 0.',
            from: { lecture: 2, slides: ['Slide16CorrelationDef'] },
          },
        ],
      },
      {
        id: 'lines-planes',
        title: 'Lines and planes',
        applets: [
          {
            id: 'line',
            title: 'A line in parametric form',
            caption: 'What do the points <b>p</b> + t<b>v</b> trace out as t runs through all numbers?',
            from: { lecture: 3, slides: ['Slide03Line'] },
          },
          {
            id: 'plane',
            title: 'A plane in parametric form',
            caption: 'A plane is determined by one point, and two vectors parallel to the plane (but not to each other).',
            from: { lecture: 3, slides: ['Slide09Parametric'] },
          },
          {
            id: 'cover-game',
            fun: true,
            title: 'Can you hit the enemy?',
            caption: 'A bullet flies along a line, and the enemy is safe exactly when on the other side of the roof plane. Aim with the mouse, click to fire.',
            from: { lecture: 3, slides: ['Slide02Motivation'] },
          },
          {
            id: 'roof-game',
            fun: true,
            title: 'Lines and planes in a 3D game',
            caption:
              'Every bolt flies along a line <b>p</b> + t<b>v</b> and every roof is a plane <b>n</b> · <b>x</b> = d. Aim with the mouse and click to fire.',
            from: { lecture: 3, slides: ['Slide02bGame3D'] },
          },
          {
            id: 'spam-filter',
            fun: true,
            title: 'A spam filter is a plane',
            caption: 'Emails as points in space: in its simplest form, a spam filter is a plane with the spam on one side.',
            from: { lecture: 3, slides: ['Slide11aSpam'] },
          },
        ],
      },
      {
        id: 'span',
        title: 'Span and subspaces',
        applets: [
          {
            id: 'span-one',
            title: 'The span of one vector',
            from: { lecture: 4, slides: ['Slide04Example1'] },
          },
          {
            id: 'span-two',
            title: 'The span of two vectors',
            from: { lecture: 4, slides: ['Slide04Example1b'] },
          },
          {
            id: 'subspace-or-not',
            title: 'Subspace or not?',
            caption: 'A subspace contains 0 and every combination of its vectors.',
            from: { lecture: 4, slides: ['Slide06SubspaceOrNot'] },
          },
          {
            id: 'perpendicular',
            title: 'Vectors perpendicular to n form a linear subspace',
            from: { lecture: 4, slides: ['Slide06aOrthogonality'] },
          },
          {
            id: 'color-mixer',
            fun: true,
            title: 'Colors as vectors',
            caption: 'Every color on a screen is a mix of three lights. Why are three enough?',
            from: { lecture: 4, slides: ['Slide02Motivation'] },
          },
          {
            id: 'color-dimension',
            fun: true,
            title: 'The dimension of color',
            caption: 'One basis vector for each kind of color cell in the eye: three for us, two for most dogs, four for many birds.',
            from: { lecture: 4, slides: ['Slide15aBackToColors'] },
          },
        ],
      },
      {
        id: 'projections',
        title: 'Projections',
        applets: [
          {
            id: 'bike-wind',
            title: 'Wind on a bike ride',
            caption: 'How much of the wind actually pushes you along the road?',
            from: { lecture: 5, slides: ['Slide11Shadow'] },
          },
          {
            id: 'closest-point',
            title: 'Closest point on a line',
            caption: 'Which point of the line is closest to <b>x</b>?',
            from: { lecture: 5, slides: ['Slide14ClosestPoint'] },
          },
          {
            id: 'projection-plane',
            title: 'Projection onto a plane',
            caption: 'How do we find the point of a plane closest to <b>x</b>?',
            from: { lecture: 5, slides: ['Slide18ProjectionTheorem', 'Slide19ProjectionProperties'] },
          },
          {
            id: 'sum-of-projections',
            title: 'A vector is the sum of its projections',
            caption: 'This works only when <b>v</b>₁ and <b>v</b>₂ are orthogonal.',
            from: { lecture: 5, slides: ['Slide17ProjFourier'] },
          },
          {
            id: 'orthogonal-basis',
            title: 'Orthogonal basis for a plane',
            caption: 'Subtract the projection to get an orthogonal basis for a plane.',
            from: { lecture: 6, slides: ['Slide05OrthogonalBasis'] },
          },
          {
            id: 'denoise',
            fun: true,
            title: 'Denoising a chord',
            caption:
              'Projecting a noisy recording onto their span finds the closest chord, and what is left is the noise.',
            from: { lecture: 5, slides: ['Slide02Motivation', 'Slide23Sound'] },
          },
        ],
      },
      {
        id: 'best-fit',
        title: 'Finding best fit line',
        applets: [
          {
            id: 'best-fit',
            title: 'The line of best fit',
            caption:
              'The errors e<sub>i</sub> = y<sub>i</sub> − (mx<sub>i</sub> + b) are the vertical gaps between the data points and the line y = mx + b. The line of best fit makes e<sub>1</sub>² + ⋯ + e<sub>n</sub>² as small as possible.',
            from: { lecture: 6, slides: ['Slide07BestFit'] },
          },
          {
            id: 'weigh-penguin',
            fun: true,
            title: 'Weighing a penguin with a ruler',
            caption:
              'Weighing a penguin is hard, but measuring its flipper is easy. A line through the data of 342 penguins turns a flipper length into a weight.',
            from: { lecture: 6, slides: ['Slide03PenguinLine'] },
          },
          {
            id: 'regression',
            fun: true,
            title: 'Why is it called regression?',
            from: { lecture: 6, slides: ['Slide12Galton'] },
          },
        ],
      },
    ],
  },
  {
    title: 'Multivariable calculus',
    sections: [
      {
        id: 'functions',
        title: 'Scalar and vector-valued functions',
        applets: [
          {
            id: 'scalar-examples',
            title: 'A scalar-valued function outputs a number',
            from: { lecture: 7, slides: ['Slide07Scalar'] },
          },
          {
            id: 'helix',
            title: 'A vector-valued function',
            caption: 'Each component of a vector-valued function is a scalar-valued function.',
            from: { lecture: 7, slides: ['Slide17Functions'] },
          },
          {
            id: 'photo',
            title: 'Photos as functions',
            from: { lecture: 7, slides: ['Slide17cPhoto'] },
          },
          {
            id: 'composite',
            title: 'Composite functions',
            caption: 'Composition of the functions <b>f</b>(t) = (cos t, sin t, t/4) and <b>g</b>(x, y, z) = (x, y)',
            from: { lecture: 7, slides: ['Slide19Composite'] },
          },
        ],
      },
      {
        id: 'level-sets',
        title: 'Graph and contour plot of a function',
        applets: [
          {
            id: 'graph',
            title: 'The graph of a function',
            from: { lecture: 7, slides: ['Slide08Graph'] },
          },
          {
            id: 'level-set',
            title: 'Level sets',
            from: { lecture: 7, slides: ['Slide09LevelSets'] },
          },
          {
            id: 'contour-plot',
            title: 'A contour plot',
            caption: 'The level sets f(x, y) = c for evenly spaced values of c, drawn together in the plane.',
            from: { lecture: 7, slides: ['Slide10ContourPlot'] },
          },
          {
            id: 'steepness',
            title: 'Steepness on a contour plot',
            caption: 'The steeper the graph of f, the shorter the distance between the level sets.',
            from: { lecture: 7, slides: ['Slide11Steepness'] },
          },
          {
            id: 'extrema',
            title: 'Maximum, minimum and saddle',
            caption:
              'The contour plots of a maximum and a minimum have the same loops. How can you tell them apart?',
            from: { lecture: 7, slides: ['Slide11bExtrema'] },
          },
          {
            id: 'all-three',
            title: 'A maximum, a minimum and two saddle points',
            caption:
              'f(x, y) = sin x + sin y. Small closed loops surround a top or a bottom, and at a saddle point a level curve crosses itself.',
            from: { lecture: 7, slides: ['Slide11cAllThree'] },
          },
          {
            id: 'saddle-levels',
            title: 'The level curves of a saddle',
            from: { lecture: 7, slides: ['Slide14bExample3D'] },
          },
          {
            id: 'print-mountain',
            fun: true,
            title: 'How does a 3D printer print a mountain?',
            caption:
              'A 3D printer builds an object one thin layer at a time, from the bottom up. Each layer is bounded by the level set.',
            from: { lecture: 7, slides: ['Slide10bPrint'] },
          },
          {
            id: 'robot-arm',
            fun: true,
            title: 'How does a robot arm reach for a cup?',
            caption:
              'The distance from the hand to the cup is a function of the two joint angles. Reaching for the cup amounts to finding the minimum of this distance function.',
            from: { lecture: 7, slides: ['Slide19bRobotArm'] },
          },
        ],
      },
      {
        id: 'partial-derivatives',
        title: 'Partial derivatives',
        applets: [
          {
            id: 'tangent-line',
            title: 'Single variable function',
            caption: 'The derivative is the slope of the tangent line',
            from: { lecture: 8, slides: ['Slide02Recall'] },
          },
          {
            id: 'slices',
            title: 'Partial derivatives',
            from: { lecture: 8, slides: ['Slide03Question', 'Slide05bLinearApprox', 'Slide05Compute'] },
          },
          {
            id: 'density',
            title: 'Partial derivatives on a contour plot',
            caption:
              '|f<sub>x</sub>| indicates density of the level sets; <span style="white-space: nowrap">f<sub>x</sub> &gt; 0</span> if the labels on the level sets increase in the +x direction',
            from: { lecture: 8, slides: ['Slide13Density'] },
          },
          {
            id: 'magic-wand',
            fun: true,
            title: 'Removing the background of a photo',
            caption: 'Click the sky with the Magic Wand, then Delete. How does the computer find the sky?',
            from: { lecture: 8, slides: ['Slide01dPhotoshop'] },
          },
          {
            id: 'edges',
            fun: true,
            title: 'Detecting edges with partial derivatives',
            caption: 'How much the colour changes across pixels detects edges',
            from: { lecture: 8, slides: ['Slide01cBackground'] },
          },
        ],
      },
      {
        id: 'critical-points',
        title: 'Critical points and local extrema',
        applets: [
          {
            id: 'critical-recall',
            title: 'Single variable function',
            caption: 'At a local maximum or minimum, f′(c) = 0: c is a critical point. Is every critical point a local maximum or minimum?',
            from: { lecture: 9, slides: ['Slide03Recall'] },
          },
          {
            id: 'critical-tangents',
            title: 'Critical points',
            caption:
              'A critical point is a point where all the partial derivatives vanish: (a, b) is a critical point of f(x, y) if f<sub>x</sub>(a, b) = 0 and f<sub>y</sub>(a, b) = 0. Both tangent lines are horizontal there.',
            from: { lecture: 9, slides: ['Slide04Critical'] },
          },
          {
            id: 'local-extrema',
            title: 'Local maximum and minimum',
            caption:
              'f has a local minimum at <b>p</b> if f(<b>x</b>) ≥ f(<b>p</b>) for every point <b>x</b> sufficiently close to <b>p</b>, and a local maximum if f(<b>x</b>) ≤ f(<b>p</b>).',
            from: { lecture: 9, slides: ['Slide05Local'] },
          },
          {
            id: 'extremum-slice',
            title: 'A local extremum is a critical point',
            caption:
              'Why? If f has a local extremum at (a, b), the slice f(x, b) has a local extremum at x = a, so f<sub>x</sub>(a, b) = 0. Similarly, f<sub>y</sub>(a, b) = 0.',
            from: { lecture: 9, slides: ['Slide06Theorem'] },
          },
          {
            id: 'saddle-point',
            title: 'Saddle points',
            caption:
              'f(x, y) = x² − y² at (0, 0): along the x-axis, <span style="color: #8c1515">f(x, 0) = x²</span> has a local minimum; along the y-axis, <span style="color: #175e54">f(0, y) = −y²</span> has a local maximum.',
            from: { lecture: 9, slides: ['Slide08Saddle'] },
          },
          {
            id: 'classify-contour',
            title: 'Critical points on a contour plot',
            caption:
              'g(x, y) = 3x²y + y³ − 6xy. Nested ovals surround a local maximum or minimum, and at a saddle point a level curve crosses itself in an X.',
            from: { lecture: 9, slides: ['Slide08bNeither'] },
          },
          {
            id: 'neither',
            title: 'Neither a local extremum nor a saddle point',
            caption:
              'f(x, y) = x³ + y² at its critical point (0, 0): along the x-axis, <span style="color: #8c1515">f(x, 0) = x³</span> has neither a maximum nor a minimum; along the y-axis, <span style="color: #175e54">f(0, y) = y²</span> has a local minimum.',
            from: { lecture: 9, slides: ['Slide08bNeither'] },
          },
          {
            id: 'sierra',
            fun: true,
            title: 'How did the railroad cross the Sierra Nevada?',
            caption:
              'In the 1860s, Leland Stanford’s Central Pacific Railroad had to cross the mountains east of Sacramento. Draw a route across the map, from the west edge to the east edge: can you find one whose highest point is as low as possible?',
            from: { lecture: 9, slides: ['Slide02Sierra'] },
          },
          {
            id: 'donner-pass',
            fun: true,
            title: 'Donner Pass is a saddle point',
            caption:
              'Along the route the pass is the highest point, and along the crest the lowest. The level curve through the pass crosses itself in an X, and the ground lower than the pass (in blue) is in two pieces, which meet only there.',
            from: { lecture: 9, slides: ['Slide09Donner'] },
          },
          {
            id: 'springs',
            fun: true,
            title: 'Two springs come to rest at a critical point',
            caption:
              'Two identical springs and two weights hang from the ceiling, held so that the springs are not stretched. Let go: they bounce, then settle at the minimum of the potential energy V(x<sub>1</sub>, x<sub>2</sub>), a critical point of V. Click on the contour plot to let them go from somewhere else. Can the bottom spring end up stretched more than the top one?',
            from: { lecture: 9, slides: ['Slide06bSprings'] },
          },
        ],
      },
      {
        id: 'global-extrema',
        title: 'Global extrema on a region',
        applets: [
          {
            id: 'region-extrema',
            title: 'Local extrema on a region',
            caption:
              'f: D → ℝ has a local maximum on D at <b>a</b> if f(<b>x</b>) ≤ f(<b>a</b>) for every point <b>x</b> in D sufficiently close to <b>a</b>. Which of these local extrema are critical points?',
            from: { lecture: 9, slides: ['Slide12bLocalRegion'] },
          },
          {
            id: 'boundary-examples',
            title: 'Critical point or boundary point',
            caption:
              'If f: D → ℝ has a local extremum at <b>a</b>, then <b>a</b> is a critical point of f in the interior of D, or a boundary point of D.',
            from: { lecture: 9, slides: ['Slide15bTheoremExamples'] },
          },
          {
            id: 'global-extrema',
            title: 'Global extrema',
            caption:
              'f has a global maximum on D at <b>a</b> if f(<b>a</b>) ≥ f(<b>x</b>) for all <b>x</b> in D. We can find the global extrema by finding all the local extrema and comparing their values.',
            from: { lecture: 9, slides: ['Slide13Global'] },
          },
          {
            id: 'global-steps',
            title: 'Finding global extrema',
            caption: 'f(x, y) = 3x² − 2y² + 2x + 2y − 1 on the square [−1, 1] × [−1, 1], one step at a time.',
            from: { lecture: 9, slides: ['Slide16Method'] },
          },
          {
            id: 'connecticut',
            fun: true,
            title: 'Where is the highest point in Connecticut?',
            caption:
              'E(x, y) = height above sea level at (x, y), on Connecticut only. Bear Mountain is the highest summit in Connecticut, but it is not the highest point. Where is it?',
            from: { lecture: 9, slides: ['Slide14Connecticut'] },
          },
        ],
      },
    ],
  },
];

export const SECTIONS = AREAS.flatMap((a) => a.sections.map((s) => ({ ...s, area: a.title })));
export const APPLETS = SECTIONS.flatMap((s) => s.applets);
