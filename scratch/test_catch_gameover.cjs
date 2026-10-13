const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCatch() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 450, height: 800 } });
  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // Start run
  await page.keyboard.press('Space');
  // Wait until collision occurs (obstacles are spawned in center lane at Z = -35)
  // At 10.5 m/s, player reaches Z = -35 in ~3.3s
  console.log('Running until collision and guardian catch...');
  await page.waitForTimeout(4500);

  const catchFile = path.join(brainDir, 'lakhey_3d_catch_gameover.png');
  await page.screenshot({ path: catchFile });
  console.log('Saved catch screenshot to', catchFile);

  await browser.close();
}

testCatch().catch(err => {
  console.error(err);
  process.exit(1);
});
