# Pattern Designer

An interactive designer for geometric ornament, built on **documented construction methods** rather than style filters.

Open `index.html` in a browser. No build step, no dependencies, no server.

## Convert scanned grid diagrams

`tools/image_to_pattern.py` is a separate command-line tool. It traces straight
grid edges from cropped scan images and adds their editable linework to the library.
Python needs Pillow and NumPy (`pip install pillow numpy`).

1. Copy `tools/image-pattern-example.json` and place each cropped diagram beside it. For each
   image, give the grid origin, the pixel vectors for one step along the two grid axes,
   the repeat size, and the usable image bounds. An `exclude` rectangle can mask a
   printed construction grid or other annotation. For a triangle grid, set `grid` to
   `iso` and use equal repeat dimensions.
2. Run `python tools/image_to_pattern.py your-manifest.json`. The tool updates
   `image-patterns.json` and `image-patterns.js`, which supply the numbered entries
   in Draw when the website is refreshed. There is no converter or import control
   in the website.
3. Review the source-versus-drawing images and `report.json` in
   `image-pattern-review/`. Tune `origin`, `u`, `v`, `radius`, or `vote_ratio` for any
   missing lines, then rerun. The script updates entries by ID rather than duplicating
   them.

The converter reads repeated **straight** grid lines. It does not yet recognize
circles, curved arcs, over-under weaving, or a design's repeat automatically. Those
details require review before an entry can be called faithful to its source.

Built from the research catalogue *Geometric Pattern Research and Book Catalogue* (25 September 2026), whose central claim shapes the whole tool: a family label alone cannot generate faithful geometry — the same star arises from different grids. So the app exposes **construction engines**, never style presets.

## Construction engines

| Engine | Method | Status |
|---|---|---|
| **Polygons in contact** | Hankin's method in Kaplan's computational form, over 9 tilings × their duals = 18 tessellations | documented |
| **Self-similar subdivision** | Penrose deflation, triangle rep-4, chair rep-4, Sierpinski | documented |
| **Quasiperiodic multigrid** | de Bruijn's multigrid — N=5 is Penrose, N=4 is Ammann–Beenker. An optional *Islamic star motif* runs Kaplan's polygons-in-contact over the tiles, giving 8-, 10-, 12- and 16-fold star patterns that no periodic tiling can | documented |
| **Draw on a grid** | Field's method: straight lines, arcs, 3-point arcs, circles and filled squares on a square or triangle grid, with symmetry and a repeat cell, drawn by hand | documented |
| **Voronoi — sharp to round** | Repeating or radial seeds, Lloyd relaxation, corner rounding | contemporary |

**Tessellations:** 3 regular, 3 truncated, 3 other semi-regular, each with a dual (Laves) toggle.

**Render modes:** construction overlay · line · interlace · solid/void (jali) · mosaic.

**Colour:** preset swatches or a generated ramp (hue, spread, saturation, lightness, contrast), with colour-by tile type / area / orientation / side count / position.

**Export:** SVG · PDF (the format `.ai` uses internally, so Illustrator opens it) · DXF R12 (AutoCAD opens it directly).

## Verification

Geometry is checked by measurement, not by eye:

- **18 tessellations** tile exactly — 0 bad of 16,200 sample points, at three rotations.
- **Multigrid** — 0 bad of 4,800, including the singular offsets where every line family meets at one point.
- **Penrose two ways** — the multigrid gives a thick:thin ratio of 1.632 and substitution deflation gives 1.618, against φ = 1.6180. Two unrelated constructions converging.
- **Substitution** — area conserved exactly (×1.000) at every depth for all three rep-tiles; Sierpinski loses exactly ¼ per step and is labelled a fractal, not a tiling.
- **Voronoi repeats** — base cells fill their repeat unit to within 0.021%, so the tiling is seamless.
- **Interlace** — over/under assigned at 100% of crossings on all 9 tilings.
- **Regression** — 120 randomised runs × 6 engines × 5 render modes × both palette modes, generating DXF and PDF each time: 0 errors.

## Honest gaps

- The **preset catalogue** is not built. Sections 5–6 of the research document call for named regional presets carrying source object, location, date, material, photo rights and a per-preset confidence label. Confidence is currently labelled *per engine* only. This is the largest gap against the brief.
- **Girih tiles are not built.** An earlier attempt at girih strapwork was removed because it did not work; the decagon-and-bowtie field in particular was never solved.
- **Snub square 3.3.4.3.4** and **snub hexagonal 3.3.3.3.6** — 2 of the 11 uniform tilings — are not built.
- **DWG** is not written; the format is proprietary. DXF is provided, which AutoCAD opens directly.
- **PDF and DXF have not been opened in Illustrator or AutoCAD.** They are validated structurally (xref offsets resolve, group codes are integers, POLYLINE/SEQEND balance) — which is not the same as those applications accepting them.
- Not yet built: Gothic tracery, Art Nouveau ironwork, Art Deco grammars, Ottoman floral fields, arboreal jali, and minimum-bridge validation for fabrication.

## Wallpaper groups (Draw on a grid)

The grid designer's Symmetry option implements all 17 plane symmetry groups [19], not just mirrors and rotations. The seven that need a glide reflection or a centred lattice (`pg`, `cm`, `pmg`, `pgg`, `cmm`, `p4g`, and the hexagonal `p3m1`) are an original implementation derived from the published classification, each independently checked before shipping: generate the group by repeatedly composing its own generators, confirm it closes (every composition lands back in the group) with exactly the textbook order (`p4g`/`p4m` both order 8, `p31m`/`p3m1` both order 6), then classify every reflection-type element as a genuine mirror or an irreducible glide by reducing its translation modulo the lattice and checking whether a fixed line exists. `p4g` needed particular care — minimising against the wrong axis makes a true mirror look like a glide — so the check was re-derived until the diagonal mirrors and axis-aligned glides came out matching the textbook structure exactly. The four options that existed before this work (`mx`/`my`/`mxy`/`d4`) were independently confirmed to already be pure `p4m`, with no glide hiding in them, so nothing there changed.

This was prompted by a study of a different, unrelated resource: Jaap Scherphuis's "Tiling Viewer" (jaapsch.net/tilings), a Java catalogue of isohedral tiling types. Its source carries no stated licence and its copyright is retained by its author, so none of its code or data was used; what is built here is original, from the public 17-group classification, in the spirit of what that catalogue does rather than from its implementation.

## Rights

Book diagrams and plate artwork are treated as copyrighted unless a specific edition and image licence permits reuse. **All geometry here is constructed from documented principles; no source photograph or book plate is reproduced.**

## Sources

Key references implemented directly: Hankin (1925) · Kaplan (2005) · The Met, *Islamic Art and Geometric Design* · de Bruijn (1981) · Lu & Steinhardt (2007) · Fathauer, *Tessellations: Mathematics, Art, and Recreation* (2021). The multigrid engine was prompted by Bhatia & Reich's *Pattern Collider*; the method is taken from de Bruijn and the code written here. The full 29-item register is in the app's Sources page.
