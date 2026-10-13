"""T025: original editable residence; run with Blender --background --python."""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument("--out", default=str(Path(__file__).resolve().parent))
parser.add_argument("--skip-renders", action="store_true")
opts = parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
OUT = Path(opts.out).resolve()
OUT.mkdir(parents=True, exist_ok=True)
(OUT/"textures").mkdir(exist_ok=True)
ASSET = "building01_residence_v01"
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1
scene.render.engine = "CYCLES"
scene.cycles.samples = 20
scene.cycles.use_denoising = True
scene.render.resolution_x = 1000
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.view_settings.view_transform = "AgX"
asset_collection = bpy.data.collections.new("BUILDING01_ASSET")
scene.collection.children.link(asset_collection)
root = bpy.data.objects.new("Building01Root", None)
asset_collection.objects.link(root)
root["asset_id"] = ASSET
root["working_scale"] = "meters; adjustable blockout, not approved street scale"
root["front_blender"] = "-Y"
root["front_gltf"] = "+Z"

def srgb(v):
    return v/12.92 if v < .04045 else ((v+.055)/1.055)**2.4

def material(name, rgb, texture=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    color = tuple(srgb(v) for v in rgb)+(1,)
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = .86
    mat.diffuse_color = color
    if texture:
        node = mat.node_tree.nodes.new("ShaderNodeTexImage")
        node.image = texture
        node.interpolation = "Linear"
        node.extension = "REPEAT"
        mat.node_tree.links.new(node.outputs["Color"], shader.inputs["Base Color"])
    return mat

def pattern(name, roof=False):
    """Original analytic color tile: no online pixels, no per-brick geometry."""
    n = 512
    image = bpy.data.images.new(name, width=n, height=n, alpha=False)
    pixels = []
    cols, rows = (8, 8) if roof else (4, 8)
    for py in range(n):
        y = py/n*rows
        row = int(y)
        fy = y-row
        for px in range(n):
            x = px/n*cols+(0 if roof else .5*(row % 2))
            col = int(x)
            fx = x-col
            seam = fx < .035 or fy < .055
            noise = .012*math.sin(px*1.73+py*.77)
            variation = .035*math.sin(col*2.53+row*3.1)
            if seam:
                c = (.30, .23, .19) if roof else (.51, .43, .34)
            elif roof:
                groove = .045*math.cos(fx*math.tau)
                c = (.63+variation+groove, .32+variation*.6, .19+variation*.4)
            else:
                c = (.65+variation, .32+variation*.6, .20+variation*.35)
            pixels.extend((*[max(0, min(1, v+noise)) for v in c], 1))
    image.pixels.foreach_set(pixels)
    image.filepath_raw = str(OUT/"textures"/(name+".png"))
    image.file_format = "PNG"
    image.save()
    image.pack()
    return image

brick = material("Brick_OriginalTile", (.65, .32, .20), pattern("brick_color_512"))
clay = material("Roof_OriginalTile", (.64, .32, .18), pattern("roof_color_512", True))
wood = material("Plain_Dark_Timber", (.30, .21, .14))
dark = material("Opaque_Window_Recess", (.075, .066, .055))
stone = material("Stone_Plith", (.46, .45, .41))
iron = material("Door_Iron", (.19, .19, .18))
MATS = [brick, clay, wood, dark, stone, iron]

class Builder:
    def __init__(self):
        self.vertices, self.faces, self.indices, self.uvs = [], [], [], []

    def poly(self, vertices, faces, mat, roof_uv=False):
        offset = len(self.vertices)
        self.vertices.extend(vertices)
        for face in faces:
            points = [Vector(vertices[i]) for i in face]
            normal = (points[1]-points[0]).cross(points[2]-points[0])
            axis = max(range(3), key=lambda i: abs(normal[i]))
            uv = []
            for p in points:
                if roof_uv:
                    uv.append((p.x/3.2, p.y/3.2))
                elif axis == 0:
                    uv.append((p.y/1.52, p.z/1.52))
                elif axis == 1:
                    uv.append((p.x/1.52, p.z/1.52))
                else:
                    uv.append((p.x/1.52, p.y/1.52))
            self.faces.append(tuple(i+offset for i in face))
            self.indices.append(MATS.index(mat))
            self.uvs.append(uv)

    def box(self, center, size, mat):
        assert all(s > 1e-6 for s in size), (center, size)
        x, y, z = center
        a, b, c = [s/2 for s in size]
        verts = [(x-a,y-b,z-c), (x+a,y-b,z-c), (x+a,y+b,z-c), (x-a,y+b,z-c),
                 (x-a,y-b,z+c), (x+a,y-b,z+c), (x+a,y+b,z+c), (x-a,y+b,z+c)]
        self.poly(verts, [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)], mat)

    def object(self, name, parent=root):
        mesh = bpy.data.meshes.new(name+"_Geometry")
        mesh.from_pydata(self.vertices, [], self.faces)
        mesh.update()
        for mat in MATS:
            mesh.materials.append(mat)
        uv = mesh.uv_layers.new(name="Original_Tile_UV")
        for polygon, mi, coords in zip(mesh.polygons, self.indices, self.uvs):
            polygon.material_index = mi
            for loop, point in zip(polygon.loop_indices, coords):
                uv.data[loop].uv = point
        # Keep only actually used material slots; prevents phantom export mats.
        used = sorted(set(self.indices))
        mesh.materials.clear()
        for i in used:
            mesh.materials.append(MATS[i])
        for polygon, index in zip(mesh.polygons, self.indices):
            polygon.material_index = used.index(index)
        obj = bpy.data.objects.new(name, mesh)
        asset_collection.objects.link(obj)
        obj.parent = parent
        return obj

