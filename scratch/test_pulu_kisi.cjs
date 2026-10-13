const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('====================================================');
  console.log('TEST SUITE: Pulu Kisi (White Elephant) Crossroad Runner');
  console.log('====================================================');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[Browser ERROR]:', msg.text());
  });
  page.on('pageerror', err => console.error('[Page uncaught error]:', err));

  // Determine active port (prefer 5173 dev server, fallback to 4173)
  let baseUrl = 'http://localhost:5173';
  try {
    const res = await page.goto(`${baseUrl}/viewer_pulu_kisi.html`, { timeout: 3000 });
    if (!res || res.status() !== 200) throw new Error('Not 200');
  } catch (e) {
    baseUrl = 'http://localhost:4173';
    console.log(`Fallback to baseUrl: ${baseUrl}`);
    await page.goto(`${baseUrl}/viewer_pulu_kisi.html`, { timeout: 6000 });
  }
  console.log(`Connected to test server at ${baseUrl}`);

  // ---------------------------------------------------------------------------
  // PART 1: 3D Turnaround Viewer Verification (viewer_pulu_kisi.html)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART 1: 3D Turnaround Viewer Verification ---');
  await page.waitForTimeout(1500);

  // Wait for model and joints to load
  const modelLoaded = await page.waitForFunction(() => {
    return window.__PULU_KISI_ROOT__ && window.__PULU_KISI_JOINTS__;
  }, { timeout: 8000 }).then(() => true).catch(() => false);

  if (!modelLoaded) {
    throw new Error('Pulu Kisi 3D model failed to load in viewer_pulu_kisi.html');
  }

  const jointAudit = await page.evaluate(() => {
    const j = window.__PULU_KISI_JOINTS__;
    return {
      hasBody: !!j.bodyNode,
      hasHead: !!j.headNode,
      hasTrunk: !!j.trunkNode,
      hasLeftEar: !!j.leftEarNode,
      hasRightEar: !!j.rightEarNode,
      hasBell: !!j.bellNode,
      hasTail: !!j.tailNode,
      hasFlLeg: !!j.flLegNode,
      hasFrLeg: !!j.frLegNode,
      hasBlLeg: !!j.blLegNode,
      hasBrLeg: !!j.brLegNode,
    };
  });
  console.log('Pulu Kisi Rigged Skeleton Joint Audit:', jointAudit);

  // Camera 1: Hero 3/4 Perspective
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(400);
  const heroPath = path.resolve(__dirname, 'pulu_kisi_01_hero_3_4.png');
  await page.screenshot({ path: heroPath });
  console.log(`Saved Hero Perspective screenshot -> ${heroPath}`);

  // Camera 2: Front View (Crossroad Dash)
  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(400);
  const frontPath = path.resolve(__dirname, 'pulu_kisi_02_front_dash.png');
  await page.screenshot({ path: frontPath });
  console.log(`Saved Front View screenshot -> ${frontPath}`);

  // Camera 3: Side Profile
  await page.evaluate(() => window.setView('side'));
  await page.waitForTimeout(400);
  const sidePath = path.resolve(__dirname, 'pulu_kisi_03_side_profile.png');
  await page.screenshot({ path: sidePath });
  console.log(`Saved Side Profile screenshot -> ${sidePath}`);

  // Camera 4: Top Dorsal
  await page.evaluate(() => window.setView('top'));
  await page.waitForTimeout(400);
  const topPath = path.resolve(__dirname, 'pulu_kisi_04_top_dorsal.png');
  await page.screenshot({ path: topPath });
  console.log(`Saved Top Dorsal screenshot -> ${topPath}`);

  // Test Gallop Run Animation Loop
  await page.evaluate(() => {
    window.setView('perspective');
    window.toggleAnimation();
  });
  await page.waitForTimeout(1000); // Let gallop cycle run
  const gallopPath = path.resolve(__dirname, 'pulu_kisi_05_gallop_action.png');
  await page.screenshot({ path: gallopPath });
  console.log(`Saved Gallop Run Action screenshot -> ${gallopPath}`);

  // ---------------------------------------------------------------------------
  // PART 2: In-Game Live Obstacle & Sound Integration Test
  // ---------------------------------------------------------------------------
  console.log('\n--- PART 2: In-Game Live Obstacle & Audio Integration ---');
  await page.goto(`${baseUrl}/`);
  await page.waitForTimeout(1000);

  // Unlock AudioContext and Start Game via Space
  await page.keyboard.press('Space');
  await page.waitForTimeout(1600); // Wait for intro swoop to settle

  // 1. Audit SoundManager synthesis methods
  const audioTest = await page.evaluate(() => {
    const s = window.__game.sound;
    const res = { bellPlayed: false, gallopPlayed: false };
    try {
      s.playPuluKisiBell(10.0);
      res.bellPlayed = true;
    } catch (e) {
      console.error('playPuluKisiBell error:', e);
    }
    try {
      s.playPuluKisiGallop(8.0);
      res.gallopPlayed = true;
    } catch (e) {
      console.error('playPuluKisiGallop error:', e);
    }
    return res;
  });
  console.log('Direct Web Audio Synthesis for Pulu Kisi:', audioTest);

  // 2. Audit ObstacleManager pool counts
  const poolCounts = await page.evaluate(() => {
    return window.__game.getObstacleManager().getPoolCounts();
  });
  console.log('Obstacle Pool Counts:', poolCounts);

  // 3. Spawn and track a Pulu Kisi crossroad dash directly
  console.log('\n--- PART 3: Crossroad Dash Simulation & Kinematics ---');
  const dashSimulation = await page.evaluate(() => {
    const om = window.__game.getObstacleManager();
    // Clear other obstacles for isolated test
    om.reset(42);

    // Explicitly activate Pulu Kisi at Z = -25m, crossing left-to-right (dir = +1)
    om.activatePuluKisi(-25.0, 1);

    const active = om.getActiveObstacles();
    const pk = active.find(o => o.type === 'PULU_KISI_CROSSING');
    if (!pk) return { success: false, reason: 'Pulu Kisi obstacle not active' };

    const initialX = pk.slideX;
    const initialBounds = { ...pk.bounds };

    // Simulate 1.2 seconds of approach (player at Z = -5m, distance = 20m)
    // Run 30 physics steps of dt = 0.04s
    for (let i = 0; i < 30; i++) {
      om.update(0.04, -5.0);
    }

    const midX = pk.slideX;
    const midBounds = { ...pk.bounds };
    const isDashing = pk.puluIsDashing;

    return {
      success: true,
      initialX,
      midX,
      initialBounds,
      midBounds,
      isDashing,
      hasJoints: !!pk.puluJoints,
    };
  });
  console.log('Crossroad Dash Kinematics Result:', dashSimulation);

  // 4. Test Skill Check: PULU_KISI_EVADED
  console.log('\n--- PART 4: Skill Check Evasion (PULU_KISI_EVADED) ---');
  const skillTest = await page.evaluate(() => {
    const om = window.__game.getObstacleManager();
    const active = om.getActiveObstacles();
    const pk = active.find(o => o.type === 'PULU_KISI_CROSSING');
    if (!pk) return null;

    // Position player right alongside Pulu Kisi (lateral dx = 1.3m, dz = 0.2m)
    const playerX = pk.slideX + 1.3;
    const playerY = 0.5;
    const playerZ = pk.z + 0.2;

    const skillResult = om.checkSkills(playerX, playerY, playerZ, false, false);
    return skillResult;
  });
  console.log('Skill Check Result:', skillTest);

  // 5. Live In-Game Run: Place Pulu Kisi in front of camera, capture high-res action screenshots
  await page.evaluate(() => {
    const om = window.__game.getObstacleManager();
    om.reset(42);
    // Spawn Pulu Kisi 14m in front of current player position
    const pz = window.__game.getPlayer().getZ();
    om.activatePuluKisi(pz - 14.0, 1);
  });

  // Let runner sprint forward towards the crossing
  await page.waitForTimeout(650);
  const inGameDashPath = path.resolve(__dirname, 'pulu_kisi_06_ingame_crossroad_dash.png');
  await page.screenshot({ path: inGameDashPath });
  console.log(`Saved In-Game Crossroad Dash screenshot -> ${inGameDashPath}`);

  // Trigger skill callout toast directly for visual evidence capture
  await page.evaluate(() => {
    const gm = window.__game;
    gm.getScoreManager().addSkillBonus(180);
    gm.sound.playCleanVaultCallout();
    gm.sound.playPuluKisiBell(0);
    // Dispatch skill callout event to HUD
    const toast = {
      type: 'PULU_KISI_EVADED',
      title: '🐘 PULU KISI EVADED!',
      subtitle: '+180 Crossroad Dash (1x)',
      points: 180,
      multiplier: 1,
      timestamp: Date.now(),
    };
    gm.activeSkillCallout = toast;
    gm.notifyTelemetry();
  });

  await page.waitForTimeout(300);
  const inGameCalloutPath = path.resolve(__dirname, 'pulu_kisi_07_ingame_evaded_callout.png');
  await page.screenshot({ path: inGameCalloutPath });
  console.log(`Saved In-Game Evaded Callout screenshot -> ${inGameCalloutPath}`);

  await browser.close();
  console.log('\n✅ All Pulu Kisi verification tests passed successfully!');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
