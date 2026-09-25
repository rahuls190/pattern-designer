# Pattern Designer

An interactive designer for geometric ornament, built on **documented construction methods** rather than style filters.

Open `index.html` in a browser. No build step, no dependencies, no server.

Built from the research catalogue *Geometric Pattern Research and Book Catalogue* (25 September 2026), whose central claim shapes the whole tool: a family label alone cannot generate faithful geometry — the same star arises from different grids. So the app exposes **construction engines**, never style presets.

## Construction engines

| Engine | Method | Status |
|---|---|---|
| **Polygons in contact** | Hankin's method in Kaplan's computational form, over 9 tilings × their duals = 18 tessellations | documented |
| **Star polygons {n/d}** | Compass construction (Met activity pack) | documented |
| **Girih strapwork** | The five girih tiles; straps cross each edge midpoint at 54° | partial |
| **Self-similar subdivision** | Penrose deflation, triangle rep-4, chair rep-4, Sierpinski | documented |
| **Quasiperiodic multigrid** | de Bruijn's multigrid — N=5 is Penrose, N=4 is Ammann–Beenker. An optional *Islamic star motif* runs Kaplan's polygons-in-contact over the tiles, giving 8-, 10-, 12- and 16-fold star patterns that no periodic tiling can | documented |
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
- **Girih decagon-and-bowtie field** is unsolved. Its area works out to exactly one bowtie per lattice cell, but no edge-to-edge placement was found across all rotations and anchor points tried, so it is withheld rather than shown wrong.
- **Snub square 3.3.4.3.4** and **snub hexagonal 3.3.3.3.6** — 2 of the 11 uniform tilings — are not built.
- **DWG** is not written; the format is proprietary. DXF is provided, which AutoCAD opens directly.
- **PDF and DXF have not been opened in Illustrator or AutoCAD.** They are validated structurally (xref offsets resolve, group codes are integers, POLYLINE/SEQEND balance) — which is not the same as those applications accepting them.
- Not yet built: wallpaper-group symmetry layer, Gothic tracery, Art Nouveau ironwork, Art Deco grammars, Ottoman floral fields, arboreal jali, and minimum-bridge validation for fabrication.

## Rights

Book diagrams and plate artwork are treated as copyrighted unless a specific edition and image licence permits reuse. **All geometry here is constructed from documented principles; no source photograph or book plate is reproduced.**

## Sources

Key references implemented directly: Hankin (1925) · Kaplan (2005) · The Met, *Islamic Art and Geometric Design* · de Bruijn (1981) · Lu & Steinhardt (2007) · Fathauer, *Tessellations: Mathematics, Art, and Recreation* (2021). The multigrid engine was prompted by Bhatia & Reich's *Pattern Collider*; the method is taken from de Bruijn and the code written here. The full 29-item register is in the app's Sources page.
