// T039 checks: settings dialog (volumes, reduce shake, vibration), vibration cues and the best-distance
// marker. Runs against a production preview (default http://127.0.0.1:4190); the automatic update loop
// is stopped and the real GameManager is stepped, as in test-movement.mjs.
import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const origin = process.env.UI_TEST_URL || 'http://127.0.0.1:4190';
const directory = resolve(process.env.SETTINGS_EVIDENCE_DIR || 'reports/evidence/T039');
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = {};
const errors = [];

/** Opens the game. `init` runs before page scripts (storage seeds, API stubs). */
async function openGame({ viewport = { width: 390, height: 844 }, mobile = true, init } = {}) {
  const context = await browser.newContext({ ...(mobile ? devices['Pixel 5'] : {}), viewport, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('lakhey-run.controls.v1', 'seen');
    // Record vibration calls; the real API needs a device.
    window.__vibrations = [];
    if ('vibrate' in navigator) navigator.vibrate = (pattern) => { window.__vibrations.push(pattern); return true; };
  });
  if (init) await page.addInitScript(init);
  await page.goto(origin);
  await page.waitForFunction(() => Boolean(window.__game));
  return { context, page };
}

async function startRun(page) {
  await page.evaluate(() => window.__pcApp.off('update'));
  await page.click('#btn-play');
  await page.evaluate(() => {
    const game = window.__game;
    game.getObstacleManager().checkCollisions = () => null;
    for (let i = 0; i < 120; i++) game.update(1 / 60); // finish the intro pan
  });
}

