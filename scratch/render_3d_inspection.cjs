const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function render3DInspection() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const outDir = path.resolve(__dirname, '../art-source');
  const artifactDir = 'C:/Users/ShreejaManandhar/.gemini/antigravity-ide/brain/4cfad6fc-541f-4260-b9df-155d3435ecca';

  console.log('Navigating to viewer_tuku.html...');
  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MODEL_LOADED__ === true, { timeout: 10000 });
  await page.waitForTimeout(500);

  // 1. Perspective Hero View
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(400);
  const pPath = path.join(outDir, 'tuku_blockout_3d_perspective.png');
  await page.screenshot({ path: pPath });
  fs.copyFileSync(pPath, path.join(artifactDir, 'tuku_blockout_3d_perspective.png'));
  console.log('Captured 3D perspective hero view:', pPath);

  // 2. Back Gameplay View (Primary)
  await page.evaluate(() => window.setView('back'));
  await page.waitForTimeout(400);
  const bPath = path.join(outDir, 'tuku_blockout_3d_back.png');
  await page.screenshot({ path: bPath });
  fs.copyFileSync(bPath, path.join(artifactDir, 'tuku_blockout_3d_back.png'));
  console.log('Captured 3D rear gameplay view:', bPath);

  // 3. Front Orthographic View
  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(400);
  const fPath = path.join(outDir, 'tuku_blockout_3d_front.png');
  await page.screenshot({ path: fPath });
  fs.copyFileSync(fPath, path.join(artifactDir, 'tuku_blockout_3d_front.png'));
  console.log('Captured 3D front orthographic view:', fPath);

  // 4. Side Profile (Satchel clearance)
  await page.evaluate(() => window.setView('side'));
  await page.waitForTimeout(400);
  const sPath = path.join(outDir, 'tuku_blockout_3d_side.png');
  await page.screenshot({ path: sPath });
  fs.copyFileSync(sPath, path.join(artifactDir, 'tuku_blockout_3d_side.png'));
  console.log('Captured 3D side profile view:', sPath);

  // 5. In-Game Gameplay Test: Mobile Portrait (502x751)
  console.log('Navigating to in-game runner for mobile portrait test...');
  await page.setViewportSize({ width: 502, height: 751 });
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000); // Wait for scene & model to load

  const inGameMobilePath = path.join(outDir, 'tuku_ingame_mobile_portrait.png');
  await page.screenshot({ path: inGameMobilePath });
  fs.copyFileSync(inGameMobilePath, path.join(artifactDir, 'tuku_ingame_mobile_portrait.png'));
  console.log('Captured in-game mobile portrait view:', inGameMobilePath);

  // 6. In-Game Gameplay Test: Running state
  console.log('Starting run to capture in-game running with 3D model...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1200);

  const inGameRunningPath = path.join(outDir, 'tuku_ingame_running_state.png');
  await page.screenshot({ path: inGameRunningPath });
  fs.copyFileSync(inGameRunningPath, path.join(artifactDir, 'tuku_ingame_running_state.png'));
  console.log('Captured in-game running state:', inGameRunningPath);

  await browser.close();
  console.log('All 3D inspection captures completed.');
}

render3DInspection().catch(err => {
  console.error('Error during 3D inspection render:', err);
  process.exit(1);
});
