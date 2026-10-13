const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderLakheyConcept() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 3200, height: 2000 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const svgPath = path.resolve(__dirname, '../art-source/lakhey_concept_v01.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

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

  const fullPngPath = path.join(outDir, 'lakhey_concept_v01.png');
  const artifactFullPng = path.join(artifactDir, 'lakhey_concept_v01.png');
  await page.screenshot({ path: fullPngPath, timeout: 10000 });
  fs.copyFileSync(fullPngPath, artifactFullPng);
  console.log('Saved full Lakhey concept sheet:', fullPngPath);

  // Scaled Scale-Comparison Clip
  const scaleClipPath = path.join(outDir, 'lakhey_tuku_scale_comparison.png');
  const artifactScaleClip = path.join(artifactDir, 'lakhey_tuku_scale_comparison.png');
  await page.screenshot({
    path: scaleClipPath,
    clip: { x: 100, y: 190, width: 600, height: 1600 },
    timeout: 10000
  });
  fs.copyFileSync(scaleClipPath, artifactScaleClip);
  console.log('Saved scale comparison clip:', scaleClipPath);

  await browser.close();
  console.log('Lakhey concept renders completed.');
}

renderLakheyConcept().catch(err => {
  console.error('Error during Lakhey concept render:', err);
  process.exit(1);
});
