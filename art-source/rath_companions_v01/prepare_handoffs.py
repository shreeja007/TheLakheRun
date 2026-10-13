"""T021 local handoff writer/ZIP integrity check. Run after model/browser checks.
Uses standard Python only (also runs through Blender --python-exit-code 1).
Never packages logs, backups, outside research photos, or the other variant.
"""
import hashlib
import json
import struct
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SOURCES = ("generate_rath.py", "verify_export.py", "check_playcanvas.mjs", "prepare_handoffs.py", "README.md")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf8")


def vector(values):
    return ", ".join(f"{v:.6f}" for v in values)


# Reconfirm the prior asset handoff remains byte-identical to its recorded hashes.
prior = REPO / "art-source/rath_blockout_v01"
old_provenance = json.loads((prior / "provenance.json").read_text())
preservation = {}
for extension in ("glb", "blend"):
    path = prior / ("kumari_rath_blockout_v01." + extension)
    actual = sha(path)
    assert actual.upper() == old_provenance[extension + "_sha256"].upper()
    preservation[path.relative_to(REPO).as_posix()] = actual
old_package = json.loads((prior / "package_verification.json").read_text())
old_archive = prior / old_package["archive"]
assert sha(old_archive).upper() == old_package["sha256"].upper()
preservation[old_archive.relative_to(REPO).as_posix()] = sha(old_archive)
for entry in old_package["entries"]:
    path = prior / entry["file"]
    actual = sha(path)
    assert actual.upper() == entry["sha256"].upper()
    preservation[path.relative_to(REPO).as_posix()] = actual
write_json(HERE / "kumari_preservation.json", {"status": "passed", "unchanged_hashes": preservation})