W, D, BASE, TOP, RIDGE = 5.6, 3.4, .45, 5.95, 7.0
groups = {}
for name in ("Walls", "Plinth", "Timber", "Roof", "Door", "Windows"):
    group = bpy.data.objects.new(name+"Root", None)
    asset_collection.objects.link(group)
    group.parent = root
    groups[name] = group
opening_records = []

def wall(name, span, position, angle, openings):
    """Grid partitions make real apertures, without Boolean modifiers."""
    # Quantize partition boundaries so a door at BASE cannot produce an
    # almost-zero strip due to 1.45 - 1.0 rounding below .45.
    xs = sorted({round(v, 6) for v in [-span/2, span/2]+[x+s*w/2 for x,z,w,h in openings for s in (-1,1)]})
    zs = sorted({round(v, 6) for v in [BASE, TOP]+[z+s*h/2 for x,z,w,h in openings for s in (-1,1)]})
    b = Builder()
    for x0,x1 in zip(xs,xs[1:]):
        for z0,z1 in zip(zs,zs[1:]):
            x,z = (x0+x1)/2, (z0+z1)/2
            if any(abs(x-cx)<w/2-1e-7 and abs(z-cz)<h/2-1e-7 for cx,cz,w,h in openings):
                continue
            b.box((x,0,z), (x1-x0,.18,z1-z0), brick)
    obj = b.object(name, groups["Walls"])
    obj.location = position
    obj.rotation_euler.z = angle
    # UVs on both side walls use local horizontal distance and Z.
    return obj

front_low = [(-1.85,1.64,.94,1.02),(1.85,1.64,.94,1.02)]
front_upper = [(x,4.45,1.04,1.36) for x in (-1.7,0,1.7)]
back = [(x,z,1.04,1.36 if z>3 else 1.02) for z in (1.64,4.45) for x in (-1.35,1.35)]
side = [(0,z,1.04,1.36 if z>3 else 1.02) for z in (1.64,4.45)]
door_opening = (0,1.45,1.50,2.0)
wall("Wall_Front", W, (0,-D/2,0), 0, front_low+front_upper+[door_opening])
wall("Wall_Back", W, (0,D/2,0), math.pi, back)
wall("Wall_Left", D, (-W/2,0,0), -math.pi/2, side)
wall("Wall_Right", D, (W/2,0,0), math.pi/2, side)

# Gable ends, thickness closing the same rectangular body.
for sign,label in ((-1,"Left"),(1,"Right")):
    x = sign*W/2
    x0,x1 = sorted((x-.09,x+.09))
    b = Builder()
    b.poly([(x0,-D/2,TOP),(x0,D/2,TOP),(x0,0,RIDGE-.10),
            (x1,-D/2,TOP),(x1,D/2,TOP),(x1,0,RIDGE-.10)],
           [(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)], brick)
    b.object("Gable_"+label, groups["Walls"])

