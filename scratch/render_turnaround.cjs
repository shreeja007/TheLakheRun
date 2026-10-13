const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderTurnaround() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 3200, height: 2000 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const svgPath = path.resolve(__dirname, '../art-source/tuku_turnaround_v02.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Wrap in simple HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: #0B0F19; overflow: hidden; }
    svg { display: block; width: 3200px; height: 2000px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const outDir = path.resolve(__dirname, '../art-source');
  const artifactDir = 'C:/Users/ShreejaManandhar/.gemini/antigravity-ide/brain/4cfad6fc-541f-4260-b9df-155d3435ecca';

  // 1. Full 3200x2000 technical turnaround sheet
  const fullPngPath = path.join(outDir, 'tuku_turnaround_v02.png');
  const artifactFullPng = path.join(artifactDir, 'tuku_turnaround_v02.png');
  await page.screenshot({ path: fullPngPath, timeout: 10000 });
  fs.copyFileSync(fullPngPath, artifactFullPng);
  console.log('Saved full turnaround sheet:', fullPngPath);

  // 2. Focused clip of the 4 Orthographic Views (X: 50 to 2500, Y: 180 to 1800)
  const viewsPngPath = path.join(outDir, 'tuku_turnaround_4views.png');
  const artifactViewsPng = path.join(artifactDir, 'tuku_turnaround_4views.png');
  await page.screenshot({
    path: viewsPngPath,
    clip: { x: 50, y: 180, width: 2470, height: 1620 },
    timeout: 10000
  });
  fs.copyFileSync(viewsPngPath, artifactViewsPng);
  console.log('Saved 4-view orthographic clip:', viewsPngPath);

  // 3. Focused clip of the Primary Gameplay BACK View (X: 1420 to 1940, Y: 180 to 1800)
  const backPngPath = path.join(outDir, 'tuku_turnaround_back_gameplay.png');
  const artifactBackPng = path.join(artifactDir, 'tuku_turnaround_back_gameplay.png');
  await page.screenshot({
    path: backPngPath,
    clip: { x: 1420, y: 180, width: 520, height: 1620 },
    timeout: 10000
  });
  fs.copyFileSync(backPngPath, artifactBackPng);
  console.log('Saved back gameplay view clip:', backPngPath);

  // 4. Focused clip of the Mobile Silhouette Test and Palette Sidebar (X: 2520 to 3160, Y: 180 to 1800)
  const sidebarPngPath = path.join(outDir, 'tuku_turnaround_sidebar_tests.png');
  const artifactSidebarPng = path.join(artifactDir, 'tuku_turnaround_sidebar_tests.png');
  await page.screenshot({
    path: sidebarPngPath,
    clip: { x: 2520, y: 180, width: 630, height: 1620 },
    timeout: 10000
  });
  fs.copyFileSync(sidebarPngPath, artifactSidebarPng);
  console.log('Saved sidebar test clip:', sidebarPngPath);

  await browser.close();
  console.log('All turnaround renders completed successfully.');
}

renderTurnaround().catch(err => {
  console.error('Error rendering turnaround:', err);
  process.exit(1);
});
