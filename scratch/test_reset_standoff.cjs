const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Testing Reset / Retry Standoff restoration...');
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
  await page.waitForTimeout(2000);

  // 1. Start run
  await page.keyboard.press('Space');
  await page.waitForTimeout(2000); // Run for 2 seconds

  // 2. Click Reset button at bottom
  console.log('Clicking Reset button...');
  await page.locator('#btn-reset').click();
  await page.waitForTimeout(1000);

  // 3. Capture restored standoff scene
  const resetPath = path.join(__dirname, 'reset_standoff_verified.png');
  await page.screenshot({ path: resetPath });
  console.log('Saved reset screenshot:', resetPath);

  await browser.close();
  console.log('Reset standoff verification complete!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
