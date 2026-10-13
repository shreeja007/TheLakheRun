# T016 — Production HUD, controls tutorial and home-screen support

**Implementation state:** COMPLETE
**Director review state:** PENDING

**Date:** 2026-10-11

**Ticket:** `tasks/T016_UI_MOBILE_HOME_SCREEN.md`

**Branch:** `ticket/t016-ui-mobile-home-screen`

## Summary

Implemented the directly authorized Option C against the existing runner. The default HUD now keeps the distance/best, existing coins/combo and guardian meter while hiding developer diagnostics, Reset and seed controls. `/?debug=1` restores diagnostics. Menu UI has clear Play/Resume/Retry actions, accessible mute state and focus, safe-area padding, compact touch targets and portrait/landscape layouts. Mobile Ready hints describe swipes rather than keyboard keys.

First Play opens a four-step, skippable controls rehearsal. Real swipes and keyboard directions advance it; Next lets players review without practising. Gameplay remains stationary until completion/skip. Completion is persisted when browser storage is available, otherwise remembered for the session. How to play reopens the guide from Ready, Paused or Results. Native button Space/Enter no longer also triggers game input; cancelled/secondary touches do not accidentally start runs. The existing Pause button now resumes correctly.

Added a manifest, original geometric placeholder icons, Apple launch metadata, a home-screen help dialog, optional browser install prompt and production-only offline caching. The build generates a content-versioned game snapshot; it excludes inspector pages/bundles and unused character models. Existing runtime models/textures are included without changing them. Updates wait for all game tabs to close; no forced reload or replacement of assets during a run. Saving/installation failures preserve browser play. A loading/failure screen handles unavailable WebGL or a failed module download. Reduced-motion CSS suppresses UI animation/flashes/confetti; it does not change the existing 3D camera animation.

**Unchanged:** Tuku/Lakhey model files, character animation code/viewers, collision/timing/score rules, obstacle generation, audio composition, engine choice, server/DNS/hosting and decision log. No new gameplay, power-ups, purchased services, external art/fonts or deployment.

## Changed files / assets

| Path | Why changed |
|---|---|
| `index.html` | Manifest/launch metadata, explicit Play, pause panel, accessible dialogs, startup failure UI and touch hints. |
| `src/ui/mobile.css` | Default/debug visibility, responsive HUD/dialogs, touch/focus/safe-area styling, reduced-motion UI handling. |
| `src/ui/ControlsTutorial.ts` | Safe first-run rehearsal, practice gesture handling, skip/replay/storage fallback. |
| `src/ui/HomeScreen.ts` | Install prompt/manual instructions, standalone handling, offline/update/error status. |
| `src/main.ts` | Connect UI modules, input guard and state/focus behavior; fix Pause→Resume; debug-only FPS updates. |
| `src/game/GameManager.ts` | Small UI action guard before existing action processing; gameplay branches unchanged. |
| `src/input/InputManager.ts` | Respect native keyboard button activation; pointer capture and cancellation/secondary-touch safety. |
| `src/vite-env.d.ts` | Type Vite's development/production flags. |
| `public/manifest.webmanifest` | Name, scope/start URL, standalone launch and icons; no orientation lock. |
| `public/icons/*` | Editable SVG, 192/512px icons, maskable 512px, Apple 180px and provenance. |
| `scripts/generate-app-icons.mjs` | Reproducible original lane/arrow icon generator using built-in Node APIs. |
| `scripts/pwa-build.mjs`, `scripts/sw-template.js` | Production snapshot/version generator and scoped offline worker. |
| `scripts/test-ui-mobile.mjs` | Integration checks, isolated real-worker update lifecycle and screenshots/log metadata. |
| `vite.config.ts`, `package.json` | Build plugin and `icons`/`test:ui` commands; no dependencies added. |
| `README.md`, `tasks/00_TASK_INDEX.md`, `tasks/T016_UI_MOBILE_HOME_SCREEN.md` | Scope/authorization, local verification and operational instructions. Incidental documentation changes support this ticket only. |
| `reports/T016_RESULT.md`, `reports/evidence/T016/*` | Required result, screenshots and verification/build/test evidence. |

## Verification commands and results

