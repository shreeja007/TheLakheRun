"""T040: build public/models/street_kit.glb from the untouched masters in art-source/.

Each model is flattened to one mesh per material, with faces the game camera can never see removed.
The placement rule that makes this safe: every model stands beside the road with its local +Z front
facing the road, so its back is never seen. Textures are not embedded; the game applies its own.

Usage (from the repository root): python scripts/build-street-kit.py
Requires numpy. Writes the kit and a per-model before/after report (JSON).
"""
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public' / 'models' / 'street_kit.glb'
REPORT = ROOT / 'reports' / 'evidence' / 'T040' / 'street-kit-report.json'
PALETTE_SOURCE = ROOT / 'art-source' / 'street_props_v01' / 'prop_palette.png'
PALETTE_OUTPUT = ROOT / 'public' / 'models' / 'textures' / 'tex_street_palette.webp'

# Source material name -> kit material. Near-black door iron merges into timber.
MATERIAL_MAP = {
    'Brick_OriginalTile': 'Street_Brick',
    'Roof_OriginalTile': 'Street_Roof',
    'Plain_Dark_Timber': 'Street_Timber',
    'Door_Iron': 'Street_Timber',
    'Stone_Plith': 'Street_Stone',
    'Opaque_Window_Recess': 'Street_Window',
    # Props and spectators (T043/T044) carry their own colours in a shared palette.
    'Prop_Palette': 'Street_Palette',
}
KIT_MATERIALS = ['Street_Brick', 'Street_Roof', 'Street_Timber', 'Street_Stone', 'Street_Window', 'Street_Palette']
# Flat fallbacks, used until the game assigns its own materials.
FALLBACK_COLORS = {
    'Street_Brick': [0.33, 0.11, 0.06, 1], 'Street_Roof': [0.26, 0.08, 0.05, 1], 'Street_Timber': [0.07, 0.04, 0.02, 1],
    'Street_Stone': [0.18, 0.17, 0.14, 1], 'Street_Window': [0.4, 0.2, 0.05, 1], 'Street_Palette': [1, 1, 1, 1],
}

COMPONENT = {5126: ('f', 4), 5123: ('H', 2), 5125: ('I', 4), 5121: ('B', 1)}
TYPE_N = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def load_glb(path):
    data = path.read_bytes()
    json_length = struct.unpack_from('<I', data, 12)[0]
    gltf = json.loads(data[20:20 + json_length])
    return gltf, data[20 + json_length + 8:], len(data)


def read_accessor(gltf, binary, index):
    accessor = gltf['accessors'][index]
    view = gltf['bufferViews'][accessor['bufferView']]
    code, _ = COMPONENT[accessor['componentType']]
    count = TYPE_N[accessor['type']]
    offset = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    values = np.frombuffer(binary, dtype='<' + code, count=accessor['count'] * count, offset=offset)
    return values.reshape(-1, count) if count > 1 else values


