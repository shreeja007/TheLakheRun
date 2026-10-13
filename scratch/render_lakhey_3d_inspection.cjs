const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const baseDir = path.resolve(__dirname, '..');
  const artDir = path.join(baseDir, 'art-source');
  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  // 1. Inspect Lakhey 3D Blockout in Model Viewer
  console.log('Inspecting Lakhey 3D Blockout...');
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:4173/viewer_lakhey.html');

  await page.waitForFunction(() => window.__LAKHEY_LOADED__ === true, { timeout: 15000 });
  await page.waitForTimeout(1000);

  const views = ['perspective', 'front', 'side', 'chase_view'];
  for (const v of views) {
    await page.evaluate((viewName) => {
      window.setView(viewName);
    }, v);
    await page.waitForTimeout(600);

    const artFile = path.join(artDir, `lakhey_blockout_3d_${v}.png`);
    const brainFile = path.join(brainDir, `lakhey_blockout_3d_${v}.png`);
    await page.screenshot({ path: artFile });
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(artFile, brainFile);
    }
    console.log(`Saved screenshot for ${v} -> ${artFile}`);
  }
  await page.close();

  // 2. Capture In-Game Chase Gameplay with 3D Lakhey pursuing Tuku
  console.log('Capturing in-game chase gameplay with 3D Lakhey...');
  const gamePage = await browser.newPage({ viewport: { width: 450, height: 800 } });
  await gamePage.goto('http://localhost:4173/');
  await gamePage.waitForTimeout(1500);

  // Press Space or trigger START to run
  await gamePage.keyboard.press('Space');
  await gamePage.waitForTimeout(2000); // Run for 2 seconds

  const inGameFile = path.join(artDir, 'lakhey_ingame_street_chase.png');
  const inGameBrain = path.join(brainDir, 'lakhey_ingame_street_chase.png');
  await gamePage.screenshot({ path: inGameFile });
  if (fs.existsSync(brainDir)) {
    fs.copyFileSync(inGameFile, inGameBrain);
  }
  console.log(`Saved in-game chase screenshot -> ${inGameFile}`);

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
