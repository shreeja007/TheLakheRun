const { chromium } = require('playwright');
const path = require('path');

async function captureIntroPan() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 500, height: 750 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. Wait for models to load and initial scene to settle
  await page.waitForTimeout(2000);

  // Take screenshot of READY standoff framing (front 3/4 angle)
  const readyPath = path.resolve(__dirname, 'intro_01_ready_standoff.png');
  await page.screenshot({ path: readyPath });
  console.log('Saved READY standoff screenshot to', readyPath);

  // 2. Click start banner to initiate the run and intro swoop
  console.log('Initiating run by tapping banner...');
  const banner = await page.$('#start-banner');
  if (banner) {
    await banner.click();
  } else {
    await page.keyboard.press('Space');
  }

  // 3. Capture mid-swoop frame (~0.6s into the 1.35s pan)
  await page.waitForTimeout(600);
  const midSwoopPath = path.resolve(__dirname, 'intro_02_mid_swoop.png');
  await page.screenshot({ path: midSwoopPath });
  console.log('Saved mid-swoop screenshot to', midSwoopPath);

  // 4. Capture settled chase frame (~1.8s, full behind-back sprint)
  await page.waitForTimeout(1200);
  const settledChasePath = path.resolve(__dirname, 'intro_03_settled_chase.png');
  await page.screenshot({ path: settledChasePath });
  console.log('Saved settled chase screenshot to', settledChasePath);

  // 5. Let run continue to capture close proximity interaction if any
  await page.waitForTimeout(2500);
  const runChasePath = path.resolve(__dirname, 'intro_04_run_action.png');
  await page.screenshot({ path: runChasePath });
  console.log('Saved running chase action screenshot to', runChasePath);

  await browser.close();
  console.log('All captures complete!');
}

captureIntroPan().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
