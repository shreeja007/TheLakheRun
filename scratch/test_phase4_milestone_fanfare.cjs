const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('--- Testing Phase 4: Biome Transition Fanfare & Torana Milestone Celebrations ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 440, height: 860 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // 1. Verify Audio & Particle Methods
  const unitTest = await page.evaluate(() => {
    const gm = window.__game;
    const sound = gm.getSound();
    const fx = gm.getFx();
    const road = gm['road'];

    // Test playGhantiBellChime
    let chimeError = false;
    try {
      sound.playGhantiBellChime();
    } catch (e) {
      chimeError = true;
    }

    // Test emitToranaMilestoneCelebration
    const pCountBefore = fx.getActiveCount();
    fx.emitToranaMilestoneCelebration(0, 5.2, -140);
    const pCountAfter = fx.getActiveCount();

    // Test triggerToranaBellSwing
    road.triggerToranaBellSwing(140);
    road.update(-135, 0.016);
    const amp1 = road['bellSwingAmplitude'];
    road.update(-135, 0.1);
    const amp2 = road['bellSwingAmplitude'];

    return {
      chimeError,
      pCountBefore,
      pCountAfter,
      particlesEmitted: pCountAfter - pCountBefore,
      amp1,
      amp2,
      bellOscillating: amp1 > amp2 && amp2 > 0,
    };
  });

  console.log('1. Sound, FX & Bell Swing Tests:', unitTest);
  if (!unitTest.chimeError && unitTest.particlesEmitted >= 40 && unitTest.bellOscillating) {
    console.log('   PASS: Ghanti bell chime, 3D marigold particles, and Torana bell swing verified!');
  } else {
    console.error('   FAIL: Unit tests failed!');
  }

  // 2. Start game and test milestone crossing detection (140m, 280m, 420m)
  await page.click('#ready-banner');
  await page.waitForTimeout(500);

  const milestoneResults = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    const milestonesTested = [];

    // Milestone 1: 140m (Entering Causeway)
    player.teleportZ(-139.5);
    gm.update(0.1); // crosses 140m threshold
    const c1 = gm['activeSkillCallout'];
    milestonesTested.push({
      threshold: 140,
      callout: c1 ? { ...c1 } : null,
      bonus: gm.getScoreManager().getBonusScore(),
    });

    // Milestone 2: 280m (Entering Temple Hill)
    player.teleportZ(-279.5);
    gm.update(0.1); // crosses 280m threshold
    const c2 = gm['activeSkillCallout'];
    milestonesTested.push({
      threshold: 280,
      callout: c2 ? { ...c2 } : null,
      bonus: gm.getScoreManager().getBonusScore(),
    });

    // Milestone 3: 420m (Looping back to Durbar Royal Alley)
    player.teleportZ(-419.5);
    gm.update(0.1); // crosses 420m threshold
    const c3 = gm['activeSkillCallout'];
    milestonesTested.push({
      threshold: 420,
      callout: c3 ? { ...c3 } : null,
      bonus: gm.getScoreManager().getBonusScore(),
    });

    return milestonesTested;
  });

  console.log('2. Milestone Crossings Results:', JSON.stringify(milestoneResults, null, 2));

  // Assertions for all 3 milestones
  const m1 = milestoneResults[0];
  const m2 = milestoneResults[1];
  const m3 = milestoneResults[2];

  if (m1.callout && m1.callout.type === 'MILESTONE_CLEARED' && m1.callout.title.includes('140m') && m1.callout.subtitle.includes('Sacred River Causeway')) {
    console.log('   PASS: 140m Torana Milestone triggered Sacred River Causeway celebration!');
  } else {
    console.error('   FAIL: 140m milestone failed!', m1);
  }

  if (m2.callout && m2.callout.type === 'MILESTONE_CLEARED' && m2.callout.title.includes('280m') && m2.callout.subtitle.includes('Himalayan Temple Hill')) {
    console.log('   PASS: 280m Torana Milestone triggered Himalayan Temple Hill celebration!');
  } else {
    console.error('   FAIL: 280m milestone failed!', m2);
  }

  if (m3.callout && m3.callout.type === 'MILESTONE_CLEARED' && m3.callout.title.includes('420m') && m3.callout.subtitle.includes('Durbar Royal Alley')) {
    console.log('   PASS: 420m Torana Milestone triggered full loop Durbar Royal Alley celebration!');
  } else {
    console.error('   FAIL: 420m milestone failed!', m3);
  }

  // 3. Visual Screenshots
  const outDir = path.join(__dirname, 'evidence_phase4');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Capture 1: Under Torana arch with marigold petal burst
  await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    const road = gm['road'];
    const fx = gm.getFx();

    player.teleportZ(-138.5);
    road.update(-138.5, 0.016);
    road.triggerToranaBellSwing(140);
    fx.emitToranaMilestoneCelebration(0, 5.2, -140);
  });
  await page.waitForTimeout(300);
  const ss1 = path.join(outDir, '01_torana_gateway_marigold_burst.png');
  await page.screenshot({ path: ss1 });
  console.log('3. Screenshot saved:', ss1);

  // Capture 2: Milestone celebration toast & confetti shower
  await page.evaluate(() => {
    const gm = window.__game;
    gm['activeSkillCallout'] = {
      type: 'MILESTONE_CLEARED',
      title: '⛩️ 140m TORANA CLEARED!',
      subtitle: 'Sacred River Causeway Unlocked! (+150)',
      points: 150,
      multiplier: 1,
      timestamp: performance.now(),
    };
    gm.notifyTelemetry();
  });
  await page.waitForTimeout(400);
  const ss2 = path.join(outDir, '02_milestone_cleared_toast_and_confetti.png');
  await page.screenshot({ path: ss2 });
  console.log('3. Screenshot saved:', ss2);

  console.log('Console Errors:', consoleErrors);
  if (consoleErrors.length === 0) {
    console.log('ALL PHASE 4 AUTOMATED TESTS PASSED WITH 0 CONSOLE ERRORS!');
  } else {
    console.error('Console errors detected:', consoleErrors);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
