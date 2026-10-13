const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('================================================================');
  console.log('VERIFYING RUNNER NATURAL MOVEMENT REFACTOR & COIN LANE ISOLATION');
  console.log('================================================================');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 502, height: 751 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // 1. Initial State
  const isReady = await page.evaluate(() => {
    return window.__game && window.__game.getState() === 'READY';
  });
  console.log('Step 1: Game State READY:', isReady);

  // Start run
  await page.click('#ready-banner');
  await page.waitForTimeout(600);

  // TEST 1: COIN COLLECTION LANE ISOLATION
  console.log('\n--- TEST 1: COIN LANE ISOLATION CHECK ---');
  const coinLaneTestResult = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();
    const cm = gm.getCollectibleManager();

    // 1. Position runner strictly in Left lane (X = -2.0, lane = -1)
    player.targetLane = -1;
    player.currentLane = -1;
    player.currentX = -2.0;
    player.lateralVelocity = 0;
    const playerZ = player.currentZ;

    // Clear existing coins and configure a test coin from the real pool in Center lane (lane = 0, X = 0.0)
    cm.reset();
    const testCoin = cm.pool[0];
    const testCoinZ = playerZ - 2.5; // ahead by 2.5m (within magnetic radius 3.5m)
    testCoin.lane = 0;
    testCoin.x = 0.0;
    testCoin.y = 0.75;
    testCoin.baseY = 0.75;
    testCoin.z = testCoinZ;
    testCoin.active = true;
    testCoin.isCollected = false;
    testCoin.isBeingPulled = false;
    testCoin.entity.enabled = true;
    testCoin.shadowEntity.enabled = true;
    cm.activeCoins = [testCoin];

    const initialCoinX = testCoin.x;
    const initialCoinZ = testCoin.z;

    // Simulate update step where player runs forward right past the center coin
    // Player is at X = -2.0. Center coin is at X = 0.0 (dx = -2.0).
    const updateResult1 = cm.update(0.016, player.currentX, player.currentY, player.currentZ, []);
    
    // Snapshot state immediately after Pass 1
    const coinStateAfterPass1 = {
      x: testCoin.x,
      isBeingPulled: testCoin.isBeingPulled,
      isCollected: testCoin.isCollected,
    };

    // Assert: Coin in Center Lane was NOT pulled and NOT collected while runner is in Left Lane!
    const wasLeftLaneProtected = !coinStateAfterPass1.isBeingPulled && !coinStateAfterPass1.isCollected && Math.abs(coinStateAfterPass1.x) < 0.001;

    // Now test legitimate collection: move player into Center Lane (X = 0.0)
    player.currentX = 0.0;
    player.currentLane = 0;
    player.targetLane = 0;
    
    // Simulate player running directly through the center coin
    // Step player close to coin Z
    const updateResult2 = cm.update(0.016, 0.0, player.currentY, testCoinZ + 0.1, []);
    const wasCenterCollected = updateResult2.collectedCount > 0;

    return {
      wasLeftLaneProtected,
      coinStateAfterPass1,
      wasCenterCollected,
      collectedCount: updateResult2.collectedCount,
    };
  });

  console.log('Coin Lane Isolation Results:', coinLaneTestResult);
  if (coinLaneTestResult.wasLeftLaneProtected) {
    console.log('✅ PASS: Center lane coin was completely ignored (NOT pulled, NOT collected) while runner was in Left Lane!');
  } else {
    console.error('❌ FAIL: Center lane coin was pulled or collected across lanes!');
  }
  if (coinLaneTestResult.wasCenterCollected) {
    console.log('✅ PASS: Center lane coin was properly collected when runner ran directly in Center Lane!');
  } else {
    console.error('❌ FAIL: Center lane coin was not collected in matching lane!');
  }

  // TEST 2: LATERAL DODGE SPRING & SKATER BANKING
  console.log('\n--- TEST 2: LATERAL DODGE SPRING & SKATER BANKING ---');
  const lateralMovementData = await page.evaluate(async () => {
    const gm = window.__game;
    const player = gm.getPlayer();

    // Start in center (X = 0)
    player.targetLane = 0;
    player.currentLane = 0;
    player.currentX = 0;
    player.lateralVelocity = 0;
    player.currentBankAngle = 0;

    // Trigger dodge Right (targetLane = 1, targetX = 2.0)
    player.moveRight();

    const frames = [];
    const dt = 0.016; // 60fps frame
    for (let f = 0; f < 35; f++) {
      player.update(dt, true, 4.0);
      frames.push({
        frame: f,
        x: Number(player.currentX.toFixed(3)),
        vx: Number(player.lateralVelocity.toFixed(3)),
        bankAngle: Number(player.currentBankAngle.toFixed(2)),
      });
    }

    const peakVelocity = Math.max(...frames.map(f => Math.abs(f.vx)));
    const peakBank = Math.max(...frames.map(f => Math.abs(f.bankAngle)));
    const finalX = frames[frames.length - 1].x;
    const finalVx = frames[frames.length - 1].vx;
    const finalBank = frames[frames.length - 1].bankAngle;

    return {
      frames: frames.slice(0, 15), // inspect first 15 frames
      peakVelocity,
      peakBank,
      finalX,
      finalVx,
      finalBank,
    };
  });

  console.log('Lateral Spring Trajectory (First 15 frames):');
  console.table(lateralMovementData.frames);
  console.log(`Peak Lateral Velocity: ${lateralMovementData.peakVelocity} m/s`);
  console.log(`Peak Dynamic Bank Angle: ${lateralMovementData.peakBank}°`);
  console.log(`Final Settled X: ${lateralMovementData.finalX} (Target: 2.0m), Final Vx: ${lateralMovementData.finalVx}, Final Bank: ${lateralMovementData.finalBank}°`);

  if (lateralMovementData.peakBank >= 12.0 && Math.abs(lateralMovementData.finalX - 2.0) < 0.05) {
    console.log('✅ PASS: Lateral cut features smooth spring velocity acceleration and responsive skater banking carves up to', lateralMovementData.peakBank, 'degrees!');
  } else {
    console.error('❌ FAIL: Lateral movement does not meet kinetic standards.');
  }

  // TEST 3: ATHLETIC SPRINT STRIDE JOINT ARTICULATION
  console.log('\n--- TEST 3: ATHLETIC SPRINT STRIDE JOINT KINETICS ---');
  const strideKinetics = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();

    // Reset to center run
    player.currentLane = 0;
    player.targetLane = 0;
    player.currentX = 0;
    player.lateralVelocity = 0;
    player.isJumping = false;
    player.isSliding = false;

    // Simulate half a sprint cycle
    const samples = [];
    const dt = 0.02;
    for (let i = 0; i < 35; i++) {
      player.update(dt, true, 4.0);
      samples.push({
        strideTime: Number(player.strideTime.toFixed(2)),
        leftLegPitch: Number((player.leftLegNode?.getLocalEulerAngles().x || 0).toFixed(1)),
        leftKneePitch: Number((player.leftKneeNode?.getLocalEulerAngles().x || 0).toFixed(1)),
        rightKneePitch: Number((player.rightKneeNode?.getLocalEulerAngles().x || 0).toFixed(1)),
        torsoYaw: Number((player.torsoNode?.getLocalEulerAngles().y || 0).toFixed(1)),
        leftArmPitch: Number((player.leftArmNode?.getLocalEulerAngles().x || 0).toFixed(1)),
        leftElbowPitch: Number((player.leftElbowNode?.getLocalEulerAngles().x || 0).toFixed(1)),
      });
    }

    const maxKneeFlex = Math.max(...samples.map(s => Math.max(s.leftKneePitch, s.rightKneePitch)));
    const maxTorsoTwist = Math.max(...samples.map(s => Math.abs(s.torsoYaw)));
    const hasSpineTwist = maxTorsoTwist > 3.0;

    return {
      samples: samples.slice(0, 10),
      maxKneeFlex,
      maxTorsoTwist,
      hasSpineTwist,
    };
  });

  console.log('Sprint Stride Kinetics Samples:');
  console.table(strideKinetics.samples);
  console.log(`Max Knee Flexion: ${strideKinetics.maxKneeFlex}° (Natural sprint heel lift)`);
  console.log(`Max Torso Counter-Twist: ${strideKinetics.maxTorsoTwist}° (Biomechanical spine conservation)`);

  if (strideKinetics.maxKneeFlex >= 45.0 && strideKinetics.hasSpineTwist) {
    console.log('✅ PASS: Sprint stride features authentic high knee drive, heel kick recovery, and spine counter-rotation!');
  } else {
    console.error('❌ FAIL: Sprint stride lacks natural articulation.');
  }

  // TEST 4: PARKOUR VAULT 3-PHASE JUMP & LANDING SQUASH
  console.log('\n--- TEST 4: PARKOUR VAULT 3-PHASE JUMP & LANDING SQUASH ---');
  const jumpPhases = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();

    player.jump();
    const phases = [];
    const dt = 0.04;
    // Step through the jump (approx 0.68s = 17 frames)
    for (let f = 0; f < 22; f++) {
      player.update(dt, true, 4.0);
      phases.push({
        frame: f,
        time: Number(player.jumpElapsedTime.toFixed(2)),
        y: Number(player.currentY.toFixed(3)),
        isJumping: player.isJumping,
        landingSquashTimer: Number(player.landingCompressionTimer.toFixed(3)),
        leftKneeFlex: Number((player.leftKneeNode?.getLocalEulerAngles().x || 0).toFixed(1)),
        torsoPitch: Number((player.torsoNode?.getLocalEulerAngles().x || 0).toFixed(1)),
      });
    }

    const apexHeight = Math.max(...phases.map(p => p.y));
    const landingFrame = phases.find(p => !p.isJumping && p.landingSquashTimer > 0);

    return {
      phases: phases.slice(0, 18),
      apexHeight,
      hasLandingSquash: !!landingFrame,
      landingCompressionTimer: landingFrame ? landingFrame.landingSquashTimer : 0,
    };
  });

  console.log(`Jump Apex Altitude: ${jumpPhases.apexHeight}m (Ground is 0.5m)`);
  console.log(`Landing Kinetic Squash Active: ${jumpPhases.hasLandingSquash} (Squash timer: ${jumpPhases.landingCompressionTimer}s)`);

  if (jumpPhases.apexHeight >= 1.65 && jumpPhases.hasLandingSquash) {
    console.log('✅ PASS: Parkour jump exhibits buoyant hurdle clearance curve and kinetic landing squash absorbing stone impact!');
  } else {
    console.error('❌ FAIL: Jump physics unexpected.');
  }

  // TEST 5: SLIDE MECHANIC & PUSH-OFF RECOVERY
  console.log('\n--- TEST 5: SLIDE MECHANIC & PUSH-OFF RECOVERY ---');
  const slideData = await page.evaluate(() => {
    const gm = window.__game;
    const player = gm.getPlayer();

    player.slide();
    const frames = [];
    const dt = 0.05; // 0.60s total duration = 12 steps
    for (let f = 0; f < 14; f++) {
      player.update(dt, true, 4.0);
      frames.push({
        frame: f,
        time: Number(player.slideElapsedTime.toFixed(2)),
        isSliding: player.isSliding,
        y: Number(player.currentY.toFixed(3)),
        torsoPitch: Number((player.torsoNode?.getLocalEulerAngles().x || 0).toFixed(1)),
        leadLegPitch: Number((player.leftLegNode?.getLocalEulerAngles().x || 0).toFixed(1)),
      });
    }

    const minSlideY = Math.min(...frames.map(f => f.y));
    const recoveryFrame = frames[frames.length - 2];

    return {
      frames,
      minSlideY,
      recoversToStanding: recoveryFrame.y >= 0.48,
    };
  });

  console.log(`Slide Lowest Ground Y: ${slideData.minSlideY}m (vs Normal 0.50m)`);
  console.log(`Recovers Smoothly to Standing Sprint: ${slideData.recoversToStanding}`);

  if (slideData.minSlideY <= 0.35 && slideData.recoversToStanding) {
    console.log('✅ PASS: Low baseball slide crouches under low beam and smoothly recovers into full standing sprint stride!');
  } else {
    console.error('❌ FAIL: Slide trajectory unexpected.');
  }

  // CAPTURE EVIDENCE SCREENSHOTS
  console.log('\n--- CAPTURING VISUAL EVIDENCE SCREENSHOTS ---');
  const brainDir = path.resolve(__dirname);
  
  // 1. Natural Sprint Stride
  await page.evaluate(() => {
    const gm = window.__game;
    const p = gm.getPlayer();
    p.reset();
    gm.setState('RUNNING');
    for (let i = 0; i < 20; i++) p.update(0.016, true, 4.0);
  });
  await page.waitForTimeout(300);
  const sprintShot = path.join(brainDir, 'natural_01_sprint_stride.png');
  await page.screenshot({ path: sprintShot });
  console.log('Captured:', sprintShot);

  // 2. Lateral Skater Carve Bank
  await page.evaluate(() => {
    const gm = window.__game;
    const p = gm.getPlayer();
    p.moveRight();
    for (let i = 0; i < 8; i++) p.update(0.016, true, 4.0); // snapshot at peak banking
  });
  await page.waitForTimeout(100);
  const bankShot = path.join(brainDir, 'natural_02_skater_bank.png');
  await page.screenshot({ path: bankShot });
  console.log('Captured:', bankShot);

  // 3. Parkour Vault Jump Apex
  await page.evaluate(() => {
    const gm = window.__game;
    const p = gm.getPlayer();
    p.jump();
    for (let i = 0; i < 12; i++) p.update(0.025, true, 4.0); // at apex
  });
  await page.waitForTimeout(100);
  const jumpShot = path.join(brainDir, 'natural_03_jump_apex.png');
  await page.screenshot({ path: jumpShot });
  console.log('Captured:', jumpShot);

  // 4. Baseball Slide Low Glide
  await page.evaluate(() => {
    const gm = window.__game;
    const p = gm.getPlayer();
    p.slide();
    for (let i = 0; i < 6; i++) p.update(0.025, true, 4.0); // mid-slide
  });
  await page.waitForTimeout(100);
  const slideShot = path.join(brainDir, 'natural_04_baseball_slide.png');
  await page.screenshot({ path: slideShot });
  console.log('Captured:', slideShot);

  console.log('\nAll tests and screenshots successfully captured!');
  await browser.close();
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
