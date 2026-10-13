"""T020 original procedural draft shell. Run with Blender --background --python.
No online media input. Geometry is a blockout interpretation of T019, not an
authentic ceremonial replica. Blender +Z up/-Y forward -> glTF +Y up/+Z forward.
"""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

HERE = Path(__file__).resolve().parent
args = argparse.ArgumentParser()
args.add_argument("--out", default=str(HERE))
args.add_argument("--skip-renders", action="store_true")
opts = args.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
OUT = Path(opts.out).resolve()
OUT.mkdir(parents=True, exist_ok=True)
if OUT == Path(OUT.anchor):
    raise RuntimeError("Output must be a named task directory")

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
parts = {}


def material(name, color, roughness=0.8, metal=0.0):
    values = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in values]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*linear, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metal
    return mat


wood = material("Timber_Dark", "#583B2B")
wheelwood = material("Timber_Wheel", "#866747")
red = material("Chassis_RedOxide", "#A84830")
roofmat = material("Roof_DarkTimber", "#53493D")
brass = material("Trim_AgedBrass", "#B49154", 0.48, 0.65)
rope = material("Rope_Hemp", "#B7A181")
orange = material("Garland_Marigold", "#E89A27")
cloth = material("Seat_CrimsonCloth", "#9E3335")


def root(name, parent=None, pos=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = pos
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.18
    parts[name] = []
    return obj


rath = root("RathRoot")
rath["asset_id"] = "kumari_rath_blockout_v01"
rath["draft"] = True
rath["units"] = "meters"
rath["forward_blender"] = "-Y"
rath["forward_gltf"] = "+Z"
rath["cultural_status"] = "simplified draft; pending review; no authenticity claim"
chassis = root("ChassisRoot", rath)
platform = root("PlatformRoot", rath)
pavilion = root("PavilionRoot", rath)
roof = root("RoofRoot", rath)
drawbeam = root("DrawbeamRoot", rath)
decor = root("GarlandRoot", rath)
wheel_pivots = {}
for label, x, y in (("FL", -1.19, -0.92), ("FR", 1.19, -0.92),
                    ("RL", -1.19, 0.92), ("RR", 1.19, 0.92)):
    wheel_pivots[label] = root("Wheel_" + label, rath, (x, y, 0.64))
    wheel_pivots[label]["spin_axis"] = "local X"
    wheel_pivots[label]["radius_m"] = 0.64


def finish(obj, name, mat, owner, bevel=0):
    obj.name = name
    obj.data.materials.append(mat)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("EdgeBevel", "BEVEL")
        mod.width = bevel
        mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    parts[owner.name].append(obj)
    return obj


def box(name, pos, size, mat, owner, bevel=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.scale = size
    return finish(obj, name, mat, owner, bevel)


def cylinder(name, pos, radius, depth, mat, owner, axis="Z", vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos)
    obj = bpy.context.object
    if axis == "X":
        obj.rotation_euler[1] = math.pi / 2
    return finish(obj, name, mat, owner)


def beam(name, a, b, width, depth, mat, owner):
    delta = Vector(b) - Vector(a)
    obj = box(name, (Vector(a) + Vector(b)) / 2, (width, depth, delta.length), mat, owner)
    obj.rotation_euler = delta.to_track_quat("Z", "Y").to_euler()
    return obj


def tube(name, points, radius, mat, owner):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = radius
    curve.bevel_resolution = 0
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for dest, p in zip(spline.points, points):
        dest.co = (*p, 1)
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.select_set(False)
    obj.data.materials.append(mat)
    parts[owner.name].append(obj)
    return obj


# Two complete axles and four independently rotatable solid-disc wheel assemblies.
for label, pivot in wheel_pivots.items():
    x, y, z = pivot.location
    cylinder("Disc_" + label, (x, y, z), 0.64, 0.24, wheelwood, pivot, "X", 32)
    outside = x + (0.145 if x > 0 else -0.145)
    cylinder("Face_" + label, (outside, y, z), 0.54, 0.018, wheelwood, pivot, "X", 32)
    cylinder("Hub_" + label, (x + (0.2 if x > 0 else -0.2), y, z), 0.13, 0.2, wood, pivot, "X", 12)
    # Offset nonfigural timber plugs make rotation observable without painted eyes.
    for angle in (0, 120, 240):
        a = math.radians(angle)
        cylinder("Plug_" + label, (outside, y + 0.4 * math.sin(a), z + 0.4 * math.cos(a)),
                 0.025, 0.028, wood, pivot, "X", 8)
for y in (-0.92, 0.92):
    cylinder("Axle", (0, y, 0.64), 0.11, 2.65, wood, chassis, "X", 12)
    box("AxleCrossmember", (0, y, 0.99), (2.14, 0.25, 0.27), red, chassis)
    for x in (-0.78, 0.78):
        box("AxleSupport", (x, y, 1.23), (0.19, 0.22, 0.7), red, chassis)
for x in (-0.78, 0.78):
    box("LongitudinalChassis", (x, 0, 1.52), (0.22, 2.4, 0.25), red, chassis)
    beam("SideBrace", (x, -0.94, 0.93), (x, 0.94, 1.54), 0.13, 0.13, red, chassis)
    beam("SideBrace", (x, 0.94, 0.93), (x, -0.94, 1.54), 0.13, 0.13, red, chassis)
for y in (-0.94, 0.94):
    beam("EndBrace", (-0.78, y, 0.97), (0.78, y, 1.57), 0.13, 0.13, red, chassis)
    beam("EndBrace", (0.78, y, 0.97), (-0.78, y, 1.57), 0.13, 0.13, red, chassis)

# Broad platform, plank seams, plain inset panels (not sacred carving).
box("PlatformBase", (0, 0, 1.69), (2.35, 2.6, 0.22), wood, platform)
for i in range(10):
    box("DeckPlank", (-1.04 + i * 0.231, 0, 1.825), (0.225, 2.48, 0.055), wheelwood, platform, 0.004)
for y in (-1.28, 1.28):
    box("EndRailPanel", (0, y, 2.035), (2.32, 0.09, 0.37), wood, platform)
    box("EndRailTop", (0, y, 2.25), (2.44, 0.12, 0.08), wood, platform)
    box("EndTrim", (0, y, 1.78), (2.39, 0.115, 0.025), brass, platform, 0.003)
    for x in (-0.77, 0, 0.77):
        box("InsetPanel", (x, y + (-0.053 if y < 0 else 0.053), 2.035), (0.66, 0.02, 0.23), wheelwood, platform, 0.005)
for x in (-1.13, 1.13):
    box("SideRailPanel", (x, 0, 2.035), (0.09, 2.56, 0.37), wood, platform)
    box("SideRailTop", (x, 0, 2.25), (0.12, 2.67, 0.08), wood, platform)
    box("SideTrim", (x, 0, 1.78), (0.115, 2.6, 0.025), brass, platform, 0.003)
    for y in (-0.86, 0, 0.86):
        box("InsetPanel", (x + (-0.053 if x < 0 else 0.053), y, 2.035), (0.02, 0.74, 0.23), wheelwood, platform, 0.005)
for x in (-1.11, 1.11):
    for y in (-1.27, 0, 1.27):
        box("RailPost", (x, y, 2.12), (0.1, 0.1, 0.62), wood, platform)
        cylinder("PostCap", (x, y, 2.445), 0.063, 0.045, brass, platform, vertices=8)

# Empty open cabin. Four load-bearing posts; single restrained roof.
for x in (-0.85, 0.85):
    for y in (-0.92, 0.92):
        box("PavilionPost", (x, y, 2.7), (0.14, 0.14, 1.72), wood, pavilion)
        box("PostFoot", (x, y, 1.91), (0.24, 0.24, 0.11), red, pavilion)
        box("PostTop", (x, y, 3.41), (0.23, 0.23, 0.13), wood, pavilion)
for y in (-0.92, 0.92):
    box("PavilionLintel", (0, y, 3.43), (1.97, 0.18, 0.18), wood, pavilion)
for x in (-0.85, 0.85):
    box("PavilionLintel", (x, 0, 3.43), (0.18, 2.05, 0.18), wood, pavilion)
box("SeatBase", (0, 0.15, 1.96), (1.24, 1.1, 0.16), wood, pavilion)
box("SeatCloth", (0, 0.15, 2.064), (1.28, 1.13, 0.05), cloth, pavilion)

corners = [(-1.32, -1.43, 3.53), (1.32, -1.43, 3.53),
           (1.32, 1.43, 3.53), (-1.32, 1.43, 3.53)]
vertices = corners + [(0, 0, 4.04)] + [(x, y, z - 0.08) for x, y, z in corners]
faces = [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4), (8, 7, 6, 5)]
faces += [(i, 5+i, 5+(i+1) % 4, (i+1) % 4) for i in range(4)]
mesh = bpy.data.meshes.new("CanopyMesh")
mesh.from_pydata(vertices, [], faces)
mesh.update()
canopy = bpy.data.objects.new("Canopy", mesh)
scene.collection.objects.link(canopy)
canopy.data.materials.append(roofmat)
parts[roof.name].append(canopy)
for i in range(4):
    a, b = Vector(corners[i]), Vector(corners[(i+1) % 4])
    beam("EaveTrim", a, b, 0.045, 0.045, brass, roof)
    beam("HipRidge", a, (0, 0, 4.05), 0.035, 0.035, brass, roof)
    # Plain perimeter upturn, original geometry rather than figurative crest.
    outer = a + Vector((a.x * 0.065, a.y * 0.065, 0.14))
    beam("CornerUpturn", a, outer, 0.05, 0.05, wood, roof)
cylinder("ApexBase", (0, 0, 4.065), 0.13, 0.08, brass, roof, vertices=12)
bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.085, location=(0, 0, 4.16))
finish(bpy.context.object, "PlainApexCap", brass, roof)

