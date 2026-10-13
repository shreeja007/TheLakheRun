# T016 — Production HUD, first-run controls and mobile home screen

**Status:** AUTHORIZED (direct user instruction, 2026-10-11)

**Authorization:** “ok lets do option C thoroughly.”

**Read:** `AGENTS.md`, `README.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`, `docs/08_TECHNICAL_ARCHITECTURE.md`, `docs/09_QA_AND_RELEASE.md`

## Objective

Implement Option C against the existing runner without changing character assets, animation ownership or gameplay rules. Existing reports and source show implementation beyond the older planning status; this ticket does not assert acceptance of those features or approve the engine.

## In scope

- Hide developer telemetry by default; retain explicit debug access.
- Readable, responsive production HUD and touch targets with safe-area support.
- Skippable first-run swipe/control callouts, persistent completion where storage works, and a way to replay guidance.
- Valid PWA manifest, original placeholder app icons, home-screen launch metadata and appropriately scoped service-worker support.
- Honest installation/offline messaging and failure handling; no deployment.
- Build, browser verification, automated checks where useful, manual physical-device checklist and evidence.

## Out of scope

New character models or animations, new mechanics/power-ups, engine replacement, external art/fonts/services, deployment/hosting/DNS, final mobile performance certification.

## Acceptance criteria

- Developer telemetry is absent from the default HUD and available by an explicit debug option.
- First-run guidance explains the existing controls without consuming gameplay input or exposing the player to hazards while learning; skip, replay, retry and storage failure work.
- HUD and guidance fit narrow portrait and short landscape viewports without blocking play/retry/mute.
- Manifest and icon URLs resolve in the production build; home-screen launch uses the existing game.
- Service-worker behavior does not cache development builds, silently interrupt a run, or claim unverified offline readiness.
- Build and scoped regression checks pass, evidence and untested devices are reported.

## Deliverables

Implementation, reproducible verification and `reports/T016_RESULT.md` using `reports/REPORT_TEMPLATE.md`. Pending director acceptance. Do not begin another ticket.
