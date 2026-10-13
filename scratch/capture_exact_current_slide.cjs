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

  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Freeze in slide pose by setting slideTime = 0.32 in viewer
  await page.evaluate(() => {
    // Stop running
    if (window.toggleAnimation && document.getElementById('btn-anim').className === 'active') {
      window.toggleAnimation();
    }
    // Set to slide pose
    window.setView('side');
    window.testSlide();
  });
  
  // Wait 300ms for slide to be at peak
  await page.waitForTimeout(300);

  // Capture side
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_side_actual.png') });
  console.log('Saved audit_tuku_slide_side_actual.png');

  // Capture back view
  await page.evaluate(() => {
    window.setView('back');
  });
  await page.waitForTimeout(50);
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_back_actual.png') });
  console.log('Saved audit_tuku_slide_back_actual.png');

  // Capture perspective view
  await page.evaluate(() => {
    window.setView('perspective');
  });
  await page.waitForTimeout(50);
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_persp_actual.png') });
  console.log('Saved audit_tuku_slide_persp_actual.png');

  await browser.close();
}

main().catch(console.error);
