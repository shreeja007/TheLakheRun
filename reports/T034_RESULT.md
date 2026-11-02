# T034 — Existing-game audit and polish

**Implementation state:** COMPLETE  
**Director review state:** ACCEPTED — 2026-11-02, Game Director playtest on Windows desktop (Chrome/Edge) and Android phone (Chrome); see D-016. Cultural/rights review not covered.  
**Date:** 2026-10-14 (Asia/Katmandu)  
**Ticket:** `tasks/T034_EXISTING_GAME_AUDIT_AND_POLISH.md`

## Summary

Wrote root [audit.md](../audit.md) before corrective runtime changes, covering mobile visibility, feedback lifecycle, pause/input/audio/storage behavior, scoring semantics, source/performance risks, assets/provenance, offline behavior and stale approval documentation. Implemented bounded corrections to the current game on `polish/t034-existing-game-audit`, based on clean baseline `fd77bca`.

Replaced overlapping location/record/skill banners with one 24px, single-line feedback area beside the score. Messages expire after 0.85–1.3s, priority prevents routine bursts replacing important announcements, and fresh-run identity/cleanup prevents previous-run timers clearing new feedback. Compact/coarse-pointer layouts and reduced-motion preferences skip decorative DOM confetti/flashes/flying digits. Running score/guardian/multiplier are compact; short landscape places existing controls in one row, retaining 44px touch targets. Best-score details remain in menus/results.

Pause now freezes player/world/guardian/FX simulation. Hiding the document or losing WebGL context pauses a running game and returning requires explicit Resume. Unmuting while paused does not restart music. Saved distance must be finite/nonnegative and coin best a nonnegative safe integer. Pulu crossing results use the correct label; combo feedback no longer claims nominal points that scoring did not award. Audio HUD writes are skipped when unchanged and hidden diagnostics no longer update every telemetry callback.

No new gameplay features or mechanics, difficulty/hitbox/scoring-rule changes, new art/models/audio, dependency changes, cultural or engine approvals, monetization/services, remote push or deployment. Verified 394 protected files unchanged, including art/model assets, player/guardian/world/FX/input implementations, tutorial/install behavior, worker/build snapshot source and owner status/decision documents.

## Changed files / assets

| Path | Why changed |
|---|---|
| `audit.md` | Requested deep audit, finding IDs, evidence and corrections/deferred boundaries |
| `index.html` | Replace three overlapping feedback surfaces with one HUD slot; remove obsolete banner/card CSS |
| `src/ui/RunFeedback.ts` | One-message priority, expiry, event consumption, pause/retry cleanup and truthful bonus presentation |
| `src/ui/mobile.css` | Compact running HUD, bounded text, stable multiplier and one-row short-landscape controls |
| `src/main.ts` | Feedback integration, interruption pause, decorative guards/cleanup, Pulu results label and less redundant HUD work |
| `src/game/GameManager.ts` | Complete pause freeze and reset/retry identifier for feedback lifecycle |
| `src/game/ScoreManager.ts` | Validate persisted best values without changing storage keys or scoring rules |
| `src/audio/SoundManager.ts` | Unmute changes gain; existing START/Resume owns music startup |
| `scripts/test-polish.mjs` | Focused viewport, feedback priority/timing, pause/retry, music/interruption, reduced-motion and storage regressions |
| `scripts/test-ui-mobile.mjs` | Hold simulation time during real touch-state assertions, release completed software-GPU contexts, wait for game readiness after worker reopen, update obsolete feedback selector |
| `README.md`, `tasks/00_TASK_INDEX.md`, `tasks/T034_EXISTING_GAME_AUDIT_AND_POLISH.md` | Incidental scoped authorization/tracking and reproducible run/check instructions |
| `reports/evidence/T034/`, `reports/T034_RESULT.md` | Fresh before/after screenshots, build/tests, dependency audit, preservation and completion evidence |

## Verification commands and results

