# T032 — Option C integration and combined-game verification

**Implementation state:** COMPLETE

**Director review state:** PENDING

**Date:** 2026-10-13

**Ticket:** `tasks/T032_OPTION_C_INTEGRATION.md`

## Summary

Integrated Option C into the original development project's current code after the separately committed T031 research transfer. Ported bounded HTML/main/game/input changes rather than replacing source files. Preserved friend-side movement styles, tease inputs/behavior, audio, Pulu crossing and rath procession code and all models/art.

The normal HUD hides developer diagnostics; `/?debug=1` enables them. First Play opens skippable/persistent four-step control rehearsal; help replays it without moving the runner. Added Play, pause panel/Resume, native-button input isolation, pointer capture/cancel handling, accessible mute state and actionable startup failure. Wired manifest/install guidance and versioned production offline saving. Extended the old snapshot with the original's Pulu and three rath GLBs; all seven active model URLs are included. Saved updates wait until all game tabs close.

Documented this original folder as the active workspace for future authorized work, retained the sibling project as reference and supplied coordination/physical-device review instructions. Automated combined-game verification is part of this ticket; technical completion remains pending director acceptance and real-device testing.

No new mechanics/models/choreography, placement, ads/tracking/payments/accounts, remote merge/push, deployment, paid service or owner decision-log edits. Research was transferred in T031 without approving a business model. Sibling source/reference workspace was not altered or deleted.

## Changed files / assets

| Path | Why changed |
|---|---|
| `index.html` | Production metadata/manifest, startup fallback, diagnostics classes, menus/dialogs and touch-aware preserved tease labels |
| `src/main.ts` | UI/style wiring, modal action guard, help/install/play/resume handlers, accessible mute, state visibility, focus and startup-ready event; preserve friend's tease handlers |
| `src/game/GameManager.ts` | Seven-line modal action guard/API addition; friend logic preserved |
| `src/input/InputManager.ts` | Native-key activation isolation and primary-pointer capture/cancel; T/E mapping preserved |
| `vite.config.ts` | Register existing production PWA plugin |
| `package.json` | Restore icons and test:ui scripts; no dependency change |
| `scripts/pwa-build.mjs` | Add four active festival GLBs to versioned precache |
| `scripts/test-ui-mobile.mjs` | Fresh T032 evidence, software-renderer test setup, additional tease/Resume/offline-festival assertions and fixed-step real-collision check |
| `README.md`, `docs/MIGRATION_WORKSPACE.md` | Incidental run/verification/workspace/coordination links and manual review steps |
| `tasks/T032_OPTION_C_INTEGRATION.md`, `tasks/00_TASK_INDEX.md` | Authorization, scope and phase review row |
| `reports/evidence/T032/` | Build/test output, fresh screenshots, verification/preservation JSON, bounded port procedure and final checks |
| `reports/T032_RESULT.md` | Mandatory completion report |

Existing UI helper modules, mobile CSS, worker template, manifest/icons and all art/model files were reused unchanged. Existing T016 evidence was not overwritten.

## Verification commands and results

