"""T027 verified model packaging; run in Blender, stdlib only."""
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
concept = HERE/"references/accepted_gateway_concept.png"
preserved = []
for prior_name in ("building01_blockout_v01", "building02_blockout_v01"):
    prior = HERE.parent/prior_name
    if (prior/"package_manifest.json").exists():
        previous = json.loads((prior/"package_manifest.json").read_text())
        for name,record in previous["files"].items():
            path = prior/name
            assert sha(path)==record["sha256"],("Previous asset modified",prior_name,name)
            assert path.stat().st_size==record["bytes"]
            preserved.append({"file":prior_name+"/"+name,"sha256":record["sha256"]})
if preserved:
    write("previous_asset_preservation.json",{"status":"passed","source":"T025/T026 manifests","files":preserved})
assert (HERE/"previous_asset_preservation.json").exists()
write("provenance.json",{
    "ticket":"T027","date":"2026-10-12","asset_id":asset,
    "concept_acceptance":"Owner requested everyday gateway model following visual acceptance; treated as source acceptance/model authorization. Other T024 concepts not automatically accepted.",
    "model_state":"Static model; director acceptance pending",
    "authoring":"Original gateway geometry, local T025 authoring helpers/brick tile and explicit UVs; previous packets unchanged",
    "generator":"generate_gateway.py","generator_sha256":sha(HERE/"generate_gateway.py"),
    "blender_version":m["blender_version"],"concept_file":concept.relative_to(HERE).as_posix(),
    "concept_sha256":sha(concept),"upstream_provenance":"art-source/festival_phase3_v01/provenance.json",
    "reference_notes":"REFERENCE_NOTES.md","new_online_research":False,"external_media_copied":False,
    "textures":[{"file":p.relative_to(HERE).as_posix(),"sha256":sha(p),"creator":"T027 generator"} for p in sorted((HERE/"textures").glob("*.png"))],
    "glb_sha256":sha(HERE/(asset+".glb")),"blend_sha256":sha(HERE/(asset+".blend")),
    "limitations":["Working dimensions and passage sizes only","Plain stone/timber and simple bolt heads","No collision, animation or placement","No authenticity/engineering certification; upstream project rights not independently certified"]
})
dims = m["dimensions_gltf_xyz_m"]
facts = f"""# T027 measured model facts

- Blender: {m['blender_version']}; working meters, adjustable.
- GLB dimensions width X / height Y / depth Z: {dims[0]:.3f} × {dims[1]:.3f} × {dims[2]:.3f} m.
- Ground root: [0, 0, 0]; GLB Y-up/front +Z; Blender Z-up/front -Y.
- Triangles: **{m['triangles']}**.
- Editable mesh objects: **{m['mesh_objects']}**, unique linked mesh-data: **{m['unique_mesh_data']}**.
- GLB nodes: **{v['node_count']}**, unique exported meshes: **{v['unique_gltf_meshes']}**.
- Material primitives: **{v['primitives_instanced']}**, four materials.
- Texture: **1 × 512 × 512 PNG**, packed in blend and embedded in GLB.
- No clips, skeletons, colliders, exported camera/lights or external runtime image dependencies.
- GLB: **{m['glb_bytes']} bytes**; blend: **{(HERE/(asset+'.blend')).stat().st_size} bytes**.
- GLB SHA-256: {m['glb_sha256']}.
- Two brick piers, four stone pieces, one lintel and one mesh of eight plain fastener heads.
- Narrowest passage width: {m['clear_passage_width_m']:.3f} m; lintel underside: {m['clear_passage_height_m']:.3f} m.
- Geometry, nine sampled passage rays in source/round-trip, packed/embedded texture and bounds: verified.
- Browser: {b['browser']}, PlayCanvas {b['imported']['version']}, {b['imported']['backend']}, software rendering.
- Screenshots: desktop 1000 × 1000, narrow viewport 390 × 844. No physical device/FPS test.

These are measured asset facts, not approved mobile or multi-building budgets. See HANDOFF.md for editing/review steps.
"""
(HERE/"MODEL_FACTS.md").write_text(facts,encoding="utf8")
pngs = sorted(HERE.rglob("*.png"))
assert len(pngs)==9
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
names = [asset+".blend",asset+".glb","generate_gateway.py","verify_export.py","check_playcanvas.mjs",
    "prepare_handoff.py","HANDOFF.md","REFERENCE_NOTES.md","MODEL_FACTS.md","asset_metrics.json",
    "export_verification.json","playcanvas_verification.json","provenance.json","preview_verification.json",
    "previous_asset_preservation.json"]
names += [p.relative_to(HERE).as_posix() for p in pngs]
write("package_manifest.json",{"ticket":"T027","asset_id":asset,
    "files":{name:{"bytes":(HERE/name).stat().st_size,"sha256":sha(HERE/name)} for name in names}})
names.append("package_manifest.json")
archive = HERE/"gateway_handoff_v01.zip"
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
print("T027_PACKAGE_VERIFIED "+json.dumps({"files":len(names),"zip_bytes":archive.stat().st_size,
    "triangles":m["triangles"],"glb_bytes":m["glb_bytes"]}))
