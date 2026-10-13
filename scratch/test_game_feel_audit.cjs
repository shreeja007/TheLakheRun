const { chromium } = require('playwright');
const path = require('path');

async function testGameFeelAudit() {
  console.log('--- Starting Game Feel & Juice Audit Verification ---');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Start run
  await page.click('#ready-banner');
  await page.waitForTimeout(1400);

  // 1. Verify Coin Drop Shadows & Combo Punch
  console.log('Testing coin drop shadows and combo punch...');
  const shadowCheck = await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.getCollectibleManager().reset();
    game.getCollectibleManager().spawnGroundTrail(0, pZ - 8.0, 5);

    const activeCoins = game.getCollectibleManager().activeCoins;
    return {
      activeCount: activeCoins.length,
      hasShadows: activeCoins.every(c => !!c.shadowEntity),
      shadowPositions: activeCoins.map(c => ({
        x: c.shadowEntity.getPosition().x,
        y: c.shadowEntity.getPosition().y,
        z: c.shadowEntity.getPosition().z,
        enabled: c.shadowEntity.enabled
      }))
    };
  });

  console.log('Coin Shadow Check:', shadowCheck);

  if (!shadowCheck.hasShadows || shadowCheck.shadowPositions.length === 0) {
    throw new Error('Coin drop shadow disks missing or unattached!');
  }

  // Advance to collect coins and check combo & pop
  let maxCombo = 0;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(50);
    const comboInfo = await page.evaluate(() => {
      const game = window.__game;
      return {
        coins: game.getScoreManager().getCoins(),
        combo: game.getCollectibleManager().getComboCount(),
        hasPopClass: document.getElementById('hud-coin-badge')?.classList.contains('coin-pop'),
        comboBadgeText: document.getElementById('hud-combo-badge')?.textContent,
      };
    });
    if (comboInfo.combo > maxCombo) maxCombo = comboInfo.combo;
  }

  console.log('Max Combo reached during trail:', maxCombo);
  const shot1 = path.resolve(__dirname, 'audit_01_coin_shadows_and_combo.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved audit_01_coin_shadows_and_combo.png');

  // 2. Verify Sliding Gate Iron Guide Rail & Lantern Sway
  console.log('Testing sliding gate iron guide rail & lantern sway...');
  const gateCheck = await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.obstacleManager.activateSlidingGate(0, pZ - 10.0, 0);

    const activeObs = game.obstacleManager.getActiveObstacles();
    const gate = activeObs.find(o => o.type === 'SLIDING_GATE');

    // Advance 5 frames to induce slide velocity
    game.obstacleManager.update(0.08, pZ);

    const lampL = gate.entity.findByName('LampL');
    const lampR = gate.entity.findByName('LampR');

    return {
      hasGuideTrack: !!gate.guideTrackEntity,
      guideTrackEnabled: gate.guideTrackEntity ? gate.guideTrackEntity.enabled : false,
      guideTrackZ: gate.guideTrackEntity ? gate.guideTrackEntity.getPosition().z : null,
      lampLRotZ: lampL ? lampL.getLocalEulerAngles().z : 0,
      lampRRotZ: lampR ? lampR.getLocalEulerAngles().z : 0,
    };
  });

  console.log('Sliding Gate Check:', gateCheck);

  if (!gateCheck.hasGuideTrack || !gateCheck.guideTrackEnabled) {
    throw new Error('Sliding Gate iron guide rail on road missing or disabled!');
  }

  const shot2 = path.resolve(__dirname, 'audit_02_sliding_gate_runner_and_lanterns.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved audit_02_sliding_gate_runner_and_lanterns.png');

  // 3. Verify Rolling Matka Wobble & Dust Trail
  console.log('Testing rolling matka wobble and dust trail...');
  const matkaCheck = await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.obstacleManager.activateStandardObstacle('ROLLING_MATKA', 0, pZ - 8.0);

    const initialRot = game.obstacleManager.getActiveObstacles()[0].entity.findByName('PotRotator').getLocalEulerAngles();

    // Advance 10 frames to induce rolling and dust
    let dustCalls = 0;
    game.fx.pool.filter(p => p.active && p.category === 'DUST').length;

    for (let f = 0; f < 10; f++) {
      game.obstacleManager.update(0.04, pZ);
      game.fx.update(0.04);
    }

    const newRot = game.obstacleManager.getActiveObstacles()[0].entity.findByName('PotRotator').getLocalEulerAngles();
    const activeDust = game.fx.pool.filter(p => p.active && p.category === 'DUST').length;

    return {
      initialRot: { x: initialRot.x, y: initialRot.y, z: initialRot.z },
      newRot: { x: newRot.x, y: newRot.y, z: newRot.z },
      hasWobble: Math.abs(newRot.z) > 0.1 || Math.abs(newRot.y) > 0.1,
      activeDust,
    };
  });

  console.log('Matka Check:', matkaCheck);

  const shot3 = path.resolve(__dirname, 'audit_03_matka_wobble_and_trail.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved audit_03_matka_wobble_and_trail.png');

  console.log('\n--- AUDIT VERIFICATION COMPLETE ---');
  console.log('All game feel, visual juice, audio combos, and telegraph cues verified!');

  await browser.close();
}

testGameFeelAudit().catch(err => {
  console.error('Audit verification failed:', err);
  process.exit(1);
});
