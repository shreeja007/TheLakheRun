const { chromium } = require('playwright');
const path = require('path');

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 500, height: 780 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));
  page.on('pageerror', err => consoleLogs.push('ERROR: ' + err.message));

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const artifactDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  // 1. Initial Ready State with glowing Lakhey eyes and Kathmandu architecture
  console.log('Capturing Initial State...');
  await page.screenshot({ path: path.join(artifactDir, 'sound_refactor_initial_state.png') });

  // 2. Start Run & test Audio Unlock
  console.log('Starting run...');
  await page.click('#ready-banner');
  await page.waitForTimeout(1500);

  // Read telemetry speed and state
  const speedText = await page.textContent('#speed-val');
  const gameState = await page.textContent('#game-state');
  console.log(`Current State: ${gameState}, Speed: ${speedText}`);

  // Test lane dodging and athletic jump
  await page.click('#btn-left');
  await page.waitForTimeout(300);
  await page.click('#btn-jump');
  await page.waitForTimeout(200);

  await page.screenshot({ path: path.join(artifactDir, 'sound_refactor_airborne_stride.png') });

  // Test Audio Button Mute/Unmute
  console.log('Testing Audio Toggle...');
  await page.click('#btn-audio-toggle');
  await page.waitForTimeout(200);
  const audioLabelMuted = await page.textContent('#audio-label');
  console.log(`Audio after toggle: ${audioLabelMuted}`);

  await page.click('#btn-audio-toggle');
  await page.waitForTimeout(200);
  const audioLabelUnmuted = await page.textContent('#audio-label');
  console.log(`Audio after toggle back: ${audioLabelUnmuted}`);

  // Let run continue until collision / challenge over
  console.log('Waiting for obstacle encounter and danger proximity...');
  let state = await page.textContent('#game-state');
  let waited = 0;
  while (state === 'RUNNING' && waited < 6500) {
    await page.waitForTimeout(500);
    waited += 500;
    state = await page.textContent('#game-state');
  }

  console.log(`State after wait: ${state}`);
  await page.waitForTimeout(800); // Allow modal animation
  await page.screenshot({ path: path.join(artifactDir, 'sound_refactor_gameover_modal.png') });

  // 4. Test Instant Retry
  console.log('Testing Instant Retry...');
  await page.click('#btn-modal-retry');
  await page.waitForTimeout(800);
  const stateAfterRetry = await page.textContent('#game-state');
  console.log(`State after retry: ${stateAfterRetry}`);

  await page.screenshot({ path: path.join(artifactDir, 'sound_refactor_after_retry.png') });

  console.log('Console Logs during test:', consoleLogs);

  await browser.close();
  console.log('Sound & Intensity Test completed successfully.');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
