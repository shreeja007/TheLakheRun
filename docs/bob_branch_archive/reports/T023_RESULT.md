# T023 — Phase 2 everyday spectator and market-cart concepts

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-12

**Ticket:** `tasks/T023_PHASE2_SPECTATORS_AND_MARKET_CART.md`

## Summary

Delivered three original everyday adult spectator turnaround sheets and one simple everyday produce handcart sheet in Tuku's grounded stylized illustration style. The user authorized the next phase after T022's Phase 2 recommendation. Designs are reviewable proposals, not owner-approved costumes or final population choices.

Spectators explore a young adult in an ochre jacket, a middle-aged adult in a rust overshirt, and an older adult in a plum cardigan. The cart has a plain timber box, steel underframe, two rubber wheels, two handles and rear support feet. Exact prompts, provenance, image checks, modeling notes and a verified portable ZIP accompany the four selected sheets.

No GLBs, Blender models, rigs, motions, crowd logic, collisions, placement or future architecture were built. Game/runtime code, Tuku, Lakhey, raths, Pulu Kisi, friend animation files, `docs/10_DECISIONS.md` and the owner's untracked PNG remain unchanged.

## Changed files / assets

| Path | Why changed |
|---|---|
| `tasks/T023_PHASE2_SPECTATORS_AND_MARKET_CART.md` | Bounded task and direct authorization record; complete/pending acceptance |
| `tasks/00_TASK_INDEX.md` | T023 review row only; no prior ticket status changed |
| `art-source/festival_phase2_v01/spectator_01_turnaround_v01.png` | Selected original four-view spectator concept |
| `art-source/festival_phase2_v01/spectator_02_turnaround_v01.png` | Selected original four-view spectator concept |
| `art-source/festival_phase2_v01/spectator_03_turnaround_v01.png` | Selected original four-view spectator concept |
| `art-source/festival_phase2_v01/market_cart_concept_v01.png` | Selected corrected four-view everyday cart concept |
| `art-source/festival_phase2_v01/*_prompt.txt` | Five exact prompts: three spectators, cart generation, cart correction |
| `art-source/festival_phase2_v01/references/` | Unmodified T017 style copy and superseded original cart for editable prompt provenance |
| `art-source/festival_phase2_v01/HANDOFF.md` | Modeler's guide, source roles, review steps and limitations |
| `art-source/festival_phase2_v01/provenance.json` | Built-in generation workflow, source/output hashes, claims and preservation record |
| `art-source/festival_phase2_v01/verify_and_package.ps1` | Portable PNG/provenance/ZIP verification and packaging script |
| `art-source/festival_phase2_v01/image_verification.json` | Six decoded PNG records, actual dimensions, bytes and hashes |
| `art-source/festival_phase2_v01/manifest.json` | Hash manifest for handoff payload; excludes circular package records |
| `art-source/festival_phase2_v01/festival_phase2_handoff_v01.zip` | Portable 16-file concept/reference/prompt handoff |
| `art-source/festival_phase2_v01/package_verification.json` | ZIP size/hash and checks for every member |
| `reports/T023_RESULT.md` | Mandatory completion report |

The task index is the only incidental existing file changed; it records delivery without claiming director approval. Two reference PNGs in the packet are distinct from the four selected concepts.

## Verification commands and results

- Built-in `image_gen.imagegen`: three separately prompted spectator generations, one cart generation and one targeted cart edit. All five calls completed. No CLI fallback, external-photo download, model service or upload was used. Exact prompts are saved alongside the assets.
- Visually inspected the T017 style reference and each generated output. All spectator sheets have complete front/back and opposing side profiles, aligned full-body framing, matching main hair/clothing shapes and neutral poses. The older character's age is subtle; no final age approval is implied.
- Found a cart crate-layout defect in the initial image: three crates ran across the width in end views and along the length in side/perspective. The targeted edit corrected the end views to show only the near full-width green crate. Inspected the corrected result; wheel/handle/support construction and all four frames were retained.
- `pwsh -NoProfile -File art-source/festival_phase2_v01/verify_and_package.ps1` — PASS: six PNGs decoded via System.Drawing, provenance input/output hashes valid, all 16 ZIP member lengths and SHA-256 hashes match the source files. All six PNGs are actually **1672 × 941**, not 4K. The first run's console dimension table showed blank cells because OrderedDictionary entries needed conversion to PSCustomObject; corrected the display and reran the verifier. JSON dimension/hash records were valid in both runs.
- `Get-FileHash -LiteralPath 'art-source/tuku_concept_art_turnaround.png' -Algorithm SHA256` — `3CB9852F33A00BC1651253B6D7CAAB68CC59A8CA18E4E6E9DFFE0AD8A9D9AB3F`, matching the previous T017 preservation record. The file remains untracked and excluded from this ticket.
- `git diff --check` and `git diff --cached --check` — PASS; no whitespace errors.
- `git diff --cached --name-only` — ticket scope only: new T023 art packet, ticket, report and task-index row. Existing runtime/character/rath assets and decision log absent from the change set.
- Initial path discovery attempted nonexistent `tasks/INDEX.md` and `tasks/T022_PULU_KISI_STATIC_BLOCKOUT.md`; corrected by `rg --files` to the actual task-index and T022 names. No files were modified by those failed read attempts.

No runtime build or automated gameplay tests were run because no runtime code changed. The script checks asset integrity and packaging, not visual approval or AI repeatability.

## Browser and device tests

- Tested: Windows local PNG decoding and visual inspection of tool-rendered raster outputs.
- Not tested: browser gameplay, physical Android/iOS phones, narrow gameplay framing, GLB import, Meshy generation and animation deformation. No model or game behavior was delivered by this ticket.

## Evidence

- Four selected PNG sheets in `art-source/festival_phase2_v01/` are the deliverable previews.
- `image_verification.json` and `package_verification.json` contain actual dimensions, bytes and SHA-256 evidence; `manifest.json` records payload hashes.
- `references/market_cart_before_correction.png` and `market_cart_correction_prompt.txt` document the cart correction.
- `HANDOFF.md` documents draft slots, modeling order, verification command and review checklist.

## Assumptions, defects and blockers

- No technical blocker to the concept handoff. Director acceptance remains pending.
- These are AI raster concepts, not calibrated orthographic renders of one mesh. Fine anatomy/fingers, fold/seam/knit details, produce shapes, axle/frame joints and world proportions need reconciliation during modeling.
- Spectator 03 looks only subtly older; stronger age detail can be requested before model work. The three slots are a bounded proposal, not a declared complete or final population of the game world.
- Equal pixel height across sheets is independent framing, not shared world scale. No measured mobile silhouette test or geometry/performance budget is claimed.
- Prompt text is editable; images are flattened and generation is nondeterministic. No layered paintings, GLBs, rigs or Meshy-ready isolated-angle input set is supplied.
- The supplied style copy inherits the existing user-directed T017 source chain. No new external media was used, and no independent upstream-rights certification or culturally authentic clothing claim is made.

## Director approvals requested

- Accept or revise the everyday spectator silhouette/age mix, faces, clothing colors and cart direction before a static model ticket.
- No decision-log approval was recorded. Sharing this concept ZIP with the friend is a manual owner action; no message or upload was sent.

## Suggested next ticket

Recommend a separate Phase 3 concept ticket for a fictional brick-and-timber facade, everyday street gateway and hanging lights. Alternatively, after visual acceptance, request one bounded Phase 2 static blockout. Neither is started by T023.
