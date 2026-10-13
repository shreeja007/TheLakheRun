# T022 — Pulu Kisi static model handoff

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T022_PULU_KISI_BLOCKOUT.md`

**Branch:** `ticket/t022-pulu-kisi-blockout`

## Summary

Built one original procedural static Pulu Kisi draft following T019's elongated cloth-and-frame concept: open-bottom canvas shell, plain friendly head, long curled trunk, ear fans, reddish fiber tuft, simple trim/seams, garland, internal frame suggestion and two separated pairs of performer shoes. Delivered editable Blender file/source, standalone GLB, front/both-side/back/perspective renders, browser evidence, measurements/provenance, developer instructions and ZIP.

HeadRoot contains the trunk, ears and tuft with attachment-center pivots. Cloth/frame/trim/garland and front/rear foot pairs have separate named groups. These are static rigid assemblies; no skeletal rig, animation clips, flexible trunk, walking gait or simulated cloth.

All three prior rath packages and their recorded source/asset entries are byte-identical: 55 distinct prior files checked. No game source/public registration, Tuku/Lakhey assets or friend animations changed. No gameplay placement/collision/scoring/movement, online media import, Meshy upload, deployment/server changes, engine adoption or decision-log approval. Other character/structure phases are unbuilt.

## Changed files / assets

| Path | Why changed |
|---|---|
| art-source/pulu_kisi_blockout_v01/generate_pulu.py | Original reproducible geometry, grouping, export and preview source |
| art-source/pulu_kisi_blockout_v01/pulu_kisi_blockout_v01.blend | Editable Blender 5.2.2 LTS scene, grouped meshes and separate preview collection |
| art-source/pulu_kisi_blockout_v01/pulu_kisi_blockout_v01.glb | Standalone static game-import export, 541,976 bytes |
| art-source/pulu_kisi_blockout_v01/verify_export.py | Binary GLB/source/reimport/bounds/geometry/attachment checks |
| art-source/pulu_kisi_blockout_v01/check_playcanvas.mjs | Isolated local container loader, attachment/framing checks and screenshots; adapted from T021 without changing it |
| art-source/pulu_kisi_blockout_v01/prepare_handoff.py | Handoff/provenance/manifest writer and ZIP/prior-asset integrity checks |
| art-source/pulu_kisi_blockout_v01/preview_*.png | Five actual Blender mesh renders at 1000×900 |
| art-source/pulu_kisi_blockout_v01/playcanvas_*.png | Desktop 1000×900 and phone-shaped 390×844 browser evidence |
| art-source/pulu_kisi_blockout_v01/HANDOFF.md and REFERENCE_NOTES.md | Loader/rebuild/export instructions, group coordinates, simplifications and prior research provenance |
| art-source/pulu_kisi_blockout_v01/asset_metrics.json, provenance.json, *_verification.json, package_manifest.json | Exact measured values, checked hashes and inventory |
| art-source/pulu_kisi_blockout_v01/previous_asset_preservation.json | Prior rath archives/source/assets unchanged against their recorded hashes |
| art-source/pulu_kisi_blockout_v01/pulu_kisi_handoff_v01.zip | 22-entry handoff, 5,211,272 bytes; logs/backups excluded |
| tasks/T022_PULU_KISI_BLOCKOUT.md | Direct authorization and bounded static-model scope |
| tasks/00_TASK_INDEX.md | Incidental tracking row, review pending; no approval recorded |
| reports/T022_RESULT.md | Required completion report |

Existing untracked user `art-source/tuku_concept_art_turnaround.png` preserved and excluded from commit. Blender backup/log files are ignored and excluded from ZIP/commit.

## Verification commands and results

From repository root in Windows PowerShell; generation/export/browser output redirected to ignored logs in the asset folder.

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/generate_pulu.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/verify_export.py
node art-source/pulu_kisi_blockout_v01/check_playcanvas.mjs art-source/pulu_kisi_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/pulu_kisi_blockout_v01/prepare_handoff.py
git diff --cached --check
```

- Generation: final exit 0; Blender 5.2.2 LTS. Saved Blend/exported GLB/rendered five views. Two generation passes: refined ear centers to avoid collapsed faces, removed duplicate support-curve points, rounded trunk attachment/tip. Final 16,964 triangles, 11 meshes, 8 materials, no texture images/clips.
- Export verification: final exit 0, passed. Independently parses GLB v2, embedded buffer, normals/triangle indices, unique nodes/unit scales/asset identity/hash; no external images/textures/skins/clips/cameras/required extensions. Reopens editable Blend, verifies finite nondegenerate triangles (minimum source triangle area 1.693820345e-7 m²), counts, hem height and grounded shoe pairs. Reimports and compares bounds within 0.0001 m, hierarchy and pivots.
- Initial attachment-follow check failed because it changed Euler values on imported quaternion-mode empties and assumed a local axis was Blender world Z. Corrected the verifier to use explicit matrix rotations through the imported coordinate conversion; no asset changes required. Final checks confirm real mesh points move, attachment centers stay fixed, head children follow and cloth stays fixed.
- Browser check: final exit 0, passed in headless Chrome/PlayCanvas 2.23.2 WebGL2. Container import renders 26 material primitives/8 materials; verifies root/bounds/all group parent/world positions, four attachment rotations, head-child following/body independence and full framing at both viewports; zero page errors. Lowered preview cameras to make soles more visible beneath the skirt and reran framing checks. Recorded exact GLB hash.
- Packaging: exit 0, passed. Seven PNG signatures/dimensions/hashes correct; ZIP CRC and all 22 entry SHA256 values match originals. Original Kumari/Bhairab/Ganesh archives and their entries preserved (55 distinct files). No backup/log/outside-photo entries. Final archive/hash recorded in package_verification.json.
- `view_image`: inspected existing T019 concept, five final Blender renders and both final browser screenshots.
- `git diff --cached --check`: passed before commit. Runtime build/UI suite omitted because game runtime is unchanged; asset loader verified in isolation.

