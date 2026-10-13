# Result Report: Subway Surfers-Style Teasing Intro & Game Continuation

**Ticket/Goal:** In the start show the runner teasing Lakhey (just like Subway Surfers), followed by smooth gameplay continuation.  
**Status:** Completed & Verified  

---

## 1. What Changed

### A. Tuku Playful Tease Standoff & Choreo (`src/runner/PlayerController.ts`)
- **Standoff Orientation & Offset:** Positioned Tuku at lateral offset $X = +0.45\text{m}$ (right of center) turned at `teaseYaw = 160.0°` to directly face Lakhey ($Z = +4.2\text{m}$) without blocking the camera's sightline.
- **Rhythmic Festival Taunt Dance:**
  - Right arm flexed into a playful, high-energy taunt wave directed at Lakhey: `setLocalEulerAngles(-78.0 + teaseWave * 0.2, 0, 34.0)` with rhythmic elbow flicking.
  - Left arm planted firmly on hip (`-16.0°`, elbow `-72.0°`).
  - Head nodding cheekily and grinning at Lakhey with dynamic pitch/yaw/roll sync.
  - Knee and hip bouncing to the festival drum beat.
- **3-Phase Intro Transition on Play / Space / Tap:**
  - **Phase 1 ($0.00\text{s} - 0.42\text{s}$): Climax Tease Leap** — Tuku leaps up ($+0.26\text{m}$ arc) throwing both arms wide in a celebratory festival dare (`"Catch me if you can!"`).
  - **Phase 2 ($0.42\text{s} - 0.85\text{s}$): 180° Spin Takeoff** — Tuku smoothly rotates from $160^\circ$ yaw to $0^\circ$ yaw while shifting from $X = 0.45$ to $0.0$, diving forward into a sprinter's low drive.
  - **Phase 3 ($0.85\text{s} - 1.45\text{s}$): Full Sprint Acceleration** — Acceleration curves up to standard speed as the camera locks into third-person trailing chase.
- **Consistent Reset Behavior:** Updated `reset()` to cleanly restore the $160^\circ$ yaw, $X = 0.45\text{m}$ position, and standoff joint rotations on game restart.

### B. Lakhey Standoff Presence & Reaction Stomp (`src/runner/GuardianController.ts`)
- **Watchful Festival Ready Pose:**
  - Right arm holds the sacred Chāmara (yak-tail fly-whisk) aloft, twitching rhythmically in challenge: `setLocalEulerAngles(32.0 + whiskFlick, whiskTilt, 0)`.
  - Left claw raised in an authoritative guardian guard.
  - Attentive head tilt observing Tuku's antics.
- **Provoked Reaction Stomp:**
  - Added `introStompTriggered` flag. At $0.18\text{s}$ (during Tuku's Climax Tease Leap), Lakhey delivers a heavy ground shockwave stomp and roar to the cobblestone pavement.

### C. Tease Speech Bubble & Non-Occluding UI (`index.html`)
- **Subway Surfers Tease Bubble:**
  - Added `.tease-bubble` with golden-orange gradient border, drop shadow, and floating pulse animation.
  - Text: `🏃 Tuku: "Catch me if you can, Lakhey Dai! 👹"`.
- **Framing & Viewport Optimization:**
  - Positioned `#ready-banner` with `margin-top: auto; margin-bottom: 14px;` directly above the bottom controls, ensuring 100% of the 3D viewport remains unobstructed for the two characters.

---

## 2. Verification & Playtest Evidence

- **Build Check:** Ran `tsc && vite build` — passed with 0 errors.
- **Automated Playwright Captures (`scratch/test_teasing_intro_capture.cjs`):**
  - `tease_01_ready_standoff.png`: Standoff state with Tuku actively facing and teasing Lakhey with the speech bubble visible.
  - `tease_02_climax_leap.png`: Climax tease leap at $0.22\text{s}$ with Lakhey stomping.
  - `tease_03_180_spin_takeoff.png`: 180° spin takeoff and camera banking roll.
  - `tease_04_active_sprint_chase.png`: Settled third-person sprint chase with obstacles, coins, and Newari street extending into distance.
  - `tease_05_reset_standoff.png`: Standoff tease cleanly restored on game reset.
- **Performance:** 60 FPS maintained, draw calls batched, console clean.

---

## 3. Assumptions & Cultural Framing

- Maintained respectful, friendly festival guardian dare framing per `AGENTS.md`. Tuku is a playful festival participant daring the guardian to a spirited chase, not disrespecting sacred ritual. Lakhey's response is an authoritative, proud guardian dance reaction.
