const { chromium } = require('playwright');
const path = require('path');

async function testCatchAndRetry() {
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
  await page.click('#ready-banner');

  // Wait for run and collision (hit an obstacle)
  // Let the player run straight into the first obstacle
  console.log('Waiting for obstacle hit and game over...');
  await page.waitForSelector('#gameover-modal:not(.hidden)', { timeout: 15000 });
  console.log('Game over modal appeared!');

  const catchPath = path.resolve(__dirname, 'intro_05_game_over_catch.png');
  await page.screenshot({ path: catchPath });
  console.log('Saved game over catch screenshot to', catchPath);

  // Now click retry button
  console.log('Clicking retry button...');
  await page.click('#btn-modal-retry');

  // Immediately capture mid-retry swoop
  await page.waitForTimeout(500);
  const retrySwoopPath = path.resolve(__dirname, 'intro_06_retry_swoop.png');
  await page.screenshot({ path: retrySwoopPath });
  console.log('Saved retry swoop screenshot to', retrySwoopPath);

  await page.waitForTimeout(1500);
  const retrySettledPath = path.resolve(__dirname, 'intro_07_retry_settled.png');
  await page.screenshot({ path: retrySettledPath });
  console.log('Saved retry settled screenshot to', retrySettledPath);

  await browser.close();
  console.log('Catch and retry verification complete!');
}

testCatchAndRetry().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