- Baseline `npm run build 2>&1 | Tee-Object -FilePath reports/evidence/T034/before/build_output.txt`: PASS; 1,276 modules, 33 offline files, 11,389,014 raw bytes.
- `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4190 --strictPort`: local production preview, no deployment.
- Baseline `$env:UI_TEST_URL = 'http://127.0.0.1:4190'`, `$env:POLISH_BASELINE = '1'`, then `node scripts/test-polish.mjs`: PASS; five controlled viewport captures/measurements in `before/`.
- Baseline combined `npm run test:ui`: FAILED at its short-lived jump polling assertion after five preceding checks passed. Repeated on the corrected build without concurrent captures, confirming that concurrency was not a sufficient explanation. The check now holds engine simulation time during real CDP touch gestures, then restores it before remaining tests. Actual collision/progression is independently exercised by the maintained suite; the game input/physics code was not changed to satisfy the test.
- Final `npm run build 2>&1 | Tee-Object -FilePath reports/evidence/T034/after/build_output.txt`: PASS; TypeScript/Vite, 1,277 modules, 33 offline files, **11,382,730 raw bytes**, version `6da144e120cfb60a`. Existing large-chunk warning remains. No physical-device FPS claim.
- Final combined `$env:UI_TEST_URL = 'http://127.0.0.1:4190'`, `$env:UI_TEST_EVIDENCE_DIR = 'reports/evidence/T034/after'`, then `npm run test:ui`: PASS; **18 checks** on Chrome 155.0.8059.40, including real worker update/activation, offline current assets, touch/input/tutorial, layouts, storage/install/startup failures and no unexpected monitored page errors.
- Final `node scripts/test-polish.mjs` with `UI_TEST_URL` above and `POLISH_BASELINE` removed: PASS; **six cases**: all five viewports plus corrupt-storage/reduced-motion. Includes airborne pause, rapid zero-distance retry, priority/expiry/no stacking, unchanged 44px controls, music/context/visibility behavior and truthful combo/record assertions. No unexpected page errors.
- An initial focused assertion ran after screenshot capture and missed the intentionally short message expiry. Final focused checks freeze the browser clock during screenshots and advance it explicitly for expiry assertions; this fixes the test observation window without lengthening game popups.
- A subsequent focused run passed all five viewports but its last reduced-motion context hit a clock-install/pause race (“Cannot fast-forward to the past”). Clock setup now pauses at a future virtual timestamp before gameplay, avoiding setup latency races; all gameplay expiry assertions still use the original durations.
- A combined rerun passed the touch/offline/install/failure checks and worker waiting/cache assertions, then timed out at reopened-page `goto(..., waitUntil: 'load')`. Completed emulated scenes were retained. The harness now releases each completed context and waits for DOM plus explicit game readiness on reopen; worker/cache assertions are retained. This observation alone does not certify a game or worker defect.
- `npm audit --json`: PASS, **zero reported vulnerabilities**; registry result saved in `dependency_audit.json`. This is not certification of all security properties.
- `git diff --exit-code fd77bca -- public art-source src/runner src/world src/fx src/input src/ui/ControlsTutorial.ts src/ui/HomeScreen.ts scripts/pwa-build.mjs scripts/sw-template.js docs/00_PROJECT_STATUS.md docs/10_DECISIONS.md`: PASS; Git content preservation. JSON inventory: 394 tracked protected files, zero differences.
- `git diff --check`: PASS; informational LF/CRLF notices only.

## Browser and device tests

- Tested: Windows, local headless Chrome 155.0.8059.40 with ANGLE SwiftShader software WebGL; desktop and Pixel-style touch emulation. Focused layouts: 320×568, 390×844, 667×375, 844×390, 1280×800. Reduced-motion preference and synthetic context/visibility interruption tests are explicit harness checks.
- Controlled presentation captures freeze automatic game simulation; actual location/milestone producers are exercised with collision disabled only for those captures. Burst/record/combo presentation checks inject event objects. This does not certify hazard fairness, complete end-to-end milestone survival or actual GPU context restoration.
- Not tested: physical Android/iPhone, actual Safari/Firefox/Edge, OS installation, phone toolbar/safe-area behavior, hardware GPU/FPS/heat, cultural review or external hosting/HTTPS.
- In-app browser bootstrap failed with missing sandbox metadata; local Playwright was used as fallback. No claim of interactive in-app testing.
- Manual acceptance steps are in `audit.md`; review mobile running view, transitions, pause mid-jump/intro, app switching, all swipes/buttons, catch/retry, audio and real-phone offline behavior when an authorized HTTPS target is available.

## Evidence

- [Before 390px milestone](evidence/T034/before/milestone-390x844.png), [after 390px milestone](evidence/T034/after/milestone-390x844.png).
- [Before 320px milestone](evidence/T034/before/milestone-320x568.png), [after 320px milestone](evidence/T034/after/milestone-320x568.png).
- `evidence/T034/before/` and `after/`: five-view initial/milestone/burst captures and `polish-verification.json`, plus combined-suite UI/PWA/failure screenshots and exact build/test output.
- [Layout comparison metrics](evidence/T034/comparison.json).
- [Dependency audit](evidence/T034/dependency_audit.json), [protected-content verification](evidence/T034/preservation.json).

## Assumptions, defects and blockers

- This is an existing-game polish ticket. Implementation and final checks are complete; director/device acceptance remains pending. Committed on the review branch and fast-forwarded into local master on 2026-11-02 after director acceptance (D-016); no remote push.
- Large engine chunk and ~11.4 MB offline snapshot remain. Software-WebGL counters and emulated layouts are not hardware performance benchmarks.
- Low-FPS coin/contact fairness, dynamic-obstacle reachability, per-frame 3D emission rates, camera shake/sway under reduced motion, denied AudioContext recovery and simultaneous producer-event overwrites remain audit review items. No speculative physics/render rewrites were made.
- Scoring still displays and persists distance; the product role of computed total score needs director clarification. No new score awards were invented.
- Culturally sensitive art/audio claims and upstream rights remain pending informed review. Existing provenance records do not independently certify cultural authenticity/rights.
- Original planning status/decision documents remain stale; this ticket does not record owner acceptance or select the engine on the director's behalf.
- Hosting still uses origin-root asset/worker paths and needs supporting HTTPS for physical-phone installation/offline checks. No deployment occurred.

## Director approvals requested

Review the current mobile feedback density/readability and interruption/resume behavior on actual hardware; accept or request a targeted correction. Reconcile remaining product/cultural/engine decisions separately. No additional permission was required to implement this directly authorized audit/polish work.

## Suggested next ticket

One real-device validation and measured-performance ticket, using failures observed on the director's available Android/iPhone/browser hardware. Do not start it automatically.
