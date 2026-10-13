const { chromium } = require('playwright');

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage();
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('Failed request:', resp.status(), resp.url());
    }
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await browser.close();
}

main().catch(console.error);