# Shallow bowed drawbeam, rope ties. All rope is geometry; no texture dependencies.
draw_points = [(0, 0.75, 0.82), (0, -0.7, 0.82), (0, -1.45, 0.69), (0, -2.55, 0.48), (0, -3.18, 0.57)]
for a, b in zip(draw_points, draw_points[1:]):
    beam("DrawbeamSegment", a, b, 0.22, 0.2, wood, drawbeam)
for y, z in ((-1.52, 0.677), (-2.55, 0.48)):
    for offset in (-0.08, -0.027, 0.027, 0.08):
        tube("BeamBinding", [(-0.122, y+offset, z-0.11), (-0.122, y+offset, z+0.11),
                             (0.122, y+offset, z+0.11), (0.122, y+offset, z-0.11),
                             (-0.122, y+offset, z-0.11)], 0.013, rope, drawbeam)
for side in (-1, 1):
    tube("DrawbeamStay", [(side*0.74, -1.27, 1.56), (side*0.45, -1.48, 1.13), (0, -1.72, 0.7)], 0.024, rope, drawbeam)
box("TowEndCap", (0, -3.16, 0.565), (0.26, 0.16, 0.23), brass, drawbeam)

# Cheap removable festoons; joined geometry, no cloth simulation.
for edge in range(4):
    a, b = Vector(corners[edge]), Vector(corners[(edge+1) % 4])
    for loop in range(3):
        for bead in range(9):
            t = (loop + bead / 8) / 3
            pos = a.lerp(b, t)
            pos.z -= 0.08 + 0.2 * math.sin(math.pi * bead / 8)
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.049, location=pos)
            finish(bpy.context.object, "GarlandBead", orange, decor)

