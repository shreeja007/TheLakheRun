# T015 — Final QA and launch-readiness review

**Status:** PLANNED  
**Milestone:** M7  
**Dependencies / approval:** T013/14 accepted; cultural and asset-rights reviews; owner final launch decision  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/09_QA_AND_RELEASE.md`, `docs/03_STORY_AND_CULTURE.md`, `docs/12_RESEARCH_SOURCES.md`

## Objective

Provide a documented go/no-go recommendation for publication; **do not publish** without director authorization.

## In scope

- Run/end-to-end checklist across browsers and real devices available.
- Confirm fair obstacle generation, no retry leaks, mute, local best storage fallback, credits and licensing record.
- Attach cultural review/approval feedback and unresolved issues; prioritize blocking vs non-blocking defects.
- Prepare launch checklist, known issues and rollback contacts.

## Out of scope

- No unilateral release, store launch, advertising stack, multiplayer services or new gameplay.

## Acceptance criteria

- [ ] Every acceptance item in `docs/09_QA_AND_RELEASE.md` is passed or explicitly marked blocked, not left blank.
- [ ] Critical issues have reproductions and dispositions; no secret/unlicensed assets in build.
- [ ] Cultural review, owner gameplay review and final deployment authority are traceable.

## Verification Codex must report

- Supply QA matrix results, evidence links, build version/hash and go/no-go rationale.

## Deliverables

- Release-readiness report and explicit list of director sign-offs still needed.

- A completion report at `reports/T015_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

Any missing cultural/rights approval, major gameplay blocker, browser failure or insecure hosting means NO-GO until resolved.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
