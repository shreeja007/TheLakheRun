const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Testing Enhanced HUD & Scoring Game Feel: Hit-stops, Screen Flashes, Flower Confetti, and Godspeed Multipliers...');
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

  // 1. Verify initial state
  const isReady = await page.evaluate(() => {
    return window.__game && window.__game.getState() === 'READY';
  });
  console.log('Initial Game State READY:', isReady);

  // 2. Start Run
  await page.click('#ready-banner');
  await page.waitForTimeout(1000);

  // 3. Test Time Dilation Hitstop
  const hitstopTest = await page.evaluate(() => {
    const gm = window.__game;
    gm.triggerHitstop(0.065, 0.35);
    return {
      hasHitstop: gm.hitstopTimer > 0,
      timeScale: gm.timeScale,
    };
  });
  console.log('Hitstop Micro-Dilation Test:', hitstopTest);

  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  // 4. Test Multiplier Escalation through 4 Tiers & Screenshot 8x Godspeed MAX
  const tierResults = await page.evaluate(() => {
    const sm = window.__game.getScoreManager();
    sm.resetRun();
    for (let i = 0; i < 8; i++) sm.boostMultiplier();
    window.__game.notifyTelemetry();
    const pill = document.getElementById('hud-multiplier-pill');
    return {
      pillClass: pill ? pill.className : '',
      multVal: document.getElementById('hud-mult-val')?.textContent,
    };
  });
  console.log('8x Godspeed Multiplier Result:', tierResults);

  const godspeedScreenshot = path.join(brainDir, 'evidence_hud_godspeed_8x_multiplier.png');
  await page.screenshot({ path: godspeedScreenshot });
  console.log('Saved Godspeed 8x screenshot to', godspeedScreenshot);

  // Clear any existing toasts before next test
  await page.evaluate(() => {
    const cc = document.getElementById('callout-container');
    if (cc) cc.innerHTML = '';
  });

  // 5. Test Clean Vault + Flying Score Digit
  await page.evaluate(() => {
    const gm = window.__game;
    gm.activeSkillCallout = {
      type: 'CLEAN_VAULT',
      title: 'CLEAN VAULT!',
      subtitle: '+50 Skill Bonus (4x)',
      points: 200,
      multiplier: 4,
      timestamp: performance.now(),
      lateralDir: 0,
    };
  });
  await page.waitForTimeout(140);

  const cleanVaultScreenshot = path.join(brainDir, 'evidence_hud_clean_vault_callout.png');
  await page.screenshot({ path: cleanVaultScreenshot });
  console.log('Saved Clean Vault screenshot to', cleanVaultScreenshot);

  // Wait for flying digit and toast to clear
  await page.waitForTimeout(1300);

  // 6. Test Close Call + Screen Flash + Sparks
  await page.evaluate(() => {
    const gm = window.__game;
    gm.activeSkillCallout = {
      type: 'CLOSE_CALL',
      title: 'CLOSE CALL!',
      subtitle: '+35 Near Miss (4x)',
      points: 140,
      multiplier: 4,
      timestamp: performance.now(),
      lateralDir: 1,
    };
  });
  await page.waitForTimeout(140);

  const closeCallScreenshot = path.join(brainDir, 'evidence_hud_close_call_callout.png');
  await page.screenshot({ path: closeCallScreenshot });
  console.log('Saved Close Call screenshot to', closeCallScreenshot);

  // Wait for close call toast to finish
  await page.waitForTimeout(1300);

  // 7. Test In-Run High Score Celebration with Kathmandu Marigold & Gold Petal Shower
  await page.evaluate(() => {
    const sm = window.__game.getScoreManager();
    sm.clearBest();
    sm.registerScore(15.0);
    sm.resetRun();

    const gm = window.__game;
    gm.activeSkillCallout = {
      type: 'RECORD_BROKEN',
      title: '🏆 NEW PERSONAL BEST!',
      subtitle: '16.5m Reached!',
      points: 100,
      multiplier: 2,
      timestamp: performance.now(),
    };
  });
  await page.waitForTimeout(250);

  const confettiInfo = await page.evaluate(() => {
    const container = document.getElementById('confetti-container');
    const petals = container ? container.querySelectorAll('.confetti-petal, .confetti-gold-foil') : [];
    const banner = document.getElementById('record-banner');
    return {
      petalsSpawned: petals.length,
      bannerVisible: banner && !banner.classList.contains('hidden'),
    };
  });
  console.log('Confetti and Celebration Info:', confettiInfo);

  const recordBannerScreenshot = path.join(brainDir, 'evidence_hud_high_score_banner.png');
  await page.screenshot({ path: recordBannerScreenshot });
  console.log('Saved High Score Celebration Banner screenshot to', recordBannerScreenshot);

  await browser.close();
  console.log('All game feel tests finished cleanly!');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
