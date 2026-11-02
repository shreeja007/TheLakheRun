# T001 — Prove a tiny 3D browser scene

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M1  
**Dependencies / approval:** Owner authorization for a time-boxed feasibility spike  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/08_TECHNICAL_ARCHITECTURE.md`, `docs/09_QA_AND_RELEASE.md`

## Objective

Establish a runnable minimal browser 3D scene that loads on desktop and a phone, and gather evidence before choosing the final engine.

## In scope

- Set up a minimal **candidate** PlayCanvas Engine + TypeScript + Vite repository; document exact tool versions and launch commands.
- Render a ground plane, camera, light and one easy-to-see rotating primitive; add one visible keyboard action and one visible touch action (e.g., change primitive color) solely to test input.
- Handle canvas resizing and portrait/landscape browser layouts without a permanent orientation decision.
- Provide a simple build and local preview procedure, and record bundle transferred size and any available frame statistics.

## Out of scope

- No endless runner, game mechanics, score or obstacle spawning.
- No Tuku/Lakhey meshes, Kathmandu art, audio system, backend or deployment.
- Do not claim browser/device validation if tested only in desktop emulation.

## Acceptance criteria

- [ ] The game canvas visibly draws and responds to input on at least one desktop browser; actual phone check is requested from owner if Codex cannot run it.
- [ ] Changing viewport size does not produce stretched/clipped canvas or console errors.
- [ ] `npm run build` succeeds; reproducible launch instructions and observed metrics are included.
- [ ] A short decision note compares observed strengths/issues with the Babylon.js fallback without changing engine by fiat.

## Verification Codex must report

- Run install/dev/build commands, record versions and errors.
- Supply desktop screenshot and a phone test checklist; include actual screenshots from devices **only if tested**.
- Include measured network asset download and FPS when available, otherwise mark not measured.

## Deliverables

- Source and package lockfile, README setup instructions, minimal demo.
- Evidence report and explicit recommendation: keep candidate / test fallback / unresolved.

- A completion report at `reports/T001_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

If library versions or platform limitations block the spike, report evidence and ask before changing engines or adding complexity.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
