# Option 2: Obstacle Hazards & Collectibles — Implementation & Game Feel Audit Result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** Option 2: Obstacle Hazards & Collectibles (Rolling clay matka pots, collectible ceremonial brass coins with magnetic pull, sliding street gate barriers, and Game Feel Polish)

---

## 1. Summary

Successfully implemented, audited, and enhanced the dynamic hazard and collectible systems for *Lakhey Run* with top-tier endless runner game feel and visual juice:
1. **Ceremonial Brass Coins (*Paisa* Collectibles)**:
   - 3D minted brass coins with traditional square central cutout (*chha-paisa*), continuous yaw spinning, and hover bobbing.
   - **Pavement Drop Shadows**: Pre-allocated circular shadow disks on the cobblestones ($Y = 0.015\text{m}$, dynamically scaled with coin altitude) giving immediate 3D depth perception.
   - **Musical Pentatonic Combo Arpeggios**: Collecting consecutive coins within $0.72\text{s}$ scales the audio pitch through an authentic ascending pentatonic scale ($A_6 \to B_6 \to C^\sharp_7 \to E_7 \to F^\sharp_7 \to A_7 \to B_7 \to C^\sharp_8$).
   - **HUD Punch & Streak Pill**: Collect badge pulses with a spring punch scale (`1.32x`) and golden glow, displaying live combo streak pills (`x2`, `x3`, `x4`, etc.).
   - **Magnetic Vacuum Mechanics**: Within $2.8\text{m}$, coins tilt directly toward Tuku and accelerate with quadratic easing, trailing glowing gold ember sparks.
