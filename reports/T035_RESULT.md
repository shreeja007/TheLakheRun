# T035 — Tuku movement and physics audit

**Implementation state:** COMPLETE (audit only; no code changed)  
**Director review state:** PENDING  
**Date:** 2026-11-03  
**Ticket:** `tasks/T035_TUKU_MOVEMENT_PHYSICS_AUDIT.md`

## Summary

Tuku's movement is **not fully optimized**. At 60 fps (the director's tested setup) it feels good: forward motion and jump/slide timing are delta-time based, swipes fire on pointer-move (low latency), there is a jump buffer, slide-cancel into jump, air lane-switching, and generous jump/slide clearances. But the audit found one critical frame-rate bug, one clearly visible animation defect, and several one-frame visual pops. All confirmed defects were reproduced in the production build (`npm run build`, local preview, headless Chrome) by stepping the real `GameManager.update()`.

Sources inspected: `src/runner/PlayerController.ts`, `src/input/InputManager.ts`, `src/game/GameManager.ts` (update loop, speed ramp, collision), `src/world/ObstacleManager.ts` (AABBs, `checkCollisions`, `checkSkills`), `src/world/RoadView.ts` (`LANE_X` = −2/0/+2 m), `src/main.ts` (dt clamp 0.1 s).

## Confirmed defects (reproduced)

