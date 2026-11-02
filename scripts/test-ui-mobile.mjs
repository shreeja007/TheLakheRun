import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const origin = process.env.UI_TEST_URL || 'http://127.0.0.1:4173';
const evidence = process.env.UI_TEST_EVIDENCE_DIR
  ? pathToFileURL(resolve(process.env.UI_TEST_EVIDENCE_DIR) + sep)
  : new URL('../reports/evidence/T032/', import.meta.url);
mkdirSync(evidence, { recursive: true });
const results = [];
let browser;
let channel;
for (const candidate of ['chrome', 'msedge', undefined]) {
  try {
    browser = await chromium.launch({ channel: candidate, headless: true,
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    channel = candidate || 'bundled Chromium';
    break;
  } catch (error) { if (!candidate) throw error; }
}
const screenshot = (page, name) => page.screenshot({ scale: 'css', path: new URL(`${name}.png`, evidence).pathname.replace(/^\/(\w:)/, '$1') });
const state = page => page.evaluate(() => window.__game.getState());
const record = (name, detail = 'passed') => { results.push({ name, detail }); console.log(`PASS ${name}: ${detail}`); };
const ready = async page => {
  await page.goto(origin);
  await page.waitForFunction(() => Boolean(window.__game && window.__pcApp));
};
async function insideViewport(page, selectors) {
  const violations = await page.evaluate(selectors => selectors.flatMap(selector => {
    const el = document.querySelector(selector);
    if (!el || !el.getClientRects().length) return [`${selector}: not visible`];
    const r = el.getBoundingClientRect();
    return r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1
      ? [`${selector}: ${JSON.stringify({ x: r.x, y: r.y, width: r.width, height: r.height })}`] : [];
  }), selectors);
  assert.deepEqual(violations, []);
}
async function swipe(page, locator, dx, dy) {
  const box = await page.locator(locator).boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 4; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 4, y: y + dy * i / 4 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  assert.equal(await page.locator('.hud-panel').isVisible(), false);
  assert.equal(await page.locator('#btn-reset').isVisible(), false);
  assert.equal(await page.locator('#btn-cycle-seed').isVisible(), false);
  await insideViewport(page, ['.score-board', '#btn-audio-toggle', '#btn-play', '#btn-toggle-run']);
  await screenshot(page, 'desktop-ready');
  await page.click('#btn-play');
  assert.equal(await page.locator('#controls-tutorial').evaluate(el => el.open), true);
  assert.equal(await state(page), 'READY');
  await page.keyboard.press('KeyT');
  assert.equal(await page.evaluate(() => Boolean(window.__game.getPlayer().getTelemetry().isTeasing)), false);
  assert.match(await page.locator('#tutorial-progress').textContent(), /1 \/ 4/);
  await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('#tutorial-feedback').textContent(), /Try/);
  assert.match(await page.locator('#tutorial-progress').textContent(), /1 \/ 4/);
  await screenshot(page, 'desktop-tutorial');
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp']) await page.keyboard.press(key);
  assert.equal(await state(page), 'READY');
  assert.equal(await page.evaluate(() => window.__game.getPlayer().getTelemetry().distance), 0);
  await page.keyboard.press('ArrowDown');
  assert.equal(await state(page), 'RUNNING');
  await page.click('#btn-toggle-run');
  assert.equal(await state(page), 'PAUSED');
  await page.focus('#btn-toggle-run');
  await page.click('#btn-resume');
  assert.equal(await state(page), 'RUNNING');
  await page.waitForFunction(() => !window.__game.getPlayer().isIntroActive());
  await page.click('#btn-tease');
  await page.waitForFunction(() => window.__game.getPlayer().getTelemetry().isTeasing);
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => window.__game.getPlayer().getTelemetry().targetLane === 1);
  assert.equal(await page.evaluate(() => Boolean(window.__game.getPlayer().getTelemetry().isTeasing)), false);
  // Clicking mute leaves focus on its button; shortcuts must still reach the game.
  await page.click('#btn-audio-toggle');
  await page.evaluate(() => {
    const game = window.__game;
    const original = game.handleAction;
    window.__shortcutActions = [];
    window.__restoreShortcutHandler = () => { game.handleAction = original; };
    game.handleAction = function (action, source) {
      window.__shortcutActions.push(action);
      return original.call(this, action, source);
    };
  });
  assert.equal(await page.evaluate(() => document.activeElement.id), 'btn-audio-toggle');
  for (const key of ['KeyT', 'KeyE', 'KeyP']) await page.keyboard.press(key);
  assert.equal(await state(page), 'PAUSED');
  await page.focus('#btn-audio-toggle');
  await page.keyboard.press('Escape');
  assert.equal(await state(page), 'RUNNING');
  await page.focus('#btn-audio-toggle');
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#btn-audio-toggle').getAttribute('aria-pressed'), 'false');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#btn-audio-toggle').getAttribute('aria-pressed'), 'true');
  assert.equal(await state(page), 'RUNNING');
  assert.deepEqual(await page.evaluate(() => window.__shortcutActions), ['TEASE', 'TEASE', 'PAUSE', 'PAUSE']);
  await page.evaluate(() => {
    window.__restoreShortcutHandler();
    delete window.__restoreShortcutHandler;
    delete window.__shortcutActions;
  });
  await page.click('#btn-audio-toggle');
  await screenshot(page, 'desktop-focused-shortcuts');
  record('Focused mute button preserves T/E/P/Escape shortcuts and native Space/Enter activation');
  await page.click('#btn-toggle-run');
  record('Friend tease button still works; lane movement cancels tease; dedicated Resume works');
  await page.focus('#btn-toggle-run');
  await page.keyboard.press('Enter');
  assert.equal(await state(page), 'RUNNING');
  await page.click('#btn-toggle-run');
  await page.click('#btn-help');
  assert.equal(await state(page), 'PAUSED');
  await page.keyboard.press('Escape');
  assert.equal(await state(page), 'PAUSED');
  await page.click('#btn-audio-toggle');
  assert.equal(await page.locator('#btn-audio-toggle').getAttribute('aria-pressed'), 'true');
  await page.click('#btn-audio-toggle');
  assert.equal(await page.locator('#btn-audio-toggle').getAttribute('aria-pressed'), 'false');
  await screenshot(page, 'desktop-paused');
  record('Default HUD, keyboard tutorial, no tutorial movement, pause/resume, replay, mute');

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__game));
  await page.click('#btn-play');
  assert.equal(await state(page), 'RUNNING');
  assert.equal(await page.locator('#controls-tutorial').evaluate(el => el.open), false);
  // Software WebGL may advance very few clamped frames in wall-clock time.
  // Exercise real simulation/collision/catch code at a fixed dt, without forcing game over.
  const collisionRun = await page.evaluate(() => {
    const game = window.__game;
    let steps = 0;
    while (game.getState() !== 'GAME_OVER' && steps < 3600) { game.update(1 / 60); steps++; }
    return { state: game.getState(), simulationSteps: steps, distance: game.getPlayer().getTelemetry().distance };
  });
  assert.equal(collisionRun.state, 'GAME_OVER', JSON.stringify(collisionRun));
  await page.waitForSelector('#gameover-modal:not(.hidden)');
  assert.equal(await state(page), 'GAME_OVER');
  await screenshot(page, 'desktop-results');
  await page.click('#btn-modal-retry');
  assert.equal(await state(page), 'RUNNING');
  assert.equal(await page.locator('#gameover-modal').isVisible(), false);
  await page.click('#btn-toggle-run');
  record('Persistent tutorial completion, real collision/catch simulation, results and retry', JSON.stringify(collisionRun));

  await page.goto(`${origin}/?debug=1`);
  await page.waitForFunction(() => Boolean(window.__game));
  assert.equal(await page.locator('.hud-panel').isVisible(), true);
  assert.equal(await page.locator('#btn-cycle-seed').isVisible(), true);
  await page.waitForFunction(() => document.getElementById('fps-val').textContent !== '--');
  await screenshot(page, 'desktop-debug');
  record('Explicit debug HUD and live FPS');
  await page.close(); // Release software GPU work before the emulated phone checks.

  const mobileContext = await browser.newContext({ ...devices['Pixel 5'], viewport: { width: 360, height: 780 } });
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', error => errors.push(error.message));
  await ready(mobile);
  await screenshot(mobile, 'mobile-ready');
  await mobile.click('#btn-play');
  await screenshot(mobile, 'mobile-tutorial');
  await swipe(mobile, '#tutorial-pad', -60, 0);
  assert.match(await mobile.locator('#tutorial-progress').textContent(), /2 \/ 4/);
  await swipe(mobile, '#tutorial-pad', 60, 0);
  await swipe(mobile, '#tutorial-pad', 0, -50);
  assert.equal(await state(mobile), 'READY');
  await swipe(mobile, '#tutorial-pad', 0, 50);
  assert.equal(await state(mobile), 'RUNNING');
  await mobile.waitForFunction(() => window.__game.getPlayer().getTelemetry().distance > 2);
  await mobile.waitForFunction(() => !window.__game.getPlayer().isIntroActive());
  // Keep short jump/slide states observable across CDP round trips on software WebGL.
  // Input still uses real touch events; simulation/collision progression is checked separately.
  await mobile.evaluate(() => { window.__pcApp.timeScale = 0; });
  await swipe(mobile, '#application-canvas', -65, 0);
  await mobile.waitForFunction(() => window.__game.getPlayer().getTelemetry().targetLane === -1);
  await swipe(mobile, '#application-canvas', 65, 0);
  await mobile.waitForFunction(() => window.__game.getPlayer().getTelemetry().targetLane === 0);
  await swipe(mobile, '#application-canvas', 0, -65);
  await mobile.waitForFunction(() => window.__game.getPlayer().getTelemetry().isJumping);
  await swipe(mobile, '#application-canvas', 0, 65);
  await mobile.waitForFunction(() => window.__game.getPlayer().getTelemetry().isSliding);
  await screenshot(mobile, 'mobile-running');
  await mobile.click('#btn-toggle-run');
  await mobile.evaluate(() => { window.__pcApp.timeScale = 1; });
  record('Emulated touch swipes in tutorial and gameplay (left/right/jump/slide)');

  await mobile.evaluate(() => window.__game.triggerAction('RESET', 'Test cancelled/multi-touch'));
  const touchSession = await mobileContext.newCDPSession(mobile);
  // Use the exposed canvas below the Ready card, not the zoomable menu surface.
  const firstTouch = { x: 80, y: 610, id: 1 };
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [firstTouch] });
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [firstTouch, { x: 180, y: 610, id: 2 }] });
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [firstTouch, { x: 260, y: 610, id: 2 }] });
  assert.equal(await state(mobile), 'READY');
  await touchSession.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  assert.equal(await state(mobile), 'READY');
  await touchSession.detach();
  record('Secondary touches and cancelled gestures do not start a run');

  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 667, height: 375 }, { width: 844, height: 390 }]) {
    await mobile.setViewportSize(viewport);
    await mobile.evaluate(() => window.__game.triggerAction('RESET', 'Test layout'));
    assert.equal(await mobile.locator('#run-feedback').isVisible(), false);
    await insideViewport(mobile, ['.score-board', '#btn-audio-toggle', '#btn-help', '#btn-home-screen', '#btn-play', '#btn-toggle-run', '#btn-tease', '#btn-left', '#btn-slide']);
    await mobile.click('#btn-help');
    await insideViewport(mobile, ['#controls-tutorial', '#tutorial-next', '#tutorial-skip']);
    await mobile.click('#tutorial-skip');
    await mobile.click('#btn-home-screen');
    await insideViewport(mobile, ['#home-screen-dialog', '#home-screen-close']);
    await mobile.click('#home-screen-close');
    await screenshot(mobile, `layout-${viewport.width}x${viewport.height}`);
  }
  record('320px portrait through 844px landscape menu/dialog bounds');

  await mobile.setViewportSize({ width: 360, height: 780 });
  await mobile.click('#btn-home-screen');
  await mobile.waitForFunction(() => /Game saved/.test(document.getElementById('offline-status').textContent), { timeout: 20000 });
  await screenshot(mobile, 'mobile-home-screen');
  await mobile.click('#home-screen-close');
  await mobile.reload();
  await mobile.waitForFunction(() => Boolean(window.__game) && Boolean(navigator.serviceWorker.controller));
  await mobileContext.setOffline(true);
  await mobile.reload();
  await mobile.waitForFunction(() => Boolean(window.__game));
  await mobile.click('#btn-play');
  assert.equal(await state(mobile), 'RUNNING');
  await mobile.waitForFunction(() => window.__game.getPlayer().getTelemetry().distance > 2);
  await screenshot(mobile, 'mobile-offline-running');
  const offlineFestivalAssets = await mobile.evaluate(async () => Promise.all(
    ['/models/pulu_kisi.glb', '/models/kumari_rath.glb', '/models/bhairab_rath.glb', '/models/ganesh_rath.glb']
      .map(async url => ({ url, status: (await fetch(url)).status }))));
  assert.ok(offlineFestivalAssets.every(asset => asset.status === 200), JSON.stringify(offlineFestivalAssets));
  await mobile.click('#btn-toggle-run');
  record('Production service-worker snapshot, controlled reload, offline launch and play');
  await mobileContext.setOffline(false);
  await mobileContext.close(); // These checks are complete; release the software GPU scene.

  const manifest = await (await context.request.get(`${origin}/manifest.webmanifest`)).json();
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, undefined);
  for (const icon of manifest.icons) {
    const response = await context.request.get(origin + icon.src);
    assert.equal(response.status(), 200);
    const png = await response.body();
    const expected = Number(icon.sizes.split('x')[0]);
    assert.equal(png.readUInt32BE(16), expected);
    assert.equal(png.readUInt32BE(20), expected);
  }
  const snapshot = await (await context.request.get(`${origin}/offline-build.json`)).json();
  for (const name of ['pulu_kisi', 'kumari_rath', 'bhairab_rath', 'ganesh_rath']) {
    assert.ok(snapshot.files.includes(`/models/${name}.glb`), `Missing offline festival asset: ${name}`);
  }
  for (const url of snapshot.files) assert.equal((await context.request.get(origin + url)).status(), 200, url);
  record('Manifest, icon dimensions, all precache URLs', `${snapshot.files.length} files, ${snapshot.bytes} bytes`);

  const deniedContext = await browser.newContext();
  await deniedContext.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
  });
  const denied = await deniedContext.newPage();
  denied.on('pageerror', error => errors.push(error.message));
  await ready(denied);
  await denied.click('#btn-play');
  await denied.click('#tutorial-skip');
  assert.equal(await state(denied), 'RUNNING');
  await denied.click('#btn-toggle-run');
  await denied.evaluate(() => window.__game.triggerAction('RESET', 'Test storage fallback'));
  await denied.click('#btn-play');
  assert.equal(await state(denied), 'RUNNING');
  await denied.click('#btn-toggle-run');
  record('Blocked storage: tutorial skip and session fallback');

  await denied.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    event.prompt = async () => { window.testInstallCalls = (window.testInstallCalls || 0) + 1; };
    event.userChoice = Promise.resolve({ outcome: 'dismissed' });
    window.dispatchEvent(event);
  });
  await denied.click('#btn-home-screen');
  await denied.keyboard.press('Enter'); // Focus begins on Back; keyboard must not start gameplay.
  assert.equal(await state(denied), 'PAUSED');
  await denied.click('#btn-home-screen');
  assert.equal(await denied.locator('#btn-install').isVisible(), true);
  await denied.click('#btn-install');
  await denied.waitForFunction(() => window.testInstallCalls === 1);
  assert.equal(await denied.locator('#btn-install').isVisible(), false);
  assert.match(await denied.locator('#install-instructions').textContent(), /dismissed/);
  await denied.keyboard.press('Escape');
  assert.equal(await state(denied), 'PAUSED');
  record('Synthetic install event: one-use prompt, dismissal, modal input isolation');
  await deniedContext.close();

  const iosContext = await browser.newContext({ ...devices['iPhone 13'], defaultBrowserType: undefined });
  const ios = await iosContext.newPage();
  await ready(ios);
  await ios.click('#btn-home-screen');
  assert.match(await ios.locator('#install-instructions').textContent(), /Safari.*Share.*Add to Home Screen/);
  await screenshot(ios, 'ios-install-guidance-emulated');
  record('iPhone UA emulation: manual installation guidance (not Safari verification)');
  await iosContext.close();

  const standaloneContext = await browser.newContext();
  await standaloneContext.addInitScript(() => {
    const original = window.matchMedia;
    window.matchMedia = query => query === '(display-mode: standalone)' ? { matches: true } : original.call(window, query);
  });
  const standalone = await standaloneContext.newPage();
  await ready(standalone);
  assert.equal(await standalone.locator('#btn-home-screen').isVisible(), false);
  record('Emulated standalone mode hides redundant installation menu');
  await standaloneContext.close();

  const failedContext = await browser.newContext();
  await failedContext.addInitScript(() => {
    navigator.serviceWorker.register = async () => { throw new Error('Test: cache/worker unavailable'); };
  });
  const failed = await failedContext.newPage();
  failed.on('pageerror', error => errors.push(error.message));
  await ready(failed);
  await failed.click('#btn-home-screen');
  assert.match(await failed.locator('#offline-status').textContent(), /unavailable.*online/);
  await failed.click('#home-screen-close');
  await failed.click('#btn-play');
  await failed.click('#tutorial-skip');
  assert.equal(await state(failed), 'RUNNING');
  record('Service-worker registration failure leaves online play usable');
  await failedContext.close();

  const noWebglContext = await browser.newContext();
  await noWebglContext.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return getContext.call(this, type, ...args);
    };
  });
  const noWebgl = await noWebglContext.newPage();
  await noWebgl.goto(origin);
  await noWebgl.waitForSelector('#startup-retry:not([hidden])');
  assert.match(await noWebgl.locator('#startup-status').textContent(), /WebGL.*another browser/);
  await screenshot(noWebgl, 'webgl-unavailable');
  record('Unavailable WebGL displays an actionable startup failure (intentional boot error)');
  await noWebglContext.close();

  // Isolated localhost server exercises the real worker lifecycle without editing the build.
  const output = resolve('dist');
  let updated = false;
  const lifecycleServer = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const file = resolve(output, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(output + sep)) { response.writeHead(403).end(); return; }
      let body = await readFile(file);
      if (pathname === '/sw.js' && updated) body = Buffer.from(body.toString().replace(/lakhey-run-game-([a-f0-9]+)/, 'lakhey-run-game-$1-update'));
      const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.webmanifest') ? 'application/manifest+json' : 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => lifecycleServer.listen(0, '127.0.0.1', resolve));
  const lifecycleOrigin = `http://127.0.0.1:${lifecycleServer.address().port}`;
  const lifecycleContext = await browser.newContext();
  try {
    const lifecycle = await lifecycleContext.newPage();
    await lifecycle.goto(lifecycleOrigin);
    await lifecycle.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration())?.active));
    await lifecycle.reload();
    await lifecycle.waitForFunction(() => Boolean(window.__game && navigator.serviceWorker.controller));
    await lifecycle.click('#btn-play');
    await lifecycle.click('#tutorial-skip');
    await lifecycle.click('#btn-toggle-run');
    await lifecycle.evaluate(() => { window.testSessionMarker = 'original run'; });
    updated = true;
    await lifecycle.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await lifecycle.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting));
    assert.equal(await state(lifecycle), 'PAUSED');
    assert.equal(await lifecycle.evaluate(() => window.testSessionMarker), 'original run');
    await lifecycle.click('#btn-home-screen');
    await lifecycle.waitForFunction(() => /update.*Close all game tabs/.test(document.getElementById('offline-status').textContent));
    assert.match(await lifecycle.locator('#offline-status').textContent(), /update.*Close all game tabs/);
    await screenshot(lifecycle, 'update-waiting');
    const oldCaches = await lifecycle.evaluate(() => caches.keys());
    assert.equal(oldCaches.length, 2);
    await lifecycle.close();
    const reopened = await lifecycleContext.newPage();
    await reopened.goto(lifecycleOrigin, { waitUntil: 'domcontentloaded' });
    await reopened.waitForFunction(() => Boolean(window.__game));
    await reopened.waitForFunction(async () => (await caches.keys()).length === 1 && (await caches.keys())[0].endsWith('-update'));
    assert.equal(await state(reopened), 'READY');
    record('Real worker update waits without reloading a paused run; tab close activates it and removes old game cache');
  } finally {
    await lifecycleContext.close();
    await new Promise(resolve => lifecycleServer.close(resolve));
  }
  assert.deepEqual(errors, []);
  record('No uncaught page errors in desktop, touch and denied-storage checks');
  writeFileSync(new URL('verification.json', evidence), JSON.stringify({ origin, channel, browser: browser.version(), results }, null, 2));
  console.log(`${results.length} checks passed on ${channel} ${browser.version()}.`);
} finally { await browser?.close(); }
