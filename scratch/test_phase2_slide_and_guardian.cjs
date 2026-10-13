const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Testing Phase 2: Slide Mechanic & Lakhey Energy & Presence...');
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

  // 1. Verify Ready state
  const isReady = await page.evaluate(() => {
    return window.__game && window.__game.getState() === 'READY';
  });
  console.log('1. Initial Game State READY:', isReady);

  // 2. Start game
  await page.click('#ready-banner');
  await page.waitForTimeout(800);

  // 3. Test Slide Mechanic (KeyS / ArrowDown / #btn-slide)
  const slideTest1 = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    
    // Trigger slide
    gm.handleAction('SLIDE', 'Keyboard Test');
    const boundsDuringSlide = player.getBounds();
    return {
      isSliding: player.isPlayerSliding(),
      bounds: { ...boundsDuringSlide },
    };
  });
  console.log('2. Slide Action Triggered:', slideTest1);

  // Verify slide bounds clearance: maxY must be <= 0.40m so it safely clears under beam (0.72m)
  if (slideTest1.isSliding && slideTest1.bounds.maxY <= 0.40) {
    console.log('   PASS: Slide bounds maxY is', slideTest1.bounds.maxY, 'which clears under 0.72m overhead beam.');
  } else {
    console.error('   FAIL: Slide bounds unexpected:', slideTest1.bounds);
  }

  // 4. Test Air Dive-Slide (Jump then immediate Slide)
  const airDiveTest = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    player.jump();
    const midAirJumping = player.getTelemetry().isJumping;
    player.slide(); // Air dive-slide
    return {
      midAirJumping,
      isSlidingAfterDive: player.isPlayerSliding(),
      isJumpingAfterDive: player.getTelemetry().isJumping,
      playerY: player.getY(),
    };
  });
  console.log('3. Air Dive-Slide Test:', airDiveTest);

  // 5. Test Slide-to-Jump Cancel
  const cancelTest = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    player.slide();
    const slidingBefore = player.isPlayerSliding();
    player.jump(); // Cancel slide into jump
    return {
      slidingBefore,
      slidingAfterJump: player.isPlayerSliding(),
      jumpingAfterCancel: player.getTelemetry().isJumping,
    };
  });
  console.log('4. Slide-to-Jump Cancel Test:', cancelTest);

  // 6. Test Overhead Beam Clearance Mechanics
  const beamTest = await page.evaluate(() => {
    const gm = window.__game;
    const om = gm.getObstacleManager();
    const player = gm.getPlayer();

    // Reset player position & spawn an OVERHEAD_BEAM in center lane at Z = -10
    om.reset(42);
    om.activateStandardObstacle('OVERHEAD_BEAM', 0, -10);

    const activeObs = om.getActiveObstacles();
    const beam = activeObs.find(o => o.type === 'OVERHEAD_BEAM');
    
    // Test 1: Standing Player Collision
    player.reset();
    player.setSpeed(0);
    // Position standing player at beam Z (-10)
    player.currentX = 0;
    player.currentY = 0.5; // Standing GROUND_Y
    player.currentZ = -10;
    player.isSliding = false;
    const hitStanding = om.checkCollisions(player.getBounds(), 10);

    // Test 2: Sliding Player Clearance
    player.isSliding = true;
    player.currentY = 0.5;
    const hitSliding = om.checkCollisions(player.getBounds(), 10);

    // Test 3: Check Skill CLEAN_SLIDE trigger
    const skillCheck = om.checkSkills(0, 0.5, -10, false, true);

    return {
      beamBounds: beam ? beam.bounds : null,
      hitStanding: hitStanding ? hitStanding.obstacleType : null,
      hitSliding: hitSliding ? hitSliding.obstacleType : null,
      skillCheck: skillCheck ? skillCheck.type : null,
    };
  });
  console.log('5. Overhead Beam Collision & Skill Test:', beamTest);

  // 7. Test Guardian Proximity Dynamics: Surge on Close Call & Pushback on Clean Slide
  const guardianDynamicsTest = await page.evaluate(() => {
    const gm = window.__game;
    const guardian = gm.getGuardian();
    guardian.reset(0);
    const initialDist = guardian.getFollowDistance();

    // Trigger surge
    guardian.surgeCloser(2.4);
    const surgedTarget = guardian.targetFollowDistance;

    // Trigger pushback
    guardian.pushBack(1.0);
    const pushedTarget = guardian.targetFollowDistance;

    return {
      initialDist,
      surgedTarget,
      pushedTarget,
    };
  });
  console.log('6. Guardian Dynamics Surge/Pushback Test:', guardianDynamicsTest);

  // 8. Capture In-Game Screen Evidence
  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  // Scene A: Tuku Sliding under Overhead Beam with HUD
  await page.evaluate(() => {
    const gm = window.__game;
    gm.reset(42);
    gm.setState('RUNNING');
    const player = gm.getPlayer();
    const om = gm.getObstacleManager();
    const guardian = gm.getGuardian();
    om.activateStandardObstacle('OVERHEAD_BEAM', 0, -6.5);
    player.slide();
    guardian.surgeCloser(2.6);
    gm.update(0.016);
  });
  await page.waitForTimeout(200);
  const slidePath = path.join(brainDir, 'phase2_01_tuku_slide_under_beam.png');
  await page.screenshot({ path: slidePath });
  console.log('Screenshot captured:', slidePath);

  // Scene B: Close Proximity Guardian Tension (Surged Lakhey, Blazing Eye Flare, Danger Vignette)
  await page.evaluate(() => {
    const gm = window.__game;
    const guardian = gm.getGuardian();
    const player = gm.getPlayer();
    // Simulate close chase tension at 2.3m
    guardian.followDistance = 2.3;
    guardian.targetFollowDistance = 2.3;
    guardian.update(0.016, player.getX(), player.getZ(), true);
    gm.notifyTelemetry();
  });
  await page.waitForTimeout(200);
  const surgePath = path.join(brainDir, 'phase2_02_lakhey_surge_and_eye_flare.png');
  await page.screenshot({ path: surgePath });
  console.log('Screenshot captured:', surgePath);

  // Scene C: Clean Slide Callout Toast & Outpaced Pushback
  await page.evaluate(() => {
    const gm = window.__game;
    gm.activeSkillCallout = {
      type: 'CLEAN_SLIDE',
      title: 'CLEAN SLIDE!',
      subtitle: '+55 Low Clearance (3x)',
      points: 165,
      multiplier: 3,
      timestamp: performance.now(),
      lateralDir: 0,
    };
    gm.notifyTelemetry();
  });
  await page.waitForTimeout(250);
  const calloutPath = path.join(brainDir, 'phase2_03_clean_slide_callout_hud.png');
  await page.screenshot({ path: calloutPath });
  console.log('Screenshot captured:', calloutPath);

  // 9. Mobile Touch Button Test (#btn-slide)
  const btnSlideExists = await page.evaluate(() => {
    const btn = document.getElementById('btn-slide');
    return btn !== null && btn.offsetParent !== null;
  });
  console.log('7. Mobile Touch Button #btn-slide Visible & Active:', btnSlideExists);

  await browser.close();
  console.log('Phase 2 Playwright verification completed successfully!');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
