const { chromium } = require('playwright');
const path = require('path');

async function captureCartoonViews() {
  console.log('Capturing Modern Cartoon Tuku Inspector views...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1100 }
  });

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Front View
  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(500);
  const frontPath = path.resolve(__dirname, '../art-source/tuku_cartoon_01_front.png');
  await page.screenshot({ path: frontPath });
  console.log('Saved front view to', frontPath);

  // 2. Back Gameplay View
  await page.evaluate(() => window.setView('back'));
  await page.waitForTimeout(500);
  const backPath = path.resolve(__dirname, '../art-source/tuku_cartoon_02_back.png');
  await page.screenshot({ path: backPath });
  console.log('Saved back view to', backPath);

  // 3. 3/4 Hero Perspective
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(500);
  const heroPath = path.resolve(__dirname, '../art-source/tuku_cartoon_03_hero.png');
  await page.screenshot({ path: heroPath });
  console.log('Saved 3/4 hero view to', heroPath);

  // 4. Right Side Profile
  await page.evaluate(() => window.setView('side'));
  await page.waitForTimeout(500);
  const sidePath = path.resolve(__dirname, '../art-source/tuku_cartoon_04_side.png');
  await page.screenshot({ path: sidePath });
  console.log('Saved side view to', sidePath);

  // 5. Sprint Animation
  await page.evaluate(() => {
    window.setView('perspective');
    if (!window.isRunningAnim) window.toggleAnimation('run');
  });
  await page.waitForTimeout(1200);
  const sprintPath = path.resolve(__dirname, '../art-source/tuku_cartoon_05_sprint.png');
  await page.screenshot({ path: sprintPath });
  console.log('Saved sprint view to', sprintPath);

  await browser.close();
  console.log('All views captured successfully!');
}

captureCartoonViews().catch(err => {
  console.error(err);
  process.exit(1);
});
