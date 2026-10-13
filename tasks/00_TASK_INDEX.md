# Codex task queue

**As of 2026-10-09:** T001 is **READY FOR DIRECTOR APPROVAL**, not yet authorized. All other tickets are **PLANNED / BLOCKED BY DEPENDENCIES**. Codex must not start the next ticket automatically.

| Ticket | Outcome | Depends on | State |
|---|---|---|---|
| [T001](T001_WEB_3D_FEASIBILITY.md) | Browser-3D feasibility + device evidence | Owner authorizes experiment | IMPLEMENTED (Reported) |
| [T002](T002_PLAYER_MOVEMENT.md) | Graybox auto-run, lanes, jump | T001 + orientation/control decision | IMPLEMENTED (Reported) |
| [T003](T003_ROAD_OBSTACLES.md) | Repeating road and fair hazards | T002 + obstacle spec | IMPLEMENTED (Reported) |
| [T004](T004_SCORE_GAME_OVER_RETRY.md) | Score, fail state, saved best, retry | T003 | IMPLEMENTED (Reported) |
| [T005](T005_GUARDIAN_CHASE_PLACEHOLDER.md) | Guardian placeholder + nonviolent catch | T004 + chase-rule review | IMPLEMENTED (Reported) |
| [T006](T006_TUKU_VISUAL_TURNAROUND.md) | Consistent Tuku concept sheet | Tuku outfit direction authorization | READY FOR APPROVAL |
| [T007](T007_TUKU_BLENDER_BLOCKOUT.md) | Editable Tuku static model + GLB | T001, T006 approved | READY FOR APPROVAL |
| [T008](T008_KATHMANDU_ASSET_KIT.md) | Reusable fictional city kit | T003 + art brief | READY FOR APPROVAL |
| [T009](T009_LAKHEY_HERO_CONCEPT.md) | Reviewed guardian visual concept | Cultural review plan/contact | READY FOR APPROVAL |
| [T010](T010_LAKHEY_MODEL_BLOCKOUT.md) | Guardian blockout from approved concept | T009 approval | IMPLEMENTED (Audited & Articulated) |
| [T011](T011_BASIC_CHARACTER_ANIMATION.md) | Basic runner/guardian approved motions | T007 + T010 | READY FOR APPROVAL |
| [T012](T012_AUDIO_HUD_AND_GAME_FEEL.md) | UI, sound and feedback polish | T005 + approved assets and audio rights | READY FOR APPROVAL |
| [T013](T013_MOBILE_PERFORMANCE_PASS.md) | Device profiling and targeted optimization | Usable alpha build | READY FOR APPROVAL |
| [T014](T014_STATIC_STAGING_HOSTING.md) | HTTPS staging on the owner server | Build stable + server details + permission | BLOCKED: HOST DETAILS |
| [T015](T015_FINAL_QA_AND_RELEASE_REVIEW.md) | QA evidence + release recommendation | T013, T014, cultural/rights sign-off | PLANNED |
| [T017](T017_TUKU_MULTISTYLE_MOVEMENT.md) | Tuku multi-style jump, slide, dodge variations | T002, T011 | IMPLEMENTED (Reported) |
| [T018](T018_MULTISTYLE_AUDIO_WHOOSHES.md) | Movement audio whooshes & stone skids | T012, T017 | IMPLEMENTED (Reported) |
| [T019](T019_PULU_KISI_CROSSROAD_RUNNER.md) | Pulu Kisi dynamic crossroad runner hazard | T003, T008, T012 | IMPLEMENTED (Reported) |
| [T020](T020_RATHS_BACKGROUND_PROCESSION.md) | Sacred Raths of Kumari, Bhairab & Ganesh background procession | T003, T008, T012, T019 | IMPLEMENTED (Reported) |

| [T028](T028_INCOME_AND_GROWTH_RESEARCH.md) | Income/growth research comparing Nepal/diaspora and global audiences | Research authorization; transferred under T031 | REVIEW; dated proposal/scenarios preserved, business decisions pending |
| [T031](T031_RESEARCH_HANDOFF_MIGRATION.md) | Migration phase 1: missing research handoff and documentation references | Direct phased-migration authorization on 2026-10-13 | REVIEW; five exact copies verified, runtime/art unchanged |
| [T032](T032_OPTION_C_INTEGRATION.md) | Migration phase 2: Option C in current original game and combined verification | Same direct phased-migration authorization; T031 complete | REVIEW; build and 17 UI/PWA checks passed, friend art/animation/audio/world preserved; device acceptance pending |
| [T033](T033_FOCUSED_SHORTCUTS_AND_MERGE.md) | Fix focused-button shortcuts, verify and merge migration locally | Direct owner instruction on 2026-10-13 | REVIEW; build and 18 combined checks passed, local master fast-forwarded, pre-merge backup preserved; device acceptance pending |

## How to assign the first task

When the director explicitly authorizes T001, paste this message to Codex in VS Code:

> Read `AGENTS.md`, `README.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, and `tasks/T001_WEB_3D_FEASIBILITY.md`. I authorize **only T001**, a small PlayCanvas TypeScript WebGL feasibility spike. Stay inside the task's in-scope work; do not implement the runner, characters, obstacles, festival art or hosting. At the end, provide a run/build report, browser/device test instructions, evidence, limitations, and questions requiring my approval. Do not begin T002.

## After Codex returns a result

1. Owner tests the deliverable personally on available devices.
2. Planning conversation compares it to the task's acceptance criteria.
3. Accept it, request a targeted fix, or reject and explain why.
4. Save Codex evidence in `reports/TXXX_RESULT.md` and log approved decisions and technical findings in `docs/10_DECISIONS.md` and `docs/00_PROJECT_STATUS.md`.
5. **Only then** authorize the next ticket.

Do not use `tasks/TASK_TEMPLATE.md` as a task to run; it is a standard for writing future tickets.
