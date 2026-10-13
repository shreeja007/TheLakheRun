# Lakhey Run — income and growth proposal

Researched **2026-10-12**, Nepal time. T028 research delivery, not an approved product/launch plan. Owner requested comparison of Nepal/diaspora and global audiences before choosing.

## Recommendation

Keep the core runner free and easy to try. Validate it with Nepal/diaspora players and unfamiliar global players, then choose distribution using measured results. Proposed sequence: small ad-free feedback pilot, global portal evaluation if ready, then monetization after replay/retention and payout eligibility are demonstrated.

The setting can make the game memorable; the chase must work for players who know nothing about the culture. That is a positioning hypothesis, not proof of demand. More characters/scenery alone do not establish recurring income.

## Current evidence

The repository has a browser runner, T016 HUD/tutorial/PWA work and static model handoffs. New art packets are not automatically installed in the game. T016 recorded about 9.28 MB of uncompressed offline-cache payload, not current compressed transfer or first-play load time. Physical Android/iPhone and sustained performance remain unverified.

No live audience, acquisition, retention or revenue data was supplied or verified. A scoped repository scan found no references to named mainstream analytics/ad SDKs; it does not audit an external deployment. Current /models/ asset URLs and the root /sw.js registration need review for portal/subdirectory hosting.

## Audience comparison

Opportunities below are hypotheses to test, not measured market size.

| Consideration | Nepal + diaspora launch | Global casual-game launch |
|---|---|---|
| Reason to try | Familiar setting, local creator story and community interest | Immediate dodge/jump challenge, readable chase and distinctive art |
| Discovery proposal | Nepali gaming/culture creators, diaspora groups, community pages and festival-interest communities | Browser portals, short gameplay clips, casual-game creators and search-friendly game page |
| Best early feedback | Cultural framing, names, atmosphere and local phone/network conditions | Controls, fairness, loading and replay without cultural familiarity |
| Revenue candidates | Eligible owned-site ads; negotiated sponsorship/licensing | Portal ads after acceptance; owned-site ads where distribution rights allow |
| Main uncertainty | Community enthusiasm may not produce repeat play or scale | Platform acceptance/discovery is competitive; exposure not guaranteed |
| Control | Own presentation/community relationship; must bring traffic | Discovery support with platform rules, revenue terms and possible exclusivity |
| Decision evidence | Qualified repeat players, actual country/channel revenue and acquisition cost | Cohort retention, conversion, offer terms and measured creator earnings |

Do not assume Nepal and diaspora players have equal ad value. Diaspora players live in different ad markets; measure actual geography/channel results. Recruit by tagged invitation cohorts or voluntary feedback, not inferred ethnic identity. No acquisition channels have been contacted.

## Revenue routes

### Browser portals

