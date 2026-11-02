# T003 — Reusable road tiles and fair obstacles

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M2  
**Dependencies / approval:** T002 accepted; director chooses first two hazard archetypes  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/02_GAMEPLAY.md`, `docs/06_WORLD_AND_ASSET_PIPELINE.md`

## Objective

Produce an endless, reusable graybox road with a clearly jumpable obstacle and an avoid-by-lane obstacle.

## In scope

- Recycle a limited number of straight graybox road segments.
- Implement two clearly distinct placeholder obstacle colliders and a consistent placement pipeline.
- Preserve at least one reachable path based on known lane-change and jump timing; use fixed seed/debug option to reproduce patterns.
- Expose easy-to-tune spawn spacing/speed parameters for follow-on playtesting.

## Out of scope

- No decorative city kit, crowd AI, sacred objects, multiple street directions or bonus items.
- No complex procedural downtown generation.

## Acceptance criteria

- [ ] Road repeats without gaps, visible teleport pops or accumulating unused segments.
- [ ] Both hazard types can be passed using the intended corresponding action.
- [ ] Reproducible tests/demonstrations show no impossible wall patterns in common cases.
- [ ] Obstacle visibility and collision hitbox alignment are easy to inspect.

## Verification Codex must report

- Demonstrate a 60-second run without endless object growth.
- Document fixed-seed test cases for safe route and both hazards.
- Report spawn counts and rough performance effect where measurable.

## Deliverables

- Working graybox level with debug seed/controls and report.

- A completion report at `reports/T003_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

Do not turn current decorative guesses into approved festival props; keep neutral shapes until art is authorized.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
