const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Testing Subway Surfers-style Teasing Intro & Game Continuation...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleLogs.push(`ERROR: ${msg.text()}`);
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Check ready banner and tease bubble content
  const teaseQuote = await page.textContent('.tease-quote');
  console.log('Tease quote in banner:', teaseQuote);

  const gameState = await page.textContent('#game-state');
  console.log('Game state at startup:', gameState);

  // Frame 1: Standoff Ready - Tuku facing Lakhey playfully waving and teasing
  const f1Path = path.join(__dirname, 'tease_01_ready_standoff.png');
  await page.screenshot({ path: f1Path });
  console.log('Captured Frame 1 (Ready Teasing Standoff):', f1Path);

  // Press Space to start the run & provoke Lakhey
  await page.keyboard.press('Space');
  console.log('Pressed Space: Tuku leaps in climax taunt & spins off...');

  // Frame 2: Climax Tease Leap (0.22s)
  await page.waitForTimeout(220);
  const f2Path = path.join(__dirname, 'tease_02_climax_leap.png');
  await page.screenshot({ path: f2Path });
  console.log('Captured Frame 2 (Climax Tease Leap):', f2Path);

  // Frame 3: 180° Spin Takeoff (0.65s into intro)
  await page.waitForTimeout(430);
  const f3Path = path.join(__dirname, 'tease_03_180_spin_takeoff.png');
  await page.screenshot({ path: f3Path });
  console.log('Captured Frame 3 (180 Spin Takeoff):', f3Path);

  // Frame 4: Active Sprint Chase Settled (1.5s)
  await page.waitForTimeout(850);
  const f4Path = path.join(__dirname, 'tease_04_active_sprint_chase.png');
  await page.screenshot({ path: f4Path });
  console.log('Captured Frame 4 (Active Sprint Chase):', f4Path);

  const runningState = await page.textContent('#game-state');
  const runningSpeed = await page.textContent('#speed-val');
  const scoreVal = await page.textContent('#hud-score-val');
  console.log(`In-run telemetry: State=${runningState}, Speed=${runningSpeed}, Distance=${scoreVal}`);

  // Test Retry / Reset restores the teasing standoff
  // Trigger reset via button or key
  await page.keyboard.press('KeyR'); // or trigger retry
  await page.waitForTimeout(1000);

  const resetState = await page.textContent('#game-state');
  console.log('After reset test, Game state:', resetState);
  const f5Path = path.join(__dirname, 'tease_05_reset_standoff.png');
  await page.screenshot({ path: f5Path });
  console.log('Captured Frame 5 (Reset Standoff):', f5Path);

  if (consoleLogs.length > 0) {
    console.error('Console errors detected during run:', consoleLogs);
  } else {
    console.log('Console was clean with 0 errors!');
  }

  await browser.close();
  console.log('All teasing intro verification captures completed successfully!');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
