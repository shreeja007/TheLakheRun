"""T038: build smaller runtime copies of the character models and tiling textures.

Masters stay untouched in art-source/. This script writes runtime copies to public/models/:

* Character GLBs: each embedded PNG is re-encoded as lossless WebP and referenced through the
  EXT_texture_webp glTF extension. Geometry, materials and node names are copied unchanged.
* Tiling textures: each PNG that the game loads becomes a lossless WebP with the same name.

Every WebP is decoded again and compared with the source PNG; the script fails if one pixel differs.

Usage (from the repository root):  python scripts/optimize-runtime-assets.py
Requires Pillow with WebP support.
"""
import io
import json
import struct
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GLB_MASTERS = {
    'art-source/tuku_blockout_v02.glb': 'public/models/tuku_blockout_v02.glb',
    'art-source/lakhey_blockout_v02.glb': 'public/models/lakhey_blockout_v02.glb',
}
TEXTURE_MASTERS = ROOT / 'art-source' / 'textures'
TEXTURE_OUTPUT = ROOT / 'public' / 'models' / 'textures'
# Textures referenced by src/ at runtime. tex_prayer_flags.png is unused and is not shipped.
RUNTIME_TEXTURES = [
    'tex_brick_aged', 'tex_brick_dachi', 'tex_bronze_wheel', 'tex_hazard_chevron', 'tex_lantern_amber',
    'tex_matka_pottery', 'tex_road_flagstone', 'tex_road_sandstone', 'tex_roof_tiles', 'tex_stone_bridge',
    'tex_stone_mossy', 'tex_timber_sal', 'tex_torana_crest', 'tex_window_akijhya', 'tex_window_sanjhya',
]


def lossless_webp(png_bytes: bytes) -> bytes:
    source = Image.open(io.BytesIO(png_bytes))
    source.load()
    buffer = io.BytesIO()
    source.save(buffer, 'WEBP', lossless=True, quality=100, method=6, exact=True)
    webp = buffer.getvalue()
    decoded = Image.open(io.BytesIO(webp))
    decoded.load()
    if decoded.size != source.size or decoded.convert('RGBA').tobytes() != source.convert('RGBA').tobytes():
        raise SystemExit('WebP round trip changed pixels; refusing to write')
    return webp


def pad4(data: bytes, fill: bytes) -> bytes:
    return data + fill * ((4 - len(data) % 4) % 4)


def convert_glb(master: Path, output: Path) -> tuple[int, int]:
    data = master.read_bytes()
    magic, version, _length = struct.unpack_from('<III', data, 0)
    if magic != 0x46546C67 or version != 2:
        raise SystemExit(f'{master} is not a glTF 2.0 binary')
    json_length, json_type = struct.unpack_from('<II', data, 12)
    if json_type != 0x4E4F534A:
        raise SystemExit(f'{master}: first chunk is not JSON')
    gltf = json.loads(data[20:20 + json_length])
    bin_offset = 20 + json_length
    bin_length, bin_type = struct.unpack_from('<II', data, bin_offset)
    if bin_type != 0x004E4942:
        raise SystemExit(f'{master}: second chunk is not BIN')
    binary = data[bin_offset + 8:bin_offset + 8 + bin_length]

    views = [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in gltf['bufferViews']]
    converted = set()
    for index, image in enumerate(gltf.get('images', [])):
        if image.get('mimeType') != 'image/png' or 'bufferView' not in image:
            continue
        views[image['bufferView']] = lossless_webp(views[image['bufferView']])
        image['mimeType'] = 'image/webp'
        converted.add(index)
    for texture in gltf.get('textures', []):
        source = texture.get('source')
        if source in converted:
            del texture['source']
            texture.setdefault('extensions', {})['EXT_texture_webp'] = {'source': source}
    if converted:
        for key in ('extensionsUsed', 'extensionsRequired'):
            names = gltf.setdefault(key, [])
            if 'EXT_texture_webp' not in names:
                names.append('EXT_texture_webp')

    # Repack the binary chunk; accessors keep their offsets relative to their buffer view.
    packed = bytearray()
    for view, content in zip(gltf['bufferViews'], views):
        packed += b'\0' * ((4 - len(packed) % 4) % 4)
        view['byteOffset'] = len(packed)
        view['byteLength'] = len(content)
        packed += content
    packed = pad4(bytes(packed), b'\0')
    gltf['buffers'][0]['byteLength'] = len(packed)

    json_chunk = pad4(json.dumps(gltf, separators=(',', ':')).encode('utf-8'), b' ')
    total = 12 + 8 + len(json_chunk) + 8 + len(packed)
    result = struct.pack('<III', 0x46546C67, 2, total)
    result += struct.pack('<II', len(json_chunk), 0x4E4F534A) + json_chunk
    result += struct.pack('<II', len(packed), 0x004E4942) + packed
    output.write_bytes(result)
    return len(data), len(result)


def main() -> None:
    if not Image.registered_extensions().get('.webp'):
        raise SystemExit('Pillow was built without WebP support')
    before = after = 0
    for master, output in GLB_MASTERS.items():
        old, new = convert_glb(ROOT / master, ROOT / output)
        before += old
        after += new
        print(f'{output}: {old:,} -> {new:,} bytes')
    for name in RUNTIME_TEXTURES:
        png = (TEXTURE_MASTERS / f'{name}.png').read_bytes()
        webp = lossless_webp(png)
        (TEXTURE_OUTPUT / f'{name}.webp').write_bytes(webp)
        before += len(png)
        after += len(webp)
        print(f'textures/{name}.webp: {len(png):,} -> {len(webp):,} bytes')
    print(f'Total: {before:,} -> {after:,} bytes ({100 * (1 - after / before):.0f}% smaller), all pixel-identical')


if __name__ == '__main__':
    sys.exit(main())
