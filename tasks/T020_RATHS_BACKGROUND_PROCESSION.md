# T020 — The Sacred Raths of Kumari, Bhairab & Ganesh (Background Procession Spectacle)

**Status:** COMPLETE (Ready for Director Review)  
**Milestone:** M2 / M3  
**Dependencies:** T003, T008, T012, T019  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/03_STORY_AND_CULTURE.md`, `docs/04_GAMEPLAY_AND_MECHANICS.md`, `docs/10_DECISIONS.md`

## Objective

Deliver the three sacred chariots of Yenya (Indra Jatra)—Kumari Rath, Bhairab Rath, and Ganesh Rath—as a background procession spectacle (Option 3): visible along an elevated stone promenade boulevard parallel to the player's run. Devotee silhouette crews pull the chariots with heavy Sal fiber haul ropes, accompanied by Dhime drummers, fluttered prayer pennants, and rhythmic rolling wheels.

## Cultural Grounding & Sacred Non-Collision Constraint

- Per `docs/03_STORY_AND_CULTURE.md` and explicit user instruction:
  - The Raths of Kumari, Bhairab, and Ganesh are sacred ceremonial festival chariots housing the living goddess and guardian deities during Yenya.
  - **Hard Constraint:** Under NO circumstances are the Raths to be used as crashable obstacles, destructible objects, or collision hazards.
  - They exist exclusively as a grand, reverent background procession spectacle along the elevated boulevard parallel to the player's run, celebrating the authentic festive wonder of Kathmandu.

## In Scope

1. **3D Chariot Assets (`public/models/` & `art-source/raths/`):**
   - Sourced and audited from community branch assets (`lakhey-run-planning_antigravity_bob` ticket branches):
     - `kumari_rath.glb` (663 KB, 8,434 tris) — Tall 3-tier Newari pagoda chariot with soaring golden Gajur pinnacle spire, carved Sal wood wheels, and ceremonial canopy.
     - `bhairab_rath.glb` (663 KB) — Intermediate ceremonial pagoda chariot.
     - `ganesh_rath.glb` (517 KB) — Single-tier agile ceremonial chariot that leads the procession.
   - Sourced source generator scripts and `.blend` files preserved in `art-source/raths/`.
   - Named wheel node hierarchy (`Wheel_FL`, `Wheel_FR`, `Wheel_BL`, `Wheel_BR`) for physics-accurate rolling kinematics.

2. **3D Inspection Turnaround Viewer (`viewer_raths.html`):**
   - Standalone browser inspection viewer with tabs for all 3 Raths (Kumari, Bhairab, Ganesh).
   - 4 camera angles: Hero 3/4, Front Drawbeam, Side Wheels, Top Canopy.
   - Real-time toggles for continuous wheel rolling rotation and procession sway dynamics.
   - Verified via Playwright test with screenshots captured.

3. **Elevated Procession Boulevard (`src/world/RoadView.ts`):**
   - Elevated stone promenade centered at $X = 10.5\text{m}$, elevation $Y = 2.0\text{m}$ running parallel to the street corridor.
   - High terracotta brick retaining wall ($X = 7.4\text{m}$, $Y = 2.0\text{m}$) with carved stone balustrade coping and lotus post finials.
   - Open street-level Durbar Plaza terrace ($X = 3.6\text{m}$ to $7.4\text{m}$) with low 0.75m stone balustrades, guardian Singha lions, and lantern posts, affording an unobstructed panoramic view of the procession.
   - Ceremonial procession sequence: Ganesh Rath leading at $Z = -44\text{m}$, Bhairab Rath in middle at $Z = -22\text{m}$, and Kumari Rath trailing at $Z = 0\text{m}$.
   - Heavy Sal fiber haul ropes and cadence hauler silhouettes in authentic festival attire (cream dhoti, crimson patuki sash, saffron Dhaka topi).
   - Cheering crowd silhouettes and Dhime drummers lining the promenade balustrade.

4. **Kinematics & Wheel Rolling (`src/world/RoadView.ts`):**
   - Ceremonial walking speed: $v = 3.5\text{ m/s}$ advancing steadily along $-Z$.
   - Wheel rolling: all chariot wheel nodes rotate around local X axis in sync with travel speed ($220^\circ/\text{s}$).
   - Procession sway: subtle natural roll weight transfer ($\pm 1.4^\circ$) simulating rolling over ancient flagstone pavers.
   - Leapfrog recycling: when runner sprints past the entire procession by $>140\text{m}$, the procession smoothly repositions ahead by $200\text{m}$ for recurring festival encounters.

5. **Procedural Web Audio Ambience (`src/audio/SoundManager.ts` & `src/game/GameManager.ts`):**
   - `playDistantProcessionAmbience(distance)`: Distant low-pass filtered Dhime double-drum strikes ($260\text{Hz}$ cutoff simulating acoustic building wall occlusion) and shimmering Bhusya bronze cymbals.
   - Proximity gain curve: triggers periodically when runner is within $65\text{m}$, swelling warmly as runner runs alongside.

## Out of Scope

- Crash colliders or damage interactions with the Raths (strictly prohibited per cultural guidelines).
- External audio samples or third-party audio libraries (100% synthesized via Web Audio API).

## Acceptance Criteria

- [x] All 3 Raths load with 100% procedural fallback guarantee and zero 404 errors.
- [x] Raths roll forward with animated wheels and ceremonial sway along the elevated boulevard.
- [x] Full visibility from player road via the open Durbar plaza terrace without wall occlusion.
- [x] Zero collisions or physical interference with the runner's lane boundaries.
- [x] Distant Dhime drum and Bhusya cymbal ambiance triggers accurately within 65m proximity.
- [x] Rock-solid 140+ FPS performance on desktop with ~230 draw calls.
- [x] Standalone viewer (`viewer_raths.html`) verified and operational.
