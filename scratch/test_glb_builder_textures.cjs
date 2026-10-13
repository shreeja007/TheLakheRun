const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');
const { chromium } = require('playwright');

async function testTextureAndOutline() {
  console.log('Testing GLB Builder with embedded PNG and inverted hull...');

  const builder = new GLBBuilder();

  // 1. Read texture atlas
  const atlasBuf = fs.readFileSync(path.resolve(__dirname, '../art-source/tuku_cartoon_atlas.png'));
  const texIdx = builder.addImage(atlasBuf, 'image/png');

  // 2. Add textured material
  const matTextured = builder.addMaterial('Mat_CartoonAtlas', {
    baseColor: [1, 1, 1, 1],
    roughness: 0.5,
    metallic: 0.0,
    textureIndex: texIdx
  });

  // 3. Add outline material (dark ink)
  const matInk = builder.addMaterial('Mat_InkOutline', {
    baseColor: [0.08, 0.09, 0.11, 1.0],
    roughness: 0.9,
    metallic: 0.0,
    doubleSided: false
  });

  // 4. Create mesh with textured face and outline
  const { mesh, index: meshIdx } = builder.createMesh('TestMesh');
  mesh.addBox({
    size: [1, 1, 1],
    materialIndex: matTextured,
    uvBounds: [0, 0, 0.5, 0.5], // Top-left quadrant (Face!)
    outlineMaterialIndex: matInk,
    outlineThickness: 0.02
  });

  builder.addNode({
    name: 'RootNode',
    meshIndex: meshIdx
  });

  const glbBuffer = builder.build();
  const testGlbPath = path.resolve(__dirname, 'test_textured.glb');
  fs.writeFileSync(testGlbPath, glbBuffer);
  console.log(`Wrote test GLB to ${testGlbPath} (${glbBuffer.length} bytes).`);

  // Now verify with PlayCanvas in headless Edge
  console.log('Verifying load in PlayCanvas via Playwright...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();

  // Test loading GLB inside PlayCanvas
  const pageContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <script src="https://code.playcanvas.com/playcanvas-stable.min.js"></script>
      <script>
        window.loadStatus = 'pending';
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const app = new pc.Application(canvas);
        app.start();

        const glbBase64 = "${glbBuffer.toString('base64')}";
        const binaryString = atob(glbBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes.buffer], { type: 'model/gltf-binary' });
        const blobUrl = URL.createObjectURL(blob);

        app.assets.loadFromUrl(blobUrl, 'container', (err, asset) => {
          if (err) {
            window.loadStatus = 'error: ' + err;
          } else {
            const entity = asset.resource.instantiateRenderEntity();
            app.root.addChild(entity);
            window.loadStatus = 'success';
          }
        });
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageContent);
  await page.waitForFunction(() => window.loadStatus !== 'pending', { timeout: 10000 });
  const status = await page.evaluate(() => window.loadStatus);
  console.log('PlayCanvas Load Status:', status);

  await browser.close();

  if (status !== 'success') {
    throw new Error('PlayCanvas failed to load generated GLB: ' + status);
  }
  console.log('Verification successful!');
}

testTextureAndOutline().catch(err => {
  console.error(err);
  process.exit(1);
});
