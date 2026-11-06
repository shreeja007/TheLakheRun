import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })).newPage();
await page.addInitScript(() => {
  localStorage.setItem('lakhey-run.controls.v1', 'seen');
  window.__glc = { link: 0, tex: 0, buf: 0, bufBytes: 0 };
  const P = WebGL2RenderingContext.prototype;
  const wrap = (name, f) => { const o = P[name]; P[name] = function (...a) { f(a); return o.apply(this, a); }; };
  wrap('linkProgram', () => window.__glc.link++);
  wrap('texImage2D', () => window.__glc.tex++); wrap('texSubImage2D', () => window.__glc.tex++);
  wrap('bufferData', a => { window.__glc.buf++; window.__glc.bufBytes += a[1]?.byteLength || (typeof a[1] === 'number' ? a[1] : 0); });
});
await page.goto(process.env.URL || 'http://127.0.0.1:4190'); await page.waitForFunction(() => Boolean(window.__game));
await page.waitForTimeout(4000);
const atHome = await page.evaluate(() => ({ ...window.__glc }));
console.log('by home screen', JSON.stringify(atHome));
await page.evaluate(() => window.__pcApp.off('update')); await page.click('#btn-play');
const r = await page.evaluate(() => {
  const app = window.__pcApp, g = window.__game, p = g.getPlayer(), gl = app.graphicsDevice.gl;
  g.getObstacleManager().checkCollisions = () => null;
  const out = [];
  const everVisible = new Set();
  const vis = () => { const now = []; for (const layer of app.scene.layers.layerList) { if (!layer.enabled) continue; for (const mi of layer.meshInstances) if (mi.visibleThisFrame && !everVisible.has(mi)) { everVisible.add(mi); now.push(mi); } } return now; };
  app.render(); vis();
  let f = 0;
  while (p.getTelemetry().distance < 60 && f < 2000) {
    const c0 = { ...window.__glc }; const t = performance.now();
    const t1 = performance.now(); g.update(1/60); const tu = performance.now() - t1;
    app.render(); gl.finish(); const ms = performance.now() - t;
    const fresh = vis();
    if (ms > 16.7) out.push({ fresh: [...new Set(fresh.map(mi => mi.node.name + ':' + (mi.material?.name || '') + (mi._shaderDefs ? '#' + mi._shaderDefs : '')))].slice(0, 12), d: +p.getTelemetry().distance.toFixed(1), ms: +ms.toFixed(1), updateMs: +tu.toFixed(1), link: window.__glc.link - c0.link, tex: window.__glc.tex - c0.tex, buf: window.__glc.buf - c0.buf, kb: Math.round((window.__glc.bufBytes - c0.bufBytes) / 1024) });
    f++;
  }
  return out;
});
console.log(JSON.stringify(r, null, 0));
await browser.close();
