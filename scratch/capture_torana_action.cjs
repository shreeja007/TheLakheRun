const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Capturing Torana Gateway in-game action screenshot...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 440, height: 860 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(600);

  // Click start
  await page.click('#ready-banner');
  await page.waitForTimeout(300);

  // Run player up to 132m approaching the 140m Torana arch
  await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    const road = gm['road'];
    const fx = gm.getFx();

    // Advance player smoothly to 132m
    for (let z = 0; z > -132; z -= 10) {
      player.teleportZ(z);
      road.update(z, 0.05);
    }
    player.teleportZ(-134);
    road.update(-134, 0.016);
    road.triggerToranaBellSwing(140);
    fx.emitToranaMilestoneCelebration(0, 5.2, -140);
  });

  await page.waitForTimeout(400);
  const outPath = path.join(__dirname, 'evidence_phase4', '03_torana_arch_in_action.png');
  await page.screenshot({ path: outPath });
  console.log('Saved:', outPath);

  await browser.close();
}

main().catch(console.error);
