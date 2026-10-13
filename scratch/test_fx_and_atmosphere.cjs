const { chromium } = require('playwright');
const path = require('path');

async function testFxAndAtmosphere() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Capture READY standoff showing overhead festive Torana garlands strung across facades
  const toranaPath = path.resolve(__dirname, 'fx_01_overhead_torana_garlands.png');
  await page.screenshot({ path: toranaPath });
  console.log('Saved overhead torana garlands screenshot to', toranaPath);

  // Expose particle hooks in window for precise frame captures
  await page.evaluate(() => {
    const game = window.__game;
    window.__stompCount = 0;
    window.__lastStompTime = 0;
    window.__landingCount = 0;
    window.__lastLandingTime = 0;

    const origStomp = game.guardian.onStompCb;
    game.guardian.onStomp((vol) => {
      window.__stompCount++;
      window.__lastStompTime = performance.now();
      if (origStomp) origStomp(vol);
    });

    const origLanding = game.player.onLandingCb;
    game.player.onLanding((x, y, z) => {
      window.__landingCount++;
      window.__lastLandingTime = performance.now();
      if (origLanding) origLanding(x, y, z);
    });
  });

  // 2. Start run
  console.log('Starting run...');
  await page.click('#ready-banner');
  await page.waitForTimeout(1600); // Wait for camera swoop into chase position

  // 3. Wait for Lakhey Stomp event and capture shockwave ring & dust puffs
  console.log('Waiting for Lakhey drum downbeat stomp...');
  await page.waitForFunction(() => window.__stompCount >= 1, { timeout: 3000 });
  await page.waitForTimeout(80); // 80ms into shockwave ring expansion

  const activeOnStomp = await page.evaluate(() => window.__game.getFx().getActiveCount());
  console.log('Active particles on Lakhey stomp:', activeOnStomp);

  const stompPath = path.resolve(__dirname, 'fx_02_lakhey_stomp_shockwave.png');
  await page.screenshot({ path: stompPath });
  console.log('Saved Lakhey stomp shockwave screenshot to', stompPath);

  // 4. Test Lane Dodge skid puff (Skater dodge to right)
  console.log('Executing sharp lane dodge to Right...');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(70); // 70ms into skid puff emission

  const activeOnDodge = await page.evaluate(() => window.__game.getFx().getActiveCount());
  console.log('Active particles on lane dodge:', activeOnDodge);

  const dodgeSkidPath = path.resolve(__dirname, 'fx_03_dodge_skid_dust.png');
  await page.screenshot({ path: dodgeSkidPath });
  console.log('Saved dodge skid dust screenshot to', dodgeSkidPath);

  // 5. Test Vault Jump & Landing Dust Puffs
  await page.waitForTimeout(300);
  console.log('Switching back to Center and jumping...');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(200);

  const prevLandingCount = await page.evaluate(() => window.__landingCount);
  await page.keyboard.press('Space');
  // Wait for landing event callback
  await page.waitForFunction((prev) => window.__landingCount > prev, prevLandingCount, { timeout: 2000 });
  await page.waitForTimeout(90); // 90ms into landing radial dust burst

  const activeOnLanding = await page.evaluate(() => window.__game.getFx().getActiveCount());
  console.log('Active particles on vault landing:', activeOnLanding);

  const landingDustPath = path.resolve(__dirname, 'fx_04_landing_dust_puffs.png');
  await page.screenshot({ path: landingDustPath });
  console.log('Saved landing dust puffs screenshot to', landingDustPath);

  // 6. Wait for particle pool to naturally decay back to zero (memory leak check)
  await page.waitForTimeout(600);
  const activeAfterDecay = await page.evaluate(() => window.__game.getFx().getActiveCount());
  console.log('Active particles after decay (should be 0):', activeAfterDecay);

  // 7. Check FPS and verify zero console errors
  const fps = await page.evaluate(() => {
    return new Promise(resolve => {
      let frames = 0;
      const start = performance.now();
      function count() {
        frames++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(count);
        } else {
          resolve(Math.round((frames * 1000) / (performance.now() - start)));
        }
      }
      requestAnimationFrame(count);
    });
  });

  console.log('Measured FPS:', fps);
  console.log('Console Errors:', consoleErrors.length ? consoleErrors : 'None (Clean)');

  await browser.close();
}

testFxAndAtmosphere().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
