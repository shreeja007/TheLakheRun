# Lakhey Run — existing-game audit and polish

**Date:** 2026-10-14 (Asia/Katmandu)  
**Ticket:** [T034](tasks/T034_EXISTING_GAME_AUDIT_AND_POLISH.md)  
**Baseline:** `fd77bca` (`stable v1`); clean local `master` before work. Work branch: `polish/t034-existing-game-audit`.  
**Scope:** Inspect and polish what exists. No new game development, mechanics, assets, services or deployment. Technical delivery remains pending director acceptance.

## Assessment

There is a substantial PlayCanvas/TypeScript/Vite runner in this repository, despite the old planning documents describing an unstarted experiment. The most immediate playability issue is presentation: the same event can place a location banner, a milestone card, flying digits and confetti over the road. Smaller CSS alone cannot resolve simultaneous overlays. The correction should consolidate transient feedback beside the score, leave the central view clear and avoid emitting decorative DOM effects on compact screens.

This audit was written before corrective runtime changes. The findings and verification ledger below now include the completed corrections and final checks. Source inspection is evidence of a code path, not certification of device performance, cultural accuracy or gameplay fairness.

## Inspection and evidence

- Read root instructions, overview, status, decisions, latest integration/result, UI/accessibility, architecture and QA documents.
- Inspected `src/main.ts`, `types.ts`, game/scoring, keyboard/pointer input, tutorial/install dialogs, player/guardian progression and camera, obstacle/coin spawning and collision, road/biome recycling, particle pools, audio initialization/scheduler and production service worker/build snapshot.
- Reviewed existing combined Playwright checks and selected historical scratch scripts; inspected representative generated-asset provenance and editable-source inventories. This is not a complete rights chain or cultural review.
- Fresh baseline `npm run build`: PASS. 1,276 transformed modules; 33 offline files, 11,389,014 raw bytes; existing large-chunk warning. Engine/application chunk is 2,092.84 kB minified, 542.07 kB gzip. The offline snapshot byte count is raw content, not measured network transfer.
- Baseline combined UI/PWA output and controlled mobile feedback captures are preserved under [before evidence](reports/evidence/T034/before/). Controlled HUD captures exercise actual biome/milestone producers with rendering active, automatic simulation frozen and collision disabled solely for reproducible presentation measurement. Actual collisions remain tested by the existing combined suite.
- In-app browser connection failed before bootstrap with missing `sandboxPolicy` metadata. Existing local Playwright/Chrome is used as the fallback for regression checks and screenshot evidence. Software WebGL and device emulation cannot certify physical rendering or touch comfort.

## Findings and correction decisions

