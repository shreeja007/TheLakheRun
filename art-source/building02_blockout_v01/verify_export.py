"""Independent T026 source, aperture, embedded-image and GLB round-trip checks."""
import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
import bpy
from mathutils import Vector

p = argparse.ArgumentParser()
p.add_argument("--out",default=str(Path(__file__).resolve().parent))
opts = p.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
out = Path(opts.out).resolve()
m = json.loads((out/"asset_metrics.json").read_text())
path = out/(m["asset_id"]+".glb")
blob = path.read_bytes()
magic,version,size = struct.unpack_from("<4sII",blob)
assert (magic,version,size)==(b"glTF",2,len(blob))
length,kind = struct.unpack_from("<I4s",blob,12)
assert kind==b"JSON"
d = json.loads(blob[20:20+length])
bin_start = 20+length
bin_length,bin_kind = struct.unpack_from("<I4s",blob,bin_start)
assert bin_kind==b"BIN\x00"
binary = blob[bin_start+8:bin_start+8+bin_length]
assert hashlib.sha256(blob).hexdigest()==m["glb_sha256"]
assert len(d["buffers"])==1 and "uri" not in d["buffers"][0]
assert not any(d.get(k) for k in ("animations","skins","cameras","extensionsRequired"))
names = [n["name"] for n in d["nodes"]]
assert set(names)==set(m["node_names"]) and len(names)==len(set(names))
assert not any(n.startswith("Preview") for n in names)
assert len(d["materials"])==len(m["materials"])==6
assert len(d["images"])==len(d["textures"])==2
images = []
for image in d["images"]:
    assert image["mimeType"]=="image/png" and "uri" not in image
    v = d["bufferViews"][image["bufferView"]]
    data = binary[v.get("byteOffset",0):v.get("byteOffset",0)+v["byteLength"]]
    assert data[:8]==b"\x89PNG\r\n\x1a\n"
    assert struct.unpack_from(">II",data,16)==(512,512)
    images.append({"name":image["name"],"bytes":len(data),"embedded":True,"size":[512,512]})

