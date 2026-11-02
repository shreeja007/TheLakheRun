# Lakhey Run — production planning repository

**Updated:** 2026-10-09  
**State:** Design / preproduction; no game implementation included in this package.  
**Owner:** Game Director / Product Owner  
**Planning:** ChatGPT management conversation  
**Implementation:** Codex in VS Code, ticket by ticket

## What this project is

A small, replayable, **stylized 3D browser game** for desktop and mobile inspired by the festival atmosphere of Kathmandu's Indra Jatra / Yenya. A fictional young trickster takes part in a playful, nonviolent guardian challenge with Lakhey. Future cultural stories are optional additions, not the first game's workload.

**North star:** finish one fun, respectful, fast-to-retry runner; resist scope creep.

## Start here

1. **Everyone:** read [`docs/00_PROJECT_STATUS.md`](docs/00_PROJECT_STATUS.md) for what's accepted, proposed and blocked.
2. **Game Director:** use [`docs/11_ROADMAP.md`](docs/11_ROADMAP.md), [`docs/10_DECISIONS.md`](docs/10_DECISIONS.md) and [`docs/13_OPEN_QUESTIONS.md`](docs/13_OPEN_QUESTIONS.md).
3. **Codex:** read [`AGENTS.md`](AGENTS.md), then the **one authorized ticket** in [`tasks/00_TASK_INDEX.md`](tasks/00_TASK_INDEX.md) and only the related docs.
4. **First possible implementation ticket:** [`tasks/T001_WEB_3D_FEASIBILITY.md`](tasks/T001_WEB_3D_FEASIBILITY.md). This is a technical experiment, **not** authority to build the full game.
5. **After each build:** owner reviews on real devices, then updates decisions and authorizes a follow-up ticket.

## Where information belongs

| Location | Single purpose |
|---|---|
| `AGENTS.md` | Persistent rules for Codex in the repository |
| `docs/00_PROJECT_STATUS.md` | Current status and most important constraints |
| `docs/01_GAME_VISION.md` | Intended player emotion, experience and design principles |
| `docs/02_GAMEPLAY.md` | Proposed and approved gameplay rules |
| `docs/03_STORY_AND_CULTURE.md` | Fiction, folklore references and cultural review |
| `docs/04_CHARACTER_TUKU.md` | Tuku's proposed character/art specifications |
| `docs/05_CHARACTER_LAKHEY.md` | Guardian role and unapproved hero-character details |
| `docs/06_WORLD_AND_ASSET_PIPELINE.md` | Art kit, Blender pipeline, 3D deliverables |
| `docs/07_AUDIO_UI_AND_ACCESSIBILITY.md` | Sound, controls UX, HUD, accessibility |
| `docs/08_TECHNICAL_ARCHITECTURE.md` | Engine candidate, project structure and hosting |
| `docs/09_QA_AND_RELEASE.md` | Test matrix, quality gates and publication requirements |
| `docs/10_DECISIONS.md` | Decision log: accepted, proposed, deferred, superseded |
| `docs/11_ROADMAP.md` | Ordered milestones and review gates |
| `docs/12_RESEARCH_SOURCES.md` | Source links and licensing cautions |
| `docs/13_OPEN_QUESTIONS.md` | Questions requiring owner or stakeholder approval |
| `tasks/` | One bounded Codex assignment per file |
| `reports/` | Per-ticket Codex evidence and director review notes |
| `archive/` | Prior long-form sources; historical, not active instructions |

## Authority / conflict resolution

1. Direct new instruction from the Game Director, **recorded as an approved decision**.
2. `docs/10_DECISIONS.md` and `docs/00_PROJECT_STATUS.md`.
3. Domain-specific `docs/*.md` in their respective areas.
4. The currently approved `tasks/Txxx_*.md` for implementation scope.
5. Archived source documents for background only.

If something conflicts, **stop and report the conflict** rather than quietly guessing. Do not interpret a draft as approved merely because it appears in an assignment's references.

## Task lifecycle

`PLANNED → READY FOR APPROVAL → AUTHORIZED → IN PROGRESS → REVIEW → ACCEPTED` (or `BLOCKED / CHANGES REQUESTED`).

