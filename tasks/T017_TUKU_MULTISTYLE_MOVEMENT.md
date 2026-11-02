# T017 — Tuku Multi-Style Movement Variations (3 Jumps, 3 Slides, 3 Dodges)

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M2  
**Dependencies:** T002, T007, T015, T016  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`

## Objective

Expand Tuku's athletic trickster movement repertoire by adding 3 randomized, culturally fitting stylistic variations for each primary movement action: Jump (Normal Vault, Front Flip Somersault, Backward Teasing Jump), Slide (Temple Run Flagstone Glide, Parkour Dive Roll, Rockstar Double-Knee Slide), and Sideways Dodge (Skater Carve Swipe, Lateral Barrel Hop, 360° Spin Quick-Step).

## In scope

- Randomly select 1 of 3 distinct procedural styles whenever Jump, Slide, or Lane Dodge is triggered.
- Dynamic whole-body transforms (Euler pitch somersaults, bank rolls, 180°/360° yaw turns) alongside joint kinematics.
- Interactive style inspection controls in `viewer_tuku.html` for all 9 styles.
- Strict collision bounding box integrity: all 3 slide variants maintain `maxY <= 0.38m` clearance under low beams; jumps clear hurdles.
- Seamless zero-latency cancels (Slide cancels Jump into dive; Jump cancels Slide into vault).
- Telemetry & HUD tracking showing active style name.

## Out of scope

- New external asset downloads or binary files.
- Combat or violent collision mechanics.
- In-game currency or microtransactions.

## Acceptance criteria

- [x] Jump randomly triggers Normal Vault, Front Flip, or Backward Teasing Jump.
- [x] Slide randomly triggers Temple Run Glide, Dive Roll, or Knee Slide.
- [x] Dodge randomly triggers Skater Carve, Barrel Hop, or 360° Spin Quick-Step.
- [x] Collision bounding box allows all 3 slides to clear under overhead beams.
- [x] Zero-latency cancel between jump and slide is preserved.
- [x] `viewer_tuku.html` contains dedicated buttons for previewing all 9 styles.

## Deliverables and report

- Code: `src/types.ts`, `src/runner/PlayerController.ts`, `src/game/GameManager.ts`, `viewer_tuku.html`.
- Automated test: `scratch/test_tuku_multistyle.cjs`.
- Report: `reports/T017_TUKU_MULTISTYLE_MOVEMENT_RESULT.md`.
