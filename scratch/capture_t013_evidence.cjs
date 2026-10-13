const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Capturing T013 Performance Evidence Screenshots...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  // 1. Desktop Profile with Diagnostics Panel (1200x800)
  const desktopPage = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await desktopPage.goto('http://localhost:4173/');
  await desktopPage.waitForTimeout(1000);

  // Start running
  await desktopPage.click('#ready-banner');
  // Run for 3 seconds so stats update
  await desktopPage.waitForTimeout(3000);

  const desktopEvidence = path.join(brainDir, 't013_performance_desktop_hud.png');
  await desktopPage.screenshot({ path: desktopEvidence });
  console.log('Saved desktop evidence to:', desktopEvidence);

  const desktopStats = await desktopPage.evaluate(() => {
    return {
      fps: document.getElementById('fps-val')?.textContent,
      dc: document.getElementById('dc-val')?.textContent,
      tri: document.getElementById('tri-val')?.textContent,
      dist: document.getElementById('hud-score-val')?.textContent,
    };
  });
  console.log('Desktop HUD displayed stats:', desktopStats);
  await desktopPage.close();

  // 2. Mobile Profile (390x844, 2x DPR)
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2.0,
    isMobile: true,
  });
  await mobilePage.goto('http://localhost:4173/');
  await mobilePage.waitForTimeout(1000);

  await mobilePage.click('#ready-banner');
  // Run for 3 seconds
  await mobilePage.waitForTimeout(3000);

  const mobileEvidence = path.join(brainDir, 't013_performance_mobile_run.png');
  await mobilePage.screenshot({ path: mobileEvidence });
  console.log('Saved mobile evidence to:', mobileEvidence);

  // 3. Prolonged Run & Garbage Collection Test (15 seconds running + lane switching)
  console.log('Running 15-second endurance run to verify memory and GC stability...');
  const memBefore = await mobilePage.evaluate(() => window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize : 0);

  for (let i = 0; i < 10; i++) {
    await mobilePage.keyboard.press('ArrowLeft');
    await mobilePage.waitForTimeout(700);
    await mobilePage.keyboard.press('ArrowRight');
    await mobilePage.waitForTimeout(700);
  }

  const memAfter = await mobilePage.evaluate(() => window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize : 0);
  console.log(`Memory growth during 15s active run: ${((memAfter - memBefore) / 1024 / 1024).toFixed(2)} MB`);

  const enduranceEvidence = path.join(brainDir, 't013_performance_endurance_run.png');
  await mobilePage.screenshot({ path: enduranceEvidence });
  console.log('Saved endurance screenshot to:', enduranceEvidence);

  await browser.close();
  console.log('Evidence capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
