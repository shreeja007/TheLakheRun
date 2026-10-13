# T027 — Everyday gateway editable static model

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-12

**Ticket:** `tasks/T027_EVERYDAY_GATEWAY_STATIC_BLOCKOUT.md`

## Summary

Delivered one editable everyday gateway from the owner's accepted T024 concept: two square brick piers, four stone footing/cap pieces, one straight timber lintel and plain metal head detail. Original procedural source, Blender file, embedded-texture GLB, five actual mesh renders and verified portable ZIP accompany it. The model itself awaits director acceptance.

Measured: **436 triangles**, **8 meshes**, **12 GLB nodes**, **8 material primitives**, **4 materials**, **one 512px original texture**, no clips. GLB **177,856 bytes**, blend **256,827 bytes**. Adjustable working bounds **6.100 × 3.960 × 1.000 m** (width/height/depth). Narrowest passage is **4.100 m** between footing inner edges, with **3.180 m** lintel underside; these are authoring measurements, not approved game/lane clearance. Ground root zero; GLB Y-up/front +Z.

No scene placement, collision, motion, hanging lights, building/character changes, upload or deployment was added. Earlier assets, game code, friend animation work, decision log and owner's untracked original PNG remain unchanged. The user additionally authorized income/growth research after completion; that is a separate next ticket, not a gateway feature.

## Changed files / assets

| Path | Why changed |
|---|---|
| `tasks/T027_EVERYDAY_GATEWAY_STATIC_BLOCKOUT.md` | Authorization, scope and verification requirements |
| `tasks/00_TASK_INDEX.md` | T027 review row only; incidental existing-file change |
| `art-source/gateway_blockout_v01/generate_gateway.py` | Original gateway geometry with local T025 authoring-helper reuse |
| `art-source/gateway_blockout_v01/everyday_gateway_v01.blend`, `.glb` | Editable source/self-contained static model |
| `art-source/gateway_blockout_v01/textures/brick_color_512.png` | Original repeat color tile, also packed/embedded |
| `art-source/gateway_blockout_v01/preview_*.png`, `playcanvas_*.png` | Five actual model views and desktop/narrow import evidence |
| `art-source/gateway_blockout_v01/verify_export.py`, `check_playcanvas.mjs`, `prepare_handoff.py` | Independent geometry/passage/export/import/package checks |
| `art-source/gateway_blockout_v01/HANDOFF.md`, `REFERENCE_NOTES.md`, `MODEL_FACTS.md` | Editing/rebuild/use guidance, source limits and counts |
| `art-source/gateway_blockout_v01/references/accepted_gateway_concept.png` | Unchanged accepted source |
| `art-source/gateway_blockout_v01/*verification.json`, `asset_metrics.json`, `provenance.json`, `previous_asset_preservation.json`, `package_manifest.json` | Evidence, provenance and prior-building hash checks |
| `art-source/gateway_blockout_v01/gateway_handoff_v01.zip` | Verified 25-file handoff |
| `art-source/gateway_blockout_v01/.gitignore` | Excludes local logs/backup/rebuild artifacts |
| `reports/T027_RESULT.md` | Mandatory completion report |

## Verification commands and results

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/gateway_blockout_v01/generate_gateway.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/gateway_blockout_v01/verify_export.py
node art-source/gateway_blockout_v01/check_playcanvas.mjs art-source/gateway_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/gateway_blockout_v01/prepare_handoff.py
git diff --check
git diff --cached --check
git diff --cached --name-only
Get-FileHash -LiteralPath 'art-source/tuku_concept_art_turnaround.png' -Algorithm SHA256
```

- Generation PASS in Blender **5.2.2 LTS**. Corrected bolt-side face winding during inspection, regenerated export/source/all renders before checks. No final geometry/export failures. Local generation/check output redirected to ignored logs.
- Independent export PASS: finite/nondegenerate source triangles, hierarchy/counts/UVs, grounded root, packed source/embedded GLB texture, measured passage and **nine passage rays** in both source and round-trip mesh. Bounds preserved within **0.0001 m**. GLB SHA-256 `781dc42c131c9d9caf1922cf001bbbc104e8c2a8fd343bf11243b1bf49109fab`.
- PlayCanvas PASS: Chrome, **2.23.2**, software WebGL2; eight named components, one texture, expected root/bounds/full framing, zero page errors at desktop **1000×1000** and narrow viewport **390×844**. JSON is tied to delivered GLB hash.
- Package PASS: **25 unique members**, CRC and every member hash/byte size checked; final archive size/hash in `package_verification.json`. **49 prior Building 01/02 payload files** match their original manifests, recorded in `previous_asset_preservation.json`.
- Windows System.Drawing decoded all **nine PNGs**; package checks signatures/dimensions/hashes. Personally inspected the accepted concept, five final mesh previews and both browser screenshots. True profiles correctly occlude the far pier; front/back share the same opening.
- Git whitespace/scope checks PASS. Owner PNG remains untracked with hash `3CB9852F33A00BC1651253B6D7CAAB68CC59A8CA18E4E6E9DFFE0AD8A9D9AB3F`.

No full gameplay build/tests ran because runtime code is unchanged. No byte-deterministic Blender serialization guarantee is made.

## Browser and device tests

- Tested: Windows headless Chrome via existing Playwright, ANGLE SwiftShader software WebGL2; isolated model import and desktop/narrow screenshots.
- In-app Browser skill bootstrap failed with missing `sandboxPolicy` metadata; existing Playwright provided fallback.
- Untested: physical Android/iOS, hardware-GPU FPS, multi-instance/game-camera lighting, runtime player clearance/collision, street placement and other Blender versions.

## Evidence

- Five model render PNGs and two browser screenshots in the packet.
- Source/export/browser/preview/package JSON evidence, original reference and `MODEL_FACTS.md`.
- `HANDOFF.md` documents root/group convention, editable parts and review steps.

## Assumptions, defects and blockers

- No remaining technical blocker. Model acceptance pending.
- Plain timber/stone, original tiled brick color and simple bolt heads are static visual approximations; fine grain/wear/joints omitted. No cultural or structural authenticity claim.
- Dimensions and sampled passage clearance are model facts only; placement/runner collision remains undecided and untested. No decorative threshold or hidden blocker is supplied.
- Eight primitives/four materials are measured, not a device/FPS budget. No LOD/atlas/sharing implementation supplied.
- Generator overwrites output files; save manual edits separately. Future Blender 6 node-toggle deprecation notices exist; current 5.2.2 passes.

## Director approvals requested

- Accept/revise model proportions, colors, joints and simplified finish. Set street scale/placement in a separate ticket.
- No approval entry was written to the decision log.

## Suggested next ticket

Owner explicitly requested internet research on income/growth after this handoff, comparing Nepal/diaspora versus global casual-game audiences. Proceed as a separately bounded research/proposal ticket; no monetization implementation or publication is authorized. Next art ticket remains hanging lights after concept acceptance, not started here.
