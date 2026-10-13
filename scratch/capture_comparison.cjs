const { chromium } = require('playwright');
const path = require('path');

async function captureComparison() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 600, height: 800 }
  });

  console.log('Navigating to http://localhost:4173/viewer_tuku.html ...');
  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const artDir = path.resolve(__dirname, '..', 'art-source');

  // 1. Capture OUR MODEL (v0.5 Lofted)
  console.log('Capturing Our Model (v0.5)...');
  await page.evaluate(() => window.switchModel('ours'));
  await page.waitForTimeout(1000);

  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artDir, 'comparison_ours_front.png') });

  await page.evaluate(() => window.setView('back'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artDir, 'comparison_ours_back.png') });

  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artDir, 'comparison_ours_hero.png') });

  // Sprint Stride on Our Model
  await page.evaluate(() => window.toggleAnimation('run'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artDir, 'comparison_ours_sprint.png') });
  await page.evaluate(() => window.toggleAnimation('run')); // turn off
  await page.waitForTimeout(300);

  // 2. Capture DOWNLOADED PACK MODEL (v0.3)
  console.log('Capturing Downloaded Pack Model (v0.3)...');
  await page.evaluate(() => window.switchModel('downloaded'));
  await page.waitForTimeout(1200);

  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artDir, 'comparison_downloaded_front.png') });

  await page.evaluate(() => window.setView('back'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artDir, 'comparison_downloaded_back.png') });

  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artDir, 'comparison_downloaded_hero.png') });

  // Sprint Stride on Downloaded Model
  await page.evaluate(() => window.toggleAnimation('run'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artDir, 'comparison_downloaded_sprint.png') });
  await page.evaluate(() => window.toggleAnimation('run')); // turn off

  await browser.close();
  console.log('Comparison captures complete!');
}

captureComparison().catch(err => {
  console.error('Error capturing comparison:', err);
  process.exit(1);
});
