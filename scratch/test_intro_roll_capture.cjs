const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Testing Camera Roll and Intro Pan from Lakhey...');
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

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Frame 1: Standoff Ready
  const f1Path = path.join(__dirname, 'roll_01_standoff_ready.png');
  await page.screenshot({ path: f1Path });
  console.log('Frame 1 saved:', f1Path);

  // Press Space to start the run
  await page.keyboard.press('Space');
  console.log('Pressed Space to start run...');

  // Frame 2: Early roll (0.25s)
  await page.waitForTimeout(250);
  const f2Path = path.join(__dirname, 'roll_02_early_arc.png');
  await page.screenshot({ path: f2Path });
  console.log('Frame 2 saved:', f2Path);

  // Frame 3: Peak orbit and bank roll (0.6s)
  await page.waitForTimeout(350);
  const f3Path = path.join(__dirname, 'roll_03_peak_bank_roll.png');
  await page.screenshot({ path: f3Path });
  console.log('Frame 3 saved:', f3Path);

  // Frame 4: Snapping into chase behind Tuku (1.1s)
  await page.waitForTimeout(500);
  const f4Path = path.join(__dirname, 'roll_04_settling_behind_tuku.png');
  await page.screenshot({ path: f4Path });
  console.log('Frame 4 saved:', f4Path);

  // Frame 5: Sprint chase active (1.8s)
  await page.waitForTimeout(700);
  const f5Path = path.join(__dirname, 'roll_05_active_chase.png');
  await page.screenshot({ path: f5Path });
  console.log('Frame 5 saved:', f5Path);

  await browser.close();
  console.log('Intro camera roll capture completed successfully!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