for variant in ("bhairab", "ganesh"):
    out = HERE / variant
    metrics = json.loads((out / "asset_metrics.json").read_text())
    exported = json.loads((out / "export_verification.json").read_text())
    browser = json.loads((out / "playcanvas_verification.json").read_text())
    asset_id = metrics["asset_id"]
    assert exported["status"] == browser["status"] == "passed"
    assert sha(out / (asset_id + ".glb")) == exported["glb_sha256"] == metrics["glb_sha256"]
    assert exported["triangles"] == metrics["triangles"]
    assert browser["asset_id"] == asset_id
    assert browser["glb_sha256"] == metrics["glb_sha256"]
    width, height, depth = metrics["dimensions_gltf_xyz_m"]
    radius = metrics["wheel_radius_m"]
    concept = REPO / f"art-source/festival_phase1_v01/{variant}_rath_concept_v01.png"
    title = variant.title()
    differences = (
        "Lower pavilion, slightly thicker posts and crossbraces, three-loop garlands and plain inset panels."
        if variant == "bhairab" else
        "Narrower frame, slimmer posts, plain rails without inset panels, and two-loop simpler garlands."
    )
    pivots = "\n".join(
        f"| Wheel_{name} | {vector((p[0], p[2], -p[1]))} |"
        for name, p in metrics["wheel_pivots_blender"].items()
    )
    handoff = f"""# {title} rath blockout v01 — developer handoff

T021, 2026-10-11. Static draft, pending director and informed cultural review.

## Files to give your friend

- **{asset_id}.glb**: standalone binary model; no external textures required.
- **{asset_id}.blend**: editable Blender {metrics['blender_version']} source, including an excluded PREVIEW_ONLY camera/light/floor collection.
- **preview_front.png, preview_left.png, preview_back.png, preview_perspective.png**: actual views rendered from this mesh, not AI turnaround guesses.
- **asset_metrics.json, export_verification.json, playcanvas_verification.json, provenance.json**: measured counts, import evidence and source record.
- Shared **generate_rath.py** and validation scripts are one folder above these files, also supplied at the archive root. The generator includes explicit bhairab and ganesh presets.

{differences} Both companions are smaller than the delivered Kumari shell. These differences and size ratios are original T019/T021 proposals, not verified traditional identifiers. The names label intended asset slots; no deity figures, sacred paintings/carving, ritual gestures or occupants are supplied. Timber panels, canopy, joinery and garland beads are simplified original geometry.

## Sizing and node contract

| Property | Measured value |
|---|---|
| GLB up / forward | +Y / +Z toward drawbeam |
| Blender up / forward | +Z / -Y |
| Units | meters; 1 unit = 1 m |
| Ground origin | RathRoot identity transform at (0, 0, 0) below carriage center |
| Full width × height × depth | {width:.6f} × {height:.6f} × {depth:.6f} m, including drawbeam |
| GLB min bounds (X, Y, Z) | {vector(metrics['bounds_gltf_min'])} |
| GLB max bounds (X, Y, Z) | {vector(metrics['bounds_gltf_max'])} |
| Wheel radius | {radius:.6f} m |
| Triangles / mesh objects | {metrics['triangles']:,} / {metrics['mesh_objects']} |
| Material primitives / shared materials | {exported['primitives']} / {exported['materials']} |
| Texture images / clips / skeletal rig | 0 / 0 / none |
| GLB payload | {metrics['glb_bytes']:,} bytes ({metrics['glb_bytes']/1024:.1f} KiB) |

All dimensions are tentative blockout choices, not real-rath measurements or approved lane fit. Nodes have unit scale and zero initial rotation; preset changes are baked into geometry. Wheels remain circular and begin touching Y=0.

RathRoot contains ChassisRoot, PlatformRoot, PavilionRoot, RoofRoot, DrawbeamRoot, GarlandRoot, Wheel_FL, Wheel_FR, Wheel_RL and Wheel_RR. Every group/pivot has one child mesh; material primitives share its transform. This is the same naming contract as T020 Kumari, allowing a shared loader/controller with per-model wheel radii.

| Wheel node | GLB local center (X, Y, Z), meters |
|---|---|
{pivots}

F/R first letter labels front/rear axles; the L/R suffix labels negative/positive X sides. Use coordinates rather than assuming a camera-view convention. Rotate the Wheel_* pivot on local X, not the wheel mesh child or ChassisRoot. Positive local X rolls toward local +Z. For later animation, degrees = distanceMeters / {radius:.6f} * 180 / PI. If the imported parent is uniformly scaled, use this radius times that scale for world-meter distances. Derive distance from speed × dt in a later controller; no movement code is added here.

## Loading in the friend's branch

Copy only the GLB to an agreed runtime asset path in that branch. The following path is an example, not an existing registration:

```ts
app.assets.loadFromUrl('/models/{asset_id}.glb', 'container', (error, asset) => {{
  if (error || !asset?.resource) {{
    console.error('Rath load failed', error);
    return;
  }}
  const rath = asset.resource.instantiateRenderEntity();
  app.root.addChild(rath);
  rath.setPosition(0, 0, 0);
  const wheels = ['FL', 'FR', 'RL', 'RR'].map(label => rath.findByName('Wheel_' + label));
  // Store rath/wheels in your later controller; placement and motion are separate work.
}});
```

The loader passed isolated PlayCanvas {browser['imported']['engineVersion']} checks. GarlandRoot can be hidden for simpler decoration. Roof/pavilion/drawbeam groups are editable groups, not mechanically constrained articulation or attachment sockets. There are no colliders, baked animation clips or skeletal rig.

## Rebuild and validate

From repository root in PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/generate_rath.py -- --variant {variant} --out art-source/rath_companions_v01/{variant}
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/verify_export.py -- --out art-source/rath_companions_v01/{variant}
node art-source/rath_companions_v01/check_playcanvas.mjs art-source/rath_companions_v01/{variant}
```

After extracting the ZIP, run the generator from its root with `--variant {variant}`; default output is the included `{variant}` subfolder. For export verification use `--out {variant}`. Generation/Blender validation require only Blender and the supplied scripts. Browser validation uses this repository's installed Playwright/PlayCanvas node_modules and script location, so run it in the repository rather than an arbitrary extracted directory. No Meshy account, upload or paid service is required.

Use `--out <new-folder>` for experiments; rebuilding recreates a scene and overwrites same-named generated files. Preserve manual Blender edits in a new file/version. Group meshes remain editable in mesh Edit Mode. For manual GLB export, select RathRoot and all descendants only; use GLB, Selected Objects and +Y Up, no cameras/lights/animation. Exclude PREVIEW_ONLY. Update measurements and rerun checks after edits; the packaged evidence refers to the delivered hashes.

## Review before production use

1. Import and compare with the four mesh previews: four solid timber wheels, complete red chassis/drawbeam, open pavilion and empty cloth seat.
2. Check ground contact, +Z forward and uniform scaling. Compare the three raths' footprint and silhouettes before choosing final game dimensions.
3. Rotate each Wheel_* local X by 45°: axle center stays fixed and wheel plugs move.
4. Check final lighting and many simultaneous instances on a target physical phone. Eight materials and {exported['primitives']} primitives are measured, not a demonstrated mobile budget.
5. Review silhouette/recognizability and respectful simplification with the director/local reviewer before polish or public portrayal.

Tested: Blender {metrics['blender_version']} save/reopen/GLB round trip, headless {browser['browser']} WebGL2 software rendering at 1000×900 and a 390×844 viewport. No physical phone, hardware-GPU FPS, Meshy, gameplay placement or collision/animation integration tested. In-app browser setup was unavailable (missing sandboxPolicy metadata); isolated checks used existing Playwright.

Kumari handoff, Tuku/Lakhey assets, game code, decisions and the friend's animations are unchanged. Future gameplay use is a separate ticket and requires resolving the culture-document restrictions already recorded in T019.
"""
    (out / "HANDOFF.md").write_text(handoff, encoding="utf8")
    provenance = {
        "ticket": "T021", "date": "2026-10-11", "asset_id": asset_id,
        "state": "simplified static draft; director/cultural review pending",
        "authoring": "Original procedural Blender geometry; versioned extension of T020 generator",
        "source_generator": "art-source/rath_companions_v01/generate_rath.py",
        "generator_sha256": sha(HERE / "generate_rath.py"),
        "source_preset": metrics["preset"], "blender": metrics["blender_version"],
        "concept_source": concept.relative_to(REPO).as_posix(), "concept_sha256": sha(concept),
        "research_register": "art-source/festival_phase1_v01/RESEARCH_AND_HANDOFF.md",
        "external_media_copied": False, "texture_dependencies": [],
        "glb_sha256": sha(out / (asset_id + ".glb")), "blend_sha256": sha(out / (asset_id + ".blend")),
        "known_limitations": ["Not an authentic ceremonial replica", "No individually verified traditional variant ornament",
                              "Proposed dimensions; no gameplay or phone performance acceptance", "No rig/clips/colliders"],
        "rights": "No outside mesh/photo/texture imported. Prior project-generated concept is design input; underlying project ownership not independently established. No new repository license is imposed.",
    }
    write_json(out / "provenance.json", provenance)
    pngs = sorted(out.glob("*.png"))
    assert len(pngs) == 6
    previews = []
    for png in pngs:
        data = png.read_bytes()
        assert data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR"
        dimensions = list(struct.unpack_from(">II", data, 16))
        assert dimensions == ([390, 844] if "mobile" in png.name else [1000, 900])
        previews.append({"file": png.name, "dimensions": dimensions, "sha256": sha(png)})
    write_json(out / "preview_verification.json", {"status": "passed", "check": "PNG signatures/dimensions/hashes", "files": previews})
    files = [out / (asset_id + extension) for extension in (".blend", ".glb")]
    files += pngs + [out / name for name in ("HANDOFF.md", "asset_metrics.json", "export_verification.json",
                                             "playcanvas_verification.json", "preview_verification.json", "provenance.json")]
    entries = [(path, variant + "/" + path.name) for path in files]
    entries += [(HERE / name, name) for name in SOURCES]
    manifest = {name: {"bytes": path.stat().st_size, "sha256": sha(path)} for path, name in entries}
    write_json(out / "package_manifest.json", {"ticket": "T021", "asset_id": asset_id, "files": manifest})
    entries.append((out / "package_manifest.json", variant + "/package_manifest.json"))
    archive = out / f"{variant}_rath_handoff_v01.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
        for path, name in entries:
            bundle.write(path, name)
    checks = []
    with zipfile.ZipFile(archive) as bundle:
        assert bundle.testzip() is None
        assert len(bundle.namelist()) == len(entries) == len(set(bundle.namelist()))
        for path, name in entries:
            archived_sha = hashlib.sha256(bundle.read(name)).hexdigest()
            assert archived_sha == sha(path)
            checks.append({"entry": name, "sha256": archived_sha})
    write_json(out / "package_verification.json", {"status": "passed", "archive": archive.name,
               "bytes": archive.stat().st_size, "sha256": sha(archive), "entries": checks})
    print("T021_PACKAGE_VERIFIED " + json.dumps({"variant": variant, "entries": len(checks),
          "triangles": metrics["triangles"], "glb_bytes": metrics["glb_bytes"], "zip_bytes": archive.stat().st_size}))
