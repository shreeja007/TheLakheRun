"""T022 original procedural Pulu Kisi draft from the project's T019 concept.
Cloth/frame effigy, not animal anatomy or an authentic ceremonial replica.
Fresh Blender process: --background --factory-startup --python-exit-code 1.
"""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = Path(__file__).resolve().parent
ASSET_ID = "pulu_kisi_blockout_v01"
args = argparse.ArgumentParser()
args.add_argument("--out", default=str(HERE))
args.add_argument("--skip-renders", action="store_true")
opts = args.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
OUT = Path(opts.out).resolve()
assert OUT != Path(OUT.anchor), "Use a named output directory"
OUT.mkdir(parents=True, exist_ok=True)
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1
parts = {}


def material(name, color, roughness=0.85):
    values = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v/12.92 if v <= 0.04045 else ((v+.055)/1.055)**2.4 for v in values]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*linear, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


cream = material("Canvas_WarmWhite", "#EEE5D3")
red = material("Trim_RustRed", "#AA5141")
blue = material("Trim_MutedBlue", "#506879")
green = material("Trim_MutedGreen", "#607061")
rust = material("Tuft_RedFiber", "#BD6147")
orange = material("Garland_Marigold", "#E59F2A")
ink = material("Eyes_Shoes_Charcoal", "#34322F")
linen = material("Seams_Frame_Sole_Linen", "#BCAE94")


def group(name, parent=None, world=(0, 0, 0)):
    bpy.context.view_layer.update()
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = Vector(world) - (parent.matrix_world.translation if parent else Vector((0, 0, 0)))
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = .12
    parts[name] = []
    return obj


pulu = group("PuluRoot")
pulu["asset_id"] = ASSET_ID
pulu["draft"] = True
pulu["units"] = "meters"
pulu["forward_blender"] = "-Y"
pulu["forward_gltf"] = "+Z"
pulu["cultural_status"] = "simplified T019 draft; review pending; no authenticity claim"
body = group("ClothRoot", pulu)
frame = group("FrameRoot", pulu)
head = group("HeadRoot", pulu, (0, -1.45, 2.40))
trunk = group("TrunkRoot", head, (0, -1.77, 2.34))
ear_l = group("Ear_L", head, (-.43, -1.39, 2.48))
ear_r = group("Ear_R", head, (.43, -1.39, 2.48))
tuft = group("TuftRoot", head, (0, -1.39, 2.97))
garland = group("GarlandRoot", pulu)
trim = group("TrimRoot", pulu)
feet_front = group("Feet_Front", pulu, (0, -.90, 0))
feet_rear = group("Feet_Rear", pulu, (0, .95, 0))
head["purpose"] = "attachment pivot; static assembly, not rig or approved gesture"
trunk["purpose"] = "attachment pivot for whole rigid trunk; no segmented deformation"
frame["purpose"] = "simplified internal support suggestion, not load-bearing engineering"


def finish(obj, name, mat, owner, smooth=True):
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for face in obj.data.polygons:
        face.use_smooth = smooth
    parts[owner.name].append(obj)
    return obj


def mesh_object(name, vertices, faces, mat, owner, smooth=True):
    mesh = bpy.data.meshes.new(name + "Geometry")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    return finish(obj, name, mat, owner, smooth)


def ellipsoid(name, position, size, mat, owner, segments=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=position)
    obj = bpy.context.object
    obj.scale = size
    return finish(obj, name, mat, owner)


def box(name, position, size, mat, owner, bevel=.018):
    bpy.ops.mesh.primitive_cube_add(size=1, location=position)
    obj = bpy.context.object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("SoftEdges", "BEVEL")
    modifier.width = bevel
    modifier.segments = 2
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    return finish(obj, name, mat, owner, smooth=False)


def tube(name, points, radius, mat, owner):
    points = [p for i, p in enumerate(points) if i == 0 or (Vector(p)-Vector(points[i-1])).length > 1e-6]
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 0
    curve.resolution_u = 1
    spline = curve.splines.new("POLY")
    spline.points.add(len(points)-1)
    for vertex, position in zip(spline.points, points):
        vertex.co = (*position, 1)
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return finish(bpy.context.object, name, mat, owner)


# Open underside and near-vertical skirt; roof shrinks mainly across width,
# retaining a long horizontal ridge. No elephant body/animal legs underneath.
sections = [(.22, 1, 1), (.245, .999, 1), (.46, .990, .998), (.48, .989, .998),
            (.535, .987, .997), (.56, .986, .997), (.61, .984, .996),
            (1.0, .966, .994), (1.42, .947, .990), (1.62, .936, .985),
            (1.91, .864, .971), (2.16, .700, .940), (2.34, .45, .90),
            (2.44, .085, .85), (2.45, .045, .84)]
