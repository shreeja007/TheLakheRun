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
  await page.waitForTimeout(1500);

  // Trigger slide
  await page.evaluate(() => {
    window.setView('side');
    window.toggleAnimation('slide');
  });
  await page.waitForTimeout(300); // mid-slide

  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_side_current.png') });
  console.log('Saved audit_tuku_slide_side_current.png');

  // Also capture from back view (gameplay camera)
  await page.evaluate(() => {
    window.setView('back');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, 'audit_tuku_slide_back_current.png') });
  console.log('Saved audit_tuku_slide_back_current.png');

  await browser.close();
}

main().catch(console.error);
