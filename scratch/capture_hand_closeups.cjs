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
    viewport: { width: 900, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto('http://localhost:4173/viewer_lakhey.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Left Hand Open Claw Hero Closeup
  await page.evaluate(() => {
    const app = window.app;
    const camera = app.root.findByName('Camera');
    camera.setPosition(0.56, 1.04, -0.42);
    camera.lookAt(0.46, 1.04, -0.02);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_left_claw_closeup.png') });
  console.log('Saved audit_lakhey_left_claw_closeup.png');

  // 2. Right Hand Chāmara Grip Hero Closeup
  await page.evaluate(() => {
    const app = window.app;
    const camera = app.root.findByName('Camera');
    camera.setPosition(-0.56, 1.04, -0.46);
    camera.lookAt(-0.46, 1.04, -0.06);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_right_chamara_grip_closeup.png') });
  console.log('Saved audit_lakhey_right_chamara_grip_closeup.png');

  await browser.close();
}

main().catch(console.error);
