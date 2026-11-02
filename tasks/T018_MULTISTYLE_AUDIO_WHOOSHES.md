# T018 — Procedural Multi-Style Movement Audio (Whooshes, Somersaults & Stone Skids)

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M2 / M5  
**Dependencies:** T012, T017  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`, `docs/10_DECISIONS.md`

## Objective

Deliver dedicated, authentic procedural Web Audio stems tailored specifically to Tuku's 9 movement variations: an aerodynamic dual-phase somersault spin whoosh for the Front Flip jump, an extended high-friction stone skid grit and fabric rasp for the Rockstar double-knee slide, a buoyant parabolic hop whoosh for the lateral barrel hop, a rapid cloth pirouette double-whip for the 360° spin quick-step, an airborne harmonic festival chirp for the teasing jump, and cushioned tactile roll thuds for the parkour dive roll.

## In scope

- Synthesize distinct procedural audio stems in `SoundManager.ts`:
  - `playJumpSound(variant)`: Variant 0 (Athletic Vault), Variant 1 (Somersault Spin Whoosh), Variant 2 (Airborne Tease Chirp).
  - `playSlideSound(variant)`: Variant 0 (Flagstone Glide), Variant 1 (Cushioned Dive Roll Thuds), Variant 2 (Rockstar Double-Knee Pavement Skid).
  - `playDodgeSound(variant)`: Variant 0 (Skater Carve Cut), Variant 1 (Parabolic Barrel Hop), Variant 2 (360° Double-Whip Pirouette).
- Wire player controller action callbacks (`onJump`, `onSlide`, `onDodge`) to pass the active variant dynamically.
- Eliminate duplicate audio triggers in `GameManager.ts`.
- 100% procedural Web Audio synthesis: zero external audio files, zero licensing risks, zero network overhead.

## Out of scope

- External audio MP3/WAV/OGG downloads or recorded sacred performances.
- Heavy complex sound engines or third-party audio libraries.

## Acceptance criteria

- [x] Front Flip Somersault plays a distinct dual-phase rotational whoosh with aerodynamic spin resonance.
- [x] Rockstar Double-Knee Slide plays an extended high-friction stone skid grit and fabric rasp.
- [x] Backward Teasing Jump plays an airborne harmonic festival chirp alongside the jump whoosh.
- [x] Parkour Dive Roll plays low aerodynamic whoosh with cushioned tactile ground contact thuds.
- [x] Lateral Barrel Hop and 360° Spin Quick-Step play buoyant hop and double-whip pirouette whooshes.
- [x] Zero duplicate audio triggers during jump, slide, or dodge maneuvers.
- [x] Clean TypeScript build and 100% passing automated Playwright verification.

## Deliverables and report

- Code: `src/audio/SoundManager.ts`, `src/runner/PlayerController.ts`, `src/game/GameManager.ts`.
- Automated test: `scratch/test_multistyle_audio.cjs`.
- Report: `reports/T018_MULTISTYLE_AUDIO_WHOOSHES_RESULT.md`.
