import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseline = process.env.POLISH_BASELINE === '1';
const origin = process.env.UI_TEST_URL || 'http://127.0.0.1:4190';
const directory = resolve(`reports/evidence/T034/${baseline ? 'before' : 'after'}`);
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
const errors = [];
const capture = async (page, name) => {
  if (!baseline) await page.clock.runFor(32);
  return page.screenshot({ path: resolve(directory, `${name}.png`), scale: 'css' });
};
const bounds = async page => page.evaluate(() => {
  const box = selector => {
    const el = document.querySelector(selector);
    if (!el || !el.getClientRects().length) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };
  return {
    viewport: { width: innerWidth, height: innerHeight },
    header: box('.top-header'), controls: box('.controls-overlay'),
    feedback: box('#run-feedback'), location: box('#biome-toast'), record: box('#record-banner'),
    callout: box('.callout-toast'), multiplier: box('#hud-multiplier-pill'),
    particles: document.querySelector('#confetti-container').children.length,
    flyingScores: document.querySelectorAll('.fly-score-digit').length,
    flash: document.querySelector('#skill-flash').className,
    drawCalls: window.__pcApp.stats.drawCalls.total,
    triangles: window.__pcApp.stats.triangles,
    maxPixelRatio: window.__pcApp.graphicsDevice.maxPixelRatio,
  };
});

