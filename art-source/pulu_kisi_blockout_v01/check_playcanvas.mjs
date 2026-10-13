// T022 isolated GLB import/attachment smoke check; no game code changes.
// Run: node art-source/pulu_kisi_blockout_v01/check_playcanvas.mjs <asset-directory>
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
assert.ok(process.argv[2], 'Supply asset directory');
const out = resolve(process.argv[2]) + sep;
const expected = JSON.parse(readFileSync(out + 'asset_metrics.json'));
const model = readFileSync(out + expected.asset_id + '.glb');
const engine = readFileSync(new URL('../../node_modules/playcanvas/build/playcanvas.js', import.meta.url));
const markup = '<!doctype html><html><head><meta charset="utf-8"><title>T022 Pulu Kisi import check</title>' +
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
    camera.setPosition(5, 2.6, 7);
    camera.lookAt(0, 1.6, 0.25);
    app.root.addChild(camera);
    const light = new pc.Entity('TestLight');
    light.addComponent('light', { type: 'directional', color: new pc.Color(1, 0.96, 0.9), intensity: 1.4 });
    light.setEulerAngles(45, 145, 0);
    app.root.addChild(light);
    const asset = await new Promise((resolve, reject) =>
      app.assets.loadFromUrl('/model.glb', 'container', (error, asset) => error ? reject(error) : resolve(asset)));
    const entity = asset.resource.instantiateRenderEntity();
    app.root.addChild(entity);
    const root = entity.findByName('PuluRoot');
    if (!root) throw new Error('No PuluRoot');
    const nodes = ['ClothRoot', 'FrameRoot', 'HeadRoot', 'TrunkRoot', 'Ear_L', 'Ear_R',
      'TuftRoot', 'GarlandRoot', 'TrimRoot', 'Feet_Front', 'Feet_Rear'];
    for (const name of nodes) if (!entity.findByName(name)) throw new Error('Missing ' + name);
    const renders = entity.findComponents('render');
    const meshes = renders.flatMap(render => render.meshInstances);
    const bounds = meshes[0].aabb.clone();
    for (const mi of meshes.slice(1)) bounds.add(mi.aabb);
    const min = bounds.getMin(), max = bounds.getMax();
    const pivots = [];
    const positions = nodes.map(name => {
      const node = entity.findByName(name), p = node.getPosition();
      return { name, parent: node.parent.name, position: [p.x, p.y, p.z] };
    });
    for (const name of ['HeadRoot', 'TrunkRoot', 'Ear_L', 'Ear_R']) {
      const wheel = entity.findByName(name);
      const before = wheel.getPosition().clone();
      const vertex = new pc.Vec3(0, 0.5, 0);
      const initialPoint = wheel.getWorldTransform().transformPoint(vertex);
      wheel.rotateLocal(15, 0, 0);
      const after = wheel.getPosition().clone();
      const rotatedPoint = wheel.getWorldTransform().transformPoint(vertex);
      pivots.push({ name, center: [before.x, before.y, before.z],
        drift: before.distance(after), surfacePointMoved: initialPoint.distance(rotatedPoint) > 0.05,
        childMeshes: wheel.children.filter(child => child.render).length });
      wheel.rotateLocal(-15, 0, 0);
    }
    const head = entity.findByName('HeadRoot'), body = entity.findByName('ClothRoot');
    const beforeBody = body.getWorldTransform().clone();
    const inverseHead = head.getWorldTransform().clone().invert();
    const attached = ['TrunkRoot', 'Ear_L', 'Ear_R', 'TuftRoot'].map(name => {
      const node = entity.findByName(name);
      return { node, local: inverseHead.transformPoint(node.getPosition().clone()) };
    });
    head.rotateLocal(0, 15, 0);
    const childrenFollow = attached.every(({node, local}) =>
      node.getPosition().distance(head.getWorldTransform().transformPoint(local)) < 0.00001);
    const bodyUnchanged = beforeBody.data.every((value, i) => Math.abs(value - body.getWorldTransform().data[i]) < 0.00001);
    head.rotateLocal(0, -15, 0);
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
      animations: asset.resource.animations?.length || 0, pivots, positions, childrenFollow, bodyUnchanged, projected
    };
  });
  assert.equal(imported.animations, 0);
  assert.equal(imported.materials.length, expected.materials.length);
  assert.deepEqual(imported.rootPosition, [0, 0, 0]);
  assert.ok(imported.childrenFollow && imported.bodyUnchanged);
  for (const node of imported.positions) {
    assert.equal(node.parent, expected.group_parents[node.name]);
    const p = expected.group_pivots_blender_world[node.name];
    [p[0], p[2], -p[1]].forEach((value, i) => assert.ok(Math.abs(value-node.position[i]) < 0.0001));
  }
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
    camera.setPosition(8, 3.2, 11);
    camera.lookAt(0, 1.6, 0.25);
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
  const result = { status: 'passed', asset_id: expected.asset_id,
    glb_sha256: createHash('sha256').update(model).digest('hex'), browser: channel, headless: true,
    rendering: 'ANGLE SwiftShader software; not physical-device performance testing',
    desktopViewport: [1000, 900], mobileViewportOnly: [390, 844],
    browserErrors: errors, imported, mobileProjection };
  writeFileSync(out + 'playcanvas_verification.json', JSON.stringify(result, null, 2) + '\n');
  console.log('T022_PLAYCANVAS_VERIFIED ' + JSON.stringify(result));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
