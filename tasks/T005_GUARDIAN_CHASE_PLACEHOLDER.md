# T005 — Nonviolent Lakhey chase using a placeholder

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M3  
**Dependencies / approval:** T004 accepted; director reviews chase-ending rules and tonal feedback  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/02_GAMEPLAY.md`, `docs/03_STORY_AND_CULTURE.md`, `docs/05_CHARACTER_LAKHEY.md`

## Objective

Make the existing runner feel pursued by a powerful yet non-malicious guardian without needing a culturally sensitive final model.

## In scope

- Use a readable generic guardian silhouette/placeholder at tuned camera distance.
- Add minimal follow/chase behavior and a harmless close/catch end-of-run response.
- Provide clear visual feedback for any agreed proximity mechanic; separate this from hitbox logic.
- Expose a few tuning parameters for player review and preserve functioning graybox scoring/retry.

## Out of scope

- No real sacred mask, ceremonial dance reconstruction, combat, jump scares or complex pathfinding.
- No automatic two-strike system unless directly approved.

## Acceptance criteria

- [ ] The player notices the pursuer without gameplay lanes being obstructed.
- [ ] A loss clearly ends the challenge without violent imagery.
- [ ] Game can restart repeatedly without placeholder spawning copies or camera failure.
- [ ] Guardian proximity feedback is understandable at phone size and with audio muted.

## Verification Codex must report

- Provide a short run + fail + retry recording and parameters documented.
- Report player feedback needed on tension/fairness before committing more chase logic.

## Deliverables

- Working placeholder chase layer and director review notes.

- A completion report at `reports/T005_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

If final Lakhey designs/gestures are needed to proceed, use placeholder and report the cultural/art approval boundary.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
