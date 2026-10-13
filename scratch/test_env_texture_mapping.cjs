const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Testing PlayCanvas environment texture mapping...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto('http://localhost:4173/viewer_kathmandu_kit.html');
  await page.waitForFunction(() => window.__KIT_LOADED__ === true, { timeout: 15000 });

  // Test applying texture to a test plane in page context
  const testResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      pc.app.assets.loadFromUrl('/models/kathmandu_env_atlas.png', 'texture', (err, asset) => {
        if (err || !asset) return resolve({ success: false, error: err });
        const tex = asset.resource;

        // Create test plane
        const testPlane = new pc.Entity('TestPlane');
        testPlane.addComponent('render', { type: 'plane' });
        testPlane.setLocalScale(4, 1, 4);
        testPlane.setLocalPosition(0, 1.5, -5);
        testPlane.setLocalEulerAngles(90, 0, 0);

        const mat = new pc.StandardMaterial();
        mat.diffuseMap = tex;
        mat.diffuseMapTiling = new pc.Vec2(0.25, 0.25);
        // Row 0 Col 0: Dachi Appa Brick
        mat.diffuseMapOffset = new pc.Vec2(0.0, 0.75);
        mat.update();

        testPlane.render.material = mat;
        pc.app.root.addChild(testPlane);

        resolve({ success: true, width: tex.width, height: tex.height });
      });
    });
  });

  console.log('Texture load test result:', testResult);
  await page.waitForTimeout(500);

  const buf = await page.screenshot();
  fs.writeFileSync('scratch/test_env_mapping_preview.png', buf);
  console.log('Saved test preview: scratch/test_env_mapping_preview.png');

  await page.close();
  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