def local_matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix'], dtype=np.float64).reshape(4, 4).T
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    rotation = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                         [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                         [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    matrix = np.eye(4)
    matrix[:3, :3] = rotation * np.array(node.get('scale', [1, 1, 1]), dtype=np.float64)
    matrix[:3, 3] = node.get('translation', [0, 0, 0])
    return matrix


def flatten(path):
    """World-space triangles per kit material: dict name -> (positions, normals, uvs), each (n, 3, k)."""
    gltf, binary, size = load_glb(path)
    groups = {}
    stats = {'parts': 0, 'triangles': 0}

    def visit(index, parent):
        node = gltf['nodes'][index]
        matrix = parent @ local_matrix(node)
        if 'mesh' in node:
            normal_matrix = np.linalg.inv(matrix[:3, :3]).T
            for primitive in gltf['meshes'][node['mesh']]['primitives']:
                stats['parts'] += 1
                attributes = primitive['attributes']
                indices = read_accessor(gltf, binary, primitive['indices']).astype(np.int64).reshape(-1, 3)
                stats['triangles'] += len(indices)
                positions = read_accessor(gltf, binary, attributes['POSITION']).astype(np.float64) @ matrix[:3, :3].T + matrix[:3, 3]
                normals = read_accessor(gltf, binary, attributes['NORMAL']).astype(np.float64) @ normal_matrix.T
                normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-9)
                uvs = read_accessor(gltf, binary, attributes['TEXCOORD_0']).astype(np.float64) if 'TEXCOORD_0' in attributes \
                    else np.zeros((len(positions), 2))
                name = MATERIAL_MAP[gltf['materials'][primitive['material']]['name']]
                groups.setdefault(name, []).append((positions[indices], normals[indices], uvs[indices]))
        for child in node.get('children', []):
            visit(child, matrix)

    for root_index in gltf['scenes'][gltf.get('scene', 0)]['nodes']:
        visit(root_index, np.eye(4))
    merged = {name: tuple(np.concatenate([part[i] for part in parts]) for i in range(3)) for name, parts in groups.items()}
    stats['bytes'] = size
    return merged, stats


def face_data(positions):
    centroid = positions.mean(axis=1)
    cross = np.cross(positions[:, 1] - positions[:, 0], positions[:, 2] - positions[:, 0])
    area = np.linalg.norm(cross, axis=1) / 2
    unit = cross / np.maximum(2 * area, 1e-12)[:, None]
    return centroid, unit, area


def building_keep(name, positions, half_x, back_z):
    """Keep what the road camera can see for a building whose front (+Z) faces the road."""
    c, n, area = face_data(positions)
    drop = n[:, 2] < -0.7                                     # anything facing backwards
    drop |= (n[:, 1] < -0.7) & (c[:, 1] < 0.1)                # ground-level undersides
    drop |= (n[:, 1] < -0.7) & (area < 0.02)                   # undersides of small bars and sills
    side_inner = (np.abs(c[:, 0]) > half_x - 0.6) & (n[:, 0] * np.sign(c[:, 0]) < -0.7)
    drop |= side_inner                                         # faces of side windows pointing into the wall
    if name == 'Street_Roof':
        drop |= (n[:, 2] < -0.15) & (n[:, 1] > 0.15)           # back roof slope, hidden by the ridge
        drop |= (c[:, 2] < -1.0) & (n[:, 1] < -0.5)            # back eave underside
    else:
        outer_side = (np.abs(c[:, 0]) > half_x - 0.15) & (n[:, 0] * np.sign(c[:, 0]) > 0.7)
        drop |= (c[:, 2] < back_z + 0.25) & ~outer_side        # back wall, back windows and their trim
    return ~drop


def gateway_keep(name, positions):
    c, n, area = face_data(positions)
    drop = (n[:, 2] < -0.7) | ((n[:, 1] < -0.7) & (c[:, 1] < 0.1))
    return ~drop


def weld(triangles):
    """Index a triangle soup, sharing vertices with identical position, normal and uv."""
    positions, normals, uvs = triangles
    flat = np.concatenate([positions.reshape(-1, 3), normals.reshape(-1, 3), uvs.reshape(-1, 2)], axis=1).astype(np.float32)
    rounded = np.round(flat, 4)
    _, first, inverse = np.unique(rounded, axis=0, return_index=True, return_inverse=True)
    return flat[first], inverse.astype(np.uint32).reshape(-1)


MODELS = [
    # name, master, cleaner (None keeps every face)
    ('Building01', 'art-source/building01_blockout_v01/building01_residence_v01.glb',
     lambda name, p: building_keep(name, p, 2.8, -1.7)),
    ('Building02', 'art-source/building02_blockout_v01/building02_shopfront_v01.glb',
     lambda name, p: building_keep(name, p, 3.2, -1.85)),
    ('Gateway', 'art-source/gateway_blockout_v01/everyday_gateway_v01.glb', gateway_keep),
    # Generated by art-source/street_props_v01/generate_props.py and already built for the game camera.
    ('MarketCart', 'art-source/street_props_v01/market_cart_v01.glb', None),
    ('Spectator01', 'art-source/street_props_v01/spectator_01_v01.glb', None),
    ('Spectator02', 'art-source/street_props_v01/spectator_02_v01.glb', None),
    ('Spectator03', 'art-source/street_props_v01/spectator_03_v01.glb', None),
    # Low-detail versions for the distant terrace crowd.
    ('Spectator01Far', 'art-source/street_props_v01/spectator_01_far_v01.glb', None),
    ('Spectator02Far', 'art-source/street_props_v01/spectator_02_far_v01.glb', None),
    ('Spectator03Far', 'art-source/street_props_v01/spectator_03_far_v01.glb', None),
]


def main():
    nodes, meshes, accessors, views, blob = [], [], [], [], bytearray()
    roots = []
    report = {}

    def add_view(array, target):
        while len(blob) % 4:
            blob.append(0)
        views.append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': array.nbytes, 'target': target})
        blob.extend(array.tobytes())
        return len(views) - 1

    for model, master, cleaner in MODELS:
        path = ROOT / master
        if not path.exists():
            continue
        groups, stats = flatten(path)
        if model == 'Gateway':
            # Tiny lintel bolts: 81 % of the gateway's triangles for 0.2 m2, invisible at game scale.
            positions, _, _ = groups['Street_Timber']
            _, _, area = face_data(positions)
            keep = area >= 0.01
            groups['Street_Timber'] = tuple(part[keep] for part in groups['Street_Timber'])
        children, triangles, vertices = [], 0, 0
        for name in KIT_MATERIALS:
            if name not in groups:
                continue
            soup = groups[name]
            if cleaner:
                keep = cleaner(name, soup[0])
                soup = tuple(part[keep] for part in soup)
            if not len(soup[0]):
                continue
            vertex_data, index_data = weld(soup)
            triangles += len(index_data) // 3
            vertices += len(vertex_data)
            assert len(vertex_data) < 65535, (model, name)
            position_view = add_view(vertex_data[:, :3].astype('<f4'), 34962)
            normal_view = add_view(vertex_data[:, 3:6].astype('<f4'), 34962)
            uv_view = add_view(vertex_data[:, 6:8].astype('<f4'), 34962)
            index_view = add_view(index_data.astype('<u2'), 34963)
            first = len(accessors)
            accessors += [
                {'bufferView': position_view, 'componentType': 5126, 'count': len(vertex_data), 'type': 'VEC3',
                 'min': vertex_data[:, :3].min(0).tolist(), 'max': vertex_data[:, :3].max(0).tolist()},
                {'bufferView': normal_view, 'componentType': 5126, 'count': len(vertex_data), 'type': 'VEC3'},
                {'bufferView': uv_view, 'componentType': 5126, 'count': len(vertex_data), 'type': 'VEC2'},
                {'bufferView': index_view, 'componentType': 5123, 'count': len(index_data), 'type': 'SCALAR'},
            ]
            meshes.append({'name': f'{model}_{name}', 'primitives': [{
                'attributes': {'POSITION': first, 'NORMAL': first + 1, 'TEXCOORD_0': first + 2},
                'indices': first + 3, 'material': KIT_MATERIALS.index(name)}]})
            nodes.append({'name': f'{model}_{name}', 'mesh': len(meshes) - 1})
            children.append(len(nodes) - 1)
        nodes.append({'name': model, 'children': children})
        roots.append(len(nodes) - 1)
        report[model] = {'before': stats, 'after': {'parts': len(children), 'triangles': triangles, 'vertices': vertices}}

    while len(blob) % 4:
        blob.append(0)
    gltf = {
        'asset': {'version': '2.0', 'generator': 'lakhey-run scripts/build-street-kit.py'},
        'scene': 0, 'scenes': [{'nodes': roots}], 'nodes': nodes, 'meshes': meshes,
        'materials': [{'name': name, 'pbrMetallicRoughness': {'baseColorFactor': FALLBACK_COLORS[name], 'metallicFactor': 0, 'roughnessFactor': 0.86}}
                      for name in KIT_MATERIALS],
        'accessors': accessors, 'bufferViews': views, 'buffers': [{'byteLength': len(blob)}],
    }
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    json_bytes += b' ' * ((4 - len(json_bytes) % 4) % 4)
    total = 12 + 8 + len(json_bytes) + 8 + len(blob)
    OUTPUT.write_bytes(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(json_bytes), 0x4E4F534A) + json_bytes
                       + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob))
    report['kit_bytes'] = total
    if PALETTE_SOURCE.exists():
        palette = Image.open(PALETTE_SOURCE).convert('RGB')
        palette.save(PALETTE_OUTPUT, 'WEBP', lossless=True, quality=100, method=6)
        decoded = Image.open(PALETTE_OUTPUT).convert('RGB')
        assert decoded.tobytes() == palette.tobytes(), 'palette WebP changed pixels'
        report['palette_bytes'] = PALETTE_OUTPUT.stat().st_size
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
