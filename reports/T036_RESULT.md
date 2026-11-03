# T036 — Tuku movement fixes and edge-bump rule

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-11-03  
**Ticket:** `tasks/T036_TUKU_MOVEMENT_FIXES_AND_EDGE_BUMP.md`

## Summary

Fixed the movement defects found in the T035 audit, phase by phase, and added the owner-requested edge-bump rule. Work is on branch `fix/t036-tuku-movement` (from `46c8641`), uncommitted.

- **Phase 1 — frame rate (M1, M7):** the lane-change spring now uses the exact critically damped solution. Same spring constant (ω = 26), so the 60 fps feel is unchanged, but it no longer diverges at 30 fps or lower. Bank smoothing is now frame-rate independent; camera shake is normalized by its own duration.
- **Phase 2 — visual pops (M2, M3, M4):** the dive-roll slide now turns around the tucked body centre (0.55 m above the hip), so the body stays above the road. Its lowest point mid-roll moved from −1.04 m to +0.06 m. Sliding out of a jump now slams down over 120 ms instead of teleporting, and any leftover flip or spin unwinds over the same time; the low slide hitbox still applies immediately. The slide camera dip eases in and out (~200 ms) instead of popping 0.42 m in one frame.
- **Phase 3 — feedback and input (M5, M9, M6):** a buffered jump now plays its jump sound and picks a new style. Held arrow/WASD keys no longer auto-repeat lane changes or slides. When one frame moves Tuku more than 0.5 m (below ~30 fps at top speed), collision is also tested at intermediate positions, so slow frames can't step over a barrier.
- **Phase 4 — edge bump (new rule):** swiping or pressing toward a side Tuku can't go (right in the right lane, left in the left lane) now causes:
  - a visible knock toward the edge (about 0.3 m, with a tilt)
  - a thud, Lakhey's roar and a camera shake
  - a skid puff at the edge
  - a red HUD warning, "Blocked! Lakhey's closing in"
  - Lakhey surging to 2.2 m

  A second edge bump **while Lakhey is still close** (before he drifts back to his normal 4.2 m, about 9 s of clean running) triggers the usual friendly catch and game over. The results screen then reads "Bumped the road edge again in … while Lakhey was close." After Lakhey has recovered, the next bump counts as a first bump again. Clean vaults or slides push Lakhey back, which shortens the danger window.

**Not changed:**
- touch multi-swipe re-anchoring (M8) and the running-bounce frequency (M10)
- speed ramp, jump height/duration, obstacle spacing, hitbox sizes and obstacle rules
- art, models and audio assets (the bump reuses the existing landing thud and Lakhey roar)
- deployment

## Changed files / assets

| Path | Why changed |
|---|---|
| `src/runner/PlayerController.ts` | Exact lane spring; exponential bank smoothing; shake duration; jump-to-slide slam with flip/spin unwind; dive-roll body-centre pivot; eased slide camera; buffered-jump callback; edge-bump knock and callback; reused camera look-at vector; reset of new state |
| `src/game/GameManager.ts` | Subdivided collision for long frames; shared friendly catch routine; edge-bump strike rule, warning callout and feedback; strike reset on retry/reset; debug input text |
| `src/runner/GuardianController.ts` | `hasRecoveredFollowDistance()` used by the strike rule |
| `src/input/InputManager.ts` | Ignore key auto-repeat for lane and slide keys (jump already ignored it) |
| `src/types.ts` | `EDGE_BUMP` callout type and game-over cause |
| `src/ui/RunFeedback.ts`, `src/ui/mobile.css` | Edge-bump warning shown at priority 2 with red styling |
| `src/main.ts` | Results text for an edge-bump catch |
| `scripts/test-movement.mjs`, `package.json` | New movement regression suite, `npm run test:movement` |
| `tasks/T036_…md`, `tasks/00_TASK_INDEX.md`, `reports/T036_RESULT.md`, `reports/evidence/T036/` | Ticket tracking and evidence |

## Verification commands and results

