"""T022 repository handoff/package writer, standard Python (or Blender --python).
Run after source/export/browser checks. Requires previous rath records in repo.
"""
import hashlib
import json
import struct
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
ASSET_ID = "pulu_kisi_blockout_v01"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(name, data):
    (HERE/name).write_text(json.dumps(data, indent=2)+"\n", encoding="utf8")


def vector(values):
    return ", ".join(f"{v:.6f}" for v in values)


metrics = json.loads((HERE/"asset_metrics.json").read_text())
exported = json.loads((HERE/"export_verification.json").read_text())
browser = json.loads((HERE/"playcanvas_verification.json").read_text())
assert metrics["asset_id"] == exported["asset_id"] == browser["asset_id"] == ASSET_ID
assert exported["status"] == browser["status"] == "passed"
assert sha(HERE/(ASSET_ID+".glb")) == metrics["glb_sha256"] == exported["glb_sha256"] == browser["glb_sha256"]
assert metrics["triangles"] == exported["triangles"]

# Keep previous delivered assets/source/archives intact, using their existing
# package records. Flat T020 entries and nested T021 entries use different keys.
preservation = {}
for folder in ("art-source/rath_blockout_v01", "art-source/rath_companions_v01/bhairab",
               "art-source/rath_companions_v01/ganesh"):
    previous = REPO/folder
    record = json.loads((previous/"package_verification.json").read_text())
    archive = previous/record["archive"]
    assert sha(archive).upper() == record["sha256"].upper()
    preservation[archive.relative_to(REPO).as_posix()] = sha(archive)
    for entry in record["entries"]:
        path = previous/entry["file"] if "file" in entry else previous.parent/entry["entry"]
        actual = sha(path)
        assert actual.upper() == entry["sha256"].upper(), str(path)
        preservation[path.relative_to(REPO).as_posix()] = actual
write_json("previous_asset_preservation.json", {"status": "passed", "unchanged_hashes": preservation})

width, height, depth = metrics["dimensions_gltf_xyz_m"]
rows = "\n".join(f"| {name} | {metrics['group_parents'][name] or 'none'} | {vector((p[0], p[2], -p[1]))} |"
                 for name, p in metrics["group_pivots_blender_world"].items())
