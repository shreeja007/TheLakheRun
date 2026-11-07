"""T043/T044: original procedural low-detail street props from the T023 concept sheets.

Builds a market cart and three everyday spectators for the game's roadside: editable .blend, GLB and previews.
Every model uses one shared palette material, so all of them can draw together in very few draw calls.

Run: blender --background --factory-startup --python-exit-code 1 --python art-source/street_props_v01/generate_props.py
Blender: Z-up, front -Y. GLB: Y-up, front +Z. Metres; ground at zero. Static: no rig or clips.
"""
import math
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
CELL = 16
GRID = 8

# sRGB colours sampled by eye from the T023 sheets. Order fixes each colour's palette cell.
PALETTE = {
    'skin_a': (201, 150, 107), 'skin_b': (185, 132, 88), 'skin_c': (195, 154, 120),
    'hair_dark': (28, 23, 20), 'hair_grey': (58, 54, 50), 'eye': (18, 15, 14),
    'ochre': (200, 150, 58), 'cream': (239, 230, 210), 'navy': (45, 58, 85), 'shoe_white': (232, 228, 218),
    'rust': (143, 62, 46), 'rust_dark': (112, 46, 34), 'olive': (74, 74, 54), 'shoe_dark': (42, 38, 35),
    'plum': (94, 47, 69), 'cream_b': (227, 217, 198), 'charcoal': (53, 52, 58), 'shoe_black': (29, 28, 30),
    'wood': (154, 107, 58), 'wood_dark': (107, 71, 38), 'steel': (44, 46, 49), 'tyre': (27, 27, 29), 'hub': (138, 138, 134),
    'leaf': (78, 143, 52), 'leaf_dark': (58, 122, 43), 'tomato': (184, 64, 42), 'cucumber': (47, 107, 46),
}
NAMES = list(PALETTE)


