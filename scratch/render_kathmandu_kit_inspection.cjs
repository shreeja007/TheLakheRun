const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderKitInspection() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const outDir = path.resolve(__dirname, '../art-source');
  const artifactDir = 'C:/Users/ShreejaManandhar/.gemini/antigravity-ide/brain/4cfad6fc-541f-4260-b9df-155d3435ecca';

  console.log('Navigating to viewer_kathmandu_kit.html...');
  await page.goto('http://localhost:4173/viewer_kathmandu_kit.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__KIT_LOADED__ === true, { timeout: 15000 });
  await page.waitForTimeout(600);

  // 1. Street View
  await page.evaluate(() => window.setView('street_view'));
  await page.waitForTimeout(400);
  const streetPath = path.join(outDir, 'kathmandu_kit_street_view.png');
  await page.screenshot({ path: streetPath });
  fs.copyFileSync(streetPath, path.join(artifactDir, 'kathmandu_kit_street_view.png'));
  console.log('Captured street view:', streetPath);

  // 2. Facades Overview
  await page.evaluate(() => window.setView('facades_overview'));
  await page.waitForTimeout(400);
  const facadePath = path.join(outDir, 'kathmandu_kit_facades_overview.png');
  await page.screenshot({ path: facadePath });
  fs.copyFileSync(facadePath, path.join(artifactDir, 'kathmandu_kit_facades_overview.png'));
  console.log('Captured facades overview:', facadePath);

  // 3. Hazards Closeup
  await page.evaluate(() => window.setView('hazards_close'));
  await page.waitForTimeout(400);
  const hazardPath = path.join(outDir, 'kathmandu_kit_hazards_close.png');
  await page.screenshot({ path: hazardPath });
  fs.copyFileSync(hazardPath, path.join(artifactDir, 'kathmandu_kit_hazards_close.png'));
  console.log('Captured hazards closeup:', hazardPath);

  await browser.close();
  console.log('All Kathmandu Kit captures completed.');
}

renderKitInspection().catch(err => {
  console.error('Error during Kathmandu kit render:', err);
  process.exit(1);
});
