const { chromium } = require('playwright');

async function testJumpClearance() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('#ready-banner');
  await page.waitForTimeout(1400);

  // Test jumping over a LOW_BARRIER
  const hurdleJumpResult = await page.evaluate(async () => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.obstacleManager.activateStandardObstacle('LOW_BARRIER', 0, pZ - 8.0);

    // Trigger jump right when approaching
    game.player.jump();

    // Simulate 0.5s of progression
    for (let i = 0; i < 30; i++) {
      game.update(0.016);
    }

    return {
      state: game.getState(),
      collisionCount: game.collisionCount,
      playerY: game.player.getY(),
      isJumping: game.player.getTelemetry().isJumping,
    };
  });

  console.log('Hurdle Vault Result:', hurdleJumpResult);

  // Test jumping over a ROLLING_MATKA
  const matkaJumpResult = await page.evaluate(async () => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.obstacleManager.activateStandardObstacle('ROLLING_MATKA', 0, pZ - 8.0);

    // Trigger jump
    game.player.jump();

    // Advance 30 frames
    for (let i = 0; i < 30; i++) {
      game.update(0.016);
    }

    return {
      state: game.getState(),
      collisionCount: game.collisionCount,
      playerY: game.player.getY(),
    };
  });

  console.log('Rolling Matka Vault Result:', matkaJumpResult);

  if (hurdleJumpResult.collisionCount !== 0 || matkaJumpResult.collisionCount !== 0) {
    throw new Error('Jump clearance failed! Collision occurred while vaulting.');
  }

  console.log('PASS: Vault jump clears both low barriers and rolling matkas cleanly!');
  await browser.close();
}

testJumpClearance().catch(err => {
  console.error(err);
  process.exit(1);
});
