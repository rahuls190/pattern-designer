# Circle reconstructions

Seven editable repeating constructions from Robert Field, printed pages 48-51 (PDF pages 25-26). Data: `reference-data/circles.json`. No app or shared verifier changes.

## Geometry and source evidence

| Design | Printed page | Construction |
|---|---:|---|
| Woking layered rings | 48 | Source grid gives foreground radius 5 and concentric radii 4, 3.5, 3, 2. Foreground centers repeat 20 horizontally and 10 vertically. Background centers are offset by (+/-5,-5). Keep complete radius-2 circles and the outward arcs of larger circles. Endpoints are analytic intersections with the foreground radius-5 disks. The isolated inward fragments are absent in the drawing and are deliberately omitted. |
| Yeni Cami paired circles | 49 upper left | Isometric lattice pitch 10, radii 7.5 and 8. Measurements on the 500-pixel inspection crop found horizontal center pitch about 162 pixels and radii about 122 and 130 pixels. Ratios 0.753 and 0.802 support the half-grid construction 0.75 and 0.8. |
| Topkapi rosettes | 49 lower right | Large circles pass through neighboring centers. Small radius is 3/8 of the large, explicitly stated by the book. Source lattice orientation differs from the app basis by 30 degrees. Three centers in an isometric repeat encode that orientation exactly; radii are 8/sqrt(3) and 3/sqrt(3). |
| Zabid linked medallions | 50 upper | Source construction square has nine intervals. Center pitch 9, outer radius 4.5, inner radius 2.5, strip width 1. Outer quadrant arcs terminate at strip edges; strips meet inner circles at exact intersections. |
| Sanaa diagonal crossings | 50 lower | Radius-4 circles on alternating points of a square lattice of spacing 4. Each central opening contains an X, not a diamond perimeter. Endpoints are (+/-a,+/-a), where a=4(1-1/sqrt(2)). |
| Sanaa inscribed squares | 51 upper | Same circle lattice. Square corners are (+/-a,+/-a), exactly on adjacent circles. |
| Cordoba squares and spokes | 51 lower | Same circle and square construction; cardinal spokes connect square side midpoints to circle extrema. |

Coordinates retain floating-point evaluations of the exact formulas, without coarse-grid rounding. All curves are native circles or circular arcs; no polygonal curve substitutes are used.

## Verification

- Inspected both complete source spreads and all seven enlarged source crops.
- Rendered every JSON entry through the unchanged app's `gridThumb` / `renderGrid` using Playwright and Edge.
- Checked coordinate tuple sizes, finite coordinates, equal start/end radii for every stored arc, and absence of browser errors or invalid SVG coordinates.
- Visually inspected all seven source-versus-rendered comparisons. Corrected the Topkapi orientation and Woking disconnected fragments after the initial comparison, then inspected the corrected images.
- Each comparison shows a source crop on the left and an app rendering on the right. Repeated extents and translation differ; colors are the requested app palette 1. These are visual comparisons, not registered pixel-error overlays.
- The renderer reported harmless font-cache write warnings while making image labels. All comparison images were produced and inspected.

## Limits and uncertainty

These are credible reconstructions of the intended repeating geometry, not pixel-exact traces of the scanned hand drawings. The scan has skew, stroke variation, and construction-grid overlays. Those overlays and the diagrams' irregular outside cuts are not part of the repeating motifs. The app continues each pattern periodically.

The Yeni Cami radii are inferred from its visible grid and measured proportions; the book does not print numerical dimensions for them. The square-corner dimensions and arc endpoints are derived analytically from the visible incidences, not claimed as dimensions stated by the author. No design was omitted, and no claim of fidelity is based only on a nonempty render.

Run `circles-inspect.cjs` after rendering the two spreads to regenerate crops. Run `circles-measure.cjs` for the Yeni Cami pixel measurements and `circles-verify.cjs` for app renders, comparisons, and the numerical audit. These scripts use the bundled Node packages and Edge.

QA files are in `../tmp/pdfs/circles/`. Open `circles-comparisons.html` there to review all seven comparisons.
