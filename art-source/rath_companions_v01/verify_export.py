"""T021 independent binary/scene checks and GLB reimport in Blender."""
import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument("--out", required=True)
opts = args.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
out = Path(opts.out).resolve()
expected = json.loads((out / "asset_metrics.json").read_text())
asset_id = expected["asset_id"]
path = out / (asset_id + ".glb")
blob = path.read_bytes()
magic, version, total = struct.unpack_from("<4sII", blob)
assert magic == b"glTF" and version == 2 and total == len(blob)
length, kind = struct.unpack_from("<I4s", blob, 12)
assert kind == b"JSON"
doc = json.loads(blob[20:20+length])
assert doc["asset"]["version"] == "2.0"
assert len(doc["buffers"]) == 1 and "uri" not in doc["buffers"][0]
assert not doc.get("images") and not doc.get("textures")
assert not doc.get("animations") and not doc.get("skins")
assert not doc.get("cameras")
assert not doc.get("extensionsRequired")
names = [n.get("name") for n in doc["nodes"]]
required = ["RathRoot", "ChassisRoot", "PlatformRoot", "PavilionRoot", "RoofRoot",
            "DrawbeamRoot", "GarlandRoot", "Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR"]
assert len(names) == len(set(names))
assert all(n in names for n in required)
assert not any(n.startswith("Preview") for n in names)
for node in doc["nodes"]:
    assert "camera" not in node
    for key in ("translation", "rotation", "scale", "matrix"):
        assert all(math.isfinite(v) for v in node.get(key, []))
for primitive in [p for mesh in doc["meshes"] for p in mesh["primitives"]]:
    assert primitive.get("mode", 4) == 4
    assert "NORMAL" in primitive["attributes"]
    assert doc["accessors"][primitive["indices"]]["count"] % 3 == 0
binary_triangles = sum(doc["accessors"][p["indices"]]["count"] // 3
                       for m in doc["meshes"] for p in m["primitives"])
assert binary_triangles == expected["triangles"]
assert hashlib.sha256(blob).hexdigest() == expected["glb_sha256"]
assert len(doc["nodes"]) == 21 and len(doc["meshes"]) == 10
for node in doc["nodes"]:
    assert all(abs(s - 1) < 1e-6 for s in node.get("scale", [1, 1, 1]))
assert next(n for n in doc["nodes"] if n["name"] == "RathRoot")["extras"]["asset_id"] == asset_id

bpy.ops.wm.open_mainfile(filepath=str(out / (asset_id + ".blend")))
assert bpy.data.collections.get("PREVIEW_ONLY")
assert bpy.context.scene.unit_settings.scale_length == 1.0
source_root = bpy.data.objects["RathRoot"]
assert source_root.matrix_world.translation.length < 1e-5
source_triangles = 0
for obj in source_root.children_recursive:
    if obj.type == "MESH":
        obj.data.calc_loop_triangles()
        source_triangles += len(obj.data.loop_triangles)
assert source_triangles == binary_triangles
assert all(bpy.data.objects.get(n) for n in required)

# A hidden/unselectable preview floor survives operator-based Select All/Delete.
# Remove loaded scene objects directly so reimport bounds contain only the GLB.
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=str(path))
scene_meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
bpy.context.view_layer.update()
coords = [obj.matrix_world @ v.co for obj in scene_meshes for v in obj.data.vertices]
bounds_min = [min(p[i] for p in coords) for i in range(3)]
bounds_max = [max(p[i] for p in coords) for i in range(3)]
for actual, wanted in zip(bounds_min + bounds_max,
                          expected["bounds_blender_min"] + expected["bounds_blender_max"]):
    assert abs(actual - wanted) < 1e-4, (actual, wanted)
assert all(bpy.data.objects.get(n) for n in required)
root = bpy.data.objects["RathRoot"]
assert root.matrix_world.translation.length < 1e-5
wheel_checks = []
for label, position in expected["wheel_pivots_blender"].items():
    obj = bpy.data.objects["Wheel_" + label]
    assert obj.parent == root
    assert (obj.matrix_world.translation - Vector(position)).length < 1e-4
    before = obj.matrix_world.translation.copy()
    obj.rotation_euler.x += math.pi / 4
    bpy.context.view_layer.update()
    assert (obj.matrix_world.translation - before).length < 1e-6
    assert len(obj.children) == 1 and obj.children[0].type == "MESH"
    obj.rotation_euler.x -= math.pi / 4
    bpy.context.view_layer.update()
    # Presets must preserve a round disc with equal Y/Z extents in Blender.
    mesh = obj.children[0]
    local_points = [mesh.matrix_local @ v.co for v in mesh.data.vertices]
    extents = [max(p[i] for p in local_points) - min(p[i] for p in local_points) for i in (1, 2)]
    assert all(abs(e - 2 * expected["wheel_radius_m"]) < 1e-4 for e in extents), extents
    wheel_checks.append({"node": obj.name, "pivot": list(before), "rotation_keeps_center": True,
                         "round_disc_yz_extents": extents})
result = {"status": "passed", "asset_id": asset_id, "glb_sha256": hashlib.sha256(blob).hexdigest(),
          "editable_blend_reopened": True, "blend_asset_triangles": source_triangles,
          "binary_length_bytes": total, "nodes": len(names), "meshes": len(doc["meshes"]),
          "primitives": sum(len(m["primitives"]) for m in doc["meshes"]),
          "triangles": binary_triangles, "materials": len(doc["materials"]),
          "no_external_resources": True, "no_preview_scene": True,
          "reimport_bounds_blender_min": bounds_min, "reimport_bounds_blender_max": bounds_max,
          "wheel_checks": wheel_checks}
(out / "export_verification.json").write_text(json.dumps(result, indent=2) + "\n")
print("T021_EXPORT_VERIFIED " + json.dumps(result))
