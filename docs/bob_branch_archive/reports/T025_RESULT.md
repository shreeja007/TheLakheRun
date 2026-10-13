# T025 — Building 01 editable static model

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-12

**Ticket:** `tasks/T025_BUILDING01_STATIC_BLOCKOUT.md`

## Summary

Delivered one original editable Blender residence and self-contained GLB from the owner's accepted T024 Building 01 concept. Two stories, central closed door, front five windows, back four and two on each side preserve the accepted silhouette/opening direction. Procedural source includes named groups, true wall apertures, thirteen window objects sharing three linked mesh-data variants, pitched roof and two original repeating color textures.

Measured: **4,588 triangles**, **23 editable mesh objects / 13 unique mesh-data sources**, **30 GLB nodes**, **37 material primitives including instances**, **6 materials**, **2 embedded 512px textures**, **0 animation clips**. GLB **569,056 bytes**; editable blend **508,385 bytes**. Working bounds **6.220 width × 7.095 height × 4.115 depth meters** are adjustable authoring dimensions. Ground root is zero; GLB Y-up/front +Z, Blender Z-up/front -Y.

No Building 02, gateway/lights, interior, opening-door behavior, collision, animation, street assembly, game registration/placement, server changes, deployment, upload or message to the friend was added. Existing model/concept packets, game code, character/friend animation work, decision log and owner's original untracked PNG remain unchanged. Building 01 concept acceptance is recorded in this task/provenance; other T024 concepts are not automatically accepted, and the resulting model still awaits director review.

## Changed files / assets

| Path | Why changed |
|---|---|
| `tasks/T025_BUILDING01_STATIC_BLOCKOUT.md` | Direct authorization, accepted source and bounded requirements |
| `tasks/00_TASK_INDEX.md` | T025 review row only; incidental index update |
| `art-source/building01_blockout_v01/generate_building.py` | Original reproducible Blender geometry/material/UV/texture source |
| `art-source/building01_blockout_v01/building01_residence_v01.blend`, `.glb` | Editable and self-contained static model |
| `art-source/building01_blockout_v01/textures/` | Two original analytic 512px color tiles, also packed/embedded |
| `art-source/building01_blockout_v01/preview_*.png` | Five actual orthographic/perspective mesh views |
| `art-source/building01_blockout_v01/playcanvas_desktop.png`, `playcanvas_mobile_viewport.png` | Isolated import screenshot evidence |
| `art-source/building01_blockout_v01/verify_export.py`, `check_playcanvas.mjs` | Independent geometry/aperture/export/import checks |
| `art-source/building01_blockout_v01/prepare_handoff.py` | Finished-check-dependent packaging, facts and provenance utility |
| `art-source/building01_blockout_v01/HANDOFF.md`, `REFERENCE_NOTES.md`, `MODEL_FACTS.md` | Rebuild/edit/loading/review guidance, source limits and measured facts |
| `art-source/building01_blockout_v01/references/accepted_building01_concept.png` | Unchanged copy of accepted concept for portable review |
| `art-source/building01_blockout_v01/*verification.json`, `asset_metrics.json`, `provenance.json`, `package_manifest.json` | Checks, hashes, counts and source/output records |
| `art-source/building01_blockout_v01/building01_handoff_v01.zip` | Verified 25-file handoff |
| `art-source/building01_blockout_v01/.gitignore` | Excludes local generation/check logs and Blender backup/rebuild files; this report documents observed failures |
| `reports/T025_RESULT.md` | Mandatory result report |

## Verification commands and results

