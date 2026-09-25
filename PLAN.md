# Interactive Geometric Pattern Designer — Plan

Source: `Geometric_Pattern_Research_and_Book_Catalogue.docx` (25 Sep 2026).

## 1. Product in one line
A browser tool where a user picks a researched pattern recipe (Mughal jali, girih, zellige, Gothic tracery, Art Deco…), tweaks its construction parameters live, sees it as line art, solid/void jali, or coloured mosaic, and exports SVG.

## 2. Key findings from the research that shape the design
- A "style label" cannot generate geometry. Each preset = a **construction recipe + a named source object**, not a filter.
- Three separate star engines must stay separate: compass/grid star construction, polygons-in-contact (Hankin/Kaplan), girih tiles (Lu & Steinhardt).
- Jali needs a solid/void model (aperture ratio, rib width, minimum bridge, island detection). Geometric jali and arboreal jali (Sidi Saiyyed) are different families.
- Zellige = individual pieces + grout + palette, not painted lines.
- Ottoman, Parisian Art Nouveau, Gothic and Art Deco each need their own grammar (curvilinear / arch constraints / stepped-mirrored).
- Each preset carries a **confidence label**: Documented construction · Plausible reconstruction · Visual inspiration only.
- Copyright: book plates and museum photos are not reused; all geometry is generated originally, reference images only if licensed.

## 3. Status — built so far (`index.html`)
Single self-contained page, no build step. Open it directly in a browser.

**Three construction engines, all generating real geometry:**
1. **Polygons in contact** (Hankin [3] / Kaplan [7]) over **9 tilings** — square, triangular, hexagonal, 3.6.3.6, 4.8.8, 3.4.6.4, 4.6.12, 3.3.3.4.4, 3.12.12 — each with a **dual (Laves)** toggle, so 18 tessellations. Contact angle 15–80°.
2. **Star polygons {n/d}** — compass construction per the Met pack [1], with secondary stars.
3. **Self-similar subdivision** (Fathauer [29] ch.6/8/9) — Penrose deflation (Robinson triangles, golden ratio), triangle rep-4, chair/L-tromino rep-4, Sierpinski fractal. Finite depth 0–8. Answers item 07 of the research catalogue.
4. **Quasiperiodic multigrid** (de Bruijn [26]) — N families of parallel lines; each crossing's dual is a rhombus of unit edge. N=5 is Penrose, N=4 is Ammann–Beenker. Aperiodic: long-range order, 2N-fold symmetry, never repeats. Singular (whole-number) offsets are handled properly — a crossing of *m* lines duals to a 2*m*-gon zonogon, so offset 0 at N=5 gives the decagonal cartwheel rather than broken geometry. Prompted by Pattern Collider [27]; implemented from the mathematics.
5. **Voronoi, sharp → round** — half-plane clipping, Lloyd relaxation; roundness morphs cells from hard polygons to smooth closed curves. Five seed layouts: **hexagonal / square / brick repeats** (seamlessly tiling), plus radial mandala and random scatter. Jitter takes a repeat from the exact regular tiling to fully irregular without losing the repeat.

**Colour system:** preset swatches or a generated ramp (base hue, hue spread, saturation, lightness, contrast, reverse), with colour-by tile type / area / orientation / side count / position. Tile classes are spread evenly across the ramp, and no fill is ever allowed to equal the grout colour.

**Vector export:** SVG, PDF (the format .ai uses internally, so Illustrator opens it), DXF R12 (AutoCAD opens it directly; DWG itself is proprietary and needs a converter).

**Five render modes:** construction overlay, line, interlace, solid/void jali, mosaic. Plus roundness, rib width, frame, 4 palettes, URL state, SVG export.