handoff = f"""# Pulu Kisi blockout v01 — developer handoff

T022, 2026-10-11. Static draft for import and development testing. Visual/cultural acceptance pending.

## Give your friend these files

- **{ASSET_ID}.glb** — standalone binary geometry and PBR color materials; no external textures.
- **{ASSET_ID}.blend** — editable Blender {metrics['blender_version']} source and excluded PREVIEW_ONLY collection.
- **generate_pulu.py** — original procedural source; adjust shape/dimensions and regenerate into a fresh folder.
- **preview_front.png, preview_left.png, preview_right.png, preview_back.png, preview_perspective.png** — actual renders of this model.
- **asset_metrics.json, export_verification.json, playcanvas_verification.json, provenance.json** — counts, coordinates, checked hashes and source record.
- **verify_export.py, check_playcanvas.mjs, prepare_handoff.py** — source/export, isolated browser and repository packaging checks.
- **REFERENCE_NOTES.md** — prior research direction, simplifications and review boundaries.

The ZIP contains these files flat at its root, plus package_manifest.json and previous-asset preservation evidence. package_verification.json stays beside the ZIP to record its final hash without a self-referential archive checksum.

The silhouette is an elongated cloth-and-frame effigy, with open underside and two separated shoe pairs. It does not have natural elephant legs/anatomy or visible performer bodies. The head/ears/tuft, colored plain trim, seam layout, shoes and bead garland are simplified T019/T022 proposals; fine fabric weave, painted mask detail and historical construction are not reproduced. No authenticity claim, sacred symbols or ceremonial movement.

## Coordinate and sizing contract

| Property | Measured value |
|---|---|
| Unit | 1 unit = 1 meter |
| GLB up / forward | +Y / +Z, toward face/trunk |
| Blender up / forward | +Z / -Y |
| Root | PuluRoot identity transform at ground level below cloth-body center |
| Full width × height × depth | {width:.6f} × {height:.6f} × {depth:.6f} m, including ears/tuft/trunk |
| GLB min bounds X, Y, Z | {vector(metrics['bounds_gltf_min'])} |
| GLB max bounds X, Y, Z | {vector(metrics['bounds_gltf_max'])} |
| Cloth hem minimum height | {exported['cloth_hem_z_m']:.6f} m; soles touch Y=0 |
| Triangles / mesh objects / named nodes | {metrics['triangles']:,} / {metrics['mesh_objects']} / {exported['nodes']} |
| Material primitives / shared materials | {exported['primitives']} / {exported['materials']} |
| Texture images / clips / rig | 0 / 0 / none |
| GLB payload | {metrics['glb_bytes']:,} bytes ({metrics['glb_bytes']/1024:.1f} KiB) |

These are tentative blockout values, not real effigy measurements or adopted game dimensions. Confirm proportions/scale before placement. Scale the imported parent uniformly; dimensions/pivots are baked into meshes and groups have unit scale.

## Groups and attachment centers

Every group has one consolidated, directly editable child mesh. HeadRoot carries TrunkRoot, Ear_L, Ear_R and TuftRoot, so those parts follow whole-head transforms. GarlandRoot/TrimRoot attach to the body/root rather than head: rigid head movement does not provide automatic garland/ribbon adjustment. FrameRoot is a simple hidden-under-cloth support suggestion. Feet_Front and Feet_Rear each contain two shoes, not walking legs or a gait rig.

| Node | Parent | World pivot in unscaled GLB X, Y, Z (m) |
|---|---|---|
{rows}

The table gives unscaled model-space **world** coordinates. Nested nodes use parent-relative local positions in the GLB; do not assign the table's world positions as local positions. Ear_L/Ear_R label negative/positive X sides, not camera-view left/right.

Head/trunk/ear origins are attachment pivots for later development, not a skeletal rig, articulation limits or approved movements. TrunkRoot moves one rigid curled trunk; flexible trunk deformation needs separately approved segmented geometry/rig work. The fiber tuft is static geometry, not a hair simulation. Cloth thickness/seams are static mesh, not simulated fabric. No colliders or animation clips are supplied.

For later work, use the imported parent for placement. Hide FrameRoot, GarlandRoot or TrimRoot for simpler visual tests; if hiding TrimRoot, the colored body/ear edging remains because it is part of those meshes. Check geometry overlaps/attachments if adding motion; static export checks do not approve choreography.

## Loading in the friend's branch

Agree a runtime path and copy only the GLB there. This is a proposed path, not a registered runtime asset:

```ts
app.assets.loadFromUrl('/models/{ASSET_ID}.glb', 'container', (error, asset) => {{
  if (error || !asset?.resource) {{
    console.error('Pulu Kisi failed to load', error);
    return;
  }}
  const pulu = asset.resource.instantiateRenderEntity();
  app.root.addChild(pulu);
  pulu.setPosition(0, 0, 0);
  const head = pulu.findByName('HeadRoot');
  const trunk = pulu.findByName('TrunkRoot');
  const ears = ['Ear_L', 'Ear_R'].map(name => pulu.findByName(name));
  // Store entities in a later view/controller. This handoff adds no motion code.
}});
```

Tested with isolated PlayCanvas {browser['imported']['engineVersion']} container loading. This does not adopt an engine or gameplay role. Movement, if separately authorized later, should derive displacement from speed × dt; no motion/choreography or collision behavior is implemented here.

## Rebuild and verify

From repository root in PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/generate_pulu.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/verify_export.py
node art-source/pulu_kisi_blockout_v01/check_playcanvas.mjs art-source/pulu_kisi_blockout_v01
```

After extracting the ZIP, run Blender with `--python generate_pulu.py -- --out ./rebuilt` and then `--python verify_export.py -- --out ./rebuilt` from its root. Adjust the Blender executable path to your installation. These commands need only Blender and the supplied scripts. Browser checking uses existing repository node_modules (Playwright/PlayCanvas) and script location; run it in this repository. prepare_handoff.py is a repository packaging utility and also requires the prior rath records/concept. The GLB itself has no authoring dependencies. No Meshy service or upload required.

The generator builds a fresh scene and overwrites generated outputs in its selected directory; preserve manual edits as a new .blend/version or rebuild into a new --out folder. --skip-renders omits the five previews. Consolidated meshes remain editable in Edit Mode; the generator is the editable procedural source for original subparts.

For manual GLB export after editing: select PuluRoot and all descendants; GLB, Selected Objects, +Y Up, no animations/cameras/lights. Exclude PREVIEW_ONLY. Update asset measurements and rerun checks; delivered JSON checks refer to the packaged hashes.

## Manual acceptance

1. Import GLB and compare all five mesh previews. Check long horizontal cloth shell, four neutral shoes in front/rear pairs, curled trunk and plain head/ears/tuft.
2. Place imported parent at Y=0: sole bottoms touch ground. Use low/front/side cameras to see shoes; high cameras can hide them behind the skirt.
3. Test a temporary small head transform: trunk/ears/tuft follow while cloth stays fixed. Restore the pose. Test independent trunk/ear rotations at their attachment centers. These are technical pivot checks, not provided animation states or ceremonial actions.
4. Hide cloth temporarily to inspect the simplified removable internal frame. Assess head/ribbon/garland overlaps before any future motion.
5. Review silhouette, proportions, gentle expression and respectful simplifications with director/local reviewer before polish/public portrayal.
6. Test target physical phone with eventual lighting and instance count. Eight materials/{exported['primitives']} primitives are measured, not an approved mobile budget.

Verified: Blender save/reopen and GLB round trip, finite/nondegenerate source triangles, bounds within 0.0001 m, attachment positions/rigid rotations/parent following, two grounded shoe pairs, isolated Chrome software WebGL2 at 1000×900 and viewport-only 390×844, zero page errors. In-app browser setup failed on missing sandboxPolicy metadata; fallback used existing Playwright. No physical phone, hardware-GPU FPS, game lighting/placement/collisions, other Blender version, flexible trunk or cloth deformation tested.

Kumari/Bhairab/Ganesh files and friend/Tuku/Lakhey assets are preserved. Game source, public runtime registrations, decision log, server and deployment remain unchanged. Future Pulu Kisi gameplay use remains separately scoped and subject to the cultural-document review already recorded in T019.
"""
(HERE/"HANDOFF.md").write_text(handoff, encoding="utf8")
concept = REPO/"art-source/festival_phase1_v01/pulu_kisi_concept_v01.png"
write_json("provenance.json", {"ticket": "T022", "date": "2026-10-11", "asset_id": ASSET_ID,
    "state": "simplified static draft; director/cultural acceptance pending",
    "authoring": "Original procedural Blender geometry, following existing project-generated T019 concept",
    "blender": metrics["blender_version"], "generator": "generate_pulu.py", "generator_sha256": sha(HERE/"generate_pulu.py"),
    "concept_source": concept.relative_to(REPO).as_posix(), "concept_sha256": sha(concept),
    "research_register": "art-source/festival_phase1_v01/RESEARCH_AND_HANDOFF.md", "new_online_research": False,
    "external_media_copied": False, "texture_dependencies": [],
    "glb_sha256": sha(HERE/(ASSET_ID+".glb")), "blend_sha256": sha(HERE/(ASSET_ID+".blend")),
    "simplifications": ["Unverified exact dimensions", "Plain face/ear trim, seams, ribbons, tuft and proxy shoes",
                        "Internal frame is suggested construction only", "No rig/clips/colliders or approved choreography"],
    "rights": "No outside mesh/photo/texture imported. Project-generated concept is design input; underlying project ownership not independently established. No new repository license imposed."})