Executed from repository root in Windows PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building01_blockout_v01/generate_building.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building01_blockout_v01/verify_export.py
node art-source/building01_blockout_v01/check_playcanvas.mjs art-source/building01_blockout_v01
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python-exit-code 1 --python art-source/building01_blockout_v01/prepare_handoff.py
git diff --check
git diff --cached --check
git diff --cached --name-only
Get-FileHash -LiteralPath 'art-source/tuku_concept_art_turnaround.png' -Algorithm SHA256
```

- Generation passed with Blender **5.2.2 LTS**; source saved and all five 1000×1000 mesh renders completed. Local generation/export output redirected to `generation.log` / `export_check.log` during execution.
- Export checker initially compared the four-byte GLB BIN type with an incorrect three-byte literal; fixed to include the terminating zero. It then detected actual zero-area wall triangles where floating-point subtraction produced almost-duplicate door/base partition boundaries. Quantized partition cuts and added positive-size assertions, rebuilt model/export/all previews, then reran checks. Final result PASS: finite/nondegenerate source geometry, instanced triangle counts, 13 unobstructed wall-window apertures plus door aperture, linked source data, packed textures, node hierarchy, 2 embedded PNG textures/UVs, static export and round-trip bounds within **0.0001 m**.
- PlayCanvas checker passed against the final GLB: Chrome software WebGL2, PlayCanvas **2.23.2**, all group/window counts, embedded textures/materials, zero-root/expected bounds and full asset framing at **1000×1000** and **390×844** viewport. Zero page errors. Evidence is tied to final GLB SHA-256.
- Packaging passed: all **25 unique ZIP members** match source byte hashes and ZIP CRC checks; **8,115,934 bytes**, SHA-256 `b0db6b7dea96073c755b961002dd74bf5268698a09163d5d75ccf66e7a9a2a86`. GLB SHA-256 `f2837a955bc4cb399482b875122032f3e14bf5715b8955c3eaacbb7f92082d40`.
- PowerShell `System.Drawing.Image::FromFile` loop decoded all **10 PNGs** successfully: five renders, two browser screenshots, two textures and accepted reference. Package utility separately checks PNG signatures/dimensions/hashes. Personally inspected final five renders and browser screenshots for silhouette/opening/frame/material errors.
- Git whitespace checks passed and staged paths stay inside the new model packet/task/report plus one index row. Owner PNG hash remains `3CB9852F33A00BC1651253B6D7CAAB68CC59A8CA18E4E6E9DFFE0AD8A9D9AB3F` and remains untracked.

No full runtime build/gameplay suite was run because runtime code did not change. No byte-identical regeneration guarantee is made for Blender serialization; the generator reproduces the authored construction/parameters.

## Browser and device tests

- Tested: Windows, headless Chrome via existing Playwright, ANGLE SwiftShader software WebGL2; isolated PlayCanvas import at desktop and narrow viewport sizes.
- In-app Browser skill bootstrap was attempted after reading the skill, but failed with `codex/sandbox-state-meta: missing field sandboxPolicy`. Existing local Playwright provided the documented fallback.
- Not tested: physical Android/iOS phones, hardware-GPU FPS, multiple building instances, actual gameplay lighting/camera/placement, facade joins, Meshy conversion, other Blender versions or door/interior behavior.

## Evidence

- Five same-mesh PNG previews and two isolated browser screenshots in the model folder.
- `asset_metrics.json`, `export_verification.json`, `playcanvas_verification.json`, `preview_verification.json` and `package_verification.json` contain checks/metrics/hash evidence.
- `HANDOFF.md` documents editable groups, linked instance behavior, rebuild/export steps and manual acceptance.

## Assumptions, defects and blockers

- No remaining technical blocker; model acceptance pending.
- This is a simplified static blockout. Roof tile curvature, detailed stone joints, sculpted bricks, wood grain, fine wear and normal maps from the polished concept are omitted. No cultural or engineering authenticity claim.
- Working dimensions are not approved street/lane/world scale. Roof/step bounds need placement review; no tiling/clearance/collision test was performed.
- Separate editable modules produce **37 material primitives**. Multi-building draw calls, texture atlas/LOD and physical-device budgets need a later measured optimization ticket.
- Generator overwrites outputs; preserve hand edits as another version or use a fresh output directory. Three shared window mesh variants affect linked instances when edited; handoff explains Make Single User.
- Blender emits deprecation notices for material/world node toggles expected to change in Blender 6.0. Current 5.2.2 execution passes; other versions are untested.

## Director approvals requested

- Accept or revise the resulting model's proportions, colors and simplified finish after comparing mesh previews with the accepted concept.
- Agree working street scale and intended camera/device budget only in a later placement/performance ticket. No approval was inserted into `docs/10_DECISIONS.md`.

## Suggested next ticket

Separately authorize Building 02's static editable Blender/GLB blockout after accepting this model and Building 02's own concept. Do not start automatically.