components = {5121:"B",5123:"H",5125:"I",5126:"f"}
widths = {"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4}
def accessor(index):
    a = d["accessors"][index]
    assert "sparse" not in a
    v = d["bufferViews"][a["bufferView"]]
    fmt = "<"+components[a["componentType"]]*widths[a["type"]]
    item_size = struct.calcsize(fmt)
    stride = v.get("byteStride",item_size)
    offset = v.get("byteOffset",0)+a.get("byteOffset",0)
    return [struct.unpack_from(fmt,binary,offset+i*stride) for i in range(a["count"])]

mesh_triangles, primitive_counts = [], []
for mesh in d["meshes"]:
    total = 0
    for primitive in mesh["primitives"]:
        assert primitive.get("mode",4)==4
        positions = accessor(primitive["attributes"]["POSITION"])
        normals = accessor(primitive["attributes"]["NORMAL"])
        assert all(math.isfinite(c) for v in positions+normals for c in v)
        assert all(sum(c*c for c in n)>.5 for n in normals)
        indices = [v[0] for v in accessor(primitive["indices"])]
        assert len(indices)%3==0 and all(0<=i<len(positions) for i in indices)
        material = d["materials"][primitive["material"]]
        if material.get("pbrMetallicRoughness",{}).get("baseColorTexture"):
            assert "TEXCOORD_0" in primitive["attributes"]
            assert all(math.isfinite(c) for v in accessor(primitive["attributes"]["TEXCOORD_0"]) for c in v)
        total += len(indices)//3
    mesh_triangles.append(total)
    primitive_counts.append(len(mesh["primitives"]))
triangles = sum(mesh_triangles[n["mesh"]] for n in d["nodes"] if "mesh" in n)
primitives = sum(primitive_counts[n["mesh"]] for n in d["nodes"] if "mesh" in n)
assert triangles==m["triangles"]
assert sum("mesh" in n for n in d["nodes"])==m["mesh_objects"]
for node in d["nodes"]:
    for key in ("translation","rotation","scale","matrix"):
        assert all(math.isfinite(v) for v in node.get(key,[]))
    assert all(abs(v-1)<1e-6 for v in node.get("scale",[1,1,1]))
    for child in node.get("children",[]):
        assert m["parents"][d["nodes"][child]["name"]]==node["name"]

bpy.ops.wm.open_mainfile(filepath=str(out/(m["asset_id"]+".blend")))
assert bpy.data.collections.get("PREVIEW_ONLY")
root = bpy.data.objects["Building02Root"]
assert root.matrix_world.translation.length<1e-8
meshes = [o for o in root.children_recursive if o.type=="MESH"]
assert len(meshes)==m["mesh_objects"]
assert len({o.data.name for o in meshes})==m["unique_mesh_data"]
areas = []
source_triangles = 0
for obj in meshes:
    obj.data.calc_loop_triangles()
    source_triangles += len(obj.data.loop_triangles)
    assert obj.scale==Vector((1,1,1))
    for v in obj.data.vertices:
        assert all(math.isfinite(c) for c in v.co)
    for tri in obj.data.loop_triangles:
        a,b,c = [obj.data.vertices[i].co for i in tri.vertices]
        area = (b-a).cross(c-a).length/2
        assert area>1e-12,(obj.name,area)
        areas.append(area)
assert source_triangles==triangles
apertures = []
for window in m["windows"]:
    name = window["node"]
    side = name.split("_")[1]
    obj = bpy.data.objects[name]
    assert obj.parent.name=="WindowsRoot"
    x,z = window["local_center"]
    wall = bpy.data.objects["Wall_"+side]
    hit = wall.ray_cast(Vector((x,-2,z)),Vector((0,1,0)),distance=4)[0]
    assert not hit,("Wall filled window aperture",name)
    apertures.append(name)
for side,count in m["window_counts"].items():
    assert len([n for n in apertures if n.startswith("Window_"+side+"_")])==count
other_openings = []
for opening in m["wall_openings"]:
    x,z = opening["center"]
    w,h = opening["aperture"]
    wall = bpy.data.objects["Wall_"+opening["side"]]
    # More than a center ray: also test both sides of the broad shop opening.
    for offset in (-w*.40,0,w*.40):
        assert not wall.ray_cast(Vector((x+offset,-2,z)),Vector((0,1,0)),distance=4)[0]
    other_openings.append(opening["side"])
panels = [bpy.data.objects[name] for name in m["shutter_nodes"]]
assert len(panels)==m["shutter_panels"]==4
panel_spans = []
for panel in panels:
    assert panel.parent.name=="ShopfrontRoot" and panel.type=="MESH"
    points = [panel.matrix_world@v.co for v in panel.data.vertices]
    lo,hi = min(p.x for p in points),max(p.x for p in points)
    assert abs((hi-lo)-1.125)<1e-5
    panel_spans.append([lo,hi])
assert all(panel_spans[i][1]<panel_spans[i+1][0] for i in range(3))
assert len({o.data.name for o in panels})==4
assert bpy.data.objects["Closed_Service_Door"].parent.name=="ServiceDoorRoot"
assert all(bpy.data.objects[w["node"]]["lattice_panes"]==w["lattice_panes"] for w in m["windows"])
assert [w["lattice_panes"] for w in m["windows"] if w["node"].startswith("Window_Front_")]==[2,2]
assert bpy.context.scene.unit_settings.scale_length==1
assert all(image.packed_file for image in bpy.data.images if image.name in ("brick_color_512","roof_color_512"))

# Reopen-independent round trip, including textured material and world bounds.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(path))
bpy.context.view_layer.update()
root = bpy.data.objects["Building02Root"]
meshes = [o for o in root.children_recursive if o.type=="MESH"]
points = [o.matrix_world@v.co for o in meshes for v in o.data.vertices]
minimum = [min(v[i] for v in points) for i in range(3)]
maximum = [max(v[i] for v in points) for i in range(3)]
for a,b in zip(minimum+maximum,m["bounds_blender_min"]+m["bounds_blender_max"]):
    assert abs(a-b)<1e-4,(a,b)
assert root.matrix_world.translation.length<1e-6
assert len([o for o in meshes if o.name.startswith("Window_")])==8
assert all(bpy.data.objects[name].parent.name=="ShopfrontRoot" for name in m["shutter_nodes"])
assert len([i for i in bpy.data.images if i.size[:]==(512,512)])==2
result = {"status":"passed","asset_id":m["asset_id"],"glb_sha256":m["glb_sha256"],
    "triangles_instanced":triangles,"unique_gltf_meshes":len(d["meshes"]),
    "mesh_nodes":m["mesh_objects"],"node_count":len(names),"primitives_instanced":primitives,
    "materials":len(d["materials"]),"images":images,"source_min_triangle_area":min(areas),
    "window_apertures_checked":apertures,"additional_wall_apertures_checked":other_openings,
    "separate_shutter_panels":4,"shutter_x_spans":panel_spans,"front_paired_panes_verified":True,
    "roundtrip_bounds_blender_min":minimum,"roundtrip_bounds_blender_max":maximum,
    "grounded":abs(minimum[2])<1e-5,"source_packed_textures":True}
(out/"export_verification.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
print("T026_EXPORT_VERIFIED "+json.dumps(result))
