const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Verifying articulated Lakhey procedural animations...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';
  const page = await browser.newPage({ viewport: { width: 450, height: 800 } });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // 1. Initial Ready State
  const readyPath = path.join(brainDir, 'lakhey_motion_ready.png');
  await page.screenshot({ path: readyPath });
  console.log('Saved ready screenshot to', readyPath);

  // 2. Start running - capture mid-stride chase
  await page.keyboard.press('Space');
  await page.waitForTimeout(1800); // 1.8s in, running full sprint

  const sprintPath = path.join(brainDir, 'lakhey_motion_sprint_chase.png');
  await page.screenshot({ path: sprintPath });
  console.log('Saved running chase screenshot to', sprintPath);

  // 3. Wait for collision and harmless nonviolent catch
  console.log('Waiting for obstacle impact and harmless catch pose...');
  await page.waitForTimeout(2800);

  const catchPath = path.join(brainDir, 'lakhey_motion_friendly_catch.png');
  await page.screenshot({ path: catchPath });
  console.log('Saved harmless catch screenshot to', catchPath);

  // 4. Test instant retry
  console.log('Triggering instant retry...');
  await page.click('#btn-modal-retry');
  await page.waitForTimeout(1200);

  const retryPath = path.join(brainDir, 'lakhey_motion_retry_reset.png');
  await page.screenshot({ path: retryPath });
  console.log('Saved retry reset screenshot to', retryPath);

  await browser.close();
  console.log('All motion verification screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
