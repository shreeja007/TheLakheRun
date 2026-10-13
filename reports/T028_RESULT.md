# T028 — Income and growth research

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-12

**Ticket:** `tasks/T028_INCOME_AND_GROWTH_RESEARCH.md`

## Summary

Completed the owner's requested internet research after completing T027. Compared Nepal/diaspora-first community distribution with a global casual-game launch, using the owner's explicit compare-both preference. Delivered a cited proposal, primary-source register and reproducible revenue/cost/acquisition/transfer sensitivity.

Recommended proposal: ad-free usability/device pilot, comparable audience cohorts, global portal evaluation if ready, then one approved monetization experiment. Retention, positive acquisition economics and payout/rights terms should decide scaling. This is advice/proposed sequencing, not approval of a business model or a guaranteed income estimate.

No ad/analytics SDK, tracking, payment store, accounts, gameplay change, sponsor message, contract, external submission/upload, paid service, deployment or server change was made. All existing runtime code, models, decision log and friend work remain unchanged. T027 was completed/committed before this separate research ticket started.

## Changed files / assets

| Path | Why changed |
|---|---|
| `tasks/T028_INCOME_AND_GROWTH_RESEARCH.md` | Direct research authorization, comparison scope and exclusions |
| `tasks/00_TASK_INDEX.md` | T028 review row only; incidental index change |
| `reports/evidence/T028/INCOME_AND_GROWTH_PROPOSAL.md` | Dated cited comparison, revenue routes, payout uncertainty, phased experiments, metrics and scale priorities |
| `reports/evidence/T028/source_register.json` | 18 official sources, factual scope/caveats and unsuccessful lookup record |
| `reports/evidence/T028/revenue_scenarios.mjs` | Reproducible hypothetical calculations without network/runtime changes |
| `reports/evidence/T028/revenue_scenarios.json` | Nine revenue cases, target/breakeven/acquisition/transfer arithmetic and explicit assumptions |
| `reports/T028_RESULT.md` | Mandatory result report |

## Verification commands and results

- Web tool search/open/click/find: inspected official CrazyGames/Poki distribution, metrics, SDK-ad and payout docs; Google H5/AdSense availability/payment docs; Stripe merchant-country list; Cloudflare static-hosting billing/limits. All 18 supporting URLs are linked at relevant claims in the proposal and recorded with access date **2026-10-12**. Community/Reddit anecdotes and uninspected contract PDFs were excluded from claim support.
- One guessed Google get-started URL returned an internal error; followed the official API index's link instead and excluded the failed URL. Stripe redirected to its regional global page; the supported-business list was inspected and Nepal had no match. No signup/account approval or bank transaction was tested.
- `rg -n 'analytics|gtag|posthog|adsense|adBreak|poki|crazygames' src public package.json` — exit 1, no matches, expected search result. This is a scoped repository observation, not proof that an external deployment has no tracking.
- `rg -n 'serviceWorker|requestFullscreen|fullscreen' src` — found root-scope service-worker registration in `src/ui/HomeScreen.ts`. Model/texture URL search found root-absolute `/models/` paths. Compared these read-only findings to current relative-path portal requirements; no fixes made in this research ticket.
- `node reports/evidence/T028/revenue_scenarios.mjs` — PASS: nine revenue cases, target/breakeven math, acquisition example and cold-transfer sensitivity. At assumed 2 sessions/day, 1 paid impression/session and $2 creator-net eCPM, monthly creator income is $60/$600/$6,000 for 500/5,000/50,000 average DAU. $1,000/month requires about 8,334 average DAU under those same assumptions; these are not market/traffic forecasts.
- Node stdlib check parsed both JSON files and all Markdown HTTPS citation targets: PASS, **18 distinct cited URLs** match the primary-source register. This verifies citation/register consistency, not independent server availability or contractual validity.
- `git diff --check`, `git diff --cached --check`, `git diff --cached --name-only`, `git status --short` — PASS; changes limited to new research task/report/evidence and index row. Original untracked owner PNG remains excluded.

No runtime build or gameplay tests: this ticket only adds research/math artifacts. No new browser/device testing was performed; cited project evidence is explicitly historical and has its own limits.

## Browser and device tests

- Tested: web-tool access to primary documentation; local Node scenario calculations and document/JSON consistency.
- Not tested: portal admission/SDK integration, physical phones, game traffic/retention, actual eCPM, payment identity/bank settlement, signed offers, actual hosting transfer costs or production deployment. No live accounts/services were accessed.

## Evidence

- [Full proposal](evidence/T028/INCOME_AND_GROWTH_PROPOSAL.md).
- [Primary-source register](evidence/T028/source_register.json).
- [Scenario output](evidence/T028/revenue_scenarios.json) and reproducible script alongside it.
- T027 model handoff/evidence remains in its separately completed result report; this ticket does not change it.

## Assumptions, defects and blockers

- No blocker to the research deliverable. Real earnings cannot be forecast from supplied information; no audience/retention/settlement data exists in this research evidence.
- All eCPMs, sessions/ad counts, traffic, lifetime active days and cost inputs are hypothetical sensitivities, not sourced averages or Nepal/global predictions. Creator eCPM includes platform/network share; income still excludes operating/labor/marketing/fee/tax costs and differs from paid bank cash.
- Portal metric examples are indicative, not guaranteed admission thresholds. Poki published terms are indicative and actual agreement governs. No universal CrazyGames revenue percentage is assumed.
- AdSense Nepal availability/wire listing is a possible payment route, not game/site/bank approval. Portal Nepal-specific payout access and direct purchase alternatives remain unverified.
- Existing PWA/controller evidence does not establish portal compatibility or physical-phone readiness. No monetization or revised cultural portrayal is adopted by this report.

## Director approvals requested

- Accept/revise comparison sequence, cohort/device protocol and measurement/privacy design in a future ticket.
- Choose owned/multi-portal distribution versus exclusivity only after actual offers and verified payment setup; approve future ad/reward behavior, budget and success gates separately.
- No decision-log entries or commercial commitments were made.

## Suggested next ticket

Release-readiness/private-playtest ticket: real-device performance, core-loop usability, minimal measurement protocol and portal-compatibility audit. No paid ads, SDK/analytics installation, external submission or deployment unless separately authorized. Not started automatically.
