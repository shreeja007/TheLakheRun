const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const artifactDir = path.resolve('C:/Users/ACER/.gemini/antigravity-ide/brain/31692e84-71bb-497e-aca3-158d1de4b3f6');
  const scratchDir = path.resolve(__dirname);

  console.log('Navigating to http://localhost:4173/...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  // Wait 2.5s for initial assets and textures to stream in
  await page.waitForTimeout(2500);

  // Helper to snap screenshots to both scratch and artifacts
  async function snap(filename, label) {
    const sPath = path.join(scratchDir, filename);
    const aPath = path.join(artifactDir, filename);
    await page.screenshot({ path: sPath });
    fs.copyFileSync(sPath, aPath);
    console.log(`[Captured] ${label} -> ${filename}`);
  }

  // 1. Initial Ready / Start Screen showing Biome 1 Durbar Alley
  await snap('gameplay_01_durbar_ready.png', 'Durbar Alley Ready View');

  // Start the run by simulating keydown / click
  console.log('Starting run...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1200);

  // Capture Biome 1 Durbar Alley in active run
  await snap('gameplay_02_durbar_alley_run.png', 'Biome 1: Durbar Royal Alley');

  // Teleport / advance player distance using exposed __game handle to capture Biome 1 Gateway Arch
  console.log('Advancing to 135m (Gateway Arch)...');
  await page.evaluate(() => {
    const g = window.__game;
    if (g && g.setDebugDistance) {
      g.setDebugDistance(135);
    }
  });
  await page.waitForTimeout(1000);
  await snap('gameplay_03_gateway_arch.png', '140m Torana Milestone Gateway Arch');

  // Advance to Biome 2: River Causeway (~180m)
  console.log('Advancing to 180m (Biome 2: River Causeway)...');
  await page.evaluate(() => {
    const g = window.__game;
    if (g && g.setDebugDistance) {
      g.setDebugDistance(180);
    }
  });
  await page.waitForTimeout(1000);
  await snap('gameplay_04_river_causeway.png', 'Biome 2: Sacred River Causeway');

  // Advance to Biome 3: Temple Hill (~320m)
  console.log('Advancing to 320m (Biome 3: Temple Hill)...');
  await page.evaluate(() => {
    const g = window.__game;
    if (g && g.setDebugDistance) {
      g.setDebugDistance(320);
    }
  });
  await page.waitForTimeout(1000);
  await snap('gameplay_05_temple_hill.png', 'Biome 3: Himalayan Temple Hill');

  // Mobile portrait perspective (502x751)
  console.log('Testing Mobile Portrait Viewport...');
  await page.setViewportSize({ width: 502, height: 751 });
  await page.evaluate(() => {
    const g = window.__game;
    if (g && g.player) {
      const pEnt = g.player['entity'];
      if (pEnt) pEnt.setPosition(0, 0, -20);
      if (g.road) g.road.update(-20, 0.016);
    }
  });
  await page.waitForTimeout(1000);
  await snap('gameplay_06_mobile_portrait.png', 'Mobile Portrait Readability View');

  await browser.close();
  console.log('All biome verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
