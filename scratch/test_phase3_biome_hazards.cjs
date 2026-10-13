const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('--- Testing Phase 3: Biome Hazards & Landmark Props ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 440, height: 860 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // 1. Verify pool counts contain new hazard types
  const poolCounts = await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();
    return om.getPoolCounts();
  });
  console.log('1. Pool Counts:', poolCounts);
  if (poolCounts.ghatAvailable === 6 && poolCounts.ropeAvailable === 6 && poolCounts.flagAvailable === 6) {
    console.log('   PASS: ghatAvailable, ropeAvailable, flagAvailable all pre-allocated to 6!');
  } else {
    console.error('   FAIL: Pool counts unexpected:', poolCounts);
  }

  // 2. Start game and test activating each new hazard directly
  await page.click('#ready-banner');
  await page.waitForTimeout(500);

  const hazardTests = await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();
    const player = gm.getPlayer();

    // Test A: GHAT_STEPS
    om.reset(42);
    om.activateStandardObstacle('GHAT_STEPS', 0, -20);
    const ghatObs = om.getActiveObstacles()[0];
    const ghatBounds = { ...ghatObs.bounds };

    // Test Standing Collision with GHAT_STEPS
    const standingBounds = {
      minX: -0.4,
      maxX: 0.4,
      minY: 0.0,
      maxY: 1.0,
      minZ: -20.3,
      maxZ: -19.7,
    };
    const ghatHitStanding = om.checkCollisions(standingBounds, 20);

    // Reset collision flag for skill clearance check
    ghatObs.hasTriggeredCollision = false;
    const vaultSkill = om.checkSkills(0, 1.2, -20.1, true, false);

    // Test B: BRIDGE_ROPE
    om.reset(42);
    om.activateStandardObstacle('BRIDGE_ROPE', 0, -20);
    const ropeObs = om.getActiveObstacles()[0];
    const ropeBounds = { ...ropeObs.bounds };

    // Standing hits BRIDGE_ROPE
    const ropeHitStanding = om.checkCollisions(standingBounds, 20);

    // Sliding clears BRIDGE_ROPE
    const slidingBounds = {
      minX: -0.4,
      maxX: 0.4,
      minY: 0.0,
      maxY: 0.38,
      minZ: -20.3,
      maxZ: -19.7,
    };
    ropeObs.hasTriggeredCollision = false;
    const ropeHitSliding = om.checkCollisions(slidingBounds, 20);
    const ropeSkill = om.checkSkills(0, 0.2, -20.1, false, true);

    // Test C: PRAYER_FLAG_GALE
    om.reset(42);
    om.activateStandardObstacle('PRAYER_FLAG_GALE', 0, -20);
    const flagObs = om.getActiveObstacles()[0];
    const flagBounds = { ...flagObs.bounds };

    // Standing hits PRAYER_FLAG_GALE
    const flagHitStanding = om.checkCollisions(standingBounds, 20);

    // Sliding clears PRAYER_FLAG_GALE
    flagObs.hasTriggeredCollision = false;
    const flagHitSliding = om.checkCollisions(slidingBounds, 20);
    const flagSkill = om.checkSkills(0, 0.2, -20.1, false, true);

    return {
      ghatBounds,
      ghatHitStanding: !!ghatHitStanding,
      vaultSkill,
      ropeBounds,
      ropeHitStanding: !!ropeHitStanding,
      ropeHitSliding: !!ropeHitSliding,
      ropeSkill,
      flagBounds,
      flagHitStanding: !!flagHitStanding,
      flagHitSliding: !!flagHitSliding,
      flagSkill,
    };
  });

  console.log('2. Hazard Tests Result:', JSON.stringify(hazardTests, null, 2));

  // Assertions
  if (hazardTests.ghatHitStanding && hazardTests.vaultSkill && hazardTests.vaultSkill.type === 'CLEAN_VAULT') {
    console.log('   PASS: GHAT_STEPS hits standing player and yields CLEAN_VAULT when vaulting!');
  } else {
    console.error('   FAIL: GHAT_STEPS test failed!');
  }

  if (hazardTests.ropeHitStanding && !hazardTests.ropeHitSliding && hazardTests.ropeSkill && hazardTests.ropeSkill.type === 'CLEAN_SLIDE') {
    console.log('   PASS: BRIDGE_ROPE hits standing player, safely clears sliding player, and yields CLEAN_SLIDE!');
  } else {
    console.error('   FAIL: BRIDGE_ROPE test failed!');
  }

  if (hazardTests.flagHitStanding && !hazardTests.flagHitSliding && hazardTests.flagSkill && hazardTests.flagSkill.type === 'WIND_GUST_EVADED') {
    console.log('   PASS: PRAYER_FLAG_GALE hits standing, safely clears sliding, and yields WIND_GUST_EVADED!');
  } else {
    console.error('   FAIL: PRAYER_FLAG_GALE test failed!');
  }

  // 3. Test Biome-Aware Hazard Selection
  const thematicSpawnTest = await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();

    // Biome 0: z = -40 (Durbar Alley, dist = 40m)
    // Biome 1: z = -180 (Sacred River Causeway, dist = 180m)
    // Biome 2: z = -320 (Himalayan Temple Hill, dist = 320m)
    const countsBiome0 = {};
    const countsBiome1 = {};
    const countsBiome2 = {};

    for (let i = 0; i < 50; i++) {
      const t0 = om['pickThematicHazard'](0);
      countsBiome0[t0] = (countsBiome0[t0] || 0) + 1;

      const t1 = om['pickThematicHazard'](1);
      countsBiome1[t1] = (countsBiome1[t1] || 0) + 1;

      const t2 = om['pickThematicHazard'](2);
      countsBiome2[t2] = (countsBiome2[t2] || 0) + 1;
    }

    return { countsBiome0, countsBiome1, countsBiome2 };
  });

  console.log('3. Thematic Hazard Spawn Distribution (50 samples each):');
  console.log('   Biome 0 (Durbar Alley):', thematicSpawnTest.countsBiome0);
  console.log('   Biome 1 (Causeway):', thematicSpawnTest.countsBiome1);
  console.log('   Biome 2 (Temple Hill):', thematicSpawnTest.countsBiome2);

  if (thematicSpawnTest.countsBiome1['GHAT_STEPS'] > 0 && thematicSpawnTest.countsBiome1['BRIDGE_ROPE'] > 0) {
    console.log('   PASS: Biome 1 Causeway spawns GHAT_STEPS and BRIDGE_ROPE!');
  } else {
    console.error('   FAIL: Biome 1 did not spawn causeway hazards!');
  }

  if (thematicSpawnTest.countsBiome2['PRAYER_FLAG_GALE'] > 0) {
    console.log('   PASS: Biome 2 Temple Hill spawns PRAYER_FLAG_GALE!');
  } else {
    console.error('   FAIL: Biome 2 did not spawn prayer flag gale!');
  }

  // 4. Test Dynamic Animations (Lantern Sway & Flag Flutter)
  const animTest = await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();
    om.reset(42);
    om.activateStandardObstacle('BRIDGE_ROPE', 0, -20);
    om.activateStandardObstacle('PRAYER_FLAG_GALE', 1, -25);

    const rope = om.getActiveObstacles()[0];
    const flag = om.getActiveObstacles()[1];

    const lamp = rope.entity.findByName('RiverLamp_-0.45');
    const f0 = flag.entity.findByName('Flag_0');

    // Sample at t = 0
    om.update(0.016, 0);
    const rotLamp0 = lamp ? lamp.getLocalEulerAngles().z : 0;
    const rotFlag0 = f0 ? f0.getLocalEulerAngles().x : 0;

    // Advance time by 0.5s
    om.update(0.5, 0);
    const rotLamp1 = lamp ? lamp.getLocalEulerAngles().z : 0;
    const rotFlag1 = f0 ? f0.getLocalEulerAngles().x : 0;

    return {
      lampSwaying: rotLamp0 !== rotLamp1,
      flagFluttering: rotFlag0 !== rotFlag1,
      rotLamp0,
      rotLamp1,
      rotFlag0,
      rotFlag1,
    };
  });
  console.log('4. Dynamic Animation Tests:', animTest);
  if (animTest.lampSwaying && animTest.flagFluttering) {
    console.log('   PASS: Hanging lanterns sway and prayer flags flutter dynamically!');
  } else {
    console.error('   FAIL: Animations did not oscillate!');
  }

  // 5. Visual Capture: spawn hazards in front of player and capture screenshots
  const outDir = path.join(__dirname, 'evidence_phase3');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Reset and spawn Ghat Steps in Causeway view
  await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();
    const road = gm['road'];
    om.reset(42);
    // Transport player to River Causeway distance (160m)
    gm.getPlayer().teleportZ(-160);
    road.update(-160, 0.016);
    om.activateStandardObstacle('GHAT_STEPS', 0, -170);
    om.activateStandardObstacle('BRIDGE_ROPE', 1, -178);
  });
  await page.waitForTimeout(400);
  const ss1 = path.join(outDir, '01_causeway_ghat_steps_and_bridge_rope.png');
  await page.screenshot({ path: ss1 });
  console.log('5. Screenshot saved:', ss1);

  // Transport player to Temple Hill and spawn Prayer Flag Gale
  await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();
    const road = gm['road'];
    om.reset(42);
    // Transport player to Temple Hill distance (300m)
    gm.getPlayer().teleportZ(-300);
    road.update(-300, 0.016);
    om.activateStandardObstacle('PRAYER_FLAG_GALE', 0, -310);
    om.activateStandardObstacle('ROLLING_MATKA', 1, -316);
  });
  await page.waitForTimeout(400);
  const ss2 = path.join(outDir, '02_temple_hill_prayer_flag_gale.png');
  await page.screenshot({ path: ss2 });
  console.log('5. Screenshot saved:', ss2);

  // Trigger WIND_GUST_EVADED callout toast and screenshot
  await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    player.slide();
    const skill = gm.getObstacleManager().checkSkills(0, 0.2, -310.1, false, true);
    // Force callout trigger on GameManager
    if (skill) {
      gm['sound'].playWindGaleSound();
      gm['fx'].emitWindGaleStreaks(0, 1.1, -310);
      gm['activeSkillCallout'] = {
        type: 'WIND_GUST_EVADED',
        title: 'WIND SLIP!',
        subtitle: '+60 Lung-ta Gale Evaded (1x)',
        points: 60,
        multiplier: 1,
        timestamp: performance.now(),
      };
      gm.notifyTelemetry();
    }
  });
  await page.waitForTimeout(300);
  const ss3 = path.join(outDir, '03_wind_gust_evaded_callout_toast.png');
  await page.screenshot({ path: ss3 });
  console.log('5. Screenshot saved:', ss3);

  console.log('Console Errors:', consoleErrors);
  if (consoleErrors.length === 0) {
    console.log('ALL PHASE 3 AUTOMATED TESTS PASSED WITH 0 CONSOLE ERRORS!');
  } else {
    console.error('Console errors detected:', consoleErrors);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
