const { chromium } = require('/Users/yoshitake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');

const BASE_URL = process.env.TOKYO_ARCADE_URL || 'http://127.0.0.1:3011/redesign?theme=tokyo-arcade-vault';
const OUTPUT_DIR = path.resolve(__dirname, '../reference/theme-concepts');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function capture() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  const consoleErrors = [];
  const failedResponses = [];

  try {
    const mobile = await browser.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 1 });
    mobile.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    mobile.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });
    await mobile.goto(BASE_URL, { waitUntil: 'networkidle' });
    await mobile.locator('.phone').screenshot({ path: path.join(OUTPUT_DIR, 'tokyo-arcade-vault-440x956.png') });

    const mobileMetrics = await mobile.locator('.phone').evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      theme: document.documentElement.dataset.theme,
      cta: element.querySelector('.cta')?.textContent?.trim(),
      points: element.querySelector('.hero-meta .points')?.textContent?.trim(),
      displayFont: getComputedStyle(element.querySelector('.pack-title-panel b')).fontFamily,
      chamberBackground: getComputedStyle(element.querySelector('.hero-pack-zone')).backgroundImage,
    }));

    const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    desktop.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await desktop.goto(BASE_URL, { waitUntil: 'networkidle' });
    await desktop.screenshot({ path: path.join(OUTPUT_DIR, 'tokyo-arcade-vault-1280x900.png'), fullPage: false });

    const fullMobile = await browser.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 1 });
    await fullMobile.goto(BASE_URL, { waitUntil: 'networkidle' });
    await fullMobile.locator('.phone').evaluate((element) => {
      element.style.height = `${element.scrollHeight}px`;
      element.style.overflow = 'visible';
    });
    await fullMobile.locator('.phone').screenshot({ path: path.join(OUTPUT_DIR, 'tokyo-arcade-vault-full.png') });

    const defaultTheme = await browser.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 1 });
    await defaultTheme.goto(BASE_URL.replace('?theme=tokyo-arcade-vault', ''), { waitUntil: 'networkidle' });
    const defaultMetrics = await defaultTheme.evaluate(() => ({
      theme: document.documentElement.dataset.theme || null,
      themeOnlyDisplay: getComputedStyle(document.querySelector('.theme-only')).display,
      displayFont: getComputedStyle(document.querySelector('.hero-title')).fontFamily,
    }));

    console.log(JSON.stringify({ mobile: mobileMetrics, defaultTheme: defaultMetrics, consoleErrors, failedResponses }, null, 2));
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
