# T026 — Building 02 editable static shopfront

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-12

**Ticket:** `tasks/T026_BUILDING02_STATIC_BLOCKOUT.md`

## Summary

Delivered Building 02 as one original editable Blender shopfront and self-contained GLB from the T024 source. The user's request following visual acceptance was treated as acceptance of this concept for modeling and authorization of this ticket; the resulting model still needs director acceptance.

Preserved two stories, a broad closed shopfront with **four separate shutter mesh objects**, two paired front upper window modules, one window per floor on each side, and a back service door with two upper windows. Generator/checks are local adaptations of T025; its original files were untouched. Six-material/texture/facing conventions match Building 01.

Measured: **3,748 triangles**, **23 editable mesh objects / 18 unique mesh-data sources**, **31 GLB nodes**, **36 material primitives including instances**, **6 materials**, **2 embedded 512px textures**, no animations. GLB **580,348 bytes**; blend **509,314 bytes**. Adjustable working bounds **7.020 width × 7.045 height × 4.300 depth meters**. Ground root zero; GLB Y-up/front +Z, Blender Z-up/front -Y.

No interior, operational hinges/shutter/door motion, rig, collider, game placement/registration, gateway/light model, upload or deployment was added. Building 01, characters/friend animations, earlier asset packets, game code, decision log and owner's original untracked PNG are unchanged.

## Changed files / assets

| Path | Why changed |
|---|---|
| `tasks/T026_BUILDING02_STATIC_BLOCKOUT.md` | Authorization, bounded scope and checks |
| `tasks/00_TASK_INDEX.md` | T026 delivery row only; incidental existing-file change |
| `art-source/building02_blockout_v01/generate_building.py` | New shop geometry, paired windows, four shutters and service door; local T025 helper reuse |
| `art-source/building02_blockout_v01/building02_shopfront_v01.blend`, `.glb` | Editable source and static runtime asset |
| `art-source/building02_blockout_v01/textures/` | Two original analytic color textures matching T025 conventions |
| `art-source/building02_blockout_v01/preview_*.png` | Five actual same-mesh views |
| `art-source/building02_blockout_v01/playcanvas_desktop.png`, `playcanvas_mobile_viewport.png` | Isolated import screenshots |
| `art-source/building02_blockout_v01/verify_export.py`, `check_playcanvas.mjs`, `prepare_handoff.py` | Independent geometric/export/import/package checks |
| `art-source/building02_blockout_v01/HANDOFF.md`, `REFERENCE_NOTES.md`, `MODEL_FACTS.md` | Editing/rebuild/use/review instructions and provenance limits |
| `art-source/building02_blockout_v01/references/accepted_building02_concept.png` | Unchanged accepted source copy |
| `art-source/building02_blockout_v01/*verification.json`, `asset_metrics.json`, `provenance.json`, `previous_asset_preservation.json`, `package_manifest.json` | Metrics, hashes, prior-file preservation and verification evidence |
| `art-source/building02_blockout_v01/building02_handoff_v01.zip` | Verified 26-file handoff |
| `art-source/building02_blockout_v01/.gitignore` | Excludes local logs, Blender backups and rebuild outputs |
| `reports/T026_RESULT.md` | Mandatory completion report |

## Verification commands and results

