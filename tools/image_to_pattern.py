"""Trace a repeated, grid-based diagram into editable Pattern Designer data.

Use a manifest with one grid calibration per cropped diagram. The script finds
which grid edges recur in the scan; it never invents missing edges by symmetry.
Requires Pillow and NumPy. Run --help for arguments.
"""

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def point(origin, u, v, i, j):
    return (origin[0] + i * u[0] + j * v[0],
            origin[1] + i * u[1] + j * v[1])


def canonical(edge):
    x, y, a, b = edge
    return (x, y, a, b) if (x, y) <= (a, b) else (a, b, x, y)


def inside(p, bounds, excludes):
    x, y = p
    return (bounds[0] <= x <= bounds[2] and bounds[1] <= y <= bounds[3]
            and not any(r[0] <= x <= r[2] and r[1] <= y <= r[3]
                        for r in excludes))


def ink_at(image, x, y, radius, threshold):
    ix, iy = round(x), round(y)
    left, right = max(0, ix - radius), min(image.shape[1], ix + radius + 1)
    top, bottom = max(0, iy - radius), min(image.shape[0], iy + radius + 1)
    return left < right and top < bottom and np.min(image[top:bottom, left:right]) < threshold


def trace(spec, base):
    source = (base / spec['image']).resolve()
    image = np.array(Image.open(source).convert('L'))
    origin = spec['origin']
    u, v = spec['u'], spec['v']
    repeat = spec['repeat']
    rw, rh = (repeat, repeat) if isinstance(repeat, int) else repeat
    grid_type = spec.get('grid', 'square')
    if grid_type not in ('square', 'iso') or not (1 <= rw <= 64 and 1 <= rh <= 64):
        raise ValueError('Grid must be square/iso and repeat dimensions 1..64')
    if grid_type == 'iso' and rw != rh:
        raise ValueError('The website requires equal repeat dimensions for triangle grids')
    bounds = spec.get('bounds', [0, 0, image.shape[1] - 1, image.shape[0] - 1])
    excludes = spec.get('exclude', [])
    matrix = np.array([[u[0], v[0]], [u[1], v[1]]], dtype=float)
    if abs(np.linalg.det(matrix)) < 1:
        raise ValueError('Grid axes must be independent')
    corners = [(bounds[x], bounds[y]) for x in (0, 2) for y in (1, 3)]
    grid_corners = [np.linalg.solve(matrix, np.subtract(p, origin)) for p in corners]
    start = np.floor(np.min(grid_corners, axis=0)).astype(int) - 2
    stop = np.ceil(np.max(grid_corners, axis=0)).astype(int) + 2
    if np.prod(stop - start) > 150000:
        raise ValueError('Grid is too fine for this image; check axis vectors')
    directions = ([(1, 0), (0, 1), (1, 1), (1, -1)] if grid_type == 'square'
                  else [(1, 0), (0, 1), (1, -1)])
    radius = int(spec.get('radius', 3))
    threshold = int(spec.get('threshold', 170))
    min_points = int(spec.get('min_points', 13))
    min_support = int(spec.get('min_support', 3))
    vote_ratio = float(spec.get('vote_ratio', 0.65))
    votes = {}
    for i in range(start[0], stop[0] + 1):
        for j in range(start[1], stop[1] + 1):
            a = point(origin, u, v, i, j)
            if not inside(a, bounds, excludes):
                continue
            for di, dj in directions:
                b = point(origin, u, v, i + di, j + dj)
                if not inside(b, bounds, excludes):
                    continue
                hits = sum(int(ink_at(image, a[0] + t * (b[0] - a[0]),
                                      a[1] + t * (b[1] - a[1]), radius, threshold))
                           for t in np.linspace(.15, .85, 15))
                key = canonical((i % rw, j % rh, i % rw + di, j % rh + dj))
                v0 = votes.setdefault(key, [0, 0])
                v0[0] += int(hits >= min_points)
                v0[1] += 1
    accepted, uncertain = [], []
    for edge, (present, samples) in sorted(votes.items()):
        if samples >= min_support and present / samples >= vote_ratio:
            accepted.append(edge)
        elif present:
            uncertain.append({'edge': edge, 'present': present, 'samples': samples})
    if not accepted:
        raise ValueError(f"{spec['id']}: no repeated lines found; check grid calibration")
    state = {'gType': grid_type, 'gW': rw, 'gH': rh, 'gSub': 1, 'gSize': 40,
             'gSym': 'none', 'gTool': 'line', 'gShowGrid': False,
             'gShowCell': True, 'gBand': False, 'width': 2, 'pal': 1,
             'frame': False,
             'gData': ';'.join(','.join(map(str, edge)) for edge in accepted),
             'gCirc': '', 'gArcs': '', 'gFill': ''}
    entry = {'id': spec['id'], 'group': spec.get('complexity', 'Medium'),
             'name': spec['name'], 'note': spec.get('complexity', 'Medium'),
             's': state}
    report = {'id': spec['id'], 'source': str(source), 'accepted': len(accepted),
              'uncertain': uncertain, 'grid': grid_type, 'repeat': [rw, rh],
              'warning': 'Line tracing only. Check curves, band crossings, and scan artifacts against the source.'}
    return entry, report, image, accepted, bounds, origin, u, v