try {
  for (const [width, height] of [[320, 568], [390, 844], [667, 375], [844, 390], [1280, 800]]) {
    const compact = width <= 640 || height <= 500;
    const context = await browser.newContext({ ...(compact ? devices['Pixel 5'] : {}),
      viewport: { width, height }, serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
    await page.goto(origin);
    await page.waitForFunction(() => Boolean(window.__game));
    // Freeze the automatic simulation, not rendering, to measure deterministic feedback.
    await page.evaluate(() => window.__pcApp.off('update'));
    if (!baseline) {
      const time = new Date('2026-10-14T06:00:00Z');
      await page.clock.install({ time });
      await page.clock.pauseAt(new Date(time.getTime() + 60_000));
    }
    await page.click('#btn-play');
    const initial = await bounds(page);
    await capture(page, `initial-${width}x${height}`);
    await page.evaluate(() => {
      const game = window.__game;
      const player = game.getPlayer();
      for (let i = 0; i < 95; i++) player.update(1 / 60, true);
      game.getScoreManager().registerScore(100);
      // Exercise the actual biome, record and milestone producers with collision disabled
      // only for this controlled HUD capture. Normal collision is covered by test:ui.
      game.getObstacleManager().checkCollisions = () => undefined;
      game.setDebugDistance(141);
      game.update(1 / 60);
    });
    if (!baseline) await page.clock.runFor(180);
    else await page.waitForTimeout(180);
    const milestone = await bounds(page);
    await capture(page, `milestone-${width}x${height}`);
    if (!baseline) {
      assert.equal(await page.locator('#run-feedback').isVisible(), true);
      assert.match(await page.locator('#run-feedback-text').textContent(), /River/);
      assert.equal(milestone.feedback.height <= 30, true, JSON.stringify(milestone));
      assert.equal(milestone.feedback.bottom <= milestone.header.bottom + 1, true);
      for (const r of [milestone.header, milestone.controls, milestone.feedback, milestone.multiplier]) {
        if (r) assert.ok(r.left >= -1 && r.right <= width + 1 && r.top >= -1 && r.bottom <= height + 1,
          JSON.stringify(milestone));
      }
      const clearHeight = milestone.controls.top - milestone.header.bottom;
      assert.ok(clearHeight >= height * (compact ? .54 : .60), JSON.stringify(milestone));
      // Every gameplay action remains a reachable touch target.
      for (const id of ['btn-left', 'btn-right', 'btn-jump', 'btn-slide', 'btn-tease', 'btn-toggle-run', 'btn-audio-toggle']) {
        const r = await page.locator(`#${id}`).boundingBox();
        assert.ok(r && r.width >= 44 && r.height >= 44, `${id}: ${JSON.stringify(r)}`);
      }
      if (compact) {
        assert.equal(milestone.particles, 0);
        assert.equal(milestone.flyingScores, 0);
        assert.equal(milestone.flash, '');
      }
    }
    // A burst of ordinary actions must not cover/replace an important location message.
    await page.evaluate(() => {
      for (let i = 0; i < 6; i++) {
        window.__game.activeSkillCallout = { type: 'CLEAN_VAULT', title: 'CLEAN VAULT!',
          subtitle: '+50 Skill Bonus', points: 50, multiplier: 2, timestamp: performance.now() + i };
        window.__game.update(0);
      }
    });
    await capture(page, `burst-${width}x${height}`);
    if (!baseline) {
      assert.equal(await page.locator('#run-feedback').count(), 1);
      assert.match(await page.locator('#run-feedback-text').textContent(), /River/);
      await page.evaluate(() => {
        window.__game.triggerAction('RIGHT', 'Pause regression');
        window.__game.triggerAction('JUMP', 'Pause regression');
        window.__game.update(1 / 60);
      });
      assert.equal(await page.evaluate(() => window.__game.getPlayer().getTelemetry().isJumping), true);
      await page.click('#btn-toggle-run');
      assert.equal(await page.locator('#run-feedback').isVisible(), false);
      const frozen = await page.evaluate(() => {
        const game = window.__game;
        const before = JSON.stringify(game.getPlayer().getTelemetry());
        for (let i = 0; i < 120; i++) game.update(1 / 60);
        return before === JSON.stringify(game.getPlayer().getTelemetry());
      });
      assert.equal(frozen, true, 'Pause must preserve distance, jump/slide and lane positions');
      await page.click('#btn-resume');
      assert.equal(await page.locator('#run-feedback').isVisible(), false, 'No stale message on resume');
      await page.evaluate(() => window.__game.retry());
      await page.clock.fastForward(900);
      await page.evaluate(() => window.__game.retry()); // Retry again before forward movement begins.
      await page.clock.fastForward(300);
      assert.equal(await page.locator('#run-feedback').isVisible(), true, 'Old timeout cannot clear a newer run');
      await page.clock.fastForward(1050);
      assert.equal(await page.locator('#run-feedback').isVisible(), false, 'Retry feedback expires');
      await page.evaluate(() => window.__game.update(0));
      assert.equal(await page.locator('#run-feedback').isVisible(), false, 'Expired feedback stays cleared');
      await page.evaluate(() => {
        window.__game.activeSkillCallout = { type: 'COMBO_SURGE', title: '3x COMBO SURGE!',
          subtitle: 'Rapid Coin Streak', points: 75, multiplier: 3, timestamp: performance.now() };
        window.__game.update(0);
      });
      assert.equal(await page.locator('#run-feedback-points').textContent(), '', 'No unawarded combo points');
      await page.evaluate(() => {
        window.__game.activeSkillCallout = { type: 'RECORD_BROKEN', title: 'NEW PERSONAL BEST!',
          subtitle: 'Record reached', points: 100, multiplier: 3, timestamp: performance.now() };
        window.__game.update(0);
      });
      assert.equal(await page.locator('#run-feedback-text').textContent(), 'New personal best');
      // Unmuting on pause must not restart the music scheduler.
      await page.click('#btn-toggle-run');
      await page.click('#btn-audio-toggle');
      await page.click('#btn-audio-toggle');
      assert.equal(await page.evaluate(() => window.__game.getSound().isMusicPlaying), false);
      await page.click('#btn-resume');
      // Context loss uses the actual browser lifecycle event; returning never auto-resumes.
      await page.evaluate(() => document.getElementById('application-canvas')
        .dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
      assert.equal(await page.evaluate(() => window.__game.getState()), 'PAUSED');
      await page.evaluate(() => document.getElementById('application-canvas')
        .dispatchEvent(new Event('webglcontextrestored')));
      assert.equal(await page.evaluate(() => window.__game.getState()), 'PAUSED');
      await page.click('#btn-resume');
      // Synthetic visibility state, dispatched through the registered listener.
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
        delete document.hidden;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      assert.equal(await page.evaluate(() => window.__game.getState()), 'PAUSED');
    }
    results.push({ viewport: `${width}x${height}`, initial, milestone, outcome: baseline ? 'baseline measured' : 'passed' });
    console.log(`PASS ${width}x${height}: ${baseline ? 'baseline captured' : 'visibility, feedback, controls, pause/retry, audio and interruptions'}`);
    await context.close();
  }
  if (!baseline) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('lakhey_run_best_distance', 'Infinity');
      localStorage.setItem('lakhey_run_best_coins', 'NaN');
      localStorage.setItem('lakhey-run.controls.v1', 'seen');
    });
    await page.goto(origin);
    await page.waitForFunction(() => Boolean(window.__game));
    assert.equal(await page.evaluate(() => window.__game.getScoreManager().getBest()), 0);
    assert.equal(await page.evaluate(() => window.__game.getScoreManager().getBestCoins()), 0);
    await page.evaluate(() => window.__pcApp.off('update'));
    const time = new Date('2026-10-14T06:00:00Z');
    await page.clock.install({ time });
    await page.clock.pauseAt(new Date(time.getTime() + 60_000));
    await page.click('#btn-play');
    await page.evaluate(() => {
      window.__game.getObstacleManager().checkCollisions = () => undefined;
      window.__game.setDebugDistance(141);
      window.__game.update(0);
    });
    const reduced = await bounds(page);
    assert.equal(reduced.particles, 0);
    assert.equal(reduced.flash, '');
    assert.equal(await page.locator('#run-feedback').evaluate(el => getComputedStyle(el).animationName), 'none');
    await capture(page, 'reduced-motion');
    results.push({ name: 'Corrupt storage and reduced-motion presentation', outcome: 'passed' });
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  writeFileSync(resolve(directory, 'polish-verification.json'), JSON.stringify({ baseline, browser: browser.version(),
    rendering: 'ANGLE SwiftShader software WebGL; viewports are emulated, not physical devices', results, errors }, null, 2));
  await browser.close();
}