Codex may work on a ticket **only after the Game Director authorizes it**. Technical tests do not automatically approve gameplay feel, character art or culturally sensitive representations.

## How to use in VS Code

Copy/unzip this folder into the intended project repository. Open the repository in VS Code with Codex. Start with the root `AGENTS.md` and assign **only T001** when you're ready. Codex can create source code and asset folders while implementing approved tasks; this package deliberately contains planning files only.

## Running locally

```bash
npm install        # Install PlayCanvas, Vite, TypeScript
npm run dev        # Launch Vite development server
npm run build      # Compile TypeScript and bundle production assets
npm run preview    # Preview production bundle with network access
```

## Existing-game audit and polish (T034, pending acceptance)

The [current audit](audit.md) records confirmed defects, corrections and remaining review items. During a run, location/skill/record feedback shares one short line beside the score. Compact screens omit decorative screen-wide confetti/flashes/flying digits; short landscape uses one row of existing controls. Gameplay, models and scoring rules are preserved. Pause freezes the simulation, background/context loss pauses the run, and unmuting while paused keeps music stopped.

After a production build, check this ticket against a local preview in another terminal:

```powershell
$env:UI_TEST_URL = 'http://127.0.0.1:4190'
$env:UI_TEST_EVIDENCE_DIR = 'reports/evidence/T034/after'
npm run test:ui
node scripts/test-polish.mjs
```

Use `npm run preview -- --host 127.0.0.1 --port 4190 --strictPort` for that preview. The [T034 report](reports/T034_RESULT.md) contains fresh evidence and real-device limitations. Director acceptance remains pending; this work does not authorize deployment.

## Income research handoff (T031, pending review)

The [income and growth proposal](reports/evidence/T028/INCOME_AND_GROWTH_PROPOSAL.md), [source register](reports/evidence/T028/source_register.json) and [reproducible revenue scenarios](reports/evidence/T028/revenue_scenarios.json) were transferred from the sibling workspace on 2026-10-13. Research is dated 2026-10-12; hypothetical revenue inputs are not earnings forecasts. No monetization approach has been approved or implemented.

See the [original research result](reports/T028_RESULT.md) and [migration verification](reports/T031_RESULT.md). Earlier sibling UI/PWA evidence is preserved in [the archived T016 report](docs/bob_branch_archive/reports/T016_RESULT.md); fresh original-project integration evidence belongs to T032.

## Active workspace and Option C (T032, pending acceptance)

Use `lakhey-run-planning_antigravity_original` for subsequent authorized work; preserve the sibling workspace as reference. See [migration/coordination notes and physical-device checklist](docs/MIGRATION_WORKSPACE.md).

The normal HUD hides diagnostics; open `/?debug=1` for FPS, Reset and seed controls. First Play opens a skippable four-step swipe/keyboard rehearsal; How to play reopens it outside a run. Pause/Resume and mute remain available. Existing movement styles, the Tease button/T/E shortcut and festival behavior are preserved.

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4184 --strictPort
```

In another PowerShell terminal, run the combined UI/mobile/PWA checks against that preview:

```powershell
$env:UI_TEST_URL = 'http://127.0.0.1:4184'
npm run test:ui
```

The Home screen menu explains installation and offline-saving status. The production snapshot includes current Tuku/Lakhey, Pulu Kisi and rath models. Wait for Game saved, reload to get worker control, then test offline. A saved update waits until all game tabs close. Development mode does not register the worker. Phone installation/offline behavior needs HTTPS and a supporting browser; localhost supports desktop checks. Absolute model URLs and worker/manifest scope currently require origin-root hosting. No deployment was performed.

Fresh results are in [T032](reports/T032_RESULT.md), pending director/device acceptance. `npm run icons` regenerates the existing original placeholder icons; it does not create final character branding.

## What is explicitly NOT in V1

Open world, multiplayer, user accounts, online leaderboards, Rath Pull mode, heavy story missions, complex combat, cosmetic marketplace, pay-to-win systems, and large crowds. They require separate future approvals.
