// T025 isolated import check. Uses repository PlayCanvas/Playwright, no game edits.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
assert.ok(process.argv[2], 'Supply asset directory');
const out = resolve(process.argv[2]);
const metrics = JSON.parse(readFileSync(join(out, 'asset_metrics.json')));
const model = readFileSync(join(out, metrics.asset_id + '.glb'));
const engine = readFileSync(new URL('../../node_modules/playcanvas/build/playcanvas.js', import.meta.url));
const server = createServer((req, res) => {
  if (req.url === '/model.glb') { res.setHeader('Content-Type', 'model/gltf-binary'); res.end(model); }
  else if (req.url === '/engine.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(engine); }
  else if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><title>T025 isolated building import</title><style>body{margin:0}canvas{width:100vw;height:100vh;display:block}</style><canvas></canvas><script src="/engine.js"></script>');
  } else { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser, channel;
try {
  for (const candidate of ['chrome', 'msedge', undefined]) {
    try {
      browser = await chromium.launch({ channel: candidate, headless: true,
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
      channel = candidate || 'bundled Chromium'; break;
    } catch (error) { if (!candidate) throw error; }
  }
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:' + server.address().port);
  const imported = await page.evaluate(async () => {
    const app = new pc.Application(document.querySelector('canvas'), { graphicsDeviceOptions: { antialias: true, preserveDrawingBuffer: true } });
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.scene.ambientLight = new pc.Color(.65, .65, .65);
    const camera = new pc.Entity('CheckCamera');
    camera.addComponent('camera', { clearColor: new pc.Color(.73, .75, .78), farClip: 100, fov: 42 });
    camera.setPosition(11, 8, 15); camera.lookAt(0, 3.5, 0);
    app.root.addChild(camera);
    const light = new pc.Entity('CheckLight');
    light.addComponent('light', { type: 'directional', intensity: 1.5 });
    light.setEulerAngles(45, 140, 0); app.root.addChild(light);
    const asset = await new Promise((resolve, reject) => app.assets.loadFromUrl('/model.glb', 'container', (err, asset) => err ? reject(err) : resolve(asset)));
    const entity = asset.resource.instantiateRenderEntity();
    app.root.addChild(entity);
    const root = entity.findByName('Building01Root');
    if (!root) throw new Error('Missing building root');
    const windows = {};
    for (const [side, count] of Object.entries({ Front: 5, Back: 4, Left: 2, Right: 2 })) {
      windows[side] = [];
      for (let i = 1; i <= count; i++) {
        const node = entity.findByName('Window_' + side + '_' + String(i).padStart(2, '0'));
        if (!node || node.parent.name !== 'WindowsRoot') throw new Error('Missing window ' + side + i);
        windows[side].push(node.name);
      }
    }
    for (const name of ['Wall_Front', 'Wall_Back', 'Wall_Left', 'Wall_Right', 'Tiled_Roof_And_Ridge', 'Closed_Double_Door']) {
      if (!entity.findByName(name)) throw new Error('Missing component ' + name);
    }
    const meshes = entity.findComponents('render').flatMap(r => r.meshInstances);
    const bounds = meshes[0].aabb.clone();
    for (const mesh of meshes.slice(1)) bounds.add(mesh.aabb);
    const min = bounds.getMin(), max = bounds.getMax();
    window.buildingCheck = { app, camera, entity, min, max };
    app.start();
    await new Promise(resolve => app.once('postrender', resolve));
    const corners = [];
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const p = camera.camera.worldToScreen(new pc.Vec3(x, y, z));
      corners.push([p.x, p.y, p.z]);
    }
    return { version: pc.version, backend: app.graphicsDevice.deviceType,
      materials: [...new Set(meshes.map(m => m.material.name))], primitives: meshes.length,
      textures: asset.resource.textures?.length || 0, animations: asset.resource.animations?.length || 0,
      min: [min.x, min.y, min.z], max: [max.x, max.y, max.z],
      rootPosition: [root.getPosition().x, root.getPosition().y, root.getPosition().z],
      windows, corners };
  });
  assert.equal(imported.animations, 0);
  assert.equal(imported.textures, 2);
  assert.equal(imported.materials.length, metrics.materials.length);
  assert.deepEqual(imported.rootPosition, [0, 0, 0]);
  for (const [side, count] of Object.entries(metrics.window_counts)) assert.equal(imported.windows[side].length, count);
  imported.min.concat(imported.max).forEach((v, i) => assert.ok(Math.abs(v - metrics.bounds_gltf_min.concat(metrics.bounds_gltf_max)[i]) < .0001));
  for (const p of imported.corners) assert.ok(p[0] > 0 && p[0] < 1000 && p[1] > 0 && p[1] < 1000);
  await page.screenshot({ path: join(out, 'playcanvas_desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileCorners = await page.evaluate(async () => {
    const { app, camera, min, max } = window.buildingCheck;
    app.resizeCanvas(); camera.setPosition(22, 12, 30); camera.lookAt(0, 3.5, 0);
    await new Promise(resolve => app.once('postrender', resolve));
    const corners = [];
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const p = camera.camera.worldToScreen(new pc.Vec3(x, y, z)); corners.push([p.x, p.y]);
    }
    return corners;
  });
  for (const p of mobileCorners) assert.ok(p[0] > 0 && p[0] < 390 && p[1] > 0 && p[1] < 844);
  await page.screenshot({ path: join(out, 'playcanvas_mobile_viewport.png') });
  assert.deepEqual(errors, []);
  const result = { status: 'passed', browser: channel, headless: true,
    glb_sha256: createHash('sha256').update(model).digest('hex'),
    rendering: 'ANGLE SwiftShader software; not hardware/device performance evidence',
    desktopViewport: [1000, 1000], mobileViewportOnly: [390, 844], browserErrors: errors, imported, mobileCorners };
  writeFileSync(join(out, 'playcanvas_verification.json'), JSON.stringify(result, null, 2) + '\n');
  console.log('T025_PLAYCANVAS_VERIFIED ' + JSON.stringify({ status: result.status, browser: channel, ...imported }));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
