import { chromium } from 'file:///C:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity_original/node_modules/playwright/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
await page.addInitScript(() => localStorage.setItem('lakhey-run.controls.v1', 'seen'));
await page.goto('http://127.0.0.1:4190');
await page.waitForFunction(() => Boolean(window.__game));
await page.evaluate(() => window.__pcApp.off('update'));
await page.click('#btn-play');
const shoot = async (name, frames, variantFn) => {
  const info = await page.evaluate(({ frames, kind }) => {
    const g = window.__game, p = g.getPlayer();
    g.getObstacleManager().checkCollisions = () => undefined;
    for (let i = 0; i < 120; i++) g.update(1 / 60);
    if (kind === 'roll') p.slide(1); else if (kind === 'knee') p.slide(2); else if (kind === 'glide') p.slide(0);
    for (let i = 0; i < frames; i++) g.update(1 / 60);
    const cam = window.__pcApp.root.findComponents('camera')[0].entity;
    const z = p.getZ(), x = p.getX();
    cam.setPosition(x + 3.2, 0.9, z); cam.lookAt(x, 0.5, z);
    // lowest rendered vertex Y of Tuku's model (world AABB of all mesh instances)
    const root = window.__pcApp.root.findByName('Tuku_3D_Blockout');
    let minY = Infinity;
    for (const r of root.findComponents('render')) for (const mi of r.meshInstances) minY = Math.min(minY, mi.aabb.getMin().y);
    return { playerY: +p.getY().toFixed(2), lowestMeshY: +minY.toFixed(2) };
  }, { frames, kind: variantFn });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/${name}.png` });
  return info;
};
const r = {};
r.diveRollMid = await shoot('side-dive-roll-mid', 20, 'roll');
await page.evaluate(() => window.__game.retry());
r.kneeSlideMid = await shoot('side-knee-slide-mid', 20, 'knee');
console.log(JSON.stringify(r));
await browser.close();
