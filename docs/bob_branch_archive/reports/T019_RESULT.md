# T019 — Festival concepts, phase 1 result

**Implementation state:** COMPLETE (bounded phase 1; later phases remain proposed)

**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T019_FESTIVAL_CONCEPTS_PHASE1.md`

## Summary

Delivered four individually named concept sheets for Pulu Kisi, Kumari rath, Bhairab rath and Ganesh rath using the imagegen skill's built-in tool. Each includes front, left side, back and three-quarter views. Researched official/local sources and inspected six online photos for broad construction reference. No research photo was supplied to generation or copied into the game/repository.

Corrected Pulu Kisi's initial one-person bell-shaped body to a long cloth effigy with multiple performer-foot positions. Raths share a timber/disc-wheel/pavilion construction family; the smaller variants are provisional shells, not certified authentic replicas.

No GLB/Blender/rig/animation, runtime collision, bonus scoring, motion, placement, upload, deployment or decision-log changes. All original art and existing animation work are preserved. The broader requested asset set has a recorded phase sequence, not completed models.

## Changed files / assets

| Path | Purpose |
|---|---|
| art-source/festival_phase1_v01/pulu_kisi_concept_v01.png | Four-view effigy draft, 1983 × 793 |
| art-source/festival_phase1_v01/kumari_rath_concept_v01.png | Four-view larger rath shell, 1672 × 941 |
| art-source/festival_phase1_v01/bhairab_rath_concept_v01.png | Four-view compact companion proposal, 1672 × 941 |
| art-source/festival_phase1_v01/ganesh_rath_concept_v01.png | Four-view narrower companion proposal, 1672 × 941 |
| art-source/festival_phase1_v01/*_prompt.txt | Five exact prompts including Pulu correction |
| art-source/festival_phase1_v01/RESEARCH_AND_HANDOFF.md | Sources, rights, researched/inferred split, review questions and phased backlog |
| art-source/festival_phase1_v01/provenance.json | Inputs, generation identifiers, limitations |
| art-source/festival_phase1_v01/image_verification.json | Dimensions, bytes, SHA256 |
| tasks/T019_FESTIVAL_CONCEPTS_PHASE1.md | Bounded direct authorization |
| tasks/00_TASK_INDEX.md | Incidental tracking row; review pending |
| reports/T019_RESULT.md | Completion evidence |

## Verification commands and results

- `Get-ChildItem -LiteralPath art-source/festival_phase1_v01 -Filter '*.png'` and count assertion: four final PNGs.
- `Add-Type -AssemblyName System.Drawing`, `[System.Drawing.Image]::FromFile(...)`: all decode; actual dimensions measured, not requested sizes or upscaled resolution.
- `Get-FileHash -Algorithm SHA256`: recorded four outputs in image_verification.json; T017 style input unchanged (3B175A1C91A19C9907C599B9044C8C01B6293178D2FCB1BF38EB187F3A040C10).
- Visual inspection of generated outputs: complete four-view layouts, visible trunk/hem/wheels/roof/drawbeam, opposite front/back views, empty rath cabins, neutral backgrounds. Several fine details/rope and panel placements vary across views. No exact geometry validation claimed.
- `Invoke-WebRequest` retrieved ECS HTML/photo, Post photos and Gorkhapatra family photo for local inspection only. Web tool ECS fetches timed out; PowerShell retrieval succeeded. An initial Post selection showed Lakhey instead of rath and was excluded from rath construction evidence.
- `git diff --cached --check`: passed before commit.
- No build or runtime tests run: this is art-only and no runtime source changed.

## Browser and device tests

- Tested: image previews in this session, PNG decoding and metadata on Windows.
- Untested: Meshy model generation, Blender consistency, mobile visual scale/readability, gameplay collisions and FPS; no physical device or game browser test for this concept-only ticket.

## Evidence

Four delivered PNGs are the preview evidence. Byte sizes: Pulu Kisi 1,874,598; Kumari 2,078,592; Bhairab 2,114,613; Ganesh 1,989,677. Source citations, exact prompts and full output hashes accompany them.

## Assumptions, defects and blockers

- Interpreted this chat as concept-reference production, matching the prior Tuku image workflow. These are raster drawings, not 3D models.
- Detailed sacred decoration and occupants are intentionally omitted. Pulu Kisi head/trim/proportions are a simplified proposal; no authentic mask/costume/choreography claim.
- Ganesh/Bhairab individually identified construction details remain unverified. Their draft names designate intended asset slots; their differences are modest provisional geometry/trim variants.
- Each sheet normalizes scale independently. Kumari's larger real-world relationship is a brief direction, not measured or calibrated between images.
- Unseen sides, wheel occlusion, undercarriage joints, ropes and carvings are inferred; generated views must be reconciled to a single mesh after review.
- Cultural practitioner review has not happened. Direct owner authorization covers exploration, not authenticity approval.
- User's proposed future dodge-obstacle framing conflicts with existing docs/03 cultural boundaries and deferred Pulu gameplay. Recorded for resolution before gameplay work; no changes to decision authority.
- Research photos' redistribution rights are unverified except Commons page metadata; none is imported/used as a generation input. Original project reference ownership is not independently established.
- Pre-existing untracked art-source/tuku_concept_art_turnaround.png preserved and excluded.

## Director approvals requested

Review these four draft silhouettes and simplified decoration. Obtain informed local review and individually identified references before exact rath detailing. Decide whether the later oncoming interaction is an appropriate procession-traffic encounter under the cultural brief; this report does not approve that change.

## Suggested next ticket

Phase 2: everyday spectator character variants and market cart concepts, followed by a separate phase for brick/timber facades, gateway and hanging lights. User requested all of those in phases; do not automatically start another ticket. Placement/modeling follow after concept acceptance.