COUNT = 64


def cloth_point(angle, z, width, depth, offset=1):
    c, s = math.cos(angle), math.sin(angle)
    ripple = (.009 * math.sin(16*angle) + .004 * math.sin(24*angle)) * max(0, 1-z/2.45)
    x = .82 * width * math.copysign(abs(c)**.52, c) * (1+ripple)
    y = 1.62 * depth * math.copysign(abs(s)**.52, s) * (1+ripple)
    return (x*offset, y*offset, z)


vertices = [cloth_point(i*math.tau/COUNT, z, w, d) for z, w, d in sections for i in range(COUNT)]
faces, colors = [], []
for row in range(len(sections)-1):
    middle = (sections[row][0] + sections[row+1][0]) / 2
    color = 1 if .245 < middle < .46 else 2 if .48 < middle < .535 else 3 if .56 < middle < .61 else 0
    for i in range(COUNT):
        faces.append((row*COUNT+i, row*COUNT+(i+1)%COUNT, (row+1)*COUNT+(i+1)%COUNT, (row+1)*COUNT+i))
        colors.append(color)
faces.append(tuple((len(sections)-1)*COUNT+i for i in range(COUNT)))
colors.append(0)
shell = mesh_object("OpenBottomCanvas", vertices, faces, None, body)
for mat in (cream, red, blue, green):
    shell.data.materials.append(mat)
for face, index in zip(shell.data.polygons, colors):
    face.material_index = index
solid = shell.modifiers.new("EditableCanvasThickness", "SOLIDIFY")
solid.thickness = .012
solid.offset = -1
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=solid.name)
for angle in [i*math.tau/8 for i in range(8)]:
    tube("PanelSeam", [cloth_point(angle, z, w, d, 1.006) for z, w, d in sections[6:]], .004, linen, trim)
# Thin raised stitch line follows the existing cloth, with an explicit surface offset.
z, w, d = 1.0, .966, .994
ring = [cloth_point(i*math.tau/COUNT, z, w, d, 1.008) for i in range(COUNT+1)]
tube("HorizontalSeam", ring, .004, linen, trim)

# Three removable simplified bamboo arch suggestions and longitudinal supports.
for y in (-1.05, 0, 1.05):
    arch = [(-.64, y, .6), (-.64, y, 1.55)]
    arch += [(-.64*math.cos(i*math.pi/16), y, 1.55+.74*math.sin(i*math.pi/16)) for i in range(17)]
    arch += [(.64, y, .6)]
    tube("InternalArch", arch, .018, linen, frame)
for x in (-.62, .62):
    tube("InternalRail", [(x, -1.1, 1.25), (x, 1.1, 1.25)], .018, linen, frame)

# Plain sculpted head, two normal friendly eyes; no ritual mask painting.
ellipsoid("ConstructedHead", (0, -1.45, 2.4), (.50, .39, .61), cream, head, rings=16)
for side in (-1, 1):
    x = side*.225
    ellipsoid("EyeWhite", (x, -1.804, 2.49), (.13, .045, .145), cream, head, 16, 10)
    ellipsoid("EyeInk", (x, -1.842, 2.49), (.071, .019, .095), ink, head, 16, 10)
    ellipsoid("EyeCatchlight", (x-.019, -1.860, 2.522), (.019, .008, .025), cream, head, 12, 8)

# Two flattened fabric-like ear fans with plain border bands from the concept.
for side, owner in ((-1, ear_l), (1, ear_r)):
    pivot = Vector((side*.43, -1.39, 2.48))
    origin = pivot + Vector((side*.19, -.01, .015))
    radial = [.02, .69, .77, .81, .87, .91, .97, 1]
    ear_vertices = []
    steps = 24
    for radius in radial:
        for i in range(steps+1):
            angle = math.radians(-75 + 220*i/steps)
            ear_vertices.append(tuple(origin + Vector((side*.48*radius*math.cos(angle),
                                -.06*math.sin(angle)*radius - .035*radius**2,
                                .43*radius*math.sin(angle)))))
    ear_faces, ear_colors = [], []
    for row in range(len(radial)-1):
        for i in range(steps):
            a = row*(steps+1)+i
            ear_faces.append((a, a+1, a+steps+2, a+steps+1))
            ear_colors.append([0, 1, 0, 2, 0, 3, 0][row])
    ear_faces.append(tuple(reversed(range(steps+1))))
    ear_colors.append(0)
    obj = mesh_object("EarFan", ear_vertices, ear_faces, None, owner)
    for mat in (cream, red, blue, green):
        obj.data.materials.append(mat)
    for face, index in zip(obj.data.polygons, ear_colors):
        face.material_index = index
    mod = obj.modifiers.new("EarThickness", "SOLIDIFY")
    mod.thickness = .02
    bpy.ops.object.modifier_apply(modifier=mod.name)

