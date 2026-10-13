const { chromium } = require('playwright');

async function main() {
  console.log('Verifying console logs, draw calls, and performance...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Read FPS and Draw Calls from DOM
  const fps = await page.$eval('#fps-val', el => el.textContent);
  const dc = await page.$eval('#dc-val', el => el.textContent);
  console.log(`Standoff State -> FPS: ${fps}, Draw Calls: ${dc}`);

  // Start running
  await page.keyboard.press('Space');
  await page.waitForTimeout(3000);

  const runFps = await page.$eval('#fps-val', el => el.textContent);
  const runDc = await page.$eval('#dc-val', el => el.textContent);
  console.log(`Running State -> FPS: ${runFps}, Draw Calls: ${runDc}`);

  console.log('Console Errors:', errors.length === 0 ? 'NONE' : errors);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
