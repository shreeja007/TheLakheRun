// T040–T044 checks: the street kit is placed correctly, never blocks a lane, causes no batch rebuilds
// during play, and the game keeps working when the kit fails or arrives late. Runs against a production
// preview (default http://127.0.0.1:4190).
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const origin = process.env.UI_TEST_URL || 'http://127.0.0.1:4190';
const directory = resolve(process.env.STREET_EVIDENCE_DIR || 'reports/evidence/T040');
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = {};
const errors = [];

async function openGame(setup) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
  if (setup) await setup(page);
  await page.goto(origin);
  await page.waitForFunction(() => Boolean(window.__game));
  return { context, page };
}
const waitForArt = page => page.waitForFunction(() => Boolean(window.__pcApp.root.findByName('StreetArt_2')), null, { timeout: 60000 });

try {
  // 1. Placement: five recycling Durbar tiles dressed, intro tiles untouched, nothing in the running space.
  {
    const { context, page } = await openGame();
    await waitForArt(page);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    results.placement = await page.evaluate(() => {
      const root = window.__pcApp.root;
      const tiles = [];
      root.findByName('RoadRoot').children.forEach(child => {
        const dressed = child.children.flatMap(c => c.children).find(c => c.name.startsWith('StreetArt_'));
        if (dressed) tiles.push(dressed.name);
      });
      const introFacade = root.findByName('BldgL1_0');
      const replacedFacade = root.findByName('BldgL1_2');
      const keptLantern = root.findByName('BldgL1_2_Lantern');
      // Every art mesh: anything above the lanes must be overhead, anything at body height must be off the road.
      const violations = [];
      let meshes = 0;
      for (const name of tiles) {
        root.findByName(name).forEach(node => {
          if (!node.render) return;
          for (const instance of node.render.meshInstances) {
            meshes++;
            const { center, halfExtents } = instance.aabb;
            const minX = center.x - halfExtents.x, maxX = center.x + halfExtents.x;
            const minY = center.y - halfExtents.y;
            const overRoad = maxX > -3.6 && minX < 3.6;
            if (overRoad && minY < 5.0) violations.push(`${node.name} x ${minX.toFixed(2)}..${maxX.toFixed(2)} minY ${minY.toFixed(2)}`);
          }
        });
      }
      return { tiles, meshes, violations, introFacadeEnabled: introFacade.enabled,
        replacedFacadeEnabled: replacedFacade.enabled, keptLanternEnabled: keptLantern.enabled };
    });
    const r = results.placement;
    assert.deepEqual(r.tiles, ['StreetArt_2', 'StreetArt_3', 'StreetArt_4', 'StreetArt_5', 'StreetArt_6']);
    assert.deepEqual(r.violations, []);
    assert.equal(r.introFacadeEnabled, true);
    assert.equal(r.replacedFacadeEnabled, false);
    assert.equal(r.keptLanternEnabled, true);
    await context.close();
  }

  // 2. No rebuilds across a long run, a real catch and a retry; pools still healthy.
  {
    const { context, page } = await openGame();
    await waitForArt(page);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.evaluate(() => window.__pcApp.off('update'));
    await page.click('#btn-play');
    results.rebuilds = await page.evaluate(() => {
      const app = window.__pcApp, batcher = app.batcher, game = window.__game, player = game.getPlayer();
      let rebuilds = 0;
      const original = batcher.generate.bind(batcher);
      batcher.generate = ids => { rebuilds++; original(ids); };
      const manager = game.getObstacleManager();
      const realCheck = manager.checkCollisions.bind(manager);
      manager.checkCollisions = () => null;
      let frames = 0;
      while (player.getTelemetry().distance < 900 && frames++ < 12000) { game.update(1 / 60); batcher.updateAll(); }
      const distance = Math.round(player.getTelemetry().distance);
      const duringRun = rebuilds;
      manager.checkCollisions = realCheck;
      frames = 0;
      while (game.getState() !== 'GAME_OVER' && frames++ < 6000) { game.update(1 / 60); batcher.updateAll(); }
      const state = game.getState();
      game.retry();
      for (let i = 0; i < 120; i++) { game.update(1 / 60); batcher.updateAll(); }
      return { distance, duringRun, state, afterRetry: rebuilds - duringRun, stateAfterRetry: game.getState() };
    });
    assert.ok(results.rebuilds.distance >= 900, JSON.stringify(results.rebuilds));
    assert.equal(results.rebuilds.duringRun, 0);
    assert.equal(results.rebuilds.state, 'GAME_OVER');
    assert.equal(results.rebuilds.afterRetry, 0);
    assert.equal(results.rebuilds.stateAfterRetry, 'RUNNING');
    await context.close();
  }

  // 3. If the kit cannot load, the original street stays and the game plays on.
  {
    const { context, page } = await openGame(p => p.route('**/models/street_kit.glb', route => route.abort()));
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.__pcApp.off('update'));
    await page.click('#btn-play');
    results.kitFailure = await page.evaluate(() => {
      const game = window.__game, player = game.getPlayer();
      game.getObstacleManager().checkCollisions = () => null;
      for (let i = 0; i < 300; i++) game.update(1 / 60);
      const root = window.__pcApp.root;
      return { art: Boolean(root.findByName('StreetArt_2')), facade: root.findByName('BldgL1_2').enabled,
        state: game.getState(), distance: Math.round(player.getTelemetry().distance) };
    });
    assert.equal(results.kitFailure.art, false);
    assert.equal(results.kitFailure.facade, true);
    assert.equal(results.kitFailure.state, 'RUNNING');
    assert.ok(results.kitFailure.distance > 20);
    await context.close();
  }

  // 4. A kit that arrives during a run waits for the next non-running moment, so it can't hitch the run.
  {
    let release;
    const gate = new Promise(r => { release = r; });
    const { context, page } = await openGame(p => p.route('**/models/street_kit.glb', async route => { await gate; await route.continue(); }));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.__pcApp.off('update'));
    await page.click('#btn-play');
    release();
    await page.waitForFunction(() => window.__pcApp.assets.getByUrl('/models/street_kit.glb')?.loaded, null, { timeout: 60000 });
    await page.waitForTimeout(300);
    results.lateKit = await page.evaluate(() => {
      const game = window.__game, root = window.__pcApp.root;
      game.getObstacleManager().checkCollisions = () => null;
      for (let i = 0; i < 60; i++) game.update(1 / 60);
      const duringRun = Boolean(root.findByName('StreetArt_2'));
      const stateDuringRun = game.getState();
      game.triggerAction('RIGHT', 'street test');
      for (let i = 0; i < 25; i++) game.update(1 / 60);
      game.triggerAction('RIGHT', 'street test (edge)');
      game.triggerAction('RIGHT', 'street test (edge again)');
      for (let i = 0; i < 180; i++) game.update(1 / 60);
      return { duringRun, stateDuringRun, stateAfter: game.getState(), afterRun: Boolean(root.findByName('StreetArt_2')) };
    });
    assert.deepEqual(results.lateKit, { duringRun: false, stateDuringRun: 'RUNNING', stateAfter: 'GAME_OVER', afterRun: true });
    await context.close();
  }

  // 5. Reduced motion: spectators stand still.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
    await page.goto(origin);
    await page.waitForFunction(() => Boolean(window.__game));
    await waitForArt(page);
    await page.evaluate(() => window.__pcApp.off('update'));
    results.reducedMotion = await page.evaluate(() => {
      const game = window.__game, tile = window.__pcApp.root.findByName('StreetArt_2');
      const figures = tile.children.filter(c => c.name.startsWith('Spectator'));
      let maxY = 0;
      for (let i = 0; i < 120; i++) { game.update(1 / 60); for (const f of figures) maxY = Math.max(maxY, f.getLocalPosition().y); }
      return { figures: figures.length, maxY };
    });
    assert.ok(results.reducedMotion.figures > 0);
    assert.equal(results.reducedMotion.maxY, 0);
    await context.close();
  }

  assert.deepEqual(errors, []);
  results.pageErrors = errors;
  writeFileSync(resolve(directory, 'street-art-verification.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  console.log('Street art checks passed');
} finally {
  await browser.close();
}
