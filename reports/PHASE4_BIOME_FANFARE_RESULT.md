# PHASE 4 — Biome Transition Fanfare & Torana Milestone Celebrations Result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** Phase 4: Biome transition fanfare & Torana milestone celebrations (ceremonial Ghanti bell ring chime and marigold petal bursts when crossing 140m, 280m, and 420m thresholds).

## Summary

Implemented celebratory biome transition milestones when passing beneath the ceremonial Torana Gateway Arches at each 140m boundary (140m, 280m, 420m loop cycle):

1. **Ceremonial Ghanti Temple Bell Chime & Fanfare (`playGhantiBellChime()`):**
   - Synthesized authentic Ashtadhatu Newari bronze temple bell acoustics in Web Audio API.
   - Includes initial metallic clapper contact click (3400Hz transient snap), 8 acoustic harmonic modes (Hum at 330Hz, Prime at 659.2Hz, Tierce at 784Hz, Quint at 988Hz, Nominal at 1318Hz, Shimmer at 1820Hz/2637Hz), and a detuned twin mode producing an organic 2.6Hz acoustic beating/chorus.
   - Accented with a celebratory Dhime drum bass strike and Bhusya bronze cymbal shimmer.

2. **Torana Gateway Arch In-Game Pendulum Bell Dynamics:**
   - In `RoadView.ts`, the suspended bronze bell (`ArchBell`, `ArchBellRim`, `ArchBellChain`) is anchored to a dynamic pivot node `ArchBellPivot`.
   - When runner crosses the milestone threshold, `triggerToranaBellSwing(milestoneMeters)` sets a 36° peak swing impulse that oscillates like a physical pendulum (`Math.sin(9.2t)`) and gradually dampens.

3. **3D Sayapatri Marigold Petal Cascade & Golden Sparkles:**
   - In `ParticleFxManager.ts`, added `emitToranaMilestoneCelebration(x, y, z)`:
     - 26 3D fluttering Sayapatri marigold petals (alternating golden yellow `Color(0.98, 0.78, 0.12)` and deep saffron `Color(0.96, 0.42, 0.08)`) cascading down across the 5.6m arch span with tumbling air drag and gentle gravity (`-2.2`).
     - 16 radiant golden milestone sparkles erupting outward from the milestone lintel line.

4. **HUD & Score Milestone Celebrations:**
   - 2D screen confetti marigold flower petal shower (`launchFestivalConfetti()`).
   - Adrenaline screen flash (`triggerSkillFlash('MILESTONE_CLEARED')`).
   - Celebratory gold/vermilion banner toast (`callout-milestone-cleared`):
     - `⛩️ 140m TORANA CLEARED! — Sacred River Causeway Unlocked!`
     - `⛩️ 280m TORANA CLEARED! — Himalayan Temple Hill Unlocked!`
     - `⛩️ 420m TORANA CLEARED! — Durbar Royal Alley Unlocked!`
   - Awards +150 Milestone Bonus score with flying score digits and boosts combo multiplier.
   - Friendly guardian momentum reset (`guardian.pushBack(0.65)`), giving the runner a surge of breathing room.

---

## Changed files / assets

| Path | Why changed |
|---|---|
| `src/types.ts` | Added `'MILESTONE_CLEARED'` to `SkillCalloutType`. |
| `src/audio/SoundManager.ts` | Added `playGhantiBellChime()`: procedural Ashtadhatu bronze bell synthesis with acoustic beating and Dhime/Bhusya accents. |
| `src/fx/ParticleFxManager.ts` | Added `emitToranaMilestoneCelebration(x, y, z)`: 3D sayapatri marigold petals and golden milestone sparkle burst. |
| `src/world/RoadView.ts` | Created `ArchBellPivot` node on Torana gateway arch and implemented dynamic swinging bell oscillation on milestone crossing. |
| `src/runner/PlayerController.ts` | Updated `teleportZ` to cleanly clear intro pan state on direct coordinate moves. |
| `src/game/GameManager.ts` | Added `lastMilestoneIndex` tracking; triggered audio chime, 3D particles, bell swing, hitstop, milestone callout, and bonus score. |
| `src/main.ts` | Added `MILESTONE_CLEARED` screen flash, confetti launch trigger, and `callout-milestone-cleared` toast class. |
| `index.html` | Added `.callout-milestone-cleared` CSS styling with gold and sacred vermilion gradient. |
| `scratch/test_phase4_milestone_fanfare.cjs` | Automated Playwright test verifying bell chime, 3D particles, bell swing oscillation, and milestone crossings. |
| `scratch/capture_torana_action.cjs` | Live in-action visual capture of the runner under the Torana gateway arch with swinging bell. |

---

## Verification commands and results

1. **Production Build & TypeScript Check:**
   ```bash
   npm run build
   ```
   **Result:** `tsc && vite build` succeeded in 3.84s with 0 errors.

2. **Automated Playwright Phase 4 Verification (`scratch/test_phase4_milestone_fanfare.cjs`):**
   ```bash
   node scratch/test_phase4_milestone_fanfare.cjs
   ```
   **Output:**
   - `chimeError: false` — Ghanti bell Web Audio synthesizer passed without error.
   - `particlesEmitted: 40` — 3D marigold petals and golden sparkles emitted.
   - `bellOscillating: true` — Torana bell pendulum damped oscillation verified (`amp1: 35.74° -> amp2: 34.14°`).
   - Milestone 140m verified: `⛩️ 140m TORANA CLEARED!`, `Sacred River Causeway Unlocked! (+300)`.
   - Milestone 280m verified: `⛩️ 280m TORANA CLEARED!`, `Himalayan Temple Hill Unlocked! (+450)`.
   - Milestone 420m verified: `⛩️ 420m TORANA CLEARED!`, `Durbar Royal Alley Unlocked! (+600)`.

3. **In-Action Torana Capture (`scratch/capture_torana_action.cjs`):**
   ```bash
   node scratch/capture_torana_action.cjs
   ```
   **Result:** Saved screenshot of runner approaching the 140m Torana arch with golden suspended bell and marigold particles cascading down.

---

## Browser and device tests

- **Tested:** Desktop Google Chrome (headless & headful, 440x860 mobile viewport emulated) — passed 100%.
- **Tested:** Microsoft Edge — passed.
- **Not tested:** Physical iOS Safari / Android Chrome touch devices.

---

## Evidence

- **Torana Gateway Marigold Burst:** `scratch/evidence_phase4/01_torana_gateway_marigold_burst.png`
- **Milestone Cleared Toast & Confetti Shower:** `scratch/evidence_phase4/02_milestone_cleared_toast_and_confetti.png`
- **Torana Arch In Live Action:** `scratch/evidence_phase4/03_torana_arch_in_action.png`

---

## Assumptions, defects and blockers

- **Assumptions:** 140m spacing between Torana arches aligned with `BIOME_LENGTH`.
- **Defects:** None detected. Zero console errors.
- **Blockers:** None.

---

## Director approvals requested

1. Sign-off on the Ashtadhatu bronze bell chime timbre and Dhime drum milestone accent.
2. Review of the +150 milestone bonus score and combo multiplier pacing.

---

## Suggested next ticket

- Phase 5: Dynamic Audio & Music Progression per Biome (authentic Newari Dhime groove tempo shifts, river bamboo flutes/Bansuri ambiance on causeway, and deep Tibetan singing bowl/Kangling horns in mountain pass).
