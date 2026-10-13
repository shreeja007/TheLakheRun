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
| [T016](T016_UI_MOBILE_HOME_SCREEN.md) | Option C: production HUD, controls rehearsal, home-screen support | Direct user authorization on 2026-10-11; existing runner | REVIEW; implementation complete, director acceptance pending |
| [T017](T017_TUKU_CONCEPT_REFINEMENT.md) | Detailed Tuku turnaround and standalone modeling-reference front | Direct user authorization on 2026-10-11; existing concept/brief | REVIEW; concept delivered, director acceptance pending |
| [T018](T018_TUKU_SEPARATE_VIEWS.md) | Separate front, both sides, back and inferred top references | Direct user authorization on 2026-10-11; T017 sheet | REVIEW; five images delivered, director acceptance pending |
| [T019](T019_FESTIVAL_CONCEPTS_PHASE1.md) | Pulu Kisi and three rath concept drafts; phased asset backlog | Direct user authorization on 2026-10-11 | REVIEW; four sheets delivered, director/cultural review pending |
| [T020](T020_FIRST_RATH_BLOCKOUT.md) | First Kumari rath static .blend/GLB handoff and previews | Direct user authorization on 2026-10-11 | REVIEW; model/import checks complete, acceptance pending |
| [T021](T021_COMPANION_RATH_BLOCKOUTS.md) | Bhairab and Ganesh companion .blend/GLB handoffs and previews | Direct user authorization on 2026-10-11 | REVIEW; companion models/import checks complete, acceptance pending |
| [T022](T022_PULU_KISI_BLOCKOUT.md) | Pulu Kisi static .blend/GLB handoff, attachment groups and previews | Direct user authorization on 2026-10-11 | REVIEW; static model/import checks complete, director/cultural acceptance pending |
| [T023](T023_PHASE2_SPECTATORS_AND_MARKET_CART.md) | Three everyday spectator turnarounds and a market-cart concept packet | Direct next-phase authorization on 2026-10-12 | REVIEW; four concept sheets and verified handoff delivered, director acceptance pending |
| [T024](T024_PHASE3_ENVIRONMENT_CONCEPTS.md) | Two everyday brick/timber buildings, gateway and hanging-light concepts | Direct user authorization on 2026-10-12 | REVIEW; four sheets and verified handoff delivered, director acceptance pending |
| [T025](T025_BUILDING01_STATIC_BLOCKOUT.md) | Accepted Building 01 concept to editable static Blender/GLB model | Direct concept acceptance/model authorization on 2026-10-12 | REVIEW; model/import/package checks complete, model acceptance pending |
| [T026](T026_BUILDING02_STATIC_BLOCKOUT.md) | Building 02 editable shopfront Blender/GLB with four separate shutters | Direct user request following visual acceptance on 2026-10-12 | REVIEW; model/import/package checks complete, model acceptance pending |
| [T027](T027_EVERYDAY_GATEWAY_STATIC_BLOCKOUT.md) | Everyday gateway editable static Blender/GLB | Direct request following visual acceptance on 2026-10-12 | REVIEW; model/import/package checks complete, model acceptance pending |

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