# Smooth tapered rigid trunk; curve is sampled once, no skeleton/cloth simulation.
control = [Vector(p) for p in [(0, -1.77, 2.34), (0, -1.82, 2.16), (0, -1.88, 1.96),
           (0, -1.94, 1.74), (0, -2.01, 1.49), (0, -2.08, 1.25), (0, -2.10, 1.07),
           (0, -2.03, .98), (0, -1.92, 1.02), (0, -1.86, 1.13), (0, -1.89, 1.20)]]
curve_points = []
for j in range(len(control)-1):
    a, b = control[max(0, j-1)], control[j]
    c, d = control[j+1], control[min(len(control)-1, j+2)]
    for k in range(6):
        t = k/6
        curve_points.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t**3))
curve_points.append(control[-1])
trunk_vertices, trunk_faces = [], []
SIDES = 16
for j, point in enumerate(curve_points):
    tangent = (curve_points[min(j+1, len(curve_points)-1)] - curve_points[max(0, j-1)]).normalized()
    xaxis = Vector((1, 0, 0))
    cross = tangent.cross(xaxis).normalized()
    radius = .17 - .112*j/(len(curve_points)-1)
    for k in range(SIDES):
        angle = math.tau*k/SIDES
        trunk_vertices.append(tuple(point + radius*(xaxis*math.cos(angle)+cross*math.sin(angle))))
for j in range(len(curve_points)-1):
    for k in range(SIDES):
        trunk_faces.append((j*SIDES+k, j*SIDES+(k+1)%SIDES, (j+1)*SIDES+(k+1)%SIDES, (j+1)*SIDES+k))
trunk_faces += [tuple(reversed(range(SIDES))), tuple((len(curve_points)-1)*SIDES+k for k in range(SIDES))]
mesh_object("CurledTrunk", trunk_vertices, trunk_faces, cream, trunk)
ellipsoid("TrunkAttachmentBlend", control[0], (.171, .145, .19), cream, trunk, 16, 10)
ellipsoid("RoundedTrunkTip", control[-1], (.058, .058, .058), cream, trunk, 16, 10)

# Simplified fiber tuft, geometry strands without a hair system.
for i in range(20):
    angle = math.tau*i/20
    start = Vector((.09*math.cos(angle), -1.38+.08*math.sin(angle), 2.96))
    end = Vector((.27*math.cos(angle), -1.30+.23*math.sin(angle), 3.12+.16*(i%3)/2))
    direction = end-start
    obj = ellipsoid("FiberLock", (start+end)/2, (.043, .043, direction.length*.65), rust, tuft, 12, 8)
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()

# Loose neck festoon; original low-poly beads, not ceremonial symbolism.
for i in range(23):
    t = i/22
    angle = math.pi*t
    position = (-.46*math.cos(angle), -1.65-.13*math.sin(angle), 2.28-.52*math.sin(angle))
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.075, location=position)
    finish(bpy.context.object, "GarlandFlower", orange, garland, smooth=False)
for side in (-1, 1):
    x = side*.47
    box("PlainRibbon", (x, -1.625, 1.67), (.18, .025, 1.02), cream, trim, .004)
    box("RibbonRedStripe", (x-side*.040, -1.643, 1.67), (.036, .01, 1.00), red, trim, .002)
    box("RibbonBlueStripe", (x+side*.022, -1.643, 1.67), (.036, .01, 1.00), blue, trim, .002)

# Two separated performer-foot pairs, no human bodies or elephant legs.
for owner, y in ((feet_front, -.9), (feet_rear, .95)):
    for side in (-1, 1):
        x = side*.245
        box("ProxySole", (x, y-.025, .03), (.26, .46, .06), linen, owner, .018)
        box("ProxyShoe", (x, y, .135), (.235, .42, .15), ink, owner, .045)

# Consolidate one editable mesh per grouping and bake local-space coordinates.
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
    joined.data.transform(parent.matrix_world.inverted() @ joined.matrix_world)
    joined.parent = parent
    joined.matrix_parent_inverse = Matrix.Identity(4)
    joined.matrix_basis = Matrix.Identity(4)
    joined.name = parent_name + "_Mesh"
    joined.data.name = parent_name + "_Geometry"
    materials = list(joined.data.materials)
    unique = list(dict.fromkeys(materials))
    indices = [unique.index(materials[p.material_index]) for p in joined.data.polygons]
    joined.data.materials.clear()
    for mat in unique:
        joined.data.materials.append(mat)
    for polygon, index in zip(joined.data.polygons, indices):
        polygon.material_index = index
    joined.data.update()

