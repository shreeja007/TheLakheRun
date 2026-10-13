const { chromium } = require('playwright');
const path = require('path');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1000 },
    deviceScaleFactor: 2,
  });

  // Load lakhey viewer
  await page.goto('http://localhost:4173/viewer_lakhey.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Rest pose front view
  await page.evaluate(() => {
    window.setView('front');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_01_front_rest.png') });
  console.log('Saved audit_lakhey_01_front_rest.png');

  // 2. Rest pose perspective
  await page.evaluate(() => {
    window.setView('perspective');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_02_persp_rest.png') });
  console.log('Saved audit_lakhey_02_persp_rest.png');

  // 3. Rest pose side view
  await page.evaluate(() => {
    window.setView('side');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_03_side_rest.png') });
  console.log('Saved audit_lakhey_03_side_rest.png');

  // 4. Stride running side view
  await page.evaluate(() => {
    window.toggleAnimation();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_04_side_running.png') });
  console.log('Saved audit_lakhey_04_side_running.png');

  // 5. Stride running chase rear view
  await page.evaluate(() => {
    window.setView('chase_view');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_05_rear_running.png') });
  console.log('Saved audit_lakhey_05_rear_running.png');

  // 6. Turn animation off for crisp hand closeups
  await page.evaluate(() => {
    window.toggleAnimation();
    const app = window.app;
    const camera = app.root.findByName('Camera');
    // Left hand claw closeup (Front 3/4 angle)
    // Left shoulder is at X: 0.46, arm at Y: 1.4-1.3, hand at [0.46, 1.35, 0]
    camera.setPosition(0.75, 1.40, -0.65);
    camera.lookAt(0.46, 1.35, 0);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_06_left_hand_closeup.png') });
  console.log('Saved audit_lakhey_06_left_hand_closeup.png');

  // 7. Right hand Chāmara grip closeup
  await page.evaluate(() => {
    const app = window.app;
    const camera = app.root.findByName('Camera');
    // Right shoulder is at X: -0.46, hand at [-0.46, 1.35, 0]
    camera.setPosition(-0.75, 1.40, -0.65);
    camera.lookAt(-0.46, 1.35, 0);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_07_right_hand_chamara_closeup.png') });
  console.log('Saved audit_lakhey_07_right_hand_chamara_closeup.png');

  // 8. In-Game Subway Surfers Teasing Intro Standoff & Chase Check
  await page.goto('http://localhost:4173/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Standoff view
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_08_ingame_standoff.png') });
  console.log('Saved audit_lakhey_08_ingame_standoff.png');

  // Click start to trigger tease leap, 180 spin, and chase
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(1800); // Wait for sprint chase phase

  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_09_ingame_chase.png') });
  console.log('Saved audit_lakhey_09_ingame_chase.png');

  await browser.close();
}

main().catch(console.error);
