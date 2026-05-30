// 비교(Compare) 페이지 캡처 — 리스트에서 제품 3개 담은 뒤 /compare 진입
import { chromium, devices } from 'playwright';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));

await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1000);

// 카드 썸네일 우하단 + 버튼(.d-foodcard-compare) 3개 담기
const addBtns = page.locator('.d-foodcard-compare');
const n = Math.min(3, await addBtns.count());
for (let i = 0; i < n; i++) {
  await addBtns.nth(i).click();
  await page.waitForTimeout(150);
}
console.log('added', n, 'items to compare');

await page.goto(`${BASE}/compare`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelectorAll('vite-error-overlay').forEach((el) => el.remove()));

await page.screenshot({ path: path.join(OUT_DIR, 'compare-top.png') });
await page.screenshot({ path: path.join(OUT_DIR, 'compare-full.png'), fullPage: true });
console.log('OK compare; url=', page.url(), 'errors=', errs.length ? errs.join(' | ') : 'none');

await browser.close();