**Verified in-browser:**
- All 8 tilings: every polygon edge exactly equals the edge-length parameter; 400 sampled points per tiling land in exactly one tile — no gaps, no overlaps.
- Interlace: over/under decided per crossing by walking strands (a strand is one arm of a tile joined to one arm of its neighbour, so it cannot be decided per tile). Alternation 61–100% depending on tiling; a perfect result is impossible where crossings form an odd cycle.
- 60 randomised runs × 5 render modes across all engines, plus extreme parameter values: no errors, no NaN path data.
- Export serialises to valid, re-parseable SVG. No horizontal overflow at 375 px; canvas leads on mobile.
- Lloyd relaxation now works on every layout (it previously did nothing at all on radial and scatter): cell-area coefficient of variation falls with passes on all five — hex .22→.13, grid .21→.09, brick .19→.11, radial .70→.34, scatter .77→.37.
- Scatter seed count is now exact (40→40, 140→140, 300→300); radial lands within ~30% since a mandala's outer seeds fall beyond the panel corners.
- UI audit at desktop and 375 px: no panel or page overflow, no label/value collisions, no clipped selects or tables, every select reflects its state, all four pages render.
- All 18 tessellations (9 primal + 9 dual Laves) tile exactly: 0 bad out of 2400 samples each, at three rotations. Dual face shapes match the known Laves tilings (rhombille, tetrakis square, kisrhombille, prismatic pentagonal, …).
- Substitution: area conserved exactly at every depth for all three rep-tiles; counts grow exactly x4 (rep-4) and 10/20/50/130/340/890 (Penrose). Sierpinski loses exactly 1/4 per step and is labelled a fractal, not a tiling.
- **Penrose cross-check:** deflation gives thick:thin = 1.618 and the multigrid independently gives 1.624 — two unrelated constructions converging on the golden ratio.
- DXF is structurally valid (balanced POLYLINE/SEQEND, integer group codes, correct framing); PDF has a correct xref table with every object offset resolving.
- Multigrid is a genuine Penrose tiling at N=5: exactly 2 rhombus shapes at 36°/72°, all edges identical, and the thick:thin count ratio is 1.624 against φ=1.618 (0.4% — the ratio provably tends to φ). Every N from 3–14 gives exactly ⌊N/2⌋ shapes as theory predicts. Coverage is exact (300/300 sample points in exactly one tile) at every offset including the singular ones. 4–17 ms per render.
- Voronoi repeats are seamless: the base cells of one repeat unit fill that unit exactly (area error 0–0.02% across hex/square/brick × 1,3,5 repeats × 0,3 Lloyd passes), so translating them tiles without gap or overlap. At jitter 0 every hex cell has exactly 6 sides and every square cell exactly 4 — the lattice is exact.
- Voronoi solid/void uses closed openings (convex inset), not stroked ribs, so it exports as cuttable contours. Aperture is measured from the rendered shapes clipped to the panel and falls monotonically 79% → 0% as rib width goes 2 → 26 px.
- Performance: 10 ms per render at default, 60 ms worst case — only one repeat unit is ever solved, however many repeats are shown.
- Rounding evenness: 49% of Voronoi corners originally failed to round (134 degenerate from clipping, 137 with a radius under a third of their neighbours'). After removing degenerate/collinear vertices and sizing the cut from one global radius, degenerate corners are 0 and every remaining small radius is at the true geometric limit — cut back to the edge midpoint on a ~2.4 px edge against a 62 px median. PIC and star engines were unaffected (all edges equal).

### Still to do
Girih tiles with edge matching and strapwork [4] (the multigrid engine now covers the *quasiperiodic decagonal* side of this, but not the five girih tiles themselves) · self-similar subdivision · arboreal jali · Gothic arch and rose · Art Nouveau spline ironwork · Art Deco fan and stepped grammars · Ottoman floral fields · named regional presets with source objects and confidence labels · DXF and minimum-bridge validation (needs a fabricator).

## 4. Original scope
### MVP (v1)
| Engine | Presets |
|---|---|
| Grid star (square/diagonal, triangular/hex, circle grid) | 8-fold star field, 6-fold star-hex field, 12-fold |
| Polygons in contact (Kaplan) | Contact angle + edge-offset controls over regular tilings |
| Jali solid/void | Frame, rib width, aperture %, cutout preview with light/shadow |
| Interlace | Over/under assignment along bands |
| Zellige pieces | Piece tessellation + grout + palette |
| Wallpaper symmetry layer | p4m, p6m, p2mm, etc. as a repeat wrapper |

### v2
Girih tiles with edge matching · self-similar subdivision · Gothic arch/rose · Art Deco fan/chevron · Nouveau spline ironwork · Ottoman floral field · Andalusian bands · seeded contemporary variation.

### Out of scope for now
Photo overlays of source objects, user accounts, CNC/laser toolpaths (only SVG/DXF-ready outlines), full "AI generate a pattern".

## 4. Site structure
1. **Designer** (main app) — left: family + preset browser; centre: canvas; right: parameters; bottom: layers/export.
2. **Library** — cards for every preset with source object, date, material, confidence label.
3. **Constructions** — step-by-step animation of how a pattern is built (grid → rays → intersections → final).
4. **Sources** — the 25-item register and annotated book list from the document, with licence notes.
5. **About / method** — why families are separated; how confidence labels work.

## 5. Preset record (data model)
`id, name, family, engine, sourceObject, location, date, material, photoRights, baseGrid, repeatUnit, symmetry, recipe{…}, border, palette, lineRules, fabrication, confidence, attribution`

## 6. Controls (per engine, shown only when relevant)
Cell size · rotation phase · star points n and step · contact angle · line/rib width · aperture ratio · margin/frame · border on/off · over-under overrides · palette · grout width · seed · repeat vectors · render mode (construction / line / solid-void / mosaic).

## 7. Tech
- Vanilla **TypeScript + Vite**, no framework needed for v1; geometry in pure modules (`/engine/*`) that output polylines/polygons.
- Rendering: **SVG** (crisp, exportable, inspectable). Canvas fallback only if very large tilings get slow.
- Geometry: small in-house helpers + `polygon-clipping` for solid/void boolean ops and `clipper-lib` for rib offsetting.
- State in URL hash (shareable links) + localStorage for saved designs.
- Export: SVG (layers by role), PNG; DXF later.
- Deploy: static hosting (Cloudflare Pages / Netlify / GitHub Pages).

## 8. Milestones
1. **Foundation** — app shell, preset schema, SVG renderer, pan/zoom. 
2. **Grid star engine** + parameter panel + export.
3. **Polygons in contact** engine.
4. **Jali solid/void** mode + bridge/island check.
5. **Zellige pieces** + palette.
6. **Library, Constructions, Sources pages**; polish, responsive, accessibility.
7. v2 engines.

## 9. Open questions for you
1. Audience: designers/students (educational), or customers ordering jali screens for fabrication (commercial)?
2. Name/brand and colour direction — the mockup uses a warm stone + indigo + gold palette as a placeholder.
3. Is "MVP first, v2 later" the right cut?
4. Where will it be hosted?
