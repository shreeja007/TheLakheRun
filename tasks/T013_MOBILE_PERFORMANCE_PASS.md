# T013 — Real-device profiling and targeted optimization

**Status:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Milestone:** M6  
**Dependencies / approval:** Feature-complete alpha and agreed test phone/browser targets  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/08_TECHNICAL_ARCHITECTURE.md`, `docs/09_QA_AND_RELEASE.md`

## Objective

Measure and improve load and frame behavior for mobile browsers without sacrificing core readability.

## In scope

- Profile a representative midrange Android phone and desktop, and iPhone Safari when accessible.
- Measure render FPS/frame pacing, JS/memory patterns, loading/transferred bytes and texture/mesh costs.
- Address measured issues first: object reuse, material batching, texture scaling, pixel density, GC and resize bugs.
- Document before/after results and recommended *actual* acceptance budgets.

## Out of scope

- No replacing chosen engine without escalation.
- No extra features, new art packs or speculative rewrites.

## Acceptance criteria

- [ ] Measurements include device/browser and a reproducible scene/test duration.
- [ ] Identified worst issues are reduced, or concrete blockers are honestly documented.
- [ ] Gameplay remains legible and fair after optimization; no regression on desktop.

## Verification Codex must report

- Provide a before/after table with measured FPS, load bytes/time and notable errors.
- Run production build and browser smoke tests; report missing physical devices.

## Deliverables

- Optimized build, profiling evidence and proposed release thresholds for director approval.

- A completion report at `reports/T013_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

If no real device access, clearly label any emulator/desktop estimates as unverified; do not declare mobile production readiness.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