asset_objects = [pulu] + list(pulu.children_recursive)
meshes = [o for o in asset_objects if o.type == "MESH"]
bpy.context.view_layer.update()
points = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
minimum = [min(p[i] for p in points) for i in range(3)]
maximum = [max(p[i] for p in points) for i in range(3)]
triangles = 0
for obj in meshes:
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
assert abs(minimum[2]) < 1e-5
assert pulu.location.length < 1e-8
assert triangles < 20000, triangles
metrics = {"asset_id": ASSET_ID, "blender_version": bpy.app.version_string, "units": "meters",
           "blender_forward": "-Y", "gltf_forward": "+Z", "gltf_up": "+Y", "root_origin": [0, 0, 0],
           "bounds_blender_min": minimum, "bounds_blender_max": maximum,
           "bounds_gltf_min": [minimum[0], minimum[2], -maximum[1]],
           "bounds_gltf_max": [maximum[0], maximum[2], -minimum[1]],
           "dimensions_gltf_xyz_m": [maximum[0]-minimum[0], maximum[2]-minimum[2], maximum[1]-minimum[1]],
           "triangles": triangles, "mesh_objects": len(meshes),
           "materials": sorted({m.name for o in meshes for m in o.data.materials}),
           "texture_images": 0, "animation_clips": 0, "node_names": [o.name for o in asset_objects],
           "group_parents": {o.name: o.parent.name if o.parent else None for o in asset_objects if o.type == "EMPTY"},
           "group_pivots_blender_world": {o.name: list(o.matrix_world.translation) for o in asset_objects if o.type == "EMPTY"},
           "cloth_hem_height_m": .22, "performer_foot_pairs": 2,
           "dimensions_status": "proposed draft dimensions; not historical measurements"}
bpy.ops.object.select_all(action="DESELECT")
for obj in asset_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = pulu
glb = OUT / (ASSET_ID + ".glb")
bpy.ops.export_scene.gltf(filepath=str(glb), export_format="GLB", use_selection=True, export_yup=True,
                          export_animations=False, export_extras=True, export_cameras=False, export_lights=False)
metrics["glb_bytes"] = glb.stat().st_size
metrics["glb_sha256"] = hashlib.sha256(glb.read_bytes()).hexdigest()
(OUT / "asset_metrics.json").write_text(json.dumps(metrics, indent=2)+"\n", encoding="utf8")

# Separate editable preview rig is deliberately absent from the GLB.
preview = bpy.data.collections.new("PREVIEW_ONLY")
scene.collection.children.link(preview)


def move_preview(obj):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    preview.objects.link(obj)


floor_mat = material("Preview_Floor_NotExported", "#B5B9C0")
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -.01))
floor = bpy.context.object
floor.name = "PreviewFloor"
floor.data.materials.append(floor_mat)
floor.hide_select = True
move_preview(floor)
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs["Color"].default_value = (.55, .57, .61, 1)
scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = .7
for name, pos, energy, size in (("Key", (4, -6, 8), 1500, 5), ("Fill", (-5, -2, 6), 1100, 5), ("Rim", (2, 5, 7), 1700, 4)):
    bpy.ops.object.light_add(type="AREA", location=pos)
    light = bpy.context.object
    light.name = "Preview"+name
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    light.rotation_euler = (Vector((0, -.3, 1.5))-light.location).to_track_quat("-Z", "Y").to_euler()
    move_preview(light)
bpy.ops.object.camera_add(location=(7, -10, 5))
camera = bpy.context.object
camera.name = "PreviewCamera"
camera.data.type = "ORTHO"
camera.data.ortho_scale = 5.8
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
views = {"front": ((0, -11, 1.65), (0, -.15, 1.65)),
         "left": ((-11, -.15, 1.65), (0, -.15, 1.65)),
         "right": ((11, -.15, 1.65), (0, -.15, 1.65)),
         "back": ((0, 11, 1.65), (0, -.15, 1.65)),
         "perspective": ((6, -9, 4.4), (0, -.18, 1.5))}
camera.location, target = views["perspective"]
camera.rotation_euler = (Vector(target)-camera.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.select_all(action="DESELECT")
pulu.select_set(True)
bpy.context.view_layer.objects.active = pulu
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(ASSET_ID+".blend")))
if not opts.skip_renders:
    for name, (position, target) in views.items():
        camera.location = position
        camera.rotation_euler = (Vector(target)-camera.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = str(OUT/("preview_"+name+".png"))
        bpy.ops.render.render(write_still=True)
print("T022_ASSET_METRICS "+json.dumps(metrics))