# Consolidate static subparts, retaining the ten explicit pivot/group nodes.
bpy.context.view_layer.update()
for parent_name, objects in parts.items():
    if not objects:
        continue
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    parent = bpy.data.objects[parent_name]
    transform = parent.matrix_world.inverted() @ joined.matrix_world
    for vertex in joined.data.vertices:
        vertex.co = transform @ vertex.co
    joined.parent = parent
    joined.matrix_parent_inverse = Matrix.Identity(4)
    joined.matrix_basis = Matrix.Identity(4)
    joined.name = parent_name + "_Mesh"
    joined.data.name = parent_name + "_Geometry"
    # Join appends repeated material slots; remap them to unique shared materials.
    mats = list(joined.data.materials)
    unique = list(dict.fromkeys(mats))
    indices = [unique.index(mats[p.material_index]) for p in joined.data.polygons]
    joined.data.materials.clear()
    for mat in unique:
        joined.data.materials.append(mat)
    for poly, index in zip(joined.data.polygons, indices):
        poly.material_index = index
    joined.data.update()

asset_objects = [rath] + list(rath.children_recursive)
asset_meshes = [o for o in asset_objects if o.type == "MESH"]
bpy.context.view_layer.update()
points = [o.matrix_world @ Vector(v) for o in asset_meshes for v in o.bound_box]
minimum = [min(p[i] for p in points) for i in range(3)]
maximum = [max(p[i] for p in points) for i in range(3)]
triangles = 0
for obj in asset_meshes:
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
assert len(wheel_pivots) == 4
assert abs(minimum[2]) < 1e-5, minimum
assert rath.location.length < 1e-8
assert triangles < 15000, triangles
metrics = {"blender_version": bpy.app.version_string, "units": "meters",
           "blender_forward": "-Y", "gltf_forward": "+Z", "gltf_up": "+Y",
           "root_origin": [0, 0, 0], "bounds_blender_min": minimum, "bounds_blender_max": maximum,
           "bounds_gltf_min": [minimum[0], minimum[2], -maximum[1]],
           "bounds_gltf_max": [maximum[0], maximum[2], -minimum[1]],
           "dimensions_gltf_xyz_m": [maximum[0]-minimum[0], maximum[2]-minimum[2], maximum[1]-minimum[1]],
           "triangles": triangles, "mesh_objects": len(asset_meshes),
           "materials": sorted({m.name for o in asset_meshes for m in o.data.materials}),
           "texture_images": 0, "animation_clips": 0, "node_names": [o.name for o in asset_objects],
           "wheel_pivots_blender": {key: list(p.location) for key, p in wheel_pivots.items()},
           "dimensions_status": "proposed blockout dimensions, not historical measurements"}

