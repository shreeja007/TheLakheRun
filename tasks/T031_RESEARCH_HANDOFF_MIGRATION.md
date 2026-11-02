# T031 — Migration phase 1: missing research handoff

**Authorization:** Owner authorized the recommended migration sequence on 2026-10-13: “ok lets do all the things in order, phase by phase.” This ticket covers only phase 1, followed by a separate Option C integration ticket.
**Implementation state:** COMPLETE. 
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.

## Scope and references

Transfer the five missing T028 research deliverables from sibling `lakhey-run-planning_antigravity` into this original development project. Preserve their dated proposal/research status and historical verification claims. Reconcile this project's T028 task status and references to archived T016 evidence; add discoverable README/task-index links.

- `../reports/REPORT_TEMPLATE.md`
- `T028_INCOME_AND_GROWTH_RESEARCH.md`
- Sibling `../reports/T028_RESULT.md` and `../reports/evidence/T029/FILE_COMPARISON.md` in source workspace (resolve against sibling root).

## Acceptance checks

- Five source/destination file SHA-256 values match exactly.
- Revenue scenario script passes and reproduces transferred JSON.
- JSON parses, primary-source register/citation set agrees, local Markdown links resolve.
- Hash baseline proves existing runtime/art files unchanged; no original work discarded.
- `../reports/T031_RESULT.md`, verification evidence and one reviewable local commit.

## Exclusions

No fresh monetization choices, external web/account interaction, ads/tracking/payments, new research claims, runtime/art edits, package installs, builds, uploads, deployment, ticket renumbering or owner-approval-log edits. T032 will handle Option C separately under the owner's sequence authorization; phase 1 does not implement it.
