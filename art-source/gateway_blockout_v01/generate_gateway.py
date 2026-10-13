"""T027: original editable everyday gateway; run with Blender --background --python."""
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
ASSET = "everyday_gateway_v01"
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
asset_collection = bpy.data.collections.new("GATEWAY_ASSET")
scene.collection.children.link(asset_collection)
root = bpy.data.objects.new("GatewayRoot", None)
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
wood = material("Plain_Dark_Timber", (.30, .21, .14))
stone = material("Stone_Plith", (.46, .45, .41))
iron = material("Door_Iron", (.19, .19, .18))
MATS = [brick, wood, stone, iron]

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

# Plain everyday passage: no threshold, door, roof or symbolic ornament.
groups = {}
for name in ("Piers", "Stone", "Lintel"):
    group = bpy.data.objects.new(name+"Root",None)
    asset_collection.objects.link(group)
    group.parent = root
    groups[name] = group
PIER_X, PIER_WIDTH, PIER_DEPTH = 2.55, .80, .80
FOOT_HEIGHT, PIER_TOP, CAP_HEIGHT = .42, 3.80, .16
LINTEL_BOTTOM, LINTEL_TOP = 3.18, 3.72
for sign,label in ((-1,"Left"),(1,"Right")):
    x = sign*PIER_X
    b = Builder()
    b.box((x,0,(FOOT_HEIGHT+PIER_TOP)/2),(PIER_WIDTH,PIER_DEPTH,PIER_TOP-FOOT_HEIGHT),brick)
    b.object("Pier_"+label,groups["Piers"])
    b = Builder()
    b.box((x,0,FOOT_HEIGHT/2),(1.0,1.0,FOOT_HEIGHT),stone)
    b.object("Stone_Footing_"+label,groups["Stone"])
    b = Builder()
    b.box((x,0,PIER_TOP+CAP_HEIGHT/2),(.92,.92,CAP_HEIGHT),stone)
    b.object("Stone_Cap_"+label,groups["Stone"])
inner_x = PIER_X-PIER_WIDTH/2
b = Builder()
b.box((0,0,(LINTEL_BOTTOM+LINTEL_TOP)/2),(2*(inner_x+.12),.56,LINTEL_TOP-LINTEL_BOTTOM),wood)
b.object("Timber_Lintel",groups["Lintel"])
b = Builder()
for x in (-inner_x+.12,inner_x-.12):
    for z in (LINTEL_BOTTOM+.13,LINTEL_TOP-.13):
        for sign in (-1,1):
            y = sign*.29
            vertices = []
            for yy in (y-.016,y+.016):
                vertices += [(x+.052*math.cos(i*math.tau/12),yy,z+.052*math.sin(i*math.tau/12)) for i in range(12)]
            faces = [tuple(range(12)),tuple(range(23,11,-1))]
            faces += [(i,i+12,(i+1)%12+12,(i+1)%12) for i in range(12)]
            b.poly(vertices,faces,iron)
b.object("Plain_Fasteners",groups["Lintel"])

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
assert abs(minimum[2])<1e-6 and len(meshes)==8 and triangles<1000
clear_width = 2*(PIER_X-.50)  # footing is the narrowest portion of the passage
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
    "texture_images":[{"name":"brick_color_512","size":[512,512]}],"animation_clips":0,
    "clear_passage_width_m":clear_width,"clear_passage_height_m":LINTEL_BOTTOM,
    "pier_clear_width_above_footings_m":2*inner_x,"pier_nodes":["Pier_Left","Pier_Right"],
    "lintel_nodes":["Timber_Lintel"],"fastener_heads":8,
    "node_names":[o.name for o in objects],"parents":{o.name:o.parent.name if o.parent else None for o in objects},
    "glb_bytes":glb.stat().st_size,"glb_sha256":hashlib.sha256(glb.read_bytes()).hexdigest(),
    "scale_status":"Adjustable working dimensions; no approved lane clearance, historical or engineering measurements"}
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
camera.data.ortho_scale = 8.2
preview_object(camera)
scene.camera = camera
views = {"front":(0,-18,1.98),"left":(-18,0,1.98),"right":(18,0,1.98),
         "back":(0,18,1.98),"perspective":(8,-12,6.2)}
def set_view(name):
    camera.location = views[name]
    camera.rotation_euler = (Vector((0,0,1.98))-camera.location).to_track_quat("-Z","Y").to_euler()
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
print("T027_METRICS "+json.dumps(metrics))