| ID | Priority | Evidence / player impact | Correction / disposition |
|---|---|---|---|
| A01 | High | `main.ts` shows a three-line location toast for 3.2s plus exit; `index.html` places two skill cards at 25% height. Record and location banners share the same top position. Milestones also spawn flying digits and 38 full-height confetti particles. Overlapping information obscures hazards, especially on phones. | Implement one bounded, single-line feedback area in the HUD. Location/milestone information appears once. Priority prevents routine bursts replacing records/location changes; no message queue or stacking. |
| A02 | High | Narrow running HUD stacks distance/best/coins, guardian and multiplier. Bottom pad/action rows occupy more short-landscape space than necessary. Location text has `white-space: nowrap`; popup size is not tested by existing layout assertions. | Compact the existing running header and feedback; retain distance/coins/guardian/multiplier and all controls. Best remains available outside a run/results. Arrange existing buttons in one row on short landscape. Check 320×568, 390×844, 667×375, 844×390 and desktop. |
| A03 | Medium | Presentation timers are spread throughout `main.ts`. `activeCallout` remains in cached telemetry, tracked only by timestamp; READY resets `activeBiome`, but direct retry transitions RUNNING→RUNNING and can retain location identity. Delayed banner/confetti callbacks can clear a newer message. | Centralize transient feedback expiry/state in a small UI presenter; consume event identity once, reset on fresh runs and clear timers/decorative effects on interruption. Do not replay expired feedback on resume. |
| A04 | High | No `visibilitychange` pause exists; `webglcontextlost` only logs. Returning after an interruption can continue a live run. | Use the existing pause action when the document becomes hidden or context is lost. Require the existing explicit Resume. No automatic restart. |
| A05 | High | `GameManager.update()` continues calling player/road/guardian/FX while PAUSED. Player intro, lane spring, airborne/slide/tease timing and camera continue independently of the forward-distance `isRunning` gate. | Return after telemetry while PAUSED so the existing simulation is frozen; verify pause during lane/jump/intro rather than checking distance alone. |
| A06 | Medium | `SoundManager.toggleMute()` starts music whenever unmuted and not playing, including PAUSED/READY/results, undoing pause's `stopMusic`. | Unmute changes master gain only; existing START/Resume owns scheduler startup. Test paused mute/unmute and resume. |
| A07 | Medium | Score loader accepts `Infinity` as a nonnegative distance (`parseFloat` and `isNaN`); partial numeric strings are accepted. Invalid persisted values can enter HUD/best logic. | Require finite, nonnegative numeric distance and safe-integer coin values. Retain storage-denied in-memory fallback and existing keys. |
| A08 | Medium | CSS reduced-motion hides some DOM animations but JS still creates effects. Mobile screen flashes tint the road; full-page confetti and flying digits compete with hazards. | Skip decorative DOM creation on compact screens or reduced-motion preference; retain existing 3D/audio feedback. Camera shake/sway and 3D effects need a separately measured accessibility pass; do not claim full reduced-motion support. |
| A09 | Medium | Main telemetry rewrites audio labels/attributes and diagnostics every simulation frame even when diagnostics are hidden; multiplier classes and queries are repeatedly rebuilt. | Avoid unchanged audio writes and hidden diagnostic writes; cache stable DOM references. Bound feedback timers. Larger render/allocation changes require profiling rather than speculative rewrites. |
| A10 | Review | Movement uses delta time and the main loop clamps spikes; ambient/aura/trail emissions use per-frame `Math.random()` thresholds. Coin pull uses an Euler step and can vary at low FPS. | Deferred pending target-device profiling. Existing movement and 3D emission rules are preserved. Coin/collision/low-FPS fairness remains unverified; changing collection/hitboxes or particle rates requires targeted evidence and acceptance. |
| A11 | Review | Obstacle generator's comments claim fairness, but dynamic gates/Pulu crossings and optional safe-lane hazards are not validated by path search or human input timing. Existing tests confirm an unattended collision and retry, not all-seed reachability. | No difficulty/spawn/hitbox change. Add real-device playtest cases; do not certify fairness from source comments. |
| A12 | Review | Raw offline snapshot is ~11.4 MB, large engine chunk persists, scene is procedural and contains many entities. Pools/recycling and DPR cap 1.75 already exist. No measured agreed phone/FPS/heat budget. | Log build and scene metrics as descriptive evidence only. No asset compression, dependency/engine migration or invented FPS target. Real hardware profiling is the next boundary. |
| A13 | Review | Active code includes coins, slide, biomes, Pulu and raths while 2026-10-09 status/decision documents still mark much of this proposed/deferred. Task queue's introductory state conflicts with implemented rows. | Record inconsistency here and link this ticket/result in README/task index. Preserve owner decision log and old status; director must reconcile approval history. |
| A14 | Review | Generated/editable asset provenance exists, but draft records explicitly disclaim independently verified upstream ownership/cultural authenticity. Some old reports/audio comments nevertheless say “authentic” or “zero licensing risks.” | No cultural/rights certification. Preserve assets and sources. Director/cultural reviewer must validate current depictions and claims before release. No imported online media in this ticket. |
| A15 | Medium / Review | Existing `test:ui` is the maintained combined suite. Its short-lived touch-state polling failed on baseline and again without concurrent captures. A later run timed out on worker reopening with multiple completed software-GPU scenes retained. Some scratch scripts use historical selectors. `InputManager.dispose()` does not detach DOM listeners, but current retry reuses that manager. | Hold simulation time during actual touch assertions, release completed contexts, and explicitly wait for game readiness on worker reopening. Add focused timing/viewport regressions; preserve old scripts/evidence. No unused input lifecycle redesign. |
| A16 | Review | Worker caches an atomic versioned snapshot and waits for all tabs to close; models and registration use origin-root URLs. Dev has no worker. Real-phone installation requires supporting browser/HTTPS. | Preserve worker semantics, rerun offline/update tests. No hosting change or deployment. Subpath hosting remains unsupported until scoped separately. |
| A17 | Medium | Results cause mapping falls through to “Terracotta Obstacle” for `PULU_KISI_CROSSING`, although the collision type is known. | Correct that existing results label to “Pulu Kisi crossing.” |
| A18 | Medium / Review | Combo/record callout objects contain nominal `points` that are not credited to bonus score. Distance is the actual displayed/persisted best metric; `totalScore` is calculated but not displayed as a score. Several event producers overwrite the single active callout in the same frame. | Suppress unawarded combo bonus digits in HUD/decorations; record feedback already shows no points. Preserve scoring rules. Total-score/product semantics and loss of simultaneous event signals need director review; do not invent new awards or queues. |
| A19 | Review | AudioContext creation can throw, and `resume()` rejection is not handled locally. Startup fallback handles initial module failure, but it does not establish recovery from later audio/device failures. | Deferred: synthetic denied-AudioContext/device-switch coverage is absent. No claim that every browser audio failure is recovered. |

