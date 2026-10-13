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

  await page.goto('http://localhost:4173/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Start run
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(2000);

  // Trigger surge closer (simulate near-catch tension)
  await page.evaluate(() => {
    // In GameManager or window, surge guardian closer
    const gm = window.gameManager;
    if (gm && gm.guardian) {
      gm.guardian.surgeCloser(2.2);
    }
  });
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(__dirname, 'audit_lakhey_10_surge_close.png') });
  console.log('Saved audit_lakhey_10_surge_close.png');

  await browser.close();
}

main().catch(console.error);
