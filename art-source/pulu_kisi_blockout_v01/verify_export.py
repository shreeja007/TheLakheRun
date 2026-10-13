"""T022 independent binary, source/geometry and attachment-pivot checks."""
import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
import bpy
from mathutils import Matrix, Vector

args = argparse.ArgumentParser()
args.add_argument("--out", default=str(Path(__file__).resolve().parent))
opts = args.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
out = Path(opts.out).resolve()
expected = json.loads((out/"asset_metrics.json").read_text())
asset_id = expected["asset_id"]
path = out/(asset_id+".glb")
blob = path.read_bytes()
magic, version, total = struct.unpack_from("<4sII", blob)
assert magic == b"glTF" and version == 2 and total == len(blob)
length, kind = struct.unpack_from("<I4s", blob, 12)
assert kind == b"JSON"
doc = json.loads(blob[20:20+length])
assert doc["asset"]["version"] == "2.0"
assert len(doc["buffers"]) == 1 and "uri" not in doc["buffers"][0]
for key in ("images", "textures", "animations", "skins", "cameras", "extensionsRequired"):
    assert not doc.get(key), key
required = ["PuluRoot", "ClothRoot", "FrameRoot", "HeadRoot", "TrunkRoot", "Ear_L", "Ear_R",
            "TuftRoot", "GarlandRoot", "TrimRoot", "Feet_Front", "Feet_Rear"]
names = [n["name"] for n in doc["nodes"]]
assert len(names) == len(set(names)) == 23
assert set(names) == set(expected["node_names"])
assert all(n in names for n in required)
assert not any(n.startswith("Preview") for n in names)
for node in doc["nodes"]:
    assert "camera" not in node
    for key in ("translation", "rotation", "scale", "matrix"):
        assert all(math.isfinite(v) for v in node.get(key, []))
    assert all(abs(s-1) < 1e-6 for s in node.get("scale", [1, 1, 1]))
assert next(n for n in doc["nodes"] if n["name"] == "PuluRoot")["extras"]["asset_id"] == asset_id
triangles = 0
for primitive in [p for mesh in doc["meshes"] for p in mesh["primitives"]]:
    assert primitive.get("mode", 4) == 4 and "NORMAL" in primitive["attributes"]
    count = doc["accessors"][primitive["indices"]]["count"]
    assert count % 3 == 0
    triangles += count//3
assert triangles == expected["triangles"]
assert len(doc["meshes"]) == expected["mesh_objects"] == 11
assert hashlib.sha256(blob).hexdigest() == expected["glb_sha256"]

bpy.ops.wm.open_mainfile(filepath=str(out/(asset_id+".blend")))
assert bpy.data.collections.get("PREVIEW_ONLY")
assert bpy.context.scene.unit_settings.scale_length == 1
root = bpy.data.objects["PuluRoot"]
assert root.matrix_world.translation.length < 1e-6
source_triangles = 0
min_triangle_area = float("inf")
for obj in root.children_recursive:
    if obj.type == "MESH":
        obj.data.calc_loop_triangles()
        source_triangles += len(obj.data.loop_triangles)
        for vertex in obj.data.vertices:
            assert all(math.isfinite(v) for v in vertex.co)
        for tri in obj.data.loop_triangles:
            a, b, c = [obj.data.vertices[i].co for i in tri.vertices]
            area = (b-a).cross(c-a).length/2
            min_triangle_area = min(min_triangle_area, area)
            assert area > 1e-12, (obj.name, list(tri.vertices), area)
assert source_triangles == triangles
for name in required[1:]:
    obj = bpy.data.objects[name]
    assert obj.parent.name == expected["group_parents"][name]
    assert len(obj.children) >= 1
    assert len([c for c in obj.children if c.type == "MESH"]) == 1
cloth = bpy.data.objects["ClothRoot_Mesh"]
cloth_min_z = min((cloth.matrix_world @ v.co).z for v in cloth.data.vertices)
assert abs(cloth_min_z-expected["cloth_hem_height_m"]) < .002
for name in ("Feet_Front", "Feet_Rear"):
    mesh = next(c for c in bpy.data.objects[name].children if c.type == "MESH")
    assert abs(min((mesh.matrix_world @ v.co).z for v in mesh.data.vertices)) < 1e-5

