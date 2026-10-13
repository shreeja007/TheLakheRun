const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { GLBBuilder } = require('./glb_builder.cjs');

async function checkUv() {
  const builder = new GLBBuilder();
  // Create a 2x2 colored image:
  // Top-left: RED, Top-right: GREEN
  // Bottom-left: BLUE, Bottom-right: WHITE
  // PNG: We can use a small canvas or buffer
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const pngBase64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 2; c.height = 2;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#FF0000'; ctx.fillRect(0, 0, 1, 1); // top-left
    ctx.fillStyle = '#00FF00'; ctx.fillRect(1, 0, 1, 1); // top-right
    ctx.fillStyle = '#0000FF'; ctx.fillRect(0, 1, 1, 1); // bottom-left
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1, 1, 1, 1); // bottom-right
    return c.toDataURL('image/png').split(',')[1];
  });
  const pngBuf = Buffer.from(pngBase64, 'base64');
  const texIdx = builder.addImage(pngBuf);
  const matIdx = builder.addMaterial('TestMat', { textureIndex: texIdx, unlit: true });

  const { mesh, index: meshIdx } = builder.createMesh('Quad');
  // Add quad facing +Z
  // V=0 at bottom or top? Let's check with standard positions:
  // (x, y): (-1, 1) top-left, (1, 1) top-right, (-1, -1) bot-left, (1, -1) bot-right
  const positions = [
    -1, -1, 0,   1, -1, 0,   1, 1, 0,  -1, 1, 0
  ];
  const normals = [ 0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1 ];
  // UVs: (0, 0), (1, 0), (1, 1), (0, 1)
  const uvs = [ 0, 1,   1, 1,   1, 0,   0, 0 ]; // (0, 1) bot-left, (0, 0) top-left in glTF
  const indices = [ 0, 1, 2,  0, 2, 3 ];
  mesh.addGeometry(matIdx, positions, normals, indices, {}, uvs);
  builder.addNode({ meshIndex: meshIdx });

  const glb = builder.build();
  fs.writeFileSync(path.resolve(__dirname, 'test_uv.glb'), glb);

  // Load in viewer
  await page.goto('http://localhost:4173/viewer_tuku.html');
  console.log('Done');
  await browser.close();
}

checkUv();
