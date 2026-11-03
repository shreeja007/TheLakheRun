// T036 movement regressions: run against a production preview (default http://127.0.0.1:4190).
// The automatic update loop is stopped and the real GameManager is stepped at fixed frame rates.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const origin = process.env.UI_TEST_URL || 'http://127.0.0.1:4190';
const directory = resolve(process.env.MOVEMENT_EVIDENCE_DIR || 'reports/evidence/T036');
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = {};
const errors = [];

async function freshRun({ disableCollisions = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 900, height: 600 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
  await page.goto(origin);
  await page.waitForFunction(() => Boolean(window.__game));
  await page.evaluate(() => window.__pcApp.off('update'));
  await page.click('#btn-play');
  await page.evaluate((disable) => {
    const game = window.__game;
    if (disable) game.getObstacleManager().checkCollisions = () => null;
    for (let i = 0; i < 120; i++) game.update(1 / 60); // finish the intro pan
  }, disableCollisions);
  return { context, page };
}

try {
  // M1: lane change settles without overshoot at any frame rate.
  {
    const { context, page } = await freshRun();
    results.laneChange = await page.evaluate(() => {
      const game = window.__game;
      const player = game.getPlayer();
      const out = {};
      for (const fps of [24, 30, 60, 120]) {
        // Return to the centre lane, then move right once.
        while (player.getTelemetry().targetLane > 0) player.moveLeft();
        for (let i = 0; i < 120; i++) game.update(1 / 60);
        game.triggerAction('RIGHT', 'movement test');
        let maxX = -Infinity;
        let allFinite = true;
        let xAt600ms = NaN;
        for (let i = 0; i < Math.round(fps * 1.5); i++) {
          game.update(1 / fps);
          const x = player.getX();
          if (!Number.isFinite(x)) allFinite = false;
          maxX = Math.max(maxX, x);
          if (i === Math.round(fps * 0.6) - 1) xAt600ms = x;
        }
        out[fps] = { allFinite, overshoot: +(maxX - 2).toFixed(4), xAt600ms: +xAt600ms.toFixed(4), xAt1500ms: +player.getX().toFixed(4) };
      }
      return out;
    });
    for (const [fps, r] of Object.entries(results.laneChange)) {
      assert.equal(r.allFinite, true, `lane change ${fps} fps`);
      assert.ok(r.overshoot <= 0.005, `lane change overshoot ${fps} fps: ${JSON.stringify(r)}`);
      assert.ok(Math.abs(r.xAt600ms - 2) < 0.01, `lane change settle ${fps} fps: ${JSON.stringify(r)}`);
    }
    await context.close();
  }

  // M2/M3/M4/M5: slides stay above the road, mid-air slide slams smoothly, camera eases, buffered jump has feedback.
  {
    const { context, page } = await freshRun();
    results.poses = await page.evaluate(() => {
      const game = window.__game;
      const player = game.getPlayer();
      const app = window.__pcApp;
      const model = app.root.findByName('Tuku_3D_Blockout');
      const camera = app.root.findComponents('camera')[0].entity;
      const lowestMeshY = () => {
        let min = Infinity;
        for (const render of model.findComponents('render')) {
          for (const mi of render.meshInstances) min = Math.min(min, mi.aabb.getMin().y);
        }
        return min;
      };
      const settle = () => { for (let i = 0; i < 60; i++) game.update(1 / 60); };
      const out = { slides: {}, jumps: {} };
      settle();
      let runningLowest = Infinity;
      for (let i = 0; i < 60; i++) { game.update(1 / 60); runningLowest = Math.min(runningLowest, lowestMeshY()); }
      out.runningLowest = +runningLowest.toFixed(3);
      for (const variant of [0, 1, 2]) {
        settle();
        player.slide(variant);
        let lowest = Infinity;
        let lowestMid = Infinity; // after the knee-plant entry, before the stand-up
        for (let i = 0; i < 42; i++) {
          game.update(1 / 60);
          const y = lowestMeshY();
          lowest = Math.min(lowest, y);
          if (i >= 7 && i <= 30) lowestMid = Math.min(lowestMid, y);
        }
        out.slides[variant] = { lowest: +lowest.toFixed(3), lowestMid: +lowestMid.toFixed(3) };
      }
      for (const variant of [0, 1, 2]) {
        settle();
        player.jump(variant);
        let lowest = Infinity;
        for (let i = 0; i < 42; i++) { game.update(1 / 60); lowest = Math.min(lowest, lowestMeshY()); }
        out.jumps[variant] = +lowest.toFixed(3);
      }

      // Mid-air slide: no teleport, low hitbox immediately, grounded within the slam.
      settle();
      player.jump(0);
      for (let i = 0; i < 18; i++) game.update(1 / 60);
      const yBefore = player.getY();
      player.slide(0);
      const hitboxTop = player.getBounds().maxY;
      let maxDrop = 0;
      let previous = yBefore;
      for (let i = 0; i < 8; i++) {
        game.update(1 / 60);
        maxDrop = Math.max(maxDrop, previous - player.getY());
        previous = player.getY();
      }
      out.midAirSlide = { yBefore: +yBefore.toFixed(3), hitboxTopImmediately: hitboxTop,
        maxDropPerFrame: +maxDrop.toFixed(3), yAfter8Frames: +player.getY().toFixed(3) };

      // Slide camera dip is eased.
      settle();
      let camPrev = camera.getPosition().y;
      let maxCamStep = 0;
      player.slide(0);
      for (let i = 0; i < 60; i++) {
        game.update(1 / 60);
        const y = camera.getPosition().y;
        maxCamStep = Math.max(maxCamStep, Math.abs(y - camPrev));
        camPrev = y;
      }
      out.slideCameraMaxStepPerFrame = +maxCamStep.toFixed(3);

      // Buffered jump fires jump feedback a second time.
      settle();
      let jumpCallbacks = 0;
      player.onJump(() => jumpCallbacks++);
      game.triggerAction('JUMP', 'movement test');
      for (let i = 0; i < 34; i++) game.update(1 / 60);
      game.triggerAction('JUMP', 'movement test (buffered)');
      for (let i = 0; i < 10; i++) game.update(1 / 60);
      out.bufferedJumpCallbacks = jumpCallbacks;
      return out;
    });
    const p = results.poses;
    // Mesh AABB minima are conservative. Before T036 the dive roll reached -1.04 m mid-roll.
    assert.ok(p.slides[1].lowestMid > -0.05, `dive roll stays above road: ${JSON.stringify(p)}`);
    for (const v of [0, 1, 2]) assert.ok(p.slides[v].lowest > -0.2 && p.jumps[v] > -0.2, `pose ${v}: ${JSON.stringify(p)}`);
    assert.equal(p.midAirSlide.hitboxTopImmediately, 0.38);
    assert.ok(p.midAirSlide.maxDropPerFrame < 0.7, JSON.stringify(p.midAirSlide));
    assert.ok(p.midAirSlide.yAfter8Frames < 0.2, JSON.stringify(p.midAirSlide));
    assert.ok(p.slideCameraMaxStepPerFrame < 0.12, `camera step ${p.slideCameraMaxStepPerFrame}`);
    assert.equal(p.bufferedJumpCallbacks, 2);

    // Side-view evidence of the dive roll mid-slide.
    await page.evaluate(() => {
      const game = window.__game;
      const player = game.getPlayer();
      for (let i = 0; i < 60; i++) game.update(1 / 60);
      player.slide(1);
      for (let i = 0; i < 20; i++) game.update(1 / 60);
      const camera = window.__pcApp.root.findComponents('camera')[0].entity;
      camera.setPosition(player.getX() + 3.2, 0.9, player.getZ());
      camera.lookAt(player.getX(), 0.5, player.getZ());
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: resolve(directory, 'side-dive-roll-mid-after.png') });
    await context.close();
  }

  // Edge bump: first bump warns and Lakhey surges; a second bump while he is close catches.
  {
    const { context, page } = await freshRun();
    const first = await page.evaluate(() => {
      const game = window.__game;
      game.triggerAction('RIGHT', 'movement test');
      for (let i = 0; i < 30; i++) game.update(1 / 60);
      const before = game.getGuardian().getFollowDistance();
      game.triggerAction('RIGHT', 'movement test (edge)');
      for (let i = 0; i < 30; i++) game.update(1 / 60);
      return { state: game.getState(), lane: game.getPlayer().getTelemetry().targetLane,
        strike: game.isEdgeBumpStrikeActive(), guardianBefore: +before.toFixed(2),
        guardianAfter: +game.getGuardian().getFollowDistance().toFixed(2),
        feedback: document.querySelector('#run-feedback-text').textContent,
        feedbackKind: document.querySelector('#run-feedback').dataset.kind };
    });
    await page.screenshot({ path: resolve(directory, 'edge-bump-first.png') });
    const second = await page.evaluate(() => {
      const game = window.__game;
      game.triggerAction('RIGHT', 'movement test (edge again)');
      const stateNow = game.getState();
      for (let i = 0; i < Math.ceil(2.8 * 60); i++) game.update(1 / 60);
      return { stateImmediately: stateNow, stateAfterSequence: game.getState(),
        cause: document.querySelector('#gameover-cause').textContent };
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: resolve(directory, 'edge-bump-caught-results.png') });
    results.edgeBump = { first, second };
    assert.equal(first.state, 'RUNNING');
    assert.equal(first.lane, 1);
    assert.equal(first.strike, true);
    assert.ok(first.guardianAfter < first.guardianBefore - 0.5, JSON.stringify(first));
    assert.match(first.feedback, /Blocked/);
    assert.equal(first.feedbackKind, 'warning');
    assert.equal(second.stateImmediately, 'CAUGHT');
    assert.equal(second.stateAfterSequence, 'GAME_OVER');
    assert.match(second.cause, /road edge/);
    await context.close();
  }

  // Edge bump after Lakhey has recovered is a fresh first bump; the left edge behaves the same.
  {
    const { context, page } = await freshRun();
    results.edgeBumpRecovered = await page.evaluate(() => {
      const game = window.__game;
      game.triggerAction('LEFT', 'movement test');
      for (let i = 0; i < 30; i++) game.update(1 / 60);
      game.triggerAction('LEFT', 'movement test (edge)');
      const strikeAfterFirst = game.isEdgeBumpStrikeActive();
      let recoveredAfterS = null;
      for (let i = 0; i < 15 * 60; i++) {
        game.update(1 / 60);
        if (recoveredAfterS === null && !game.isEdgeBumpStrikeActive()) recoveredAfterS = +((i + 1) / 60).toFixed(2);
      }
      game.triggerAction('LEFT', 'movement test (edge after recovery)');
      return { strikeAfterFirst, recoveredAfterS, stateAfterSecondBump: game.getState(),
        strikeAgain: game.isEdgeBumpStrikeActive() };
    });
    const r = results.edgeBumpRecovered;
    assert.equal(r.strikeAfterFirst, true);
    assert.ok(r.recoveredAfterS !== null && r.recoveredAfterS > 5, JSON.stringify(r));
    assert.equal(r.stateAfterSecondBump, 'RUNNING');
    assert.equal(r.strikeAgain, true);
    await context.close();
  }

  // M9: a held arrow key (auto-repeat) changes lane once and never bumps.
  {
    const { context, page } = await freshRun();
    await page.keyboard.down('ArrowRight');
    await page.keyboard.down('ArrowRight'); // repeat=true
    await page.keyboard.down('ArrowRight');
    await page.keyboard.up('ArrowRight');
    results.heldKey = await page.evaluate(() => ({
      targetLane: window.__game.getPlayer().getTelemetry().targetLane,
      strike: window.__game.isEdgeBumpStrikeActive(),
    }));
    assert.deepEqual(results.heldKey, { targetLane: 1, strike: false });
    await context.close();
  }

  // M6: a 10 fps frame at top speed cannot step over a barrier.
  {
    const { context, page } = await freshRun({ disableCollisions: false });
    results.lowFpsCollision = await page.evaluate(() => {
      const game = window.__game;
      const manager = game.getObstacleManager();
      const run = (subdivide) => {
        game.retry();
        for (let i = 0; i < 120; i++) game.update(1 / 60);
        game.constructor.MAX_COLLISION_STEP = subdivide ? 0.5 : 1e9;
        game.getPlayer().teleportZ(-400);
        game.update(1 / 60);
        game.update(1 / 60); // speed is now 15.2 m/s
        for (const obstacle of manager.getActiveObstacles()) obstacle.hasTriggeredCollision = true;
        const z0 = game.getPlayer().getZ();
        const step = game.getPlayer().getSpeed() * 0.1;
        manager.activateStandardObstacle('LOW_BARRIER', game.getPlayer().getTelemetry().targetLane, z0 - step * 1.5);
        for (let i = 0; i < 3 && game.getState() === 'RUNNING'; i++) game.update(0.1);
        return { state: game.getState(), stepPerFrame: +step.toFixed(2) };
      };
      const withoutSubdivision = run(false);
      const withSubdivision = run(true);
      game.constructor.MAX_COLLISION_STEP = 0.5;
      return { withoutSubdivision, withSubdivision };
    });
    assert.equal(results.lowFpsCollision.withoutSubdivision.state, 'RUNNING', 'control: old check skips the barrier');
    assert.equal(results.lowFpsCollision.withSubdivision.state, 'CAUGHT');
    await context.close();
  }

  // T037: difficulty keeps ramping after the original 392 m plateau, and every row stays passable.
  {
    const { context, page } = await freshRun();
    results.difficulty = await page.evaluate(() => {
      const game = window.__game;
      const manager = game.getObstacleManager();
      const curve = [];
      for (const d of [0, 200, 392, 800, 1200, 1842, 3000]) {
        game.setDebugDistance(d);
        game.update(1 / 60);
        game.update(1 / 60);
        const speed = game.getPlayer().getSpeed();
        const spacing = manager.spawnSpacing;
        curve.push({ distance: d, speed: +speed.toFixed(2), spacing: +spacing.toFixed(2),
          secondsBetweenRows: +(spacing / speed).toFixed(3) });
      }

      // Generate rows directly with the real spawner and classify them.
      const rows = {};
      let unfair = [];
      for (const d of [100, 600, 1200, 2000]) {
        const stats = { rows: 0, obstacles: 0, twoPlusLanes: 0, squeeze: 0, pulu: 0 };
        for (let i = 0; i < 600; i++) {
          manager.reset(1000 + i);
          manager.spawnHazardRow(-d);
          const active = manager.getActiveObstacles();
          stats.rows++;
          stats.obstacles += active.length;
          if (active.some(o => o.type === 'PULU_KISI_CROSSING')) { stats.pulu++; continue; } // timing hazard
          const occupied = new Set();
          const wall = new Set();
          for (const o of active) {
            occupied.add(o.lane);
            if (o.type === 'TALL_BLOCK') wall.add(o.lane);
            if (o.type === 'SLIDING_GATE') { wall.add(o.lane); wall.add(o.lane + 1); } // sweeps its lane pair
          }
          if (occupied.size >= 2) stats.twoPlusLanes++;
          if (wall.size === 2 && occupied.size === 3) stats.squeeze++;
          if (wall.size >= 3) unfair.push({ d, seed: 1000 + i, types: active.map(o => `${o.type}@${o.lane}`) });
        }
        rows[d] = { obstaclesPerRow: +(stats.obstacles / stats.rows).toFixed(2),
          pctRowsBlockingTwoPlusLanes: Math.round((100 * stats.twoPlusLanes) / stats.rows),
          pctSqueezeRows: Math.round((100 * stats.squeeze) / stats.rows),
          pctPuluKisi: Math.round((100 * stats.pulu) / stats.rows) };
      }
      manager.reset(42);
      return { curve, rows, unfair: unfair.slice(0, 5), unfairCount: unfair.length };
    });
    const { curve, rows, unfairCount } = results.difficulty;
    const at = d => curve.find(c => c.distance === d);
    // Early run is unchanged from the original curve.
    assert.equal(at(0).speed, 10.5);
    assert.equal(at(200).speed, 12.9);
    assert.equal(at(200).spacing, 20.4);
    // Keeps getting harder after 392 m, capped and still reactable.
    for (let i = 1; i < curve.length; i++) assert.ok(curve[i].speed >= curve[i - 1].speed, JSON.stringify(curve));
    assert.ok(at(1200).speed > at(392).speed + 2, JSON.stringify(curve));
    assert.equal(at(1842).speed, 21);
    assert.equal(at(3000).speed, 21);
    assert.ok(at(1842).secondsBetweenRows < at(392).secondsBetweenRows, JSON.stringify(curve));
    for (const c of curve) assert.ok(c.secondsBetweenRows >= 0.99, JSON.stringify(c));
    // More obstacles later, and never a row with all three lanes walled off.
    assert.ok(rows[2000].obstaclesPerRow > rows[100].obstaclesPerRow + 0.3, JSON.stringify(rows));
    assert.equal(rows[100].pctSqueezeRows, 0);
    assert.ok(rows[2000].pctSqueezeRows >= 15, JSON.stringify(rows));
    assert.equal(unfairCount, 0, JSON.stringify(results.difficulty.unfair));
    await context.close();
  }

  assert.deepEqual(errors, []);
  results.pageErrors = errors;
  writeFileSync(resolve(directory, 'movement-verification.json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
  console.log('Movement regression checks passed');
} finally {
  await browser.close();
}
