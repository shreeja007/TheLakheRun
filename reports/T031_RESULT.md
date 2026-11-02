# T031 — Research handoff migration

**Implementation state:** COMPLETE

**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  

**Date:** 2026-10-13

**Ticket:** `tasks/T031_RESEARCH_HANDOFF_MIGRATION.md`

## Summary

Completed phase 1 of the owner's authorized migration sequence in the original development project. Transferred the five previously missing T028 research files as exact byte copies. Updated the active T028 task's stale IN PROGRESS state and its archived T016 reference, and added discoverable README/task-index links. Source documents retain their 2026-10-12 research date, historical test statements and pending business decisions.

No runtime/art file changed, no monetization was adopted and no ads, tracking, payments, upload, deployment or external research refresh occurred. Existing friend tasks and archived documents were preserved. Option C follows as a separate ticket under the same direct owner authorization; it is not implemented by this commit.

## Changed files / assets

| Path | Why changed |
|---|---|
| `reports/T028_RESULT.md` | Exact source research result copy; historical evidence |
| `reports/evidence/T028/INCOME_AND_GROWTH_PROPOSAL.md` | Exact dated proposal copy |
| `reports/evidence/T028/source_register.json` | Exact 18-source register copy |
| `reports/evidence/T028/revenue_scenarios.mjs` | Exact reproducible hypothetical scenario script copy |
| `reports/evidence/T028/revenue_scenarios.json` | Exact scenario output copy; reproduction verified |
| `tasks/T028_INCOME_AND_GROWTH_RESEARCH.md` | Reconcile delivery state and archived evidence location |
| `README.md`, `tasks/00_TASK_INDEX.md` | Incidental documentation links and task rows only |
| `tasks/T031_RESEARCH_HANDOFF_MIGRATION.md` | Authorization and bounded migration scope |
| `reports/evidence/T031/migrate_research.mjs`, `verification.json`, `verification_output.txt` | Reproducible five-file transfer and hash/link/math evidence |
| `reports/T031_RESULT.md` | Mandatory phase completion report |

## Verification commands and results

- `node reports/evidence/T031/migrate_research.mjs`: PASS; five source/destination SHA-256 matches, scenario assertions pass and reproduce byte-identical JSON, both JSON documents parse, 18 distinct citations equal register URLs, all three transferred-report local links exist. Hashes of 429 pre-existing tracked runtime/art/config/viewer files remained unchanged.
- Internal scenario command: `node reports/evidence/T028/revenue_scenarios.mjs`; PASS, nine revenue cases and target/breakeven/acquisition/transfer assertions. Inputs remain hypothetical.
- `git diff --check`, `git diff --cached --check`: PASS before phase commit. Scope reviewed with `git diff --cached --name-only`.
- Added README links and T028 archived evidence path inspected locally. No original task numbering or decision log was overwritten.

## Browser and device tests

- Tested: Windows Git/Node filesystem transfer, hashes, scenario assertions, JSON/citation/local-link consistency.
- Not tested: browser gameplay, phones, actual earnings, portal/account/payout access or external link availability. Documentation transfer does not require a runtime build; earlier copied tests remain historical.

## Evidence

- `reports/evidence/T031/verification.json` — five exact-copy hashes, local links, citation count and 429 protected hashes.
- `reports/evidence/T031/verification_output.txt` — successful command summary.
- Transferred T028 proposal/register/scenario output at their original relative paths.

## Assumptions, defects and blockers

- No blocker to phase 1. Research is preserved, not freshly verified or approved. Existing runtime-art baseline was taken before copying; no current UI/PWA readiness is claimed by the historical report.
- Sibling workspace remains a reference; it was not deleted or edited by this phase. Friend's source/models/animations and existing active task identifiers were preserved.

## Director approvals requested

- Review the phase 1 transfer. Business/distribution decisions remain pending separately; migration does not approve them.

## Suggested next ticket

- T032 — integrate Option C with the original current game, preserving friend movement/tease/festival work and performing fresh UI/PWA checks. This next phase was expressly authorized by the owner's “all the things in order, phase by phase” instruction; handle it as a separate ticket/commit rather than extending T031.
