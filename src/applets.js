/*
 * The applets, by subject and concept. Each section (concept) is a page of its own, at
 * /calculus-applets/<section id>/; the first one is the front page, /calculus-applets/. For each
 * applet:
 *   id       anchor on the page, and the name of its module, src/viz/<id>.jsx
 *   title    heading
 *   caption  under the heading (HTML): a question to think about, or what the picture cannot say.
 *            Its math is TeX between dollar signs, typeset by KaTeX with the decks' macros
 *            (src/site/caption.js), so a caption with math is a raw string, r`… $\vv v_1$ …`
 *   fun      true for the motivation that students do not need to know; it goes at the bottom of
 *            the page, under "Motivation – just for fun!"
 *   group    a heading that applets next to each other share, e.g. two pictures of one idea; they go
 *            under it, and the contents list it once
 *   from     the lecture-deck slides the visualization is taken from; `npm run sync` copies them
 *            (and everything they import) into src/lectures/l<N>/. Not shown on the page. `slides`
 *            is empty for a figure drawn for the page with the deck's components.
 */

// a caption with TeX in it: its backslashes stay backslashes
const r = String.raw;

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
              r`Every color on a screen is a mix of red, green and blue light: a linear combination of the three vectors $\vv R$, $\vv G$ and $\vv B$.`,
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
              r`Data points $(x_i, y_i)$ give vectors $\vv X = (x_1, \dots, x_n)$ and $\vv Y = (y_1, \dots, y_n)$. The correlation is <span style="white-space: nowrap">$r = \vv X \cdot \vv Y / (\norm{\vv X} \, \norm{\vv Y}) = \cos\theta$</span>, where the $x_i$ and the $y_i$ each average to 0.`,
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
            caption: r`What do the points $\vv p + t\vv v$ trace out as $t$ runs through all numbers?`,
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
              r`Every bolt flies along a line $\vv p + t\vv v$ and every roof is a plane $\vv n \cdot \vv x = d$. Aim with the mouse and click to fire.`,
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
            caption: r`A subspace contains $\vv 0$ and every combination of its vectors.`,
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
            caption: r`Which point of the line is closest to $\vv x$?`,
            from: { lecture: 5, slides: ['Slide14ClosestPoint'] },
          },
          {
            id: 'projection-plane',
            title: 'Projection onto a plane',
            caption: r`How do we find the point of a plane closest to $\vv x$?`,
            from: { lecture: 5, slides: ['Slide18ProjectionTheorem', 'Slide19ProjectionProperties'] },
          },
          {
            id: 'sum-of-projections',
            title: 'A vector is the sum of its projections',
            caption: r`This works only when $\vv v_1$ and $\vv v_2$ are orthogonal.`,
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
              r`The errors $e_i = y_i - (mx_i + b)$ are the vertical gaps between the data points and the line $y = mx + b$. The line of best fit makes $e_1^2 + \cdots + e_n^2$ as small as possible.`,
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
              r`A scalar-valued function $f(x_1, \dots, x_n)$ is affine if $f(\vv x) = a_1x_1 + \cdots + a_nx_n + b$ for some scalars $a_1, \dots, a_n, b$, and linear if $f(\vv x) = a_1x_1 + \cdots + a_nx_n$. Linear functions are affine; affine functions need not be linear. How can you tell from the graph of a function of two variables?`,
            from: { lecture: 13, slides: ['Slide02Linear'] },
          },
          {
            id: 'linear-maps',
            title: 'Linear and affine vector-valued functions',
            caption:
              r`A vector-valued function is affine if all its component functions are affine, and linear if all its component functions are linear. To see a function $\mathbb R^2 \to \mathbb R^2$, put a photo in the plane and move each point $\vv x$ to $f(\vv x)$. What happens to straight lines, and to $\vv 0$? The third function sends $\vv 0$ to $\vv 0$: why is it not linear?`,
            from: { lecture: 13, slides: ['Slide02cGrids'] },
          },
          {
            id: 'matrix-columns',
            title: 'The columns of A',
            caption:
              r`A function $f\colon \mathbb R^n \to\nobreak \mathbb R^m$ is linear precisely when $f(\vv x) = A\vv x$ for some $m \times n$ matrix $A$, and then the columns of $A$ are $f(\vv e_1), \dots, f(\vv e_n)$, where $\vv e_j$ is the $j$-th standard basis vector of $\mathbb R^n$. Why? $A\vv e_j = 0\vv c_1 + \cdots + 1\vv c_j + \cdots + 0\vv c_n = \vv c_j$. Can you read $A$ off the picture of $f$?`,
            from: { lecture: 13, slides: ['Slide09Columns'] },
          },
          {
            id: 'photo-filters',
            fun: true,
            title: 'How does a photo editor apply a filter?',
            caption:
              r`A color photo consists of many pixels, and each pixel is a 3-vector $\vv x = (R, G, B)$. A filter does the same to every pixel: it is a function on these 3-vectors. Click a filter. Click the photo to zoom in there, and a pixel in the block to make it $\vv x$.`,
            from: { lecture: 13, slides: ['Slide01aFilters'] },
          },
          {
            id: 'own-filter',
            fun: true,
            title: 'Photo filters as linear functions',
            caption:
              r`Sepia is linear, so it maps each pixel to a matrix-vector product. The columns of its matrix are the colors that pure red, green and blue become, and the new color mixes them in the amounts $R$, $G$ and $B$. Drag the ring across a photo. Click a square under “Make your own filter” to choose what red, green or blue becomes.`,
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
              r`A <b>linear transformation</b> is another name for a linear function. A linear transformation $f$ satisfies $f(c_1\vv v_1 + c_2\vv v_2) = c_1f(\vv v_1) + c_2f(\vv v_2)$ for all scalars $c_1, c_2$ and vectors $\vv v_1, \vv v_2$. Where do $\vv e_1 + \vv e_2$, $2\vv e_1$ and $2\vv e_1 + \vv e_2$ go? Click one to see.`,
            from: { lecture: 14, slides: ['Slide02aLinearity'] },
          },
          {
            id: 'tiling',
            title: 'The Tiling Principle',
            caption:
              r`Let $f\colon \mathbb R^2 \to\nobreak \mathbb R^2$ be linear, $f(\vv x) = A\vv x$, with $f(\vv e_1)$ and $f(\vv e_2)$ not scalar multiples of each other. $f$ transforms the tiling of $\mathbb R^2$ by copies of the unit square $S$ into a tiling of $\mathbb R^2$ by copies of its image $f(S)$, a parallelogram. Drag the point $\vv s = a\vv e_1 + b\vv e_2$ of $S$, or $f(\vv s)$. Where does the copy of $S$ to its right (green) go, and why?`,
            from: { lecture: 14, slides: ['Slide02bTiling'] },
          },
          {
            id: 'collapse',
            title: 'When f(e₁) and f(e₂) are scalar multiples',
            caption:
              r`What if $f(\vv e_2) = 2f(\vv e_1)$, say? Swing $f(\vv e_2)$ onto $2f(\vv e_1)$, then drag the point $\vv s$ around $S$. Where can $f(\vv s)$ be? Does $f(S)$ tile $\mathbb R^2$?`,
            from: { lecture: 14, slides: ['Slide02cCollapse'] },
          },
          {
            id: 'linear-or-not',
            title: 'Linear or not?',
            caption:
              r`The Linearity Principle: a function $f\colon \mathbb R^n \to\nobreak \mathbb R^m$ is linear precisely when $f(\vv x + \vv y) = f(\vv x) + f(\vv y)$ and $f(c\vv x) = c f(\vv x)$ for any $n$-vectors $\vv x$, $\vv y$ and any scalar $c$. Each picture moves the grid, the unit square and the F in it to their images under a function $\mathbb R^2 \to \mathbb R^2$, and back. Which of these functions are linear?`,
            from: { lecture: 14, slides: ['Slide05bLinearOrNot'] },
          },
          {
            id: 'rotations-linear',
            title: 'Rotations are linear',
            caption:
              r`$R_\theta(\vv v)$ is the rotation of $\vv v$ counterclockwise by $\theta$ around $\vv 0$. Why are $R_\theta(\vv v + \vv w) = R_\theta(\vv v) + R_\theta(\vv w)$ and $R_\theta(c\vv v) = cR_\theta(\vv v)$? Click one to build it both ways: first the left side, then the right side. Drag $\theta$.`,
            from: { lecture: 14, slides: ['Slide07Rotations'] },
          },
          {
            id: 'rotation-matrix',
            title: 'The matrix of a rotation',
            caption:
              r`The columns of the matrix of $R_\theta$ are $R_\theta(\vv e_1)$ and $R_\theta(\vv e_2)$, where $\vv e_1$ and $\vv e_2$ go. What is the matrix of the rotation by $\pi/2$? By $\pi/4$? Work it out, then drag $\theta$ there.`,
            from: { lecture: 14, slides: ['Slide07bRotationMatrix'] },
          },
          {
            id: 'axis-rotations',
            title: 'Rotations around the coordinate axes',
            caption:
              r`The rotation of $\mathbb R^3$ by $\theta$ around the $z$-axis turns the $xy$-plane by $\theta$ and leaves $\vv e_3$ where it is. The columns of its matrix $R_z(\theta)$ are where $\vv e_1$, $\vv e_2$ and $\vv e_3$ go (in red). Why is the $-\sin\theta$ of $R_y(\theta)$ below the diagonal, and not above it as in $R_x(\theta)$ and $R_z(\theta)$? Drag a picture to turn it.`,
            from: { lecture: 14, slides: ['Slide10Axes'] },
          },
          {
            id: 'projection-matrix',
            title: 'The matrix of a projection',
            caption:
              r`For a nonzero $n$-vector $\vv w$, $\operatorname{Proj}_{\vv w}\colon \mathbb R^n \to\nobreak \mathbb R^n$ is a linear function, because $\operatorname{Proj}_{\vv w}(a\vv v_1 + b\vv v_2) = a\operatorname{Proj}_{\vv w}(\vv v_1) + b\operatorname{Proj}_{\vv w}(\vv v_2)$. For $\vv w = (1, 2)$, what is its matrix?`,
            from: { lecture: 14, slides: ['Slide11Projections'] },
          },
          {
            id: 'transformations-r2',
            title: 'Linear transformations of ℝ²',
            caption:
              r`Each picture shows a linear transformation of $\mathbb R^2$ by what it does to the unit square $S$, with an F in it to show which way round its image is. Linear transformations preserve $\vv 0$ and parallelograms, and might “collapse” or “flip” stuff. Can you read each matrix off its picture?`,
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
              r`Let $A$ be an $m \times n$ matrix and $B$ an $n \times p$ matrix, $T_A(\vv x) = A\vv x$ and $T_B(\vv x) = B\vv x$. Then $T_A \circ T_B$ is a linear transformation, $(T_A \circ T_B)(\vv x) = A(B\vv x)$, and its matrix is the <b>matrix product</b> $AB$: column $j$ of $AB$ is $A\vv b_j$, where $\vv b_j$ is column $j$ of $B$, so the $(i, j)$-entry of $AB$ is (row $i$ of $A$) $\cdot$ (column $j$ of $B$). Click an entry of $AB$. Why can we multiply an $m \times n$ and a $p \times q$ matrix only when $n = p$?`,
            from: { lecture: 14, slides: ['Slide14Computing'] },
          },
          {
            id: 'order-matters',
            title: 'Order matters',
            caption:
              r`$R_1$ turns the ball 90° around the $z$-axis, and $R_2$ 90° around the $y$-axis. Turn it by $R_1$, then $R_2$ (top), or by $R_2$, then $R_1$ (bottom): is $R_2 \circ R_1 = R_1 \circ R_2$? Try it with a ball of your own.`,
            from: { lecture: 14, slides: ['Slide18Order'] },
          },
          {
            id: 'order-algebra',
            title: 'The algebra behind',
            caption:
              r`$A$ and $B$ are the matrices of $R_1$ and $R_2$, so $R_2 \circ R_1$ has matrix $BA$, and $R_1 \circ R_2$ has matrix $AB$: $AB \ne BA$. The face looks along $\vv e_1$ and the stem along $\vv e_3$: where does each rotation send them? Find those vectors in the columns of $A$ and $B$.`,
            from: { lecture: 14, slides: ['Slide18bMatrices'] },
          },
          {
            id: 'rotations-commute',
            title: 'Rotations of ℝ² commute',
            caption:
              r`Unlike rotations of $\mathbb R^3$, rotations of the plane commute: turning by $\alpha$, then by $\beta$, is turning by $\alpha + \beta$, either way round. So the product of the matrices of $R_\beta$ and $R_\alpha$ is the matrix of $R_{\alpha+\beta}$. Which formulas from trigonometry does that give?`,
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
              r`The <b>sum</b> $A + B$ of two $m \times n$ matrices adds their entries, and the linear functions associated to $A$, $B$ and $A + B$ satisfy $T_{A+B}(\vv x) = T_A(\vv x) + T_B(\vv x)$. Here $A$ is a shear and $B$ the rotation by 90°. Drag $\vv x$: where is $(A + B)\vv x$, compared with $A\vv x$ and $B\vv x$?`,
            from: { lecture: 15, slides: ['Slide04SumMaps'] },
          },
          {
            id: 'scalar-maps',
            title: 'What cA does',
            caption:
              r`The <b>scalar multiple</b> $cA$ multiplies every entry of $A$ by $c$, and $T_{cA}(\vv x) = cT_A(\vv x)$. Drag $\vv x$, and move $c$: where is $(cA)\vv x$ when $c$ is negative? When $c = 0$?`,
            from: { lecture: 15, slides: ['Slide04bScalarMaps'] },
          },
          {
            id: 'associativity',
            title: 'Multiplication is associative',
            caption:
              r`$(AB)C = A(BC)$ for any matrices $A$ ($m \times n$), $B$ ($n \times p$) and $C$ ($p \times k$). Why? $BC$ is the matrix of $T_B \circ T_C$, so $A(BC)$ is the matrix of $T_A \circ T_{BC}$, and $(AB)C$ is the matrix of $T_{AB} \circ T_C$. Where does each one send $\vv x$ in $\mathbb R^k$? Click a shortcut to draw it.`,
            from: { lecture: 15, slides: ['Slide08Associative'] },
          },
          {
            id: 'order-cost',
            title: 'Which order is faster?',
            caption:
              r`By associativity, $(AB)C$ and $A(BC)$ are the same matrix, but they take different amounts of work. Each entry of the product of a $p \times q$ and a $q \times s$ matrix takes $q$ multiplications. Click a product to count its multiplications: which way round is faster here, and why?`,
            from: { lecture: 15, slides: ['Slide08bOrder'] },
          },
          {
            id: 'order-race',
            title: 'How much faster?',
            caption:
              r`For $n \times n$ matrices $A$ and $B$ and an $n \times 1$ matrix $C$, computing $(AB)C$ takes $n^3 + n^2$ multiplications, and $A(BC)$ takes $2n^2$. Move $n$: how long does each take, at a billion multiplications a second?`,
            from: { lecture: 15, slides: ['Slide08cRace'] },
          },
          {
            id: 'no-cancellation',
            title: 'No cancellation law',
            caption:
              r`For numbers, $ab = ac$ with $a \ne 0$ gives $b = c$, but for matrices $AB = AC$ does not imply $B = C$. Here $B$ turns $\vv x$ to $B\vv x$, $C$ flips it to $C\vv x$, and then $A$ squashes the plane onto the $x$-axis. Drag $\vv x$: why is $A(B\vv x) = A(C\vv x)$ for every $\vv x$? Write down $A$, $B$ and $C$, and check that $AB = AC$.`,
            from: { lecture: 15, slides: ['Slide09Cancellation'] },
          },
          {
            id: 'order-uses',
            title: 'Neural networks and video games',
            fun: true,
            caption:
              r`Training a neural network runs vectors through its layers, forward to a prediction and back (backpropagation), each layer a matrix: products like $A(BC)$, with $C$ a vector, for a huge $n$. A video game applies the same three $4 \times 4$ matrices to a million points $\vv x$, the corners of its blocks: it computes $ABC$ once (128 multiplications), then 16 per point, against 48 per point for $A(B(C\vv x))$.`,
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
              r`A <b>scaling</b> $S(x_1, x_2) = (d_1x_1, d_2x_2)$ multiplies $x_1$ by $d_1$ and $x_2$ by $d_2$. The columns of its matrix are $S(\vv e_1)$ and $S(\vv e_2)$: what is the matrix of each of these four? Click a picture to check.`,
            from: { lecture: 15, slides: ['Slide02dScaling'] },
          },
          {
            id: 'diagonal-maps',
            title: 'What diagonal matrices do',
            caption:
              r`The <b>diagonal</b> of an $m \times n$ matrix $A$ consists of its entries $a_{ii}$, and $A$ is <b>diagonal</b> if all its other entries are zero. A diagonal $2 \times 2$ matrix is a scaling, but $d_1$ and $d_2$ can be negative or zero. Click a matrix, or move $d_1$ and $d_2$: which ones stretch, reflect or project the plane?`,
            from: { lecture: 15, slides: ['Slide12DiagonalMaps'] },
          },
          {
            id: 'diagonal-products',
            title: 'Multiplying by a diagonal matrix',
            caption:
              r`$A = \operatorname{diag}(2, 1)$ doubles $x_1$. Watch $T_A \circ T_B$ (first $B$, then $A$) and $T_B \circ T_A$ (first $A$, then $B$) move the unit square, $\vv e_1$ and $\vv e_2$. Why does $AB$ double the first row of $B$, and $BA$ its first column? What do $DA$ and $AD$ do for any diagonal $D$?`,
            from: { lecture: 15, slides: ['Slide13cExample1Maps'] },
          },
          {
            id: 'triangular',
            title: 'Triangular matrices',
            caption:
              r`A matrix is <b>upper triangular</b> when its only nonzero entries are on or above its diagonal, and <b>lower triangular</b> when they are on or below it. The shears $\left[\begin{smallmatrix} 1 & 1 \\ 0 & 1 \end{smallmatrix}\right]$ and $\left[\begin{smallmatrix} 1 & 0 \\ 1 & 1 \end{smallmatrix}\right]$ are triangular: which way does each one push the unit square?`,
            from: { lecture: 15, slides: ['Slide16Triangular'] },
          },
          {
            id: 'triangular-products',
            title: 'Products of triangular matrices',
            caption:
              r`The product of two upper triangular matrices is upper triangular, and the product of two lower triangular matrices is lower triangular. Why? Point at an entry of $UV$ below its diagonal: why does each term of (row $i$ of $U$) $\cdot$ (column $j$ of $V$) have a factor 0?`,
            from: { lecture: 15, slides: ['Slide17TriangularProducts'] },
          },
          {
            id: 'adding-rows',
            title: 'Adding rows and columns',
            caption:
              r`Each $E$ is the identity matrix with one more entry $c$. Before you click $EA$ or $AE$ to compute it, guess: what does multiplying by $E$ on the left do to the rows of $A$? On the right, to its columns?`,
            from: { lecture: 15, slides: ['Slide18bAddRows'] },
          },
          {
            id: 'row-operations',
            title: 'Row and column operations',
            caption:
              r`Multiplying $A$ on the left does <b>row operations</b> on $A$; multiplying on the right does <b>column operations</b>. Here $D$ is diagonal and $E$ adds a multiple of one row or column to another. Click a product to compute it: which operation does it do?`,
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
              r`Let $\vv n_k = (A_k, B_k, C_k)$ be the numbers of birds on islands A, B, C after $k$ years. Then $\vv n_{k+1} = M\vv n_k$ for this $M$, so $\vv n_k = M^k\vv n_0$. Which sums of $M$ must be 1: each row sum, each column sum, or the sum of all its entries? Click a column of $M$: whose birds does it follow?`,
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
              r`Back to the first migration, where no bird leaves island C. Its matrix $M$ is a <b>Markov matrix</b>: a square matrix with non-negative entries, where the entries in each column add up to 1. Let $\vv p_k$ be the fractions of the birds on islands A, B, C after $k$ years, a <b>probability vector</b> (its entries are non-negative and add up to 1): $\vv p_0 = (\tfrac13, \tfrac13, \tfrac13)$ and $\vv p_k = M^k\vv p_0$. Click the calendar for the next year: what happens to $M^k$ and $\vv p_k$?`,
            from: { lecture: 16, slides: ['Slide08dAllOnCLong'] },
          },
          {
            id: 'casino',
            fun: true,
            title: 'A night at the casino',
            caption:
              r`You walk in with \$40, hoping to leave with \$100, and bet \$20 on red at each spin of a fair roulette wheel (3 of its 6 pockets are red), until you have \$100 or nothing. Play a few nights: what is the chance that you leave with \$100?`,
            from: { lecture: 16, slides: ['Slide17bCasino'] },
          },
          {
            id: 'gamblers-ruin',
            fun: true,
            title: 'Gambler’s ruin',
            caption:
              r`Your money, \$0 to \$100, is the state of a Markov chain: at each spin it goes up \$20 with probability $\tfrac12$ (red) and down \$20 with probability $\tfrac12$ (black), and at \$0 or \$100 the game is over. With its Markov matrix $M$, the probabilities $\vv p(n)$ that you have \$0, \$20, …, \$100 after $n$ spins are $\vv p(n) = M^n\vv p(0)$.`,
            from: { lecture: 16, slides: ['Slide18Gambler'] },
          },
          {
            id: 'leave-with-100',
            fun: true,
            title: 'Do you leave with $100?',
            caption:
              r`Step through the spins: where do the probabilities $\vv p(n) = M^n\vv p(0)$ go as $n$ grows? Then change your goal: how does your chance of reaching it change?`,
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
              r`<b>Theorem.</b> If $M$ is a Markov matrix where $M^a$ has all positive entries for some positive integer $a$, then $M^k \to \begin{bmatrix} \vv u & \vv u & \cdots & \vv u \end{bmatrix}$ as $k \to \infty$, where $\vv u$ is the unique probability vector with $M\vv u = \vv u$, the <b>equilibrium vector</b> (or <b>stationary vector</b>) of $M$. Here $M$ is the textbook’s migration, and $M^2$ has all positive entries. Step $k$: what happens to the columns of $M^k$? Check that $M\vv u = \vv u$.`,
            from: { lecture: 16, slides: ['Slide10Equilibrium'] },
          },
          {
            id: 'initial-distribution',
            title: 'Independence of the initial distribution',
            caption:
              r`In the long run, the fractions of the birds on islands A, B, C are the entries of $\vv u = (2/7, 2/7, 3/7)$. Click an island to start all 30,000 birds there: where do the numbers settle? Why does $M^k \to \begin{bmatrix} \vv u & \cdots & \vv u \end{bmatrix}$ give $\vv p_k = M^k\vv p_0 \to \vv u$ for any initial probability vector $\vv p_0$?`,
            from: { lecture: 16, slides: ['Slide11PollLimit'] },
          },
          {
            id: 'why-positive',
            title: 'Why all positive entries?',
            caption:
              r`The theorem needs a power of $M$ with all positive entries. No power of $M$ has all positive entries in these two Markov chains: what goes wrong in each? Think first, then click to check. And the first migration, where no bird leaves island C: is it irreducible? Does $M^k$ have a limit anyway?`,
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
              r`Google’s PageRank (Larry Page and Sergey Brin, 1998) models the random surfer by a Markov chain. Here 300 surfers click at once, all on Math 51 at first, and each page’s bar shows its entry of $\vv p_k = M^k\vv p_0$. Click a page to start them all there: where do the bars settle? Google ranks the pages by the entries of the stationary vector $\vv u$.`,
            from: { lecture: 16, slides: ['Slide13PageRank'] },
          },
          {
            id: 'shuffles',
            fun: true,
            title: 'How many times should we shuffle a deck of cards?',
            caption:
              r`A riffle shuffle cuts the deck in about half and interleaves the two packets. The $52! \approx 8 \times 10^{67}$ orders of the deck are the states of a Markov chain, whose stationary vector makes every order equally likely. Shuffle the rainbow deck: when does it look mixed? Bayer and Diaconis (Stanford, 1992) computed how far $k$ shuffles are from perfectly mixed.`,
            from: { lecture: 16, slides: ['Slide14Shuffles'] },
          },
        ],
      },
      {
        id: 'inverses',
        title: 'Matrix inverses',
        applets: [
          {
            id: 'undo-life',
            title: 'Which can be undone?',
            caption:
              'A transformation is <b>invertible</b> if it can be undone. Which of these three can be undone? Think first, then click a picture to check.',
            from: { lecture: 18, slides: ['Slide02aLife'] },
          },
          {
            id: 'invertible-or-not',
            title: 'Invertible or not?',
            caption:
              r`A linear transformation $T\colon \mathbb R^n \to\nobreak \mathbb R^n$ is <b>invertible</b> (think: “reversible”) if there exists a linear transformation $S\colon \mathbb R^n \to\nobreak \mathbb R^n$ for which $S \circ T$ and $T \circ S$ are both the identity function. Which of these six are invertible, and what is $S$ for each? Think first, then click a picture to check.`,
            from: { lecture: 18, slides: ['Slide02bUndo', 'Slide03Invertible'] },
          },
          {
            id: 'inverse-matrix',
            title: 'The inverse of a matrix',
            caption:
              r`An $n \times n$ matrix $A$ is <b>invertible</b> if there exists an $n \times n$ matrix $B$ for which $AB = BA = I_n$. Then $B$ is called the <b>inverse</b> of $A$, written $A^{-1}$. Watch the rotation by 90° and the reflection across the $y$-axis, each undone: why is the reflection its own inverse? One side is enough: if $AB = I_n$, then $BA = I_n$ too.`,
            from: { lecture: 18, slides: ['Slide04aInverseName', 'Slide04bNotAll'] },
          },
          {
            id: 'not-invertible',
            title: 'Not all square matrices are invertible',
            caption:
              r`Every real number $a \ne 0$ has an inverse $1/a$, but not every matrix $A \ne 0$ has one. Here $T_A$ takes two points to the same point: why can no $T_B$ bring F back?`,
            from: { lecture: 18, slides: ['Slide04bNotAll'] },
          },
          {
            id: 'one-sided',
            title: 'Only square matrices can be invertible',
            caption:
              r`A linear transformation $T\colon \mathbb R^n \to\nobreak \mathbb R^m$ cannot be invertible when $n \ne m$, even though a one-sided inverse might exist. Here $T_A$ lifts the plane $\mathbb R^2$ onto a plane in $\mathbb R^3$, and $T_B$ squashes $\mathbb R^3$ straight down onto $\mathbb R^2$. Why does $T_B \circ T_A$ bring every point back, but not $T_A \circ T_B$?`,
            from: { lecture: 18, slides: ['Slide04cCaution'] },
          },
          {
            id: 'inverse-formula',
            title: 'The inverse of a 2 × 2 matrix',
            caption:
              r`The <b>determinant</b> of a $2 \times 2$ matrix $A = \left[\begin{smallmatrix} a & b \\ c & d \end{smallmatrix}\right]$ is $\det(A) = ad - bc$. If $\det(A) \ne 0$, then $A$ is invertible and $A^{-1} = \frac{1}{ad - bc}\left[\begin{smallmatrix} d & -b \\ -c & a \end{smallmatrix}\right]$; if $\det(A) = 0$, then $A$ is not invertible. Take the three steps one by one: why does it fail when $ad - bc = 0$?`,
            from: { lecture: 18, slides: ['Slide07Determinant'] },
          },
          {
            id: 'determinant-area',
            title: 'Determinant and area',
            caption:
              r`A linear transformation $T_A(\vv x) = A\vv x$ “stretches” things: it takes the unit square to a parallelogram with area $|\det(A)|$. Pick an example, or drag the tips of $A\vv e_1$ and $A\vv e_2$: when is the area 0, and why is $A$ then not invertible?`,
            from: { lecture: 18, slides: ['Slide08Area'] },
          },
          {
            id: 'diagonal-inverse',
            title: 'Inverse of a diagonal matrix',
            caption:
              r`If $A$ is diagonal with diagonal entries $a_1, \dots, a_n$, all nonzero, then $A^{-1}$ is diagonal with diagonal entries $1/a_1, \dots, 1/a_n$. If some $a_i = 0$, then $A$ is not invertible. Why?`,
            from: { lecture: 18, slides: ['Slide09Diagonal'] },
          },
          {
            id: 'socks-shoes',
            title: 'Socks and shoes',
            caption:
              r`If $A$ and $B$ are invertible $n \times n$ matrices, then so is $AB$, and $(AB)^{-1} = B^{-1}A^{-1}$. First the sock ($B$), then the shoe ($A$): in which order do they come off? Step through it.`,
            from: { lecture: 18, slides: ['Slide14Socks'] },
          },
          {
            id: 'systems',
            title: 'Solving systems of linear equations',
            caption:
              r`A system of $n$ linear equations in $n$ unknowns can be written as $A\vv x = \vv b$, where $A$ is an $n \times n$ matrix. If $A$ is invertible, $A\vv x = \vv b$ has exactly one solution, $\vv x = A^{-1}\vv b$; if not, it has no solution or infinitely many, depending on $\vv b$. What is $\det(A)$ for each of these three systems, and how many solutions does each have? Think first, then click a picture to check.`,
            from: { lecture: 18, slides: ['Slide12Systems'] },
          },
        ],
      },
      {
        id: 'linear-independence',
        title: 'Linear independence',
        applets: [
          {
            id: 'redundancies',
            title: 'Examples of redundancies',
            caption:
              'A vector in a collection is <b>redundant</b> if it is in the span of the others: removing it leaves the same span. Which vector is redundant in each of these three collections? Think first, then click to check. Drag a picture to turn it.',
            from: { lecture: 20, slides: ['Slide01bRedundancies'] },
          },
          {
            id: 'independence',
            title: 'Linear independence',
            caption:
              r`A collection of vectors $\vv v_1, \dots, \vv v_k$ is <b>linearly dependent</b> precisely when there are scalars $c_1, \dots, c_k$ that are <b>not all zero</b> for which $c_1\vv v_1 + c_2\vv v_2 + \cdots + c_k\vv v_k = \vv 0$. Otherwise it is <b>linearly independent</b>. How does each redundancy below turn into such a combination? Think first, then click to check.`,
            from: { lecture: 20, slides: ['Slide02Independence'] },
          },
          {
            id: 'to-basis',
            title: 'From a spanning set to a basis',
            caption:
              r`A collection $\vv v_1, \dots, \vv v_k$ is a <b>basis</b> of $V$ precisely when it is linearly independent and a spanning set of $V$. Starting from four vectors spanning the plane $V$, why can we keep removing a vector, without changing the span, until the rest are linearly independent? Step through it.`,
            from: { lecture: 20, slides: ['Slide02aToBasis'] },
          },
          {
            id: 'dependent-r2',
            title: 'Linear dependence in ℝ²',
            caption:
              r`Each of these collections in $\mathbb R^2$ is linearly dependent: a combination with coefficients not all zero gives $\vv 0$. Which vector is redundant in each, and which basis is left once it is removed? Think first, then click to check.`,
            from: { lecture: 20, slides: ['Slide02bDependentExamples'] },
          },
          {
            id: 'dependent-r3',
            title: 'Linear dependence in ℝ³',
            caption:
              r`Each of these collections in $\mathbb R^3$ is linearly dependent. Which vector is redundant in each, and which basis is left once it is removed? In the middle one, why can’t $\vv v_3$ be the one removed? Think first, then click to check. Drag a picture to turn it.`,
            from: { lecture: 20, slides: ['Slide02cDependentR3'] },
          },
        ],
      },
      {
        id: 'gram-schmidt',
        title: 'The Gram–Schmidt process',
        applets: [
          {
            id: 'two-vectors',
            title: 'Making two vectors orthogonal',
            caption:
              r`For nonzero vectors $\vv v_1$ and $\vv v_2$ in $\mathbb R^n$, $\vv w_2 = \vv v_2 - \operatorname{Proj}_{\vv v_1} \vv v_2$ is orthogonal to $\vv v_1$, and $\operatorname{span}\{\vv v_1, \vv w_2\} = \operatorname{span}\{\vv v_1, \vv v_2\}$. Why does sliding the tip of $\vv v_2$ parallel to $\vv v_1$ keep the span the same? And what if $\vv v_2$ is a multiple of $\vv v_1$?`,
            from: { lecture: 20, slides: ['Slide07bTwoVectors'] },
          },
          {
            id: 'gram-schmidt',
            title: 'The Gram–Schmidt process',
            caption:
              r`Goal: make a collection of nonzero vectors $\vv v_1, \dots, \vv v_k$ orthogonal. Let $V_i = \operatorname{span}\{\vv v_1, \dots, \vv v_i\}$. Let $\vv w_1 = \vv v_1$, and at each step $\vv w_i = \vv v_i - \operatorname{Proj}_{V_{i-1}} \vv v_i$. The resulting nonzero vectors $\vv w_i$ form an orthogonal basis of $V = V_k$. Watch the idea, then step through it: why is each $\vv w_i$ orthogonal to the ones before?`,
            from: { lecture: 20, slides: ['Slide09GramSchmidt'] },
          },
          {
            id: 'gs-projection',
            title: 'The projection at each step',
            caption:
              r`At each step of the Gram–Schmidt process, $\vv w_i = \vv v_i - \operatorname{Proj}_{V_{i-1}} \vv v_i$. To compute such a projection, use the <b>orthogonal projection formula</b>: if $\vv w_1, \dots, \vv w_m$ is an orthogonal basis of $V$, then $\operatorname{Proj}_V \vv v = \operatorname{Proj}_{\vv w_1} \vv v + \cdots + \operatorname{Proj}_{\vv w_m} \vv v$. Drag the picture to turn $\vv w_2$: why do the two projections add up to $\operatorname{Proj}_V \vv v$ only when $\vv w_1$ and $\vv w_2$ are orthogonal?`,
            from: { lecture: 21, slides: ['Slide01eGSProjection'] },
          },
          {
            id: 'detects-dependence',
            title: 'Gram–Schmidt detects linear dependence',
            caption:
              r`In the Gram–Schmidt process, $\vv w_i = \vv 0$ exactly when $\vv v_i$ is redundant, that is, a linear combination of $\vv v_1, \dots, \vv v_{i-1}$. So the nonzero $\vv w_i$’s form an orthogonal basis of $V$, $\dim V$ is the number of nonzero $\vv w_i$’s, and $\vv v_1, \dots, \vv v_k$ are linearly independent exactly when all the $\vv w_i$ are nonzero. Lower $\vv v_3$ into $V_2$: what happens to $\vv w_3$, and why?`,
            from: { lecture: 20, slides: ['Slide13Detects'] },
          },
          {
            id: 'five-vectors',
            title: 'Gram–Schmidt finds the redundant vectors',
            caption:
              r`Run the Gram–Schmidt process on five vectors spanning $V$: here $\vv w_2$ and $\vv w_4$ come out $\vv 0$. Which of the $\vv v_i$ are redundant? Which vectors form a basis of $V$, and which an orthogonal basis? Step through it.`,
            from: { lecture: 20, slides: ['Slide13Detects'] },
          },
          {
            id: 'orthogonal-complement',
            title: 'Orthogonal complement',
            caption:
              r`The <b>orthogonal complement</b> of a linear subspace $V$ of $\mathbb R^n$ is $V^\perp = \{\vv x \in \mathbb R^n : \vv x \cdot \vv v = 0 \text{ for all } \vv v \in V\}$. It is a linear subspace of $\mathbb R^n$, $\dim V^\perp = n - \dim V$, and $(V^\perp)^\perp = V$. Here $V_1 = \operatorname{span}\{(1, 2, 3), (4, 5, 6)\}$, a plane: why is $V_1^\perp$ the line through $(1, -2, 1)$? Step through it, and drag the picture to turn it.`,
            from: { lecture: 20, slides: ['Slide15Complement'] },
          },
        ],
      },
      {
        id: 'transpose',
        title: 'Matrix transpose',
        applets: [
          {
            id: 'rotation-inverse',
            title: 'Inverse of a rotation',
            caption:
              r`$R_\theta$, the rotation by $\theta$ counterclockwise, is invertible: $R_\theta^{-1}$ rotates back by $\theta$. Step through it, then compare the two matrices: how is $R_\theta^{-1}$ obtained from $R_\theta$? When is the inverse of a matrix computed this way?`,
            from: { lecture: 21, slides: ['Slide01cUndo'] },
          },
          {
            id: 'transpose',
            title: 'Matrix transpose',
            caption:
              r`The <b>transpose</b> $A^{\top}$ of a matrix $A$ is obtained by writing the columns of $A$ as rows: if $A$ is $m \times n$, then $A^{\top}$ is $n \times m$, and the $(i, j)$-th entry of $A^{\top}$ is the $(j, i)$-th entry of $A$. Transpose the copy: which entries stay in place, and why?`,
            from: { lecture: 21, slides: ['Slide02Transpose'] },
          },
          {
            id: 'transpose-properties',
            title: 'Properties of the transpose',
            caption:
              r`For matrices $A$ and $B$ of the same size and any scalar $c$: $(A^{\top})^{\top} = A$, $(cA)^{\top} = cA^{\top}$ and $(A + B)^{\top} = A^{\top} + B^{\top}$. Why is each true? Think first, then click its button: the matrices turn over like cards, about the line through their diagonal entries.`,
            from: { lecture: 21, slides: ['Slide03Poll'] },
          },
          {
            id: 'product-transpose',
            title: 'Transpose of a product',
            caption:
              r`$(AB)^{\top} = B^{\top}A^{\top}$: the order is reversed. Why? Compare the $(i, j)$-th entries of the two sides, here for $i = 3$ and $j = 2$, a step at a time. Why does $A^{\top}B^{\top}$ not even make sense here?`,
            from: { lecture: 21, slides: ['Slide05ProductTranspose'] },
          },
        ],
      },
      {
        id: 'orthogonal-matrices',
        title: 'Orthogonal matrices',
        applets: [
          {
            id: 'orthogonal-or-not',
            title: 'Orthogonal or not?',
            caption:
              r`A square matrix whose columns are orthonormal is called an <b>orthogonal matrix</b>. If $A$ is orthogonal, then $A^{\top}A = I_n$, so $A$ is invertible and $A^{-1} = A^{\top}$. For example, the rotation matrix $R_\theta$ is orthogonal. Which of these eight are orthogonal? Think first, then click a card to check: its picture shows what the matrix does.`,
            from: { lecture: 21, slides: ['Slide18bOrthOrNot'] },
          },
          {
            id: 'orthogonal-transformations',
            title: 'Orthogonal matrices as linear transformations',
            caption:
              r`Let $A$ be an orthogonal matrix. The linear transformation $T_A(\vv x) = A\vv x$ sends $\vv e_i$ to the columns of $A$, which are by definition orthonormal. Watch $A\vv e_1$ and $A\vv e_2$: what happens to the unit square on each side? Think first, then click to check.`,
            from: { lecture: 21, slides: ['Slide03eOrthTransform'] },
          },
          {
            id: 'lengths-angles',
            title: 'Orthogonal matrices preserve lengths and angles',
            caption:
              r`For any $n \times n$ matrix $A$: $\norm{A\vv x} = \norm{\vv x}$ for all $\vv x$ in $\mathbb R^n$ exactly when $A$ is orthogonal (Theorem 20.4.1). Orthogonal matrices preserve angles as well: the angle between $A\vv x$ and $A\vv y$ is the angle between $\vv x$ and $\vv y$, because $\cos\theta = \vv x \cdot \vv y / (\norm{\vv x} \, \norm{\vv y})$ is preserved. On the right, $A$ keeps the lengths of $\vv x$ and $\vv y$ but is not orthogonal: what does it not keep?`,
            from: { lecture: 21, slides: ['Slide19Angles'] },
          },
          {
            id: 'orthogonal-products',
            title: 'Products of orthogonal matrices',
            caption:
              r`If $A$ and $B$ are $n \times n$ orthogonal matrices, is $AB$ orthogonal? Think first, then click True or False to check, by algebra and by geometry.`,
            from: { lecture: 21, slides: ['Slide21Products'] },
          },
          {
            id: 'orthogonal-inverses',
            title: 'Inverses of orthogonal matrices',
            caption:
              r`If $A$ is an $n \times n$ orthogonal matrix, is $A$ invertible, and is $A^{-1}$ orthogonal? Think first, then click True or False to check.`,
            from: { lecture: 21, slides: ['Slide21bInverses'] },
          },
        ],
      },
      {
        id: 'quadratic-forms',
        title: 'Symmetric matrices and quadratic forms',
        applets: [
          {
            id: 'stretching',
            title: 'Stretching and shrinking',
            caption:
              r`When $A$ is not orthogonal, $\norm{A\vv x}$ can be larger or smaller than $\norm{\vv x}$: here $A$ stretches F along one diagonal and shrinks it across the other. How much does $A$ stretch or shrink a vector $\vv x = (x, y)$? Compute $\norm{A\vv x}^2$ and $A^{\top}A$: what do you notice?`,
            from: { lecture: 21, slides: ['Slide19bConverse'] },
          },
          {
            id: 'symmetric',
            title: 'Symmetric matrices',
            caption:
              r`A matrix $M$ is <b>symmetric</b> if $M = M^{\top}$. Which of these three are symmetric? Think first, then click a matrix to transpose it and check. If $M$ is symmetric, so are $M^2, M^3, \dots$, and so is $M^{-1}$ if $M$ is invertible. For any matrix $A$, the <b>Gram matrices</b> $A^{\top}A$ and $AA^{\top}$ are symmetric: why?`,
            from: { lecture: 21, slides: ['Slide09Symmetric'] },
          },
          {
            id: 'quadratic-graphs',
            title: 'Quadratic forms in two variables',
            caption:
              r`The <b>quadratic form</b> of a symmetric $n \times n$ matrix $M$ is the function $q_M\colon \mathbb R^n \to\nobreak \mathbb R$ given by $q_M(\vv x) = \vv x^{\top}M\vv x$. For $M = \left[\begin{smallmatrix} a & b \\ b & c \end{smallmatrix}\right]$, $q_M(x, y) = ax^2 + 2bxy + cy^2$. Does each of these have a local minimum, a local maximum or a saddle at $\vv 0$? Think first, then click to check; drag a graph to turn it. (Chapter 26: the second derivative test.)`,
            from: { lecture: 21, slides: ['Slide13aTwoVariables'] },
          },
        ],
      },
      {
        id: 'linear-systems',
        title: 'Linear systems and the column space',
        applets: [
          {
            id: 'matrix-form',
            title: 'Linear system in matrix form',
            caption:
              r`A linear system with $m$ equations and $n$ unknowns can be written as $A\vv x = \vv b$, where $A$ is an $m \times n$ matrix: $\vv x \in \mathbb R^n$ holds the unknowns and $\vv b \in \mathbb R^m$ the right-hand sides. Two questions about any system: does it have a solution? If so, is the solution unique? Write each system as $A\vv x = \vv b$, then draw each $T_A$ and $\vv b$: is $\vv b$ an output of $T_A$? Click a right-hand side to change it.`,
            from: { lecture: 22, slides: ['Slide02dSystems'] },
          },
          {
            id: 'image-r1',
            group: 'Image',
            title: 'Image of a linear transformation ℝ → ℝ and ℝ → ℝ²',
            caption:
              r`The <b>image</b> of a linear transformation $f\colon \mathbb R^n \to\nobreak \mathbb R^m$ is the collection of its outputs $f(\vv x)$, $\vv x \in \mathbb R^n$. Each picture moves the inputs of $T_A(\vv x) = A\vv x$ onto their outputs. What is the image of each? Think first, then click a picture to check.`,
            from: { lecture: 22, slides: ['Slide05bImage'] },
          },
          {
            id: 'image-r2',
            group: 'Image',
            title: 'Image of a linear transformation ℝ² → ℝ² and ℝ² → ℝ³',
            caption:
              r`The image of $T_A\colon \mathbb R^n \to\nobreak \mathbb R^m$ is the span of the columns of $A$, the <b>column space</b> $C(A)$, a linear subspace of $\mathbb R^m$. We call $\dim C(A)$ the <b>rank</b> of $A$. What is the image of each, and what is the rank of $A$? Think first, then click a picture to check.`,
            from: { lecture: 22, slides: ['Slide05dImageR2'] },
          },
          {
            id: 'image-r3',
            group: 'Image',
            title: 'Image of a linear transformation ℝ³ → ℝ³',
            caption:
              r`Is the image of each $T_A$ a point, a line, a plane, or all of $\mathbb R^3$? What is the rank of $A$? Think first, then click a picture to check. Drag a picture to turn it.`,
            from: { lecture: 22, slides: ['Slide05eImageR3'] },
          },
          {
            id: 'back-to-systems',
            title: 'Going back to linear systems',
            caption:
              r`A linear system with $m$ equations in $n$ unknowns can be written as $A\vv x = \vv b$, where $A$ is an $m \times n$ matrix, and $A\vv x = \vv b$ has a solution exactly when $\vv b \in C(A)$, where the column space $C(A)$ is a subspace of $\mathbb R^m$. So if $\dim C(A) = m$, every $A\vv x = \vv b$ has a solution; if $\dim C(A) < m$, “most” $\vv b \in \mathbb R^m$ are not in $C(A)$. Drag $\vv b$ in each picture: where must it be for a solution?`,
            from: { lecture: 22, slides: ['Slide07Rank'] },
          },
          {
            id: 'existence',
            title: 'Existence of solutions',
            caption:
              r`$A\vv x = \vv b$ has a solution $\iff \vv b \in C(A) \iff \operatorname{Proj}_{C(A)}(\vv b) = \vv b$. To check this condition, find an orthogonal basis $\{\vv w_1, \dots, \vv w_k\}$ for $C(A)$ using Gram–Schmidt, then compute $\operatorname{Proj}_{C(A)}(\vv b)$ using the orthogonal projection formula: $\operatorname{Proj}_{C(A)}(\vv b) = \frac{\vv b \cdot \vv w_1}{\vv w_1 \cdot \vv w_1}\vv w_1 + \cdots + \frac{\vv b \cdot \vv w_k}{\vv w_k \cdot \vv w_k}\vv w_k$. Drag $\vv b$ off the plane $C(A)$, above it or below it, and back: when is $\vv b$ its own projection?`,
            from: { lecture: 22, slides: ['Slide08ProjTest'] },
          },
          {
            id: 'solve-example',
            title: 'Does the system have a solution?',
            caption:
              r`For the system $(\ast)$: (i) write it in the form $A\vv x = \vv b$; (ii) find an orthogonal basis for the column space of $A$; (iii) when $\vv b = (0, 0, 0)$, does $(\ast)$ have a solution? (iv) For $\vv b = (3, 3, -3)$, compute $\operatorname{Proj}_{C(A)}(\vv b)$: does $(\ast)$ have a solution? (v) The same for $\vv b = (0, 1, 0)$. Work it out first, then check (iv) and (v) with the buttons. The picture shows the columns $\vv v_1, \vv v_2, \vv v_3$ of $A$ and their span; drag $\vv b$ by its tip, or the picture to turn it.`,
            from: { lecture: 22, slides: ['Slide09Example2'] },
          },
          {
            id: 'ct-scan',
            fun: true,
            title: 'How does a CT scan see inside the body?',
            caption:
              'The unknowns are the densities of the pixels of the picture. Each X-ray measures the total density along its path, which gives one linear equation in them. From thousands of X-rays at many angles, the scanner solves a huge linear system to draw what is inside.',
            from: { lecture: 22, slides: ['Slide02bEverywhere'] },
          },
          {
            id: 'bridge',
            fun: true,
            title: 'Will the bridge hold the truck?',
            caption:
              'The unknowns are the forces in the beams: blue beams are stretched and red ones squeezed, darker the more force they carry. At each joint the forces balance, which gives two linear equations per joint: here 26 equations in the 23 beams’ forces and the 3 forces of the supports, solved again as the truck moves.',
            from: { lecture: 22, slides: ['Slide02bEverywhere'] },
          },
        ],
      },
      {
        id: 'null-space',
        title: 'Null space and the rank–nullity theorem',
        applets: [
          {
            id: 'null-space',
            title: 'Null space',
            caption:
              r`Two solutions of $A\vv x = \vv b$ differ by a solution of $A\vv x = \vv 0$: if $A\vv x_1 = A\vv x_2 = \vv b$, then $A(\vv x_1 - \vv x_2) = \vv 0$. The <b>null space</b> of an $m \times n$ matrix $A$ is $N(A) = \{\vv x \in \mathbb R^n : A\vv x = \vv 0\}$, the inputs that $T_A$ sends to $\vv 0$. It is a linear subspace of $\mathbb R^n$, and $\dim N(A)$ is called the <b>nullity</b> of $A$. What is the null space of each? Think first, then click a picture to check.`,
            from: { lecture: 22, slides: ['Slide10NullSpace'] },
          },
          {
            id: 'rank-nullity-r2',
            group: 'The rank–nullity theorem',
            title: 'Rank and nullity of a linear transformation ℝ² → ℝ² and ℝ² → ℝ³',
            caption:
              r`The <b>rank–nullity theorem</b>: if $A$ is an $m \times n$ matrix, then $\dim C(A) + \dim N(A) = n$. In each picture, the null space $N(A)$, in green, collapses to $\vv 0$ as the inputs move onto their outputs. What are the rank and the nullity of each $A$? Think first, then click a picture to check.`,
            from: { lecture: 22, slides: ['Slide14RankNullity', 'Slide14eRankNullityR23'] },
          },
          {
            id: 'rank-nullity-r3',
            group: 'The rank–nullity theorem',
            title: 'Rank and nullity of a linear transformation ℝ³ → ℝ³',
            caption:
              r`What are the rank and the nullity of each $3 \times 3$ matrix? Do they add up to 3? Think first, then click a picture to check. Drag a picture to turn it.`,
            from: { lecture: 22, slides: ['Slide14cRankNullityR3'] },
          },
        ],
      },
      {
        id: 'solution-sets',
        title: 'All solutions of a linear system',
        applets: [
          {
            id: 'solutions-square',
            title: 'All solutions: two equations in two unknowns',
            caption:
              r`Suppose $A\vv x = \vv b$ has one solution $\vv x_0$. Adding $\vv n \in N(A)$ gives another solution, and any other solution $\vv x_1$ satisfies $\vv x_1 - \vv x_0 \in N(A)$. So all solutions of $A\vv x = \vv b$ are given by $\vv x_0 + \vv n$, where $\vv x_0$ is any solution and $\vv n \in N(A)$. In each picture, $N(A)$ is green, $C(A)$ teal, and the solutions of each equation a gray line. Drag $\vv b$, and the right-hand sides follow: when is there a solution? Once there is, what are all the solutions? Think first, then click “All solutions”.`,
            from: { lecture: 22, slides: ['Slide16cSolutionSets'] },
          },
          {
            id: 'solutions-other',
            title: 'All solutions: more equations, or more unknowns',
            caption:
              r`Let $A$ be an $m \times n$ matrix. The equation $A\vv x = \vv b$ has no solution if $\vv b \notin C(A)$; exactly one solution if $\vv b \in C(A)$ and $N(A) = \{\vv 0\}$; infinitely many solutions if $\vv b \in C(A)$ and $N(A) \ne \{\vv 0\}$. Which can happen for each of these systems? Drag $\vv b$, and once there is a solution, click “All solutions”.`,
            from: { lecture: 22, slides: ['Slide16dSolutionSets'] },
          },
          {
            id: 'rule-of-thumb',
            title: 'Rule of thumb',
            caption:
              r`For a system of $m$ equations in $n$ unknowns: if $m > n$ (overdetermined), there is usually no solution; if $m < n$ (underdetermined), there are usually infinitely many. Why does the rank–nullity theorem suggest this? But this might fail! Move each slider: for which $c$ does the overdetermined system have a solution, and for which $c$ does the underdetermined one have none?`,
            from: { lecture: 22, slides: ['Slide19RuleOfThumb'] },
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
            caption: r`Composition of the functions $\vv f(t) = (\cos t, \sin t, t/4)$ and $\vv g(x, y, z) = (x, y)$`,
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
            caption: r`The level sets $f(x, y) = c$ for evenly spaced values of $c$, drawn together in the plane.`,
            from: { lecture: 7, slides: ['Slide10ContourPlot'] },
          },
          {
            id: 'steepness',
            title: 'Steepness on a contour plot',
            caption: r`The steeper the graph of $f$, the shorter the distance between the level sets.`,
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
              r`$f(x, y) = \sin x + \sin y$. Small closed loops surround a top or a bottom, and at a saddle point a level curve crosses itself.`,
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
              r`The graph of a function of three variables would live in $\mathbb R^4$, but its level surfaces $g(x, y, z) = c$ live in $\mathbb R^3$, as the level curves of a function of two variables live in $\mathbb R^2$. For $g(x, y, z) = x^2 + y^2 + z^2$ they are spheres, nested like the layers of an onion.`,
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
              r`$|f_x|$ indicates density of the level sets; <span style="white-space: nowrap">$f_x > 0$</span> if the labels on the level sets increase in the $+x$ direction`,
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
            caption: r`At a local maximum or minimum, $f'(c) = 0$: $c$ is a critical point. Is every critical point a local maximum or minimum?`,
            from: { lecture: 9, slides: ['Slide03Recall'] },
          },
          {
            id: 'critical-tangents',
            title: 'Critical points',
            caption:
              r`A critical point is a point where all the partial derivatives vanish: $(a, b)$ is a critical point of $f(x, y)$ if $f_x(a, b) = 0$ and $f_y(a, b) = 0$. Both tangent lines are horizontal there.`,
            from: { lecture: 9, slides: ['Slide04Critical'] },
          },
          {
            id: 'local-extrema',
            title: 'Local maximum and minimum',
            caption:
              r`$f$ has a local minimum at $\vv p$ if $f(\vv x) \ge f(\vv p)$ for every point $\vv x$ sufficiently close to $\vv p$, and a local maximum if $f(\vv x) \le f(\vv p)$.`,
            from: { lecture: 9, slides: ['Slide05Local'] },
          },
          {
            id: 'extremum-slice',
            title: 'A local extremum is a critical point',
            caption:
              r`Why? If $f$ has a local extremum at $(a, b)$, the slice $f(x, b)$ has a local extremum at $x = a$, so $f_x(a, b) = 0$. Similarly, $f_y(a, b) = 0$.`,
            from: { lecture: 9, slides: ['Slide06Theorem'] },
          },
          {
            id: 'saddle-point',
            title: 'Saddle points',
            caption:
              r`$f(x, y) = x^2 - y^2$ at $(0, 0)$: along the $x$-axis, <span style="color: #8c1515">$f(x, 0) = x^2$</span> has a local minimum; along the $y$-axis, <span style="color: #175e54">$f(0, y) = -y^2$</span> has a local maximum.`,
            from: { lecture: 9, slides: ['Slide08Saddle'] },
          },
          {
            id: 'classify-contour',
            title: 'Critical points on a contour plot',
            caption:
              r`$g(x, y) = 3x^2y + y^3 - 6xy$. Nested ovals surround a local maximum or minimum, and at a saddle point a level curve crosses itself in an X.`,
            from: { lecture: 9, slides: ['Slide08bNeither'] },
          },
          {
            id: 'neither',
            title: 'Neither a local extremum nor a saddle point',
            caption:
              r`$f(x, y) = x^3 + y^2$ at its critical point $(0, 0)$: along the $x$-axis, <span style="color: #8c1515">$f(x, 0) = x^3$</span> has neither a maximum nor a minimum; along the $y$-axis, <span style="color: #175e54">$f(0, y) = y^2$</span> has a local minimum.`,
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
              r`Two identical springs and two weights hang from the ceiling, held so that the springs are not stretched. Let go: they bounce, then settle at the minimum of the potential energy $V(x_1, x_2)$, a critical point of $V$. Click on the contour plot to let them go from somewhere else. Can the bottom spring end up stretched more than the top one?`,
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
              r`$f\colon D \to\nobreak \mathbb R$ has a local maximum on $D$ at $\vv a$ if $f(\vv x) \le f(\vv a)$ for every point $\vv x$ in $D$ sufficiently close to $\vv a$. Which of these local extrema are critical points?`,
            from: { lecture: 9, slides: ['Slide12bLocalRegion'] },
          },
          {
            id: 'boundary-examples',
            title: 'Critical point or boundary point',
            caption:
              r`If $f\colon D \to\nobreak \mathbb R$ has a local extremum at $\vv a$, then $\vv a$ is a critical point of $f$ in the interior of $D$, or a boundary point of $D$.`,
            from: { lecture: 9, slides: ['Slide15bTheoremExamples'] },
          },
          {
            id: 'global-extrema',
            title: 'Global extrema',
            caption:
              r`$f$ has a global maximum on $D$ at $\vv a$ if $f(\vv a) \ge f(\vv x)$ for all $\vv x$ in $D$. We can find the global extrema by finding all the local extrema and comparing their values.`,
            from: { lecture: 9, slides: ['Slide13Global'] },
          },
          {
            id: 'global-steps',
            title: 'Finding global extrema',
            caption: r`$f(x, y) = 3x^2 - 2y^2 + 2x + 2y - 1$ on the square $[-1, 1] \times [-1, 1]$, one step at a time.`,
            from: { lecture: 9, slides: ['Slide16Method'] },
          },
          {
            id: 'connecticut',
            fun: true,
            title: 'Where is the highest point in Connecticut?',
            caption:
              r`$E(x, y) =$ height above sea level at $(x, y)$, on Connecticut only. Bear Mountain is the highest summit in Connecticut, but it is not the highest point. Where is it?`,
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
              r`The gradient of $f\colon \mathbb R^n \to\nobreak \mathbb R$ is the vector of its partial derivatives, $\nabla f = \left(\frac{\partial f}{\partial x_1}, \dots, \frac{\partial f}{\partial x_n}\right)$: a vector at every point. For $f(x, y) = xy$, $\nabla f(x, y) = (y, x)$, drawn at a quarter of its length. Drag the point $\vv a$.`,
            from: { lecture: 11, slides: ['Slide04Gradient'] },
          },
          {
            id: 'tangent-plane',
            title: 'Linear approximation',
            caption:
              r`The linear approximation to $f$ for $\vv x$ near a point $\vv a$ is $f(\vv x) \approx f(\vv a) + \nabla f(\vv a) \cdot (\vv x - \vv a)$. The tangent plane is drawn for $f(x, y) = x^2 + 2y^2 + xy$ at $(1, 1)$.`,
            from: { lecture: 11, slides: ['Slide05LinearApprox'] },
          },
          {
            id: 'linear-error',
            title: 'How good is the linear approximation?',
            caption:
              r`$f(x, y) = x^2 + 2y^2 + xy$ and its linear approximation at $(1, 1)$, $L(x, y) = 4 + 3(x - 1) + 5(y - 1)$, whose graph is the tangent plane. Near $(1, 1)$ the error $f - L$ is tiny. What happens far from $(1, 1)$?`,
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
              r`$f(x, y) = x^3 + xy + y^2$, with $\nabla f(x, y) = (3x^2 + y, x + 2y)$. The arrows show $\nabla f$ at points on the level curves, all shrunk by the same factor. What do you observe?`,
            from: { lecture: 11, slides: ['Slide08Example2'] },
          },
          {
            id: 'level-curve-tangent',
            title: 'Gradient and level curves',
            caption:
              r`The gradient of $f\colon \mathbb R^2 \to\nobreak \mathbb R$ at a point $\vv a$ is perpendicular to the tangent line to the level curve through $\vv a$, $\nabla f(\vv a) \cdot (\vv x - \vv a) = 0$. Why? For $\vv x$ on the level curve near $\vv a$, $f(\vv x) = f(\vv a)$ and $f(\vv x) \approx f(\vv a) + \nabla f(\vv a) \cdot (\vv x - \vv a)$, so $\nabla f(\vv a) \cdot (\vv x - \vv a) \approx 0$.`,
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
              r`$\nabla f(\vv a)$ points towards the greatest increase of $f$, and $-\nabla f(\vv a)$ towards the greatest decrease (unless $\nabla f(\vv a) = \vv 0$). Why? For a unit vector $\vv u$ and $t$ small, $f(\vv a + t\vv u) \approx f(\vv a) + t\,\nabla f(\vv a) \cdot \vv u$, and $\nabla f(\vv a) \cdot \vv u = \norm{\nabla f(\vv a)} \cos\theta$ is largest for $\theta = 0$ and smallest for $\theta = \pi$.`,
            from: { lecture: 11, slides: ['Slide13Steepest', 'Slide13bSteepestWhy'] },
          },
          {
            id: 'gradient-critical',
            title: 'At a critical point',
            caption:
              r`When $\nabla f(\vv a) = \vv 0$, $\vv a$ is a critical point. Which way is the greatest increase there? In the gradient vector field of $f(x, y) = x^3 - 3x - y^3 + 3y$, how do the arrows behave around each kind of critical point?`,
            from: { lecture: 11, slides: ['Slide13cCritical'] },
          },
          {
            id: 'descent',
            title: 'Gradient descent',
            caption:
              r`To find the minimum of $f$, repeatedly replace $\vv a \to \vv a - t\nabla f(\vv a)$; to find the maximum, use $\vv a \to \vv a + t\nabla f(\vv a)$. In machine learning, $t$ is called the learning rate. What happens for $t = 0.01$, $0.26$ or $0.3$?`,
            from: { lecture: 11, slides: ['Slide18Descent'] },
          },
          {
            id: 'lombard',
            fun: true,
            title: 'How steep is Lombard Street?',
            caption:
              r`$E(x, y) =$ elevation on Russian Hill, San Francisco. The crooked block of Lombard Street winds down the hill in eight hairpin turns, built in 1922 to tame its 27% grade. Drag on the map to turn $\vv u$: going in the direction $\vv u$, the grade is $\nabla E \cdot \vv u = 27\% \cdot \cos\theta$.`,
            from: { lecture: 11, slides: ['Slide13bSteepestWhy', 'Slide14Lombard'] },
          },
          {
            id: 'crowd',
            fun: true,
            title: 'How do 300 units find their way?',
            caption:
              r`In strategy games such as Supreme Commander 2, Flow Field Pathfinding computes $D(x, y) =$ walking distance to the goal, and each unit moves in the direction $-\nabla D$. Click on the map to send the army somewhere else.`,
            from: { lecture: 11, slides: ['Slide14bCrowd'] },
          },
          {
            id: 'raindrop',
            fun: true,
            title: 'Where does a raindrop go?',
            caption:
              r`$E(x, y) =$ elevation around Triple Divide Peak, Glacier National Park, Montana. A raindrop moves in the direction $-\nabla E$. Click on the map to drop one: which ocean does its water reach?`,
            from: { lecture: 11, slides: ['Slide16Raindrop'] },
          },
          {
            id: 'digits',
            fun: true,
            title: 'An AI learns to read digits',
            caption:
              r`An AI model is a function with billions of parameters (this tiny one has 7,850). It learns from lots of examples, inputs and their right outputs: gradient descent finds the parameters that make $E$, the error on the examples, smallest, as for the line of best fit. Draw a digit, then press Run.`,
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
              r`Find the maximum or minimum of a function $f(\vv x)$ subject to a constraint $g(\vv x) = c$. For $f(x, y) = x^3 + xy + y^2$ subject to $x^2 + y^2 = 2$, they are the highest and lowest points of the graph above the circle (in red). Are they critical points of $f$?`,
            from: { lecture: 12, slides: ['Slide01Title'] },
          },
          {
            id: 'curve-extrema',
            title: 'Maximum and minimum on a curve',
            caption:
              r`The contour map of a function $f(x, y)$, together with a curve $C$. Where are the global maximum and minimum of $f$ on $C$? What do you observe there?`,
            from: { lecture: 12, slides: ['Slide02bCurve'] },
          },
          {
            id: 'gradient-normal',
            title: 'Gradients of f and g',
            caption:
              r`The gradient $\nabla f(\vv a)$ of a function is perpendicular to the tangent line to the level curve through $\vv a$. The curve $g(\vv x) = c$ is a level set of $g$, so its tangent line is perpendicular to $\nabla g(\vv a)$, at least when the tangent line makes sense. Move $\vv x$ along the level curve $f = 12$ and $\vv a$ along $C$: what happens where they meet?`,
            from: { lecture: 12, slides: ['Slide02dRecallNormal'] },
          },
          {
            id: 'gradient-zero',
            title: 'When ∇g(a) = 0',
            caption:
              r`If $\nabla g(\vv a) = \vv 0$, the tangent line to the curve $g = c$ at $\vv a$ may not make sense. Move $\vv a$ along each curve: what happens to $\nabla g(\vv a)$ and to the tangent line at the origin?`,
            from: { lecture: 12, slides: ['Slide02eGradZero'] },
          },
          {
            id: 'rainbow',
            fun: true,
            title: 'Why do rainbows form arcs?',
            caption:
              r`Sunlight that enters a raindrop at an angle $i$ bends to an angle $r$, with $\sin i = 1.33 \sin r$ (Snell’s law), reflects inside the drop and leaves it at the angle $\theta = 4r - 2i$ to the sunlight. The light piles up near the largest $\theta$: maximize $\theta$ subject to the physics law, and $\theta \approx 42^\circ$, the same for every drop. So the bright drops lie on a cone of 42° around the line from the sun through your eye, which you see as an arc. Drag the drop along the bow.`,
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
              r`What is the local extremum of $f$ on the curve $C$? What happens to $\nabla f$ and $\nabla g$ at the local extrema? Drag the point $\vv a$ to explore.`,
            from: { lecture: 12, slides: ['Slide05Lagrange'] },
          },
          {
            id: 'circle-disk',
            title: 'On a circle and on a disk',
            caption:
              r`To find the max/min of $f$ constrained to $g = c$: compute $\nabla f$ and $\nabla g$; find the points of $g = c$ where $\nabla g = \vv 0$; solve $\nabla f(\vv a) = \lambda\nabla g(\vv a)$, $g(\vv a) = c$ for $\vv a$ and $\lambda$; compare the values of $f$ at the points found. Here $f(x, y) = x^2 + 2y^2 + x - 1$ subject to $x^2 + y^2 = 1$, and then on the disk $D$. Why is the minimum on $D$ somewhere else?`,
            from: { lecture: 12, slides: ['Slide08bDisk'] },
          },
          {
            id: 'can',
            title: 'The best shape for a can',
            caption:
              r`Which cylindrical can holding 355 cm³ uses the least aluminum? Drag its radius $r$. A real Coke can is taller than the best one: why might that be?`,
            from: { lecture: 12, slides: ['Slide09bCan'] },
          },
          {
            id: 'cusp',
            title: 'A minimum where ∇g = 0',
            caption:
              r`Minimize $f(x, y) = y$ subject to $g(x, y) = x^2 - y^3 = 0$. The equations $\nabla f(\vv a) = \lambda\nabla g(\vv a)$ and $g(\vv a) = 0$ have no solution. Where is the minimum, and why does Lagrange’s theorem still hold?`,
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
              r`The derivative matrix $(Df)(\vv a)$ of $f\colon \mathbb R^n \to\nobreak \mathbb R^m$ is the $m \times n$ matrix whose $(i, j)$-entry is $\frac{\partial f_i}{\partial x_j}(\vv a)$: its $i$-th row is $\nabla f_i(\vv a)$. For $\vv h$ near $\vv 0$, $f(\vv a + \vv h) \approx f(\vv a) + (Df)(\vv a)\vv h$. Here $f(\theta_1, \theta_2)$ is the position of the hand. Turning the shoulder by $h_1$ and the elbow by $h_2$ moves the hand by about $h_1\vv c_1 + h_2\vv c_2$, where $\vv c_1, \vv c_2$ are the columns of $(Df)(\theta_1, \theta_2)$. What happens when the arm is straight?`,
            from: { lecture: 13, slides: ['Slide13cRobotArm'] },
          },
          {
            id: 'vivid',
            fun: true,
            title: 'Nonlinear photo filters',
            caption:
              r`Vivid adds color, then contrast. As a function $f\colon \mathbb R^3 \to\nobreak \mathbb R^3$ on colors it is not affine, but for colors $\vv x$ near a color $\vv a$, $f(\vv x) \approx f(\vv a) + (Df)(\vv a)(\vv x - \vv a)$, an affine filter. Drag the ring $\vv a$ across a photo: where does the linear approximation look like Vivid, and where not?`,
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
              r`The Linearity Principle: a linear function $T\colon \mathbb R^2 \to\nobreak \mathbb R^2$ takes the grid of squares to a grid of parallelograms, and the square with the letter F to a parallelogram. What does the nonlinear $g$ do to them? Click a picture to play it again.`,
            from: { lecture: 17, slides: ['Slide05LinearOrNot'] },
          },
          {
            id: 'zoom-in',
            title: 'Zooming in',
            caption:
              r`Linear approximation: locally, any function is approximately multiplication by its derivative matrix. As the two pictures zoom in, what happens to the bent image of the square? Drag $\vv x$: what does $g(\vv x) - g(\vv a)$ turn into?`,
            from: { lecture: 17, slides: ['Slide05aZoomOne'] },
          },
          {
            id: 'chain-zoom',
            title: 'Why does the chain rule hold?',
            caption:
              r`<b>The multivariable chain rule.</b> If $f\colon \mathbb R^p \to\nobreak \mathbb R^m$ and $g\colon \mathbb R^n \to\nobreak \mathbb R^p$, then $(D(f \circ g))(\vv a) = (Df)(g(\vv a))\,(Dg)(\vv a)$, an $m \times n$ matrix, the product of an $m \times p$ and a $p \times n$ matrix. Why? Zoomed in, $g$ is multiplication by $(Dg)(\vv a)$ and $f$ by $(Df)(g(\vv a))$, so $f \circ g$, one after the other, is multiplication by their product.`,
            from: { lecture: 17, slides: ['Slide05bZoom'] },
          },
          {
            id: 'whiteout',
            title: 'Climber in a whiteout',
            caption:
              r`When $f\colon \mathbb R^p \to\nobreak \mathbb R$ and $g\colon \mathbb R \to\nobreak \mathbb R^p$, the chain rule gives $(f \circ g)'(t) = \nabla f(g(t)) \cdot g'(t)$. How fast is the climber climbing at time $t$? When does he reach the summit, which he cannot see?`,
            from: { lecture: 17, slides: ['Slide11cWhiteout'] },
          },
          {
            id: 'mosquito',
            title: 'Mosquito in the hunt',
            caption:
              r`At $t = \pi$, how fast is the temperature the mosquito feels changing? Is it on the right track? Drag the room to turn it.`,
            from: { lecture: 17, slides: ['Slide12bMosquito'] },
          },
          {
            id: 'backpropagation',
            fun: true,
            title: 'Training an AI model',
            caption:
              r`Training a model by gradient descent needs the derivative matrix of the composition $f_3 \circ f_2 \circ f_1$, a product of three derivative matrices by the chain rule. Why is it so much faster to multiply them from the left?`,
            from: { lecture: 17, slides: ['Slide12cAI'] },
          },
        ],
      },
      {
        id: 'newtons-method',
        title: 'Newton’s method',
        applets: [
          {
            id: 'newton-tangent',
            title: 'Newton’s method in one variable',
            caption:
              r`To solve $f(x) = 0$, start with a guess $a_1$. Near $a_1$, $f(x) \approx f(a_1) + f'(a_1)(x - a_1)$, the tangent line, which crosses the $x$-axis at a better guess $a_2 = a_1 - f(a_1)/f'(a_1)$. Then $a_{k+1} = a_k - f(a_k)/f'(a_k)$ for $k = 1, 2, 3, \dots$. Take the steps one by one: how much closer does each step get?`,
            from: { lecture: 18, slides: ['Slide15Newton1'] },
          },
          {
            id: 'newton-1669',
            title: 'Newton’s example (1669)',
            caption:
              r`Newton solved $x^3 - 2x - 5 = 0$, which is hard to solve algebraically. Start with $a_1 = 3$ and take the steps one by one: how many digits of $a_k$ are right after each step? The last step shows which.`,
            from: { lecture: 18, slides: ['Slide15bNewtonExample'] },
          },
          {
            id: 'newton-steps',
            title: 'Newton’s method for many equations',
            caption:
              r`Any system of $n$ equations in $n$ unknowns may be written as $f(\vv x) = \vv 0$ for some $f\colon \mathbb R^n \to\nobreak \mathbb R^n$. Start with a guess $\vv a_1$, and let $\vv a_{k+1} = \vv a_k - \big((Df)(\vv a_k)\big)^{-1} f(\vv a_k)$, as long as $(Df)(\vv a_k)$ is invertible. Here the zeros of $f$ are where its two curves $f_1 = 0$ and $f_2 = 0$ cross. Click the picture to start from another point: which zero does it find?`,
            from: { lecture: 18, slides: ['Slide19Path'] },
          },
          {
            id: 'newton-basins',
            fun: true,
            title: 'Which zero does Newton’s method find?',
            caption:
              r`Each starting point $\vv a_1$ is coloured by the zero of $f$ that Newton’s method converges to from it: orange for $r_1$, blue for $r_2$, green for $r_3$. Near the boundaries the colours mix in a fractal. Click a zero to hide or show its region.`,
            from: { lecture: 18, slides: ['Slide18bBasins'] },
          },
        ],
      },
    ],
  },
];

export const SECTIONS = AREAS.flatMap((a) => a.sections.map((s) => ({ ...s, area: a.title })));
export const APPLETS = SECTIONS.flatMap((s) => s.applets);
