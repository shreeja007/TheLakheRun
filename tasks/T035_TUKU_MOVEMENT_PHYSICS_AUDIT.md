# T035 — Audit Tuku movement and physics

**Status:** REVIEW — audit complete; fixes not started, awaiting director choice  
**Authorization:** Direct owner instruction on 2026-11-03: "lets try to improve the movement or the physics of [Tuku], audit and find out what improvement it needs or is it like fully optimized".  
**Dependencies:** Accepted build D-016 (`46c8641`).

## Scope

Audit Tuku's movement and physics as implemented: lane switching, jump, slide, dodge styles, tease, input mapping, camera follow, speed ramp, collision volumes and frame-rate behavior. Reproduce suspected defects in the production build and record evidence under `reports/evidence/T035/`. Write `reports/T035_RESULT.md` with prioritized findings and proposed fixes.

## Exclusions

No code changes in this ticket. No new mechanics, difficulty/hitbox/speed retuning, art or animation redesign. Fixes require a separate director-authorized implementation ticket.

## Acceptance criteria

- Findings separate confirmed defects (reproduced) from feel/design suggestions requiring director decision.
- Each confirmed defect has a reproduction and evidence.