pngs = sorted(HERE.glob("*.png"))
assert len(pngs) == 7
previews = []
for png in pngs:
    data = png.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR"
    dimensions = list(struct.unpack_from(">II", data, 16))
    assert dimensions == ([390, 844] if "mobile" in png.name else [1000, 900])
    previews.append({"file": png.name, "dimensions": dimensions, "sha256": sha(png)})
write_json("preview_verification.json", {"status": "passed", "check": "PNG signatures/dimensions/hashes", "files": previews})
names = [ASSET_ID+ext for ext in (".blend", ".glb")]
names += [p.name for p in pngs]
names += ["generate_pulu.py", "verify_export.py", "check_playcanvas.mjs", "prepare_handoff.py", "HANDOFF.md",
          "REFERENCE_NOTES.md", "asset_metrics.json", "export_verification.json", "playcanvas_verification.json",
          "provenance.json", "preview_verification.json", "previous_asset_preservation.json"]
manifest = {name: {"bytes": (HERE/name).stat().st_size, "sha256": sha(HERE/name)} for name in names}
write_json("package_manifest.json", {"ticket": "T022", "asset_id": ASSET_ID, "files": manifest})
names.append("package_manifest.json")
archive = HERE/"pulu_kisi_handoff_v01.zip"
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
    for name in names:
        bundle.write(HERE/name, name)
checks = []
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert len(bundle.namelist()) == len(names) == len(set(bundle.namelist()))
    for name in names:
        actual = hashlib.sha256(bundle.read(name)).hexdigest()
        assert actual == sha(HERE/name)
        checks.append({"entry": name, "sha256": actual})
write_json("package_verification.json", {"status": "passed", "archive": archive.name, "bytes": archive.stat().st_size,
           "sha256": sha(archive), "entries": checks})
print("T022_PACKAGE_VERIFIED "+json.dumps({"entries": len(names), "glb_bytes": metrics["glb_bytes"],
      "zip_bytes": archive.stat().st_size, "preserved_prior_files": len(preservation)}))
