# T019 — Pulu Kisi (White Elephant) Dynamic Crossroad Runner Hazard

**Status:** COMPLETE (Ready for Director Review)  
**Milestone:** M2 / M3  
**Dependencies:** T003, T008, T012  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/03_STORY_AND_CULTURE.md`, `docs/04_GAMEPLAY_AND_MECHANICS.md`, `docs/10_DECISIONS.md`

## Objective

Deliver Pulu Kisi (the traditional Indra Jatra white wicker elephant of Kilagal) as an interactive dynamic crossroad runner hazard (Option 1): dashing across wide intersections and courtyards from side alleys with swinging cloth trunk, rhythmic gallop footfalls, and ringing neck brass bells (Ghangla). The player must choose a safe lane or time their stride to weave cleanly past its lively dash, earning the `PULU_KISI_EVADED` skill bonus (+180 pts).

## Cultural Grounding & Nonviolent Framing

- Per `docs/03_STORY_AND_CULTURE.md`: Pulu Kisi represents the beloved white elephant of Indra running playfully through the alleys of Kathmandu during Indra Jatra (Yenya).
- It is animated by two human dancers concealed within the woven wicker and white cloth frame.
- Strict nonviolent framing: Pulu Kisi is never an enemy to attack, kill, or damage. It is a festive, spirited participant in the festival whose lively crossing challenges the runner's reflexes and spatial timing.
- Collision with Pulu Kisi causes a gentle festival stumble / scoop, not injury.

## In scope

1. **3D Character Model (`public/models/pulu_kisi.glb` & `art-source/pulu_kisi.glb`):**
   - Procedural generation script (`scratch/build_pulu_kisi.cjs`).
   - Woven white wicker/cloth barrel torso, Asian elephant head with parietal cranial bumps, fan-shaped ears with rosy silk lining, curved articulated trunk, tufted tail, ceremonial crimson Jhula saddle blanket with gold brocade, and resonant brass Ghangla neck bell.
   - 11-node articulated skeleton hierarchy (`PuluKisiRoot`, `BodyRoot`, `HeadRoot`, `TrunkRoot`, `LeftEarRoot`, `RightEarRoot`, `BellRoot`, `TailRoot`, `FrontLeftLegRoot`, `FrontRightLegRoot`, `BackLeftLegRoot`, `BackRightLegRoot`).
   - Inverted-hull dark ink outline styling matching Tuku and Lakhey.
   - Optimized file size: ~220 KB.

2. **3D Inspection Turnaround Viewer (`viewer_pulu_kisi.html`):**
   - Standalone browser inspector with Hero 3/4, Front Dash, Side Profile, and Top Dorsal cameras.
   - Studio 3-point warm lighting, pedestal shadow, and real-time animation toggles:
     - High-tempo festival gallop run gait (8.5 rad/s cadence).
     - Trunk swinging and pitching.
     - Bell jingle oscillation and fan ear flapping.

3. **Procedural Web Audio Engine (`src/audio/SoundManager.ts`):**
   - `playPuluKisiBell(distance)`: Spherical brass bell with sharp metallic clapper transient and dual resonant overtones at 2150Hz and 3420Hz, with proximity distance attenuation.
   - `playPuluKisiGallop(distance)`: Staggered double-patter dancer footfalls with low-frequency floor thump and canvas rustle.

4. **Dynamic Hazard Kinematics (`src/world/ObstacleManager.ts`):**
   - Pre-allocated 4-instance object pool (`puluKisiPool`).
   - Procedural fallback elephant guarantee (instant visibility while GLB parses).
   - Triggered approach: when runner reaches within 42m of crossroad, Pulu Kisi bursts from side alley ($X = \pm 7.5\text{m}$) across the 3 lanes at $5.4\text{ m/s}$.
   - Facing yaw: automatically faces direction of dash ($-90^\circ$ for $+X$, $+90^\circ$ for $-X$).
   - Real-time skeleton articulation (body bob/pitch, leg swing, trunk sway, ear flap, bell swing).
   - Periodic brass bell chime and gallop footfall audio cues.
   - Pavement gallop dust puff emissions.
   - Fair crossroad layout: when Pulu Kisi spawns, no static hazards are placed on that row, guaranteeing at least one open lane to weave ahead or behind.

5. **Scoring & Skill Callout (`src/game/GameManager.ts` & `src/types.ts`):**
   - `PULU_KISI_EVADED` skill detection for close lateral weave ($dx \in [0.85\text{m}, 1.95\text{m}]$).
   - HUD banner: `🐘 PULU KISI EVADED! (+180 Crossroad Dash)`.
   - Hitstop (0.08s), camera shake (0.042), and Lakhey pushback (1.1m lead gain).

## Out of scope

- Sacred Raths (Option 3 — Raths of Kumari, Bhairab & Ganesh reserved for the next ticket as background procession spectacle).
- External audio files, licensed textures, or complex rigging plugins.

## Acceptance criteria

- [x] Pulu Kisi 3D model generated cleanly as editable script and optimized GLB (~220 KB).
- [x] Standalone viewer (`viewer_pulu_kisi.html`) verified with all 4 cameras and gallop animation.
- [x] Procedural Web Audio synthesized for Ghangla brass bells and gallop footfalls.
- [x] Dynamic crossroad dash kinematics verified in `ObstacleManager` with 3D bounds tracking.
- [x] `PULU_KISI_EVADED` skill bonus triggers and rewards +180 points.
- [x] TypeScript build passes with zero errors and automated Playwright tests pass 100%.

## Deliverables and report

- Model: `public/models/pulu_kisi.glb`, `art-source/pulu_kisi.glb`.
- Generator & Viewer: `scratch/build_pulu_kisi.cjs`, `viewer_pulu_kisi.html`.
- Code: `src/types.ts`, `src/audio/SoundManager.ts`, `src/world/ObstacleManager.ts`, `src/game/GameManager.ts`.
- Automated test: `scratch/test_pulu_kisi.cjs`.
- Completion Report: `reports/T019_PULU_KISI_CROSSROAD_RUNNER_RESULT.md`.
