# PHASE 3 — Biome-Specific Environmental Hazards & Landmark Props Result

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-10-10  
**Ticket:** Phase 3: Biome-specific environmental hazards & landmark props (river causeway bridge ropes, ghat wooden steps, Himalayan fluttering prayer flag wind currents)

## Summary

Implemented procedural 3D hazards and landmark props tailored dynamically to each of the 3 biomes, complete with clearance mechanics, dynamic particle feedback, synthesized audio cues, and skill callouts:

1. **Biome 2 (Sacred River Causeway) Hazards & Props:**
   - **`GHAT_STEPS` (Stepped Boardwalk Plinth & Broken Gap):** Weathered Sal timber boardwalk plinth with antique brass corner brackets ($Y \in [0.0, 0.44\text{m}]$) and shimmering river water foam underneath. Requires parkour vault jump. Clean vault emits splashing river droplets and plays synthesized water splash SFX (`playWaterSplash()`).
   - **`BRIDGE_ROPE` (Suspension Bridge Cable & Twin Pylons):** Heavy timber suspension pylons spanning lane with braided low-slung sagging hemp cables ($Y \in [0.72, 1.65\text{m}]$) and twin swinging brass fisherman oil lamps. Dynamic sinusoidal lantern inertia sway. Standing runner collides; sliding runner cleanly glides underneath with custom metallic-hemp friction audio (`playBridgeRopeSound()`).

2. **Biome 3 (Himalayan Temple Hill) Hazards & Props:**
   - **`PRAYER_FLAG_GALE` (Himalayan Crosswind Pennant Gust):** Weathered golden bamboo flagpoles strung with traditional 5-color Tibetan *Lung-ta* prayer flags (Blue, White, Red, Green, Yellow) and translucent mountain wind ribbon ($Y \in [0.70, 1.65\text{m}]$). Dynamic fluttering animation along X/Y axes (`sin(8.5t + f)`). Sliding runner ducks under gale, triggering `WIND_GUST_EVADED` / `WIND SLIP! (+60)` callout, Himalayan gale whistle audio (`playWindGaleSound()`), and 5-color lung-ta wind streaks.

3. **Biome-Aware Spawning & Fairness Guarantees:**
   - Integrated coordinate-based biome calculation in `ObstacleManager.spawnHazardRow(z)`: derives `biomeIdx` (0 = Durbar Alley, 1 = Causeway, 2 = Temple Hill) using `RoadView.TOTAL_CYCLE_LENGTH = 420m` and `BIOME_LENGTH = 140m`.
   - Each biome spawns its thematic hazards, maintaining 100% fairness (always $\ge 1$ lane completely clear or vault/slide accessible).

4. **Zero-Allocation Memory Architecture & Nonviolent Framing:**
   - Pre-allocated object pools of 6 entities each for `GHAT_STEPS`, `BRIDGE_ROPE`, and `PRAYER_FLAG_GALE` with in-place AABB bounds mutation.
   - Preserved respectful, friendly guardian challenge framing: game-over collisions describe stumbles on specific hazards followed by Lakhey's friendly catch.

---

## Changed files / assets

| Path | Why changed |
|---|---|
| `src/types.ts` | Added `'BRIDGE_ROPE'`, `'GHAT_STEPS'`, `'PRAYER_FLAG_GALE'` to `ObstacleType`; added `'WIND_GUST_EVADED'` to `SkillCalloutType`. |
| `src/audio/SoundManager.ts` | Synthesized procedural Web Audio SFX: `playWaterSplash()`, `playBridgeRopeSound()`, `playWindGaleSound()`. |
| `src/fx/ParticleFxManager.ts` | Added `emitWaterSplash(x, y, z)` (river water drops) and `emitWindGaleStreaks(x, y, z)` (Tibetan 5-color lung-ta wind ribbon particles). |
| `src/world/ObstacleManager.ts` | Created pre-allocated pools for 3 hazards, implemented dynamic sway/flutter animations, biome-aware `spawnHazardRow(z)`, AABB collision/clearance bounds, and skill callouts. |
| `src/runner/PlayerController.ts` | Added `teleportZ(z)` helper for testing and track positioning. |
| `src/game/GameManager.ts` | Hooked obstacle SFX/FX callbacks, wired skill callouts (`WIND_GUST_EVADED`, `GHAT_STEPS`, `BRIDGE_ROPE`), and added specific collision reactions. |
| `src/main.ts` | Added `callout-wind-evaded` toast class, `WIND_GUST_EVADED` screen flash, and game-over modal obstacle descriptions. |
| `index.html` | Added `.callout-wind-evaded` CSS badge with cyan/indigo mountain wind shimmer gradient. |
| `scratch/test_phase3_biome_hazards.cjs` | Comprehensive automated Playwright test for spawning, collision, clearance, animations, and screenshot evidence. |
| `scratch/test_modal_labels.cjs` | Automated verification of Game Over modal obstacle descriptions. |

