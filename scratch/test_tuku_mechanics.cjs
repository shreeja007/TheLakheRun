const { chromium } = require('playwright');
const path = require('path');

async function testTukuMechanics() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Capture READY standoff with enhanced Tuku model (eyes, eyebrows, smirk, scarf tail)
  const readyPath = path.resolve(__dirname, 'tuku_01_ready_face_standoff.png');
  await page.screenshot({ path: readyPath });
  console.log('Saved ready standoff screenshot to', readyPath);

  // 2. Start run
  console.log('Starting run...');
  await page.click('#ready-banner');

  // Wait for intro swoop to complete and enter full sprint
  await page.waitForTimeout(1800);

  // Capture athletic sprint stride (bent elbow pump, knee drive, scarf flutter)
  const sprintPath = path.resolve(__dirname, 'tuku_02_athletic_sprint.png');
  await page.screenshot({ path: sprintPath });
  console.log('Saved athletic sprint screenshot to', sprintPath);

  // 3. Test Lane Switching (Dodge Right)
  console.log('Executing sharp lane switch to Right...');
  await page.keyboard.press('ArrowRight');
  // Capture mid-dodge frame (skater bank, knee flex, centrifugal satchel)
  await page.waitForTimeout(140);
  const dodgePath = path.resolve(__dirname, 'tuku_03_lane_dodge_bank.png');
  await page.screenshot({ path: dodgePath });
  console.log('Saved lane dodge bank screenshot to', dodgePath);

  // Switch back to Center lane to prepare for hurdle jump
  await page.waitForTimeout(200);
  console.log('Switching back to Center lane...');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);

  // 4. Test Jump (Parkour Hurdle Vault over center low barrier)
  console.log('Executing parkour hurdle vault in center lane...');
  await page.keyboard.press('Space');
  // Capture mid-air apex hurdle tuck
  await page.waitForTimeout(300);
  const jumpPath = path.resolve(__dirname, 'tuku_04_parkour_jump_apex.png');
  await page.screenshot({ path: jumpPath });
  console.log('Saved parkour jump apex screenshot to', jumpPath);

  // Capture landing impact recovery (kinetic compression)
  await page.waitForTimeout(320);
  const landPath = path.resolve(__dirname, 'tuku_05_landing_impact_squash.png');
  await page.screenshot({ path: landPath });
  console.log('Saved landing impact screenshot to', landPath);

  // 4b. Test Baseball Slide under overhead obstacle
  console.log('Executing baseball slide in center lane...');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(160);
  const slidePath = path.resolve(__dirname, 'tuku_05b_baseball_slide.png');
  await page.screenshot({ path: slidePath });
  console.log('Saved baseball slide screenshot to', slidePath);

  // 5. Inspect Model in viewer_tuku.html
  console.log('Inspecting model in viewer_tuku.html...');
  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Back View (Main Gameplay View)
  await page.evaluate(() => window.setView('back'));
  await page.waitForTimeout(500);
  const viewerBack = path.resolve(__dirname, 'tuku_06b_model_back_gameplay.png');
  await page.screenshot({ path: viewerBack });
  console.log('Saved model back view screenshot to', viewerBack);

  // Front View (shows facial features, eyes, eyebrows, open jacket, scarf)
  await page.evaluate(() => window.setView('front'));
  await page.waitForTimeout(500);
  const viewerFront = path.resolve(__dirname, 'tuku_06_model_front_face.png');
  await page.screenshot({ path: viewerFront });
  console.log('Saved model front view screenshot to', viewerFront);

  // 3/4 Perspective View
  await page.evaluate(() => window.setView('perspective'));
  await page.waitForTimeout(500);
  const viewerPersp = path.resolve(__dirname, 'tuku_07_model_perspective.png');
  await page.screenshot({ path: viewerPersp });
  console.log('Saved model perspective view screenshot to', viewerPersp);

  await browser.close();
  console.log('All Tuku mechanics tests completed successfully!');
}

testTukuMechanics().catch(err => {
  console.error('Error running Tuku mechanics tests:', err);
  process.exit(1);
});
