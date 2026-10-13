const { chromium } = require('playwright');

async function main() {
  console.log('Testing Obstacle Batching with enable/disable...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  const testRes = await page.evaluate(() => {
    const app = window.__pcApp;
    const obsRoot = app.root.findByName('ObstaclesRoot');
    if (!obsRoot || !app.batcher) return { error: 'Missing components' };

    const obsGroup = app.batcher.addGroup('ObsGroup', true, 100);
    const assignBatch = (node) => {
      if (node.render) node.render.batchGroupId = obsGroup.id;
      for (const child of node.children) assignBatch(child);
    };
    assignBatch(obsRoot);
    app.batcher.generate([obsGroup.id]);

    const callsBefore = app.stats.drawCalls ? app.stats.drawCalls.total : app.stats.drawCallCount;
    return { callsBefore, batches: app.batcher._batchList.length };
  });

  console.log('Obstacle batching evaluation:', testRes);

  // Run and check draw calls
  await page.click('#ready-banner');
  await page.waitForTimeout(2000);

  const callsDuring = await page.evaluate(() => {
    const app = window.__pcApp;
    return app.stats.drawCalls ? app.stats.drawCalls.total : app.stats.drawCallCount;
  });
  console.log('Draw calls with batched obstacles during run:', callsDuring);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