try {
  // 1. Settings dialog: defaults, live apply, saved across reload, layout on small screens.
  for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
    const { context, page } = await openGame({ viewport: { width, height } });
    await page.click('#btn-settings');
    const box = await page.evaluate(() => {
      const r = document.getElementById('settings-dialog').getBoundingClientRect();
      const done = document.getElementById('settings-done').getBoundingClientRect();
      const d = document.getElementById('settings-dialog');
      return { open: d.open, top: r.top, bottom: r.bottom, left: r.left, right: r.right,
        scrollable: d.scrollHeight > d.clientHeight, doneVisible: done.height > 0 };
    });
    await page.screenshot({ path: resolve(directory, `settings-${width}x${height}.png`) });
    assert.equal(box.open, true);
    assert.ok(box.left >= 0 && box.right <= width && box.top >= 0 && box.bottom <= height, JSON.stringify(box));
    results[`dialog${width}x${height}`] = box;
    await context.close();
  }
  {
    const { context, page } = await openGame();
    const defaults = await page.evaluate(() => ({
      music: document.getElementById('setting-music').value, effects: document.getElementById('setting-effects').value,
      shake: document.getElementById('setting-shake').checked, vibration: document.getElementById('setting-vibration').checked,
      vibrationDisabled: document.getElementById('setting-vibration').disabled,
    }));
    assert.deepEqual(defaults, { music: '100', effects: '100', shake: false, vibration: true, vibrationDisabled: false });
    await page.click('#btn-settings');
    await page.fill('#setting-music', '40');
    await page.fill('#setting-effects', '65');
    await page.check('#setting-shake');
    await page.uncheck('#setting-vibration');
    const applied = await page.evaluate(() => {
      const game = window.__game;
      return { musicVolume: game.sound.musicVolume, effectsVolume: game.sound.effectsVolume,
        shakeScale: game.player.shakeScale, vibration: game.haptics.enabled,
        labels: [document.getElementById('setting-music-value').textContent, document.getElementById('setting-effects-value').textContent],
        status: document.getElementById('settings-status').textContent };
    });
    assert.deepEqual(applied, { musicVolume: 0.4, effectsVolume: 0.65, shakeScale: 0, vibration: false,
      labels: ['40%', '65%'], status: 'Saved on this device.' });
    // Keyboard input must not start or steer the run while the dialog is open.
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowUp');
    const stateWhileOpen = await page.evaluate(() => window.__game.getState());
    assert.equal(stateWhileOpen, 'READY');
    await page.click('#settings-done');
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__game));
    const restored = await page.evaluate(() => ({
      music: document.getElementById('setting-music').value, effects: document.getElementById('setting-effects').value,
      shake: document.getElementById('setting-shake').checked, vibration: document.getElementById('setting-vibration').checked,
      musicVolume: window.__game.sound.musicVolume, shakeScale: window.__game.player.shakeScale,
    }));
    assert.deepEqual(restored, { music: '40', effects: '65', shake: true, vibration: false, musicVolume: 0.4, shakeScale: 0 });
    results.settings = { defaults, applied, stateWhileOpen, restored };

    // Audio really uses separate buses: after the first tap creates the AudioContext, bus gains follow.
    await page.click('#btn-play');
    await page.waitForTimeout(150);
    results.audioBuses = await page.evaluate(() => {
      const sound = window.__game.sound;
      return sound.ctx ? { music: +sound.musicBus.gain.value.toFixed(2), effects: +sound.effectsBus.gain.value.toFixed(2) } : 'no audio context';
    });
    if (typeof results.audioBuses === 'object') assert.deepEqual(results.audioBuses, { music: 0.4, effects: 0.65 });
    await context.close();
  }

  // 2. Reduce screen shake: shake requests are scaled to zero (on by default only with OS reduced motion).
  {
    const measure = async (reduce) => {
      const { context, page } = await openGame({ mobile: false });
      await page.evaluate((r) => localStorage.setItem('lakhey-run.settings.v1',
        JSON.stringify({ musicVolume: 1, effectsVolume: 1, reduceShake: r, vibration: true })), reduce);
      await page.reload();
      await page.waitForFunction(() => Boolean(window.__game));
      await startRun(page);
      const magnitude = await page.evaluate(() => {
        const player = window.__game.getPlayer();
        player.triggerCameraShake(0.3, 0.3);
        return player.cameraShakeMagnitude;
      });
      await context.close();
      return magnitude;
    };
    results.shake = { normalMagnitude: await measure(false), reducedMagnitude: await measure(true) };
    assert.deepEqual(results.shake, { normalMagnitude: 0.3, reducedMagnitude: 0 });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(origin);
    await page.waitForFunction(() => Boolean(window.__game));
    results.shake.defaultWithOsReducedMotion = await page.evaluate(() => document.getElementById('setting-shake').checked);
    assert.equal(results.shake.defaultWithOsReducedMotion, true);
    await context.close();
  }

  // 3. Vibration cues: first edge bump, catch, near miss; none when switched off.
  {
    const { context, page } = await openGame({ mobile: false });
    await startRun(page);
    const on = await page.evaluate(() => {
      const game = window.__game;
      game.triggerAction('RIGHT', 'settings test');
      for (let i = 0; i < 30; i++) game.update(1 / 60);
      game.triggerAction('RIGHT', 'settings test (edge)');
      const afterFirst = [...window.__vibrations];
      game.triggerAction('RIGHT', 'settings test (edge again)');
      const afterCatch = [...window.__vibrations];
      game.haptics.nearMiss();
      return { afterFirst, afterCatch, all: window.__vibrations, state: game.getState() };
    });
    assert.deepEqual(on.afterFirst, [45]);
    assert.deepEqual(on.afterCatch, [45, [70, 50, 140]]);
    assert.deepEqual(on.all, [45, [70, 50, 140], 20]);
    assert.equal(on.state, 'CAUGHT');
    const off = await page.evaluate(() => {
      window.__vibrations.length = 0;
      window.__game.applySettings({ musicVolume: 1, effectsVolume: 1, reduceShake: false, vibration: false });
      window.__game.haptics.catch();
      return window.__vibrations.length;
    });
    assert.equal(off, 0);
    results.vibration = { on, offCalls: off };
    await context.close();
  }

  // 4. Browsers without the Vibration API (iPhone/iPad): the toggle is disabled with a note.
  {
    const { context, page } = await openGame({ init: () => { delete Navigator.prototype.vibrate; delete navigator.vibrate; } });
    await page.click('#btn-settings');
    results.noVibrationApi = await page.evaluate(() => ({
      supported: window.__game.isVibrationSupported(),
      disabled: document.getElementById('setting-vibration').disabled,
      noteVisible: !document.getElementById('setting-vibration-note').hidden,
    }));
    await page.screenshot({ path: resolve(directory, 'settings-no-vibration-api.png') });
    assert.deepEqual(results.noVibrationApi, { supported: false, disabled: true, noteVisible: true });
    await context.close();
  }

  // 5. Storage blocked: settings still apply for the session and the dialog says so.
  {
    const { context, page } = await openGame({ init: () => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
    } });
    await page.click('#btn-settings');
    await page.fill('#setting-music', '20');
    results.storageBlocked = await page.evaluate(() => ({
      musicVolume: window.__game.sound.musicVolume, status: document.getElementById('settings-status').textContent }));
    assert.equal(results.storageBlocked.musicVolume, 0.2);
    assert.match(results.storageBlocked.status, /blocking storage/);
    await context.close();
  }

  // 6. Best-distance marker: hidden without a best, shown at -best with a label, gone after passing.
  {
    const { context, page } = await openGame({ init: () => localStorage.setItem('lakhey_run_best_distance', '0') });
    await startRun(page);
    const none = await page.evaluate(() => window.__pcApp.root.findByName('BestMarker').enabled);
    assert.equal(none, false);
    await context.close();
  }
  {
    const { context, page } = await openGame({ init: () => localStorage.setItem('lakhey_run_best_distance', '150.0') });
    await startRun(page);
    const nextFrame = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    // The label is placed at render time; read it after a real frame. It must sit just above the line.
    const readMarker = () => page.evaluate(() => {
      const marker = window.__pcApp.root.findByName('BestMarker');
      const label = document.querySelector('.best-marker-label');
      const camera = window.__pcApp.root.findByName('MainCamera');
      const line = camera.camera.worldToScreen(marker.getPosition().clone());
      const rect = label.getBoundingClientRect();
      return { distance: Math.round(window.__game.getPlayer().getTelemetry().distance), enabled: marker.enabled,
        z: +marker.getPosition().z.toFixed(2), labelVisible: !label.hidden, label: label.textContent,
        lineY: Math.round(line.y), labelBottom: Math.round(rect.bottom), labelCenterX: Math.round(rect.left + rect.width / 2),
        lineX: Math.round(line.x) };
    });
    await page.evaluate(() => {
      const game = window.__game, player = game.getPlayer();
      while (player.getTelemetry().distance < 75) game.update(1 / 60);
    });
    await nextFrame();
    const approach = await readMarker();
    await page.screenshot({ path: resolve(directory, 'best-marker-approach.png') });
    await page.evaluate(() => {
      const game = window.__game, player = game.getPlayer();
      while (player.getTelemetry().distance < 132) game.update(1 / 60);
    });
    await nextFrame();
    const near = await readMarker();
    await page.screenshot({ path: resolve(directory, 'best-marker-near.png') });
    for (const m of [approach, near]) {
      assert.ok(m.labelVisible, JSON.stringify(m));
      assert.ok(m.labelBottom <= m.lineY && m.lineY - m.labelBottom < 220, JSON.stringify(m));
      assert.ok(Math.abs(m.labelCenterX - m.lineX) < 4, JSON.stringify(m));
    }
    const passed = await page.evaluate(() => {
      const game = window.__game, player = game.getPlayer();
      while (player.getTelemetry().distance < 190) game.update(1 / 60);
      return { distance: Math.round(player.getTelemetry().distance),
        enabled: window.__pcApp.root.findByName('BestMarker').enabled,
        labelVisible: !document.querySelector('.best-marker-label').hidden };
    });
    results.marker = { approach, near, passed };
    assert.equal(approach.enabled, true);
    assert.equal(approach.z, -150);
    assert.equal(approach.labelVisible, true);
    assert.equal(approach.label, 'Best 150 m');
    assert.deepEqual({ enabled: passed.enabled, labelVisible: passed.labelVisible }, { enabled: false, labelVisible: false });
    await context.close();
  }

  assert.deepEqual(errors, []);
  results.pageErrors = errors;
  writeFileSync(resolve(directory, 'settings-verification.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  console.log('Settings, vibration and best-marker checks passed');
} finally {
  await browser.close();
}