- `git switch -c ticket/t016-ui-mobile-home-screen` — created an isolated ticket branch from the initially clean worktree.
- `node scripts/generate-app-icons.mjs` — generated four PNG sizes/variants and editable SVG. PNG dimensions also validated via browser-request tests.
- `npm.cmd run build` (final output captured with `2>&1 | Tee-Object -FilePath reports/evidence/T016/build-output.txt`) — TypeScript and Vite passed; 1,275 modules transformed, 2.73s Vite build. The existing large-chunk warning remains (engine bundle about 2.09 MB uncompressed); no mobile performance certification is claimed.
- `npm.cmd run preview -- --host 127.0.0.1 --port 4173 --strictPort` — local production preview started successfully, no external hosting.
- `npm.cmd run test:ui` (final output captured with `2>&1 | Tee-Object -FilePath reports/evidence/T016/test-output.txt`) — **16 grouped integration checks passed** in headless Chrome 155.0.8059.39. Includes first-run isolation, keyboard/mute/pause, persistence/replay/skip, natural catch/results/retry, touch swipes, cancelled/secondary touches, viewport bounds, manifest/icons/all snapshot URLs, offline reload/play, blocked storage, synthetic install dismissal, standalone/iPhone-UA cases, registration failure, unavailable WebGL and actual worker update/activation/cache cleanup. No uncaught page errors in the monitored normal-play/storage scenarios. WebGL-unavailable test intentionally triggers a boot error and verifies the recovery UI.
- `npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort` plus a one-off Playwright check — development status says offline saving is disabled and there are **zero worker registrations** at that separate origin. Check performed with the following PowerShell command:

```powershell
@'
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForFunction(() => Boolean(window.__game));
  await page.click('#btn-home-screen');
  assert.match(await page.locator('#offline-status').textContent(), /Development preview.*disabled/);
  assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0);
  console.log('PASS Development mode: offline caching disabled, zero service-worker registrations.');
} finally { await browser.close(); }
'@ | node --input-type=module
```

- `git diff --check` — passed; Git's LF→CRLF working-copy notices are informational.
- Earlier update-status assertions failed, exposing stale status on opening the home-screen dialog. Fixed by refreshing status from the live registration when opening it and reporting installed/waiting transitions explicitly; the final real lifecycle test passes.
- Final visual review found a location toast lingering over the Ready card after reset. Non-running states now hide it and cancel both toast timers; viewport checks verify it stays hidden in menus. A multi-touch test also needed its target corrected from the zoomable Ready card to the exposed game canvas.

## Browser and device tests

- **Tested:** Windows NT 10.0.26200.0 host, installed Google Chrome 155.0.8059.39, headless desktop 1280×800; Pixel 5 touch/DPR profile with CDP-dispatched touch gestures; 320×568, 360×780, 390×844 portrait; 667×375, 844×390 landscape; iPhone 13 UA/viewport and standalone-mode emulation in Chrome. Screenshots were visually inspected.
- **Not tested:** Physical Android phones, iPhone/iPad Safari, actual OS home-screen installation/launch, real notches/safe-area insets, Safari/Firefox/Edge execution, sustained device performance/thermal/battery use, screen reader or pinch-zoom use. UA emulation does not constitute Safari testing. Native installation was not performed; install-event behavior was exercised with a synthetic prompt.
- The in-app browser could not connect: two setup attempts failed with missing sandbox metadata. Used the repository's installed Playwright/Chrome tooling as fallback; no claim of in-app-browser verification.

## Evidence

- [Verification metadata](evidence/T016/verification.json), [final build output](evidence/T016/build-output.txt), [final test output](evidence/T016/test-output.txt).
- [Desktop HUD](evidence/T016/desktop-ready.png), [debug HUD](evidence/T016/desktop-debug.png), [paused run](evidence/T016/desktop-paused.png), [results](evidence/T016/desktop-results.png).
- [Mobile Ready](evidence/T016/mobile-ready.png), [swipe guidance](evidence/T016/mobile-tutorial.png), [running HUD](evidence/T016/mobile-running.png), [offline running](evidence/T016/mobile-offline-running.png).
- [320px layout](evidence/T016/layout-320x568.png), [landscape layout](evidence/T016/layout-667x375.png), [home-screen menu](evidence/T016/mobile-home-screen.png), [iPhone guidance emulation](evidence/T016/ios-install-guidance-emulated.png).
- [Waiting update](evidence/T016/update-waiting.png), [unavailable WebGL](evidence/T016/webgl-unavailable.png).
- Final generated offline snapshot: **29 files, 9,275,205 uncompressed bytes (~9.28 MB decimal)**, content version `cdf6120002ef4786`. This is cache payload size, not measured network transfer or a performance budget. Built HTML is 40.83 kB; main UI/game JS is 197.02 kB; UI CSS is 5.08 kB uncompressed. The generated `dist/offline-build.json` lists snapshot URLs/bytes (build output is intentionally Git-ignored).
- Icon source/provenance: `public/icons/PROVENANCE.md`; no external asset copying.

