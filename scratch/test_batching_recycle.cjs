const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('Testing PlayCanvas Dynamic Batching with Tile Recycling...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  // Apply batching
  const batchInfo = await page.evaluate(() => {
    const app = window.__pcApp;
    const group = app.batcher.addGroup('RoadGroup', true, 100);
    const groupId = group.id;

    const roadRoot = app.root.findByName('RoadRoot');
    const assignBatch = (node) => {
      if (node.render) {
        node.render.batchGroupId = groupId;
      }
      for (const child of node.children) {
        assignBatch(child);
      }
    };
    assignBatch(roadRoot);
    app.batcher.generate([groupId]);

    return {
      groupId,
      drawCallsBefore: app.stats.drawCalls ? app.stats.drawCalls.total : app.stats.drawCallCount
    };
  });
  console.log('Batch info:', batchInfo);

  // Start run
  await page.click('#ready-banner');

  // Let runner run for 4 seconds so tiles recycle multiple times
  await page.waitForTimeout(4000);

  const drawCallsDuringRun = await page.evaluate(() => {
    const app = window.__pcApp;
    return app.stats.drawCalls ? app.stats.drawCalls.total : app.stats.drawCallCount;
  });
  console.log('Draw calls during active run with recycling:', drawCallsDuringRun);

  const screenshotPath = path.join('C:\\Users\\ShreejaManandhar\\.gemini\\antigravity-ide\\brain\\4cfad6fc-541f-4260-b9df-155d3435ecca', 'batching_run_test.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
