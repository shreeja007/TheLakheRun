# T039 — Settings, vibration and best-distance marker

**Implementation state:** COMPLETE  
**Director review state:** PENDING  
**Date:** 2026-11-03  
**Ticket:** `tasks/T039_SETTINGS_VIBRATION_BEST_MARKER.md`

## Summary

**Settings (gear ⚙ next to "Sound on"; visible on the ready, paused and results screens)**
- **Music volume** and **Sound effects volume**, 0–100 %.
  - The game's sound now runs through two channels: music (the drum loop and Lakhey's closeness rumble) and effects (everything else).
  - Both start at 100 %, which is exactly the old mix.
  - The existing "Sound on/off" button still mutes everything.
- **Reduce screen shake:** turns camera shake off.
  - It starts switched on only if the phone or computer already asks apps for reduced motion (this closes T034 audit item A08 for shake).
  - Tuku's own bump and roll animations are unchanged.
- **Vibration:** on by default where supported.
  - On iPhone/iPad browsers the switch is greyed out with a short explanation, because those browsers cannot vibrate.
- Changes apply instantly and are saved on the device. If the browser blocks storage, the dialog says the settings will reset when the game closes.
- While the dialog is open, keyboard keys do not start or steer the run.

**Vibration cues (Android browsers)**

| Event | Pattern |
|---|---|
| First road-edge bump | one 45 ms tap |
| Close call | a light 20 ms tick |
| Lakhey catches Tuku (any cause) | 70 ms, pause, 140 ms |

Vibration is skipped when the tab is hidden, and errors are ignored so a missing or blocked API never interrupts play.

**Best-distance marker**
- A glowing gold line across the road, with two thin posts just outside the curbs, at your previous best distance. A gold "Best 150 m" label sits above it.
- It shows once you have a best of at least 10 m (the same threshold as the "new personal best" celebration).
- It only appears in the ready and running states, and disappears 30 m after you pass it.
- It is purely visual: no collision, no points.
- It stays at the old best while you are beating it, so you can see where you broke your record.
- The label appears within 110 m and is positioned from the camera at render time, so it stays on the line.

**Not changed:** default sound, gameplay, scoring, difficulty, record celebration, art. No online features. No symbols on the marker.

## Changed files

| Path | Why changed |
|---|---|
| `src/game/Settings.ts` (new) | Settings shape, defaults, safe load/save |
| `src/game/Haptics.ts` (new) | Feature-detected vibration cues |
| `src/ui/SettingsPanel.ts` (new) | Dialog behaviour: live apply, save, status, unsupported-vibration state |
| `src/world/BestMarker.ts` (new) | Marker line/posts and projected label |
| `src/audio/SoundManager.ts` | Music and effects buses; `setVolumes()`; drum voices follow the active bus |
| `src/game/GameManager.ts` | `applySettings()`, vibration at bump/close call/catch, marker update |
| `src/runner/PlayerController.ts` | `setShakeScale()` applied to every camera shake |
| `src/main.ts` | Creates the panel, blocks game input while it is open, hides the gear while running, warms up the marker shader |
| `index.html`, `src/ui/mobile.css` | Gear button, settings dialog, marker label styles |
| `scripts/test-settings.mjs` (new), `package.json` (`test:settings`) | Automated T039 checks |
| `scripts/test-ui-mobile.mjs` | Layout check now includes the gear button |
| `tasks/T039_*.md`, `tasks/00_TASK_INDEX.md`, `reports/T039_RESULT.md`, `reports/evidence/T039/` | Tracking and evidence |

## Verification commands and results