bpy.ops.object.select_all(action="DESELECT")
for obj in asset_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = rath
glb = OUT / "kumari_rath_blockout_v01.glb"
bpy.ops.export_scene.gltf(filepath=str(glb), export_format="GLB", use_selection=True,
                          export_yup=True, export_animations=False, export_extras=True,
                          export_cameras=False, export_lights=False)
metrics["glb_bytes"] = glb.stat().st_size
metrics["glb_sha256"] = hashlib.sha256(glb.read_bytes()).hexdigest()
(OUT / "asset_metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf8")

# Editable preview rig is excluded from the selected-asset export.
preview = bpy.data.collections.new("PREVIEW_ONLY")
scene.collection.children.link(preview)


def move_preview(obj):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    preview.objects.link(obj)


floor_mat = material("Preview_Floor_NotExported", "#B8BAC1")
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.01))
floor = bpy.context.object
floor.name = "PreviewFloor"
floor.data.materials.append(floor_mat)
move_preview(floor)
floor.hide_select = True
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs["Color"].default_value = (0.55, 0.57, 0.61, 1)
scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.7
for name, pos, energy, size in (("Key", (4, -6, 8), 1500, 5), ("Fill", (-5, -2, 6), 1100, 5),
                                 ("Rim", (2, 5, 7), 1700, 4)):
    bpy.ops.object.light_add(type="AREA", location=pos)
    light = bpy.context.object
    light.name = "Preview" + name
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    light.rotation_euler = (Vector((0, -0.5, 2)) - light.location).to_track_quat("-Z", "Y").to_euler()
    move_preview(light)
bpy.ops.object.camera_add(location=(7, -10, 6))
camera = bpy.context.object
camera.name = "PreviewCamera"
camera.data.type = "ORTHO"
camera.data.ortho_scale = 7.7
move_preview(camera)
scene.camera = camera
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 1000
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.view_settings.view_transform = "AgX"
views = {"front": ((0, -11, 2.1), (0, -0.45, 2.1)),
         "left": ((-11, -0.8, 2.1), (0, -0.8, 2.1)),
         "back": ((0, 11, 2.1), (0, -0.45, 2.1)),
         "perspective": ((7, -10, 6.3), (0, -0.55, 2))}
camera.location, target = views["perspective"]
camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.select_all(action="DESELECT")
rath.select_set(True)
bpy.context.view_layer.objects.active = rath
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "kumari_rath_blockout_v01.blend"))
if not opts.skip_renders:
    for name, (position, target) in views.items():
        camera.location = position
        camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = str(OUT / ("preview_" + name + ".png"))
        bpy.ops.render.render(write_still=True)
print("T020_ASSET_METRICS " + json.dumps(metrics))
