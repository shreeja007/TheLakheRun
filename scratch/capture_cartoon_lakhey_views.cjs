const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Capturing comprehensive visual verification for Lakhey Modern Cartoon...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseDir = path.resolve(__dirname, '..');
  const scratchDir = path.join(baseDir, 'scratch');
  const artDir = path.join(baseDir, 'art-source');
  const brainDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\31692e84-71bb-497e-aca3-158d1de4b3f6';

  function saveImage(filename, buffer) {
    const scratchPath = path.join(scratchDir, filename);
    const artPath = path.join(artDir, filename);
    fs.writeFileSync(scratchPath, buffer);
    fs.writeFileSync(artPath, buffer);
    if (fs.existsSync(brainDir)) {
      fs.writeFileSync(path.join(brainDir, filename), buffer);
    }
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  // =========================================================================
  // 1. Lakhey Model Viewer Inspections (Port 4173)
  // =========================================================================
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:4173/viewer_lakhey.html');
  await page.waitForFunction(() => window.__LAKHEY_LOADED__ === true, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // A. Front Orthographic View
  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(600);
  const frontBuf = await page.screenshot();
  saveImage('lakhey_01_model_front.png', frontBuf);

  // B. Three-Quarter Hero Perspective View
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(600);
  const heroBuf = await page.screenshot();
  saveImage('lakhey_02_model_perspective.png', heroBuf);

  // C. Side Profile View
  await page.evaluate(() => window.setView('side'));
  await page.waitForTimeout(600);
  const sideBuf = await page.screenshot();
  saveImage('lakhey_03_model_side.png', sideBuf);

  // D. Chase Rear Camera View
  await page.evaluate(() => window.setView('chase_view'));
  await page.waitForTimeout(600);
  const rearBuf = await page.screenshot();
  saveImage('lakhey_04_model_rear.png', rearBuf);

  // E. Dynamic Run Stride Animation
  await page.evaluate(() => {
    window.setView('perspective');
    window.toggleAnimation();
  });
  await page.waitForTimeout(900); // mid stride
  const strideBuf = await page.screenshot();
  saveImage('lakhey_05_stride_animation.png', strideBuf);

  await page.close();

  // =========================================================================
  // 2. In-Game Street Chase Gameplay with Both Refined Characters
  // =========================================================================
  const gamePage = await browser.newPage({ viewport: { width: 480, height: 850 } });
  await gamePage.goto('http://localhost:4173/');
  await gamePage.waitForTimeout(2000);

  // Ready Standoff before run
  const standoffBuf = await gamePage.screenshot();
  saveImage('lakhey_06_ingame_standoff.png', standoffBuf);

  // Start run
  await gamePage.keyboard.press('Space');
  await gamePage.waitForTimeout(2500); // Mid-street chase
  const chaseBuf = await gamePage.screenshot();
  saveImage('lakhey_07_ingame_chase_stride.png', chaseBuf);

  await gamePage.close();
  await browser.close();
  console.log('All verification captures completed successfully!');
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
