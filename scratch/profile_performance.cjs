const { chromium } = require('playwright');

async function main() {
  console.log('--- PlayCanvas Performance Profiler ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  // Benchmark profile on simulated mobile and desktop
  const profiles = [
    {
      name: 'Desktop (1200x800, 1x DPR)',
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 1,
      isMobile: false,
    },
    {
      name: 'Midrange Android (412x915, 2.2x DPR)',
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.2,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    },
    {
      name: 'iPhone 14 Pro (390x844, 3.0x DPR)',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3.0,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    }
  ];

  for (const p of profiles) {
    console.log(`\n========================================`);
    console.log(`Running profile: ${p.name}`);
    const context = await browser.newContext({
      viewport: p.viewport,
      deviceScaleFactor: p.deviceScaleFactor,
      isMobile: p.isMobile,
      userAgent: p.userAgent,
    });
    const page = await context.newPage();

    // Track network metrics
    let totalBytesTransferred = 0;
    let requestCount = 0;
    page.on('response', async (res) => {
      try {
        const buffer = await res.body();
        totalBytesTransferred += buffer.length;
        requestCount++;
      } catch (err) {}
    });

    const startNav = Date.now();
    await page.goto('http://localhost:4173/');
    await page.waitForTimeout(1000);
    const navTimeMs = Date.now() - startNav;

    // Start running
    await page.click('#ready-banner');

    // Run for 5 seconds of active gameplay and collect sample stats every 500ms
    const samples = [];
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => {
        const app = window.__pcApp;
        const canvas = document.getElementById('application-canvas');
        const mem = window.performance && window.performance.memory ? {
          usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
          totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        } : null;

        const stats = app ? {
          drawCalls: app.stats ? (app.stats.drawCalls ? app.stats.drawCalls.total : (app.stats.drawCallCount || 0)) : 0,
          triangles: app.stats ? (app.stats.drawCalls ? app.stats.drawCalls.triangles : (app.stats.primitiveCount || 0)) : 0,
          fps: app.stats ? app.stats.fps : 0,
          ms: app.stats ? (app.stats.frame ? app.stats.frame.ms : 0) : 0,
          vramTotalMb: app.stats && app.stats.vramTotalBytes ? Math.round(app.stats.vramTotalBytes / 1024 / 1024 * 100) / 100 : 0,
        } : null;

        return {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          cssWidth: canvas.clientWidth,
          cssHeight: canvas.clientHeight,
          dpr: window.devicePixelRatio,
          mem,
          stats,
        };
      });
      samples.push(metrics);
    }

    // Inspect the sample metrics
    const lastSample = samples[samples.length - 1];
    console.log(`Canvas render resolution: ${lastSample.canvasWidth} x ${lastSample.canvasHeight} (CSS: ${lastSample.cssWidth} x ${lastSample.cssHeight}, DPR: ${lastSample.dpr})`);
    console.log(`Initial Load Time: ${navTimeMs}ms, Requests: ${requestCount}, Transferred: ${(totalBytesTransferred / 1024).toFixed(1)} KB`);
    if (lastSample.stats) {
      console.log(`Draw Calls: ${lastSample.stats.drawCalls}, Triangles: ${lastSample.stats.triangles}`);
      console.log(`PlayCanvas Engine Stats:`, lastSample.stats);
    }
    if (lastSample.mem) {
      console.log(`JS Heap: Used ${lastSample.mem.usedJSHeapSize} MB / Total ${lastSample.mem.totalJSHeapSize} MB`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\n--- Profiling Complete ---');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
