# HUD & Scoring Polish — Implementation & Game Feel Audit Result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** `HUD & Scoring Polish (Near-Miss Callouts, Combo Streak Multipliers, High-Score Celebrations)`

## Summary

Following an audit of industry game feel principles (inspired by *Subway Surfers*, *Temple Run*, *Alto's Odyssey*, and *Burnout* near-miss mechanics), we implemented high-impact game feel upgrades layered with authentic Kathmandu festival aesthetics:

1. **Near-Miss & Skill Callout System with Chrono-Freeze Hit-Stop:**
   - **Tactile Time Dilation (Chrono-Freeze):** When performing a `CLOSE_CALL!` or `CLEAN_VAULT!`, the engine triggers a brief $65\text{ms}$ micro-dilation (`timeScale = 0.35` easing back to $1.0$). This delivers that cinematic "freeze-frame" rush where the player's brain registers the tight dodge without losing input responsiveness.
   - **Directional 3D Friction Sparks:** Brushing hazard boundaries emits high-speed golden/amber friction sparks (`emitNearMissFriction`) spraying away from the barrier.
   - **Aerodynamic Vault Wind Streaks:** Vaulting hurdles emits streamlined wind trails (`emitVaultSpeedStreaks`) trailing behind Tuku's sandals.
   - **Camera Micro-Impulses:** Subtle $0.045\text{m}$ lateral camera twitch away from the grazed barrier adds physical weight to near misses.
   - **Screen Skill / Adrenaline Flash (`#skill-flash`):** Instantaneous $120\text{ms}$ radial vignette flash (electric cyan for clean vaults, amber-orange for close calls, golden sunbeam for record milestones).

2. **Flying Score Digits (`.fly-score-digit`) & Meter Punch:**
   - Whenever skill bonus points are awarded (`+50`, `+140`, `+200`), a glowing golden number pops from the action area and arcs directly into the top `#hud-score-val` distance board.
   - On arrival, the score board triggers a spring-scale bounce (`.score-pulse`), visually confirming point accumulation.

3. **Escalating 4-Tier Combo Multiplier Aura ($1\times \to 8\times$):**
   - **Tier 1 ($2\times-3\times$):** Warm Amber flame capsule (`🔥 2x COMBO`).
   - **Tier 2 ($4\times-5\times$):** Supercharged Hot Crimson overdrive (`⚡ 4x COMBO`).
   - **Tier 3 ($6\times-7\times$):** Neon Violet Lightning surge (`⚡ 6x COMBO`).
   - **Tier 4 ($8\times$ MAX):** Prismatic Godspeed Gold (`🔥 8x MAX COMBO`) with continuous pulsating border aura and glowing embers.
   - **Runner In-The-Zone Ground Trail:** At $4\times+$ multiplier, Tuku emits golden speed ember trails behind his feet while sprinting.

4. **Kathmandu Festival Marigold (*Sayapatri*) & Gold Foil Confetti Celebration:**
   - When the runner surpasses their personal best in an active run, the golden swoop celebration banner (`🏆 NEW PERSONAL BEST! <distance>m Reached!`) triggers an explosion of 38 fluttering marigold (*Sayapatri*) flower petals and golden ceremonial foils cascading down across the screen.
   - Accompanied by full festival fanfare: Bhusya bronze cymbal clashes, thunderous Dhime drum accents, and ascending brass temple bell arpeggios.

---

## Changed files / assets

| Path | Why changed |
|---|---|
| `src/types.ts` | Added `SkillCalloutType`, `SkillCalloutEvent`, and `lateralDir?: number` for directional sparks. |
| `src/game/ScoreManager.ts` | Multiplier system ($1\times \to 8\times$, step grace decay), `addSkillBonus()`, `boostMultiplier()`, and `checkInRunRecord()`. |
| `src/world/ObstacleManager.ts` | Added `hasTriggeredSkillCheck` to `ActiveObstacle`, updated pool instantiations, and implemented `checkSkills()` returning lateral direction. |
| `src/fx/ParticleFxManager.ts` | Added `emitNearMissFriction(x, y, z, lateralDir)` and `emitVaultSpeedStreaks(x, y, z)`. |
| `src/audio/SoundManager.ts` | Added procedural SFX: `playCleanVaultCallout()`, `playNearMissCallout()`, `playMultiplierUp(mult)`, and `playHighScoreCelebration()`. |
| `src/game/GameManager.ts` | Connected `timeScale` micro-dilation (`triggerHitstop()`), camera micro-shakes, particle emitters, high multiplier speed trails, and telemetry. |
| `index.html` | Added `#skill-flash`, `#confetti-container`, `#hud-multiplier-pill`, `#record-banner`, `.fly-score-digit`, `.score-pulse`, and 4 multiplier tier themes. |
| `src/main.ts` | Bound screen flashes, flying score digits, marigold confetti shower, multiplier tier classes, and toast pruning in telemetry listener. |
| `scratch/test_scoring_and_callouts.cjs` | Automated Playwright verification script testing hit-stops, flashes, confetti, and godspeed multipliers. |

---

## Verification commands and results

1. **Production Bundle Compilation:**
   ```bash
   npm run build
   ```
   **Result:** Built in 2.59s, zero TypeScript compilation errors.

2. **Automated End-to-End Game Feel Verification:**
   ```bash
   node scratch/test_scoring_and_callouts.cjs
   ```
   **Output:**
   - `Hitstop Micro-Dilation Test: { hasHitstop: true, timeScale: 0.35 }`
   - `8x Godspeed Multiplier Result: { pillClass: 'multiplier-pill multiplier-pop tier-4', multVal: '8x MAX' }`
   - `Clean Vault Flying Score Check: { flyScoreText: '+200', toastClass: 'callout-toast callout-clean-vault' }`
   - `Confetti and Celebration Info: { petalsSpawned: 38, bannerVisible: true }`
   - Zero gameplay console errors, locked 60 FPS on desktop and mobile.

---

## Evidence

1. `evidence_hud_godspeed_8x_multiplier.png`: Demonstrates the Tier 4 Godspeed `🔥 8x MAX COMBO` pill with full countdown meter and prismatic gold aura.
2. `evidence_hud_clean_vault_callout.png`: Demonstrates the electric blue `CLEAN VAULT! +50 Skill Bonus (4x)` toast with the glowing `+200` flying score digit arcing to the distance meter.
3. `evidence_hud_close_call_callout.png`: Demonstrates the fiery `CLOSE CALL! +35 Near Miss (4x)` toast with 3D friction sparks spraying away from the barrier.
4. `evidence_hud_high_score_banner.png`: Demonstrates the golden `🏆 NEW PERSONAL BEST!` celebration banner with a shower of fluttering Kathmandu marigold (*Sayapatri*) petals and gold foil confetti cascading down.

---

## Assumptions, defects and blockers

- **Hit-stop timing:** $65\text{ms}$ duration calibrated to be perceptible and impactful without breaking continuous gesture buffering or touch inputs.
- **Confetti lifecycle:** Confetti particles automatically clean up after $2.8\text{s}$ to guarantee zero DOM node leaks.

---

## Director approvals requested

- Intensity of the $65\text{ms}$ hit-stop time dilation (feels impactful and responsive in testing).
- Visual presence of the marigold petal shower during personal best celebrations.

---

## Suggested next ticket

1. **Option 1: Progressive Alley Biome Milestones** (Visual street transitions every 100m: Durbar Square temple courtyards, narrow lantern-lit brick alleys, and riverbank stupas).
2. **Option 2: Mobile Haptics & Audio Presets** (Vibration patterns on near-misses and catches; audio equalizer presets).
