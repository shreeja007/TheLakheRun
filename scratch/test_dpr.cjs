const { chromium } = require('playwright');

async function main() {
  console.log('Testing PlayCanvas maxPixelRatio...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  // Mobile page with DPR = 2.5
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2.5
  });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    const app = window.__pcApp;
    const canvas = document.getElementById('application-canvas');
    const initialWidth = canvas.width;
    const initialHeight = canvas.height;
    const devicePixelRatio = window.devicePixelRatio;

    // Set maxPixelRatio
    app.graphicsDevice.maxPixelRatio = Math.min(devicePixelRatio, 1.75);
    app.resizeCanvas();

    const updatedWidth = canvas.width;
    const updatedHeight = canvas.height;

    return {
      dpr: devicePixelRatio,
      initial: `${initialWidth}x${initialHeight}`,
      updated: `${updatedWidth}x${updatedHeight}`,
      maxPixelRatio: app.graphicsDevice.maxPixelRatio
    };
  });

  console.log('Result:', res);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
