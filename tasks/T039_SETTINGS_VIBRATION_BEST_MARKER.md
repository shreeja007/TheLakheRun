# T039 — Settings, vibration and best-distance marker

**Status:** REVIEW — implementation complete; director/device acceptance pending  
**Authorization:** Direct owner instruction on 2026-11-03, choosing items #2–#4 from the improvement research: "Then #2–#4: settings, vibration and the best-distance marker, as one small polish pass."  
**Dependencies:** T038 (same working tree on `feat/t038-size-and-framerate`; T038 is staged, T039 is unstaged so the two can become separate commits).

## Scope

1. **Settings dialog**, opened from a gear button next to Sound (hidden while running):
   - music volume;
   - sound-effects volume;
   - reduce screen shake;
   - vibration.
   Settings apply immediately and are saved on the device. If storage is blocked, the dialog says so and the settings last for the session.
2. **Vibration on Android browsers** for the first edge bump, Lakhey's catch and a close call. On browsers without the Vibration API (iPhone/iPad) the switch is disabled with an explanation.
3. **Best-distance marker:** a glowing line and two posts across the road at the previous best distance (shown once a best of at least 10 m exists), with a small "Best N m" label while it is ahead.

## Exclusions

- No change to the default mix: both volumes start at 100 %, which equals the old sound.
- No change to gameplay, scoring, difficulty, or the record celebration.
- No new mechanics, online features, or cultural symbols. The marker is a plain gold line.

## Acceptance criteria

- Every setting applies live and survives a reload; blocked storage is handled.
- Keyboard input does not start or steer a run while the dialog is open.
- The vibration patterns fire for the three events and stop when switched off; unsupported browsers show a disabled switch.
- The marker sits at the previous best and hides after it is passed and outside READY/RUNNING; the label tracks the line.
- Layouts at 320×568, 390×844, 667×375 and 844×390 keep every control on screen.
- All existing suites pass.
