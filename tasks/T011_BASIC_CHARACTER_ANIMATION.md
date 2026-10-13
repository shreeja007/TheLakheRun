# T011 — Minimal run, jump and end animations

**Status:** PLANNED  
**Milestone:** M5  
**Dependencies / approval:** T007 Tuku blockout accepted; T010 guardian blockout accepted; gameplay logic stable  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/04_CHARACTER_TUKU.md`, `docs/05_CHARACTER_LAKHEY.md`, `docs/02_GAMEPLAY.md`

## Objective

Add restrained looping Tuku motion and a simple approved guardian end-of-run performance without changing the mechanics.

## In scope

- Rig Tuku minimally or adopt properly licensed animations if compatible; add RUN, JUMP, LAND/FAIL.
- Add a simple guardian locomotion and harmless catch pose/stop; no claim this is sacred choreography.
- Export GLB animation clips with consistent root motion policy and test transitions/collision alignment.
- Verify scarf/strap/bag do not clip obviously during critical actions.

## Out of scope

- No facial capture, full dance sequences, cloth/hair physics, combat, high-cost motion library.

## Acceptance criteria

- [ ] Player motion syncs with actual speed and jump; no feet sliding that significantly hurts gameplay.
- [ ] State changes do not pop, leave player frozen or desync collision.
- [ ] Guardian finish is nonviolent and approved in concept.
- [ ] Runs on desktop and phone without major performance regression.

## Verification Codex must report

- Record short clips and notes for run, jump, land, caught and retry.
- List animation sources/licenses and export/import commands.

## Deliverables

- Animation-ready source files, GLBs/clips, demo and QA notes.

- A completion report at `reports/T011_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

If only unreviewed ritual movement can fill a gap, stop and substitute a neutral approved motion.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
