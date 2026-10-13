const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Testing Cinematic Intro with Street Facades behind Lakhey...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // Position tile behind and add warm festival lantern light
  await page.evaluate(() => {
    const app = window.__pcApp;
    const cam = app.root.findByName('MainCamera');
    const Vec3 = cam.getPosition().constructor;
    const Entity = cam.constructor;
    const Color = cam.camera.clearColor.constructor;

    // Move one road tile behind the start (Z = +30)
    const roadRoot = app.root.findByName('RoadRoot');
    if (roadRoot && roadRoot.children.length > 4) {
      roadRoot.children[4].setPosition(0, 0, 30);
    }

    // Add a warm festival lantern spotlight from front-left
    const frontFill = new Entity('IntroFrontLight');
    frontFill.addComponent('light', {
      type: 'directional',
      color: new Color(1.0, 0.85, 0.6),
      intensity: 1.6,
      castShadows: false,
    });
    frontFill.setEulerAngles(35, -150, 0); // Illuminates their faces from front-right
    app.root.addChild(frontFill);

    // Continuous camera position during READY
    app.on('update', () => {
      if (window.__game && window.__game.getState() === 'READY') {
        // Dramatic low-angle front-3/4 cinematic composition
        cam.setPosition(2.0, 1.35, -2.5);
        cam.lookAt(new Vec3(-0.15, 1.25, 1.8));
      }
    }, null, 100);
  });

  await page.waitForTimeout(500);

  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';
  const screenshotPath = path.join(brainDir, 'test_intro_with_facades.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved test intro with facades screenshot to:', screenshotPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
