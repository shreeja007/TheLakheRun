# T021 — Bhairab and Ganesh companion rath handoffs

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T021_COMPANION_RATH_BLOCKOUTS.md`

**Branch:** `ticket/t021-companion-rath-blockouts`

## Summary

Delivered two original procedural static rath blockouts with separate editable Blender files, standalone GLBs, four mesh renders per model, browser import evidence, shared source/preset scripts, provenance, developer instructions and separate ZIP handoffs. Both retain Kumari's group/wheel-pivot naming contract, meters, ground-level root and glTF +Y up/+Z forward.

Bhairab is a smaller shell with a lower pavilion and thicker posts/braces. Ganesh is narrower with slimmer posts, plain rails and simpler garlands. These are T019 draft proposals; exact traditional identifying geometry and size ratios are not verified. No sacred imagery or occupants were invented.

Kumari assets/source/archive remain byte-identical, checked against their prior recorded SHA256 values. No game source, public model registration, Tuku/Lakhey assets, friend animation, gameplay placement/movement/collision/scoring, rig or animation clips changed. No Meshy upload, outside asset import, server/deployment, new engine decision or decision-log approval. Pulu Kisi and further asset phases remain unbuilt.

## Changed files / assets

| Path | Why changed |
|---|---|
| art-source/rath_companions_v01/generate_rath.py | Versioned extension of T020 source with explicit companion presets, baked geometry sizing and stable round wheel pivots; old generator untouched |
| art-source/rath_companions_v01/verify_export.py | Parameterized binary/source/reimport checks, unit node scales, matching identity/hash, wheel radius/roundness checks |
| art-source/rath_companions_v01/check_playcanvas.mjs | Isolated container import, bounds/pivots/rotation/framing checks and browser screenshots for either asset directory |
| art-source/rath_companions_v01/prepare_handoffs.py | Generates per-model notes/provenance/manifest; validates old Kumari hashes and every ZIP entry |
| art-source/rath_companions_v01/README.md | Shared source and standalone-archive instructions |
| art-source/rath_companions_v01/bhairab/bhairab_rath_blockout_v01.blend and .glb | Editable compact draft shell and standalone game-import export |
| art-source/rath_companions_v01/ganesh/ganesh_rath_blockout_v01.blend and .glb | Editable narrower draft shell and standalone game-import export |
| Both variant folders: preview_*.png, playcanvas_*.png | Four real model views and two local-browser screenshots per model |
| Both variant folders: HANDOFF.md, asset_metrics.json, provenance.json, *_verification.json, package_manifest.json | Per-model dimensions, radii, source hashes, checks, instructions and archive inventory |
| Both variant folders: *_rath_handoff_v01.zip | Each ZIP includes the chosen asset folder plus all required procedural/verification source scripts at root |
| art-source/rath_companions_v01/kumari_preservation.json | Prior GLB, Blend, archive and archived-source/preview hashes still match |
| tasks/T021_COMPANION_RATH_BLOCKOUTS.md | Bounded direct authorization and acceptance criteria |
| tasks/00_TASK_INDEX.md | Incidental tracking row, review pending; no approval recorded |
| reports/T021_RESULT.md | Required completion report |

The previously untracked user `art-source/tuku_concept_art_turnaround.png` is preserved and excluded from this commit. Blender backup/log files are ignored and excluded from packages/commit.

## Verification commands and results

All shell commands ran from repository root in Windows PowerShell. Actual Blender version 5.2.2 LTS. Independent read-only checks ran concurrently where possible; generation and packaging were sequential.

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/generate_rath.py -- --variant bhairab
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/generate_rath.py -- --variant ganesh
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/verify_export.py -- --out art-source/rath_companions_v01/bhairab
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/verify_export.py -- --out art-source/rath_companions_v01/ganesh
node art-source/rath_companions_v01/check_playcanvas.mjs art-source/rath_companions_v01/bhairab
node art-source/rath_companions_v01/check_playcanvas.mjs art-source/rath_companions_v01/ganesh
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/rath_companions_v01/prepare_handoffs.py
git diff --cached --check
```

