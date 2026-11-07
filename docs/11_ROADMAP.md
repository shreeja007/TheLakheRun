# Production roadmap — small milestones, explicit gates

**Current (2026-11-07):** M0–M5 are built and accepted for gameplay (D-016); M6 performance work continued in T038; the owner hosts a build on Vercel; M7 release gate is open. **All timings are intentionally omitted**; the work will be paced by actual build/test results.

| Stage | Deliverable | Director gate | Codex tickets |
|---|---|---|---|
| M0 Design | MVP boundaries and first technical experiment | Approve orientation/controls before movement work | No code ticket |
| M1 Web feasibility | Tiny 3D test on desktop + mobile | Decide engine and target device | T001 |
| M2 Core graybox | Auto-run, lanes, jump, two hazards, distance, retry | Is the runner responsive and fair? | T002–T004 |
| M3 Chase | Placeholder Lakhey, nonviolent catch and feedback | Is the chase exciting, not annoying/scary? | T005 |
| M4 Character & world | Tuku turnaround/blockout, small reusable street kit, Lakhey concept review | Visual/cultural approval and device readability | T006–T010 |
| M5 Game feel | Basic animations, audio, HUD and feedback after approval | Does it feel distinctly festive and polished? | T011–T012 |
| M6 Performance/hosting | Real mobile/browser profiling + staging host | FPS/size + secure hosting review | T013–T014 |
| M7 Release gate | Cultural/licensing/QA pass, owner approval | Decide whether to ship | T015 |

## Hard gates

- **Before T002:** mobile orientation, camera framing, core controls and initial obstacle types must be director-approved (or codified as one bounded experiment with explicit alternatives).
- **Before T006:** current Tuku outfit/turnaround direction is approved for concept exploration; final model requires a separate sign-off.
- **Before T007:** concept views and T001 engine feasibility are reviewed; do not make a hero model blind.
- **Before T009:** identify informed cultural review and agree how any accurate Lakhey representation will be judged.
- **Before T014:** confirm server OS/access/domain/TLS/bandwidth/storage and obtain explicit permission to deploy.
- **Before T015 public release:** full playtest, cultural/rights reviews, rollback and product-owner launch approval.

## Current prioritized queue

1. Director records acceptance of T035–T039, or requests changes.
2. Director reviews T040 (buildings, gateway, lights, cart and spectators in the game).
3. Cultural reviewer identified; rights/provenance table filled.
4. T015 release review once those are done.

See `tasks/00_TASK_INDEX.md` for live ticket states and links.
