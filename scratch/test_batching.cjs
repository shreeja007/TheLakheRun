const { chromium } = require('playwright');

async function main() {
  console.log('Testing PlayCanvas Batching behavior in browser...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);

  const result = await page.evaluate(() => {
    const app = window.__pcApp;
    if (!app || !app.batcher) return { error: 'No app.batcher' };

    const initialDrawCalls = app.stats.drawCalls ? app.stats.drawCalls.total : app.stats.drawCallCount;

    // Create a dynamic batch group
    const group = app.batcher.addGroup('RoadGroup', true, 100);
    const groupId = group.id;

    // Find all render components under RoadRoot
    const roadRoot = app.root.findByName('RoadRoot');
    if (!roadRoot) return { error: 'No RoadRoot' };

    let taggedCount = 0;
    const assignBatch = (node) => {
      if (node.render) {
        node.render.batchGroupId = groupId;
        taggedCount++;
      }
      for (const child of node.children) {
        assignBatch(child);
      }
    };
    assignBatch(roadRoot);

    // Generate batches
    app.batcher.generate([groupId]);

    return {
      initialDrawCalls,
      taggedCount,
      batchesGenerated: app.batcher._batchList ? app.batcher._batchList.length : 0,
    };
  });

  console.log('Batch test evaluation:', result);

  // Wait a few frames and check draw calls
  await page.waitForTimeout(500);
  const afterDrawCalls = await page.evaluate(() => {
    const app = window.__pcApp;
    return app.stats.drawCalls ? app.stats.drawCalls.total : app.stats.drawCallCount;
  });
  console.log('Draw calls after batching:', afterDrawCalls);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
