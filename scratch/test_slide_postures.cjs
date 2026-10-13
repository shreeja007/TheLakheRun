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

  // We will inject a function to apply specific slide parameters and take screenshots
  const configs = [
    {
      name: 'candidate_A_temple_run_lean_back',
      desc: 'Temple Run classic feet-first slide: torso lean-back +24 deg, lead leg forward, trail leg tucked under, head level looking forward',
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

        const slideDrop = -0.34;
        modelRoot.setLocalPosition(0, slideDrop, 0);

        // Torso leans back in athletic low slide
        torsoNode.setLocalEulerAngles(26, 0, 0);
        // Head stays level looking forward down the track, eyes sharp ahead
        headNode.setLocalPosition(0, 1.36 - 0.04, -0.05);
        headNode.setLocalEulerAngles(-4, 0, 0);

        // Lead leg (Left) extended straight forward along ground
        leftLegNode.setLocalEulerAngles(78, 0, 4);
        leftKneeNode.setLocalEulerAngles(-4, 0, 0);

        // Trailing leg (Right) tucked tightly under hip
        rightLegNode.setLocalEulerAngles(-32, 0, -8);
        rightKneeNode.setLocalEulerAngles(-98, 0, 0);

        // Arms: Left arm bracing low near ground/hip, Right arm counter-balancing low
        leftArmNode.setLocalEulerAngles(28, 0, -28);
        leftElbowNode.setLocalEulerAngles(-35, 0, 0);
        rightArmNode.setLocalEulerAngles(-24, 0, 24);
        rightElbowNode.setLocalEulerAngles(-30, 0, 0);

        satchelNode.setLocalEulerAngles(14, -8, 0);
        scarfTailNode.setLocalEulerAngles(-42, 0, 0);
      `
    },
    {
      name: 'candidate_B_low_kneeling_athletic_slide',
      desc: 'Subway Surfers / Temple Run low sprint slide: torso forward tuck -28 deg, head raised looking straight ahead (-4 deg relative to horizon), knees tucked low',
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

        const slideDrop = -0.35;
        modelRoot.setLocalPosition(0, slideDrop, 0);

        // Torso forward tuck
        torsoNode.setLocalEulerAngles(-28, 0, 0);
        // Head tracks horizon (looking forward down the path, NOT bent back!)
        headNode.setLocalPosition(0, 1.36 + 0.02, 0.04);
        headNode.setLocalEulerAngles(-6, 0, 0);

        // Lead leg (Left) sliding forward
        leftLegNode.setLocalEulerAngles(74, 0, 4);
        leftKneeNode.setLocalEulerAngles(-6, 0, 0);

        // Trailing leg (Right) folded beneath
        rightLegNode.setLocalEulerAngles(-38, 0, -6);
        rightKneeNode.setLocalEulerAngles(-102, 0, 0);

        // Bracing arms low to pavement
        leftArmNode.setLocalEulerAngles(-35, 0, -25);
        leftElbowNode.setLocalEulerAngles(-25, 0, 0);
        rightArmNode.setLocalEulerAngles(22, 0, 22);
        rightElbowNode.setLocalEulerAngles(-35, 0, 0);

        satchelNode.setLocalEulerAngles(16, -10, 0);
        scarfTailNode.setLocalEulerAngles(-55, 0, 0);
      `
    },
    {
      name: 'candidate_C_temple_run_streamlined',
      desc: 'Streamlined Temple Run baseball slide: slideDrop -0.36m, torso lean-back +18 deg, lead leg gliding 82 deg, trail leg bent under -110 deg, head chin tucked -8 deg forward',
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

        const slideDrop = -0.36;
        modelRoot.setLocalPosition(0, slideDrop, 0);

        // Moderate athletic lean-back
        torsoNode.setLocalEulerAngles(18, 0, 0);
        // Head directly aligned with neck, chin tucked, eyes straight forward
        headNode.setLocalPosition(0, 1.36 - 0.02, -0.03);
        headNode.setLocalEulerAngles(-8, 0, 0);

        // Lead left leg straight out skimming stone pavement
        leftLegNode.setLocalEulerAngles(82, 0, 3);
        leftKneeNode.setLocalEulerAngles(-2, 0, 0);

        // Trailing right leg folded tightly under hip
        rightLegNode.setLocalEulerAngles(-34, 0, -8);
        rightKneeNode.setLocalEulerAngles(-108, 0, 0);

        // Both arms down low for ground skim & balance
        leftArmNode.setLocalEulerAngles(20, 0, -32);
        leftElbowNode.setLocalEulerAngles(-22, 0, 0);
        rightArmNode.setLocalEulerAngles(26, 0, 32);
        rightElbowNode.setLocalEulerAngles(-24, 0, 0);

        satchelNode.setLocalEulerAngles(10, -6, 0);
        scarfTailNode.setLocalEulerAngles(-45, 0, 0);
      `
    }
  ];

  for (const cfg of configs) {
    // Apply candidate
    await page.evaluate((code) => {
      // Pause runner
      if (window.toggleAnimation && document.getElementById('btn-anim').className === 'active') {
        window.toggleAnimation();
      }
      eval(code);
    }, cfg.fn);

    // View Side
    await page.evaluate(() => window.setView('side'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(__dirname, `${cfg.name}_side.png`) });

    // View Back (gameplay)
    await page.evaluate(() => window.setView('back'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(__dirname, `${cfg.name}_back.png`) });

    // View 3/4 Perspective
    await page.evaluate(() => window.setView('perspective'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(__dirname, `${cfg.name}_persp.png`) });

    console.log(`Rendered ${cfg.name}`);
  }

  await browser.close();
}

main().catch(console.error);
