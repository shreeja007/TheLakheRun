const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Verifying T012 Audio, HUD and Game Feel...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const brainDir = 'C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca';

  // 1. Desktop Full HUD Verification (1200x800)
  const desktopPage = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await desktopPage.goto('http://localhost:4173/');
  await desktopPage.waitForTimeout(1000);

  const desktopReady = path.join(brainDir, 't012_hud_desktop_ready.png');
  await desktopPage.screenshot({ path: desktopReady });
  console.log('Saved desktop ready screenshot to', desktopReady);

  // Toggle audio on desktop
  await desktopPage.click('#btn-audio-toggle');
  const audioText = await desktopPage.textContent('#audio-label');
  console.log('Audio label after toggle:', audioText);

  const desktopMuted = path.join(brainDir, 't012_hud_desktop_muted.png');
  await desktopPage.screenshot({ path: desktopMuted });
  console.log('Saved desktop muted screenshot to', desktopMuted);
  await desktopPage.close();

  // 2. Mobile Clean Lane Visibility Verification (390x844 iPhone 14 Pro safe area)
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  await mobilePage.goto('http://localhost:4173/');
  await mobilePage.waitForTimeout(1000);

  const mobileReady = path.join(brainDir, 't012_hud_mobile_ready.png');
  await mobilePage.screenshot({ path: mobileReady });
  console.log('Saved mobile ready screenshot (unobstructed lanes) to', mobileReady);

  // Start mobile run & verify in-game lane clearance
  await mobilePage.click('#ready-banner');
  await mobilePage.waitForTimeout(2000); // 2s sprint

  const mobileRunning = path.join(brainDir, 't012_hud_mobile_running.png');
  await mobilePage.screenshot({ path: mobileRunning });
  console.log('Saved mobile running screenshot to', mobileRunning);

  await browser.close();
  console.log('T012 verification completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
