// 영양성분 '더보기' 펼침 동작 확인
import { chromium, devices } from 'playwright';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();

await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1000);
await page.locator('.m-list-cards > div').first().click();
await page.waitForURL('**/product/**', { timeout: 10000 });
await page.waitForTimeout(1200);

const more = page.locator('.m-detail-nutri-more');
await more.scrollIntoViewIfNeeded();
console.log('before:', (await more.innerText()).replace(/\s+/g, ' ').trim());
await more.click();
await page.waitForTimeout(400);
await more.scrollIntoViewIfNeeded();
console.log('after:', (await more.innerText()).replace(/\s+/g, ' ').trim());
await page.screenshot({ path: path.join(OUT_DIR, 'detail-expanded.png') });
console.log('OK detail-expanded');

await browser.close();
