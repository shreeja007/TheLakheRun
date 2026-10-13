const { chromium } = require('playwright');

async function main() {
  console.log('Inspecting running PlayCanvas application...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  const pcInfo = await page.evaluate(() => {
    // Check if pc is on window or app on canvas
    const canvas = document.getElementById('application-canvas');
    return {
      hasWindowPc: typeof window.pc !== 'undefined',
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      clientWidth: canvas ? canvas.clientWidth : 0,
      clientHeight: canvas ? canvas.clientHeight : 0,
      devicePixelRatio: window.devicePixelRatio,
    };
  });

  console.log('Page PC info:', pcInfo);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