- `npx tsc --noEmit -p .`: PASS.
- `npm run build`: PASS; 33 offline files, 11,386,839 bytes, version `b3ca42cee5607c18`. Large-chunk warning unchanged.
- `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4190 --strictPort`: local preview only, stopped afterward.
- `npm run test:movement` (with `UI_TEST_URL=http://127.0.0.1:4190`): **PASS**. Results are in `evidence/T036/movement-verification.json`:
  - **Lane change** at 24, 30, 60 and 120 fps: finite, 0 overshoot, at the target (x = 2.0) by 600 ms. Before the fix it diverged at 30 and 24 fps.
  - **Lowest Tuku mesh point** (AABB-based, conservative):
    - glide slide −0.10 m, dive roll −0.13 m, knee slide −0.18 m; these minima are knee contact at slide entry and are unchanged
    - dive roll mid-roll +0.06 m (was −1.04 m)
    - jumps −0.01, −0.09 and −0.08 m
  - **Mid-air slide:** the hitbox is low (0.38 m) immediately; the largest drop is 0.44 m per frame (was 1.62 m in one frame); grounded within 8 frames.
  - **Slide camera:** largest per-frame change 0.10 m (was 0.40 m).
  - **Buffered jump:** 2 jump callbacks (was 1).
  - **Edge bump:**
    - first bump: still RUNNING, Lakhey 4.2 → 2.31 m, warning "Blocked! Lakhey's closing in"
    - second bump: CAUGHT immediately, then GAME_OVER with the edge-bump results text
    - left edge after recovery: strike clears after 8.87 s, and the next bump is a first bump again
  - **Held ArrowRight with auto-repeat:** one lane change, no bump.
  - **10 fps at 15.2 m/s (1.52 m per frame):** a barrier placed between frame positions is skipped with subdivision disabled (control) and caught with it enabled.
- `npm run test:ui` (with `UI_TEST_URL` and `UI_TEST_EVIDENCE_DIR=reports/evidence/T036/ui`): **18 checks passed**, Chrome 156.0.8078.79. This includes real collision/catch, touch swipes, tutorial, offline/worker and no page errors.
- `node scripts/test-polish.mjs`: **6 cases passed**, no page errors. The script writes to the T034 folder; outputs were copied to `evidence/T036/polish/` and the committed T034 evidence was restored with `git checkout -- reports/evidence/T034`.
- `git diff --check`: PASS (LF/CRLF notices only).

## Browser and device tests

- Tested: Windows, headless Chrome with SwiftShader software WebGL; fixed-step simulation at 24, 30, 60 and 120 fps; desktop and Pixel-style touch emulation in the existing suites.
- Not tested: physical phones. In particular: a phone throttled to 30 fps (iPhone Low Power Mode or Android battery saver), how the edge-bump feel reads on a real touch screen, Safari and Firefox.

## Evidence

- `evidence/T036/side-dive-roll-mid-after.png` — dive roll mid-roll, body above road (compare `evidence/T035/side-dive-roll-mid.png`).
- `evidence/T036/edge-bump-first.png` — red warning, Lakhey at 2.3 m.
- `evidence/T036/edge-bump-caught-results.png` — results screen after the second bump.
- `evidence/T036/movement-verification.json`, `evidence/T036/ui/`, `evidence/T036/polish/`.

## Assumptions and limits

- The edge bump counts any lane input toward a missing lane during a run, including mid-air, during a slide and during the intro sprint. A tap on the on-screen LEFT/RIGHT button counts the same as a swipe.
- Low-frame collision samples use the current frame's X/Y and obstacle positions (approximation only below ~30 fps). At 60 fps collision behaviour is unchanged.
- Knee contact at slide entry (≈ −0.1 to −0.18 m by AABB) existed before and was left as is.

## Director approvals requested

1. Play-test the edge bump on your phone: does the knock read clearly, and is the ~9 s danger window right?
2. If possible, test once with the phone in battery-saver or Low Power Mode to confirm lane changes are now smooth at 30 fps.
3. Accept, or ask for tuning (bump size, surge distance, danger window, warning text).

## Suggested next ticket

Real-device frame-rate and feel check on your Android phone (and an iPhone if available), including battery-saver mode, followed by any small tuning. Not started.
