"""Independent T027 source, aperture, embedded-image and GLB round-trip checks."""
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
assert len(d["materials"])==len(m["materials"])==4
assert len(d["images"])==len(d["textures"])==1
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
root = bpy.data.objects["GatewayRoot"]
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
assert len([o for o in meshes if o.name.startswith("Pier_")])==2
assert bpy.data.objects["Timber_Lintel"].parent.name=="LintelRoot"
assert bpy.data.objects["Plain_Fasteners"].parent.name=="LintelRoot"
def points(obj):
    return [obj.matrix_world@v.co for v in obj.data.vertices]
left_edge = max(v.x for v in points(bpy.data.objects["Stone_Footing_Left"]))
right_edge = min(v.x for v in points(bpy.data.objects["Stone_Footing_Right"]))
beam_bottom = min(v.z for v in points(bpy.data.objects["Timber_Lintel"]))
assert abs(right_edge-left_edge-m["clear_passage_width_m"])<1e-5
assert abs(beam_bottom-m["clear_passage_height_m"])<1e-5
def clear_rays(meshes):
    checked = []
    for x in (-1.9,0,1.9):
        for z in (.10,1.60,3.05):
            for obj in meshes:
                inverse = obj.matrix_world.inverted()
                origin = inverse@Vector((x,-2,z))
                direction = (inverse.to_3x3()@Vector((0,1,0))).normalized()
                assert not obj.ray_cast(origin,direction,distance=4)[0],("Passage obstructed",obj.name,x,z)
            checked.append([x,z])
    return checked
passage_rays = clear_rays(meshes)
assert bpy.context.scene.unit_settings.scale_length==1
assert bpy.data.images["brick_color_512"].packed_file

# Reopen-independent round trip, including textured material and world bounds.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(path))
bpy.context.view_layer.update()
root = bpy.data.objects["GatewayRoot"]
meshes = [o for o in root.children_recursive if o.type=="MESH"]
points = [o.matrix_world@v.co for o in meshes for v in o.data.vertices]
minimum = [min(v[i] for v in points) for i in range(3)]
maximum = [max(v[i] for v in points) for i in range(3)]
for a,b in zip(minimum+maximum,m["bounds_blender_min"]+m["bounds_blender_max"]):
    assert abs(a-b)<1e-4,(a,b)
assert root.matrix_world.translation.length<1e-6
assert len(meshes)==8
assert len([o for o in meshes if o.name.startswith("Pier_")])==2
assert clear_rays(meshes)==passage_rays
assert len([i for i in bpy.data.images if i.size[:]==(512,512)])==1
result = {"status":"passed","asset_id":m["asset_id"],"glb_sha256":m["glb_sha256"],
    "triangles_instanced":triangles,"unique_gltf_meshes":len(d["meshes"]),
    "mesh_nodes":m["mesh_objects"],"node_count":len(names),"primitives_instanced":primitives,
    "materials":len(d["materials"]),"images":images,"source_min_triangle_area":min(areas),
    "passage_rays_source_and_roundtrip":passage_rays,
    "measured_clear_width_m":right_edge-left_edge,"measured_lintel_underside_m":beam_bottom,
    "roundtrip_bounds_blender_min":minimum,"roundtrip_bounds_blender_max":maximum,
    "grounded":abs(minimum[2])<1e-5,"source_packed_textures":True}
(out/"export_verification.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
print("T027_EXPORT_VERIFIED "+json.dumps(result))