def palette_uv(name):
    index = NAMES.index(name)
    return ((index % GRID + 0.5) / GRID, 1 - (index // GRID + 0.5) / GRID)


def make_palette():
    size = CELL * GRID
    image = bpy.data.images.new('prop_palette', size, size, alpha=False)
    image.colorspace_settings.name = 'sRGB'  # before writing pixels: changing it later clears the buffer
    pixels = [0.0] * (size * size * 4)
    for name, rgb in PALETTE.items():
        index = NAMES.index(name)
        col, row = index % GRID, index // GRID
        for y in range(CELL):
            for x in range(CELL):
                px = col * CELL + x
                py = size - 1 - (row * CELL + y)
                i = (py * size + px) * 4
                pixels[i:i + 4] = [c / 255 for c in rgb] + [1.0]
    image.pixels.foreach_set(pixels)
    image.update()
    image.file_format = 'PNG'
    image.filepath_raw = str(OUT / 'prop_palette.png')
    image.save()
    image.pack()
    return image


class Builder:
    """Collects simple solids into one bmesh, each painted by pointing its UVs at a palette cell."""

    def __init__(self):
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.new('UVMap')

    def _paint(self, faces, color, smooth=False):
        u, v = palette_uv(color)
        for face in faces:
            for loop in face.loops:
                loop[self.uv].uv = (u, v)
            face.smooth = smooth

    def box(self, size, location, color, rotation=None):
        result = bmesh.ops.create_cube(self.bm, size=1)
        verts = result['verts']
        matrix = Matrix.Translation(location) @ (rotation or Matrix.Identity(4)) @ Matrix.Diagonal((*size, 1))
        bmesh.ops.transform(self.bm, matrix=matrix, verts=verts)
        self._paint({f for v in verts for f in v.link_faces}, color)

    def ball(self, radius, location, color, scale=(1, 1, 1), subdivisions=2):
        result = bmesh.ops.create_icosphere(self.bm, subdivisions=subdivisions, radius=1)
        verts = result['verts']
        matrix = Matrix.Translation(location) @ Matrix.Diagonal((radius * scale[0], radius * scale[1], radius * scale[2], 1))
        bmesh.ops.transform(self.bm, matrix=matrix, verts=verts)
        self._paint({f for v in verts for f in v.link_faces}, color, smooth=True)

    def limb(self, start, end, r_start, r_end, color, sides=7, smooth=True):
        """A tapered prism between two points."""
        start, end = Vector(start), Vector(end)
        axis = end - start
        rotation = axis.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        result = bmesh.ops.create_cone(self.bm, cap_ends=True, cap_tris=False, segments=sides,
                                       radius1=r_start, radius2=r_end, depth=axis.length)
        matrix = Matrix.Translation((start + end) / 2) @ rotation
        bmesh.ops.transform(self.bm, matrix=matrix, verts=result['verts'])
        self._paint({f for v in result['verts'] for f in v.link_faces}, color, smooth=smooth)

    def finish(self, name, root_name, collection, material):
        bmesh.ops.triangulate(self.bm, faces=self.bm.faces[:])
        mesh = bpy.data.meshes.new(f'{name}_Mesh')
        self.bm.to_mesh(mesh)
        self.bm.free()
        mesh.materials.append(material)
        obj = bpy.data.objects.new(name, mesh)
        root = bpy.data.objects.new(root_name, None)
        collection.objects.link(root)
        collection.objects.link(obj)
        obj.parent = root
        return root, obj, len(mesh.polygons)


def build_spectator(b, skin, hair, top, top_dark, inner, legs, shoes, pose, hair_style, far=False):
    """About 1.65 m tall, front -Y. Pose only changes the arms. far=True is the distant-crowd version."""
    subdivisions = 1 if far else 2
    sides = 5 if far else 7
    # Legs and shoes
    for side in (-1, 1):
        hip = (side * 0.1, 0, 0.86)
        knee = (side * 0.11, -0.01, 0.48)
        ankle = (side * 0.115, 0, 0.09)
        b.limb(hip, knee, 0.088, 0.066, legs, sides=sides)
        if not far:
            b.ball(0.066, knee, legs, subdivisions=1)
        b.limb(knee, ankle, 0.064, 0.045, legs, sides=sides)
        b.ball(0.058, (side * 0.115, -0.07, 0.05), shoes, scale=(0.9, 2.0, 0.85), subdivisions=1)
    # Torso: jacket with a lighter inner panel at the front
    b.limb((0, 0, 0.8), (0, 0, 1.0), 0.17, 0.15, top, sides=6 if far else 10)
    b.limb((0, 0, 1.0), (0, 0, 1.33), 0.15, 0.17, top, sides=6 if far else 10)
    b.ball(0.175, (0, 0, 1.33), top, scale=(1.08, 0.72, 0.42), subdivisions=subdivisions)
    b.box((0.09, 0.02, 0.34), (0, -0.152, 1.08), inner)
    # Neck and head
    b.limb((0, 0, 1.36), (0, 0, 1.44), 0.05, 0.05, skin, sides=sides)
    b.ball(0.105, (0, -0.01, 1.53), skin, scale=(0.95, 1, 1.12), subdivisions=subdivisions)
    if not far:
        for side in (-1, 1):
            b.ball(0.012, (side * 0.04, -0.105, 1.545), 'eye', subdivisions=1)
    # Hair
    b.ball(0.112, (0, 0.012, 1.56), hair, scale=(0.98, 0.96, 1.02), subdivisions=subdivisions)
    if hair_style == 'ponytail':
        b.limb((0, 0.1, 1.56), (0, 0.15, 1.36), 0.04, 0.02, hair, sides=sides)
    elif hair_style == 'bun':
        b.ball(0.05, (0, 0.11, 1.6), hair, subdivisions=1)
    # Arms: shoulder -> elbow -> hand, per side
    for side, elbow, hand in pose:
        shoulder = (side * 0.2, 0, 1.33)
        if not far:
            b.ball(0.065, shoulder, top, subdivisions=1)
            b.ball(0.05, elbow, top, subdivisions=1)
        b.limb(shoulder, elbow, 0.06, 0.05, top, sides=sides)
        b.limb(elbow, hand, 0.048, 0.036, top, sides=sides)
        b.ball(0.042, hand, skin, subdivisions=1)


def build_cart(b):
    """Two-wheel produce handcart: timber box, steel underframe, two handles, rear feet. Front -Y is its long side."""
    deck_z = 0.62
    # Box: floor, slatted sides
    b.box((1.3, 0.72, 0.04), (0, 0, deck_z), 'wood_dark')
    for slat in (0.1, 0.21):
        for side in (-1, 1):
            b.box((1.34, 0.03, 0.08), (0, side * 0.37, deck_z + slat), 'wood')
            b.box((0.03, 0.74, 0.08), (side * 0.66, 0, deck_z + slat), 'wood')
    for x in (-0.66, 0, 0.66):
        for side in (-1, 1):
            b.box((0.05, 0.05, 0.3), (x, side * 0.38, deck_z + 0.13), 'wood_dark')
    # Steel underframe, axle and wheels
    b.box((1.2, 0.04, 0.04), (0, -0.28, deck_z - 0.05), 'steel')
    b.box((1.2, 0.04, 0.04), (0, 0.28, deck_z - 0.05), 'steel')
    b.limb((0, -0.46, 0.27), (0, 0.46, 0.27), 0.015, 0.015, 'steel', sides=4, smooth=False)
    for side in (-1, 1):
        b.limb((0, side * 0.41, 0.27), (0, side * 0.49, 0.27), 0.27, 0.27, 'tyre', sides=14, smooth=False)
        b.limb((0, side * 0.39, 0.27), (0, side * 0.51, 0.27), 0.1, 0.1, 'hub', sides=6, smooth=False)
        for brace_x in (-0.1, 0.1):
            b.limb((brace_x, side * 0.28, deck_z - 0.05), (0, side * 0.34, 0.27), 0.012, 0.012, 'steel', sides=4, smooth=False)
    # Handles with grips, rear support feet
    for side in (-1, 1):
        b.limb((0.6, side * 0.26, deck_z - 0.04), (1.42, side * 0.26, 0.82), 0.016, 0.016, 'steel', sides=4, smooth=False)
        b.limb((1.3, side * 0.26, 0.785), (1.44, side * 0.26, 0.825), 0.022, 0.022, 'tyre', sides=5, smooth=False)
        b.limb((0.56, side * 0.26, deck_z - 0.05), (0.62, side * 0.26, 0.0), 0.014, 0.014, 'steel', sides=4, smooth=False)
    # Produce heaped by bay: leaves / tomatoes / leaves
    top = deck_z + 0.26
    for x, y, r in [(-0.5, -0.17, 0.11), (-0.28, -0.2, 0.1), (-0.48, 0.14, 0.12), (-0.24, 0.15, 0.1), (-0.37, 0, 0.13)]:
        b.ball(r, (x, y, top), 'leaf' if int(x * 100) % 2 else 'leaf_dark', scale=(1.1, 1.1, 0.7), subdivisions=1)
    for x, y in [(-0.06, -0.15), (0.08, -0.17), (-0.05, 0.02), (0.1, 0.0), (-0.04, 0.17), (0.09, 0.16)]:
        b.ball(0.065, (x, y, top - 0.02), 'tomato', subdivisions=1)
    for x, y, r in [(0.34, -0.16, 0.1), (0.54, -0.14, 0.1), (0.36, 0.14, 0.11), (0.55, 0.15, 0.09)]:
        b.ball(r, (x, y, top), 'leaf_dark', scale=(1.1, 1.1, 0.7), subdivisions=1)
    b.limb((0.3, 0, top + 0.03), (0.58, 0, top + 0.04), 0.03, 0.03, 'cucumber', sides=5, smooth=False)


def export_glb(root, obj, path):
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True, export_yup=True,
                              export_apply=True, export_animations=False, export_materials='EXPORT')


def render_preview(path, root_obj, height):
    scene = bpy.context.scene
    for other in bpy.data.objects:
        if other.type == 'MESH' and other.name != 'PREVIEW_FLOOR':
            other.hide_render = other.parent is not root_obj
    camera = scene.camera
    distance = max(height * 2.3, 3.4)
    camera.location = (distance * 0.55, -distance, height * 0.78)
    direction = Vector((0, 0, height * 0.5)) - camera.location
    camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def main():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = False
    scene.render.resolution_x = 700
    scene.render.resolution_y = 700
    scene.view_settings.view_transform = 'Standard'

    image = make_palette()
    material = bpy.data.materials.new('Prop_Palette')
    material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value = 0.86
    texture = material.node_tree.nodes.new('ShaderNodeTexImage')
    texture.image = image
    texture.interpolation = 'Closest'
    material.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])

    collection = bpy.data.collections.new('STREET_PROPS')
    scene.collection.children.link(collection)

    models = []

    b = Builder()
    build_cart(b)
    models.append(('market_cart_v01', 'MarketCartRoot', b, 1.0))

    people = [
        # One arm waving / relaxed
        ('spectator_01', 'Spectator01', ('skin_a', 'hair_dark', 'ochre', 'ochre', 'cream', 'navy', 'shoe_white',
         [(-1, (-0.27, -0.02, 1.05), (-0.26, -0.08, 0.82)), (1, (0.33, -0.03, 1.5), (0.36, -0.06, 1.78))], 'ponytail')),
        # Hands on hips, cheering stance
        ('spectator_02', 'Spectator02', ('skin_b', 'hair_dark', 'rust', 'rust_dark', 'rust_dark', 'olive', 'shoe_dark',
         [(-1, (-0.36, 0.02, 1.08), (-0.2, -0.08, 0.92)), (1, (0.36, 0.02, 1.08), (0.2, -0.08, 0.92))], 'short')),
        # Clapping: hands together in front
        ('spectator_03', 'Spectator03', ('skin_c', 'hair_grey', 'plum', 'plum', 'cream_b', 'charcoal', 'shoe_black',
         [(-1, (-0.27, -0.1, 1.08), (-0.04, -0.27, 1.2)), (1, (0.27, -0.1, 1.08), (0.04, -0.27, 1.2))], 'bun')),
    ]
    for filename, root_name, args in people:
        b = Builder()
        build_spectator(b, *args)
        models.append((f'{filename}_v01', f'{root_name}Root', b, 1.8))
        b = Builder()
        build_spectator(b, *args, far=True)
        models.append((f'{filename}_far_v01', f'{root_name}FarRoot', b, 1.8))

    built = []
    for filename, root_name, builder, height in models:
        root, obj, triangles = builder.finish(filename, root_name, collection, material)
        export_glb(root, obj, OUT / f'{filename}.glb')
        built.append((filename, root, height, triangles))
        print(f'{filename}: {triangles} triangles')

    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'street_props_v01.blend'))

    # Previews only: floor, camera and light stay out of the GLBs (exported above) and are not saved in the .blend.
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
    bpy.context.active_object.name = 'PREVIEW_FLOOR'
    sun = bpy.data.lights.new('PreviewSun', 'SUN')
    sun.energy = 3.2
    sun_object = bpy.data.objects.new('PreviewSun', sun)
    sun_object.rotation_euler = (math.radians(50), 0, math.radians(30))
    scene.collection.objects.link(sun_object)
    camera = bpy.data.cameras.new('PreviewCamera')
    camera.lens = 55
    camera_object = bpy.data.objects.new('PreviewCamera', camera)
    scene.collection.objects.link(camera_object)
    scene.camera = camera_object
    world = bpy.data.worlds.new('PreviewWorld')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (0.75, 0.76, 0.78, 1)
    scene.world = world
    for filename, root, height, _ in built:
        render_preview(OUT / f'preview_{filename}.png', root, height)


main()
