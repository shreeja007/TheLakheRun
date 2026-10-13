const { chromium } = require('playwright');
const path = require('path');

async function captureCloseups() {
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
  await page.waitForTimeout(1400); // intro pan finishes

  // 1. Position camera and runner to frame a line of spinning brass coins
  await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    // Clear obstacles right in front
    game.obstacleManager.reset();
    game.getCollectibleManager().reset();
    // Spawn 5 brass coins right in center lane ahead of runner
    game.getCollectibleManager().spawnGroundTrail(0, pZ - 10.0, 5);
  });

  await page.waitForTimeout(400);
  const coinShot = path.resolve(__dirname, 'evidence_brass_coins_trail.png');
  await page.screenshot({ path: coinShot });
  console.log('Saved evidence_brass_coins_trail.png');

  // 2. Spawn and frame a Rolling Terracotta Matka Pot
  await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.obstacleManager.activateStandardObstacle('ROLLING_MATKA', 0, pZ - 8.0);
  });

  await page.waitForTimeout(400);
  const matkaShot = path.resolve(__dirname, 'evidence_rolling_matka_pot.png');
  await page.screenshot({ path: matkaShot });
  console.log('Saved evidence_rolling_matka_pot.png');

  // 3. Spawn and frame a Sliding Newar Street Gate
  await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.obstacleManager.activateSlidingGate(0, pZ - 10.0, 0);
  });

  await page.waitForTimeout(400);
  const gateShot = path.resolve(__dirname, 'evidence_sliding_street_gate.png');
  await page.screenshot({ path: gateShot });
  console.log('Saved evidence_sliding_street_gate.png');

  // 4. Spawn an Airborne Vault Arc of coins over a low hurdle
  await page.evaluate(() => {
    const game = window.__game;
    const pZ = game.player.getZ();
    game.obstacleManager.reset();
    game.getCollectibleManager().reset();
    game.obstacleManager.activateStandardObstacle('LOW_BARRIER', 0, pZ - 10.0);
    game.getCollectibleManager().spawnVaultArc(0, pZ - 10.0);
  });

  await page.waitForTimeout(400);
  const arcShot = path.resolve(__dirname, 'evidence_airborne_vault_arc.png');
  await page.screenshot({ path: arcShot });
  console.log('Saved evidence_airborne_vault_arc.png');

  await browser.close();
  console.log('All close-up evidence shots captured!');
}

captureCloseups().catch(err => {
  console.error(err);
  process.exit(1);
});
