# Chase Animation & Opening Camera Pan — Implementation Result

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-10-10  
**Feature:** Cinematic Opening Camera Pan & Dynamic Chase Standoff (`Temple Run` / `Subway Surfers` Inspired)

## Summary

Implemented a cinematic opening camera pan, a 3/4 front standoff composition in `READY` mode, and dynamic chase relationship animations between Tuku and Lakhey:
1. **Cinematic 3/4 Standoff Framing in `READY` Mode:** Before starting, the camera is positioned at $(X: 2.2, Y: 1.7, Z: -3.2)$ looking at $(0.0, 1.25, 1.8)$ with a $54^\circ$ FOV. Tuku is framed in the midground, turned slightly with his head glancing back over his shoulder towards Lakhey; Lakhey towers in the background with glowing amber mask eyes, dark mane, and broad guardian challenge arms. The scene is backed by warm lantern-lit Newar brick facades and carved windows stretching behind Lakhey.
2. **Dynamic 3D Camera Sweep Swoop on Start / Retry:** When initiating the run (tapping the banner, pressing Space, or retrying after a catch), a 1.35s cubic smoothstep arc sweeps the camera from the front 3/4 vantage point, curving around Tuku's right flank with radial bulge $(+0.85\text{m X}, +0.35\text{m Y})$, smoothly ascending and settling behind Tuku into the trailing sprint chase position. Forward speed smoothly accelerates from $0 \to 10.5\text{ m/s}$, and Tuku's limbs smoothly blend from the standoff stance to athletic sprint stride.
3. **Dynamic In-Chase Relationship & Glance:** During the sprint chase, when Lakhey surges within $3.2\text{m}$, Tuku dynamically glances back over his shoulder towards Lakhey (interpolating up to $-28^\circ$ yaw). In `GuardianController`, Lakhey leans forward with eager outstretched guardian arms (`reachFactor * -24^\circ`).
4. **Ceremonial Audio Flourish:** Triggered simultaneously on run start and retry: a procedural Dhime drum roll / triplet ("Dhā-n-ti-ki-tā!") and bronze Bhusya cymbal crash synthesized with Web Audio API.

## Changed files / assets

| Path | Why changed |
|---|---|
| [`src/runner/PlayerController.ts`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/src/runner/PlayerController.ts) | Implemented `INTRO_PAN_DURATION = 1.35`, `startIntroPan()`, ready standoff limb pose, 3D radial sweep camera swoop interpolation, smooth speed ramp, and in-chase proximity backward glance. |
| [`src/runner/GuardianController.ts`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/src/runner/GuardianController.ts) | Added `idleTime` rhythmic breathing and mane oscillation in ready pose; added dynamic reach factor (`reachFactor * -24°`) when closing within $3.4\text{m}$. |
| [`src/world/RoadView.ts`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/src/world/RoadView.ts) | Extended road tile array to 6 tiles and spawned initial tile at $Z = +30\text{m}$ behind start line so the background behind Lakhey is fully populated with Kathmandu facades and lanterns in front-facing camera views. |
| [`src/audio/SoundManager.ts`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/src/audio/SoundManager.ts) | Implemented `playIntroFlourish()` synthesizing procedural Dhime drum roll triplet and bronze Bhusya cymbal clash on run kickoff. |
| [`src/game/GameManager.ts`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/src/game/GameManager.ts) | Wired `player.startIntroPan()` and `sound.playIntroFlourish()` on `START` and `retry()`; passed `guardianDistance` to `player.update(dt, isRunning, guardianDist)`. |
| [`src/main.ts`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/src/main.ts) | Added `IntroFrontLight` directional light entity casting warm amber festival illumination on character faces during standoff framing. |

## Verification commands and results

- `npm run build`:
  - `tsc && vite build`: compiled cleanly with 0 TypeScript errors (`exit code 0`).
- Automated Playwright Multi-Frame Capture (`scratch/test_intro_chase.cjs`, `scratch/test_catch_retry.cjs`):
  - Frame 1 (`intro_01_ready_standoff.png`): Confirmed front 3/4 framing showing Tuku looking over shoulder at Lakhey with Kathmandu facades behind.
  - Frame 2 (`intro_02_mid_swoop.png`): Confirmed camera sweeping around Tuku's right flank mid-arc ($t \approx 0.6\text{s}$).
  - Frame 3 (`intro_03_settled_chase.png`): Confirmed camera smoothly settling behind player at $t \approx 1.8\text{s}$.
  - Frame 4 (`intro_05_game_over_catch.png`): Confirmed friendly guardian catch modal and nonviolent catch pose.
  - Frame 5 (`intro_06_retry_swoop.png`): Confirmed instant retry triggering the intro pan swoop again seamlessly.

## Browser and device tests

- Tested: Windows 11 Chrome Desktop (500x750 mobile portrait viewport and 16:9 desktop), 60 FPS smooth camera interpolation.
- Tested: Pure Web Audio API synthesis without external audio files.

## Evidence

- Standoff Framing: [`intro_01_ready_standoff.png`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/scratch/intro_01_ready_standoff.png)
- Mid-Swoop Pan: [`intro_02_mid_swoop.png`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/scratch/intro_02_mid_swoop.png)
- Settled Sprint Chase: [`intro_03_settled_chase.png`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/scratch/intro_03_settled_chase.png)
- Catch & Instant Retry Swoop: [`intro_05_game_over_catch.png`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/scratch/intro_05_game_over_catch.png), [`intro_06_retry_swoop.png`](file:///c:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity/scratch/intro_06_retry_swoop.png)

## Assumptions and limitations

- The camera swoop duration is tuned to $1.35\text{s}$, matching the classic mobile endless runner feel (Temple Run: ~1.2-1.5s, Subway Surfers: ~1.3s). Controls are active and buffered during the sweep.
- Nonviolent guardian framing preserved per `AGENTS.md`.

## Director approvals requested

- Review camera sweep arc speed ($1.35\text{s}$) and camera angle offset.
- Review audio flourish intensity ("Dhā-n-ti-ki-tā!" drum triplet + Bhusya crash).

## Suggested next ticket

- Proceed to T014 or next planned ticket according to the project status roadmap.
