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
      {
        id: 'linear-functions',
        title: 'Linear functions and matrices',
        applets: [
          {
            id: 'linear-affine',
            title: 'Linear and affine functions',
            caption:
              'A scalar-valued function f(x<sub>1</sub>, …, x<sub>n</sub>) is affine if f(<b>x</b>) = a<sub>1</sub>x<sub>1</sub> + ⋯ + a<sub>n</sub>x<sub>n</sub> + b for some scalars a<sub>1</sub>, …, a<sub>n</sub>, b, and linear if f(<b>x</b>) = a<sub>1</sub>x<sub>1</sub> + ⋯ + a<sub>n</sub>x<sub>n</sub>. Linear functions are affine; affine functions need not be linear. How can you tell from the graph of a function of two variables?',
            from: { lecture: 13, slides: ['Slide02Linear'] },
          },
          {
            id: 'linear-maps',
            title: 'Linear and affine vector-valued functions',
            caption:
              'A vector-valued function is affine if all its component functions are affine, and linear if all its component functions are linear. To see a function ℝ² → ℝ², put a photo in the plane and move each point <b>x</b> to f(<b>x</b>). What happens to straight lines, and to <b>0</b>? The third function sends <b>0</b> to <b>0</b>: why is it not linear?',
            from: { lecture: 13, slides: ['Slide02cGrids'] },
          },
          {
            id: 'matrix-columns',
            title: 'The columns of A',
            caption:
              'A function f: ℝ<sup>n</sup> → ℝ<sup>m</sup> is linear precisely when f(<b>x</b>) = A<b>x</b> for some m × n matrix A, and then the columns of A are f(<b>e</b><sub>1</sub>), …, f(<b>e</b><sub>n</sub>), where <b>e</b><sub>j</sub> is the j-th standard basis vector of ℝ<sup>n</sup>. Why? A<b>e</b><sub>j</sub> = 0<b>c</b><sub>1</sub> + ⋯ + 1<b>c</b><sub>j</sub> + ⋯ + 0<b>c</b><sub>n</sub> = <b>c</b><sub>j</sub>. Can you read A off the picture of f?',
            from: { lecture: 13, slides: ['Slide09Columns'] },
          },
          {
            id: 'photo-filters',
            fun: true,
            title: 'How does a photo editor apply a filter?',
            caption:
              'A color photo consists of many pixels, and each pixel is a 3-vector <b>x</b> = (R, G, B). A filter does the same to every pixel: it is a function on these 3-vectors. Click a filter. Click the photo to zoom in there, and a pixel in the block to make it <b>x</b>.',
            from: { lecture: 13, slides: ['Slide01aFilters'] },
          },
          {
            id: 'own-filter',
            fun: true,
            title: 'Photo filters as linear functions',
            caption:
              'Sepia is linear, so it maps each pixel to a matrix-vector product. The columns of its matrix are the colors that pure red, green and blue become, and the new color mixes them in the amounts R, G and B. Drag the ring across a photo. Click a square under “Make your own filter” to choose what red, green or blue becomes.',
            from: { lecture: 13, slides: ['Slide09bFiltersExplained'] },
          },
        ],
      },
      {
        id: 'linear-transformations',
        title: 'Linear transformations',
        applets: [
          {
            id: 'linearity-example',
            title: 'The Linearity Principle',
            caption:
              'A <b>linear transformation</b> is another name for a linear function. A linear transformation f satisfies f(c<sub>1</sub><b>v</b><sub>1</sub> + c<sub>2</sub><b>v</b><sub>2</sub>) = c<sub>1</sub>f(<b>v</b><sub>1</sub>) + c<sub>2</sub>f(<b>v</b><sub>2</sub>) for all scalars c<sub>1</sub>, c<sub>2</sub> and vectors <b>v</b><sub>1</sub>, <b>v</b><sub>2</sub>. Where do <b>e</b><sub>1</sub> + <b>e</b><sub>2</sub>, 2<b>e</b><sub>1</sub> and 2<b>e</b><sub>1</sub> + <b>e</b><sub>2</sub> go? Click one to see.',
            from: { lecture: 14, slides: ['Slide02aLinearity'] },
          },
          {
            id: 'tiling',
            title: 'The Tiling Principle',
            caption:
              'Let f: ℝ² → ℝ² be linear, f(<b>x</b>) = A<b>x</b>, with f(<b>e</b><sub>1</sub>) and f(<b>e</b><sub>2</sub>) not scalar multiples of each other. f transforms the tiling of ℝ² by copies of the unit square S into a tiling of ℝ² by copies of its image f(S), a parallelogram. Drag the point <b>s</b> = a<b>e</b><sub>1</sub> + b<b>e</b><sub>2</sub> of S, or f(<b>s</b>). Where does the copy of S to its right (green) go, and why?',
            from: { lecture: 14, slides: ['Slide02bTiling'] },
          },
          {
            id: 'collapse',
            title: 'When f(e₁) and f(e₂) are scalar multiples',
            caption:
              'What if f(<b>e</b><sub>2</sub>) = 2f(<b>e</b><sub>1</sub>), say? Swing f(<b>e</b><sub>2</sub>) onto 2f(<b>e</b><sub>1</sub>), then drag the point <b>s</b> around S. Where can f(<b>s</b>) be? Does f(S) tile ℝ²?',
            from: { lecture: 14, slides: ['Slide02cCollapse'] },
          },
          {
            id: 'linear-or-not',
            title: 'Linear or not?',
            caption:
              'The Linearity Principle: a function f: ℝ<sup>n</sup> → ℝ<sup>m</sup> is linear precisely when f(<b>x</b> + <b>y</b>) = f(<b>x</b>) + f(<b>y</b>) and f(c<b>x</b>) = c f(<b>x</b>) for any n-vectors <b>x</b>, <b>y</b> and any scalar c. Each picture moves the grid, the unit square and the F in it to their images under a function ℝ² → ℝ², and back. Which of these functions are linear?',
            from: { lecture: 14, slides: ['Slide05bLinearOrNot'] },
          },
          {
            id: 'rotations-linear',
            title: 'Rotations are linear',
            caption:
              'R<sub>θ</sub>(<b>v</b>) is the rotation of <b>v</b> counterclockwise by θ around <b>0</b>. Why are R<sub>θ</sub>(<b>v</b> + <b>w</b>) = R<sub>θ</sub>(<b>v</b>) + R<sub>θ</sub>(<b>w</b>) and R<sub>θ</sub>(c<b>v</b>) = cR<sub>θ</sub>(<b>v</b>)? Click one to build it both ways: first the left side, then the right side. Drag θ.',
            from: { lecture: 14, slides: ['Slide07Rotations'] },
          },
          {
            id: 'rotation-matrix',
            title: 'The matrix of a rotation',
            caption:
              'The columns of the matrix of R<sub>θ</sub> are R<sub>θ</sub>(<b>e</b><sub>1</sub>) and R<sub>θ</sub>(<b>e</b><sub>2</sub>), where <b>e</b><sub>1</sub> and <b>e</b><sub>2</sub> go. What is the matrix of the rotation by π/2? By π/4? Work it out, then drag θ there.',
            from: { lecture: 14, slides: ['Slide07bRotationMatrix'] },
          },
          {
            id: 'axis-rotations',
            title: 'Rotations around the coordinate axes',
            caption:
              'The rotation of ℝ³ by θ around the z-axis turns the xy-plane by θ and leaves <b>e</b><sub>3</sub> where it is. The columns of its matrix R<sub>z</sub>(θ) are where <b>e</b><sub>1</sub>, <b>e</b><sub>2</sub> and <b>e</b><sub>3</sub> go (in red). Why is the −sin θ of R<sub>y</sub>(θ) below the diagonal, and not above it as in R<sub>x</sub>(θ) and R<sub>z</sub>(θ)? Drag a picture to turn it.',
            from: { lecture: 14, slides: ['Slide10Axes'] },
          },
          {
            id: 'projection-matrix',
            title: 'The matrix of a projection',
            caption:
              'For a nonzero n-vector <b>w</b>, Proj<sub><b>w</b></sub>: ℝ<sup>n</sup> → ℝ<sup>n</sup> is a linear function, because Proj<sub><b>w</b></sub>(a<b>v</b><sub>1</sub> + b<b>v</b><sub>2</sub>) = a Proj<sub><b>w</b></sub>(<b>v</b><sub>1</sub>) + b Proj<sub><b>w</b></sub>(<b>v</b><sub>2</sub>). For <b>w</b> = (1, 2), what is its matrix?',
            from: { lecture: 14, slides: ['Slide11Projections'] },
          },
          {
            id: 'transformations-r2',
            title: 'Linear transformations of ℝ²',
            caption:
              'Each picture shows a linear transformation of ℝ² by what it does to the unit square S, with an F in it to show which way round its image is. Linear transformations preserve <b>0</b> and parallelograms, and might “collapse” or “flip” stuff. Can you read each matrix off its picture?',
            from: { lecture: 14, slides: ['Slide08Gallery'] },
          },
        ],
      },
      {
        id: 'matrix-multiplication',
        title: 'Matrix multiplication',
        applets: [
          {
            id: 'computing-product',
            title: 'Composition and matrix product',
            caption:
              'Let A be an m × n matrix and B an n × p matrix, T<sub>A</sub>(<b>x</b>) = A<b>x</b> and T<sub>B</sub>(<b>x</b>) = B<b>x</b>. Then T<sub>A</sub> ∘ T<sub>B</sub> is a linear transformation, (T<sub>A</sub> ∘ T<sub>B</sub>)(<b>x</b>) = A(B<b>x</b>), and its matrix is the <b>matrix product</b> AB: column j of AB is A<b>b</b><sub>j</sub>, where <b>b</b><sub>j</sub> is column j of B, so the (i, j)-entry of AB is (row i of A) · (column j of B). Click an entry of AB. Why can we multiply an m × n and a p × q matrix only when n = p?',
            from: { lecture: 14, slides: ['Slide14Computing'] },
          },
          {
            id: 'order-matters',
            title: 'Order matters',
            caption:
              'R<sub>1</sub> turns the ball 90° around the z-axis, and R<sub>2</sub> 90° around the y-axis. Turn it by R<sub>1</sub>, then R<sub>2</sub> (top), or by R<sub>2</sub>, then R<sub>1</sub> (bottom): is R<sub>2</sub> ∘ R<sub>1</sub> = R<sub>1</sub> ∘ R<sub>2</sub>? Try it with a ball of your own.',
            from: { lecture: 14, slides: ['Slide18Order'] },
          },
          {
            id: 'order-algebra',
            title: 'The algebra behind',
            caption:
              'A and B are the matrices of R<sub>1</sub> and R<sub>2</sub>, so R<sub>2</sub> ∘ R<sub>1</sub> has matrix BA, and R<sub>1</sub> ∘ R<sub>2</sub> has matrix AB: AB ≠ BA. The face looks along <b>e</b><sub>1</sub> and the stem along <b>e</b><sub>3</sub>: where does each rotation send them? Find those vectors in the columns of A and B.',
            from: { lecture: 14, slides: ['Slide18bMatrices'] },
          },
          {
            id: 'rotations-commute',
            title: 'Rotations of ℝ² commute',
            caption:
              'Unlike rotations of ℝ³, rotations of the plane commute: turning by α, then by β, is turning by α + β, either way round. So the product of the matrices of R<sub>β</sub> and R<sub>α</sub> is the matrix of R<sub>α+β</sub>. Which formulas from trigonometry does that give?',
            from: { lecture: 14, slides: ['Slide18cCommute'] },
          },
        ],
      },
      {
        id: 'matrix-algebra',
        title: 'Matrix algebra',
        applets: [
          {
            id: 'sum-maps',
            title: 'What A + B does',
            caption:
              'The <b>sum</b> A + B of two m × n matrices adds their entries, and the linear functions associated to A, B and A + B satisfy T<sub>A+B</sub>(<b>x</b>) = T<sub>A</sub>(<b>x</b>) + T<sub>B</sub>(<b>x</b>). Here A is a shear and B the rotation by 90°. Drag <b>x</b>: where is (A + B)<b>x</b>, compared with A<b>x</b> and B<b>x</b>?',
            from: { lecture: 15, slides: ['Slide04SumMaps'] },
          },
          {
            id: 'scalar-maps',
            title: 'What cA does',
            caption:
              'The <b>scalar multiple</b> cA multiplies every entry of A by c, and T<sub>cA</sub>(<b>x</b>) = cT<sub>A</sub>(<b>x</b>). Drag <b>x</b>, and move c: where is (cA)<b>x</b> when c is negative? When c = 0?',
            from: { lecture: 15, slides: ['Slide04bScalarMaps'] },
          },
          {
            id: 'associativity',
            title: 'Multiplication is associative',
            caption:
              '(AB)C = A(BC) for any matrices A (m × n), B (n × p) and C (p × k). Why? BC is the matrix of T<sub>B</sub> ∘ T<sub>C</sub>, so A(BC) is the matrix of T<sub>A</sub> ∘ T<sub>BC</sub>, and (AB)C is the matrix of T<sub>AB</sub> ∘ T<sub>C</sub>. Where does each one send <b>x</b> in ℝ<sup>k</sup>? Click a shortcut to draw it.',
            from: { lecture: 15, slides: ['Slide08Associative'] },
          },
          {
            id: 'order-cost',
            title: 'Which order is faster?',
            caption:
              'By associativity, (AB)C and A(BC) are the same matrix, but they take different amounts of work. Each entry of the product of a p × q and a q × s matrix takes q multiplications. Click a product to count its multiplications: which way round is faster here, and why?',
            from: { lecture: 15, slides: ['Slide08bOrder'] },
          },
          {
            id: 'order-race',
            title: 'How much faster?',
            caption:
              'For n × n matrices A and B and an n × 1 matrix C, computing (AB)C takes n³ + n² multiplications, and A(BC) takes 2n². Move n: how long does each take, at a billion multiplications a second?',
            from: { lecture: 15, slides: ['Slide08cRace'] },
          },
          {
            id: 'no-cancellation',
            title: 'No cancellation law',
            caption:
              'For numbers, ab = ac with a ≠ 0 gives b = c, but for matrices AB = AC does not imply B = C. Here B turns <b>x</b> to B<b>x</b>, C flips it to C<b>x</b>, and then A squashes the plane onto the x-axis. Drag <b>x</b>: why is A(B<b>x</b>) = A(C<b>x</b>) for every <b>x</b>? Write down A, B and C, and check that AB = AC.',
            from: { lecture: 15, slides: ['Slide09Cancellation'] },
          },
          {
            id: 'order-uses',
            title: 'Neural networks and video games',
            fun: true,
            caption:
              'Training a neural network runs vectors through its layers, forward to a prediction and back (backpropagation), each layer a matrix: products like A(BC), with C a vector, for a huge n. A video game applies the same three 4 × 4 matrices to a million points <b>x</b>, the corners of its blocks: it computes ABC once (128 multiplications), then 16 per point, against 48 per point for A(B(C<b>x</b>)).',
            from: { lecture: 15, slides: ['Slide08cRace'] },
          },
        ],
      },
      {
        id: 'diagonal-triangular',
        title: 'Diagonal and triangular matrices',
        applets: [
          {
            id: 'scaling',
            title: 'Scaling',
            caption:
              'A <b>scaling</b> S(x<sub>1</sub>, x<sub>2</sub>) = (d<sub>1</sub>x<sub>1</sub>, d<sub>2</sub>x<sub>2</sub>) multiplies x<sub>1</sub> by d<sub>1</sub> and x<sub>2</sub> by d<sub>2</sub>. The columns of its matrix are S(<b>e</b><sub>1</sub>) and S(<b>e</b><sub>2</sub>): what is the matrix of each of these four? Click a picture to check.',
            from: { lecture: 15, slides: ['Slide02dScaling'] },
          },
          {
            id: 'diagonal-maps',
            title: 'What diagonal matrices do',
            caption:
              'The <b>diagonal</b> of an m × n matrix A consists of its entries a<sub>ii</sub>, and A is <b>diagonal</b> if all its other entries are zero. A diagonal 2 × 2 matrix is a scaling, but d<sub>1</sub> and d<sub>2</sub> can be negative or zero. Click a matrix, or move d<sub>1</sub> and d<sub>2</sub>: which ones stretch, reflect or project the plane?',
            from: { lecture: 15, slides: ['Slide12DiagonalMaps'] },
          },
          {
            id: 'diagonal-products',
            title: 'Multiplying by a diagonal matrix',
            caption:
              'A = diag(2, 1) doubles x<sub>1</sub>. Watch T<sub>A</sub> ∘ T<sub>B</sub> (first B, then A) and T<sub>B</sub> ∘ T<sub>A</sub> (first A, then B) move the unit square, <b>e</b><sub>1</sub> and <b>e</b><sub>2</sub>. Why does AB double the first row of B, and BA its first column? What do DA and AD do for any diagonal D?',
            from: { lecture: 15, slides: ['Slide13cExample1Maps'] },
          },
          {
            id: 'triangular',
            title: 'Triangular matrices',
            caption:
              'A matrix is <b>upper triangular</b> when its only nonzero entries are on or above its diagonal, and <b>lower triangular</b> when they are on or below it. The shears [1 1; 0 1] and [1 0; 1 1] are triangular: which way does each one push the unit square?',
            from: { lecture: 15, slides: ['Slide16Triangular'] },
          },
          {
            id: 'triangular-products',
            title: 'Products of triangular matrices',
            caption:
              'The product of two upper triangular matrices is upper triangular, and the product of two lower triangular matrices is lower triangular. Why? Point at an entry of UV below its diagonal: why does each term of (row i of U) · (column j of V) have a factor 0?',
            from: { lecture: 15, slides: ['Slide17TriangularProducts'] },
          },
          {
            id: 'adding-rows',
            title: 'Adding rows and columns',
            caption:
              'Each E is the identity matrix with one more entry c. Before you click EA or AE to compute it, guess: what does multiplying by E on the left do to the rows of A? On the right, to its columns?',
            from: { lecture: 15, slides: ['Slide18bAddRows'] },
          },
          {
            id: 'row-operations',
            title: 'Row and column operations',
            caption:
              'Multiplying A on the left does <b>row operations</b> on A; multiplying on the right does <b>column operations</b>. Here D is diagonal and E adds a multiple of one row or column to another. Click a product to compute it: which operation does it do?',
            from: { lecture: 15, slides: ['Slide19RowOps'] },
          },
        ],
      },
      {
        id: 'markov-chains',
        title: 'Markov chains',
        applets: [
          {
            id: 'birds-stay',
            title: 'Where will the birds be in 20 years?',
            caption:
              'Three islands, 10,000 birds on each (each bird drawn stands for 100). Every year, half the birds on island A fly to B and half to C; half the birds on B fly to A and half to C; the birds on C all stay. Watch the first year, one island at a time, and then the years go by: where are the birds after 20 years?',
            from: { lecture: 16, slides: ['Slide01bBirds'] },
          },
          {
            id: 'birds-settle',
            title: 'When some birds leave island C',
            caption:
              'Now a third of the birds on island C stay, a third fly to A and a third to B; A and B as before. Watch the years go by: what happens to the numbers of birds? Do the birds stop flying?',
            from: { lecture: 16, slides: ['Slide01cBirdsSettle'] },
          },
          {
            id: 'transition-diagram',
            title: 'Transition diagram',
            caption:
              'The <b>transition diagram</b> of the migration draws each island as a circle, and each flight as an arrow with the fraction of the island’s birds that take it. Click a rule to draw its island’s arrows again: what do the fractions on the arrows out of an island add up to?',
            from: { lecture: 16, slides: ['Slide02bDiagram'] },
          },
          {
            id: 'column-sums',
            title: 'The matrix of the migration',
            caption:
              'Let <b>n</b><sub>k</sub> = (A<sub>k</sub>, B<sub>k</sub>, C<sub>k</sub>) be the numbers of birds on islands A, B, C after k years. Then <b>n</b><sub>k+1</sub> = M<b>n</b><sub>k</sub> for this M, so <b>n</b><sub>k</sub> = M<sup>k</sup><b>n</b><sub>0</sub>. Which sums of M must be 1: each row sum, each column sum, or the sum of all its entries? Click a column of M: whose birds does it follow?',
            from: { lecture: 16, slides: ['Slide04PollSums'] },
          },
          {
            id: 'markov-or-not',
            title: 'Markov chain or not?',
            caption:
              'A <b>Markov chain</b> is a process in which the evolution of a system depends on the current state of the system, but not on its previous states. Which of these four processes are Markov chains? Click a picture to check.',
            from: { lecture: 16, slides: ['Slide07Markov'] },
          },
          {
            id: 'long-run',
            title: 'Where do the birds end up?',
            caption:
              'Back to the first migration, where no bird leaves island C. Its matrix M is a <b>Markov matrix</b>: a square matrix with non-negative entries, where the entries in each column add up to 1. Let <b>p</b><sub>k</sub> be the fractions of the birds on islands A, B, C after k years, a <b>probability vector</b> (its entries are non-negative and add up to 1): <b>p</b><sub>0</sub> = (⅓, ⅓, ⅓) and <b>p</b><sub>k</sub> = M<sup>k</sup><b>p</b><sub>0</sub>. Click the calendar for the next year: what happens to M<sup>k</sup> and <b>p</b><sub>k</sub>?',
            from: { lecture: 16, slides: ['Slide08dAllOnCLong'] },
          },
          {
            id: 'casino',
            fun: true,
            title: 'A night at the casino',
            caption:
              'You walk in with $40, hoping to leave with $100, and bet $20 on red at each spin of a fair roulette wheel (3 of its 6 pockets are red), until you have $100 or nothing. Play a few nights: what is the chance that you leave with $100?',
            from: { lecture: 16, slides: ['Slide17bCasino'] },
          },
          {
            id: 'gamblers-ruin',
            fun: true,
            title: 'Gambler’s ruin',
            caption:
              'Your money, $0 to $100, is the state of a Markov chain: at each spin it goes up $20 with probability ½ (red) and down $20 with probability ½ (black), and at $0 or $100 the game is over. With its Markov matrix M, the probabilities <b>p</b>(n) that you have $0, $20, …, $100 after n spins are <b>p</b>(n) = M<sup>n</sup><b>p</b>(0).',
            from: { lecture: 16, slides: ['Slide18Gambler'] },
          },
          {
            id: 'leave-with-100',
            fun: true,
            title: 'Do you leave with $100?',
            caption:
              'Step through the spins: where do the probabilities <b>p</b>(n) = M<sup>n</sup><b>p</b>(0) go as n grows? Then change your goal: how does your chance of reaching it change?',
            from: { lecture: 16, slides: ['Slide19WhoWins'] },
          },
        ],
      },
      {
        id: 'equilibrium',
        title: 'Equilibrium vectors',
        applets: [
          {
            id: 'matrix-powers',
            title: 'High powers of a Markov matrix',
            caption:
              '<b>Theorem.</b> If M is a Markov matrix where M<sup>a</sup> has all positive entries for some positive integer a, then M<sup>k</sup> → [<b>u</b> <b>u</b> ⋯ <b>u</b>] as k → ∞, where <b>u</b> is the unique probability vector with M<b>u</b> = <b>u</b>, the <b>equilibrium vector</b> (or <b>stationary vector</b>) of M. Here M is the textbook’s migration, and M<sup>2</sup> has all positive entries. Step k: what happens to the columns of M<sup>k</sup>? Check that M<b>u</b> = <b>u</b>.',
            from: { lecture: 16, slides: ['Slide10Equilibrium'] },
          },
          {
            id: 'initial-distribution',
            title: 'Independence of the initial distribution',
            caption:
              'In the long run, the fractions of the birds on islands A, B, C are the entries of <b>u</b> = (2/7, 2/7, 3/7). Click an island to start all 30,000 birds there: where do the numbers settle? Why does M<sup>k</sup> → [<b>u</b> ⋯ <b>u</b>] give <b>p</b><sub>k</sub> = M<sup>k</sup><b>p</b><sub>0</sub> → <b>u</b> for any initial probability vector <b>p</b><sub>0</sub>?',
            from: { lecture: 16, slides: ['Slide11PollLimit'] },
          },
          {
            id: 'why-positive',
            title: 'Why all positive entries?',
            caption:
              'The theorem needs a power of M with all positive entries. No power of M has all positive entries in these two Markov chains: what goes wrong in each? Think first, then click to check. And the first migration, where no bird leaves island C: is it irreducible? Does M<sup>k</sup> have a limit anyway?',
            from: { lecture: 16, slides: ['Slide12bWhyPositive'] },
          },
          {
            id: 'random-surfer',
            fun: true,
            title: 'A random surfer on the internet',
            caption:
              'On each page, a random surfer clicks a random link (85% of the time) or types in a random page (15%). In the long run, what fraction of the time does the surfer spend on each page? The longer, the more important the page.',
            from: { lecture: 16, slides: ['Slide19bSurfer'] },
          },
          {
            id: 'pagerank-surfers',
            fun: true,
            title: 'PageRank',
            caption:
              'Google’s PageRank (Larry Page and Sergey Brin, 1998) models the random surfer by a Markov chain. Here 300 surfers click at once, all on Math 51 at first, and each page’s bar shows its entry of <b>p</b><sub>k</sub> = M<sup>k</sup><b>p</b><sub>0</sub>. Click a page to start them all there: where do the bars settle? Google ranks the pages by the entries of the stationary vector <b>u</b>.',
            from: { lecture: 16, slides: ['Slide13PageRank'] },
          },
          {
            id: 'shuffles',
            fun: true,
            title: 'How many times should we shuffle a deck of cards?',
            caption:
              'A riffle shuffle cuts the deck in about half and interleaves the two packets. The 52! ≈ 8 × 10<sup>67</sup> orders of the deck are the states of a Markov chain, whose stationary vector makes every order equally likely. Shuffle the rainbow deck: when does it look mixed? Bayer and Diaconis (Stanford, 1992) computed how far k shuffles are from perfectly mixed.',
            from: { lecture: 16, slides: ['Slide14Shuffles'] },
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
            id: 'level-surfaces',
            title: 'Level surfaces',
            caption:
              'The graph of a function of three variables would live in ℝ⁴, but its level surfaces g(x, y, z) = c live in ℝ³, as the level curves of a function of two variables live in ℝ². For g(x, y, z) = x² + y² + z² they are spheres, nested like the layers of an onion.',
            from: { lecture: 11, slides: ['Slide09cLevelSurfaces'] },
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
      {
        id: 'gradient',
        title: 'Gradients and linear approximation',
        applets: [
          {
            id: 'gradient-field',
            title: 'The gradient is a vector-valued function',
            caption:
              'The gradient of f: ℝ<sup>n</sup> → ℝ is the vector of its partial derivatives, ∇f = (∂f/∂x<sub>1</sub>, …, ∂f/∂x<sub>n</sub>): a vector at every point. For f(x, y) = xy, ∇f(x, y) = (y, x), drawn at a quarter of its length. Drag the point <b>a</b>.',
            from: { lecture: 11, slides: ['Slide04Gradient'] },
          },
          {
            id: 'tangent-plane',
            title: 'Linear approximation',
            caption:
              'The linear approximation to f for <b>x</b> near a point <b>a</b> is f(<b>x</b>) ≈ f(<b>a</b>) + ∇f(<b>a</b>) · (<b>x</b> − <b>a</b>). The tangent plane is drawn for f(x, y) = x² + 2y² + xy at (1, 1).',
            from: { lecture: 11, slides: ['Slide05LinearApprox'] },
          },
          {
            id: 'linear-error',
            title: 'How good is the linear approximation?',
            caption:
              'f(x, y) = x² + 2y² + xy and its linear approximation at (1, 1), L(x, y) = 4 + 3(x − 1) + 5(y − 1), whose graph is the tangent plane. Near (1, 1) the error f − L is tiny. What happens far from (1, 1)?',
            from: { lecture: 11, slides: ['Slide06Example1'] },
          },
        ],
      },
      {
        id: 'gradient-level-sets',
        title: 'Gradients and level sets',
        applets: [
          {
            id: 'gradient-directions',
            title: 'The gradient on a contour plot',
            caption:
              'f(x, y) = x³ + xy + y², with ∇f(x, y) = (3x² + y, x + 2y). The arrows show ∇f at points on the level curves, all shrunk by the same factor. What do you observe?',
            from: { lecture: 11, slides: ['Slide08Example2'] },
          },
          {
            id: 'level-curve-tangent',
            title: 'Gradient and level curves',
            caption:
              'The gradient of f: ℝ² → ℝ at a point <b>a</b> is perpendicular to the tangent line to the level curve through <b>a</b>, ∇f(<b>a</b>) · (<b>x</b> − <b>a</b>) = 0. Why? For <b>x</b> on the level curve near <b>a</b>, f(<b>x</b>) = f(<b>a</b>) and f(<b>x</b>) ≈ f(<b>a</b>) + ∇f(<b>a</b>) · (<b>x</b> − <b>a</b>), so ∇f(<b>a</b>) · (<b>x</b> − <b>a</b>) ≈ 0.',
            from: { lecture: 11, slides: ['Slide09Normal2D'] },
          },
        ],
      },
      {
        id: 'gradient-descent',
        title: 'Gradient descent',
        applets: [
          {
            id: 'fastest-increase',
            title: 'Direction of fastest increase',
            caption:
              '∇f(<b>a</b>) points towards the greatest increase of f, and −∇f(<b>a</b>) towards the greatest decrease (unless ∇f(<b>a</b>) = <b>0</b>). Why? For a unit vector <b>u</b> and t small, f(<b>a</b> + t<b>u</b>) ≈ f(<b>a</b>) + t ∇f(<b>a</b>) · <b>u</b>, and ∇f(<b>a</b>) · <b>u</b> = ‖∇f(<b>a</b>)‖ cos θ is largest for θ = 0 and smallest for θ = π.',
            from: { lecture: 11, slides: ['Slide13Steepest', 'Slide13bSteepestWhy'] },
          },
          {
            id: 'gradient-critical',
            title: 'At a critical point',
            caption:
              'When ∇f(<b>a</b>) = <b>0</b>, <b>a</b> is a critical point. Which way is the greatest increase there? In the gradient vector field of f(x, y) = x³ − 3x − y³ + 3y, how do the arrows behave around each kind of critical point?',
            from: { lecture: 11, slides: ['Slide13cCritical'] },
          },
          {
            id: 'descent',
            title: 'Gradient descent',
            caption:
              'To find the minimum of f, repeatedly replace <b>a</b> → <b>a</b> − t∇f(<b>a</b>); to find the maximum, use <b>a</b> → <b>a</b> + t∇f(<b>a</b>). In machine learning, t is called the learning rate. What happens for t = 0.01, 0.26 or 0.3?',
            from: { lecture: 11, slides: ['Slide18Descent'] },
          },
          {
            id: 'lombard',
            fun: true,
            title: 'How steep is Lombard Street?',
            caption:
              'E(x, y) = elevation on Russian Hill, San Francisco. The crooked block of Lombard Street winds down the hill in eight hairpin turns, built in 1922 to tame its 27% grade. Drag on the map to turn <b>u</b>: going in the direction <b>u</b>, the grade is ∇E · <b>u</b> = 27% · cos θ.',
            from: { lecture: 11, slides: ['Slide13bSteepestWhy', 'Slide14Lombard'] },
          },
          {
            id: 'crowd',
            fun: true,
            title: 'How do 300 units find their way?',
            caption:
              'In strategy games such as Supreme Commander 2, Flow Field Pathfinding computes D(x, y) = walking distance to the goal, and each unit moves in the direction −∇D. Click on the map to send the army somewhere else.',
            from: { lecture: 11, slides: ['Slide14bCrowd'] },
          },
          {
            id: 'raindrop',
            fun: true,
            title: 'Where does a raindrop go?',
            caption:
              'E(x, y) = elevation around Triple Divide Peak, Glacier National Park, Montana. A raindrop moves in the direction −∇E. Click on the map to drop one: which ocean does its water reach?',
            from: { lecture: 11, slides: ['Slide16Raindrop'] },
          },
          {
            id: 'digits',
            fun: true,
            title: 'An AI learns to read digits',
            caption:
              'An AI model is a function with billions of parameters (this tiny one has 7,850). It learns from lots of examples, inputs and their right outputs: gradient descent finds the parameters that make E, the error on the examples, smallest, as for the line of best fit. Draw a digit, then press Run.',
            from: { lecture: 11, slides: ['Slide19cAIIdea', 'Slide19bDigits'] },
          },
        ],
      },
      {
        id: 'constrained-optimization',
        title: 'Constrained optimization',
        applets: [
          {
            id: 'constrained-graph',
            title: 'A constrained optimization problem',
            caption:
              'Find the maximum or minimum of a function f(<b>x</b>) subject to a constraint g(<b>x</b>) = c. For f(x, y) = x³ + xy + y² subject to x² + y² = 2, they are the highest and lowest points of the graph above the circle (in red). Are they critical points of f?',
            from: { lecture: 12, slides: ['Slide01Title'] },
          },
          {
            id: 'curve-extrema',
            title: 'Maximum and minimum on a curve',
            caption:
              'The contour map of a function f(x, y), together with a curve C. Where are the global maximum and minimum of f on C? What do you observe there?',
            from: { lecture: 12, slides: ['Slide02bCurve'] },
          },
          {
            id: 'gradient-normal',
            title: 'Gradients of f and g',
            caption:
              'The gradient ∇f(<b>a</b>) of a function is perpendicular to the tangent line to the level curve through <b>a</b>. The curve g(<b>x</b>) = c is a level set of g, so its tangent line is perpendicular to ∇g(<b>a</b>), at least when the tangent line makes sense. Move <b>x</b> along the level curve f = 12 and <b>a</b> along C: what happens where they meet?',
            from: { lecture: 12, slides: ['Slide02dRecallNormal'] },
          },
          {
            id: 'gradient-zero',
            title: 'When ∇g(a) = 0',
            caption:
              'If ∇g(<b>a</b>) = <b>0</b>, the tangent line to the curve g = c at <b>a</b> may not make sense. Move <b>a</b> along each curve: what happens to ∇g(<b>a</b>) and to the tangent line at the origin?',
            from: { lecture: 12, slides: ['Slide02eGradZero'] },
          },
          {
            id: 'rainbow',
            fun: true,
            title: 'Why do rainbows form arcs?',
            caption:
              'Sunlight that enters a raindrop at an angle i bends to an angle r, with sin i = 1.33 sin r (Snell’s law), reflects inside the drop and leaves it at the angle θ = 4r − 2i to the sunlight. The light piles up near the largest θ: maximize θ subject to the physics law, and θ ≈ 42°, the same for every drop. So the bright drops lie on a cone of 42° around the line from the sun through your eye, which you see as an arc. Drag the drop along the bow.',
            from: { lecture: 12, slides: ['Slide01aProblems'] },
          },
        ],
      },
      {
        id: 'lagrange-multipliers',
        title: 'Lagrange multipliers',
        applets: [
          {
            id: 'lagrange',
            title: 'Lagrange multipliers',
            caption:
              'What is the local extremum of f on the curve C? What happens to ∇f and ∇g at the local extrema? Drag the point <b>a</b> to explore.',
            from: { lecture: 12, slides: ['Slide05Lagrange'] },
          },
          {
            id: 'circle-disk',
            title: 'On a circle and on a disk',
            caption:
              'To find the max/min of f constrained to g = c: compute ∇f and ∇g; find the points of g = c where ∇g = <b>0</b>; solve ∇f(<b>a</b>) = λ∇g(<b>a</b>), g(<b>a</b>) = c for <b>a</b> and λ; compare the values of f at the points found. Here f(x, y) = x² + 2y² + x − 1 subject to x² + y² = 1, and then on the disk D. Why is the minimum on D somewhere else?',
            from: { lecture: 12, slides: ['Slide08bDisk'] },
          },
          {
            id: 'can',
            title: 'The best shape for a can',
            caption:
              'Which cylindrical can holding 355 cm³ uses the least aluminum? Drag its radius r. A real Coke can is taller than the best one: why might that be?',
            from: { lecture: 12, slides: ['Slide09bCan'] },
          },
          {
            id: 'cusp',
            title: 'A minimum where ∇g = 0',
            caption:
              'Minimize f(x, y) = y subject to g(x, y) = x² − y³ = 0. The equations ∇f(<b>a</b>) = λ∇g(<b>a</b>) and g(<b>a</b>) = 0 have no solution. Where is the minimum, and why does Lagrange’s theorem still hold?',
            from: { lecture: 12, slides: ['Slide10Example3'] },
          },
          {
            id: 'electricity',
            fun: true,
            title: 'Interpretation of the Lagrange multiplier λ',
            caption: 'Why is electricity 3 times pricier at 6 pm than at noon?',
            from: { lecture: 12, slides: ['Slide12bLambda', 'Slide12cLambdaMeaning'] },
          },
        ],
      },
      {
        id: 'derivative-matrix',
        title: 'The derivative matrix',
        applets: [
          {
            id: 'arm-derivative',
            title: 'The derivative matrix of a robot arm',
            caption:
              'The derivative matrix (Df)(<b>a</b>) of f: ℝ<sup>n</sup> → ℝ<sup>m</sup> is the m × n matrix whose (i, j)-entry is ∂f<sub>i</sub>/∂x<sub>j</sub>(<b>a</b>): its i-th row is ∇f<sub>i</sub>(<b>a</b>). For <b>h</b> near <b>0</b>, f(<b>a</b> + <b>h</b>) ≈ f(<b>a</b>) + (Df)(<b>a</b>)<b>h</b>. Here f(θ<sub>1</sub>, θ<sub>2</sub>) is the position of the hand. Turning the shoulder by h<sub>1</sub> and the elbow by h<sub>2</sub> moves the hand by about h<sub>1</sub><b>c</b><sub>1</sub> + h<sub>2</sub><b>c</b><sub>2</sub>, where <b>c</b><sub>1</sub>, <b>c</b><sub>2</sub> are the columns of (Df)(θ<sub>1</sub>, θ<sub>2</sub>). What happens when the arm is straight?',
            from: { lecture: 13, slides: ['Slide13cRobotArm'] },
          },
          {
            id: 'vivid',
            fun: true,
            title: 'Nonlinear photo filters',
            caption:
              'Vivid adds color, then contrast. As a function f: ℝ³ → ℝ³ on colors it is not affine, but for colors <b>x</b> near a color <b>a</b>, f(<b>x</b>) ≈ f(<b>a</b>) + (Df)(<b>a</b>)(<b>x</b> − <b>a</b>), an affine filter. Drag the ring <b>a</b> across a photo: where does the linear approximation look like Vivid, and where not?',
            from: { lecture: 13, slides: ['Slide13dVivid'] },
          },
        ],
      },
      {
        id: 'chain-rule',
        title: 'The multivariable chain rule',
        applets: [
          {
            id: 'linear-nonlinear',
            title: 'Linear and nonlinear functions',
            caption:
              'The Linearity Principle: a linear function T: ℝ² → ℝ² takes the grid of squares to a grid of parallelograms, and the square with the letter F to a parallelogram. What does the nonlinear g do to them? Click a picture to play it again.',
            from: { lecture: 17, slides: ['Slide05LinearOrNot'] },
          },
          {
            id: 'zoom-in',
            title: 'Zooming in',
            caption:
              'Linear approximation: locally, any function is approximately multiplication by its derivative matrix. As the two pictures zoom in, what happens to the bent image of the square? Drag <b>x</b>: what does g(<b>x</b>) − g(<b>a</b>) turn into?',
            from: { lecture: 17, slides: ['Slide05aZoomOne'] },
          },
          {
            id: 'chain-zoom',
            title: 'Why does the chain rule hold?',
            caption:
              '<b>The multivariable chain rule.</b> If f: ℝ<sup>p</sup> → ℝ<sup>m</sup> and g: ℝ<sup>n</sup> → ℝ<sup>p</sup>, then (D(f ∘ g))(<b>a</b>) = (Df)(g(<b>a</b>)) (Dg)(<b>a</b>), an m × n matrix, the product of an m × p and a p × n matrix. Why? Zoomed in, g is multiplication by (Dg)(<b>a</b>) and f by (Df)(g(<b>a</b>)), so f ∘ g, one after the other, is multiplication by their product.',
            from: { lecture: 17, slides: ['Slide05bZoom'] },
          },
          {
            id: 'whiteout',
            title: 'Climber in a whiteout',
            caption:
              'When f: ℝ<sup>p</sup> → ℝ and g: ℝ → ℝ<sup>p</sup>, the chain rule gives (f ∘ g)′(t) = ∇f(g(t)) · g′(t). How fast is the climber climbing at time t? When does he reach the summit, which he cannot see?',
            from: { lecture: 17, slides: ['Slide11cWhiteout'] },
          },
          {
            id: 'mosquito',
            title: 'Mosquito in the hunt',
            caption:
              'At t = π, how fast is the temperature the mosquito feels changing? Is it on the right track? Drag the room to turn it.',
            from: { lecture: 17, slides: ['Slide12bMosquito'] },
          },
          {
            id: 'backpropagation',
            fun: true,
            title: 'Training an AI model',
            caption:
              'Training a model by gradient descent needs the derivative matrix of the composition f<sub>3</sub> ∘ f<sub>2</sub> ∘ f<sub>1</sub>, a product of three derivative matrices by the chain rule. Why is it so much faster to multiply them from the left?',
            from: { lecture: 17, slides: ['Slide12cAI'] },
          },
        ],
      },
    ],
  },
];

export const SECTIONS = AREAS.flatMap((a) => a.sections.map((s) => ({ ...s, area: a.title })));
export const APPLETS = SECTIONS.flatMap((s) => s.applets);
