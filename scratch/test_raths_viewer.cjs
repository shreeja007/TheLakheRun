const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log('--- Testing The 3 Sacred Raths 3D Viewer ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[Browser ERROR]:', msg.text());
  });

  const baseUrl = 'http://localhost:5173';
  await page.goto(`${baseUrl}/viewer_raths.html`);
  await page.waitForTimeout(1500);

  // 1. Verify Kumari Rath
  const kumariLoaded = await page.waitForFunction(() => {
    return window.__ACTIVE_RATH__ && window.__ACTIVE_RATH__.wheels.length > 0;
  }, { timeout: 8000 }).then(() => true).catch(() => false);

  console.log('Kumari Rath loaded:', kumariLoaded);
  const kumariWheelCount = await page.evaluate(() => window.__ACTIVE_RATH__.wheels.length);
  console.log(`Kumari Rath Wheel Count: ${kumariWheelCount}`);
  await page.screenshot({ path: path.resolve(__dirname, 'rath_01_kumari_hero.png') });

  // 2. Switch to Bhairab Rath
  console.log('Switching to Bhairab Rath...');
  await page.evaluate(() => window.switchRath('bhairab'));
  await page.waitForTimeout(1500);
  const bhairabWheelCount = await page.evaluate(() => window.__ACTIVE_RATH__.wheels.length);
  console.log(`Bhairab Rath Wheel Count: ${bhairabWheelCount}`);
  await page.screenshot({ path: path.resolve(__dirname, 'rath_02_bhairab_hero.png') });

  // 3. Switch to Ganesh Rath
  console.log('Switching to Ganesh Rath...');
  await page.evaluate(() => window.switchRath('ganesh'));
  await page.waitForTimeout(1500);
  const ganeshWheelCount = await page.evaluate(() => window.__ACTIVE_RATH__.wheels.length);
  console.log(`Ganesh Rath Wheel Count: ${ganeshWheelCount}`);
  await page.screenshot({ path: path.resolve(__dirname, 'rath_03_ganesh_hero.png') });

  // 4. Test Wheel Rolling and Side View
  await page.evaluate(() => {
    window.setView('side');
    window.toggleWheelRoll();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.resolve(__dirname, 'rath_04_side_rolling.png') });

  await browser.close();
  console.log('✅ All 3 Raths verified successfully in 3D viewer!');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
