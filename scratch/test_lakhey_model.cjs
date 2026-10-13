const { chromium } = require('playwright');
const path = require('path');

async function testLakhey() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 600, height: 800 }
  });

  console.log('Navigating to http://localhost:4173/viewer_lakhey.html ...');
  await page.goto('http://localhost:4173/viewer_lakhey.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Front View
  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(500);
  const frontPath = path.resolve(__dirname, 'lakhey_01_front.png');
  await page.screenshot({ path: frontPath });
  console.log('Saved front screenshot to', frontPath);

  // 2. Perspective View
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(500);
  const perspPath = path.resolve(__dirname, 'lakhey_02_perspective.png');
  await page.screenshot({ path: perspPath });
  console.log('Saved perspective screenshot to', perspPath);

  // 3. Side View
  await page.evaluate(() => window.setView('side'));
  await page.waitForTimeout(500);
  const sidePath = path.resolve(__dirname, 'lakhey_03_side.png');
  await page.screenshot({ path: sidePath });
  console.log('Saved side screenshot to', sidePath);

  // 4. Chase View (Rear Hero View)
  await page.evaluate(() => window.setView('chase_view'));
  await page.waitForTimeout(500);
  const rearPath = path.resolve(__dirname, 'lakhey_04_rear.png');
  await page.screenshot({ path: rearPath });
  console.log('Saved rear screenshot to', rearPath);

  // Print hierarchy from page
  const hierarchy = await page.evaluate(() => {
    function dumpNode(entity, depth = 0) {
      let res = ' '.repeat(depth * 2) + entity.name + ' (pos: ' + 
        entity.getPosition().x.toFixed(2) + ', ' + 
        entity.getPosition().y.toFixed(2) + ', ' + 
        entity.getPosition().z.toFixed(2) + ')\n';
      for (const child of entity.children) {
        res += dumpNode(child, depth + 1);
      }
      return res;
    }
    const lakhey = pc.app.root.findByName('Lakhey_v01_Root') || pc.app.root.findByName('TorsoRoot') || pc.app.root.children.find(c => c.name.includes('Root') || c.name.includes('lakhey'));
    return lakhey ? dumpNode(lakhey) : 'Lakhey root not found';
  });
  console.log('PlayCanvas Scene Hierarchy:\n' + hierarchy);

  await browser.close();
}

testLakhey().catch(err => {
  console.error('Error running testLakhey:', err);
  process.exit(1);
});
