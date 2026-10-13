const { chromium } = require('playwright');
const path = require('path');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1000 },
    deviceScaleFactor: 2,
  });

  await page.goto('http://localhost:4173/viewer_tuku.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const configs = [
    {
      name: 'candidate_D_athletic_baseball_slide',
      desc: 'Authentic Temple Run athletic slide: drop -0.40m, torso lean-back +28 deg, trail hand bracing low pavement, lead arm shielding chest, head chin tucked -12 deg looking dead ahead',
      fn: `
        const modelRoot = window.__PC_MODEL__;
        const leftLegNode = modelRoot.findByName('LeftLegRoot');
        const rightLegNode = modelRoot.findByName('RightLegRoot');
        const leftKneeNode = modelRoot.findByName('LeftKneeRoot');
        const rightKneeNode = modelRoot.findByName('RightKneeRoot');
        const leftArmNode = modelRoot.findByName('LeftArmRoot');
        const rightArmNode = modelRoot.findByName('RightArmRoot');
        const leftElbowNode = modelRoot.findByName('LeftElbowRoot');
        const rightElbowNode = modelRoot.findByName('RightElbowRoot');
        const torsoNode = modelRoot.findByName('TorsoRoot');
        const headNode = modelRoot.findByName('HeadRoot');
        const satchelNode = modelRoot.findByName('SatchelRoot');
        const scarfTailNode = modelRoot.findByName('ScarfTailRoot');

        const slideDrop = -0.40;
        modelRoot.setLocalPosition(0, slideDrop, 0);

        // Torso leans back in streamlined athletic slide
        torsoNode.setLocalEulerAngles(28, 0, 0);
        
        // Head stays firmly locked forward looking straight down the lane, chin tucked
        headNode.setLocalPosition(0, 1.36 - 0.04, -0.06);
        headNode.setLocalEulerAngles(-12, 0, 0);

        // Lead left leg extended forward gliding along flagstones
        leftLegNode.setLocalEulerAngles(86, 0, 4);
        leftKneeNode.setLocalEulerAngles(0, 0, 0);

        // Trailing right leg folded tightly under hip
        rightLegNode.setLocalEulerAngles(-38, 0, -10);
        rightKneeNode.setLocalEulerAngles(-116, 0, 0);

        // Ground bracing arm (Right): skimming near stone pavement
        rightArmNode.setLocalEulerAngles(32, 0, 34);
        rightElbowNode.setLocalEulerAngles(-26, 0, 0);

        // Counter-balance lead arm (Left): tucked near ribs/lap
        leftArmNode.setLocalEulerAngles(-18, 0, -28);
        leftElbowNode.setLocalEulerAngles(-52, 0, 0);

        satchelNode.setLocalEulerAngles(18, -6, 0);
        scarfTailNode.setLocalEulerAngles(-55, 0, 0);
      `
    },
    {
      name: 'candidate_E_symmetric_aerodynamic_slide',
      desc: 'Temple Run low aerodynamic slide: drop -0.38m, torso lean-back +24 deg, both arms bracing low beside hips, head chin tucked -10 deg looking straight ahead',
      fn: `
        const modelRoot = window.__PC_MODEL__;
        const leftLegNode = modelRoot.findByName('LeftLegRoot');
        const rightLegNode = modelRoot.findByName('RightLegRoot');
        const leftKneeNode = modelRoot.findByName('LeftKneeRoot');
        const rightKneeNode = modelRoot.findByName('RightKneeRoot');
        const leftArmNode = modelRoot.findByName('LeftArmRoot');
        const rightArmNode = modelRoot.findByName('RightArmRoot');
        const leftElbowNode = modelRoot.findByName('LeftElbowRoot');
        const rightElbowNode = modelRoot.findByName('RightElbowRoot');
        const torsoNode = modelRoot.findByName('TorsoRoot');
        const headNode = modelRoot.findByName('HeadRoot');
        const satchelNode = modelRoot.findByName('SatchelRoot');
        const scarfTailNode = modelRoot.findByName('ScarfTailRoot');

        const slideDrop = -0.38;
        modelRoot.setLocalPosition(0, slideDrop, 0);

        // Torso leans back
        torsoNode.setLocalEulerAngles(24, 0, 0);

        // Head firmly looking forward down the lane
        headNode.setLocalPosition(0, 1.36 - 0.03, -0.05);
        headNode.setLocalEulerAngles(-10, 0, 0);

        // Lead left leg extended forward along pavement
        leftLegNode.setLocalEulerAngles(84, 0, 4);
        leftKneeNode.setLocalEulerAngles(-2, 0, 0);

        // Trailing right leg folded tightly under hip
        rightLegNode.setLocalEulerAngles(-36, 0, -8);
        rightKneeNode.setLocalEulerAngles(-112, 0, 0);

        // Both arms low alongside hips, palms skimming pavement
        leftArmNode.setLocalEulerAngles(18, 0, -32);
        leftElbowNode.setLocalEulerAngles(-28, 0, 0);
        rightArmNode.setLocalEulerAngles(18, 0, 32);
        rightElbowNode.setLocalEulerAngles(-28, 0, 0);

        satchelNode.setLocalEulerAngles(14, -8, 0);
        scarfTailNode.setLocalEulerAngles(-48, 0, 0);
      `
    }
  ];

  for (const cfg of configs) {
    await page.evaluate((code) => {
      if (window.toggleAnimation && document.getElementById('btn-anim').className === 'active') {
        window.toggleAnimation();
      }
      eval(code);
    }, cfg.fn);

    // Side
    await page.evaluate(() => window.setView('side'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(__dirname, `${cfg.name}_side.png`) });

    // Back
    await page.evaluate(() => window.setView('back'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(__dirname, `${cfg.name}_back.png`) });

    // Persp
    await page.evaluate(() => window.setView('perspective'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(__dirname, `${cfg.name}_persp.png`) });

    console.log(`Rendered ${cfg.name}`);
  }

  await browser.close();
}

main().catch(console.error);
