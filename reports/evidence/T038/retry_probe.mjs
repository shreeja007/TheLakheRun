import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
await page.goto('http://127.0.0.1:4190'); await page.waitForFunction(() => Boolean(window.__game));
await page.waitForTimeout(4000);
await page.click('#btn-play');
const r = await page.evaluate(async () => {
  const app = window.__pcApp, b = app.batcher, g = window.__game, p = g.getPlayer();
  let gens = 0; const og = b.generate.bind(b); b.generate = ids => { gens++; og(ids); };
  const om = g.getObstacleManager(); const realCheck = om.checkCollisions.bind(om);
  om.checkCollisions = () => null;
  app.off('update');
  while (p.getTelemetry().distance < 520) { g.update(1/60); app.render(); }
  om.checkCollisions = realCheck;
  // Run into the next obstacle for a real catch, then retry.
  let f = 0; while (g.getState() !== 'GAME_OVER' && f++ < 3000) { g.update(1/60); app.render(); }
  const state = g.getState();
  const gensBeforeRetry = gens;
  g.retry ? g.retry() : g.reset();
  for (let i = 0; i < 120; i++) { g.update(1/60); app.render(); }
  return { reachedGameOver: state, rebuildsDuringRun: gensBeforeRetry, rebuildsFromRetry: gens - gensBeforeRetry, distanceAfterRetry: Math.round(p.getTelemetry().distance) };
});
console.log(JSON.stringify({ ...r, errors }));
await browser.close();
