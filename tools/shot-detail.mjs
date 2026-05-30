// 상세(Detail) 페이지 캡처 — 리스트 첫 카드 클릭으로 /product/:id 진입
// - detail-full.png: 전체 페이지(fullPage)
// - detail-top.png: 상단 뷰포트(히어로~매크로)
import { chromium, devices } from 'playwright';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();

// 리스트 진입 후 첫 제품 카드 클릭
await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1200);

// 리스트 카드는 onClick div (.m-list-cards 직계 div). 첫 카드 클릭
const card = page.locator('.m-list-cards > div').first();
await card.waitFor({ state: 'visible', timeout: 15000 });
await card.scrollIntoViewIfNeeded();
await card.click();
await page.waitForURL('**/product/**', { timeout: 10000 });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll('vite-error-overlay').forEach((el) => el.remove()));

await page.screenshot({ path: path.join(OUT_DIR, 'detail-top.png') });
console.log('OK detail-top', page.url());

await page.screenshot({ path: path.join(OUT_DIR, 'detail-full.png'), fullPage: true });
console.log('OK detail-full');

await browser.close();
