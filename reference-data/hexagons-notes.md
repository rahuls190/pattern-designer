# Hexagon and star source reconstructions

Source: Robert Field, Geometric Patterns from Islamic Art & Architecture, supplied PDF spreads 27-28, printed pages 52-55. Four entries are included. Seven other diagrams are omitted. No changes were made to index.html or the shared verification script.

These are geometric reconstructions of the ornamental linework, not tracings of scan distortions. The small instructional grid overlays, page-edge crop marks, photographs, and line-weight irregularities are excluded. Comparison images show source at left and the app's repeated drawing at right, at independent scales. Visual agreement does not establish pixel-exact scan reproduction.

## Included

| Entry | Source diagram | Construction and repeat evidence |
| --- | --- | --- |
| field-52-hexagon-triangle-net | Printed 52, upper-left introductory net | Pointed regular hexagons, with equilateral triangles between them. Vertices are (1,1), (-1,2), (-2,1), (-1,-1), (1,-2), (2,-1), so the hexagons are rotated 30 degrees from the other entries. Primitive centre translations (2,2) and (-2,4). The source's vertical lines and alternating triangle directions match. |
| field-53-hexagon-stars | Printed 53, upper-right Topkapi grille | Unit regular hexagons and unit-edge six-point stars. Centres at (2m,2n); stars occupy m-n divisible by 3. Primitive translations (2,2) and (-2,4). Two hexagons per star. The source's staggered stars and six surrounding hexagons match. |
| field-55-hexagons-stars-rhombi | Printed 55, upper-left Gurgan drawing | Side-2 hexagons and unit-edge stars at centres (3m,3n); hexagons occupy m-n divisible by 3. Primitive translations (3,3) and (-3,6). Two stars per hexagon, with small rhombi between stars. These face relationships and the source's alternating positions match. |
| field-55-stars-in-touching-hexagons | Printed 55, middle horizontal Konya drawing | Side-2 hexagons each contain a unit-edge star whose tips bisect the six hexagon sides. Centres repeat by (4,0) and (0,4); hexagons touch at vertices. The source's triangular gaps, horizontal rows, and staggered next row match. |

Coordinates use the app's actual map: (i,j) -> (i+j/2, sqrt(3)*j/2). A unit coordinate edge therefore has squared Cartesian length di^2+di*dj+dj^2. The introductory net has squared edge length 3; the other stored edges have length 1 after subdivision. All regular polygons are constructed exactly on this basis, without coarse rounding.

The app forces both isometric repeat dimensions to gW. Entries therefore use compatible square axial supercells: 6, 6, 9, and 4 respectively. For the first two, (6,0)=2(2,2)-(-2,4), and (0,6)=(2,2)+(-2,4). For Gurgan, (9,0)=2(3,3)-(-3,6), and (0,9)=(3,3)+(-3,6). Konya uses its primitive translations directly. This preserves motif types across both cell boundaries.

Coincident edges are deduplicated modulo the repeat cell. Longer hexagon edges are split at their integer lattice junctions, preserving geometry while avoiding superposed editable lines. Endpoints may extend outside the nominal cell; each edge midpoint belongs to the cell, and app repetition completes its neighbours.

## Omitted

- Printed 52, lower-left Qala'un marble screen: double-line hexagon/triangle pattern. The exact inset and narrow band width have not been established from the grid overlay. A generic trihexagonal tiling would omit those boundaries.
- Printed 52, lower-right Iranian British Museum tiling: concentric pointed hexagons with connected channels. Inset spacing and connector geometry remain unverified.
- Printed 53, lower-left Hagia Sophia grille: stars with pentagonal neighbours. The pentagon construction and repeat junctions have not been resolved.
- Printed 54, lower-left Shah Jehan Mosque window pattern: paired star rows and hexagonal openings. Exact band offsets and row repeat remain unverified.
- Printed 54, lower-right Ghaffariyya Tomb Tower plaster pattern: interlaced hexagons and stars. Crossing paths and band widths remain unverified.
- Printed 55, upper-right Chester Beatty drawing: nested stars, diamonds and bent borders. Internal offsets and border connections remain unverified.
- Printed 55, lower-right Topkapi miniature carpet pattern: pinwheel-like bent arms and central hexagons. Arm proportions and crossing construction remain unverified.

## Verification files

Run `node pattern-designer/reference-data/hexagons-verify.cjs --crops` to regenerate source crops from the existing high-resolution spread renders. Run without that argument to load the unmodified app in headless Edge, render every entry, and create source comparisons.

QA folder: `tmp/pdfs/hexagons/`. Each entry has an `<id>-comparison.png` and `<id>.png`. Source renders are `source-27.jpg` and `source-28.jpg`. `hexagons-audit.json` records app basis vectors, repeat translations, edge metrics, segment counts, and periodic vertex degrees. These checks establish coordinate and seam consistency; source fidelity was also checked by visually inspecting all four comparison images.

No rendered-image similarity score or claim of exact source transcription is made. Omitted diagrams must be reconstructed and inspected separately before inclusion.
