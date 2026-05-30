const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:5174/list', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const card = page.locator('.m-list-cards > div').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(3000);
    console.log('URL: ' + page.url());
    await page.screenshot({ path: 'C:/Users/tpgus/Desktop/low_sugar_skeleton/mobile-detail-before.png', fullPage: true });
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await ctx2.newPage();
    await page2.goto(page.url(), { waitUntil: 'networkidle' });
    await page2.waitForTimeout(2000);
    await page2.screenshot({ path: 'C:/Users/tpgus/Desktop/low_sugar_skeleton/desktop-detail-before.png', fullPage: true });
  }
  await browser.close();
})();
