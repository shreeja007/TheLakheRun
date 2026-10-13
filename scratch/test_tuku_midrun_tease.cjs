const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  console.log('--- 1. Testing Tuku Viewer Tease Animations ---');
  await page.goto('http://localhost:4173/viewer_tuku.html');
  await page.waitForTimeout(1200);

  // Set view to back (gameplay camera)
  await page.evaluate(() => window.setView('back'));
  await page.waitForTimeout(300);

  // Test Taunt 1: Beckon Wave ("Come catch me!")
  console.log('Testing Taunt 1: Beckon Wave...');
  await page.evaluate(() => window.testTease(0));
  await page.waitForTimeout(650); // Mid-hold phase
  const tease1Path = path.join(__dirname, 'evidence_tuku_tease_01_beckon_wave.png');
  await page.screenshot({ path: tease1Path });
  console.log(`Saved ${tease1Path}`);

  // Test Taunt 2: Double Wave
  console.log('Testing Taunt 2: Double-Hand Wave...');
  await page.evaluate(() => window.testTease(1));
  await page.waitForTimeout(650);
  const tease2Path = path.join(__dirname, 'evidence_tuku_tease_02_double_wave.png');
  await page.screenshot({ path: tease2Path });
  console.log(`Saved ${tease2Path}`);

  // Test Taunt 3: Chest Thump
  console.log('Testing Taunt 3: Confident Chest Thump...');
  await page.evaluate(() => window.testTease(2));
  await page.waitForTimeout(650);
  const tease3Path = path.join(__dirname, 'evidence_tuku_tease_03_chest_thump.png');
  await page.screenshot({ path: tease3Path });
  console.log(`Saved ${tease3Path}`);

  // Also capture 3/4 perspective view of Taunt 1
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.testTease(0));
  await page.waitForTimeout(650);
  const teasePerspPath = path.join(__dirname, 'evidence_tuku_tease_04_persp_beckon.png');
  await page.screenshot({ path: teasePerspPath });
  console.log(`Saved ${teasePerspPath}`);

  console.log('--- 2. Testing In-Game Live Sprint Chase Tease ---');
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // Start run
  await page.keyboard.press('Space');
  // Wait for intro pan & initial acceleration (1.8s)
  await page.waitForTimeout(2000);

  // Trigger Mid-Run Tease via keyboard 'T' key
  console.log('Triggering in-game mid-run tease via key T...');
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(550); // Mid-tease backward stride

  const inGameTeasePath = path.join(__dirname, 'evidence_tuku_tease_05_ingame_chase.png');
  await page.screenshot({ path: inGameTeasePath });
  console.log(`Saved ${inGameTeasePath}`);

  // Check state and telemetry
  const telemetry = await page.evaluate(() => {
    const game = window.__game;
    return {
      state: game.getState(),
      isTeasing: game.getPlayer().isTeasingActive(),
      variant: game.getPlayer().getTeaseVariant(),
      multiplier: game.getScoreManager().getMultiplier(),
      distance: game.getPlayer().getTelemetry().distance,
      guardianDist: game.getGuardian().getFollowDistance()
    };
  });
  console.log('Telemetry during tease:', telemetry);

  // Test instant cancel: while teasing, press Left or Space
  console.log('Testing zero-latency instant cancel via jump...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(100);
  const cancelTelemetry = await page.evaluate(() => {
    const game = window.__game;
    return {
      isTeasing: game.getPlayer().isTeasingActive(),
      isJumping: game.getPlayer().getTelemetry().isJumping
    };
  });
  console.log('Telemetry after instant jump cancel:', cancelTelemetry);

  const inGameCancelPath = path.join(__dirname, 'evidence_tuku_tease_06_instant_cancel.png');
  await page.screenshot({ path: inGameCancelPath });
  console.log(`Saved ${inGameCancelPath}`);

  await browser.close();
  console.log('All tests completed successfully!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