# Grounded plinth, doorstep, plain timber bands and simple eave rafters.
b = Builder()
b.box((0,0,BASE/2), (W+.16,D+.16,BASE), stone)
b.box((0,-D/2-.20,.10), (1.68,.42,.20), stone)
b.object("Stone_Plinth_And_Step", groups["Plinth"])
b = Builder()
for z in (3.08,5.87):
    for y in (-D/2-.02,D/2+.02):
        b.box((0,y,z),(W+.12,.16,.18),wood)
    for x in (-W/2-.02,W/2+.02):
        b.box((x,0,z),(.16,D+.12,.18),wood)
for x in (-W/2+.04,W/2-.04):
    for y in (-D/2-.04,D/2+.04):
        b.box((x,y,(BASE+TOP)/2),(.12,.12,TOP-BASE),wood)
for x in [-2.65+i*.53 for i in range(11)]:
    for y in (-D/2-.13,D/2+.13):
        b.box((x,y,TOP-.05),(.08,.35,.13),wood)
b.object("Plain_Timber_Bands_And_Corners",groups["Timber"])

# Reusable linked mesh modules, with real lattice bars over opaque recess.
templates = {}
def window(name, record, pos, angle):
    x,z,w,h = record
    kind = (round(w,3),round(h,3))
    if kind not in templates:
        b = Builder()
        b.box((0,.08,0),(w-.02,.04,h-.02),dark)
        for sx in (-1,1):
            b.box((sx*(w/2-.065),-.012,0),(.13,.17,h),wood)
        for sz in (-1,1):
            b.box((0,-.012,sz*(h/2-.065)),(w,.17,.13),wood)
        b.box((0,-.045,h/2+.05),(w+.24,.24,.13),wood)
        b.box((0,-.10,-h/2-.05),(w+.24,.28,.13),wood)
        for sx in (-.30,-.15,0,.15,.30):
            b.box((sx,-.02,0),(.035,.055,h-.18),wood)
        count = int((h-.20)/.17)
        for i in range(count):
            zz = (i-(count-1)/2)*.17
            b.box((0,-.024,zz),(w-.18,.06,.035),wood)
        obj = b.object(name,groups["Windows"])
        templates[kind] = obj.data
    else:
        obj = bpy.data.objects.new(name,templates[kind])
        asset_collection.objects.link(obj)
        obj.parent = groups["Windows"]
    obj.location = (pos[0]+x*math.cos(angle),pos[1]+x*math.sin(angle),z)
    obj.rotation_euler.z = angle
    obj["opening_width_m"],obj["opening_height_m"] = w,h
    opening_records.append({"node":name,"local_center":[x,z],"aperture":[w,h]})

for label,records,pos,ang in (
    ("Front",front_low+front_upper,(0,-D/2,0),0),
    ("Back",back,(0,D/2,0),math.pi),
    ("Left",side,(-W/2,0,0),-math.pi/2),
    ("Right",side,(W/2,0,0),math.pi/2)):
    for i,record in enumerate(records,1):
        window("Window_"+label+"_"+str(i).zfill(2),record,pos,ang)
b = Builder()
# Static double door; no hinge pivots or interior built.
for x in (-.37,.37):
    b.box((x,-D/2+.015,1.45),(.73,.10,1.98),wood)
    for xx in (-.22,0,.22):
        b.box((x+xx,-D/2-.045,1.45),(.028,.025,1.86),wood)
    b.box((x*.45,-D/2-.11,1.43),(.05,.055,.14),iron)
for x in (-.79,.79):
    b.box((x,-D/2-.035,1.46),(.10,.20,2.12),wood)
b.box((0,-D/2-.035,2.52),(1.82,.26,.16),wood)
b.object("Closed_Double_Door",groups["Door"])

# Single ridge, two original tiled sloping slabs; no individual tile meshes.
b = Builder()
ex,ey = W/2+.28,D/2+.30
for sign in (-1,1):
    y0,y1 = sorted((0,sign*ey))
    z0 = RIDGE-abs(y0)/ey*(RIDGE-TOP)
    z1 = RIDGE-abs(y1)/ey*(RIDGE-TOP)
    vertices = [(-ex,y0,z0-.12),(ex,y0,z0-.12),(ex,y1,z1-.12),(-ex,y1,z1-.12),
                (-ex,y0,z0),(ex,y0,z0),(ex,y1,z1),( -ex,y1,z1)]
    b.poly(vertices,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],clay,True)
b.box((0,0,RIDGE+.03),(W+.62,.15,.13),clay)
b.object("Tiled_Roof_And_Ridge",groups["Roof"])