CrazyGames Basic Launch is an evaluation with optional SDK and no monetization. Full Launch requires its SDK. Already-published games are allowed when distribution rights are held. This is a reasonable global test candidate that may preserve distribution options, subject to submission terms; acceptance/promotion are not guaranteed. [Requirements](https://docs.crazygames.com/requirements/intro/), [publication FAQ](https://docs.crazygames.com/faq/).

Its guide describes evaluation lasting 7–21 days: at least seven days and 500 plays, or an automatic ending after 21 days. Indicative successful-title examples include 10+ minute average sessions, 10–15% D1 retention and 80%+ one-minute conversion. These are directional examples, not guaranteed acceptance thresholds. Multiple enjoyable 1–3 minute runs can make a longer session; do not artificially lengthen a run. [Basic Launch guide](https://docs.crazygames.com/resources/basic-launch-metrics/).

Poki monetizes through its own midroll/rewarded SDK. Its current overview excludes in-app purchases and third-party ad systems; rewarded ads are optional, explicit choices. [Monetization](https://developers.poki.com/guide/how-monetization-works).

Poki's preferred arrangement is web exclusivity, with an indicative five-year term; the actual agreement governs. Its alternative non-exclusive arrangement is a flat license fee without revenue share. Do not plan an exclusive deal and simultaneous owned-site/multi-portal publication of the same game. [Deal types](https://developers.poki.com/guide/revenue-deal-types). Its partner overview describes 50/50 for Poki-acquired traffic and 100% for direct traffic under the discussed arrangement; those descriptions are not a substitute for a signed offer. [Partner overview](https://developers.poki.com/guide/working-with-poki).

Proposal: investigate CrazyGames compatibility after playtesting; compare Poki only when a real offer's support/reach compensates for exclusivity. Do not insert an assumed universal portal revenue split into the business plan.

### Your own website

Google H5 Games Ads supports interstitials at natural breaks and optional rewarded formats. Its guidance prohibits disrupting continuous gameplay and ads after every interaction. This research has not established eligibility/approval of this creator or site. [H5 program](https://support.google.com/adsense/answer/9959170?hl=en), [API overview](https://developers.google.com/ad-placement).

If approved later, test a restrained results/between-runs placement while preserving free quick retries. A rewarded continue needs a separately approved recovery mechanic and score-fairness rule. Do not add coins/store or difficulty designed to force ads merely to create revenue.

Portal builds need their own ad system. CrazyGames requires SDK ads and correct pause/error/muting behavior; no-fill must allow the game to continue. [Ad requirements](https://docs.crazygames.com/requirements/ads/). Do not mix an owned-site Google ad implementation into that portal build.

### Sponsorship / licensed presentation

Possible community route: supporter credit on an owned landing/about page, or a negotiated licensed presentation for a cultural organization/event. These are proposed buyer categories, not actual buyers or verified fee levels.

After audience evidence exists, prepare one simple offer describing qualified monthly players, repeat-player rate, geography, credit location and reporting. Price from real reach, scope and exclusivity. Respect the project review gate; do not brand sacred character costumes/ceremonies, sell sacred objects or claim authentic reenactment. No outreach or contract was sent.

Paid entry, subscription, cosmetics/store and app-store expansion are lower priorities: they add friction or deferred systems before willingness to pay is established. They remain alternatives requiring future decisions; they are not V1 commitments.

## Nepal-based payout access

AdSense availability includes Nepal and its payment-method table lists wire transfers there. This is a possible route, not approval of Lakhey Run, this account or a bank. Verify eligibility, identity/billing, bank receiving/FX fees and actual thresholds before integration. [Availability](https://support.google.com/adsense/answer/13402307?hl=en), [payment methods](https://support.google.com/adsense/answer/1714397?hl=en).

CrazyGames uses Tipalti with a minimum €100 payout. Methods depend on country. Its page distinguishes contractual NET 60 from a faster processing aim; budget from the agreement and bank receipt, not dashboard earnings. Nepal-specific approval/method/fees are unverified. [Payouts](https://docs.crazygames.com/payouts/). Poki documents wire/PayPal options, subject to onboarding/agreement; Nepal-specific access is not established here. [Billing](https://developers.poki.com/guide/payouts-billing).

Nepal was absent from Stripe's standard supported-business list inspected today. Do not build a domestic Stripe store assuming merchant eligibility; customer-country support is different. Other payment/business arrangements need a separate verified investigation if purchases become worthwhile. [Stripe availability](https://stripe.com/global).

## Revenue sensitivity

Every numeric input below is **hypothetical**, not a market average, country eCPM, demand estimate or forecast.

~~~text
Monthly creator ad income =
average DAU × daily sessions/player × paid impressions/session
× 30 × creator eCPM / 1,000
~~~

DAU means daily active players, not followers/monthly visits. Paid impressions already reflect opt-in, fill, blockers and caps; a requested ad is not a paid impression. Creator eCPM means dollars credited per thousand paid impressions after platform/network share. Do not deduct that share twice. Income excludes your operating/development/marketing/bank/FX/tax costs and is not immediately guaranteed bank cash.

Assume two sessions per daily player and one paid impression per session:

| Average DAU | Monthly paid impressions | $0.50 creator eCPM | $2 | $5 |
|---:|---:|---:|---:|---:|
| 500 | 30,000 | $15 | $60 | $150 |
| 5,000 | 300,000 | $150 | $600 | $1,500 |
| 50,000 | 3,000,000 | $1,500 | $6,000 | $15,000 |

Under the $2 inputs, $1,000/month needs about **8,334 average DAU**. An illustrative $100/month operating bill needs about **834 DAU**, before development labor/omitted costs. The $100 is not a hosting quote. Basic Launch or other periods without paid ads can earn **$0** regardless of plays.

Acquisition example: ten lifetime active days, two sessions/day, one paid impression/session and $2 creator eCPM yield only **$0.04/player before serving costs**. Paying $0.10 for that player loses money under those assumptions. Start with no paid promotion; consider spend only after measured contribution lifetime value exceeds acquisition cost with a chosen margin.

Run node reports/evidence/T028/revenue_scenarios.mjs to reproduce all nine revenue cases, target/breakeven arithmetic, acquisition and transfer examples. Outputs: revenue_scenarios.json.

## Suggested phased experiments

These follow a stable review build; they are proposed work, not calendar promises or authorized launches.

1. **Usability/device gate:** private tests with about 10–15 local/diaspora/global recruits, including actual weaker/midrange Android and iPhone Safari. Observe loading, controls, loss clarity, retry, pause/resume and audio. This finds defects, not retention or revenue.
2. **Acquisition-message comparison:** same build, community/setting-led invitation versus gameplay-led invitation. Use short real gameplay clips with a clear near-miss/retry and one play link. Outreach needs separate owner authorization and community permission. No fabricated testimonials or promotion sent here.
3. **Cohort pilot:** aim for at least 200 first-activated players per approach over a realistic recruitment window. Separate Nepal, diaspora invitations and other global channels. Include unfamiliar players because friends/supporters bias feedback. D1 from 200 users is still noisy; record denominator and missing observations.
4. **Portal evaluation:** if quality is adequate, propose a separate compatibility/submission ticket. Compare portal and direct cohorts without assuming identical metric definitions or guaranteed exposure.
5. **Monetization pilot:** only after an actual offer/account eligibility and retention evidence, test one approved SDK/placement. Compare retry/return rates against an ad-free baseline as well as income. Fix or stop flows that strand players or damage the experience.
6. **Scale the winner:** grow the cohort/channel with repeat play and positive measured contribution; expand small creative experiments before paid spend. Do not add a backend or buy ads simply because a calendar milestone passed.

Content hypotheses: a mobile swipe/jump clip, a friendly guardian chase clip and an atmospheric fictional-street clip. Use English gameplay instructions; a reviewed Nepali invitation/UI can be a separate test. No unreviewed authenticity or sacred-reenactment marketing claim.

## Measurement plan

| Metric | Proposed definition/use |
|---|---|
| Load-to-play | Median/p95 navigation-to-playable time with device/connection stated |
| Activation | First-run players / eligible visits; separate load failures |
| First-session retry | Players starting another run after first result / players reaching that result |
| Active play time | Running/interactive time excluding hidden/paused/loading time; not automatically equivalent to portal session time |
| Runs/session | Completed runs / qualified sessions |
| D1/D7 | First-activated cohort active next/seventh calendar day, with a documented timezone, denominator and missing observations |
| Ads | Requests, displays, reward completion eligibility, paid impressions and creator earnings separately |
| Economics | Contribution LTV versus CAC by channel/country, with variable costs included |

A small manually followed panel can start validation without tracking software. Persistent IDs/campaign analytics, country/device collection and ad consent require a separately approved privacy/data design. No tracking was installed. Published portal figures above are context, not adopted product gates; define thresholds after observing baseline behavior.

## Technical scale appropriate to a browser runner

Rendering runs on the player's device: more origin-server CPU does not fix phone FPS. Measure draw calls, repeated materials, shader/texture memory and high-DPR behavior with intended scenery. Publish only approved runtime GLBs/assets, not blend/source/reference handoff ZIPs.

Start with static HTTPS delivery, compression, versioned immutable caching/CDN and fast first-play loading. No database/Laravel/login is needed for the current single-player loop. Geometry/material reuse, lower device quality and delayed nonessential assets need measured implementation tickets.

CrazyGames requires relative bundle paths and initial downloads ≤50 MB, with ≤20 MB for mobile-homepage eligibility. Root-absolute model paths need a compatibility fix before submission. English and immediate/one-click entry for full integration also matter; review the existing controls rehearsal plus iframe/home-screen/offline-worker behavior rather than assuming the current PWA works unchanged. [Technical](https://docs.crazygames.com/requirements/technical/), [gameplay](https://docs.crazygames.com/requirements/gameplay/).

Cloudflare's current docs distinguish free/unlimited static asset requests from metered dynamic execution; Workers static assets have a 25 MiB per-file limit. It is a candidate to compare with the owner's server, not an adopted host or guarantee of a zero total bill. Domains, analytics, dynamic services and future terms are separate. [Static billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [limits](https://developers.cloudflare.com/workers/platform/limits/).

If 50,000 genuinely cold visits/day each download an assumed 5 MB, transfer is **7.5 TB/month** decimal. This is not measured project traffic and not equivalent to DAU; cached sessions differ. Check egress/latency/cache hits before expanding origin spend.

## Decisions and next ticket

Recommend release-readiness/private-playtest work first: actual devices, minimal measurement protocol, cultural/asset-rights review of what ships and a portal-compatibility audit. Submission/owned-site deployment follows in its own authorized ticket after a concrete reviewable build.

Director choices remain: comparison sequence; owned/multi-portal distribution versus exclusivity; future ad/reward design; target devices; verified payment identity/settlement; pilot budget and success criteria. Missing evidence includes actual traffic/retention/eCPM, payout approval, costs/tax treatment, offers, device performance and public cultural review. No source establishes a particular earnings outcome for Lakhey Run.
