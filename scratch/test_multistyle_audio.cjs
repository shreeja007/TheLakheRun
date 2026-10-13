const { chromium } = require('playwright');

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Listen for console messages and uncaught errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser ERROR:', msg.text());
  });
  page.on('pageerror', err => console.error('Page uncaught error:', err));

  console.log('=== Navigating to Lakhey Run Game ===');
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // Start run by pressing Space (unlocks audio context)
  await page.keyboard.press('Space');
  await page.waitForTimeout(1600); // Wait for intro pan

  // Keep distance at 0 so obstacle collisions do not interrupt audio verification
  await page.evaluate(() => window.__game.setDebugDistance(0));

  console.log('=== 1. Direct SoundManager Procedural Synthesis Test ===');
  const directAudioTest = await page.evaluate(() => {
    const s = window.__game.sound;
    const results = {
      jump0: false, jump1: false, jump2: false,
      slide0: false, slide1: false, slide2: false,
      dodge0: false, dodge1: false, dodge2: false,
    };

    try { s.playJumpSound(0); results.jump0 = true; } catch (e) { console.error(e); }
    try { s.playJumpSound(1); results.jump1 = true; } catch (e) { console.error(e); } // Front Flip Somersault
    try { s.playJumpSound(2); results.jump2 = true; } catch (e) { console.error(e); } // Backward Teasing Jump

    try { s.playSlideSound(0); results.slide0 = true; } catch (e) { console.error(e); }
    try { s.playSlideSound(1); results.slide1 = true; } catch (e) { console.error(e); } // Parkour Dive Roll
    try { s.playSlideSound(2); results.slide2 = true; } catch (e) { console.error(e); } // Rockstar Double-Knee Slide

    try { s.playDodgeSound(0); results.dodge0 = true; } catch (e) { console.error(e); }
    try { s.playDodgeSound(1); results.dodge1 = true; } catch (e) { console.error(e); }
    try { s.playDodgeSound(2); results.dodge2 = true; } catch (e) { console.error(e); }

    return results;
  });

  console.log('Direct SoundManager Synthesis Results:', directAudioTest);

  console.log('=== 2. Spying on Live In-Game Audio Dispatch ===');
  // Inject spy counters onto window.__game.sound
  await page.evaluate(() => {
    window.__soundCalls = {
      jumps: [0, 0, 0],
      slides: [0, 0, 0],
      dodges: [0, 0, 0],
    };
    const s = window.__game.sound;
    const origJump = s.playJumpSound.bind(s);
    const origSlide = s.playSlideSound.bind(s);
    const origDodge = s.playDodgeSound.bind(s);

    s.playJumpSound = function(v = 0) {
      window.__soundCalls.jumps[v] = (window.__soundCalls.jumps[v] || 0) + 1;
      return origJump(v);
    };
    s.playSlideSound = function(v = 0) {
      window.__soundCalls.slides[v] = (window.__soundCalls.slides[v] || 0) + 1;
      return origSlide(v);
    };
    s.playDodgeSound = function(v = 0) {
      window.__soundCalls.dodges[v] = (window.__soundCalls.dodges[v] || 0) + 1;
      return origDodge(v);
    };
  });

  console.log('Testing in-game Jump Audio dispatches across all variants...');
  for (let variant = 0; variant <= 2; variant++) {
    await page.evaluate(v => {
      window.__game.setDebugDistance(0);
      window.__game.getPlayer().jump(v);
    }, variant);
    await page.waitForTimeout(650); // wait for jump to finish
  }

  console.log('Testing in-game Slide Audio dispatches across all variants...');
  for (let variant = 0; variant <= 2; variant++) {
    await page.evaluate(v => {
      window.__game.setDebugDistance(0);
      window.__game.getPlayer().slide(v);
    }, variant);
    await page.waitForTimeout(650); // wait for slide to finish
  }

  console.log('Testing in-game Dodge Audio dispatches across all variants...');
  for (let variant = 0; variant <= 2; variant++) {
    await page.evaluate(({ v, idx }) => {
      window.__game.setDebugDistance(0);
      const p = window.__game.getPlayer();
      p.targetLane = 0;
      p.currentLane = 0;
      if (idx % 2 === 0) p.moveLeft(v);
      else p.moveRight(v);
    }, { v: variant, idx: variant });
    await page.waitForTimeout(300);
  }

  const soundCalls = await page.evaluate(() => window.__soundCalls);
  console.log('Recorded in-game sound calls by variant:', soundCalls);

  // Assertions
  const allDirectPassed = Object.values(directAudioTest).every(v => v === true);
  const jumpCallsPassed = soundCalls.jumps[0] >= 1 && soundCalls.jumps[1] >= 1 && soundCalls.jumps[2] >= 1;
  const slideCallsPassed = soundCalls.slides[0] >= 1 && soundCalls.slides[1] >= 1 && soundCalls.slides[2] >= 1;
  const dodgeCallsPassed = soundCalls.dodges[0] >= 1 && soundCalls.dodges[1] >= 1 && soundCalls.dodges[2] >= 1;

  console.log('=== TEST SUMMARY ===');
  console.log('All 9 procedural audio synthesis methods verified:', allDirectPassed);
  console.log('Front Flip Somersault whoosh dispatched:', soundCalls.jumps[1] >= 1);
  console.log('Rockstar Knee Slide stone-skid rasp dispatched:', soundCalls.slides[2] >= 1);
  console.log('Backward Teasing Jump chirp whoosh dispatched:', soundCalls.jumps[2] >= 1);
  console.log('Parkour Dive Roll cushioned whoosh dispatched:', soundCalls.slides[1] >= 1);
  console.log('All in-game movement audio dispatches verified:', jumpCallsPassed && slideCallsPassed && dodgeCallsPassed);

  if (!allDirectPassed || !jumpCallsPassed || !slideCallsPassed || !dodgeCallsPassed) {
    throw new Error('Test assertions failed!');
  }

  console.log('SUCCESS: All multi-style audio whooshes and stone skid sounds verified!');
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
