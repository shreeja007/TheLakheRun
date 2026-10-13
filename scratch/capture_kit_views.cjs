const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Capturing visual verification for Modern Cartoon Kathmandu Kit...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:4173/viewer_kathmandu_kit.html');
  await page.waitForFunction(() => window.__KIT_LOADED__ === true, { timeout: 15000 });
  await page.waitForTimeout(1000);

  const baseDir = path.resolve(__dirname, '..');
  const scratchDir = path.join(baseDir, 'scratch');
  const artDir = path.join(baseDir, 'art-source');
  const brainDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\31692e84-71bb-497e-aca3-158d1de4b3f6';

  async function snap(filename, viewPreset) {
    if (viewPreset) {
      await page.evaluate((vp) => window.setView(vp), viewPreset);
      await page.waitForTimeout(600);
    }
    const buf = await page.screenshot();
    fs.writeFileSync(path.join(scratchDir, filename), buf);
    fs.writeFileSync(path.join(artDir, filename), buf);
    if (fs.existsSync(brainDir)) {
      fs.writeFileSync(path.join(brainDir, filename), buf);
    }
    console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
  }

  await snap('kathmandu_kit_01_street_view.png', 'street_view');
  await snap('kathmandu_kit_02_facades_overview.png', 'facades_overview');
  await snap('kathmandu_kit_03_hazards_close.png', 'hazards_close');

  await page.close();
  await browser.close();
  console.log('All Kathmandu Kit captures completed successfully!');
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
