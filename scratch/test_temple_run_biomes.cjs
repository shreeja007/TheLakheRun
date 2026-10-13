const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testBiomes() {
  console.log('--- TESTING TEMPLE RUN BIOMES & OPEN CAUSEWAY ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[PAGE ERROR]`, err));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const outDir = path.resolve(__dirname, 'biome_screens');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Initial State: Durbar Alley (Ready / Start)
  console.log('Capturing Biome 1: Durbar Royal Alley (Initial)...');
  await page.screenshot({ path: path.join(outDir, '01_durbar_royal_alley.png') });

  // Start the run
  await page.click('#ready-banner');
  await page.waitForTimeout(500);

  // Check state and telemetry
  const state = await page.evaluate(() => window.__game?.getState());
  console.log(`Game state after start: ${state}`);

  // Telemetry check
  let tel = await page.evaluate(() => {
    const g = window.__game;
    return {
      biome: g?.getCurrentBiome(),
      z: g?.player?.getZ(),
      fps: document.getElementById('fps-val')?.textContent,
      diagBiome: document.getElementById('diag-biome-val')?.textContent,
    };
  });
  console.log('Biome 1 Telemetry:', tel);

  // Run forward through Biome 1 (Durbar Alley) up to 132m approaching Gateway Arch
  console.log('Advancing run to 132m near Milestone Gateway Arch...');
  await page.evaluate(() => {
    const g = window.__game;
    g.player.totalDistance = 132;
    g.player.currentZ = -132;
    g.player.entity.setPosition(0, 0.5, -132);
    g.road.update(-132);
    g.update(0.016);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, '02_durbar_gateway_arch.png') });

  // Advance across 140m milestone into Biome 2: Sacred River Causeway (165m)
  console.log('Advancing into Biome 2: Sacred River Causeway (165m)...');
  await page.evaluate(() => {
    const g = window.__game;
    g.player.totalDistance = 165;
    g.player.currentZ = -165;
    g.player.entity.setPosition(0, 0.5, -165);
    g.road.update(-165);
    g.update(0.016);
  });
  await page.waitForTimeout(500);

  tel = await page.evaluate(() => {
    const g = window.__game;
    const toast = document.getElementById('biome-toast');
    const toastTitle = document.getElementById('biome-toast-title')?.textContent;
    const toastTagline = document.getElementById('biome-toast-tagline')?.textContent;
    const isToastVisible = !toast?.classList.contains('hidden');
    return {
      biome: g?.getCurrentBiome(),
      toastVisible: isToastVisible,
      toastTitle,
      toastTagline,
      diagBiome: document.getElementById('diag-biome-val')?.textContent,
    };
  });
  console.log('Biome 2 Telemetry & Toast:', tel);
  await page.screenshot({ path: path.join(outDir, '03_sacred_river_causeway.png') });

  // Advance into Biome 3: Himalayan Temple Hill Pass (310m)
  console.log('Advancing into Biome 3: Himalayan Temple Hill Pass (310m)...');
  await page.evaluate(() => {
    const g = window.__game;
    g.player.totalDistance = 310;
    g.player.currentZ = -310;
    g.player.entity.setPosition(0, 0.5, -310);
    g.road.update(-310);
    g.update(0.016);
  });
  await page.waitForTimeout(500);

  tel = await page.evaluate(() => {
    const g = window.__game;
    const toastTitle = document.getElementById('biome-toast-title')?.textContent;
    const toastTagline = document.getElementById('biome-toast-tagline')?.textContent;
    return {
      biome: g?.getCurrentBiome(),
      toastTitle,
      toastTagline,
      diagBiome: document.getElementById('diag-biome-val')?.textContent,
    };
  });
  console.log('Biome 3 Telemetry & Toast:', tel);
  await page.screenshot({ path: path.join(outDir, '04_himalayan_temple_hill.png') });

  // Mobile Viewport Check (390x844 iPhone 14 Pro)
  console.log('Testing Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, '05_mobile_river_causeway.png') });

  await browser.close();
  console.log('--- ALL BIOME SCREENSHOTS & TESTS COMPLETED SUCCESSFULLY ---');
}

testBiomes().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
