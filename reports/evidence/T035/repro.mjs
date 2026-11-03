import { chromium } from 'file:///C:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity_original/node_modules/playwright/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
  await page.goto('http://127.0.0.1:4190');
  await page.waitForFunction(() => Boolean(window.__game));
  await page.evaluate(() => window.__pcApp.off('update'));
  await page.click('#btn-play');
  await page.evaluate(() => {
    const g = window.__game;
    g.getObstacleManager().checkCollisions = () => undefined; // isolate movement
    for (let i = 0; i < 120; i++) g.update(1 / 60); // finish intro pan
  });
  return { ctx, page };
}
const res = {};
for (const fps of [60, 30, 24]) {
  const { ctx, page } = await fresh();
  res[`laneChange_${fps}fps`] = await page.evaluate((fps) => {
    const g = window.__game, p = g.getPlayer(), xs = [];
    g.triggerAction('RIGHT', 'repro');
    for (let i = 0; i < Math.round(fps * 1.5); i++) { g.update(1 / fps); xs.push(+p.getX().toFixed(3)); }
    const finite = xs.filter(Number.isFinite);
    return { targetX: 2.0, xAt0_25s: xs[Math.round(fps * 0.25) - 1], xAt1_5s: xs[xs.length - 1],
      maxX: Math.max(...finite), minX: Math.min(...finite), nonFinite: xs.length - finite.length };
  }, fps);
  if (fps === 30) await page.screenshot({ path: `${out}/lane-change-30fps-after-1.5s.png` });
  await ctx.close();
}
{ // Mid-air slide: one-frame vertical snap; slide camera pop
  const { ctx, page } = await fresh();
  res.midAirSlide = await page.evaluate(() => {
    const g = window.__game, p = g.getPlayer(), cam = window.__pcApp.root.findByName('Camera') || window.__pcApp.root.findComponents('camera')[0].entity;
    g.triggerAction('JUMP', 'repro');
    for (let i = 0; i < 18; i++) g.update(1 / 60);
    const yBefore = p.getY(), camYBefore = cam.getPosition().y;
    g.triggerAction('SLIDE', 'repro'); g.update(1 / 60);
    const yAfter = p.getY(), camYAfter = cam.getPosition().y;
    for (let i = 0; i < 39; i++) g.update(1 / 60);
    const camYEndSlide = cam.getPosition().y; g.update(1 / 60); const camYAfterSlide = cam.getPosition().y;
    return { playerYBefore: +yBefore.toFixed(2), playerYOneFrameLater: +yAfter.toFixed(2),
      cameraYBefore: +camYBefore.toFixed(2), cameraYOneFrameLater: +camYAfter.toFixed(2),
      cameraYLastSlideFrame: +camYEndSlide.toFixed(2), cameraYFirstFrameAfter: +camYAfterSlide.toFixed(2) };
  });
  await ctx.close();
}
{ // Buffered jump: does the second jump fire the jump callback?
  const { ctx, page } = await fresh();
  res.bufferedJump = await page.evaluate(() => {
    const g = window.__game, p = g.getPlayer(); let jumps = 0;
    p.onJump(() => jumps++);
    g.triggerAction('JUMP', 'repro');
    for (let i = 0; i < 34; i++) g.update(1 / 60);
    g.triggerAction('JUMP', 'repro (buffered)');
    let rejumped = false;
    for (let i = 0; i < 10; i++) { g.update(1 / 60); if (p.getTelemetry().isJumping && p.getY() > 0.6) rejumped = true; }
    return { jumpCallbacks: jumps, secondJumpHappened: rejumped };
  });
  await ctx.close();
}
{ // Dive-roll slide (variant 1) mid-roll: capture
  const { ctx, page } = await fresh();
  await page.evaluate(() => {
    const g = window.__game, p = g.getPlayer();
    p.slide(1);
    for (let i = 0; i < 20; i++) g.update(1 / 60); // ~0.33s = ~51% of roll
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/dive-roll-mid.png` });
  await ctx.close();
}
res.pageErrors = errors;
console.log(JSON.stringify(res, null, 1));
await browser.close();
