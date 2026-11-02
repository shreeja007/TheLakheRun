# T032 — Migration phase 2: integrate Option C

**Authorization:** Owner authorized the recommended migration sequence on 2026-10-13: “ok lets do all the things in order, phase by phase.” T031 research transfer is complete. This ticket implements only Option C in the original development project and verifies the combined game.
**Implementation state:** COMPLETE; 17 combined UI/PWA checks passed. 
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.

## Read / references

- `../README.md`, `../docs/00_PROJECT_STATUS.md`, `../docs/10_DECISIONS.md`
- `../docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`
- `../docs/08_TECHNICAL_ARCHITECTURE.md`
- `../docs/09_QA_AND_RELEASE.md`
- `../docs/bob_branch_archive/tasks/T016_UI_MOBILE_HOME_SCREEN.md`
- `../docs/bob_branch_archive/reports/T016_RESULT.md` (historical evidence only)
- `../reports/T031_RESULT.md`

## Scope

Connect existing Option C support modules/styles/manifest/icons/build scripts to this project's current HTML/main/game/input sources. Hide production diagnostics unless `?debug=1`; add first-run skippable swipe/keyboard rehearsal, replay help, usable pause/resume, accessible mute, install guidance and versioned production offline snapshot. Preserve friend's movement variants, tease actions, audio, Pulu/rath integration and all art/models. Do not replace whole entry files from the sibling project.

Adapt verification to this project's additional behavior/assets. Run TypeScript/production build and existing meaningful UI/mobile/PWA checks. Verify new controls do not swallow gameplay tease/movement actions; keep artifact evidence separate from archived T016 results. Preserve old workspace as reference and document original as future active workspace in a migration note, not as a change to product/engine approvals.

## Exclusions

No new gameplay mechanics/art, paid services, SDKs/analytics/ads/payments, remote upload/deployment, source-folder deletion or owner approval-log edits. No claim of physical-phone or hardware-GPU testing without actual devices. No later placement/Pulu visual-refinement ticket starts here.

## Completion

`../reports/T032_RESULT.md` and `../reports/evidence/T032/`; modular targeted changes and one reviewable local commit, pending director acceptance. Only phase 2 and combined-game verification are covered.