| ID | Priority | Finding | Evidence | Proposed fix |
|---|---|---|---|---|
| M1 | **Critical** | Lane-change spring (`PlayerController.ts:502-517`, ω = 26, semi-implicit Euler) is numerically **unstable below ~31.4 fps**. At a steady 30 fps Tuku ends 120 m off the road after 1.5 s; at 24 fps position reaches 10¹⁰ m. Camera follows, so the screen shows empty sky. Phones commonly drop to or cap at 30 fps (e.g. iPhone Low Power Mode, thermal throttling, budget Android). | `lane_spring_sim_output.txt`; real build: `laneChange_30fps` x = 121.5 m, `laneChange_24fps` x = −1.4×10¹⁰ m; screenshot `lane-change-30fps-after-1.5s.png` | Replace the Euler step with the exact (analytic) critically damped update — same spring, same feel at 60 fps, stable at any frame rate. Simulated: settles in ~370–400 ms at 10–144 fps with zero overshoot. |
| M2 | High | **Dive-roll slide (slide style 1, ~1 in 3 slides) buries Tuku ~1 m under the road** mid-roll. Root pivots at hip height after the −0.38 m slide drop, then rotates 360°; head/torso go below ground. | Real build side view: lowest mesh Y = **−1.04 m**; `side-dive-roll-mid.png` shows only legs above road. Knee slide (style 2) −0.15 m, minor. | Raise the roll pivot / add vertical offset during roll so the body stays above the road, or make it a forward tuck roll. Visual choice for director. |
| M3 | Medium | **Slide during a jump teleports Tuku from up to 2.1 m to the ground in one frame** (`slide()` sets `currentY = GROUND_Y`). | Real build: player Y 2.09 → 0.47 in one 1/60 s frame. | Fast-drop over ~80–100 ms (short "slam"), keeping the slide hitbox active immediately so gameplay stays as forgiving as now. |
| M4 | Medium | **Camera drops 0.4 m in a single frame when a slide starts** and pops back when it ends (`slideCamOffset = isSliding ? -0.42 : 0`). | Real build: camera Y 4.20 → 3.80 in one frame. | Ease the camera offset in/out (~120 ms). |
| M5 | Medium | **Buffered jump is silent and repeats the same style.** When jump is pressed just before landing, the re-jump does not call `onJumpCb` (no jump sound) or pick a new style. | Real build: two jumps happened, `jumpCallbacks: 1`. | Fire the jump callback and randomize style for buffered jumps. |
| M6 | Low | **Collision can be skipped at very low frame rates.** Discrete AABB check; at top speed 15.2 m/s and the 0.1 s dt clamp Tuku moves 1.52 m/frame, larger than the 1.0 m player+barrier overlap window. Affects < ~15 fps only (in the player's favor). | Computed from `ObstacleManager.ts:1440-1474` and `getBounds()`; see sim output. | Swept Z check (previous Z → current Z) in `checkCollisions`; cheap. |

## Smaller feel/quality issues (source-confirmed, low risk)

| ID | Finding | Proposed fix |
|---|---|---|
| M7 | Bank smoothing `x += (t - x) * min(1, dt*26)` and camera shake (new random offset every frame) behave differently at 30/60/120 Hz. Shake normalizes by a hard-coded 0.25 s, so a 0.3 s shake starts at 120 % strength. | Exponential smoothing `1 - exp(-k·dt)`; normalize shake by its own duration. |
| M8 | Touch: one action per finger press (`swipeConsumed`). Players can't chain e.g. swipe-left then swipe-up without lifting the finger. | Re-anchor the swipe start after each recognized swipe (common runner behavior). Director preference. |
| M9 | Keyboard: holding Left/Right auto-repeats into a second lane change; holding Down re-slides with a one-frame standing gap (full-height hitbox for one frame). | Ignore `e.repeat` for lane/slide keys (as already done for jump). |
| M10 | Running bounce/camera bob use `|sin(2·stride)|`, i.e. two bounces per footstep; may read as vibration. | Verify visually; if confirmed use one bounce per step. |
| M11 | `isStumbling` pose is unreachable (every collision is an immediate catch). | Leave unless a stumble mechanic is approved; note only. |
| M12 | Two `new Vec3()` allocations per frame for camera `lookAt`. Negligible today. | Reuse one cached vector. |

## Design observations (director decisions, not bugs)

- **Speed plateau:** speed = 10.5 + 0.012 × distance, capped at 15.2 m/s, reached at 392 m (~31 s of running). Obstacle spacing also bottoms out at 17.5 m by ~360 m. After ~30 s there is no further difficulty growth.
- **Jump is fixed-time (0.65 s, 1.6 m):** jump length grows from 6.8 m to 9.9 m as speed rises. The arc `sin^0.78` is symmetric (the code comment says asymmetric); there is no faster fall, which many runners use for a snappier feel.
- **Slide can't be extended:** swiping down again during a slide is ignored.

## Verification commands and results

- `npm run build`: PASS; 33 offline files, 11,382,730 bytes, version `6da144e120cfb60a` (same as the accepted build).
- `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4190 --strictPort`: local preview only, stopped afterward.
- `node reports/evidence/T035/lane_spring_sim.mjs`: exact copy of the spring update; DIVERGED at 30/25/20/15/10 fps; stable at ≥ 35 fps; analytic alternative stable at all tested rates.
- `repro.mjs` (Playwright, real build, automatic update loop stopped, collisions stubbed out only to isolate movement): results quoted above; no page errors.
- `roll_side.mjs`: side-camera capture of slide styles 1 and 2 with model mesh AABB minimum.

## Browser and device tests

- Tested: Windows, headless Chrome with SwiftShader software WebGL, 900×600, stepping the game loop at fixed 60/30/24 fps.
- Not tested: physical phones at reduced frame rate (recommended once M1 is fixed: iPhone Low Power Mode or Android battery saver).

## Evidence

- `evidence/T035/lane-change-30fps-after-1.5s.png` — camera flown off the road after one lane change at 30 fps.
- `evidence/T035/side-dive-roll-mid.png` — dive roll mid-slide, body below road surface.
- `evidence/T035/side-knee-slide-mid.png` — knee slide comparison.
- `evidence/T035/lane_spring_sim_output.txt`, `lane_spring_sim.mjs`, `repro.mjs`, `roll_side.mjs`.

## Assumptions and limits

- Frame-rate figures come from fixed-step simulation of the real code; real devices have variable frame times, so a single slow frame causes a one-frame overshoot, while sustained ≤ 30 fps diverges.
- Director's playtest (D-016) likely ran at 60 fps, which is why M1 was not seen.

## Director approvals requested

1. Authorize a fix ticket for M1–M5 (recommended), optionally M6–M9.
2. Choose the dive-roll fix (raised roll vs. tuck roll) for M2.
3. Decide on touch re-anchoring (M8) and any design changes (speed plateau, faster fall, slide extension); none are assumed.

## Suggested next ticket

T036 — Fix Tuku movement defects M1–M5 (frame-rate-independent lane spring, dive-roll ground clipping, mid-air slide drop, slide camera easing, buffered-jump feedback) with regression tests at 24/30/60/120 fps. Not started.
