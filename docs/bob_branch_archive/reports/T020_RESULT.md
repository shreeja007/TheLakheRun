# T020 — First static rath handoff result

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T020_FIRST_RATH_BLOCKOUT.md`

## Summary

Built the first Kumari rath draft shell as original procedural Blender geometry from T019's concept direction. Delivered editable .blend and generator, standalone GLB, neutral front/left/back/perspective renders, browser screenshots and developer handoff. The downloadable ZIP packages the reusable deliverables; files are also available individually.

Four solid-disc wheel assemblies retain separate axle-center pivots. Chassis, platform, pavilion, roof, drawbeam and garlands have named groups. These are static objects; no skeletal rig or animation clips. PBR colors/materials are embedded, with no external textures.

No game source, public runtime model, Tuku/Lakhey rig or friend animation changed. No gameplay placement/collision/scoring, other rath/Pulu model, Meshy upload, server/deployment or decision-log update. This is a simplified draft, not an authentic ceremonial replica or final production art.

## Changed files / assets

| Path | Purpose |
|---|---|
| art-source/rath_blockout_v01/kumari_rath_blockout_v01.glb | Standalone game-import export; 663,320 bytes |
| art-source/rath_blockout_v01/kumari_rath_blockout_v01.blend | Editable source including excluded preview collection |
| art-source/rath_blockout_v01/generate_rath.py | Original reproducible procedural source |
| art-source/rath_blockout_v01/verify_export.py | Binary GLB checks, .blend reopening and exported-geometry reimport |
| art-source/rath_blockout_v01/check_playcanvas.mjs | Isolated local loader/rotation/view-framing smoke check |
| art-source/rath_blockout_v01/preview_*.png | Four actual Blender model previews, 1000 × 900 |
| art-source/rath_blockout_v01/playcanvas_*.png | Desktop and phone-shaped browser viewport evidence |
| art-source/rath_blockout_v01/HANDOFF.md | File usage, dimensions, facing, group/pivot names, loading example and manual checks |
| art-source/rath_blockout_v01/*_metrics.json and *_verification.json | Measured geometry, checks, preview metadata and archive integrity |
| art-source/rath_blockout_v01/provenance.json | Original authoring/source/rights record |
| art-source/rath_blockout_v01/kumari_rath_handoff_v01.zip | Shareable package; original files retained |
| tasks/T020_FIRST_RATH_BLOCKOUT.md | Record direct authorization and scope |
| tasks/00_TASK_INDEX.md | Incidental tracking row; review pending |
| reports/T020_RESULT.md | Required report |

## Verification commands and results

All commands ran from the repository root in Windows PowerShell.

- `& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python art-source/rath_blockout_v01/generate_rath.py`: successful generation/export/save and four Cycles previews. Executed twice to correct preview floor/background; final run completed with exit code 0. Actual Blender version 5.2.2 LTS. Generated 8,434 triangles, 10 mesh objects, 8 materials, 0 texture images and 0 clips.
- `& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_blockout_v01/verify_export.py`: passed, exit 0. Opens editable .blend, verifies its asset geometry; independently parses GLB v2, checks embedded buffer/no preview/no external resource/normal attributes, then reimports and compares bounds/counts/hierarchy. All four pivots preserve center during rotation.
- During .blend reopen verification, the initial checker left an unselectable preview plane in the scene and failed bounds. Corrected scene cleanup in the checker, then reran with Python failure exit enabled; final checks passed. The exported GLB was already free of preview objects.
- `node art-source/rath_blockout_v01/check_playcanvas.mjs`: passed in headless Chrome, PlayCanvas 2.23.2 WebGL2. Loads via container loader, renders 23 material primitives with 8 named materials, confirms root/bounds/four wheel rotations and complete viewport framing. Zero page errors.
- `Get-FileHash -Algorithm SHA256`: GLB final 7D51F2BA243FF5889076967A8A5ADF8066D273206EC5FDDD0373763C754F13FC. Blend/source concept provenance hashes recorded. T019 source concept retained.
- `[System.Drawing.Image]::FromFile(...)`: all six PNGs decode; four renders/desktop 1000 × 900, phone-shaped viewport screenshot 390 × 844.
- `Compress-Archive` plus `[System.IO.Compression.ZipFile]::OpenRead(...)`: packaged deliverables and validated every archived entry against original SHA256; no backup/log entries. See package_verification.json.
- `git diff --cached --check`: passed before commit.
- Runtime build/test suite omitted because no game runtime files changed; actual asset loading was checked independently.

## Browser and device tests

- Tested: headless desktop Chrome with ANGLE SwiftShader software WebGL2 at 1000 × 900 and viewport-only 390 × 844.
- In-app browser skill was read and connection attempted; setup failed with missing sandboxPolicy metadata. Used existing Playwright for isolated fallback verification. No in-app-browser successful test claimed.
- Inspected all four final Blender previews and both browser screenshots.
- Untested: physical Android/iPhone, hardware-GPU FPS, game-world lighting/lane fit, collision or animation integration, other Blender versions and Meshy. A phone-shaped screenshot is not a phone performance test.

## Evidence

The six previews/screenshots and export_verification.json/playcanvas_verification.json accompany the model. Root is ground-level; exported full dimensions are 2.98 m wide × 4.245 m high × 4.80 m deep including drawbeam. GLB bounds X [-1.49, 1.49], Y [0, 4.245], Z [-1.56, 3.24]. Forward +Z, up +Y. Wheel radius 0.64 m. These are measured blockout values, not real-rath measurements.

The .blend includes a separate PREVIEW_ONLY collection. The selected asset export excludes ground, cameras and lights. Handoff supplies regeneration/export instructions and a loader example using a proposed future public asset path; that runtime destination was not populated.

## Assumptions, defects and blockers

- Selected Kumari as the first rath in the discussed sequence. User authorized a static blockout handoff; final art acceptance remains pending.
- Simplified geometry omits fine carving, wheel paintings, roof shingle texture and sacred ornament/occupants. Garland beads and panel/roof geometry are original approximations. Local cultural review is still outstanding.
- Tentative dimensions and relatively wide footprint require review before eventual placement. No lane, collider or performance budget adopted.
- Eight materials/23 primitives are acceptable for isolated import evidence, not a demonstrated mobile optimization budget. Many simultaneous instances may require later material/mesh consolidation.
- No baked movement clips, skeletal rig, collision shapes, physical mechanics, cloth simulation or attachment constraints. Stable wheel/group nodes enable later development.
- Blender file is created/tested in 5.2.2 LTS; older version compatibility is untested. Re-running generator recreates the procedural scene; manual edits should be preserved in a new .blend/output version.
- Both existing untracked user PNG and existing Tuku/Lakhey assets/animation code preserved. Blender backup/log files are ignored and excluded from ZIP/commit.
- No third-party downloaded geometry/media/texture imported. Provenance references the prior T019 source register; no authenticity/license ownership certification.

## Director approvals requested

Review silhouette, dimensions and simpler decoration, plus informed cultural review before public portrayal. Friend should test the handoff in their development branch and target device. No new decision approval was recorded.

## Suggested next ticket

After accepting this blockout, create the other two reviewed rath variants from the shared source, or create Pulu Kisi's separate static model ticket. Do not start automatically. Gameplay placement remains a separate later decision.