- `npx tsc --noEmit -p .`: PASS. `npm run build`: PASS; offline snapshot 31 files, 6,907,749 bytes, version `b0b08ca25c10ec05` (+9 KB over T038).
- `npm run test:settings` (with `UI_TEST_URL=http://127.0.0.1:4190`): **PASS** (`evidence/T039/settings-verification.json`):
  - **Dialog layout:** fits inside 390×844, 320×568 and 844×390.
  - **Defaults:** 100 / 100 / shake on / vibration on.
  - **Live changes:** setting 40 % / 65 % / reduce shake / vibration off changes the game immediately (music 0.4, effects 0.65, shake scale 0, vibration off).
  - **Real audio buses:** after the first tap they read 0.4 and 0.65.
  - **Input blocked:** Space and Up don't start the run while the dialog is open.
  - **Saved:** all four settings come back after a reload.
  - **Shake:** a 0.3 shake request becomes 0.3 normally and 0 with reduce shake. With the OS reduced-motion preference, the box starts ticked.
  - **Vibration:**
    - first bump → `45`; second bump (catch) → `[70, 50, 140]`; close-call cue → `20`;
    - nothing when switched off;
    - without the API: switch disabled, note shown.
  - **Blocked storage:** the setting still applies and the "blocking storage" message shows.
  - **Marker:**
    - no best → hidden;
    - best 150 m → line at z = −150 with label "Best 150 m", 22 px and 66 px above the line at 75 m and 132 m, centred within 4 px;
    - after 190 m → hidden.
  - No page errors.
- `UI_TEST_EVIDENCE_DIR=reports/evidence/T039/ui npm run test:ui`: **18 checks passed**, including the gear button on screen at all four mobile sizes.
- `MOVEMENT_EVIDENCE_DIR=reports/evidence/T039/movement npm run test:movement`: **PASS**.
- `node scripts/test-polish.mjs`: **all viewport cases passed**. Output copied to `evidence/T039/polish/`; committed T034 evidence restored.
- T038 frame probe rerun with T039 (GPU, same scripted 1,500 m run, three runs):
  - 0 batch rebuilds;
  - 0 frames over 33 ms;
  - in two runs, 0 frames over 16.7 ms (worst 9.9–11.1 ms);
  - one earlier run had a single 17.3 ms frame at 1,222 m that did not repeat;
  - median 2.2–2.5 ms, similar to T038 runs on this PC.

## Bug found and fixed during the ticket

- **Home screen button covered:** I first added "Settings" as a fourth stacked button. At 320×568 that pushed "Home screen" under the ready banner, so it could not be tapped; `test:ui` caught it. Settings is now a 44 px gear button beside "Sound on", with the accessible name "Settings".
- **Label drifting from the line:** the first version of the label used the previous frame's camera, so it could drift from the line when frames were skipped. It is now placed at render time.

## Browser and device tests

- Tested: Windows, headless Chrome 156 (SwiftShader and Intel GPU), with mobile and desktop viewports.
- **Not tested:** real vibration on an Android phone (the API was stubbed and its calls recorded). iPhone was not tested. How the volumes sound on a phone speaker was not heard.

## Evidence

- `settings-390x844.png`, `settings-320x568.png`, `settings-844x390.png`: the dialog.
- `settings-no-vibration-api.png`: the greyed-out vibration switch on browsers that can't vibrate.
- `best-marker-approach.png` (75 m) and `best-marker-near.png` (132 m): the marker with a 150 m best.
- `ui/layout-*.png`: the gear button at each size.
- `perf/`: the frame probe with T039.
- `settings-verification.json`, `movement/`, `polish/`.

## Assumptions and limits

- **Vibration on by default** where supported, because you asked for it. Android can also mute vibration system-wide.
- **The closeness rumble counts as music**, so turning music down also quietens it. Lakhey's distance is still shown on the HUD bar.
- **The "Best" label is in English**, like the rest of the UI.

## Director approvals requested

1. On your Android phone, check:
   - the three vibrations (too strong, too weak or right?);
   - the gear button's placement;
   - whether the gold best line looks right in all three areas.
2. Is it fine that "Reduce screen shake" starts ticked on devices that ask for reduced motion?
3. Should the closeness rumble follow the music slider (as now) or the effects slider?

## Suggested next ticket

Real-phone check of T036–T039 together, then the "reasons to come back" items (#6 missions, #7 daily run), which need your product decisions. Not started.
