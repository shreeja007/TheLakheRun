# T033 — Focused-button shortcut fix and migration merge

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-13

**Ticket:** `tasks/T033_FOCUSED_SHORTCUTS_AND_MERGE.md`

## Summary

Fixed the confirmed T032 keyboard regression: after clicking a game button such as Sound, T/E now reach the existing tease action and P/Escape pause/resume correctly. Space/Enter retain native button/link activation without duplicate game input; text-entry controls are isolated. Tutorial and installation-dialog guards remain active.

Committed the correction as `649c896`, then fast-forwarded local `master` from `058d14b` to that commit. This brings in T031 research and T032 Option C together without conflicts. `backup/pre-t032-merge` preserves the original full commit `058d14b2a0f7ecfc3494481dde14f0daeb289f04`. A separate documentation commit records completion after the merge, keeping the tested correction commit intact.

Models, editable art, runner/animation/world/audio source, gameplay rules and the owner approval log were not changed by this correction. No remote push, deployment, source deletion, paid service, new mechanic or future ticket work occurred. Technical merge completion does not record device, cultural or product acceptance.

## Changed files / assets

| Path | Why changed |
|---|---|
| `src/input/InputManager.ts` | Narrow native activation suppression to Space/Enter on buttons/links; preserve other game shortcuts and isolate text-entry controls |
| `scripts/test-ui-mobile.mjs` | Focused-button shortcut/native-activation regression and configurable evidence directory |
| `tasks/T033_FOCUSED_SHORTCUTS_AND_MERGE.md`, `tasks/00_TASK_INDEX.md` | Bounded direct authorization, scope and review state; incidental tracking changes |
| `reports/evidence/T033/` | Fresh build/test/screenshots, preservation verification and merge output, keeping T032 evidence unchanged |
| `reports/T033_RESULT.md` | Mandatory completion report |

## Verification commands and results

- `git branch backup/pre-t032-merge master`: PASS; original master preserved at `058d14b`.
- `git switch migration/t032-option-c-integration`: PASS; clean starting worktree, existing integration used as base.
- `npm run build 2>&1 | Tee-Object -FilePath reports/evidence/T033/build_output.txt`: PASS, TypeScript/Vite; 1,276 modules. Production offline snapshot: 33 files, 11,389,014 raw bytes, version `84f90f4b998adf2e`. Existing large-chunk warning remains.
- `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4188 --strictPort`: PASS; local production preview only.
- PowerShell `$env:UI_TEST_URL = 'http://127.0.0.1:4188'`, `$env:UI_TEST_EVIDENCE_DIR = 'reports/evidence/T033'`, then `npm run test:ui 2>&1 | Tee-Object -FilePath reports/evidence/T033/test_output.txt`: PASS, **18 checks on headless Chrome 155.0.8059.40**. New case verifies actual keyboard events after clicking mute, tease action delivery, pause/resume state and native Space/Enter mute activation without duplicate actions. Existing tutorial/modal isolation, touch/cancellation, layouts, retry, storage failures, install guidance, offline model availability, worker registration failure and real worker update/activation checks pass. No unexpected uncaught errors in monitored normal-play scenarios; intentional unavailable-WebGL failure shows recovery guidance.
- `node reports/evidence/T033/verify_merge_scope.mjs 2>&1 | Tee-Object -FilePath reports/evidence/T033/preservation_output.txt`: PASS; **421 of 429 protected Git files unchanged**, only eight intended integration runtime/config/test files differ from the backup. All seven active model URLs are precached. Uses Git content hashes to avoid the historical raw-byte verifier's LF/CRLF sensitivity.
- `git diff --check`, `git diff --cached --check`: PASS before correction commit. Git line-ending notices are informational; historical evidence was not regenerated.
- `git switch master`, `git merge --ff-only migration/t032-option-c-integration`: PASS; `Updating 058d14b..649c896`, `Fast-forward`, no conflicts. Output saved in `reports/evidence/T033/merge_output.txt`.
- `git merge-base --is-ancestor migration/t032-option-c-integration master`: PASS.
- `git diff --quiet master migration/t032-option-c-integration`: PASS immediately after merge; merged tree equals the tested correction tree. The subsequent completion commit changes only report/evidence/task documentation.
- `git diff --quiet backup/pre-t032-merge master -- src/runner src/world src/audio public art-source docs/00_PROJECT_STATUS.md docs/10_DECISIONS.md`: PASS after merge; protected gameplay/art and approval/status documents preserved.
- Final `git diff --check`, `git diff --cached --check` and clean `git status --short --branch` are checked when committing this completion record; chat reports the final commit/status.

## Browser and device tests

- Tested: Windows, installed headless Chrome with ANGLE SwiftShader software WebGL; desktop and Pixel-style touch emulation, narrow portrait/landscape layouts, iPhone user-agent and standalone emulation. These are automated browser checks, not hands-on device testing.
- Not tested: physical Android/iPhone, actual Safari/Firefox/Edge execution, OS installation, hardware GPU/FPS/heat, full animation/collision tuning, external hosting/HTTPS.
- Manual owner review: open the local preview, Play/skip or complete guidance; test movement, jump/slide, tease, mute, pause and retry. Click Sound, then T/E/P/Escape; confirm shortcuts work. Focus Sound and use Space/Enter; confirm only sound toggles. Repeat relevant touch/retry/layout checks on a real phone. Installation/offline phone checks require an authorized HTTPS staging setup.

## Evidence

- [Build output](evidence/T033/build_output.txt), [test output](evidence/T033/test_output.txt), [18-check metadata](evidence/T033/verification.json).
- [Focused-button capture](evidence/T033/desktop-focused-shortcuts.png), [desktop Ready](evidence/T033/desktop-ready.png), [mobile Ready](evidence/T033/mobile-ready.png), [update waiting](evidence/T033/update-waiting.png); fresh UI/layout/failure screenshots also reside in this directory.
- [Preservation JSON](evidence/T033/preservation.json), [preservation output](evidence/T033/preservation_output.txt), [reproducible scope verifier](evidence/T033/verify_merge_scope.mjs).
- [Merge output](evidence/T033/merge_output.txt).

## Assumptions, defects and blockers

- No remaining blocker for the authorized local merge. Acceptance on real devices remains pending.
- Software-rendered running captures do not show the complete street/player scene. The older T032 mobile-running capture is also incomplete; these screenshots do not certify visual rendering on hardware. The correction changes no camera/rendering/world/model code. Owner desktop/phone visual review remains necessary.
- The approximately 11.4 MB raw offline snapshot and existing engine chunk warnings remain performance-review items, not certified mobile budgets.
- Original planning/status/decision docs are stale relative to implemented reports. They remain unchanged; merging does not approve their unresolved engine, cultural or gameplay proposals.
- Historical T032 raw-byte preservation verification is sensitive to fresh Windows checkout line endings. New scope evidence compares Git content; this ticket does not rewrite historical verification scripts/results.
- Offline snapshot uses origin-root paths, and physical-phone installation/offline behavior needs HTTPS. No staging deployment was authorized or performed.

## Director approvals requested

- Local merge was directly authorized and completed; no further merge permission is needed.
- Review the integrated game on available hardware and accept or request a targeted fix. This report leaves director review pending and makes no cultural/art/engine/business approval on the owner's behalf.

## Suggested next ticket

- One targeted real-device/browser validation ticket, followed by fixes based on observed failures. Reconcile stale planning status with director decisions separately. Neither task starts automatically.
