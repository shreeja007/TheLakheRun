// T038 performance probe. Plays a scripted 1,500 m run (collisions off) one frame at a time and, for
// every frame, times game update + render (which includes batch rebuilds) + gl.finish() so GPU work
// is counted too. Also records draw calls, visible triangles and a screenshot at fixed distances.
//
// Usage: node reports/evidence/T038/perf_probe.mjs <outDir> <label>
//   UI_TEST_URL     preview server (default http://127.0.0.1:4190)
//   PROBE_RENDERER  "gpu" (default: this PC's GPU through ANGLE/D3D11) or "swiftshader"
// Absolute timings are for this PC only; compare before/after on the same machine.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] || '.');
const label = process.argv[3] || 'run';
mkdirSync(out, { recursive: true });
const origin = process.env.UI_TEST_URL || 'http://127.0.0.1:4190';
const renderer = process.env.PROBE_RENDERER || 'gpu';
const args = renderer === 'gpu'
  ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist']
  : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ channel: 'chrome', headless: true, args });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  serviceWorkers: 'block' })).newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
await page.goto(origin);
await page.waitForFunction(() => Boolean(window.__game));
await page.waitForTimeout(4000); // let models and textures finish loading
const gpuName = await page.evaluate(() => {
  const gl = window.__pcApp.graphicsDevice.gl;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
});
await page.evaluate(() => window.__pcApp.off('update'));
await page.click('#btn-play');
await page.evaluate(() => {
  const app = window.__pcApp, b = app.batcher;
  window.__probe = { rebuilds: 0, rebuildMs: 0, frames: [], spikes: [] };
  const og = b.generate.bind(b);
  b.generate = ids => {
    const t = performance.now(); og(ids);
    window.__probe.rebuilds++; window.__probe.rebuildMs += performance.now() - t;
  };
  window.__game.getObstacleManager().checkCollisions = () => null;
});

const samples = [];
for (const target of [20, 300, 700, 1500]) {
  const stats = await page.evaluate(async (target) => {
    const app = window.__pcApp, g = window.__game, p = g.getPlayer();
    const gl = app.graphicsDevice.gl;
    const frames = window.__probe.frames;
    const rebuildsBefore = window.__probe.rebuilds;
    let guard = 0;
    while (p.getTelemetry().distance < target && guard++ < 30000) {
      const t = performance.now();
      g.update(1 / 60);
      app.render();
      gl.finish();
      const ms = performance.now() - t;
      frames.push(ms);
      if (ms > 16.7) window.__probe.spikes.push({ distance: +p.getTelemetry().distance.toFixed(1), ms: +ms.toFixed(1) });
    }
    // Let one real frame run so the engine's draw-call counter describes this exact state.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const seen = new Set();
    for (const layer of app.scene.layers.layerList) {
      if (!layer.enabled) continue;
      for (const mi of layer.meshInstances) if (mi.visibleThisFrame) seen.add(mi);
    }
    let triangles = 0;
    for (const mi of seen) triangles += (mi.mesh.primitive[0].count / 3) * (mi.instancingData ? mi.instancingCount : 1);
    return {
      distance: Math.round(p.getTelemetry().distance), drawCalls: app.stats.drawCalls.total,
      triangles: Math.round(triangles), batchRebuildsSincePrevious: window.__probe.rebuilds - rebuildsBefore,
    };
  }, target);
  await page.screenshot({ path: resolve(out, `${label}-${target}m.png`) });
  samples.push(stats);
  console.log(JSON.stringify(stats));
}
const summary = await page.evaluate(() => {
  const f = [...window.__probe.frames].sort((a, b) => a - b);
  const pct = q => +f[Math.min(f.length - 1, Math.floor(q * f.length))].toFixed(2);
  return {
    frames: f.length, medianMs: pct(0.5), p95Ms: pct(0.95), p99Ms: pct(0.99), maxMs: +f[f.length - 1].toFixed(1),
    framesOver33ms: f.filter(x => x > 33.3).length, framesOver16ms: f.filter(x => x > 16.7).length,
    spikes: window.__probe.spikes,
    batchRebuilds: window.__probe.rebuilds, batchRebuildMs: +window.__probe.rebuildMs.toFixed(0),
  };
});
const result = { label, origin, renderer: gpuName, viewport: '390x844 @1x', samples, frameCost: summary, pageErrors: errors };
writeFileSync(resolve(out, `${label}-perf.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ renderer: gpuName, frameCost: summary, errors }));
await browser.close();
