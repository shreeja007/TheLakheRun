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

  console.log('1. Loading viewer_tuku.html...');
  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Test Viewer Side View Slide
  await page.evaluate(() => {
    window.setView('side');
    window.testSlide();
  });
  await page.waitForTimeout(300); // 300ms is peak slide
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_side_fixed.png') });
  console.log('Saved audit_tuku_slide_side_fixed.png');

  // Test Viewer 3/4 Perspective View Slide
  await page.evaluate(() => {
    window.setView('perspective');
    window.testSlide();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_persp_fixed.png') });
  console.log('Saved audit_tuku_slide_persp_fixed.png');

  // Test Viewer Rear Gameplay View Slide
  await page.evaluate(() => {
    window.setView('back');
    window.testSlide();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_back_fixed.png') });
  console.log('Saved audit_tuku_slide_back_fixed.png');

  // Now capture In-Game Slide in Kathmandu Alleyway
  console.log('2. Loading game at index.html...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Click start / tap to start
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500); // Wait for intro pan & chase takeoff into active run

  // Trigger in-game slide via ArrowDown
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(220); // Mid-slide
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_ingame.png') });
  console.log('Saved audit_tuku_slide_ingame.png');

  await browser.close();
}

main().catch(console.error);
