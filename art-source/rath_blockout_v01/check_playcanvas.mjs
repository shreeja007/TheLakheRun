// T020 isolated GLB import/rotation smoke check. No game source or runtime assets changed.
// Run from repository root: node art-source/rath_blockout_v01/check_playcanvas.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('./', import.meta.url));
const model = readFileSync(out + 'kumari_rath_blockout_v01.glb');
const engine = readFileSync(new URL('../../node_modules/playcanvas/build/playcanvas.js', import.meta.url));
const expected = JSON.parse(readFileSync(out + 'asset_metrics.json'));
const markup = '<!doctype html><html><head><meta charset="utf-8"><title>T020 rath import check</title>' +
  '<style>html,body{margin:0;background:#bcc1ca;overflow:hidden}canvas{display:block;width:100vw;height:100vh}</style>' +
  '</head><body><canvas id="view"></canvas><script src="/engine.js"></script></body></html>';
const server = createServer((req, res) => {
  if (req.url === '/model.glb') { res.setHeader('Content-Type', 'model/gltf-binary'); res.end(model); }
  else if (req.url === '/engine.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(engine); }
  else if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end(markup); }
  else { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser, channel;
try {
  for (const candidate of ['chrome', 'msedge', undefined]) {
    try {
      browser = await chromium.launch({ channel: candidate, headless: true,
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
      channel = candidate || 'bundled Chromium';
      break;
    } catch (error) { if (!candidate) throw error; }
  }
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:' + server.address().port);
  const imported = await page.evaluate(async () => {
    const app = new pc.Application(document.querySelector('canvas'), {
      graphicsDeviceOptions: { antialias: true, preserveDrawingBuffer: true }
    });
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.scene.ambientLight = new pc.Color(0.7, 0.7, 0.7);
    app.scene.gammaCorrection = pc.GAMMA_SRGB;
    app.scene.toneMapping = pc.TONEMAP_ACES;
    const camera = new pc.Entity('TestCamera');
    camera.addComponent('camera', { clearColor: new pc.Color(0.73, 0.75, 0.79), farClip: 80, fov: 42 });
    camera.setPosition(8, 6, 11);
    camera.lookAt(0, 2, 0.7);
    app.root.addChild(camera);
    const light = new pc.Entity('TestLight');
    light.addComponent('light', { type: 'directional', color: new pc.Color(1, 0.96, 0.9), intensity: 1.4 });
    light.setEulerAngles(45, 145, 0);
    app.root.addChild(light);
    const asset = await new Promise((resolve, reject) =>
      app.assets.loadFromUrl('/model.glb', 'container', (error, asset) => error ? reject(error) : resolve(asset)));
    const entity = asset.resource.instantiateRenderEntity();
    app.root.addChild(entity);
    const root = entity.findByName('RathRoot');
    if (!root) throw new Error('No RathRoot');
    const nodes = ['ChassisRoot', 'PlatformRoot', 'PavilionRoot', 'RoofRoot', 'DrawbeamRoot', 'GarlandRoot',
      'Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR'];
    for (const name of nodes) if (!entity.findByName(name)) throw new Error('Missing ' + name);
    const renders = entity.findComponents('render');
    const meshes = renders.flatMap(render => render.meshInstances);
    const bounds = meshes[0].aabb.clone();
    for (const mi of meshes.slice(1)) bounds.add(mi.aabb);
    const min = bounds.getMin(), max = bounds.getMax();
    const pivots = [];
    for (const name of nodes.filter(name => name.startsWith('Wheel_'))) {
      const wheel = entity.findByName(name);
      const before = wheel.getPosition().clone();
      const mesh = wheel.findComponents('render')[0].meshInstances[0];
      const vertex = new pc.Vec3(0, 0.5, 0);
      const initialPoint = wheel.getWorldTransform().transformPoint(vertex);
      wheel.rotateLocal(45, 0, 0);
      const after = wheel.getPosition().clone();
      const rotatedPoint = wheel.getWorldTransform().transformPoint(vertex);
      pivots.push({ name, center: [before.x, before.y, before.z],
        drift: before.distance(after), surfacePointMoved: initialPoint.distance(rotatedPoint) > 0.1,
        childMeshes: wheel.findComponents('render').length });
      wheel.rotateLocal(-45, 0, 0);
    }
    window.assetCheck = { app, entity, camera };
    app.start();
    await new Promise(resolve => app.once('postrender', resolve));
    const projected = [];
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const p = camera.camera.worldToScreen(new pc.Vec3(x, y, z));
      projected.push([p.x, p.y, p.z]);
    }
    return {
      engineVersion: pc.version, graphicsBackend: app.graphicsDevice.deviceType,
      meshInstances: meshes.length, materials: [...new Set(meshes.map(mi => mi.material.name))],
      min: [min.x, min.y, min.z], max: [max.x, max.y, max.z],
      rootPosition: [root.getPosition().x, root.getPosition().y, root.getPosition().z],
      animations: asset.resource.animations?.length || 0, pivots, projected
    };
  });
  assert.equal(imported.animations, 0);
  assert.equal(imported.materials.length, expected.materials.length);
  assert.deepEqual(imported.rootPosition, [0, 0, 0]);
  imported.min.concat(imported.max).forEach((value, i) =>
    assert.ok(Math.abs(value - expected.bounds_gltf_min.concat(expected.bounds_gltf_max)[i]) < 0.0001));
  for (const pivot of imported.pivots) {
    assert.ok(pivot.drift < 0.00001);
    assert.ok(pivot.surfacePointMoved);
    assert.equal(pivot.childMeshes, 1);
  }
  for (const p of imported.projected) assert.ok(p[0] > 0 && p[0] < 1000 && p[1] > 0 && p[1] < 900);
  await page.screenshot({ path: out + 'playcanvas_desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileProjection = await page.evaluate(async () => {
    const { app, camera, entity } = window.assetCheck;
    app.resizeCanvas();
    camera.setPosition(12, 8, 17);
    camera.lookAt(0, 2, 0.7);
    await new Promise(resolve => app.once('postrender', resolve));
    const meshes = entity.findComponents('render').flatMap(r => r.meshInstances);
    const box = meshes[0].aabb.clone();
    for (const mesh of meshes.slice(1)) box.add(mesh.aabb);
    const min = box.getMin(), max = box.getMax(), corners = [];
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const p = camera.camera.worldToScreen(new pc.Vec3(x, y, z));
      corners.push([p.x, p.y]);
    }
    return corners;
  });
  for (const p of mobileProjection) assert.ok(p[0] > 0 && p[0] < 390 && p[1] > 0 && p[1] < 844);
  await page.screenshot({ path: out + 'playcanvas_mobile_viewport.png' });
  assert.deepEqual(errors, []);
  const result = { status: 'passed', browser: channel, headless: true,
    rendering: 'ANGLE SwiftShader software; not physical-device performance testing',
    desktopViewport: [1000, 900], mobileViewportOnly: [390, 844],
    browserErrors: errors, imported, mobileProjection };
  writeFileSync(out + 'playcanvas_verification.json', JSON.stringify(result, null, 2) + '\n');
  console.log('T020_PLAYCANVAS_VERIFIED ' + JSON.stringify(result));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
