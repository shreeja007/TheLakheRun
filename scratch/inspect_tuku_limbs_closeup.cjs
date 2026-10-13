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
    viewport: { width: 800, height: 1000 },
    deviceScaleFactor: 2,
  });

  // Load tuku viewer
  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Switch to back view (like in gameplay)
  await page.evaluate(() => {
    window.setView('back');
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_back_rest.png') });
  console.log('Saved audit_tuku_back_rest.png');

  // Turn on sprint stride animation
  await page.evaluate(() => {
    window.toggleAnimation('run');
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_back_running.png') });
  console.log('Saved audit_tuku_back_running.png');

  // Switch to side view running
  await page.evaluate(() => {
    window.setView('side');
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_side_running.png') });
  console.log('Saved audit_tuku_side_running.png');

  // Switch to front view
  await page.evaluate(() => {
    window.setView('front');
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_front_running.png') });
  console.log('Saved audit_tuku_front_running.png');

  await browser.close();
}

main().catch(console.error);
