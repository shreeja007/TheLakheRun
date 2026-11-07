# Codex task queue

**As of 2026-11-07:** Tickets marked ACCEPTED below were accepted by the Game Director (`docs/10_DECISIONS.md` D-016). T035–T039 are merged; the owner reported them flawless on the Vercel build, and formal acceptance is not yet logged. Remaining: T015 (planned), T014 decision, T028 research decisions, cultural/rights review, and the unused art listed below. Codex must not start the next ticket automatically.

| Ticket | Outcome | Depends on | State |
|---|---|---|---|
| [T001](T001_WEB_3D_FEASIBILITY.md) | Browser-3D feasibility + device evidence | Owner authorizes experiment | ACCEPTED 2026-11-02 (D-016) |
| [T002](T002_PLAYER_MOVEMENT.md) | Graybox auto-run, lanes, jump | T001 + orientation/control decision | ACCEPTED 2026-11-02 (D-016) |
| [T003](T003_ROAD_OBSTACLES.md) | Repeating road and fair hazards | T002 + obstacle spec | ACCEPTED 2026-11-02 (D-016) |
| [T004](T004_SCORE_GAME_OVER_RETRY.md) | Score, fail state, saved best, retry | T003 | ACCEPTED 2026-11-02 (D-016) |
| [T005](T005_GUARDIAN_CHASE_PLACEHOLDER.md) | Guardian placeholder + nonviolent catch | T004 + chase-rule review | ACCEPTED 2026-11-02 (D-016) |
| [T006](T006_TUKU_VISUAL_TURNAROUND.md) | Consistent Tuku concept sheet | Tuku outfit direction authorization | ACCEPTED 2026-11-02 (D-016) |
| [T007](T007_TUKU_BLENDER_BLOCKOUT.md) | Editable Tuku static model + GLB | T001, T006 approved | ACCEPTED 2026-11-02 (D-016) |
| [T008](T008_KATHMANDU_ASSET_KIT.md) | Reusable fictional city kit | T003 + art brief | ACCEPTED 2026-11-02 (D-016) |
| [T009](T009_LAKHEY_HERO_CONCEPT.md) | Reviewed guardian visual concept | Cultural review plan/contact | ACCEPTED 2026-11-02 (D-016) — gameplay only; cultural review outstanding |
| [T010](T010_LAKHEY_MODEL_BLOCKOUT.md) | Guardian blockout from approved concept | T009 approval | ACCEPTED 2026-11-02 (D-016) — gameplay only; cultural review outstanding |
| [T011](T011_BASIC_CHARACTER_ANIMATION.md) | Basic runner/guardian approved motions | T007 + T010 | ACCEPTED 2026-11-02 (D-016) |
| [T012](T012_AUDIO_HUD_AND_GAME_FEEL.md) | UI, sound and feedback polish | T005 + approved assets and audio rights | ACCEPTED 2026-11-02 (D-016) |
| [T013](T013_MOBILE_PERFORMANCE_PASS.md) | Device profiling and targeted optimization | Usable alpha build | ACCEPTED 2026-11-02 (D-016) |
| [T014](T014_STATIC_STAGING_HOSTING.md) | HTTPS staging on the owner server | Build stable + server details + permission | BLOCKED: HOST DETAILS. Owner hosts on Vercel since 2026-11-07 (outside this ticket); owner to decide whether server staging is still needed |
| [T015](T015_FINAL_QA_AND_RELEASE_REVIEW.md) | QA evidence + release recommendation | T013, T014, cultural/rights sign-off | PLANNED |
| [T017](T017_TUKU_MULTISTYLE_MOVEMENT.md) | Tuku multi-style jump, slide, dodge variations | T002, T011 | ACCEPTED 2026-11-02 (D-016) |
| [T018](T018_MULTISTYLE_AUDIO_WHOOSHES.md) | Movement audio whooshes & stone skids | T012, T017 | ACCEPTED 2026-11-02 (D-016) |
| [T019](T019_PULU_KISI_CROSSROAD_RUNNER.md) | Pulu Kisi dynamic crossroad runner hazard | T003, T008, T012 | ACCEPTED 2026-11-02 (D-016) |
| [T020](T020_RATHS_BACKGROUND_PROCESSION.md) | Sacred Raths of Kumari, Bhairab & Ganesh background procession | T003, T008, T012, T019 | ACCEPTED 2026-11-02 (D-016) |
| [T028](T028_INCOME_AND_GROWTH_RESEARCH.md) | Income/growth research comparing Nepal/diaspora and global audiences | Research authorization; transferred under T031 | REVIEW; dated proposal/scenarios preserved, business decisions pending |
| [T031](T031_RESEARCH_HANDOFF_MIGRATION.md) | Migration phase 1: missing research handoff and documentation references | Direct phased-migration authorization on 2026-10-13 | ACCEPTED 2026-11-02 (D-016) |
| [T032](T032_OPTION_C_INTEGRATION.md) | Migration phase 2: Option C in current original game and combined verification | Same direct phased-migration authorization; T031 complete | ACCEPTED 2026-11-02 (D-016) |
| [T033](T033_FOCUSED_SHORTCUTS_AND_MERGE.md) | Fix focused-button shortcuts, verify and merge migration locally | Direct owner instruction on 2026-10-13 | ACCEPTED 2026-11-02 (D-016) |
| [T034](T034_EXISTING_GAME_AUDIT_AND_POLISH.md) | Deep audit and existing-game polish, prioritizing mobile overlay visibility | Direct owner instruction on 2026-10-14 | ACCEPTED 2026-11-02 (D-016) |
| [T035](T035_TUKU_MOVEMENT_PHYSICS_AUDIT.md) | Audit Tuku movement/physics; prioritized fixes | Direct owner instruction on 2026-11-03 | REVIEW; audit only. Fixes delivered in T036, except M8 (swipe chaining) and M10 (running bounce), which remain open |
| [T036](T036_TUKU_MOVEMENT_FIXES_AND_EDGE_BUMP.md) | Fix Tuku movement defects M1–M7/M9 and add edge-bump rule | Direct owner instruction on 2026-11-03 | REVIEW; build, 18 UI/PWA checks, 6 polish cases and new movement checks passed; device acceptance pending |
| [T037](T037_DIFFICULTY_RAMP.md) | Keep speed, row frequency and row density rising for ~2 minutes | Direct owner instruction on 2026-11-03 | REVIEW; curve/fairness checks, 18 UI/PWA checks and 6 polish cases passed; playtest tuning pending |
| [T038](T038_DOWNLOAD_SIZE_AND_FRAME_PACING.md) | Smaller download (lossless WebP, no backup model) and no mid-run stutter (batching, instancing, shader warm-up) | Direct owner instruction on 2026-11-03 (#1 + #10) | REVIEW; 11.4 → 6.9 MB, draw calls ~230 → ~110, 54 → 0 dropped frames per scripted run; all suites passed; phone check pending |
| [T039](T039_SETTINGS_VIBRATION_BEST_MARKER.md) | Settings (music/effects volume, reduce shake, vibration), Android vibration cues, best-distance marker | Direct owner instruction on 2026-11-03 (#2–#4) | REVIEW; new settings suite, 18 UI/PWA checks, movement and polish suites passed; phone vibration check pending |

## Archived UI and art tickets

These tickets came from the sibling workspace. Their task and result files stay in `docs/bob_branch_archive/` (IDs T017–T020 there are **different tickets** from the active T017–T020 above). All still await director acceptance unless noted.

| Ticket | Delivered | In the game? |
|---|---|---|
| T016 | Production HUD, controls rehearsal, home-screen support | Yes, integrated by T032 (accepted, D-016) |
| T017, T018 | Tuku refined turnaround and separate reference views | No, reference images only |
| T019 | Pulu Kisi and three rath concept sheets | Raths and a different Pulu Kisi model are in the game |
| T020, T021 | Kumari, Bhairab and Ganesh rath models | Yes, as the background procession |
| T022 | Static cloth-shell Pulu Kisi model | No, the game uses a separate animated model |
| T023 | Three spectator and one market-cart concept sheets | No, concepts only (no 3D model) |
| T024 | Two building, gateway and hanging-light concept sheets | No, concepts only (buildings and gateway modeled in T025–T027) |
| T025, T026 | Building 01 residence and Building 02 shopfront models | No, unused in `public/models/` |
| T027 | Everyday gateway model | No, unused in `public/models/` |

## After Codex returns a result

1. Owner tests the deliverable personally on available devices.
2. Planning conversation compares it to the task's acceptance criteria.
3. Accept it, request a targeted fix, or reject and explain why.
4. Save Codex evidence in `reports/TXXX_RESULT.md` and log approved decisions and technical findings in `docs/10_DECISIONS.md` and `docs/00_PROJECT_STATUS.md`.
5. **Only then** authorize the next ticket.

Do not use `tasks/TASK_TEMPLATE.md` as a task to run; it is a standard for writing future tickets.
