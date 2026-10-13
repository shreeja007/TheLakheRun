const fs = require('fs');
const path = require('path');
const { GLBBuilder } = require('./glb_builder.cjs');
const { chromium } = require('playwright');

async function testFace() {
  const builder = new GLBBuilder();
  const atlasBuf = fs.readFileSync(path.resolve(__dirname, '../art-source/tuku_cartoon_atlas.png'));
  const texIdx = builder.addImage(atlasBuf);

  const matCartoon = builder.addMaterial('Mat_Cartoon', {
    baseColor: [1, 1, 1, 1],
    roughness: 0.5,
    metallic: 0.0,
    textureIndex: texIdx
  });

  const matInk = builder.addMaterial('Mat_Ink', {
    baseColor: [0.08, 0.09, 0.12, 1],
    roughness: 0.9,
    doubleSided: false
  });

  const { mesh, index: meshIdx } = builder.createMesh('FaceTest');

  // Let's create the front facial mask:
  // Slices from chin (Y=0.08) to forehead (Y=0.28)
  const slices = [
    { y: 0.08, rx: 0.040, rz: 0.040, cz: -0.028 }, // chin
    { y: 0.12, rx: 0.065, rz: 0.060, cz: -0.016 }, // jaw
    { y: 0.15, rx: 0.076, rz: 0.075, cz: -0.008 }, // mouth
    { y: 0.18, rx: 0.082, rz: 0.080, cz: -0.004 }, // nose
    { y: 0.21, rx: 0.084, rz: 0.082, cz:  0.000 }, // eyes
    { y: 0.25, rx: 0.082, rz: 0.080, cz:  0.004 }, // brows
    { y: 0.28, rx: 0.076, rz: 0.074, cz:  0.008 }  // forehead
  ];

  const segments = 16;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Generate front face hemisphere (angle theta from 0 to PI: from wearer left cheek across nose to right cheek)
  // In 3D: X goes from -rx to +rx, Z is front (-rz to 0)
  for (let s = 0; s < slices.length; s++) {
    const sl = slices[s];
    const y = sl.y;
    const rx = sl.rx;
    const rz = sl.rz;
    const cz = sl.cz || 0;

    for (let i = 0; i <= segments; i++) {
      // theta from -PI/2 (wearer right -X) to +PI/2 (wearer left +X)
      // When theta = 0: x = 0, z is maximum front (-rz + cz)
      const theta = ((i / segments) - 0.5) * Math.PI * 0.92;
      const x = Math.sin(theta) * rx;
      const z = cz - Math.cos(theta) * rz;

      positions.push(x, y, z);

      // Normal
      const nx = Math.sin(theta);
      const ny = 0.05;
      const nz = -Math.cos(theta);
      normals.push(nx, ny, nz);

      // UV mapping
      // x is in meters: x=0 is center (nose, mouth, between eyes)
      // Atlas center is U = 0.250
      const u = 0.250 + x * 2.58;
      // y is in meters: eye center is Y=0.20, atlas V = 0.205
      const v = 0.205 - (y - 0.205) * 1.86;
      uvs.push(u, v);
    }
  }

  // Connect with quads
  // Front-facing winding order (looking from camera down -Z towards +Z):
  // (x increases to right, y increases up)
  // Triangle 1: (s, i) -> (s, i+1) -> (s+1, i)
  // Triangle 2: (s, i+1) -> (s+1, i+1) -> (s+1, i)
  for (let s = 0; s < slices.length - 1; s++) {
    for (let i = 0; i < segments; i++) {
      const v0 = s * (segments + 1) + i;
      const v1 = s * (segments + 1) + (i + 1);
      const v2 = (s + 1) * (segments + 1) + i;
      const v3 = (s + 1) * (segments + 1) + (i + 1);

      indices.push(v0, v2, v1);
      indices.push(v1, v2, v3);
    }
  }

  mesh.addGeometry(matCartoon, positions, normals, indices, {}, uvs);

  // No inverted hull on open face sheet


  builder.addNode({ meshIndex: meshIdx });

  const glbBuf = builder.build();
  fs.writeFileSync(path.resolve(__dirname, 'test_face.glb'), glbBuf);
  console.log('Generated test_face.glb:', glbBuf.length, 'bytes');

  // Verify in Playwright by rendering
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>body { margin:0; background: #0A0F1D; }</style></head>
    <body>
      <canvas id="c" width="600" height="600"></canvas>
      <script src="https://code.playcanvas.com/playcanvas-stable.min.js"></script>
      <script>
        const canvas = document.getElementById('c');
        const app = new pc.Application(canvas);
        app.start();

        const camera = new pc.Entity('Cam');
        camera.addComponent('camera', { clearColor: new pc.Color(0.08, 0.11, 0.18) });
        camera.setPosition(0, 0.18, -0.65);
        camera.lookAt(new pc.Vec3(0, 0.18, 0));
        app.root.addChild(camera);

        const light = new pc.Entity('Light');
        light.addComponent('light', { type: 'directional', color: new pc.Color(1, 1, 1), intensity: 1.2 });
        light.setEulerAngles(15, 0, 0);
        app.root.addChild(light);
        app.scene.ambientLight = new pc.Color(0.4, 0.4, 0.45);

        const glbBase64 = "${glbBuf.toString('base64')}";
        const bytes = Uint8Array.from(atob(glbBase64), c => c.charCodeAt(0));
        const blobUrl = URL.createObjectURL(new Blob([bytes.buffer], { type: 'model/gltf-binary' }));

        app.assets.loadFromUrl(blobUrl, 'container', (err, asset) => {
          if (!err) {
            const ent = asset.resource.instantiateRenderEntity();
            app.root.addChild(ent);
            window.__LOADED__ = true;
          }
        });
      </script>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.__LOADED__ === true, { timeout: 8000 });
  await page.waitForTimeout(500);

  const shotPath = path.resolve(__dirname, 'test_face_preview.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved face preview to:', shotPath);

  await browser.close();
}

testFace().catch(console.error);
