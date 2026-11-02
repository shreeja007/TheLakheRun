# T016 — Implementation Result: Tuku Mid-Run "Turn and Tease" Mechanic

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-11  
**Ticket:** `tasks/T016_TUKU_MID_RUN_TEASE.md` (Spirited Mid-Run Turn and Tease Mechanic)

---

## Summary

Implemented the interactive mid-run "turn and tease" trickster mechanic for Tuku during the endless sprint chase against the Lakhey guardian:

1. **Kinematic 180° Spin-Turn and Backpedal:**
   - **Entry Spin (0.00s -> 0.22s):** Smoothstep yaw rotation ($0^\circ \to 180^\circ$) while maintaining full sprinting momentum along the alleyway.
   - **Backpedal Taunt Hold (0.22s -> 1.32s, 1.1s duration):** Tuku sprints backwards facing Lakhey and the player camera directly, displaying his expressive face, cheeky smile, and athletic backpedal stride.
   - **Exit Spin (1.32s -> 1.54s):** Smoothstep yaw rotation ($180^\circ \to 0^\circ$) seamlessly blending arm and leg joint kinetics back into full forward sprint.

2. **Three Expressive Taunt Gestures (Randomly Selected on Activation):**
   - **Variant 0 ("Catch Me If You Can!"):** Playful one-handed wave beckoning Lakhey with the other hand cockily planted on hip, cheeky head tilt and smirk.
   - **Variant 1 ("Festival Taunt!"):** Energetic double-handed syncopated festival wave with rhythmic double-nod bouncing to Dhime beats.
   - **Variant 2 ("Too Fast For You!"):** Confident right thumb pointing proudly to chest with athletic chin-up glance and strut posture.

3. **Guardian Dynamic Reaction & Risk/Reward:**
   - Lakhey responds directly to the mid-run taunt with a provoked roar (`playGuardianRoarExertion()`) and surges closer (`surgeCloser(2.6)`), elevating chase intensity and near-miss tension.
   - Player is rewarded with `+150` bonus points, a combo multiplier upgrade, and celebratory golden toast callouts (`😜 "CATCH ME IF YOU CAN!"`, `🙌 FESTIVAL TAUNT!`, `😎 "TOO FAST FOR YOU!"`).

4. **Zero-Latency Instant Cancel:**
   - If the player presses Jump, Slide, or Dodge Left/Right at any point during a tease, `cancelTease()` immediately resets yaw to $0^\circ$ and executes the evasion maneuver with zero input lag.

---

## Changed files / assets

| Path | Why changed |
|---|---|
| [`src/types.ts`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/src/types.ts) | Added `'TEASE'` to `InputAction`, added `'TEASE_TAUNT'` to `SkillCalloutType`, and added `isTeasing` to `PlayerTelemetry`. |
| [`src/audio/SoundManager.ts`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/src/audio/SoundManager.ts) | Added `playTeaseTaunt()` procedural audio method (syncopated festival whistle E6->G6 + Bhusya cymbal brush). |
| [`src/runner/PlayerController.ts`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/src/runner/PlayerController.ts) | Implemented `triggerTease()`, `cancelTease()`, 180° spin yaw interpolation, backpedal leg kinetics, 3 procedural gesture variations, and fail-safe instant cancels on dodge/jump/slide/collision. |
| [`src/input/InputManager.ts`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/src/input/InputManager.ts) | Mapped keyboard `KeyT` and `KeyE` to trigger `'TEASE'` action. |
| [`src/game/GameManager.ts`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/src/game/GameManager.ts) | Handled `'TEASE'` action in `handleAction()`, triggered player taunt, provoked Lakhey surge/roar, awarded +150 bonus points & combo multiplier bump, and dispatched skill callout event. |
| [`index.html`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/index.html) | Added dedicated `😜 Tease (T)` touch/click button in bottom actions row, added tease hint pill on ready banner, and added `.callout-tease-taunt` vibrant amber/gold CSS styling. |
| [`src/main.ts`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/src/main.ts) | Wired `btn-tease` click listener to `game.triggerAction('TEASE')` and mapped `TEASE_TAUNT` to golden screen flash and toast callout badge. |
| [`viewer_tuku.html`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/viewer_tuku.html) | Added interactive test buttons for all three taunts (`😜 Taunt 1: Beckon`, `🙌 Taunt 2: Double Wave`, `😎 Taunt 3: Chest Thump`) and integrated tease update loop in the 3D character inspector. |
| [`scratch/test_tuku_midrun_tease.cjs`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/test_tuku_midrun_tease.cjs) | Playwright automated test script verifying all 3 viewer taunts, live in-game chase tease, and zero-latency jump cancel. |