Executed from repository root in Windows PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building02_blockout_v01/generate_building.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building02_blockout_v01/verify_export.py
node art-source/building02_blockout_v01/check_playcanvas.mjs art-source/building02_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building02_blockout_v01/prepare_handoff.py
git diff --check
git diff --cached --check
git diff --cached --name-only
Get-FileHash -LiteralPath 'art-source/tuku_concept_art_turnaround.png' -Algorithm SHA256
```

- Generator PASS, Blender **5.2.2 LTS**: editable source saved, two textures authored/packed, GLB exported and five 1000×1000 previews completed. Generation/check output redirected into ignored local `generation.log` / `export_check.log` during execution.
- Independent checker PASS: finite/nondegenerate source triangles, expected instanced geometry, hierarchy/materials, eight window wall apertures and multiple rays through broad shop/service openings, four distinct nonoverlapping shutter meshes, two paired-pane front module records, packed source textures, two embedded PNG/UV sets and GLB round-trip bounds within **0.0001 m**. No geometry/export failures occurred in this ticket.
- Browser checker PASS: Chrome / PlayCanvas **2.23.2** / software WebGL2; both textures loaded, four shutter nodes and all window/component counts present, root/bounds correct, asset completely framed at desktop **1000×1000** and narrow viewport **390×844**, zero page errors. JSON evidence is tied to the final GLB hash.
- Packager PASS: **26 unique ZIP members**, all CRC/member sizes/hashes verified. ZIP **8,215,797 bytes**, SHA-256 `7b9ca716b48d0c9202f3f597aa820ad2fe23718ca5e601b0a700eab63308d717`. GLB SHA-256 `b85c2642ada586f3f852edf02c3578ffddd372c8566d72e278b5fa37beb3ea68`.
- Prior preservation PASS: **24 T025 payload files** match their prior manifest hashes/bytes; recorded in `previous_asset_preservation.json`. Existing Building 01 artifacts were not regenerated or changed.
- Windows `System.Drawing.Image::FromFile` loop decoded all **10 PNGs**; packager separately checks signatures/dimensions/hashes. Personally inspected all five mesh renders and both browser screenshots for silhouette, openings, shutter count, framing and texture appearance.
- Git whitespace checks PASS; staged changes remain new T026 packet/task/report plus one index row. Owner PNG hash remains `3CB9852F33A00BC1651253B6D7CAAB68CC59A8CA18E4E6E9DFFE0AD8A9D9AB3F` and remains untracked.

No full runtime build/gameplay suite was run because runtime code is unchanged. Blender serialization is not claimed byte-deterministic; generator reproduces authored parameters/construction.

## Browser and device tests

- Tested: Windows headless Chrome via existing Playwright, ANGLE SwiftShader software WebGL2; isolated container import and desktop/narrow viewport screenshots.
- In-app Browser bootstrap attempted using the previously read skill; failed with `codex/sandbox-state-meta: missing field sandboxPolicy`. Existing Playwright supplied the fallback.
- Untested: physical Android/iOS, hardware-GPU FPS, multi-building performance, actual game camera/lighting/placement, facade joins, shutter/door motion, Meshy or other Blender versions.

## Evidence

- Five actual mesh previews, two browser screenshots and the accepted source image in the model packet.
- Asset/export/browser/preview/package JSON records and `MODEL_FACTS.md` contain measured evidence.
- `HANDOFF.md` explains linked windows, separate shutters, coordinate convention, source edits and manual review.

## Assumptions, defects and blockers

- No remaining technical blocker; director model acceptance pending.
- Static blockout finish: flat tile color pattern, plain stone/timber, simple fixed hinge straps; fine wear/grain, curved tiles and stone joints omitted. No cultural/structural authenticity claim.
- Shutters are independently editable but have root-space origins, not hinge pivots; no opening/deformation behavior is supplied. Eight windows share three mesh variants; Make Single User is needed for individual variants.
- Working dimensions are adjustable. No street clearance, facade joining/collision, LOD/atlas or physical-device budget is established. **36 material primitives** preserve separate authoring parts; many instances require later measured optimization.
- Original texture algorithms match Building 01, but runtime shared-resource registration is not performed.
- Blender material/world node deprecation notices remain for future Blender 6.0 compatibility; current 5.2.2 execution passes. Preserve manual edits as another version before generator overwrite.

## Director approvals requested

- Accept/revise this model's proportions, colors, shutter layout and simplified finish.
- Set street dimensions, intended camera/device budget and future motion only in separate authorized tickets. No approval entry was inserted into the decision log.

## Suggested next ticket

Everyday courtyard gateway editable static Blender/GLB model, after acceptance of its concept. Do not start automatically.