def comparison(image, edges, bounds, origin, u, v, repeat, output):
    left, top, right, bottom = map(int, bounds)
    source = Image.fromarray(image[top:bottom, left:right]).convert('RGB')
    sx = 650 / max(1, right - left)
    sy = 650 / max(1, bottom - top)
    factor = min(sx, sy)
    source = source.resize((round(source.width * factor), round(source.height * factor)))
    artwork = Image.new('RGB', source.size, '#ffffff')
    pen = ImageDraw.Draw(artwork)
    rw, rh = repeat
    for tx in range(-10, 11):
        for ty in range(-10, 11):
            for i, j, k, m in edges:
                a = point(origin, u, v, i + tx * rw, j + ty * rh)
                b = point(origin, u, v, k + tx * rw, m + ty * rh)
                if not (left - 30 <= a[0] <= right + 30 and top - 30 <= a[1] <= bottom + 30):
                    continue
                ax, ay = round((a[0] - left) * factor), round((a[1] - top) * factor)
                bx, by = round((b[0] - left) * factor), round((b[1] - top) * factor)
                pen.line((ax, ay, bx, by), fill='#172f85', width=2)
    pair = Image.new('RGB', (source.width * 2, source.height), '#ffffff')
    pair.paste(source, (0, 0))
    pair.paste(artwork, (source.width, 0))
    pair.save(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path, help='JSON manifest of cropped diagrams and grid calibrations')
    parser.add_argument('--site', type=Path, default=Path(__file__).resolve().parent.parent,
                        help='Website folder containing index.html')
    parser.add_argument('--review', type=Path, help='Folder for source/drawing comparisons')
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text(encoding='utf-8'))
    specs = manifest['patterns']
    site = args.site.resolve()
    site.mkdir(parents=True, exist_ok=True)
    review = (args.review or site / 'image-pattern-review').resolve()
    review.mkdir(parents=True, exist_ok=True)
    lib_path = site / 'image-patterns.json'
    entries = json.loads(lib_path.read_text(encoding='utf-8')) if lib_path.exists() else []
    by_id = {e['id']: e for e in entries}
    reports = []
    for spec in specs:
        entry, report, image, edges, bounds, origin, u, v = trace(spec, args.manifest.resolve().parent)
        by_id[entry['id']] = entry
        comparison(image, edges, bounds, origin, u, v, report['repeat'],
                   review / (entry['id'] + '.png'))
        (review / (entry['id'] + '.json')).write_text(
            json.dumps(entry, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        reports.append(report)
    entries = sorted(by_id.values(), key=lambda e: e['id'])
    lib_path.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (site / 'image-patterns.js').write_text(
        'const IMAGE_PATTERNS = ' + json.dumps(entries, ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8')
    (review / 'report.json').write_text(json.dumps(reports, indent=2) + '\n', encoding='utf-8')
    print(f'Added or updated {len(reports)} patterns; {len(entries)} total in {lib_path}')
    for report in reports:
        print(f"  {report['id']}: {report['accepted']} lines, {len(report['uncertain'])} uncertain")
    print(f'Review source and traced linework in {review}')


if __name__ == '__main__':
    main()
