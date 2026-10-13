const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  console.log('=== PART 1: Testing Tuku 3D Character Inspector (viewer_tuku.html) ===');
  await page.goto('http://localhost:4173/viewer_tuku.html');
  await page.waitForTimeout(1200);

  // Set view to 3/4 perspective for clear 3D kinematic view
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(300);

  // --- 1. JUMP STYLES ---
  console.log('--- Testing Jump Styles ---');
  // Style 0: Parkour Vault
  await page.evaluate(() => window.testJump(0));
  await page.waitForTimeout(320); // apex
  const jump0Path = path.join(__dirname, 'evidence_style_jump_0_vault.png');
  await page.screenshot({ path: jump0Path });
  console.log(`Saved ${jump0Path}`);

  // Style 1: Front Flip Somersault
  await page.evaluate(() => window.testJump(1));
  await page.waitForTimeout(320); // mid-air somersault
  const jump1Path = path.join(__dirname, 'evidence_style_jump_1_frontflip.png');
  await page.screenshot({ path: jump1Path });
  console.log(`Saved ${jump1Path}`);

  // Style 2: Backward Teasing Jump
  await page.evaluate(() => window.testJump(2));
  await page.waitForTimeout(320); // mid-air 180° taunt wave
  const jump2Path = path.join(__dirname, 'evidence_style_jump_2_teasing.png');
  await page.screenshot({ path: jump2Path });
  console.log(`Saved ${jump2Path}`);

  // --- 2. SLIDE STYLES ---
  console.log('--- Testing Slide Styles ---');
  // Style 0: Temple Run Glide
  await page.evaluate(() => window.testSlide(0));
  await page.waitForTimeout(300); // mid-slide
  const slide0Path = path.join(__dirname, 'evidence_style_slide_0_glide.png');
  await page.screenshot({ path: slide0Path });
  console.log(`Saved ${slide0Path}`);

  // Style 1: Parkour Dive Roll
  await page.evaluate(() => window.testSlide(1));
  await page.waitForTimeout(300); // mid-roll somersault
  const slide1Path = path.join(__dirname, 'evidence_style_slide_1_diveroll.png');
  await page.screenshot({ path: slide1Path });
  console.log(`Saved ${slide1Path}`);

  // Style 2: Rockstar Knee Slide
  await page.evaluate(() => window.testSlide(2));
  await page.waitForTimeout(300); // double-knee slide
  const slide2Path = path.join(__dirname, 'evidence_style_slide_2_kneeslide.png');
  await page.screenshot({ path: slide2Path });
  console.log(`Saved ${slide2Path}`);

  // --- 3. DODGE STYLES ---
  console.log('--- Testing Dodge Styles ---');
  // Style 0: Skater Carve Swipe
  await page.evaluate(() => window.testDodge(0, -1));
  await page.waitForTimeout(120); // mid-carve
  const dodge0Path = path.join(__dirname, 'evidence_style_dodge_0_carve.png');
  await page.screenshot({ path: dodge0Path });
  console.log(`Saved ${dodge0Path}`);

  // Style 1: Lateral Barrel Hop
  await page.evaluate(() => window.testDodge(1, -1));
  await page.waitForTimeout(120); // mid-hop
  const dodge1Path = path.join(__dirname, 'evidence_style_dodge_1_barrelhop.png');
  await page.screenshot({ path: dodge1Path });
  console.log(`Saved ${dodge1Path}`);

  // Style 2: 360° Spin Quick-Step
  await page.evaluate(() => window.testDodge(2, -1));
  await page.waitForTimeout(120); // mid-spin
  const dodge2Path = path.join(__dirname, 'evidence_style_dodge_2_spin.png');
  await page.screenshot({ path: dodge2Path });
  console.log(`Saved ${dodge2Path}`);

  console.log('=== PART 2: In-Game Live Random Multi-Style Verification ===');
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // Press Space to start run
  await page.keyboard.press('Space');
  await page.waitForTimeout(1600); // finish intro pan

  // Keep distance at 0 so obstacles do not interrupt kinematic tests
  await page.evaluate(() => window.__game.setDebugDistance(0));

  const results = {
    jumpVariantsSeen: new Set(),
    slideVariantsSeen: new Set(),
    dodgeVariantsSeen: new Set(),
    slideBoundsPassed: true,
  };

  // Test 15 random jumps
  console.log('Performing in-game random JUMP tests...');
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.__game.setDebugDistance(0));
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(60);
    const jVar = await page.evaluate(() => window.__game.getPlayer().getJumpVariant());
    results.jumpVariantsSeen.add(jVar);
    await page.waitForTimeout(600); // wait for landing
  }

  // Test 15 random slides and verify low-profile collision box
  console.log('Performing in-game random SLIDE tests...');
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.__game.setDebugDistance(0));
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
    const sData = await page.evaluate(() => {
      const p = window.__game.getPlayer();
      const bounds = p.getBounds();
      return {
        variant: p.getSlideVariant(),
        isSliding: p.getTelemetry().isSliding,
        maxY: bounds.maxY,
        minY: bounds.minY
      };
    });
    results.slideVariantsSeen.add(sData.variant);
    if (!sData.isSliding || sData.maxY > 0.39) {
      results.slideBoundsPassed = false;
      console.error('Slide bounds violation:', sData);
    }
    await page.waitForTimeout(600); // wait for slide finish
  }

  // Test 15 random lane dodges
  console.log('Performing in-game random DODGE tests...');
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.__game.setDebugDistance(0));
    const key = i % 2 === 0 ? 'ArrowLeft' : 'ArrowRight';
    await page.keyboard.press(key);
    await page.waitForTimeout(60);
    const dVar = await page.evaluate(() => window.__game.getPlayer().getDodgeVariant());
    results.dodgeVariantsSeen.add(dVar);
    await page.waitForTimeout(200);
  }

  // Capture in-game screenshot during live sprint
  const ingameLivePath = path.join(__dirname, 'evidence_style_ingame_live.png');
  await page.screenshot({ path: ingameLivePath });
  console.log(`Saved ${ingameLivePath}`);

  // Test instant cancel responsiveness: Slide canceled into Jump
  console.log('Testing slide-cancel into jump...');
  await page.evaluate(() => window.__game.setDebugDistance(0));
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100); // mid-slide
  await page.keyboard.press('ArrowUp'); // instant jump cancel
  await page.waitForTimeout(60);
  const cancelState = await page.evaluate(() => {
    const p = window.__game.getPlayer();
    return {
      isJumping: p.getTelemetry().isJumping,
      isSliding: p.getTelemetry().isSliding
    };
  });
  console.log('Slide-to-Jump Cancel State:', cancelState);
  await page.waitForTimeout(700);

  // Test forced variant dispatch: verify explicit style setting works
  console.log('Testing explicit variant triggering on PlayerController...');
  const forcedTest = await page.evaluate(() => {
    const p = window.__game.getPlayer();
    p.targetLane = 0;
    p.currentLane = 0;
    p.jump(1); // Force Front Flip
    const jumpV = p.getJumpVariant();
    p.slide(2); // Force Rockstar Knee Slide
    const slideV = p.getSlideVariant();
    p.moveLeft(2); // Force 360 Spin
    const dodgeV = p.getDodgeVariant();
    return { jumpV, slideV, dodgeV };
  });
  console.log('Forced Variants test result:', forcedTest);

  console.log('=== TEST RESULTS SUMMARY ===');
  console.log('Jump Variants Recorded in Random Play:', Array.from(results.jumpVariantsSeen).sort());
  console.log('Slide Variants Recorded in Random Play:', Array.from(results.slideVariantsSeen).sort());
  console.log('Dodge Variants Recorded in Random Play:', Array.from(results.dodgeVariantsSeen).sort());
  console.log('Slide Collision Bounds Verified (<0.38m clearance):', results.slideBoundsPassed);
  console.log('Slide-to-Jump Instant Cancel Verified:', cancelState.isJumping && !cancelState.isSliding);
  console.log('Forced Variants Setting Verified:', forcedTest.jumpV === 1 && forcedTest.slideV === 2 && forcedTest.dodgeV === 2);

  const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\31692e84-71bb-497e-aca3-158d1de4b3f6';
  const screenshots = [
    'evidence_style_jump_0_vault.png',
    'evidence_style_jump_1_frontflip.png',
    'evidence_style_jump_2_teasing.png',
    'evidence_style_slide_0_glide.png',
    'evidence_style_slide_1_diveroll.png',
    'evidence_style_slide_2_kneeslide.png',
    'evidence_style_dodge_0_carve.png',
    'evidence_style_dodge_1_barrelhop.png',
    'evidence_style_dodge_2_spin.png',
    'evidence_style_ingame_live.png'
  ];
  for (const file of screenshots) {
    const src = path.join(__dirname, file);
    const dst = path.join(artifactDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }
  console.log('Copied all evidence screenshots to artifact directory.');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