---

## Verification commands and results

1. **TypeScript & Production Build:**
   ```bash
   npm run build
   ```
   **Result:** `tsc && vite build` passed cleanly with 0 TypeScript errors in 2.96s.

2. **Automated Playwright Phase 3 Biome Hazards Test:**
   ```bash
   node scratch/test_phase3_biome_hazards.cjs
   ```
   **Output:**
   - Pool counts verified: 6 `GHAT_STEPS`, 6 `BRIDGE_ROPE`, 6 `PRAYER_FLAG_GALE` pre-allocated.
   - `GHAT_STEPS`: Collides standing ($Y \in [0, 1.0\text{m}]$); cleanly vaulted over ($Y \ge 0.92\text{m}$) yielding `CLEAN_VAULT` + water splash.
   - `BRIDGE_ROPE`: Collides standing; cleanly cleared sliding ($Y \le 0.38\text{m}$) yielding `CLEAN_SLIDE` + suspension cable sound.
   - `PRAYER_FLAG_GALE`: Collides standing; cleanly cleared sliding yielding `WIND_GUST_EVADED` + wind gale sound + ribbons.
   - Biome distribution verified: Causeway spawns `GHAT_STEPS` & `BRIDGE_ROPE`; Temple Hill spawns `PRAYER_FLAG_GALE`.
   - Dynamic animations verified: Lantern sway ($\Delta \theta = 15.1^\circ$), flag flutter ($\Delta \theta = 34.4^\circ$).

3. **Game Over Modal Label Formatting Test:**
   ```bash
   node scratch/test_modal_labels.cjs
   ```
   **Result:**
   - `GHAT_STEPS`: `"Stumbled on Ghat Wooden Steps in CENTER (0). Lakhey caught up with friendly respect!"`
   - `BRIDGE_ROPE`: `"Stumbled on Suspension Bridge Cable in CENTER (0). Lakhey caught up with friendly respect!"`
   - `PRAYER_FLAG_GALE`: `"Stumbled on Himalayan Prayer Flag Gale in CENTER (0). Lakhey caught up with friendly respect!"`

---

## Browser and device tests

- **Tested:** Desktop Google Chrome (headless & headful, 440x860 mobile viewport emulated), Playwright automation runner — passed 100%.
- **Tested:** Microsoft Edge — passed.
- **Not tested:** Physical iOS Safari / Android Chrome touch devices (tested via touch-event emulation).

---

## Evidence

- **Causeway Ghat Steps & Bridge Rope:** `scratch/evidence_phase3/01_causeway_ghat_steps_and_bridge_rope.png`
- **Temple Hill Prayer Flag Gale:** `scratch/evidence_phase3/02_temple_hill_prayer_flag_gale.png`
- **Wind Slip Callout Toast:** `scratch/evidence_phase3/03_wind_gust_evaded_callout_toast.png`

---

## Assumptions, defects and blockers

- **Assumptions:** 140m per biome cycle length is preserved as established in Phase 1. Obstacle lookahead is 75m to maintain consistent density without CPU overhead.
- **Defects:** None detected. Zero console runtime exceptions or unhandled rejections.
- **Blockers:** None.

---

## Director approvals requested

1. Confirmation that the clearance heights ($0.44\text{m}$ for ghat steps jump hurdle; $0.70\text{m}$–$0.72\text{m}$ for rope/flag slide low-profile) feel balanced on physical playtests.
2. Sign-off on the 5-color Tibetan *Lung-ta* flag palette and procedural hemp cable aesthetic.

---

## Suggested next ticket

- Phase 4: Biome transition cinematic fanfare & Torana milestone celebrations (ceremonial Ghanti bell ring chime, marigold petal bursts when crossing 140m/280m/420m thresholds).
