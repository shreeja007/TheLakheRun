const { chromium } = require('playwright');
const path = require('path');

async function testLakheyMechanics() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // =========================================================================
  // PART 1: Model & Kinematics Inspection in viewer_lakhey.html
  // =========================================================================
  const pageViewer = await browser.newPage({
    viewport: { width: 640, height: 800 }
  });

  console.log('Navigating to http://localhost:4173/viewer_lakhey.html ...');
  await pageViewer.goto('http://localhost:4173/viewer_lakhey.html', { waitUntil: 'networkidle' });
  await pageViewer.waitForTimeout(2000);

  // 1. Front View
  await pageViewer.evaluate(() => window.setView('front'));
  await pageViewer.waitForTimeout(500);
  const frontPath = path.resolve(__dirname, 'lakhey_01_model_front.png');
  await pageViewer.screenshot({ path: frontPath });
  console.log('Saved front model screenshot to', frontPath);

  // 2. 3/4 Hero Perspective View
  await pageViewer.evaluate(() => window.setView('perspective'));
  await pageViewer.waitForTimeout(500);
  const heroPath = path.resolve(__dirname, 'lakhey_02_model_perspective.png');
  await pageViewer.screenshot({ path: heroPath });
  console.log('Saved perspective model screenshot to', heroPath);

  // 3. Side Profile View
  await pageViewer.evaluate(() => window.setView('side'));
  await pageViewer.waitForTimeout(500);
  const sidePath = path.resolve(__dirname, 'lakhey_03_model_side.png');
  await pageViewer.screenshot({ path: sidePath });
  console.log('Saved side model screenshot to', sidePath);

  // 4. Rear Chase View
  await pageViewer.evaluate(() => window.setView('chase_view'));
  await pageViewer.waitForTimeout(500);
  const rearPath = path.resolve(__dirname, 'lakhey_04_model_rear.png');
  await pageViewer.screenshot({ path: rearPath });
  console.log('Saved rear model screenshot to', rearPath);

  // 5. Test Running Stride Animation in Viewer
  console.log('Testing running stride animation in viewer...');
  await pageViewer.evaluate(() => {
    window.setView('perspective');
    window.toggleAnimation();
  });
  await pageViewer.waitForTimeout(650); // Mid-stride frame
  const animPath = path.resolve(__dirname, 'lakhey_05_stride_animation.png');
  await pageViewer.screenshot({ path: animPath });
  console.log('Saved stride animation screenshot to', animPath);

  await pageViewer.close();

  // =========================================================================
  // PART 2: In-Game Chase Dynamics in main game (http://localhost:4173)
  // =========================================================================
  const pageGame = await browser.newPage({
    viewport: { width: 500, height: 750 }
  });

  console.log('Navigating to http://localhost:4173 ...');
  await pageGame.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await pageGame.waitForTimeout(2000);

  // 1. Ready Standoff (Lakhey facing Tuku across the street)
  const standoffPath = path.resolve(__dirname, 'lakhey_06_ingame_standoff.png');
  await pageGame.screenshot({ path: standoffPath });
  console.log('Saved ingame standoff screenshot to', standoffPath);

  // 2. Start Chase
  console.log('Starting run...');
  await pageGame.click('#ready-banner');
  // Allow intro swoop to finish and enter running stride
  await pageGame.waitForTimeout(1800);

  // Capture Lakhey giving chase at tracking distance
  const chasePath = path.resolve(__dirname, 'lakhey_07_ingame_chase_stride.png');
  await pageGame.screenshot({ path: chasePath });
  console.log('Saved ingame chase stride screenshot to', chasePath);

  // 3. Trigger Game Over / Friendly Catch by steering into left wall barrier
  console.log('Steering into left obstacle to trigger nonviolent guardian catch...');
  await pageGame.keyboard.press('ArrowLeft');
  // Wait for collision registration and Lakhey closing in to 1.2m catch distance
  await pageGame.waitForTimeout(1400);

  const catchPath = path.resolve(__dirname, 'lakhey_08_ingame_friendly_catch.png');
  await pageGame.screenshot({ path: catchPath });
  console.log('Saved ingame catch screenshot to', catchPath);

  await pageGame.close();
  await browser.close();
  console.log('All Lakhey mechanics and visual tests completed successfully!');
}

testLakheyMechanics().catch(err => {
  console.error('Error running testLakheyMechanics:', err);
  process.exit(1);
});