for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=str(path))
bpy.context.view_layer.update()
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
coords = [obj.matrix_world @ v.co for obj in meshes for v in obj.data.vertices]
minimum = [min(p[i] for p in coords) for i in range(3)]
maximum = [max(p[i] for p in coords) for i in range(3)]
for actual, wanted in zip(minimum+maximum, expected["bounds_blender_min"]+expected["bounds_blender_max"]):
    assert abs(actual-wanted) < 1e-4, (actual, wanted)
root = bpy.data.objects["PuluRoot"]
assert root.matrix_world.translation.length < 1e-6
for name in required[1:]:
    obj = bpy.data.objects[name]
    assert obj.parent.name == expected["group_parents"][name]
    assert (obj.matrix_world.translation-Vector(expected["group_pivots_blender_world"][name])).length < 1e-4
attachment_checks = []
for name in ("HeadRoot", "TrunkRoot", "Ear_L", "Ear_R"):
    obj = bpy.data.objects[name]
    before_matrix = obj.matrix_world.copy()
    before = obj.matrix_world.translation.copy()
    mesh = next(c for c in obj.children if c.type == "MESH")
    vertex = max(mesh.data.vertices, key=lambda v: v.co.y**2+v.co.z**2)
    point_before = mesh.matrix_world @ vertex.co
    # Imported empties may use quaternion rotation and a glTF-up correction on
    # their ancestor. Change matrices, rather than inactive Euler properties.
    obj.matrix_world = before_matrix @ Matrix.Rotation(math.radians(15), 4, "X")
    bpy.context.view_layer.update()
    assert (obj.matrix_world.translation-before).length < 1e-6
    moved = (mesh.matrix_world @ vertex.co-point_before).length
    assert moved > 1e-3, (name, moved)
    obj.matrix_world = before_matrix
    bpy.context.view_layer.update()
    attachment_checks.append({"node": name, "pivot_blender": list(before),
                             "rigid_rotation_keeps_attachment": True, "mesh_point_moved_m": moved})
head = bpy.data.objects["HeadRoot"]
head_matrix = head.matrix_world.copy()
before_children = {name: bpy.data.objects[name].matrix_world.translation.copy()
                   for name in ("TrunkRoot", "Ear_L", "Ear_R", "TuftRoot")}
head_position = head.matrix_world.translation.copy()
body_before = bpy.data.objects["ClothRoot_Mesh"].matrix_world.copy()
angle = math.radians(15)
head.matrix_world = (Matrix.Translation(head_position) @ Matrix.Rotation(angle, 4, "Z")
                     @ Matrix.Translation(-head_position) @ head_matrix)
bpy.context.view_layer.update()
for name, before in before_children.items():
    wanted = head_position + Matrix.Rotation(angle, 3, "Z") @ (before-head_position)
    assert (bpy.data.objects[name].matrix_world.translation-wanted).length < 1e-5
assert all(abs(a-b) < 1e-6 for a, b in zip(sum([list(r) for r in body_before], []),
                                         sum([list(r) for r in bpy.data.objects["ClothRoot_Mesh"].matrix_world], [])))
head.matrix_world = head_matrix
result = {"status": "passed", "asset_id": asset_id, "glb_sha256": hashlib.sha256(blob).hexdigest(),
          "editable_blend_reopened": True, "source_triangles": source_triangles,
          "minimum_source_triangle_area_m2": min_triangle_area, "source_finite_nondegenerate_geometry": True,
          "nodes": len(names), "meshes": len(doc["meshes"]), "triangles": triangles,
          "primitives": sum(len(m["primitives"]) for m in doc["meshes"]), "materials": len(doc["materials"]),
          "no_external_resources": True, "no_preview_scene": True, "two_grounded_foot_pairs": True,
          "cloth_hem_z_m": cloth_min_z, "reimport_bounds_blender_min": minimum,
          "reimport_bounds_blender_max": maximum, "attachment_checks": attachment_checks,
          "head_children_follow_attachment": True, "body_unchanged_during_head_rotation": True}
(out/"export_verification.json").write_text(json.dumps(result, indent=2)+"\n", encoding="utf8")
print("T022_EXPORT_VERIFIED "+json.dumps(result))
