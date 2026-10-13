# T002 — Graybox automatic running and controls

**Status:** PLANNED  
**Milestone:** M2  
**Dependencies / approval:** T001 accepted; director approves orientation, camera, control mapping  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/02_GAMEPLAY.md`, `docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`

## Objective

Make a placeholder capsule/runner automatically progress with discrete lane movement and a responsive jump.

## In scope

- Implement a clearly grounded static or moving graybox player, auto-forward movement and fixed trailing camera using the approved framing.
- Left/right input moves exactly one lane per valid action; one jump follows repeatable timing.
- Support approved keyboard mapping and mobile swipe gestures, with simple controls hint and collision-debug overlay when useful.
- Keep delta-time-safe movement and a basic READY/RUNNING state.

## Out of scope

- No generated hazards or distance scoring.
- No named character mesh, hero animations, festival art, abilities or sliding.

## Acceptance criteria

- [ ] Player starts/restarts the small movement demo without page refresh.
- [ ] Lane input is responsive and never leaves designated lanes.
- [ ] Jump begins/lands predictably, and holding input does not create unintended repeated jumps.
- [ ] Desktop keyboard and touch input can each be tested independently.

## Verification Codex must report

- Supply control table and browser reproduction steps.
- Test rapid taps/swipes, tab loss and changed FPS or frame timing.
- Record any touch/resize limitations on actual test devices.

## Deliverables

- Simple playable movement scene and code change report.
- Short clips or screenshots from editor plus exact manual control steps.

- A completion report at `reports/T002_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

If orientation/camera/input remains unapproved, do not invent a final design. Implement only an explicitly approved A/B experiment.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
