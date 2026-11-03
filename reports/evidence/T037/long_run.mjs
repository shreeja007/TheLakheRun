import { chromium } from 'file:///C:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity_original/node_modules/playwright/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 900, height: 600 }, serviceWorkers: 'block' })).newPage();
await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
await page.goto('http://127.0.0.1:4190'); await page.waitForFunction(() => Boolean(window.__game));
await page.evaluate(() => window.__pcApp.off('update')); await page.click('#btn-play');
const r = await page.evaluate(() => {
  const g = window.__game, m = g.getObstacleManager(), p = g.getPlayer();
  m.checkCollisions = () => null;
  const orig = m.activateStandardObstacle.bind(m);
  const missed = {}; let placed = 0;
  m.activateStandardObstacle = (type, lane, z) => { const n = m.getActiveObstacles().length; orig(type, lane, z);
    if (m.getActiveObstacles().length === n) missed[type] = (missed[type] || 0) + 1; else placed++; };
  let frames = 0, maxActive = 0;
  while (p.getTelemetry().distance < 1500 && frames < 20000) { g.update(1 / 60); frames++; maxActive = Math.max(maxActive, m.getActiveObstacles().length); }
  return { frames, seconds: +(frames / 60).toFixed(1), distance: +p.getTelemetry().distance.toFixed(0), speed: +p.getSpeed().toFixed(2), placed, missed, maxActive };
});
console.log(JSON.stringify(r));
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/real-run-1500m.png` });
await browser.close();
