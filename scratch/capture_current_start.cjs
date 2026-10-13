const { chromium } = require('playwright');
const path = require('path');

async function capture() {
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

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Wait 2.5s for 3D assets to load and render
  await page.waitForTimeout(2500);

  const outPath = path.join(__dirname, 'current_start_audit.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
}

capture().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