- Final generation: exit 0 for each, exported GLB, saved editable Blend and rendered all four Cycles views. Several preview passes found coplanar faces where crossed braces meet crossmembers; adjusted brace spacing and Ganesh brace thickness, rebuilt affected assets and repeated final import/render checks. Old Kumari geometry was not changed.
- Export verification: exit 0, passed for both. Parses GLB v2 and embedded buffer, no external texture/resource/animation/skin/camera/required-extension dependencies, unique named nodes, identity/unit scales, normals and triangle primitives. Reopens editable Blend and compares triangle totals. Reimports exported geometry and checks bounds within 0.0001 m; each wheel retains center under 45° rotation and round disc Y/Z extents equal the recorded diameter.
- Browser verification: exit 0, passed for both in headless Chrome, PlayCanvas 2.23.2 WebGL2. Container loader renders 23 material primitives/8 named materials per model. Checks root, measured bounds, four wheel centers/rotations and all bounds corners inside each viewport; zero page errors. JSON records the exact checked GLB hash.
- Packaging: exit 0, passed. Two separate archives, 20 entries each; ZIP CRC integrity passes and every entry SHA256 matches its source. PNG signatures/dimensions verified (four mesh views and desktop screenshot 1000×900, phone-shaped screenshot 390×844 per model). Recorded source/GLB/Blend/concept hashes and archive inventory. Logs/backups excluded. Prior Kumari archive and all 17 entries still match their original recorded hashes.
- `view_image`: visually inspected eight final Blender renders and four final browser screenshots. No successful in-app browser test claimed.
- `git diff --cached --check`: passed before commit. Runtime build/UI suite omitted because no runtime files changed; actual asset loading is verified in isolation.

## Browser and device tests

- Tested: Windows local Blender 5.2.2 LTS, and headless Chrome via existing Playwright with ANGLE SwiftShader software WebGL2. Desktop 1000×900 and viewport-only 390×844 for each model.
- In-app browser skill/runtime had already been read earlier in this conversation. Retried bootstrap through node_repl; failed before execution with `codex/sandbox-state-meta: missing field sandboxPolicy`. Used existing isolated Playwright fallback, as for T020.
- Untested: physical Android/iPhone, hardware-GPU FPS, multiple instances in game lighting, collisions/lane fit, motion controller, other Blender versions and Meshy. Phone-shaped screenshots do not establish phone performance.

## Evidence

| Model | GLB width × height × depth, m | Wheel radius, m | Triangles | GLB bytes |
|---|---|---|---|---|
| Bhairab | 2.562800 × 3.319772 × 4.128000 | 0.550400 | 8,434 | 663,724 |
| Ganesh | 2.097920 × 3.280560 × 3.840000 | 0.512000 | 6,866 | 517,624 |

Both have 21 named nodes, 10 mesh objects, 8 materials, 23 material primitives, zero texture images and zero clips. Full bounds include the drawbeam. These are blockout measurements, not traditional rath dimensions or approved gameplay sizes.

- [Bhairab perspective](../art-source/rath_companions_v01/bhairab/preview_perspective.png) and [developer handoff](../art-source/rath_companions_v01/bhairab/HANDOFF.md).
- [Ganesh perspective](../art-source/rath_companions_v01/ganesh/preview_perspective.png) and [developer handoff](../art-source/rath_companions_v01/ganesh/HANDOFF.md).
- Each model folder includes export_verification.json, playcanvas_verification.json, package_manifest.json, package_verification.json and provenance.json with exact final hashes and check details.
- [Kumari preservation evidence](../art-source/rath_companions_v01/kumari_preservation.json).

## Assumptions, defects and blockers

- Cultural/art review remains outstanding. Asset-slot names and distinct geometry are proposals; individually identified traditional views, precise ornament, construction joinery and actual dimensions are unverified. No authenticity claim.
- Eight materials/23 primitives per model are an isolated import result, not a demonstrated final mobile budget. Multiple instances may need later optimization. No texture atlas/LOD or performance limit adopted.
- Static shells with independently rotatable wheel pivots, no rig/clips/colliders/physical mechanisms/cloth simulation/attachment constraints. Named groups enable later development but do not constitute completed animations.
- Procedural sources reproduce the blockout; consolidated group meshes are directly editable. Rebuilding overwrites generated outputs, so handoff notes advise new output folders/manual-edit versions.
- Blender source tested only in 5.2.2 LTS. Preview cameras/lights/ground stay in a PREVIEW_ONLY collection outside the GLB export.
- Concept direction comes from existing T019 generated sheets and research register. No outside photo/model/music/texture imported, no new license imposed, underlying project ownership not independently certified.
- Existing cultural-document restrictions on future sacred-chariot obstacle use remain unresolved as previously recorded in T019. No gameplay interpretation is approved or implemented here.

## Director approvals requested

Review the three-rath family together for silhouette, size and simplified ornament; obtain informed local cultural feedback before public portrayal. Friend should import these handoffs in their own branch and test target-phone performance before production acceptance. These are concrete deliverables for review, not approval recorded in the decision log.

## Suggested next ticket

After model review, a separately authorized Pulu Kisi static blockout/handoff: editable source, GLB, named shell/head/trunk groups and previews based on the reviewed T019 direction. Do not start automatically. Rath placement/rolling controllers remain separate later work.
