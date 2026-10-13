const { chromium } = require('playwright');

async function main() {
  console.log('--- Testing Game Over Modal Labels for Phase 3 Hazards ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 440, height: 860 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(600);

  const results = await page.evaluate(async () => {
    const gm = window.__game;
    const testCases = ['GHAT_STEPS', 'BRIDGE_ROPE', 'PRAYER_FLAG_GALE'];
    const output = {};

    for (const type of testCases) {
      gm['onGameOverCb']({
        finalDistance: 154.2,
        bestDistance: 210.0,
        coins: 12,
        isNewRecord: false,
        obstacleType: type,
        lane: 0,
      });

      await new Promise((r) => setTimeout(r, 550));
      const causeEl = document.getElementById('gameover-cause');
      output[type] = causeEl ? causeEl.textContent : '';
    }

    return output;
  });

  console.log('Game Over Cause Results:', results);

  const passed =
    results.GHAT_STEPS.includes('Ghat Wooden Steps') &&
    results.BRIDGE_ROPE.includes('Suspension Bridge Cable') &&
    results.PRAYER_FLAG_GALE.includes('Himalayan Prayer Flag Gale');

  if (passed) {
    console.log('PASS: All 3 Phase 3 obstacle labels correctly formatted in GameOver modal!');
  } else {
    console.error('FAIL: Unexpected labels:', results);
  }

  await browser.close();
}

main().catch(console.error);
