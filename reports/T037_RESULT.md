# T037 — Difficulty ramp

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-11-03  
**Ticket:** `tasks/T037_DIFFICULTY_RAMP.md`

## Summary

The run now keeps getting harder for about two minutes instead of flattening after 30 seconds. All numbers live in one file, `src/game/Difficulty.ts`, for easy tuning. Work is on branch `fix/t036-tuku-movement` on top of T036, uncommitted.

| Distance (≈ time) | Speed | Row every | Rows / min | Obstacles per row | Rows blocking 2+ lanes | Squeeze rows |
|---|---|---|---|---|---|---|
| 0–100 m (start) | 10.5 m/s | 2.3 s | 26 | 1.33 | 33 % | 0 % |
| 392 m (~31 s; old cap) | 15.2 m/s | 1.15 s | 52 | ~1.4 | ~37 % | ~3 % |
| 800 m (~55 s) | 16.8 m/s | 1.11 s | 54 | — | — | — |
| 1,200 m (~78 s) | 18.4 m/s | 1.07 s | 56 | 1.62 | 51 % | 12 % |
| 1,842 m+ (~2 min) | **21 m/s** (cap) | **1.0 s** | **60** | 1.82 | 63 % | 19 % |

Row statistics come from 600 generated rows per distance (values at 392 m interpolated). Before this ticket, everything after 392 m stayed at the 392 m line, with the start-of-run pattern mix.

**What changed:**
- **Speed:** unchanged up to 392 m. After that it keeps rising at 0.004 m/s per metre, up to 21 m/s at about 1,840 m.
- **Row frequency:** the time between rows shrinks from 1.15 s to 1.0 s. It never goes below 1.0 s, so after a full jump (0.65 s) there is still about 0.35 s to react before the next row.
- **Pattern mix:** single-hazard rows drop from 31.5 % to 10 %; double rows rise from 30 % to 35 %.
  - **New squeeze rows** appear after about 250 m and reach 22 % of rows at full difficulty: two tall blocks plus one lane that needs a jump or a slide. Each biome uses its own passable obstacle:
    - Durbar alley: low barrier or overhead beam
    - River causeway: ghat steps or bridge rope
    - Temple hill: prayer-flag gale or low barrier
  - Pulu Kisi and sliding gates drop slightly to make room.
- **Feel of speed:** the camera field of view keeps widening, from 63° to 67°, between 15.2 and 21 m/s. Before, it stopped at 16 m/s.
- **Obstacle pools:** the tall-block pool grew from 8 to 12, because each squeeze row uses two.

**Not changed:** jump and slide timing, hitboxes, obstacle art, scoring, coins, Lakhey's chase rules, and anything in the first 392 m.

## Changed files

| Path | Why changed |
|---|---|
| `src/game/Difficulty.ts` (new) | Speed, row spacing and row-pattern weights by distance |
| `src/game/GameManager.ts` | Uses `runSpeedAt` / `rowSpacingAt` instead of the inline caps |
| `src/world/ObstacleManager.ts` | Distance-based pattern weights; squeeze row with a pool-safe fallback; `pickPassableHazard`; tall-block pool 8 → 12 |
| `src/runner/PlayerController.ts` | Camera field of view continues widening up to 21 m/s |
| `scripts/test-movement.mjs` | Difficulty curve, row-density and fairness checks |
| `tasks/T037_DIFFICULTY_RAMP.md`, `tasks/00_TASK_INDEX.md`, `reports/T037_RESULT.md`, `reports/evidence/T037/` | Tracking and evidence |

## Verification commands and results

- `npx tsc --noEmit -p .`: PASS. `npm run build`: PASS; 33 offline files, 11,387,833 bytes, version `13832ac150aa945f`.
- `MOVEMENT_EVIDENCE_DIR=reports/evidence/T037 npm run test:movement` (with `UI_TEST_URL=http://127.0.0.1:4190`): **PASS**. All T036 movement and edge-bump checks pass, plus:
  - **Curve:** speed and spacing at 0 m and 200 m are identical to the original (10.5 m/s and 24 m; 12.9 m/s and 20.4 m). Speed never decreases. It reaches 21 m/s at 1,842 m and holds at 3,000 m. Time between rows is never under 0.99 s.
  - **Rows:** 2,400 rows were generated with the real spawner, 600 each at 100, 600, 1,200 and 2,000 m. Obstacles per row went from 1.33 to 1.82; squeeze rows from 0 % to 19 %. **Zero rows had all three lanes walled** (tall blocks or sliding gates).
- **Real 1,500 m simulated run** (`evidence/T037/long_run.mjs`, 60 fps, collisions off to survive): 96 s, ending at 19.6 m/s. No obstacle failed to spawn because a pool was empty; at most 12 obstacles were active at once.
- `npm run test:ui`: **18 checks passed**, Chrome 156, evidence in `evidence/T037/ui/`.
- `node scripts/test-polish.mjs`: **6 cases passed**, no page errors. Output copied to `evidence/T037/polish/`; committed T034 evidence restored with `git checkout -- reports/evidence/T034`.

## Browser and device tests

- Tested: Windows, headless Chrome with SwiftShader; simulated runs only.
- Not tested: a human playing 1–2 minute runs on a real phone. Whether 21 m/s with a row every second is fun-hard or too hard is a feel question only playtesting can answer.

## Evidence

- `evidence/T037/real-run-1500m.png` — a real run at 1,500 m showing a squeeze row (two tall blocks, a rope to slide under) and another wall ahead. Tuku passes through the block only because collisions were turned off for this capture.
- `evidence/T037/movement-verification.json` (`difficulty` section), `long_run_output.json`, `ui/`, `polish/`.

## Assumptions and limits

- "Passable" in the fairness check means not walled by tall blocks or sliding gates. It does not prove a human can react to every sequence of rows; the minimum 1.0 s between rows is the safety margin.
- The spawn random sequence changed slightly (one fewer random draw per row), so the same seed now produces a different layout than before.
- Jump length grows with speed (13.7 m at 21 m/s), because jump time is fixed at 0.65 s.

## Director approvals requested

1. Play 2-minute runs on your phone and tell me whether the late game feels too easy, about right, or too hard.
2. Easy knobs in `Difficulty.ts`, if you want changes:
   - top speed (`MAX_RUN_SPEED`, 21)
   - how quickly it ramps (`LATE_SPEED_RATE`)
   - time between rows at full difficulty (`ROW_TIME_FULL`, 1.0 s)
   - squeeze-row share (22 %)

## Suggested next ticket

Real-device playtest and tuning pass for T036 and T037 together. Not started.
