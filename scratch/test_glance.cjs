const { chromium } = require('playwright');
const path = require('path');

async function captureGlance() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Start run
  await page.click('#start-banner');
  await page.waitForTimeout(2000); // Wait past intro pan

  // Inject close proximity to capture Tuku's glance back over shoulder
  await page.evaluate(() => {
    // Access game manager if exposed or simulate proximity
    const app = (window).pcApp;
    // We can evaluate directly or inspect
  });

  // Let's run into an obstacle or wait for a moment where Lakhey surges
  // Let's take a screenshot after 3 seconds
  await page.waitForTimeout(3000);
  const screenshotPath = path.resolve(__dirname, 'in_chase_action.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved chase action screenshot');

  await browser.close();
}

captureGlance().catch(console.error);