## Assumptions, defects and blockers

- Existing planning/status/decision documents describe a much earlier phase than source/reports. They were not rewritten to imply engine, character, cultural or gameplay acceptance. This ticket records direct Option C authorization only.
- PWA scope and existing absolute model loaders expect origin-root hosting. Subdirectory hosting is not supported by this ticket. A future character path change must update the runtime-model snapshot list in `scripts/pwa-build.mjs`; changes to existing model bytes already change the cache version automatically.
- Production caches the game locally (about 9.28 MB raw); updates temporarily require space for old and new snapshots. Quota/registration failure falls back to online play. Browser eviction may remove saved data. First-time offline visitors cannot load an uncached website; save online first and reload/reopen before testing offline.
- All tabs, including a viewer tab within the worker's root scope, must close for a waiting update to activate. The worker deliberately has no `skipWaiting`, `clients.claim` or reload-on-update handler.
- HTTPS or localhost/loopback is needed for installability; plain HTTP LAN testing cannot establish phone PWA readiness. Manifest and native prompt support vary by browser, and installation stays optional. See [MDN installability guidance](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) and [install prompt behavior](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt).
- Developer handles `window.__game`/`window.__pcApp` remain as before for existing test/profiling compatibility; the debug flag controls HUD visibility, not a security boundary.
- Background auto-pause and reduced 3D camera shake remain separate proposed behavior; this ticket fixes existing explicit pause/resume and UI motion only. No new pause/gameplay policy was silently approved.
- No third-party provenance/cultural acceptance claims were made for existing assets. The new icons are neutral placeholders.

## Director approvals requested

Implementation is **pending acceptance**. Review the HUD spacing, four-step tutorial/skip behavior, placeholder app icon and roughly 9.28 MB offline snapshot on actual phones. Reconcile the old project status/decision record separately. No further implementation permission is needed to complete this ticket; deployment still requires its own ticket.

### Manual acceptance checklist

1. Open the production preview in Chrome/Edge. With fresh site data, select Play; practise left/right/up/down, then repeat with Skip. Confirm the run remains still while learning, then starts once. Repeat after reload; guidance should stay dismissed. How to play should replay it.
2. Run, pause, replay guidance, dismiss it and Resume. Test keyboard focus/Enter/Space and mute. Let Lakhey catch up; Retry should immediately start a clean run.
3. On a real Android phone and iPhone/iPad using an authorized HTTPS test target, test all four swipes, long/cancelled gestures, portrait/landscape resize and real safe areas. Verify lanes remain readable and all actions are reachable. Do not deploy as part of this checklist without authorization.
4. Android: use Install/browser menu; iPhone: Safari Share → Add to Home Screen. Launch the shortcut; confirm standalone appearance and usable touch controls. This step is still untested.
5. Open Home screen; wait for saved status. Reopen online once, then enable airplane mode and launch/retry the game. Test reconnection and the effect of clearing browser site data.
6. On the future authorized staging target, publish a test update only through its deployment ticket. Leave a paused run open: update should wait. Close all game tabs, reopen and check the new build. Local automated lifecycle coverage already passes; actual hosting cache headers/rollback remain unverified.
7. Enable OS reduced motion, verify focus visibility/text readability, and inspect `/?debug=1` separately. Record phone/browser names and any frame/thermal problems rather than inferring production readiness from desktop emulation.

## Suggested next ticket

Propose a bounded **Tuku animation handoff/integration** ticket after your friend delivers the rig/clip names, scale, forward axis and in-place slide/tease/lane-change exports. Validate those against current controls/collision timing without introducing new mechanics. **Not started.**