---

## Verification commands and results

1. **TypeScript compilation & Vite bundle build:**
   ```powershell
   cmd /c npm run build
   ```
   **Output:**
   ```
   ✓ 1272 modules transformed.
   dist/index.html                           36.95 kB
   dist/viewer_tuku.html                      3.10 kB
   ✓ built in 3.74s
   ```
   Exited with code 0. Zero TypeScript linter or compilation errors.

2. **Automated Playwright visual and kinematic testing:**
   ```powershell
   node scratch/test_tuku_midrun_tease.cjs
   ```
   **Output:**
   ```
   --- 1. Testing Tuku Viewer Tease Animations ---
   Testing Taunt 1: Beckon Wave...
   Saved evidence_tuku_tease_01_beckon_wave.png
   Testing Taunt 2: Double-Hand Wave...
   Saved evidence_tuku_tease_02_double_wave.png
   Testing Taunt 3: Confident Chest Thump...
   Saved evidence_tuku_tease_03_chest_thump.png
   Saved evidence_tuku_tease_04_persp_beckon.png
   --- 2. Testing In-Game Live Sprint Chase Tease ---
   Triggering in-game mid-run tease via key T...
   Saved evidence_tuku_tease_05_ingame_chase.png
   Telemetry during tease: {
     state: 'RUNNING',
     isTeasing: true,
     variant: 1,
     multiplier: 2,
     distance: 23.44m,
     guardianDist: 2.85m
   }
   Testing zero-latency instant cancel via jump...
   Telemetry after instant jump cancel: { isTeasing: false, isJumping: true }
   Saved evidence_tuku_tease_06_instant_cancel.png
   All tests completed successfully!
   ```

---

## Browser and device tests

- **Tested:** Windows 11, Chromium (Chrome/Edge headless via Playwright), full render test at 1280x720 (2x DPR). Verified smooth 180° yaw turn, responsive backpedal stride, callout banner display, Lakhey surge, and instant jump cancellation.
- **Untested:** Physical iOS/Android mobile hardware touch gestures (touch HUD button tested via standard click/pointer events).

---

## Evidence

- [`scratch/evidence_tuku_tease_01_beckon_wave.png`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/evidence_tuku_tease_01_beckon_wave.png) — Gameplay camera view of Taunt 1 (Beckon Wave: one hand beckoning, one hand on hip, front face visible).
- [`scratch/evidence_tuku_tease_02_double_wave.png`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/evidence_tuku_tease_02_double_wave.png) — Gameplay camera view of Taunt 2 (Double-Handed Festival Wave).
- [`scratch/evidence_tuku_tease_03_chest_thump.png`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/evidence_tuku_tease_03_chest_thump.png) — Gameplay camera view of Taunt 3 (Confident Chest Thump / Thumb-to-Chest).
- [`scratch/evidence_tuku_tease_04_persp_beckon.png`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/evidence_tuku_tease_04_persp_beckon.png) — 3/4 perspective hero view of backpedal stride and beckon gesture.
- [`scratch/evidence_tuku_tease_05_ingame_chase.png`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/evidence_tuku_tease_05_ingame_chase.png) — Live in-game sprint chase showing Tuku running backwards facing camera/Lakhey, Lakhey surging close behind (2.7m), with the `🙌 FESTIVAL TAUNT! Daring Stride Taunt (+150)` callout toast.
- [`scratch/evidence_tuku_tease_06_instant_cancel.png`](file:///c:/Users/ACER/Desktop/lakhey-run-planning_antigravity/scratch/evidence_tuku_tease_06_instant_cancel.png) — Instant cancel verification: player jumped mid-tease, and Tuku immediately spun forward into a vault with zero latency.

---

## Assumptions, defects and blockers

- **Assumptions:** Teasing is intentionally restricted to grounded running state (`!isJumping && !isSliding && !isStumbling`) so players cannot trigger conflicting air/slide postures simultaneously.
- **Defects:** None identified.
- **Blockers:** None.

---

## Director approvals requested

- Review the three taunt animations and the +150 score / multiplier reward tuning.
- Confirm button placement for `😜 Tease (T)` on touch HUD.

---

## Suggested next ticket

- **T017: Lakhey Gesture Reaction & Voice Polish:** Add ceremonial chāmara flick reaction when Lakhey is taunted and polish Dhime tempo surge during active tease.
