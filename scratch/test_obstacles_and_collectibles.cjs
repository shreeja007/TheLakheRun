const { chromium } = require('playwright');
const path = require('path');

async function runTest() {
  console.log('--- Starting Option 2 Obstacle Hazards & Collectibles Verification ---');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Initial Inspection of Pools and Setup
  const poolState = await page.evaluate(() => {
    const game = window.__game;
    const cm = game.getCollectibleManager();
    const om = game.obstacleManager;
    return {
      hasCollectibleManager: !!cm,
      coinsInPool: cm.pool.length,
      activeCoins: cm.getActiveCount(),
      obstaclePools: om.getPoolCounts(),
      scoreManagerCoins: game.getScoreManager().getCoins(),
    };
  });

  console.log('Pool State at startup:', JSON.stringify(poolState, null, 2));

  if (!poolState.hasCollectibleManager || poolState.coinsInPool !== 36) {
    throw new Error(`CollectibleManager initialization failed: pool size is ${poolState.coinsInPool}, expected 36`);
  }
  if (poolState.obstaclePools.matkaAvailable !== 8 || poolState.obstaclePools.gateAvailable !== 6) {
    throw new Error(`Obstacle pools incorrect: ${JSON.stringify(poolState.obstaclePools)}`);
  }

  // 2. Start Game
  console.log('Starting run...');
  await page.click('#ready-banner');
  await page.waitForTimeout(1400); // Wait for intro pan to settle

  // 3. Teleport or let run advance to encounter coins and obstacles
  // Let runner run for 4 seconds
  console.log('Running forward to encounter first coin line & hazards...');
  let totalCoinsCollected = 0;
  let sawMatka = false;
  let sawGate = false;
  let sawVaultArc = false;

  for (let step = 0; step < 8; step++) {
    await page.waitForTimeout(600);

    const stepInfo = await page.evaluate(() => {
      const game = window.__game;
      const cm = game.getCollectibleManager();
      const om = game.obstacleManager;
      const player = game.player;

      const activeObs = om.getActiveObstacles().map(o => ({
        type: o.type,
        lane: o.lane,
        z: o.z,
        rollPitch: o.rollPitch,
        slideX: o.slideX
      }));

      const activeCoins = cm.activeCoins.map(c => ({
        lane: c.lane,
        x: c.x,
        y: c.y,
        z: c.z,
        isBeingPulled: c.isBeingPulled
      }));

      return {
        dist: player.totalDistance,
        coins: game.getScoreManager().getCoins(),
        activeObs,
        activeCoins,
        hudCoinsText: document.getElementById('hud-coins-val')?.textContent,
      };
    });

    totalCoinsCollected = stepInfo.coins;
    if (stepInfo.activeObs.some(o => o.type === 'ROLLING_MATKA')) sawMatka = true;
    if (stepInfo.activeObs.some(o => o.type === 'SLIDING_GATE')) sawGate = true;
    if (stepInfo.activeCoins.some(c => c.y > 1.0)) sawVaultArc = true;

    console.log(`Step ${step}: Dist=${stepInfo.dist.toFixed(1)}m, Coins=${stepInfo.coins}, ActiveCoins=${stepInfo.activeCoins.length}, ActiveObs=${stepInfo.activeObs.map(o => o.type).join(',')}`);
  }

  // 4. Capture screenshot of running action with coins and hazards
  const actionShot = path.resolve(__dirname, 'evidence_01_coins_and_hazards.png');
  await page.screenshot({ path: actionShot });
  console.log('Saved evidence_01_coins_and_hazards.png');

  // 5. Test intentional jump over hurdle / matka
  console.log('Testing jump vault mechanic...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);

  const jumpState = await page.evaluate(() => {
    return {
      isJumping: window.__game.player.isJumping,
      playerY: window.__game.player.currentY,
    };
  });
  console.log('Player jump state:', jumpState);

  // 6. Test intentional collision with ROLLING_MATKA to verify shatter FX & SFX
  console.log('Setting up direct matka collision test...');
  await page.evaluate(() => {
    const game = window.__game;
    // Spawn a rolling matka directly in front of player
    const pZ = game.player.getZ();
    const pX = game.player.getX();
    game.obstacleManager.activateStandardObstacle('ROLLING_MATKA', 0, pZ - 3.0);
  });

  await page.waitForTimeout(350); // Let matka roll into player

  const collisionResult = await page.evaluate(() => {
    const game = window.__game;
    return {
      state: game.getState(),
      collisionCount: game.collisionCount,
      activeFx: game.fx.getActiveCount(),
      causeText: document.getElementById('gameover-cause')?.textContent,
      modalCoinsText: document.getElementById('modal-coins-val')?.textContent,
    };
  });

  console.log('Collision result:', collisionResult);

  const gameOverShot = path.resolve(__dirname, 'evidence_02_matka_smash_gameover.png');
  await page.screenshot({ path: gameOverShot });
  console.log('Saved evidence_02_matka_smash_gameover.png');

  // 7. Test Instant Retry
  console.log('Testing retry...');
  await page.click('#btn-modal-retry');
  await page.waitForTimeout(1000);

  const retryState = await page.evaluate(() => {
    const game = window.__game;
    return {
      state: game.getState(),
      coins: game.getScoreManager().getCoins(),
      hudCoins: document.getElementById('hud-coins-val')?.textContent,
    };
  });
  console.log('Retry State:', retryState);

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log('Saw Rolling Matka:', sawMatka);
  console.log('Saw Sliding Gate:', sawGate);
  console.log('Saw Vault Arc Coins:', sawVaultArc);
  console.log('Console Errors:', consoleErrors.length > 0 ? consoleErrors : 'None (0 errors)');

  await browser.close();
  console.log('Test completed successfully!');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
