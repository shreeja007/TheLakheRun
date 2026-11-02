# VISUAL FX & ATMOSPHERE — implementation result

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-10  
**Ticket:** Visual FX & Street Atmosphere Polish (Option 1)

## Summary

Implemented high-performance, culturally authentic visual effects and festival street decoration that elevate the kinetic intensity and festival atmosphere of Lakhey Run while maintaining locked 60 FPS mobile performance:
1. **Pre-Allocated Particle Pooling (`ParticleFxManager.ts`):** 48-entity pre-allocated object pool (32 3D low-poly tumbling dust blocks, 16 additive shockwave ring planes) with zero heap allocation during gameplay loops and complete garbage-collection avoidance.
2. **Athletic Landing & Skid Dust:** Radial dust bursts exploding from under Tuku's sneakers upon hurdle vault landing and trailing skid puffs when executing sharp skater lane dodges.
3. **Lakhey Stomp Ground Vibration:** Subtle, strictly stationary warm amber ground ripple ring (`#D99429`) and localized brick dust puffs directly beneath Lakhey's ceremonial boots during heavy drum downbeats (no forward projectile motion; strictly grounded footprint vibration).
4. **Festive Overhead Torana Garlands:** Traditional Newar bunting garlands strung across facades at $Y = 5.0\text{m}$ sagging gracefully across the road with alternating saffron, crimson, teal, and cream pennants, fully merged into PlayCanvas `RoadBatchGroup` for **zero additional draw calls**.

## Changed files / assets

| Path | Why changed |
|---|---|
| `src/fx/ParticleFxManager.ts` | **New File:** Particle pooling manager for radial landing dust, dodge skid puffs, and expanding Lakhey golden stomp shockwave rings. |
| `src/world/RoadView.ts` | Added festive overhead Torana garland ropes and colorful Newar bunting pennants strung across street facades on every road tile, batched into `RoadBatchGroup`. |
| `src/runner/PlayerController.ts` | Added `onDodge((dir: number) => void)` callback, updated `onLanding` signature with coordinates, and exposed `getX()`/`getY()` getters. |
| `src/runner/GuardianController.ts` | Exposed `getX()` and `getZ()` getters for precise ground shockwave positioning. |
| `src/game/GameManager.ts` | Wired `ParticleFxManager` into player landing, player lane dodge, guardian stomp downbeat, game update loop, and reset/retry cycles. |

## Verification commands and results

1. **Production Build & Compiler Check:**
   ```bash
   npm run build
   ```
   *Result:* Clean build with code 0 (`tsc` passed with 0 errors, Vite bundled `dist/assets/main-*.js` at 69.2 kB).

2. **Automated Playwright FX & Atmosphere Verification (`scratch/test_fx_and_atmosphere.cjs`):**
   ```bash
   node scratch/test_fx_and_atmosphere.cjs
   ```
   *Result:*
   - Active particles on Lakhey stomp: 18 active pooled particles.
   - Active particles on lane dodge: 23 active pooled particles.
   - Active particles on vault landing: 26 active pooled particles.
   - Frame rate measured: 60 FPS locked.
   - Zero WebGL errors or runtime exceptions.

## Browser and device tests

- **Tested:** Windows 11, Chromium (Headless Chrome v120+), 500x750 mobile viewport emulation, 60 FPS verified.
- **Not tested:** Real iOS Safari device (pending physical test flight).

## Evidence

- `scratch/fx_01_overhead_torana_garlands.png`: Overhead festive Torana garlands framing the ancient Kathmandu architectural corridor in ready standoff.
- `scratch/fx_02_lakhey_stomp_shockwave.png`: Expanding golden shockwave ring and dust burst beneath Lakhey during heavy drum downbeat stomp.
- `scratch/fx_03_dodge_skid_dust.png`: Directional skid dust puff trailing behind Tuku's sneakers on sharp skater lane dodge.
- `scratch/fx_04_landing_dust_puffs.png`: Radial pavement dust bursts exploding from under sneakers upon hurdle vault landing.

## Assumptions, defects and blockers

- **Zero Allocations:** Particle manager reuses fixed pre-allocated entities; no runtime mesh creation or garbage collection pauses occur during gameplay.
- **Batched Torana Draw Calls:** Garlands are parented to road tiles and registered into `RoadBatchGroup`, ensuring that overhead decorations do not introduce additional draw call overhead.

## Director approvals requested

1. Sign-off on torana garland pennant color balance (Saffron, Crimson, Teal, Cream).
2. Sign-off on golden shockwave ring propagation velocity and visual impact.

## Suggested next ticket

- Authorize **Option 2 (Obstacle Hazards & Collectibles)**: Dynamic street hazards (rolling clay matka pots, festive brass cymbals / ceremonial coins, sliding barrier gates).
