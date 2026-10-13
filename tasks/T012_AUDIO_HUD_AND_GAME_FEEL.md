# T012 — Festival audio and readable game HUD

**Status:** PLANNED  
**Milestone:** M5  
**Dependencies / approval:** T005 chase accepted; approved assets and rights available; timing reviewed  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`, `docs/03_STORY_AND_CULTURE.md`

## Objective

Make the runner feel festive through layered sound and clear UI without overcomplicating mechanics.

## In scope

- Implement start, score, personal best, Game Over, Retry and mute affordances with responsive positioning.
- Add approved/original/licensed drum-inspired loop, footsteps and feedback cues with browser gesture-to-play support.
- Make chase proximity feedback legible with audio muted; small visual intensity cues only if approved.
- Optionally improve simple lighting/camera impulse in a configurable, non-distracting way.

## Out of scope

- No full cutscenes, professional soundtrack requirement, collectible UI, story menus, online leaderboard.
- No unauthorized samples from real sacred performances.

## Acceptance criteria

- [ ] First-time player can find Play and understand the key controls.
- [ ] Sound starts only on allowed user gesture; mute is discoverable.
- [ ] HUD does not cover approaching obstacles on phone.
- [ ] Retry works and audio/animation state does not accumulate duplicated layers.

## Verification Codex must report

- Provide muted/unmuted recordings, browser autoplay behavior notes and credits/licensing manifests.
- Test responsive layouts including notched device safe area if available.

## Deliverables

- Completed minimal HUD, audio integration and verified asset-source log.

- A completion report at `reports/T012_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

If rights or source of a traditional recording are unclear, use a placeholder tone or licensed original rhythm, and report it.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
