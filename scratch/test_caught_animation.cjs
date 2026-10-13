const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCaughtAnimation() {
  console.log('--- Testing Lakhey Friendly Catch & Hoist Animation ---');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 480, height: 850 }, // Portrait mobile viewport
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
  });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  // 1. Initial Ready state
  const stateReady = await page.evaluate(() => window.__game.getState());
  console.log('Initial State:', stateReady);
  if (stateReady !== 'READY') throw new Error(`Expected READY, got ${stateReady}`);

  // 2. Start Run via Space
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);

  const stateRunning = await page.evaluate(() => window.__game.getState());
  console.log('Run Started State:', stateRunning);

  // 3. Wait until collision with first obstacle (at ~3.2s)
  console.log('Waiting for collision...');
  let caughtReached = false;
  const startTime = Date.now();
  while (Date.now() - startTime < 6000) {
    const s = await page.evaluate(() => window.__game.getState());
    if (s === 'CAUGHT') {
      caughtReached = true;
      break;
    }
    await page.waitForTimeout(50);
  }

  if (!caughtReached) {
    throw new Error('Never reached CAUGHT state within 6s');
  }
  console.log('SUCCESS: Entered CAUGHT state!');

  // 4. Verify that gameover-modal is still HIDDEN during CAUGHT sequence
  const isModalHiddenDuringCaught = await page.evaluate(() => {
    const modal = document.getElementById('gameover-modal');
    return modal ? modal.classList.contains('hidden') : false;
  });
  console.log('Is modal hidden during CAUGHT state?', isModalHiddenDuringCaught);
  if (!isModalHiddenDuringCaught) {
    throw new Error('FAIL: Modal should NOT be visible during CAUGHT sequence!');
  }

  // 5. Capture Phase 1: Scoop & Lift (~0.4s into sequence)
  await page.waitForTimeout(400);
  const p1Evidence = path.resolve(__dirname, 'evidence_caught_01_scoop.png');
  await page.screenshot({ path: p1Evidence });
  console.log('Captured Phase 1 (Scoop & Lift):', p1Evidence);

  // 6. Capture Phase 2: Hoist High & Twirl (~1.2s into sequence)
  await page.waitForTimeout(800);
  const p2Evidence = path.resolve(__dirname, 'evidence_caught_02_hoist_twirl.png');
  await page.screenshot({ path: p2Evidence });
  console.log('Captured Phase 2 (Hoist & Twirl):', p2Evidence);

  // 7. Capture Phase 3: Grand Tableau (~2.0s into sequence)
  await page.waitForTimeout(800);
  const p3Evidence = path.resolve(__dirname, 'evidence_caught_03_tableau.png');
  await page.screenshot({ path: p3Evidence });
  console.log('Captured Phase 3 (Grand Tableau):', p3Evidence);

  // 8. Wait for caught sequence to conclude and transition to GAME_OVER
  console.log('Waiting for transition to GAME_OVER...');
  let gameOverReached = false;
  const goStartTime = Date.now();
  while (Date.now() - goStartTime < 3000) {
    const s = await page.evaluate(() => window.__game.getState());
    if (s === 'GAME_OVER') {
      gameOverReached = true;
      break;
    }
    await page.waitForTimeout(50);
  }

  if (!gameOverReached) {
    throw new Error('Never reached GAME_OVER state after CAUGHT sequence');
  }
  console.log('SUCCESS: Entered GAME_OVER state after animation complete!');

  // 9. Verify that modal is now visible
  const isModalVisible = await page.evaluate(() => {
    const modal = document.getElementById('gameover-modal');
    return modal ? !modal.classList.contains('hidden') : false;
  });
  console.log('Is modal visible in GAME_OVER state?', isModalVisible);
  if (!isModalVisible) {
    throw new Error('FAIL: Modal should be visible now!');
  }

  const p4Evidence = path.resolve(__dirname, 'evidence_caught_04_modal_revealed.png');
  await page.screenshot({ path: p4Evidence });
  console.log('Captured Phase 4 (Challenge Again Modal):', p4Evidence);

  // 10. Click "Challenge Again" button and verify retry
  console.log('Clicking Challenge Again button...');
  await page.click('#btn-modal-retry');
  await page.waitForTimeout(600);

  const retryState = await page.evaluate(() => window.__game.getState());
  console.log('State after Challenge Again click:', retryState);
  if (retryState !== 'RUNNING') {
    throw new Error(`Expected RUNNING on retry, got ${retryState}`);
  }

  const p5Evidence = path.resolve(__dirname, 'evidence_caught_05_restarted.png');
  await page.screenshot({ path: p5Evidence });
  console.log('Captured Phase 5 (Restarted Run):', p5Evidence);

  await browser.close();
  console.log('--- All Caught Sequence Tests Passed Successfully! ---');
}

testCaughtAnimation().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