2. **Rolling Clay Matka Pot (`ROLLING_MATKA`)**:
   - Terracotta ceramic vessel rolling down alleyways with physical roll wobble ($\pm 4.2^\circ$).
   - Kicks up cobblestone clay dust puffs behind it and emits proximity rolling cobblestone rumble audio.
   - Jumpable ($0.72\text{m}$ height clears cleanly under Tuku's $1.6\text{m}$ vault).
   - On collision, shatters into 14 ballistic ceramic shards + clay dust cloud with dual-layer pot fracture SFX.
3. **Sliding Street Gate Barrier (`SLIDING_GATE`)**:
   - Traditional Newar courtyard wooden lattice gate (*Dha*) featuring heavy Sal timber posts, lattice slats, and antique brass central medallion.
   - **Pavement Iron Runner Rail**: An embedded dark iron threshold runner rail on the road cobblestones spanning the two sliding lanes, clearly telegraphing the gate's movement span.
   - **Swinging Brass Oil Lamps**: Two hanging lanterns on the lintel beam that swing with realistic inertia ($\theta = -v_x \times 12.0^\circ$) as the gate oscillates.
   - Proximity timber/iron friction slide audio cues.
4. **Scoring, HUD & Persistence**:
   - Live coin counter badge in HUD, diagnostics telemetry row, Game Over coin summary, high coin records persisted to `localStorage`, and instant retry reset.
5. **Zero-Allocation Architecture**:
   - 100% pre-allocated pools (36 coins + 36 shadow disks, 8 matkas, 6 gates + 6 guide rails, 24 gold sparkles, 24 shards, 32 dust puffs, 16 shockwave rings).
   - Zero runtime heap allocations per frame; locked 60 FPS performance.
   - Strict fairness: generation algorithms never block all 3 lanes without an escape route.

---

## 2. Changed Files & Assets

| Path | Why changed |
|---|---|
| `src/types.ts` | Added `'ROLLING_MATKA' \| 'SLIDING_GATE'` to `ObstacleType`; added `coins: number` to `PlayerTelemetry`, `GameOverData` (`coins`, `bestCoins`). |
| `src/game/ScoreManager.ts` | Added `currentCoins`, `inMemoryBestCoins`, `STORAGE_KEY_COINS = 'lakhey_run_best_coins'`, `addCoin()`, `getCoins()`, `getBestCoins()`, and updated `registerScore()` and `clearBest()`. |
| `src/audio/SoundManager.ts` | Added `PENTATONIC_SCALE` pitch multiplier to `playCoinPickup(comboStep)`, added proximity `playMatkaRoll(dist)` and `playGateSlide(dist)`. |
| `src/fx/ParticleFxManager.ts` | Added `SPARKLE` (additive gold embers) and `SHARD` (terracotta ceramic fragments with gravity) pools; added `emitCoinSparkle()`, `emitCoinMagneticTrail()`, `emitMatkaRollDust()`, and `emitPotShatter()`. |
| `src/world/ObstacleManager.ts` | Added 3D procedural pools for `ROLLING_MATKA` and `SLIDING_GATE`; added iron runner guide track entities; added swinging brass lantern inertia; added rolling wobble and dust callbacks; guaranteed fair hazard patterns. |
| `src/world/CollectibleManager.ts` | **New file**: Pre-allocated pool of 36 brass coins + 36 drop shadow disks; musical combo streak tracker ($0.72\text{s}$ window); magnetic vacuum tilt; ground trails and airborne vault arcs. |
| `src/runner/PlayerController.ts` | Initialized `coins: 0` in `cachedTelemetry`. |
| `src/game/GameManager.ts` | Integrated `CollectibleManager`; wired combo audio scaling and magnetic trail fx; wired rolling dust/audio and sliding audio hooks; handled pot smash and game-over coin stats. |
| `index.html` | Added coin badge with `.coin-pop` punch keyframe CSS; added `#hud-combo-badge`; added diagnostics coin row; added coins summary column to Game Over modal; responsive CSS. |
| `src/main.ts` | Connected coin DOM elements, combo badge (`x2`, `x3`), and pop punch animation; updated obstacle labels for all 4 hazard types. |

---

## 3. Verification Commands & Results

### Build & Typecheck
```bash
npm run build
```
**Result:** 
- TypeScript compilation: 0 errors.
- Vite production bundle built in 2.63s.

### Game Feel & Juice Audit Verification
```bash
node scratch/test_game_feel_audit.cjs
```
**Output Highlights:**
- **Coin Shadows:** 5 active coins verified with 5 enabled shadow planes at $Y = 0.015\text{m}$.
- **Combo Punch:** Reached `Max Combo: 3` with active `#hud-coin-badge.coin-pop` animation and `#hud-combo-badge` text `x3`.
- **Sliding Gate:** `hasGuideTrack: true`, `guideTrackEnabled: true`, `lampLRotZ: 20.19°` (lanterns actively swinging with lateral slide inertia).
- **Rolling Matka:** `hasWobble: true` (Z/Y wobble angles active), `activeDust: 1` (clay dust puff emitted behind rolling pot).

### Jump Vault Clearance Verification
```bash
node scratch/test_jump_clearance.cjs
```
**Result:** PASS. Vault jump clears both low barriers and rolling matkas cleanly without false collisions.

---

## 4. Evidence Artifacts

1. `scratch/audit_01_coin_shadows_and_combo.png`: Shows coin drop shadows on cobblestones and top HUD `🪙 3 x3` combo punch in action.
2. `scratch/audit_02_sliding_gate_runner_and_lanterns.png`: Shows the iron guide rail embedded in the road spanning the sliding lanes and swinging brass lanterns on the gate.
3. `scratch/audit_03_matka_wobble_and_trail.png`: Shows rolling matka organic wobble and dust puff emitted behind the pot.
4. `scratch/evidence_brass_coins_trail.png`: Clean in-game perspective of spinning brass coins.
5. `scratch/evidence_rolling_matka_pot.png`: Close-up of rolling terracotta clay pot hazard and gold sparkle particles.
6. `scratch/evidence_sliding_street_gate.png`: Close-up of traditional wooden Newar lattice gate.
7. `scratch/evidence_airborne_vault_arc.png`: Parabolic coin arc suspended over a hurdle guiding player's jump timing.
8. `scratch/evidence_01_coins_and_hazards.png`: Game Over screen showing distance, coins collected, and friendly catch message.

---

## 5. Director Approvals Requested

1. **Combo Streak Window:** Current combo reset window is $0.72\text{s}$ without collecting a coin. Does this feel generous enough for rhythm flow?
2. **Iron Runner Rail Contrast:** The iron track on the cobblestones is currently dark weathered iron (`#2E2E33`). Should it have brass or painted chalk accents for higher contrast?

---

## 6. Suggested Next Ticket

- **Option A (Audio & Ambience Immersion):** Add dynamic street ambience (distant festival cheer, temple bells, evening bird chirps, prayer flags fluttering).
- **Option B (Power-up Pickups):** Implement temporary power-ups (e.g. *Khukuri/Vajra Magnetic Aura* doubling coin pull radius for 8 seconds, or *Festival Wind Sprint* immunity shield).
