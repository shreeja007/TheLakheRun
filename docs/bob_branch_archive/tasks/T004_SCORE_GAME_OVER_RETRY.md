# T004 — Scoring, collision failure and instant retry

**Status:** PLANNED  
**Milestone:** M2  
**Dependencies / approval:** T003 accepted; graybox one-hit end rule agreed for this milestone  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/02_GAMEPLAY.md`, `docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`

## Objective

Complete the smallest satisfying gameplay loop: run, dodge, distance score, lose, personal best, retry.

## In scope

- Display distance score (not coins) and a clean Game Over state on graybox collision.
- Save best distance locally when storage is available, and fail gracefully when unavailable.
- Add accessible Play and Retry actions with no full page reload; completely reset scene/session state.
- Ensure scoring is framerate independent and stops on Game Over.

## Out of scope

- No Lakhey distance mechanic yet.
- No online score service, accounts, currency, unlocks, celebratory cinematics.

## Acceptance criteria

- [ ] Score increases only during valid running and freezes after fail.
- [ ] Best score persists on browser reload where storage is allowed.
- [ ] Retry resets speed, road, score, obstacles, input handlers and player position; no duplicate listeners.
- [ ] Storage exceptions do not crash the game.

## Verification Codex must report

- Run multiple collision/retry cycles, reload and private mode/blocked localStorage test where feasible.
- Show short screen capture of Start → Run → Fail → Retry.

## Deliverables

- Playable graybox loop and concise verification report.

- A completion report at `reports/T004_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

Do not modify failure mechanic to two-strikes/guardian warning without director decision.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