## Browser and device tests

- Tested: Windows local Blender 5.2.2 LTS source/export round trip; headless Chrome via existing Playwright, ANGLE SwiftShader software WebGL2, desktop 1000×900 and viewport-only 390×844.
- In-app browser skill read earlier in conversation; bootstrap retried through node_repl. Failed before execution with `codex/sandbox-state-meta: missing field sandboxPolicy`. Existing isolated Playwright used as fallback; no successful in-app test claimed.
- Untested: physical Android/iPhone, hardware-GPU FPS, many instances, actual game lighting/lane fit/collisions, flexible rig/animation/cloth, other Blender versions, Meshy. Viewport-only mobile screenshot is not a phone performance test.

## Evidence

Full GLB dimensions: **2.205229 m width × 3.328000 m height × 3.842557 m depth**, including ears/tuft/trunk. Proposed blockout measurements, not historical dimensions. Root ground-level, GLB +Y up/+Z forward. 23 named nodes, 11 mesh objects, 16,964 triangles, 26 material primitives, 8 shared materials, 0 textures/clips. GLB 541,976 bytes (529.3 KiB).

- [Perspective mesh render](../art-source/pulu_kisi_blockout_v01/preview_perspective.png), [front](../art-source/pulu_kisi_blockout_v01/preview_front.png), [left](../art-source/pulu_kisi_blockout_v01/preview_left.png), [right](../art-source/pulu_kisi_blockout_v01/preview_right.png), [back](../art-source/pulu_kisi_blockout_v01/preview_back.png).
- [Developer handoff](../art-source/pulu_kisi_blockout_v01/HANDOFF.md) and [ZIP](../art-source/pulu_kisi_blockout_v01/pulu_kisi_handoff_v01.zip).
- Browser screenshots, export/browser/preview/package verification JSON and prior-asset preservation accompany the model.
- GLB SHA256: `66b1c86b9e20c7a159077c45f9bf61590eed45f91928325fa6efb40ce4d22ac1`. Blend/source/concept/archive hashes recorded alongside.

## Assumptions, defects and blockers

- Simplified existing T019 direction, not an authentic ceremonial replica. Friendly face, ear fans, colored trim, seams, tuft, proxy shoes and dimensions are proposals; informed cultural/visual review is outstanding. No actual sacred painting/motif or choreography invented.
- Internal arches are an editable visual support suggestion, not load-bearing construction plans. Static shell has open underside/thickness; no cloth simulation or visible performers.
- Trunk is one rigid curved assembly; flexible deformation requires separate rig/geometry work. Head rotations do not automatically adjust body-attached ribbon/garland meshes. No articulation constraints/limits/attachment sockets promised.
- Soles are partly occluded by skirt in high camera views; front and both-side orthographic previews clearly show the two grounded pairs. Final phone-shaped screenshot proves import/framing, not every detail's gameplay readability.
- 16,964 triangles/8 materials/26 primitives and 529.3 KiB GLB are measured, not adopted production/mobile budgets. Later instance/device profiling and possible material/tuft simplification are unbuilt.
- Group meshes editable directly; regeneration overwrites outputs, so handoff advises new folders/files for manual edits. Blend tested only in 5.2.2 LTS. Preview-only floor/lights/camera excluded from GLB.
- No new online research in this ticket; reused provided T019 concept/prompts and source register. No external photo/mesh/texture copied, no new repository license imposed, project ownership not independently certified.
- Future Pulu Kisi obstacle/enemy/score use remains unresolved under culture docs/T019. Static asset creation does not approve gameplay treatment or alter decisions.

## Director approvals requested

Review long-shell proportions, head/ear/tuft simplification, gentle expression, trim and proposed scale with informed local feedback before polish/public portrayal. Friend should import the handoff into their branch and test target-phone lighting/performance before production acceptance. No acceptance/approval is recorded by this implementation report.

## Suggested next ticket

Phase 2 everyday spectator variants and a market-cart concept batch, bounded by a separately authorized ticket and the Tuku style direction. Keep ritual costumes/choreography and crowd simulation out of scope. Do not start automatically; placement/motion for existing assets remains separate work.
