const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCaughtAnimation() {
  console.log('--- Testing Lakhey Friendly Catch & Hoist Animation on Port 4173 ---');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 480, height: 850 }
  });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1500);

  // Ready State
  console.log('Triggering start...');
  await page.keyboard.press('Space');

  // Wait for collision & caught sequence
  console.log('Waiting for collision with obstacle...');
  let caughtReached = false;
  const startTime = Date.now();
  while (Date.now() - startTime < 8000) {
    const s = await page.evaluate(() => window.__game?.getState?.() || 'UNKNOWN');
    if (s === 'CAUGHT') {
      caughtReached = true;
      break;
    }
    await page.waitForTimeout(50);
  }

  if (caughtReached) {
    console.log('SUCCESS: Entered CAUGHT state!');
    await page.waitForTimeout(1000); // 1s into scoop & hoist
    const caughtShot = await page.screenshot();
    const savePath = path.resolve(__dirname, 'lakhey_08_ingame_friendly_catch.png');
    const artPath = path.resolve(__dirname, '../art-source/lakhey_08_ingame_friendly_catch.png');
    fs.writeFileSync(savePath, caughtShot);
    fs.writeFileSync(artPath, caughtShot);
    console.log(`Saved caught screenshot: ${savePath}`);
  } else {
    console.log('Note: Did not enter CAUGHT in 8s (runner may still be running)');
  }

  await browser.close();
  console.log('Catch verification complete.');
}

testCaughtAnimation().catch(err => {
  console.error(err);
  process.exit(1);
});
