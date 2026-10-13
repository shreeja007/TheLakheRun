const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching browser to verify T020 In-Game Procession Spectacle...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    console.log('Loaded game page.');

    // Wait 2 seconds for assets and WebGL initialization
    await page.waitForTimeout(2000);

    const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\31692e84-71bb-497e-aca3-158d1de4b3f6';
    await page.screenshot({ path: path.join(artifactDir, 'rath_ingame_01_ready.png') });
    console.log('Captured rath_ingame_01_ready.png');

    // Click canvas or press Space to start run
    await page.keyboard.press('Space');
    console.log('Pressed Space to start run.');

    // Wait 1.5 seconds running
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactDir, 'rath_ingame_02_running_kumari.png') });
    console.log('Captured rath_ingame_02_running_kumari.png');

    // Run further alongside the procession
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(artifactDir, 'rath_ingame_03_running_procession.png') });
    console.log('Captured rath_ingame_03_running_procession.png');

    // Jump to catch higher elevation view of the towering gajurs and canopies
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(artifactDir, 'rath_ingame_04_jump_view.png') });
    console.log('Captured rath_ingame_04_jump_view.png');

    // Check game state via evaluate
    const gameState = await page.evaluate(() => {
      const g = window.__GAME__;
      return {
        hasGame: !!g,
        state: g ? g.state : 'unknown'
      };
    });
    console.log('Game state evaluation:', gameState);

    console.log('Recent console logs:');
    consoleLogs.slice(-15).forEach(l => console.log('  ', l));

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
