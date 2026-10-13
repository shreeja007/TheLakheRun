"""T026 verified model packaging; run in Blender, stdlib only."""
import hashlib
import json
import struct
import zipfile
from pathlib import Path
HERE = Path(__file__).resolve().parent
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def write(name,value):
    (HERE/name).write_text(json.dumps(value,indent=2)+"\n",encoding="utf8")
m = json.loads((HERE/"asset_metrics.json").read_text())
v = json.loads((HERE/"export_verification.json").read_text())
b = json.loads((HERE/"playcanvas_verification.json").read_text())
assert v["status"]==b["status"]=="passed"
asset = m["asset_id"]
assert m["glb_sha256"]==sha(HERE/(asset+".glb"))
assert b["glb_sha256"]==m["glb_sha256"]==v["glb_sha256"]
concept = HERE/"references/accepted_building02_concept.png"
prior = HERE.parent/"building01_blockout_v01"
preserved = []
if (prior/"package_manifest.json").exists():
    previous = json.loads((prior/"package_manifest.json").read_text())
    for name,record in previous["files"].items():
        path = prior/name
        assert sha(path)==record["sha256"],("Previous asset modified",name)
        assert path.stat().st_size==record["bytes"]
        preserved.append({"file":name,"sha256":record["sha256"]})
    write("previous_asset_preservation.json",{"status":"passed","source":"T025 package manifest","files":preserved})
assert (HERE/"previous_asset_preservation.json").exists()
write("provenance.json",{
    "ticket":"T026","date":"2026-10-12","asset_id":asset,
    "concept_acceptance":"Owner requested Building 02 model following visual acceptance; treated as acceptance of this source for the static model. Other T024 concepts not automatically accepted.",
    "model_state":"Static model; director acceptance pending",
    "authoring":"Original shopfront geometry adapted from local T025 generator, UVs, materials and two analytic repeating color tiles; previous packet unchanged",
    "generator":"generate_building.py","generator_sha256":sha(HERE/"generate_building.py"),
    "blender_version":m["blender_version"],"concept_file":concept.relative_to(HERE).as_posix(),
    "concept_sha256":sha(concept),"upstream_provenance":"art-source/festival_phase3_v01/provenance.json",
    "reference_notes":"REFERENCE_NOTES.md","new_online_research":False,"external_media_copied":False,
    "textures":[{"file":p.relative_to(HERE).as_posix(),"sha256":sha(p),"creator":"T026 generator"} for p in sorted((HERE/"textures").glob("*.png"))],
    "glb_sha256":sha(HERE/(asset+".glb")),"blend_sha256":sha(HERE/(asset+".blend")),
    "limitations":["Working dimensions only","Simplified roof/stone/timber finish","No interior, collision, door behavior, animation or placement","No authenticity/engineering certification; upstream project rights not independently certified"]
})
dims = m["dimensions_gltf_xyz_m"]
facts = f"""# T026 measured model facts

- Blender: {m['blender_version']}; working meters, adjustable.
- GLB dimensions width X / height Y / depth Z: {dims[0]:.3f} × {dims[1]:.3f} × {dims[2]:.3f} m.
- Ground root: [0, 0, 0]; GLB Y-up/front +Z; Blender Z-up/front -Y.
- Body footprint before overhang/step: 6.4 × 3.6 m.
- Triangles including window instances: **{m['triangles']}**.
- Editable mesh objects: **{m['mesh_objects']}**, unique linked mesh-data: **{m['unique_mesh_data']}**.
- GLB nodes: **{v['node_count']}**, unique exported meshes: **{v['unique_gltf_meshes']}**.
- Instanced material primitives: **{v['primitives_instanced']}**, six materials.
- Textures: **2 × 512 × 512 PNG**, packed in blend and embedded in GLB.
- No clips, skeletons, colliders, exported camera/lights or external runtime image dependencies.
- GLB: **{m['glb_bytes']} bytes**; blend: **{(HERE/(asset+'.blend')).stat().st_size} bytes**.
- GLB SHA-256: {m['glb_sha256']}.
- Windows front 2 paired/back 2/left 2/right 2; three linked module size variants.
- Four separate shutter panels, one back service door; no operational hinges/animation.
- Geometry, 8 window apertures plus shop/service openings and round-trip bounds: verified.
- Browser: {b['browser']}, PlayCanvas {b['imported']['version']}, {b['imported']['backend']}, software rendering.
- Screenshots: desktop 1000 × 1000, narrow viewport 390 × 844. No physical device/FPS test.

These are measured asset facts, not approved mobile or multi-building budgets. See HANDOFF.md for editing/review steps.
"""
(HERE/"MODEL_FACTS.md").write_text(facts,encoding="utf8")
pngs = sorted(HERE.rglob("*.png"))
assert len(pngs)==10
previews = []
for p in pngs:
    data = p.read_bytes()
    assert data[:8]==b"\x89PNG\r\n\x1a\n" and data[12:16]==b"IHDR"
    dims = list(struct.unpack_from(">II",data,16))
    expected = ([512,512] if p.parent.name=="textures" else [1672,941] if p.parent.name=="references"
                else [390,844] if "mobile" in p.name else [1000,1000])
    assert dims==expected,(p.name,dims)
    previews.append({"file":p.relative_to(HERE).as_posix(),"dimensions":dims,"bytes":len(data),"sha256":sha(p)})
write("preview_verification.json",{"status":"passed","check":"PNG signatures/dimensions/hashes; visual review separate","files":previews})
names = [asset+".blend",asset+".glb","generate_building.py","verify_export.py","check_playcanvas.mjs",
    "prepare_handoff.py","HANDOFF.md","REFERENCE_NOTES.md","MODEL_FACTS.md","asset_metrics.json",
    "export_verification.json","playcanvas_verification.json","provenance.json","preview_verification.json",
    "previous_asset_preservation.json"]
names += [p.relative_to(HERE).as_posix() for p in pngs]
write("package_manifest.json",{"ticket":"T026","asset_id":asset,
    "files":{name:{"bytes":(HERE/name).stat().st_size,"sha256":sha(HERE/name)} for name in names}})
names.append("package_manifest.json")
archive = HERE/"building02_handoff_v01.zip"
with zipfile.ZipFile(archive,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=6) as bundle:
    for name in names:
        bundle.write(HERE/name,name)
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert len(bundle.namelist())==len(set(bundle.namelist()))==len(names)
    checks = []
    for name in names:
        data = bundle.read(name)
        assert hashlib.sha256(data).hexdigest()==sha(HERE/name)
        checks.append({"entry":name,"bytes":len(data),"sha256":sha(HERE/name)})
write("package_verification.json",{"status":"passed","entries":checks,"archive":archive.name,
    "bytes":archive.stat().st_size,"sha256":sha(archive)})
print("T026_PACKAGE_VERIFIED "+json.dumps({"files":len(names),"zip_bytes":archive.stat().st_size,
    "triangles":m["triangles"],"glb_bytes":m["glb_bytes"]}))
