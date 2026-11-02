# T034 — Audit and polish the existing game

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Authorization:** Direct owner instruction on 2026-10-14: deeply audit the current project, write `audit.md`, then use that audit to correct and polish existing behavior; specifically reduce mobile location names and popups obstructing gameplay.  
**Dependencies:** Existing original-project prototype and T033 integration; acceptance remains pending.

## Read / references

- `../AGENTS.md`, `../README.md`, `../docs/00_PROJECT_STATUS.md`, `../docs/10_DECISIONS.md`
- `../docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`
- `../docs/08_TECHNICAL_ARCHITECTURE.md`
- `../docs/09_QA_AND_RELEASE.md`
- `../reports/T033_RESULT.md`, `../reports/REPORT_TEMPLATE.md`

## Objective and scope

Audit source, current build, existing checks, mobile layouts, feedback lifecycle, inputs, scoring, runtime reliability, performance risks, assets/provenance and documentation consistency. Record evidence and prioritized findings in root `audit.md` before corrective implementation. Correct confirmed defects and polish existing UI within this ticket, prioritizing clear mobile lane visibility. Run relevant regression checks and retain before/after evidence separately under `reports/evidence/T034/`. Write `reports/T034_RESULT.md`.

## Exclusions

No new mechanics/features, character or cultural redesign, engine migration, monetization, new services, dependency upgrades, deployment, remote push or owner-approval log edits. Unverified fairness, hardware performance, cultural authenticity and asset rights remain explicit review items. Do not start a subsequent ticket.

## Acceptance criteria

- `audit.md` separates confirmed defects, implemented corrections and deferred/unverified findings.
- Location/skill/record feedback stays compact and outside the central running view on narrow portrait and short landscape layouts; messages do not stack or leak across pause/retry/results.
- Existing controls, scoring, movement variants, festival models, sound and offline behavior remain available.
- Build and existing combined UI/PWA checks pass; meaningful regression checks cover fixes, with screenshots and limits reported.
- Technical completion remains pending director and physical-device acceptance.
