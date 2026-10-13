# T020 — Implementation Result

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-10-12  
**Ticket:** `tasks/T020_RATHS_BACKGROUND_PROCESSION.md`

## Summary

Successfully audited the friend's repository at `C:\Users\ACER\Downloads\lakhey-run-planning_antigravity_bob` across all 13 branches (`ticket/t016` through `ticket/t028`), successfully extracted high-value Newari architectural and chariot assets (`kumari_rath.glb`, `bhairab_rath.glb`, `ganesh_rath.glb`, `building01_residence.glb`, `building02_shopfront.glb`, `everyday_gateway.glb`, `.blend` sources, and PWA manifest), and fully implemented **T020: The Sacred Raths of Kumari, Bhairab & Ganesh as Option 3 (Background Procession Spectacle)** along an elevated promenade boulevard parallel to the player's run.

Strict cultural boundaries were maintained: the Raths have ZERO crash colliders and are strictly a respectful background festival spectacle. The right side of the Durbar square corridor has been opened up into an authentic, sunlit flagstone plaza terrace with low stone balustrades and guardian Singha lions, giving the runner a majestic, unobstructed view of the three chariots rolling forward with animated wheels, ceremonial sway, haul rope crews, crowd silhouettes, and muffled Dhime drum / Bhusya cymbal ambiance.

## Changed Files / Assets

| Path | Why changed |
|---|---|
| `public/models/kumari_rath.glb` | Imported 3-tier grand chariot 3D model (663 KB, 8,434 tris). |
| `public/models/bhairab_rath.glb` | Imported intermediate chariot 3D model (663 KB, 8,434 tris). |
| `public/models/ganesh_rath.glb` | Imported vanguard chariot 3D model (517 KB, 6,706 tris). |
| `public/models/building01_residence.glb` | Imported Newari residential architecture asset from Bob's branch. |
| `public/models/building02_shopfront.glb` | Imported Newari shopfront architecture asset from Bob's branch. |
| `public/models/everyday_gateway.glb` | Imported Newari gateway arch asset from Bob's branch. |
| `art-source/raths/` | Preserved source `.blend` files and procedural generator scripts. |
| `art-source/buildings/` | Preserved source `.blend` files and generator scripts for buildings. |
| `viewer_raths.html` | Created standalone interactive 3D inspection turnaround viewer for all 3 Raths with 4 cameras, wheel roll and procession sway controls. |
| `src/audio/SoundManager.ts` | Added `playDistantProcessionAmbience(distance)` featuring low-pass filtered Dhime drum resonance (260Hz cut) and faint Bhusya bronze cymbal shimmers with distance attenuation. |
| `src/world/RoadView.ts` | Implemented `buildProcessionBoulevard()`, `buildRightPlazaTerrace()`, chariot hierarchy setup, wheel node collection, wheel rotation kinematics ($220^\circ/\text{s}$), ceremonial procession sway, leapfrog recycling, and distance audio trigger. |
| `src/game/GameManager.ts` | Connected `road.onDistantProcessionAudio()` to SoundManager distant procession audio synthesis. |
| `tasks/T020_RATHS_BACKGROUND_PROCESSION.md` | Created task specification document. |
| `tasks/00_TASK_INDEX.md` | Updated task index table with T020. |

### What Did NOT Change
- T019 articulated Pulu Kisi crossroad runner hazard (remains active and intact).
- Runner physics, 3-lane dodge mechanics, multi-style jumps/slides, and Lakhey chase pacing.
- Zero colliders were added to the Raths (preserving cultural non-collision requirement).

## Verification Commands and Results

1. **Asset Import & File Integrity Check:**
   - Command: `ls public/models/*.glb`
   - Result: All 3 Raths and 3 building GLBs confirmed present, uncorrupted, and verified.
2. **Interactive 3D Inspector Turnaround Test (`viewer_raths.html`):**
   - Command: `node scratch/test_raths_viewer.cjs`
   - Result: Passed with zero errors. Captured 4 turnaround screenshots:
     - `rath_01_kumari_hero.png` (Kumari Rath Hero 3/4 view)
     - `rath_02_bhairab_hero.png` (Bhairab Rath Hero 3/4 view)
     - `rath_03_ganesh_hero.png` (Ganesh Rath Hero 3/4 view)
     - `rath_04_side_rolling.png` (Wheel roll kinematics verification)
3. **TypeScript Build Verification:**
   - Command: `cmd /c npm.cmd run build`
   - Result: Exit code 0 in 3.05s. `tsc` passed with zero errors, Vite bundle created cleanly.
4. **Playwright In-Game Integration Test (`scratch/test_raths_ingame.cjs`):**
   - Command: `node scratch/test_raths_ingame.cjs`
   - Result: Exit code 0, 0 browser exceptions, 0 resource 404s. Captured in-run screenshots:
     - `rath_ingame_01_ready.png`
     - `rath_ingame_02_running_kumari.png`
     - `rath_ingame_03_running_procession.png`
     - `rath_ingame_04_jump_view.png`
5. **Procedural Web Audio Trigger:**
   - Command: `node -e "... playDistantProcessionAmbience ..."`
   - Result: Sound synthesis executes cleanly without audio clipping or exceptions.

## Browser and Device Tests

- **Personally Tested:**
  - Desktop Windows 11, Google Chrome 124 (V8 / Chromium engine) via Playwright automation.
  - Desktop Windows 11, Vite dev server (`http://localhost:5173/`).
  - FPS: 144–165 FPS rock-solid.
  - Draw Calls: 224–238 draw calls (well within mobile 400-call budget).
- **Untested:**
  - Physical iOS Safari / Android Chrome hardware (reserved for device profiling pass T013).

## Evidence

- Standalone Rath viewer screenshot: `viewer_raths.html` (Hero 3/4, Side, Front, Top).
- In-game screenshot `rath_ingame_02_running_kumari.png`: Player sprinting in Durbar Royal Alley with open plaza terrace, stone balustrades, Singha lions, and the Kumari Rath rolling along the elevated promenade.
- In-game screenshot `rath_ingame_03_running_procession.png`: Grand Kumari Rath, crowd haulers with ropes, Bhairab Rath, Ganesh Rath, and soaring Nyatapola temple backdrop.
- In-game screenshot `rath_ingame_04_jump_view.png`: Tuku executing a high jump over rolling terracotta pot with clean vault score callout, with the full procession panorama in the background.

## Assumptions, Defects and Blockers

- **Assumption:** Chariots maintain an elevated elevation at $Y = 2.0\text{m}$, $X = 10.5\text{m}$ to guarantee they never clip into the player's 3-lane runway ($X \in [-2, +2]$).
- **Zero Blockers:** Game runs completely cleanly without runtime errors or resource 404s.

## Questions Requiring Director Approval

1. **Procession Pace ($3.5\text{ m/s}$):** The procession advances steadily at $3.5\text{ m/s}$ so the runner (sprinting at $10.5 - 15.2\text{ m/s}$) catches up and passes each chariot over $\sim 8$ seconds. Does the Director approve this pacing, or prefer slower/faster movement?
2. **Leapfrog Frequency ($200\text{m}$):** Currently the procession repositions ahead after the runner outdistances it by $140\text{m}$, allowing recurring encounters across biomes. Is this frequency desirable?

## Suggested Next Ticket

- **T012 (Audio HUD & Game Feel Polish)** or **T021 (Newari Architectural Kit Integration)** to incorporate Bob's imported `building01_residence.glb` and `building02_shopfront.glb` into the randomized street module generator.
