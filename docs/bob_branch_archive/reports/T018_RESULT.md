# T018 — Separate Tuku views result

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T018_TUKU_SEPARATE_VIEWS.md`

## Summary

Delivered five separate Tuku reference PNGs: front, anatomical left, anatomical right, back and inferred overhead. Four upright views were isolated with the built-in image tool from the T017 refined sheet; this can redraw pixels. The source sheet contains no top view, so that angle is generated rather than extracted. The first overhead candidate had camera tilt and was corrected before delivery.

No gameplay, HUD, PWA, GLB, rig, animation, source art or decision-log changes. No upload to Meshy or external publishing. Your friend's animation work is untouched.

## Changed files / assets

| Path | Why changed |
|---|---|
| art-source/tuku_views_v04/tuku_front_v04.png | Individual front reference, 1024 × 1536 |
| art-source/tuku_views_v04/tuku_left_side_v04.png | Anatomical left, face image-right, 1024 × 1536 |
| art-source/tuku_views_v04/tuku_right_side_v04.png | Anatomical right, face image-left, 1024 × 1536 |
| art-source/tuku_views_v04/tuku_back_v04.png | Individual rear reference, 1024 × 1536 |
| art-source/tuku_views_v04/tuku_top_inferred_v04.png | Inferred overhead reference, 1254 × 1254 |
| art-source/tuku_views_v04/*_prompt.txt | Six exact generation/edit prompts, built-in tool mode |
| art-source/tuku_views_v04/provenance.json | Source hash, output derivations, limitations |
| art-source/tuku_views_v04/image_verification.json | Measured dimensions, byte sizes and SHA256 |
| art-source/tuku_views_v04/HANDOFF.txt | Angle orientation and modeling handoff |
| tasks/T018_TUKU_SEPARATE_VIEWS.md | Record direct user authorization and bounded scope |
| tasks/00_TASK_INDEX.md | Add T018 review state; incidental tracking update |
| reports/T018_RESULT.md | Required completion record |

## Verification commands and results

- `Get-ChildItem -LiteralPath art-source/tuku_views_v04 -Filter '*.png'` plus count assertion: exactly five final PNGs.
- `Add-Type -AssemblyName System.Drawing` and `[System.Drawing.Image]::FromFile(...)`: all five decode; four 1024 × 1536, top 1254 × 1254. No upscaling performed.
- `Get-FileHash -Algorithm SHA256`: output hashes recorded in image_verification.json. Source sheet hash remains 3B175A1C91A19C9907C599B9044C8C01B6293178D2FCB1BF38EB187F3A040C10, matching T017.
- Visual inspection of source and all built-in outputs: one character/view per final image, opaque neutral background, no labels; full upright silhouettes visible; opposite profiles; source palette and strap direction retained.
- Top correction inspected: crown hides face and torso, shoulders/arms projected laterally, shoes partly occluded; closer overhead reference than rejected tilted candidate. Mathematical orthographic geometry remains unverified.
- `git diff --cached --check`: passed before commit.
- Runtime tests/build omitted: no runtime files changed.

## Browser and device tests

- Tested: direct image previews in this session and PNG decoding/metadata in Windows PowerShell.
- No browser, mobile device, Meshy account, Blender mesh or rig tested for this art-only ticket.

## Evidence

The five PNGs above are the generated asset previews. Exact prompts and derivation identifiers are saved in the same folder. Final sizes: front 1,777,046 bytes; left 1,638,982; right 1,709,308; back 1,747,394; top 1,711,853.

## Assumptions, defects and blockers

- Selected the latest T017 refined sheet as the requested model reference.
- AI isolations are not pixel-identical extraction and may vary in face details, seams, hands, proportions and framing. They are not guaranteed multi-view geometry of one shared model.
- Top view is explicitly inferred, including unseen hair crown, hood and bag relationships; no exact correspondence to existing GLB. Hood mass/hand projection and bag shape should be checked by the modeler.
- Slight differences in scale and framing persist across upright files. No downstream Meshy consistency or model precision claim.
- Preserved the existing untracked user file art-source/tuku_concept_art_turnaround.png outside the commit.
- No external copyrighted material downloaded; project input ownership is not independently established. No cultural authenticity asserted.

## Director approvals requested

Review the five images for visual acceptance, especially inferred top construction and anatomical right-rear satchel placement. No approval has been recorded in the decision log.

## Suggested next ticket

Compare approved references against the current Tuku mesh and test model reconstruction under a separately authorized modeling ticket. Do not automatically replace or re-rig the animated character.