- `node reports/evidence/T032/port_option_c.mjs`: bounded historical diff applied after preflight, preserving friend's extra tease hint/button in context. Initial unadapted HTML preflight failed safely with no edits; one shell quoting attempt failed before running. The successful procedure was changed to generate its reference diff in memory rather than retaining a whitespace-heavy patch artifact. Do not rerun on an already integrated checkout; preflight will refuse.
- `npm run build`: PASS; TypeScript and Vite complete. Final production offline snapshot: **33 files, 11,389,029 raw bytes**, version `ac852552b188dddc`. Existing large-chunk warnings retained; no performance certification claimed.
- `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4184 --strictPort`: local production review server, no external deployment.
- PowerShell `$env:UI_TEST_URL = 'http://127.0.0.1:4184'`; `npm run test:ui`: PASS, **17 checks on Chrome 155.0.8059.39**. Includes production/debug HUD, rehearsal persistence/replay/input isolation, native Enter controls, Resume, tease cancellation by lane movement, touch left/right/jump/slide, cancel/multi-touch, viewport bounds, actual offline launch/play and offline festival asset fetches, icon/manifest/cache URLs, denied storage, synthetic install dismissal, emulated iPhone/standalone guidance, registration/WebGL failure and real worker update activation/cache cleanup without reloading a paused run. No unexpected uncaught page errors.
- Test adaptation: tease/swipe tests now wait for the friend's existing intro cinematic to finish. A 25-second wall-clock collision wait timed out under software WebGL, so the test drives real `game.update(1/60)` calls until actual collision/catch completion, without forcing state/game-over. Latest run reached GAME_OVER after 422 updates, at 39.911m. Initial desktop GPU context is closed before mobile checks. Earlier failing attempts are documented here, not concealed.
- In-app Browser skill connection failed on missing `sandboxPolicy` tool metadata before connection. Used existing headless Playwright fallback, Chrome/ANGLE SwiftShader; no upload or browser permission prompt.
- `node reports/evidence/T032/verify_preservation.mjs`: PASS, **421 of 429 protected files unchanged**, only the eight authorized HTML/package/build/test/main/game/input/config files differ; friend animation/audio/world source and all art/models unchanged. All seven active `/models/*.glb` URLs are precached.
- `git diff --check`, `git diff --cached --check`: final checks recorded before phase commit.
- Visually inspected final desktop Ready, mobile Ready/Home screen and 667x375 landscape screenshots. Fresh evidence is separate from old T016 files. Local preview remains available at `http://127.0.0.1:4184/` for director review while the preview process runs.

## Browser and device tests

- Tested: Windows headless Chrome via software WebGL2; 1280x800 desktop, Pixel-style touch emulation at 360x780, layout checks at 320x568, 390x844, 667x375 and 844x390. iPhone UA/standalone/install events are emulations, not Safari/OS installation tests. Real local service-worker caching, offline launch/festival fetches, denied storage and registration/WebGL failure cases exercised.
- Not tested: physical Android/iPhone, Safari/Firefox/Edge, OS-level installation, hardware-GPU FPS, heat/real touch comfort, every animation variant, full Pulu collision tuning or external hosting/HTTPS. Manual checklist is in `docs/MIGRATION_WORKSPACE.md`.

## Evidence

- `reports/evidence/T032/build_output.txt`, `test_output.txt`, `verification.json` — fresh command results.
- `reports/evidence/T032/desktop-ready.png`, `desktop-tutorial.png`, `desktop-paused.png`, `desktop-results.png`, `desktop-debug.png` — production/debug UI states.
- `reports/evidence/T032/mobile-ready.png`, `mobile-tutorial.png`, `mobile-running.png`, `mobile-home-screen.png`, `mobile-offline-running.png`, `layout-*.png` — touch/viewport/offline screenshots.
- `reports/evidence/T032/update-waiting.png`, `webgl-unavailable.png`, `ios-install-guidance-emulated.png` — update/failure/emulation evidence.
- `reports/evidence/T032/preservation.json`, `preservation_output.txt` — friend/runtime/art preservation and precache coverage.
- `reports/evidence/T032/completion_checks.txt` — final checks and commit scope.

## Assumptions, defects and blockers

- Research/math and art do not become owner-approved by migration. This local branch contains phase 1 and phase 2 commits; friend/master history was not rewritten or blindly overwritten. Physical review remains required.
- Offline game uses origin-root URLs and worker scope; subdirectory/portal hosting is outside this ticket. Browser cache can be evicted; install/offline menus describe that limitation. No phone HTTPS staging was created.
- Software WebGL emulation is functionally useful but not a phone or reliable real-time performance measurement. Large PlayCanvas/current-game bundles remain an existing performance review item; added festival caching is necessary to preserve current offline behavior.
- Conditional gameplay tests respect current intro/tease gates; fixed-step collision is a simulation regression, not a hands-on wall-clock playtest.
- No preservation discrepancies outside the eight authorized integration files. No later Pulu refinement/building placement ticket started.

## Director approvals requested

- Test and accept the integrated UI/game on available desktop/phone devices. No extra confirmation was needed to execute the explicitly authorized migration sequence.
- Art direction, cultural acceptance, monetization, hosting and future gameplay remain separate decisions. No acceptance recorded on the owner's behalf.

## Suggested next ticket

- After director/device review, authorize one targeted fix or performance/device-validation ticket based on observed results. Pulu appearance refinement and building/gateway placement remain separate future work; neither starts automatically.