## Implementation checklist

- [x] A01–A03: one compact feedback area; priority/expiry/retry/pause cleanup; narrow/landscape HUD.
- [x] A04–A06: interruption pause, complete pause freeze, mute does not restart paused music.
- [x] A07: robust persisted score validation.
- [x] A08–A09: decorative DOM emission guards and less redundant HUD work. A10 remains a measured-device follow-up.
- [x] A17–A18: correct Pulu results label and stop showing unawarded combo points.
- [x] Fresh build, existing combined checks, focused correction regressions and before/after screenshots.
- [x] Final audit evidence ledger and mandatory [T034 result](reports/T034_RESULT.md).

## Manual acceptance checklist

1. On a real phone, complete/skip rehearsal; play through 140m/280m/420m transitions. Read the location without losing sight of the next obstacle. Skill and coin bursts should not stack over the road.
2. Check all buttons and swipes in narrow portrait and short landscape; rotate during a run. Check OS safe areas and browser toolbar expansion/collapse.
3. Pause mid-jump/lane change and during the intro; wait, then resume. The pose/progression should be preserved. Mute/unmute while paused should not start music.
4. Switch apps/tabs during a run; return to a paused screen and resume deliberately. Test real context loss/recovery when possible; synthetic tests cover only listener behavior.
5. Catch/retry repeatedly; no stale popup from the last run. Personal best, coins, tease variants and festival assets should remain available.
6. Check Android Chrome and iPhone Safari startup/audio/touch/FPS/heat on actual hardware, then installation/offline/update on separately authorized HTTPS staging.

## Verification ledger

Final build: PASS. Existing combined UI/mobile/PWA suite: **18 checks passed**. Focused polish suite: **six cases passed** (five viewport sizes plus corrupt storage/reduced motion), with no unexpected page errors. Dependency registry audit: zero reported vulnerabilities. Protected content: **394 files unchanged**. Final offline snapshot: 33 files, 11,382,730 raw bytes; large-chunk warning remains.

Corrected findings: A01–A09, A17 and A18's misleading bonus presentation; A15's maintained-test observation/resource issues were corrected. Remaining A10–A14, A16, A19 and the broader scoring/event/fairness aspects of A18 remain measured-device/director review items. No new mechanics, assets, services or deployment. Committed and merged into local master on 2026-11-02 after director acceptance (D-016).

Exact commands, intermediate failures and harness corrections are in [T034 result](reports/T034_RESULT.md). See [combined verification](reports/evidence/T034/after/verification.json), [focused verification](reports/evidence/T034/after/polish-verification.json), [comparison data](reports/evidence/T034/comparison.json) and [preservation](reports/evidence/T034/preservation.json). The original short jump-state polling failed twice; holding simulation time during real touch assertions resolved it. A worker reopen timeout was resolved by releasing completed contexts and explicitly waiting for game readiness. Focused screenshot/clock observation races were corrected without extending popup lifetimes.

| Viewport | Old location card height | New feedback height | Old gap below lowest HUD/message | New gap |
|---|---:|---:|---:|---:|
| 320x568 | 69px | 24px | 190.4px | 355.7px |
| 390x844 | 69px | 24px | 427.1px | 631.7px |
| 667x375 | 69px | 24px | 68px | 211.7px |
| 844x390 | 69px | 24px | 83px | 226.7px |
| 1280x800 | 69px | 24px | 421.8px | 587.7px |

These are snapshot layout measurements between the lowest HUD/message and the controls, excluding decorative/3D effects. They are not FPS measurements or guarantees of obstacle visibility. Compact screenshots/tests emitted zero decorative DOM confetti, flashes or flying scores. Existing 3D particles/audio remain.

Compare [before mobile milestone](reports/evidence/T034/before/milestone-390x844.png) with [after mobile milestone](reports/evidence/T034/after/milestone-390x844.png), and [before short landscape](reports/evidence/T034/before/milestone-667x375.png) with [after short landscape](reports/evidence/T034/after/milestone-667x375.png). Do not interpret emulated layouts/software-WebGL screenshots as physical-device or performance acceptance.

Director acceptance is pending for mobile density/readability, pause/interruption behavior, actual phone touch comfort/performance and all existing cultural/rights/engine/product gates. Suggested next ticket: real-device validation of this existing game, followed by observed corrections only. It has not been started.