bpy.context.view_layer.update()
objects = [root]+list(root.children_recursive)
meshes = [o for o in objects if o.type=="MESH"]
points = [o.matrix_world@v.co for o in meshes for v in o.data.vertices]
minimum = [min(p[i] for p in points) for i in range(3)]
maximum = [max(p[i] for p in points) for i in range(3)]
triangles = 0
for obj in meshes:
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
assert abs(minimum[2])<1e-6
assert len(opening_records)==13
assert triangles<12000,triangles
bpy.ops.object.select_all(action="DESELECT")
for obj in objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = root
glb = OUT/(ASSET+".glb")
bpy.ops.export_scene.gltf(filepath=str(glb),export_format="GLB",use_selection=True,
    export_yup=True,export_animations=False,export_extras=True,export_cameras=False,export_lights=False)
metrics = {"asset_id":ASSET,"blender_version":bpy.app.version_string,"units":"working meters",
    "root_origin":[0,0,0],"front_blender":"-Y","front_gltf":"+Z","gltf_up":"+Y",
    "bounds_blender_min":minimum,"bounds_blender_max":maximum,
    "bounds_gltf_min":[minimum[0],minimum[2],-maximum[1]],
    "bounds_gltf_max":[maximum[0],maximum[2],-minimum[1]],
    "dimensions_gltf_xyz_m":[maximum[0]-minimum[0],maximum[2]-minimum[2],maximum[1]-minimum[1]],
    "triangles":triangles,"mesh_objects":len(meshes),"unique_mesh_data":len({o.data.name for o in meshes}),
    "materials":sorted({m.name for o in meshes for m in o.data.materials}),
    "texture_images":[{"name":name,"size":[512,512]} for name in ("brick_color_512","roof_color_512")],
    "animation_clips":0,"windows":opening_records,"window_counts":{"Front":5,"Back":4,"Left":2,"Right":2},
    "node_names":[o.name for o in objects],"parents":{o.name:o.parent.name if o.parent else None for o in objects},
    "glb_bytes":glb.stat().st_size,"glb_sha256":hashlib.sha256(glb.read_bytes()).hexdigest(),
    "scale_status":"Adjustable authoring scale; no street placement or historical measurements approved"}
(OUT/"asset_metrics.json").write_text(json.dumps(metrics,indent=2)+"\n",encoding="utf8")

# Preview collection stays in editable .blend and is excluded from the GLB.
preview = bpy.data.collections.new("PREVIEW_ONLY")
scene.collection.children.link(preview)
def preview_object(obj):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    preview.objects.link(obj)
floor_mat = material("PreviewFloor_NotExported",(.73,.74,.76))
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012))
floor = bpy.context.object
floor.name = "PreviewFloor"
floor.data.materials.append(floor_mat)
floor.hide_select = True
preview_object(floor)
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs["Color"].default_value = (.6,.62,.65,1)
scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = .6
for name,pos,energy,size in (("Key",(5,-7,12),2200,7),("Fill",(-6,-2,8),1500,6),("Rim",(3,6,11),2100,5)):
    bpy.ops.object.light_add(type="AREA",location=pos)
    obj = bpy.context.object
    obj.name = "Preview"+name
    obj.data.energy,obj.data.size = energy,size
    obj.rotation_euler = (Vector((0,0,3))-obj.location).to_track_quat("-Z","Y").to_euler()
    preview_object(obj)
bpy.ops.object.camera_add(location=(10,-14,9))
camera = bpy.context.object
camera.name = "PreviewCamera"
camera.data.type = "ORTHO"
camera.data.ortho_scale = 10
preview_object(camera)
scene.camera = camera
views = {"front":(0,-18,3.45),"left":(-18,0,3.45),"right":(18,0,3.45),
         "back":(0,18,3.45),"perspective":(11,-15,9)}
def set_view(name):
    camera.location = views[name]
    camera.rotation_euler = (Vector((0,0,3.45))-camera.location).to_track_quat("-Z","Y").to_euler()
set_view("perspective")
bpy.ops.object.select_all(action="DESELECT")
root.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(ASSET+".blend")))
if not opts.skip_renders:
    for name in views:
        set_view(name)
        scene.render.filepath = str(OUT/("preview_"+name+".png"))
        bpy.ops.render.render(write_still=True)
print("T025_METRICS "+json.dumps(metrics))
